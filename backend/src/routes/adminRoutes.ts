import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  User, Student, Faculty, Department, Course,
  DocumentType, WorkflowStage, Request as RequestModel,
  GeneratedDocument, ApprovalHistory, Notification, AuditLog,
  RequestAttachment,
} from '../models/index.js';
import { authenticateJWT, AuthRequest, requireRoles } from '../middleware/auth.js';
import { createAuditLog } from '../services/auditService.js';
import { verifySmtpConnection, sendTestNotificationEmail, sendEmail, isEmailConfigured } from '../services/emailService.js';

export const adminRouter = Router();
adminRouter.use(authenticateJWT, requireRoles(['ADMIN']));

// GET /api/admin/stats
adminRouter.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalRequests = await RequestModel.countDocuments();
    const pendingUserApprovals = await User.countDocuments({ status: 'PENDING_APPROVAL' });

    const pendingRequests = await RequestModel.countDocuments({
      status: { $in: ['SUBMITTED', 'UNDER_FACULTY_REVIEW', 'UNDER_HOD_REVIEW', 'UNDER_OFFICE_PROCESSING'] },
    });
    const completedDocuments = await RequestModel.countDocuments({
      status: { $in: ['READY_FOR_DOWNLOAD', 'COMPLETED'] },
    });
    const rejectedRequests = await RequestModel.countDocuments({
      status: { $in: ['FACULTY_REJECTED', 'HOD_REJECTED', 'CANCELLED'] },
    });

    const docTypes = await DocumentType.find().lean();
    const byDocType = await Promise.all(
      docTypes.map(async (d: any) => ({
        name: d.name,
        code: d.code,
        count: await RequestModel.countDocuments({ documentTypeId: d._id }),
      }))
    );

    const depts = await Department.find().lean();
    const byDepartment = await Promise.all(
      depts.map(async (d: any) => ({
        name: d.name,
        code: d.code,
        requestsCount: await RequestModel.countDocuments({ departmentId: d._id }),
        studentsCount: await Student.countDocuments({ departmentId: d._id }),
        facultyCount: await Faculty.countDocuments({ departmentId: d._id }),
      }))
    );

    res.json({ 
      overview: { 
        totalStudents, 
        totalFaculty, 
        totalRequests, 
        pendingRequests, 
        completedDocuments, 
        rejectedRequests,
        pendingUserApprovals 
      }, 
      byDocType, 
      byDepartment 
    });
  } catch (err: any) {
    console.error('Admin stats error', err);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// GET /api/admin/requests - Comprehensive document & request monitor
adminRouter.get('/requests', async (req: AuthRequest, res: Response) => {
  try {
    const { status, departmentId, documentTypeId, search } = req.query;
    const filter: any = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (departmentId && departmentId !== 'ALL') {
      filter.departmentId = departmentId;
    }
    if (documentTypeId && documentTypeId !== 'ALL') {
      filter.documentTypeId = documentTypeId;
    }

    const requests = await RequestModel.find(filter)
      .populate('documentTypeId', 'name code estimatedDays requiresUpload uploadDocLabel')
      .populate('departmentId', 'name code')
      .populate({
        path: 'studentId',
        populate: [
          { path: 'userId', select: 'name email role status' },
          { path: 'courseId', select: 'name code' }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = await Promise.all(
      requests.map(async (r: any) => {
        const generatedDoc = await GeneratedDocument.findOne({ requestId: r._id }).lean();
        const historyCount = await ApprovalHistory.countDocuments({ requestId: r._id });
        const attachments = await RequestAttachment.find({ requestId: r._id }).lean();

        return {
          ...r,
          id: r._id?.toString(),
          documentType: r.documentTypeId,
          department: r.departmentId,
          student: r.studentId ? {
            ...r.studentId,
            id: r.studentId._id?.toString(),
            user: r.studentId.userId,
            course: r.studentId.courseId,
          } : null,
          generatedDocument: generatedDoc ? {
            ...generatedDoc,
            id: generatedDoc._id?.toString()
          } : null,
          attachmentsCount: attachments.length,
          approvalsCount: historyCount,
        };
      })
    );

    let result = formatted;
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (item: any) =>
          item.requestNumber?.toLowerCase().includes(q) ||
          item.student?.user?.name?.toLowerCase().includes(q) ||
          item.student?.studentIdNumber?.toLowerCase().includes(q) ||
          item.documentType?.name?.toLowerCase().includes(q)
      );
    }

    res.json(result);
  } catch (err: any) {
    console.error('Admin get requests error', err);
    res.status(500).json({ error: 'Failed to fetch academic requests: ' + err.message });
  }
});

// GET /api/admin/users
adminRouter.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    const result = await Promise.all(
      users.map(async (u: any) => {
        let studentProfile = null;
        let facultyProfile = null;
        if (u.role === 'STUDENT') {
          studentProfile = await Student.findOne({ userId: u._id })
            .populate('departmentId', 'name code')
            .populate('courseId', 'name code')
            .lean();
          if (studentProfile) {
            (studentProfile as any).id = (studentProfile as any)._id?.toString();
            (studentProfile as any).department = (studentProfile as any).departmentId;
            (studentProfile as any).course = (studentProfile as any).courseId;
          }
        } else if (u.role === 'FACULTY' || u.role === 'HOD') {
          facultyProfile = await Faculty.findOne({ userId: u._id })
            .populate('departmentId', 'name code')
            .lean();
          if (facultyProfile) {
            (facultyProfile as any).id = (facultyProfile as any)._id?.toString();
            (facultyProfile as any).department = (facultyProfile as any).departmentId;
          }
        }
        return { ...u, id: u._id?.toString(), studentProfile, facultyProfile };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/admin/users
adminRouter.post('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, departmentId, studentIdNumber, courseId, designation } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'Name, email, password, and role are required' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(400).json({ error: 'Email is already in use' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase().trim(), passwordHash, role, status: 'ACTIVE' });
    const userId = (user._id as any).toString();

    if (role === 'STUDENT' && departmentId && courseId && studentIdNumber) {
      await Student.create({
        userId,
        studentIdNumber,
        departmentId,
        courseId,
        academicBatch: `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
        currentYear: 1,
        currentSemester: 1,
      });
    } else if (role === 'FACULTY' && departmentId) {
      const fCount = await Faculty.countDocuments();
      await Faculty.create({
        userId,
        facultyCode: `FAC-${departmentId.substring(0, 3).toUpperCase()}-${fCount + 1}`,
        departmentId,
        designation: designation || 'Assistant Professor',
      });
    }

    await createAuditLog(req.user!.id, null, `Admin created user ${user.email} with role ${user.role}`);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    sendEmail({
      to: user.email,
      subject: `🎓 Your CertiFlow Account Credentials (${user.role})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 24px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">Welcome to CertiFlow Academic System</h2>
          </div>
          <div style="padding: 24px; color: #334155;">
            <p>Hello <strong>${name}</strong>,</p>
            <p>An institutional account has been provisioned for you by the Administrator.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #64748b;">Login Email:</td><td style="padding: 8px 12px;">${user.email}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #64748b;">Password:</td><td style="padding: 8px 12px;">${password}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #64748b;">Role:</td><td style="padding: 8px 12px;">${user.role}</td></tr>
            </table>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${clientUrl}/login" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 6px; font-weight: 600;">Log In &rarr;</a>
            </div>
          </div>
        </div>
      `,
      text: `Your CertiFlow account: email=${user.email}, password=${password}, role=${user.role}. Login at ${clientUrl}/login`,
    }).catch(err => console.error('Failed to send admin welcome email:', err));

    res.status(201).json({ message: 'User created successfully', user: { ...user.toObject(), id: userId } });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create user: ' + err.message });
  }
});

// PATCH /api/admin/users/:id/status
adminRouter.patch('/users/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }

    const previousUser = await User.findById(id);
    if (!previousUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updated = await User.findByIdAndUpdate(id, { status }, { new: true }).lean();
    await createAuditLog(req.user!.id, null, `Admin updated user status for ${previousUser.email} from ${previousUser.status} to ${status}`);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    if (status === 'ACTIVE' && previousUser.status === 'PENDING_APPROVAL') {
      sendEmail({
        to: previousUser.email,
        subject: `🎉 Account Approved! You can now sign in to CertiFlow`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; color: #ffffff;">
              <h2 style="margin: 0; font-size: 20px;">Account Approved by Administrator</h2>
              <p style="margin: 4px 0 0 0; color: #d1fae5; font-size: 13px;">CertiFlow Academic Portal</p>
            </div>
            <div style="padding: 24px; color: #334155;">
              <p>Hello <strong>${previousUser.name}</strong>,</p>
              <p>Great news! Your account registration has been reviewed and <strong style="color: #059669;">APPROVED</strong> by the university administrator.</p>
              <p>You can now sign in with your email (<strong>${previousUser.email}</strong>) and password on your portal.</p>
              <div style="text-align: center; margin-top: 24px;">
                <a href="${clientUrl}/login" style="background: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Sign In Now &rarr;
                </a>
              </div>
            </div>
          </div>
        `,
        text: `Hello ${previousUser.name}, your account registration on CertiFlow has been APPROVED! You can now log in at ${clientUrl}/login`,
      }).catch(err => console.error('Failed to dispatch account approval email:', err));
    } else if (status === 'REJECTED') {
      sendEmail({
        to: previousUser.email,
        subject: `Account Registration Update - CertiFlow`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
            <div style="background: #dc2626; padding: 24px; color: #ffffff;">
              <h2 style="margin: 0; font-size: 20px;">Registration Request Update</h2>
            </div>
            <div style="padding: 24px; color: #334155;">
              <p>Hello <strong>${previousUser.name}</strong>,</p>
              <p>Your account registration request for the <strong>${previousUser.role}</strong> portal was not approved by the administrator.</p>
              <p>If you believe this was in error, please reach out directly to the college administration or registrar office.</p>
            </div>
          </div>
        `,
        text: `Hello ${previousUser.name}, your account registration for CertiFlow was not approved. Please contact administration.`,
      }).catch(err => console.error('Failed to dispatch account rejection email:', err));
    }

    res.json({ message: 'User status updated successfully', user: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user status: ' + err.message });
  }
});

// GET /api/admin/departments
adminRouter.get('/departments', async (req: AuthRequest, res: Response) => {
  try {
    const depts = await Department.find()
      .populate('hodId', 'id name email')
      .lean();

    const result = await Promise.all(
      depts.map(async (d: any) => ({
        ...d,
        id: d._id?.toString(),
        hod: d.hodId,
        courses: await Course.find({ departmentId: d._id }).lean(),
        studentsCount: await Student.countDocuments({ departmentId: d._id }),
        facultyCount: await Faculty.countDocuments({ departmentId: d._id }),
      }))
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// POST /api/admin/departments
adminRouter.post('/departments', async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, hodId } = req.body;
    const dept = await Department.create({ name, code: code.toUpperCase(), description, hodId: hodId || null });
    res.status(201).json({ ...dept.toObject(), id: dept._id?.toString() });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/admin/document-types
adminRouter.get('/document-types', async (req: AuthRequest, res: Response) => {
  try {
    const docTypes = await DocumentType.find().sort({ createdAt: 1 }).lean();
    const result = await Promise.all(
      docTypes.map(async (dt: any) => {
        const workflows = await WorkflowStage.find({ documentTypeId: dt._id }).sort({ stageOrder: 1 }).lean();
        const count = await RequestModel.countDocuments({ documentTypeId: dt._id });
        return { ...dt, id: dt._id?.toString(), workflows, _count: { requests: count } };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch document types' });
  }
});

// POST /api/admin/document-types
adminRouter.post('/document-types', async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, estimatedDays, icon, requiresUpload, uploadDocLabel, workflows } = req.body;

    const docType = await DocumentType.create({
      name,
      code: code.toUpperCase().trim(),
      description,
      estimatedDays: parseInt(estimatedDays) || 3,
      icon: icon || 'FileText',
      requiresUpload: Boolean(requiresUpload),
      uploadDocLabel,
    });

    const createdWorkflows = [];
    for (let i = 0; i < (workflows || []).length; i++) {
      const w = workflows[i];
      const stage = await WorkflowStage.create({
        documentTypeId: docType._id,
        stageOrder: i + 1,
        stageName: w.stageName,
        roleRequired: w.roleRequired,
        description: w.description,
      });
      createdWorkflows.push(stage.toObject());
    }

    res.status(201).json({ ...docType.toObject(), id: docType._id?.toString(), workflows: createdWorkflows });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/admin/document-types/:id/workflows
adminRouter.put('/document-types/:id/workflows', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { workflows } = req.body;

    await WorkflowStage.deleteMany({ documentTypeId: id });

    for (let i = 0; i < workflows.length; i++) {
      const w = workflows[i];
      await WorkflowStage.create({
        documentTypeId: id,
        stageOrder: i + 1,
        stageName: w.stageName,
        roleRequired: w.roleRequired,
        description: w.description,
      });
    }

    const updated = await DocumentType.findById(id).lean();
    const updatedWorkflows = await WorkflowStage.find({ documentTypeId: id }).sort({ stageOrder: 1 }).lean();

    await createAuditLog(req.user!.id, null, `Admin updated workflow for document type ${(updated as any)?.name}`);

    res.json({ message: 'Workflow stages updated successfully', docType: { ...updated, workflows: updatedWorkflows } });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update workflow: ' + err.message });
  }
});

// PUT /api/admin/users/:id/email
adminRouter.put('/users/:id/email', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Valid email address is required' });
      return;
    }
    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail, _id: { $ne: id } });
    if (existing) {
      res.status(400).json({ error: 'This email is already registered to another user' });
      return;
    }
    const user = await User.findByIdAndUpdate(id, { email: cleanEmail }, { new: true }).lean();
    await createAuditLog(req.user!.id, null, `Admin updated email for user to ${cleanEmail}`);
    res.json({ message: `Email updated to ${cleanEmail}`, user });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update email: ' + err.message });
  }
});

// GET /api/admin/email-status
adminRouter.get('/email-status', async (req: AuthRequest, res: Response) => {
  try {
    const configured = isEmailConfigured();
    res.json({
      configured,
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: process.env.SMTP_PORT || '465',
      smtpUser: configured ? (process.env.SMTP_USER || '') : '(Not configured in backend/.env)',
      mode: configured ? 'LIVE_GMAIL_DISPATCH' : 'SIMULATION_LOG_MODE',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to check email status: ' + err.message });
  }
});

// POST /api/admin/email-verify
adminRouter.post('/email-verify', async (req: AuthRequest, res: Response) => {
  try {
    const result = await verifySmtpConnection();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ configured: false, success: false, message: err.message });
  }
});

// POST /api/admin/test-email
adminRouter.post('/test-email', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Recipient email is required' });
      return;
    }
    const result = await sendTestNotificationEmail(email.toLowerCase().trim());
    if (result.success) {
      res.json({ message: result.simulated ? `Simulated test email sent to ${email}` : `Live test email dispatched to ${email}!`, ...result });
    } else {
      res.status(500).json({ error: result.error || 'Failed to dispatch test email' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send test email: ' + err.message });
  }
});

// GET /api/admin/audit-logs
adminRouter.get('/audit-logs', async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'id name email role')
      .populate('requestId', 'id requestNumber')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(logs.map((l: any) => ({ ...l, id: l._id?.toString(), user: l.userId, request: l.requestId })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// DELETE /api/admin/users/:id
adminRouter.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (id === req.user!.id) {
      res.status(400).json({ error: 'Cannot delete the currently logged-in administrator account.' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found in system directory' });
      return;
    }

    const deletedEmail = user.email;

    // Delete student records
    const studentProfile = await Student.findOne({ userId: id });
    if (studentProfile) {
      const studentRequests = await RequestModel.find({ studentId: studentProfile._id }, { _id: 1 });
      const reqIds = studentRequests.map((r: any) => r._id);

      if (reqIds.length > 0) {
        await GeneratedDocument.deleteMany({ requestId: { $in: reqIds } });
        await ApprovalHistory.deleteMany({ requestId: { $in: reqIds } });
        await RequestAttachment.deleteMany({ requestId: { $in: reqIds } });
        await AuditLog.updateMany({ requestId: { $in: reqIds } }, { requestId: null });
        await RequestModel.deleteMany({ _id: { $in: reqIds } });
      }
      await Student.deleteOne({ _id: studentProfile._id });
    }

    // Delete faculty profile
    const facultyProfile = await Faculty.findOne({ userId: id });
    if (facultyProfile) {
      await Student.updateMany({ advisorId: facultyProfile._id }, { advisorId: null });
      await Faculty.deleteOne({ _id: facultyProfile._id });
    }

    // Unlink departments if HOD
    await Department.updateMany({ hodId: id }, { hodId: null });

    // Clean up user-tied records
    await ApprovalHistory.updateMany({ approverId: id }, { approverId: id }); // keep for history
    await Notification.deleteMany({ userId: id });
    await AuditLog.updateMany({ userId: id }, { userId: null });

    await User.deleteOne({ _id: id });

    await createAuditLog(req.user!.id, null, `Admin deleted user ${user.name} (${deletedEmail})`);

    res.json({
      message: `Account and registered email ${deletedEmail} have been permanently deleted from MongoDB.`,
      deletedEmail,
    });
  } catch (err: any) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user: ' + err.message });
  }
});

// DELETE /api/admin/users-by-email
adminRouter.delete('/users-by-email', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Registered email address is required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      res.status(404).json({ error: `No registered user found with email: ${cleanEmail}` });
      return;
    }

    if ((user._id as any).toString() === req.user!.id) {
      res.status(400).json({ error: 'Cannot delete the currently logged-in administrator account.' });
      return;
    }

    // Forward to delete by ID logic by making a subrequest internally
    const userId = (user._id as any).toString();
    const studentProfile = await Student.findOne({ userId });
    if (studentProfile) {
      const studentRequests = await RequestModel.find({ studentId: studentProfile._id }, { _id: 1 });
      const reqIds = studentRequests.map((r: any) => r._id);
      if (reqIds.length > 0) {
        await GeneratedDocument.deleteMany({ requestId: { $in: reqIds } });
        await ApprovalHistory.deleteMany({ requestId: { $in: reqIds } });
        await RequestAttachment.deleteMany({ requestId: { $in: reqIds } });
        await AuditLog.updateMany({ requestId: { $in: reqIds } }, { requestId: null });
        await RequestModel.deleteMany({ _id: { $in: reqIds } });
      }
      await Student.deleteOne({ _id: studentProfile._id });
    }

    const facultyProfile = await Faculty.findOne({ userId });
    if (facultyProfile) {
      await Student.updateMany({ advisorId: facultyProfile._id }, { advisorId: null });
      await Faculty.deleteOne({ _id: facultyProfile._id });
    }

    await Department.updateMany({ hodId: userId }, { hodId: null });
    await Notification.deleteMany({ userId });
    await AuditLog.updateMany({ userId }, { userId: null });
    await User.deleteOne({ _id: userId });

    await createAuditLog(req.user!.id, null, `Admin deleted registered mail ${cleanEmail}`);

    res.json({ message: `Registered mail account ${cleanEmail} has been permanently deleted.`, deletedEmail: cleanEmail });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete user by email: ' + err.message });
  }
});

// GET /api/admin/mongodb-status (replaces /firebase-status)
adminRouter.get('/mongodb-status', async (req: AuthRequest, res: Response) => {
  try {
    const { mongoose } = await import('../config/mongodb.js');
    const state = mongoose.connection.readyState;
    const stateMap: Record<number, string> = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

    const collections = ['users', 'students', 'faculty', 'departments', 'requests', 'documenttypes'];
    const counts: Record<string, number> = {};
    if (state === 1) {
      counts.users = await User.countDocuments();
      counts.students = await Student.countDocuments();
      counts.faculty = await Faculty.countDocuments();
      counts.departments = await Department.countDocuments();
      counts.requests = await RequestModel.countDocuments();
      counts.documentTypes = await DocumentType.countDocuments();
    }

    res.json({
      connected: state === 1,
      status: stateMap[state] || 'unknown',
      database: process.env.MONGO_URI ? 'MongoDB Atlas (Cloud)' : 'MongoDB Local',
      mode: state === 1 ? 'MONGODB_LIVE_CONNECTED' : 'DISCONNECTED',
      counts,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to check MongoDB status: ' + err.message });
  }
});

// Keep backward compat alias
adminRouter.get('/firebase-status', async (req: AuthRequest, res: Response) => {
  res.redirect(307, '/api/admin/mongodb-status');
});

adminRouter.post('/firebase-sync', async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Firebase has been removed. All data is now stored in MongoDB.' });
});
