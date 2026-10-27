import { Router, Request, Response } from 'express';
import { GeneratedDocument, DocumentType, WorkflowStage, Request as RequestModel } from '../models/index.js';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';
import { createAuditLog } from '../services/auditService.js';

export const documentRouter = Router();

// GET /api/documents/verify/:verificationCode - Public Verification Portal
documentRouter.get('/verify/:verificationCode', async (req: Request, res: Response) => {
  try {
    const { verificationCode } = req.params;

    const doc = await GeneratedDocument.findOne({ verificationCode })
      .populate({
        path: 'requestId',
        populate: [
          { path: 'documentTypeId', model: 'DocumentType' },
          { path: 'departmentId', model: 'Department' },
          {
            path: 'studentId',
            model: 'Student',
            populate: [
              { path: 'userId', model: 'User', select: 'name' },
              { path: 'courseId', model: 'Course' },
              { path: 'departmentId', model: 'Department' },
            ],
          },
        ],
      })
      .lean() as any;

    if (!doc) {
      res.status(404).json({
        valid: false,
        error: 'Academic document record not found. Please verify the QR code or reference ID.',
      });
      return;
    }

    const request = doc.requestId as any;
    const student = request?.studentId as any;
    const studentUser = student?.userId as any;

    res.json({
      valid: true,
      documentNumber: doc.documentNumber,
      verificationCode: doc.verificationCode,
      documentType: request?.documentTypeId?.name,
      documentCode: request?.documentTypeId?.code,
      studentName: studentUser?.name,
      studentIdNumber: student?.studentIdNumber,
      department: request?.departmentId?.name,
      course: student?.courseId?.name,
      academicBatch: student?.academicBatch,
      issuedDate: doc.generatedAt,
      issuingAuthority: 'National Institute of Advanced Technology (Office of Academic Affairs)',
      fileUrl: doc.fileUrl,
      status: 'AUTHENTIC & VERIFIED',
    });
  } catch (err: any) {
    console.error('Document verification error', err);
    res.status(500).json({ error: 'Verification service error' });
  }
});

// POST /api/documents/:id/track-download
documentRouter.post('/:id/track-download', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await GeneratedDocument.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 }, lastDownloadedAt: new Date() },
      { new: true }
    ).lean() as any;

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    await createAuditLog(
      req.user?.id || null,
      doc.requestId?.toString(),
      `User ${req.user?.name} downloaded document ${doc.documentNumber}`
    );

    res.json({ success: true, downloadCount: doc.downloadCount });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record download' });
  }
});

// GET /api/documents/types - Active document types with workflows
documentRouter.get('/types', async (req: Request, res: Response) => {
  try {
    const types = await DocumentType.find({ isActive: true }).sort({ createdAt: 1 }).lean();
    const result = await Promise.all(
      types.map(async (dt: any) => {
        const workflows = await WorkflowStage.find({ documentTypeId: dt._id }).sort({ stageOrder: 1 }).lean();
        return { ...dt, id: dt._id?.toString(), workflows };
      })
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch document types' });
  }
});
