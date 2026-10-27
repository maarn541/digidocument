import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  Request as RequestModel,
  Student,
  User,
  Department,
  DocumentType,
  WorkflowStage,
  RequestAttachment,
  ApprovalHistory,
  Faculty,
} from '../models/index.js';
import { authenticateJWT, AuthRequest, requireRoles } from '../middleware/auth.js';
import { processWorkflowTransition } from '../services/workflowService.js';
import { generateAcademicPDF } from '../services/documentGenerator.js';
import { createNotification, createAuditLog } from '../services/auditService.js';
import { notifyRequestSubmission } from '../services/emailService.js';

export const requestRouter = Router();

// Multer setup
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Invalid file type. Only PDF, PNG, JPG, and DOCX allowed.'));
  },
});

// Helper to serialize a request doc to plain JSON with populated fields
function serializeRequest(req: any) {
  if (!req) return null;
  const r = req.toObject ? req.toObject() : req;
  return {
    ...r,
    id: r._id?.toString(),
    studentId: r.studentId?._id?.toString() || r.studentId?.toString(),
    departmentId: r.departmentId?._id?.toString() || r.departmentId?.toString(),
    documentTypeId: r.documentTypeId?._id?.toString() || r.documentTypeId?.toString(),
    student: r.studentId ? {
      ...r.studentId,
      id: r.studentId._id?.toString(),
      departmentId: r.studentId.departmentId?._id?.toString() || r.studentId.departmentId,
      courseId: r.studentId.courseId?._id?.toString() || r.studentId.courseId,
      department: r.studentId.departmentId,
      course: r.studentId.courseId,
      user: r.studentId.userId,
      advisor: r.studentId.advisorId ? { ...r.studentId.advisorId, user: r.studentId.advisorId.userId } : null,
    } : undefined,
    documentType: r.documentTypeId,
    department: r.departmentId,
  };
}

// GET /api/requests
requestRouter.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { status, documentTypeId, search, departmentId } = req.query;

    const where: any = {};

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (documentTypeId && typeof documentTypeId === 'string' && documentTypeId !== 'ALL') {
      // Find DocumentType by id or code
      const dt = await DocumentType.findOne({ $or: [{ _id: documentTypeId }, { code: documentTypeId }] });
      if (dt) where.documentTypeId = dt._id;
    }

    if (user.role === 'STUDENT') {
      if (!user.studentProfile) {
        res.status(400).json({ error: 'Student profile not found' });
        return;
      }
      where.studentId = user.studentProfile._id || user.studentProfile.id;
    } else if (user.role === 'FACULTY') {
      if (!user.facultyProfile) {
        res.status(400).json({ error: 'Faculty profile not found' });
        return;
      }
      where.departmentId = user.facultyProfile.departmentId?._id || user.facultyProfile.departmentId;
    } else if (user.role === 'HOD') {
      const dept = await Department.findOne({ hodId: user.id });
      if (dept) where.departmentId = dept._id;
    } else if (user.role === 'OFFICE' || user.role === 'ADMIN') {
      if (departmentId && departmentId !== 'ALL') {
        where.departmentId = departmentId;
      }
    }

    const requests = await RequestModel.find(where)
      .populate({
        path: 'studentId',
        populate: [
          { path: 'userId', model: 'User', select: 'id name email' },
          { path: 'departmentId', model: 'Department' },
          { path: 'courseId', model: 'Course' },
          { path: 'advisorId', model: 'Faculty', populate: { path: 'userId', model: 'User', select: 'name email' } },
        ],
      })
      .populate('documentTypeId')
      .populate('departmentId')
      .sort({ createdAt: -1 })
      .lean();

    // Attach attachments and approvals
    const requestIds = requests.map((r: any) => r._id);
    const attachments = await RequestAttachment.find({ requestId: { $in: requestIds } }).lean();
    const approvals = await ApprovalHistory.find({ requestId: { $in: requestIds } })
      .populate('approverId', 'id name email role')
      .sort({ createdAt: 1 })
      .lean();

    const result = requests.map((r: any) => {
      const reqAttachments = attachments.filter((a: any) => a.requestId?.toString() === r._id?.toString());
      const reqApprovals = approvals.filter((a: any) => a.requestId?.toString() === r._id?.toString());
      return {
        ...serializeRequest(r),
        attachments: reqAttachments,
        approvals: reqApprovals.map((a: any) => ({ ...a, id: a._id?.toString(), approver: a.approverId })),
      };
    });

    res.json(result);
  } catch (err: any) {
    console.error('Fetch requests error', err);
    res.status(500).json({ error: 'Failed to retrieve requests' });
  }
});

// GET /api/requests/:id
requestRouter.get('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const request = await RequestModel.findById(id)
      .populate({
        path: 'studentId',
        populate: [
          { path: 'userId', model: 'User', select: 'id name email' },
          { path: 'departmentId', model: 'Department' },
          { path: 'courseId', model: 'Course' },
          { path: 'advisorId', model: 'Faculty', populate: { path: 'userId', model: 'User', select: 'name email' } },
        ],
      })
      .populate('documentTypeId')
      .populate('departmentId')
      .lean() as any;

    if (!request) {
      res.status(404).json({ error: 'Document request not found' });
      return;
    }

    const studentUser = (request.studentId as any)?.userId as any;
    if (user.role === 'STUDENT' && studentUser?._id?.toString() !== user.id) {
      res.status(403).json({ error: 'You do not have permission to view this request.' });
      return;
    }

    const attachments = await RequestAttachment.find({ requestId: request._id }).lean();
    const approvals = await ApprovalHistory.find({ requestId: request._id })
      .populate('approverId', 'id name email role')
      .sort({ createdAt: 1 })
      .lean();

    // Fetch workflow stages separately
    const workflows = await WorkflowStage.find({ documentTypeId: (request.documentTypeId as any)?._id || request.documentTypeId })
      .sort({ stageOrder: 1 })
      .lean();

    res.json({
      ...serializeRequest(request),
      attachments,
      approvals: approvals.map((a: any) => ({ ...a, id: a._id?.toString(), approver: a.approverId })),
      documentType: { ...(request.documentTypeId as any), workflows },
    });
  } catch (err: any) {
    console.error('Fetch single request error', err);
    res.status(500).json({ error: 'Failed to retrieve request details' });
  }
});

// POST /api/requests
requestRouter.post(
  '/',
  authenticateJWT,
  requireRoles(['STUDENT', 'ADMIN']),
  upload.array('attachments', 5),
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { documentTypeId, purpose, requiredDate, additionalRemarks } = req.body;

      if (!documentTypeId || !purpose) {
        res.status(400).json({ error: 'Document type and purpose are required fields.' });
        return;
      }

      let studentId = '';
      let departmentId = '';

      if (user.role === 'STUDENT') {
        if (!user.studentProfile) {
          res.status(400).json({ error: 'Student academic profile not found.' });
          return;
        }
        studentId = (user.studentProfile._id || user.studentProfile.id).toString();
        departmentId = (user.studentProfile.departmentId?._id || user.studentProfile.departmentId).toString();
      } else {
        if (!req.body.studentId) {
          res.status(400).json({ error: 'Student ID is required when created by admin.' });
          return;
        }
        const stu = await Student.findById(req.body.studentId);
        if (!stu) {
          res.status(404).json({ error: 'Student record not found.' });
          return;
        }
        studentId = stu._id?.toString();
        departmentId = stu.departmentId?.toString();
      }

      const docType = await DocumentType.findById(documentTypeId);
      if (!docType) {
        res.status(404).json({ error: 'Invalid document type selected.' });
        return;
      }

      const workflows = await WorkflowStage.find({ documentTypeId: docType._id }).sort({ stageOrder: 1 }).lean();

      const count = await RequestModel.countDocuments();
      const currentYear = new Date().getFullYear();
      const requestNumber = `REQ-${currentYear}-${String(count + 1).padStart(4, '0')}`;

      const firstStage = workflows[0];
      let initialStatus = 'SUBMITTED';
      if (firstStage) {
        if (firstStage.roleRequired === 'FACULTY') initialStatus = 'UNDER_FACULTY_REVIEW';
        else if (firstStage.roleRequired === 'HOD') initialStatus = 'UNDER_HOD_REVIEW';
        else if (firstStage.roleRequired === 'OFFICE') initialStatus = 'UNDER_OFFICE_PROCESSING';
      }

      const newRequest: any = await RequestModel.create({
        requestNumber,
        studentId,
        departmentId,
        documentTypeId,
        purpose,
        requiredDate: requiredDate ? new Date(requiredDate) : undefined,
        additionalRemarks: additionalRemarks || undefined,
        status: initialStatus,
        currentStageOrder: firstStage ? firstStage.stageOrder : 1,
      });

      // Save attachments
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        for (const file of files) {
          await RequestAttachment.create({
            requestId: newRequest._id,
            fileName: file.filename,
            fileOriginalName: file.originalname,
            filePath: `/uploads/${file.filename}`,
            fileType: file.mimetype,
            fileSize: file.size,
          });
        }
      }

      await createNotification(
        user.id,
        'Request Submitted Successfully',
        `Your request for ${docType.name} (${requestNumber}) has been submitted and is currently ${initialStatus.replace(/_/g, ' ')}.`,
        'INFO',
        `/student/requests/${newRequest._id}`
      );

      await createAuditLog(user.id, newRequest._id?.toString(), `Student ${user.name} submitted request ${requestNumber} for ${docType.name}`);

      try {
        const studentDetails = await Student.findById(studentId)
          .populate('userId', 'name email')
          .populate({ path: 'advisorId', populate: { path: 'userId', model: 'User', select: 'name email' } })
          .populate({ path: 'departmentId', populate: { path: 'hodId', model: 'User', select: 'name email' } })
          .lean() as any;

        const studentUserDetails = studentDetails?.userId as any;
        const department = studentDetails?.departmentId as any;
        const advisor = studentDetails?.advisorId as any;
        const advisorUser = advisor?.userId as any;

        let approverEmail: string | undefined;
        let approverName: string | undefined;

        if (firstStage?.roleRequired === 'FACULTY') {
          approverEmail = advisorUser?.email;
          approverName = advisorUser?.name;
          if (!approverEmail && departmentId) {
            const facultyDept = await Faculty.findOne({ departmentId }).populate('userId', 'name email').lean() as any;
            approverEmail = facultyDept?.userId?.email;
            approverName = facultyDept?.userId?.name;
          }
        } else if (firstStage?.roleRequired === 'HOD') {
          approverEmail = department?.hodId?.email;
          approverName = department?.hodId?.name;
        } else if (firstStage?.roleRequired === 'OFFICE') {
          const officeUser = await User.findOne({ role: 'OFFICE', status: 'ACTIVE' }).lean();
          approverEmail = officeUser?.email;
          approverName = officeUser?.name;
        }

        if (studentUserDetails?.email) {
          notifyRequestSubmission({
            studentEmail: studentUserDetails.email,
            studentName: studentUserDetails.name,
            studentIdNumber: studentDetails.studentIdNumber,
            requestNumber,
            documentName: docType.name,
            purpose,
            approverEmail,
            approverName,
            approverRole: firstStage ? firstStage.roleRequired : 'Reviewer',
            requestId: newRequest._id?.toString(),
          }).catch(err => console.error('Email dispatch error on request submission:', err));
        }
      } catch (emailErr) {
        console.error('Failed to trigger submission email notification:', emailErr);
      }

      res.status(201).json({ message: 'Request submitted successfully.', request: { ...newRequest.toObject(), id: newRequest._id?.toString() } });
    } catch (err: any) {
      console.error('Create request error', err);
      res.status(500).json({ error: 'Failed to create request: ' + err.message });
    }
  }
);

// POST /api/requests/:id/approve
requestRouter.post('/:id/approve', authenticateJWT, requireRoles(['FACULTY', 'HOD', 'OFFICE', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const updated = await processWorkflowTransition(id, req.user!.id, 'APPROVED', remarks);
    res.json({ message: 'Request approved successfully', request: updated });
  } catch (err: any) {
    console.error('Approval error', err);
    res.status(400).json({ error: err.message || 'Approval failed' });
  }
});

// POST /api/requests/:id/reject
requestRouter.post('/:id/reject', authenticateJWT, requireRoles(['FACULTY', 'HOD', 'OFFICE', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    if (!remarks || remarks.trim() === '') {
      res.status(400).json({ error: 'Please enter a reason for rejecting the request.' });
      return;
    }
    const updated = await processWorkflowTransition(id, req.user!.id, 'REJECTED', remarks);
    res.json({ message: 'Request rejected', request: updated });
  } catch (err: any) {
    console.error('Reject error', err);
    res.status(400).json({ error: err.message || 'Rejection failed' });
  }
});

// POST /api/requests/:id/correction
requestRouter.post('/:id/correction', authenticateJWT, requireRoles(['FACULTY', 'HOD', 'OFFICE', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    if (!remarks || remarks.trim() === '') {
      res.status(400).json({ error: 'Please enter instructions on what needs correction.' });
      return;
    }
    const updated = await processWorkflowTransition(id, req.user!.id, 'CORRECTION_REQUESTED', remarks);
    res.json({ message: 'Correction requested successfully', request: updated });
  } catch (err: any) {
    console.error('Correction request error', err);
    res.status(400).json({ error: err.message || 'Action failed' });
  }
});

// POST /api/requests/:id/resubmit
requestRouter.post('/:id/resubmit', authenticateJWT, requireRoles(['STUDENT']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { additionalRemarks, purpose } = req.body;

    const request = await RequestModel.findById(id).lean() as any;
    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    const workflows = await WorkflowStage.find({ documentTypeId: request.documentTypeId }).sort({ stageOrder: 1 }).lean();
    const firstStage = workflows[0];
    let resubmitStatus = 'UNDER_FACULTY_REVIEW';
    if (firstStage) {
      if (firstStage.roleRequired === 'FACULTY') resubmitStatus = 'UNDER_FACULTY_REVIEW';
      else if (firstStage.roleRequired === 'HOD') resubmitStatus = 'UNDER_HOD_REVIEW';
      else resubmitStatus = 'UNDER_OFFICE_PROCESSING';
    }

    const updated = await RequestModel.findByIdAndUpdate(id, {
      status: resubmitStatus,
      purpose: purpose || request.purpose,
      additionalRemarks: additionalRemarks || request.additionalRemarks,
      correctionRemarks: null,
      currentStageOrder: firstStage ? firstStage.stageOrder : 1,
    }, { new: true }).lean();

    await ApprovalHistory.create({
      requestId: request._id,
      approverId: user.id,
      stageOrder: 0,
      stageName: 'Resubmitted by Student',
      role: 'STUDENT',
      action: 'RESUBMITTED',
      remarks: additionalRemarks || 'Student updated details and resubmitted',
    });

    await createAuditLog(user.id, request._id?.toString(), `Student ${user.name} resubmitted request ${request.requestNumber}`);

    res.json({ message: 'Request resubmitted successfully', request: updated });
  } catch (err: any) {
    console.error('Resubmit error', err);
    res.status(500).json({ error: 'Failed to resubmit request' });
  }
});

// POST /api/requests/:id/generate
requestRouter.post('/:id/generate', authenticateJWT, requireRoles(['OFFICE', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const generatedDoc = await generateAcademicPDF(id, req.user!.id);
    res.json({ message: 'Document generated and verified successfully!', document: generatedDoc });
  } catch (err: any) {
    console.error('Document generation error', err);
    res.status(500).json({ error: 'Failed to generate document: ' + err.message });
  }
});
