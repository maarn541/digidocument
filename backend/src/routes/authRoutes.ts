import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Student, Faculty, Department, Course } from '../models/index.js';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';
import { createAuditLog } from '../services/auditService.js';
import { sendEmail } from '../services/emailService.js';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_academic_document_system_2026';

// ─── Helper: Fetch full user with profiles ────────────────────────────────────
async function getFullUser(userId: string) {
  const user = await User.findById(userId).lean();
  if (!user) return null;

  let studentProfile: any = null;
  let facultyProfile: any = null;

  if (user.role === 'STUDENT') {
    studentProfile = await Student.findOne({ userId })
      .populate('departmentId', 'name code')
      .populate('courseId', 'name code')
      .populate({ path: 'advisorId', populate: { path: 'userId', model: 'User', select: 'name email' } })
      .lean();
    if (studentProfile) {
      studentProfile.id = studentProfile._id?.toString();
      studentProfile.department = studentProfile.departmentId;
      studentProfile.course = studentProfile.courseId;
      studentProfile.advisor = studentProfile.advisorId;
      studentProfile.departmentId = (studentProfile.departmentId as any)?._id?.toString() || studentProfile.departmentId;
      studentProfile.courseId = (studentProfile.courseId as any)?._id?.toString() || studentProfile.courseId;
    }
  } else if (user.role === 'FACULTY' || user.role === 'HOD') {
    facultyProfile = await Faculty.findOne({ userId })
      .populate('departmentId', 'name code')
      .lean();
    if (facultyProfile) {
      facultyProfile.id = facultyProfile._id?.toString();
      facultyProfile.department = facultyProfile.departmentId;
      facultyProfile.departmentId = (facultyProfile.departmentId as any)?._id?.toString() || facultyProfile.departmentId;
    }
  }

  return {
    id: (user._id as any).toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl,
    studentProfile,
    facultyProfile,
  };
}

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, expectedRole } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Please provide email/ID and password' });
      return;
    }

    // Find by email OR student ID OR faculty code
    let user: any = await User.findOne({ email: email.toLowerCase().trim() }).lean();

    if (!user) {
      const student = await Student.findOne({ studentIdNumber: email.toUpperCase().trim() }).lean();
      if (student) user = await User.findById(student.userId).lean();
    }
    if (!user) {
      const faculty = await Faculty.findOne({ facultyCode: email.toUpperCase().trim() }).lean();
      if (faculty) user = await User.findById(faculty.userId).lean();
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials or user not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials or incorrect password' });
      return;
    }

    if (user.status === 'PENDING_APPROVAL') {
      res.status(403).json({
        error: 'Your account registration is awaiting Admin approval. Please wait for an administrator to approve your account before signing in.',
        pendingApproval: true,
      });
      return;
    }

    if (user.status === 'REJECTED') {
      res.status(403).json({
        error: 'Your registration request was rejected by the Administrator. Please contact academic administration for assistance.',
      });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({ error: 'Account is deactivated or suspended. Please contact Administrator.' });
      return;
    }

    if (expectedRole && user.role !== expectedRole) {
      const portalNames: Record<string, string> = {
        STUDENT: 'Student Portal',
        FACULTY: 'Faculty Advisor Portal',
        HOD: 'Head of Department (HOD) Portal',
        OFFICE: 'Academic Office Portal',
        ADMIN: 'Administrator Portal',
      };
      res.status(403).json({
        error: `Portal Role Mismatch: You are attempting to log in to the ${portalNames[expectedRole] || expectedRole + ' Portal'} using a ${user.role} account. Please use the ${portalNames[user.role] || user.role + ' Portal'} login.`,
      });
      return;
    }

    const token = jwt.sign(
      { id: (user._id as any).toString(), email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await createAuditLog((user._id as any).toString(), null, `User ${user.email} logged in (${user.role})`);

    const fullUser = await getFullUser((user._id as any).toString());
    res.json({ token, user: fullUser });
  } catch (err: any) {
    console.error('Login error', err);
    res.status(500).json({ error: 'An error occurred during authentication' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// GET /api/auth/academic-meta
authRouter.get('/academic-meta', async (req: Request, res: Response) => {
  try {
    const departments = await Department.find().lean();
    const courses = await Course.find().lean();
    const faculty = await Faculty.find()
      .populate('userId', 'name email')
      .lean();

    const result = departments.map((dept: any) => ({
      ...dept,
      id: dept._id?.toString(),
      courses: courses
        .filter((c: any) => c.departmentId?.toString() === dept._id?.toString())
        .map((c: any) => ({ ...c, id: c._id?.toString() })),
      faculty: faculty
        .filter((f: any) => f.departmentId?.toString() === dept._id?.toString())
        .map((f: any) => ({
          ...f,
          id: f._id?.toString(),
          user: f.userId,
        })),
    }));

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch academic metadata' });
  }
});

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      name, email, password, role,
      departmentId, courseId, studentIdNumber,
      currentYear, currentSemester, academicBatch,
      phone, advisorId, designation,
    } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      res.status(400).json({ error: 'An account with this email address is already registered in the system.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const validRoles = ['STUDENT', 'FACULTY', 'HOD', 'OFFICE', 'ADMIN'];
    const assignedRole = validRoles.includes(role) ? role : 'STUDENT';

    const user = await User.create({ 
      name: name.trim(), 
      email: cleanEmail, 
      passwordHash, 
      role: assignedRole, 
      status: 'PENDING_APPROVAL' 
    });
    const userId = (user._id as any).toString();

    if (assignedRole === 'STUDENT') {
      const generatedIdNumber = studentIdNumber
        ? studentIdNumber.toUpperCase().trim()
        : `STU${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

      const existingId = await Student.findOne({ studentIdNumber: generatedIdNumber });
      const finalIdNumber = existingId ? `${generatedIdNumber}-${Math.floor(10 + Math.random() * 89)}` : generatedIdNumber;

      let validDeptId = departmentId;
      let validCourseId = courseId;

      if (!validDeptId) {
        const defaultDept = await Department.findOne();
        validDeptId = defaultDept?._id?.toString();
      }
      if (!validCourseId && validDeptId) {
        const defaultCourse = await Course.findOne({ departmentId: validDeptId });
        validCourseId = defaultCourse?._id?.toString();
      }

      await Student.create({
        userId,
        studentIdNumber: finalIdNumber,
        departmentId: validDeptId,
        courseId: validCourseId,
        currentYear: parseInt(currentYear) || 1,
        currentSemester: parseInt(currentSemester) || 1,
        academicBatch: academicBatch || `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
        phone: phone || null,
        advisorId: advisorId || null,
        cgpa: 8.5,
      });
    } else if (assignedRole === 'FACULTY' || assignedRole === 'HOD' || assignedRole === 'OFFICE' || assignedRole === 'ADMIN') {
      let validDeptId = departmentId;
      if (!validDeptId) {
        const defaultDept = await Department.findOne();
        validDeptId = defaultDept?._id?.toString();
      }
      const facultyCount = await Faculty.countDocuments();
      const prefix = assignedRole === 'HOD' ? 'HOD' : assignedRole === 'OFFICE' ? 'OFF' : assignedRole === 'ADMIN' ? 'ADM' : 'FAC';
      const code = `${prefix}-${(validDeptId || 'GEN').substring(0, 3).toUpperCase()}-${facultyCount + 101}`;
      const defaultDesignation = assignedRole === 'HOD' ? 'Head of Department' : assignedRole === 'OFFICE' ? 'Academic Officer' : assignedRole === 'ADMIN' ? 'Administrator' : 'Assistant Professor';
      
      await Faculty.create({ 
        userId, 
        facultyCode: code, 
        departmentId: validDeptId, 
        designation: designation || defaultDesignation 
      });

      // If HOD, also link as department's HOD
      if (assignedRole === 'HOD' && validDeptId) {
        await Department.findByIdAndUpdate(validDeptId, { hodId: userId });
      }
    }

    await createAuditLog(userId, null, `New user ${user.email} submitted registration for ${user.role} (Status: PENDING_APPROVAL)`);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    sendEmail({
      to: cleanEmail,
      subject: `⏳ Registration Received: Approval Pending (${assignedRole} Portal)`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 24px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">Account Registration Submitted</h2>
            <p style="margin: 4px 0 0 0; color: #bfdbfe; font-size: 13px;">CertiFlow Academic Document Workflow System</p>
          </div>
          <div style="padding: 24px; color: #334155;">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your registration request for the <strong>${assignedRole} Portal</strong> has been recorded.</p>
            <div style="padding: 14px 18px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; color: #92400e; font-size: 13px; margin: 16px 0;">
              <strong>Admin Approval Required:</strong> Your account is currently in <strong>Pending Approval</strong> status. An administrator must verify and approve your registration before you can log in to the portal.
            </div>
            <p style="font-size: 12px; color: #64748b;">You will receive another email once your registration has been approved by the Administrator.</p>
          </div>
        </div>
      `,
      text: `Hello ${name}, your account registration for CertiFlow (${assignedRole}) is pending approval by the Administrator. You will be able to log in once approved.`,
    }).catch(err => console.error('Failed to send registration pending email:', err));

    res.status(201).json({ 
      message: 'Account created successfully! Your account is currently pending Admin approval. You can log in once approved.', 
      pendingApproval: true,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
        status: 'PENDING_APPROVAL'
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// PUT /api/auth/profile
authRouter.put('/profile', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { email, name, phone } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email address is required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail, _id: { $ne: userId } });
    if (existing) {
      res.status(400).json({ error: 'This email address is already assigned to another user.' });
      return;
    }

    await User.findByIdAndUpdate(userId, { email: cleanEmail, ...(name ? { name: name.trim() } : {}) });

    if (phone) {
      await Student.findOneAndUpdate({ userId }, { phone });
    }

    await createAuditLog(userId, null, `User updated email to ${cleanEmail}`);

    const fullUser = await getFullUser(userId);
    res.json({ message: 'Profile updated successfully! Real-time notifications will now be sent to this email.', user: fullUser });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  res.json({ message: 'If an account exists with this email, password reset instructions have been dispatched.' });
});
