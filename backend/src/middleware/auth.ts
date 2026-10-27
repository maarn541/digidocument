import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Student, Faculty, Department, Course } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_academic_document_system_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
    studentProfile?: any;
    facultyProfile?: any;
  };
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access token missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };

    const user = await User.findById(decoded.id).lean();
    if (!user || user.status !== 'ACTIVE') {
      res.status(403).json({ error: 'Account inactive or not found' });
      return;
    }

    // Fetch associated profile
    let studentProfile: any = null;
    let facultyProfile: any = null;

    if (user.role === 'STUDENT') {
      studentProfile = await Student.findOne({ userId: user._id })
        .populate('departmentId', 'name code')
        .populate('courseId', 'name code')
        .populate({ path: 'advisorId', populate: { path: 'userId', model: 'User', select: 'name email' } })
        .lean();
      if (studentProfile) {
        studentProfile.department = studentProfile.departmentId;
        studentProfile.course = studentProfile.courseId;
        studentProfile.advisor = studentProfile.advisorId;
      }
    } else if (user.role === 'FACULTY' || user.role === 'HOD') {
      facultyProfile = await Faculty.findOne({ userId: user._id })
        .populate('departmentId')
        .lean();
      if (facultyProfile) {
        facultyProfile.department = facultyProfile.departmentId;
        facultyProfile.departmentId = facultyProfile.departmentId?._id?.toString() || facultyProfile.departmentId;
      }
    }

    req.user = {
      id: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      studentProfile,
      facultyProfile,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'You do not have permission to perform this action.' });
      return;
    }
    next();
  };
};
