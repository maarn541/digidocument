import {
  Request as RequestModel,
  User,
  ApprovalHistory,
  WorkflowStage,
} from '../models/index.js';
import { createNotification, createAuditLog } from './auditService.js';
import {
  notifyStageApproved,
  notifyCorrectionRequested,
  notifyRequestRejected,
} from './emailService.js';

export async function processWorkflowTransition(
  requestId: string,
  approverId: string,
  action: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUESTED',
  remarks?: string
) {
  const request = await RequestModel.findById(requestId)
    .populate({
      path: 'studentId',
      populate: [
        { path: 'userId', model: 'User' },
        { path: 'departmentId', populate: { path: 'hodId', model: 'User' } },
      ],
    })
    .populate({ path: 'documentTypeId' })
    .lean() as any;

  if (!request) throw new Error('Request not found');

  const approver = await User.findById(approverId).lean();
  if (!approver) throw new Error('Approver not found');

  // Fetch workflow stages for this document type
  const workflows = await WorkflowStage.find({ documentTypeId: request.documentTypeId._id || request.documentTypeId })
    .sort({ stageOrder: 1 })
    .lean();

  const currentStage = workflows.find((w: any) => w.stageOrder === request.currentStageOrder);
  const stageName = currentStage ? currentStage.stageName : 'Workflow Stage';

  const student = request.studentId as any;
  const studentUser = student?.userId as any;
  const department = student?.departmentId as any;
  const documentType = request.documentTypeId as any;

  // Record Approval History
  await ApprovalHistory.create({
    requestId: request._id,
    approverId: approver._id,
    stageOrder: request.currentStageOrder,
    stageName,
    role: approver.role,
    action,
    remarks: remarks || undefined,
  });

  // Handle REJECTED
  if (action === 'REJECTED') {
    let finalStatus = 'FACULTY_REJECTED';
    if (approver.role === 'HOD') finalStatus = 'HOD_REJECTED';
    else if (approver.role === 'OFFICE' || approver.role === 'ADMIN') finalStatus = 'CANCELLED';

    const updated = await RequestModel.findByIdAndUpdate(
      requestId,
      { status: finalStatus, rejectionReason: remarks || 'Request was rejected by ' + approver.role },
      { new: true }
    ).lean();

    await createNotification(
      studentUser?._id?.toString(),
      `Request ${request.requestNumber} Rejected`,
      `Your request for ${documentType?.name} was rejected by ${approver.name} (${approver.role}). Reason: ${remarks || 'No remarks'}`,
      'ERROR',
      `/student/requests/${request._id}`
    );

    if (studentUser?.email) {
      notifyRequestRejected({
        studentEmail: studentUser.email,
        studentName: studentUser.name,
        requestNumber: request.requestNumber,
        documentName: documentType?.name,
        approverRole: approver.role,
        approverName: approver.name,
        rejectionReason: remarks || 'Request was rejected by ' + approver.role,
        requestId: request._id?.toString(),
      }).catch(err => console.error('Email dispatch error on rejection:', err));
    }

    await createAuditLog(
      approverId,
      requestId,
      `${approver.role} ${approver.name} rejected request ${request.requestNumber}`
    );

    return updated;
  }

  // Handle CORRECTION_REQUESTED
  if (action === 'CORRECTION_REQUESTED') {
    const updated = await RequestModel.findByIdAndUpdate(
      requestId,
      { status: 'CORRECTION_REQUIRED', correctionRemarks: remarks || 'Please update the requested details/documents.' },
      { new: true }
    ).lean();

    await createNotification(
      studentUser?._id?.toString(),
      `Correction Required for ${request.requestNumber}`,
      `Your request for ${documentType?.name} needs correction: "${remarks}"`,
      'WARNING',
      `/student/requests/${request._id}`
    );

    if (studentUser?.email) {
      notifyCorrectionRequested({
        studentEmail: studentUser.email,
        studentName: studentUser.name,
        requestNumber: request.requestNumber,
        documentName: documentType?.name,
        approverRole: approver.role,
        approverName: approver.name,
        remarks: remarks || 'Please update the requested details/documents.',
        requestId: request._id?.toString(),
      }).catch(err => console.error('Email dispatch error on correction request:', err));
    }

    await createAuditLog(
      approverId,
      requestId,
      `${approver.role} ${approver.name} requested corrections for ${request.requestNumber}`
    );

    return updated;
  }

  // Handle APPROVED → determine next stage
  const currentStageIndex = workflows.findIndex((w: any) => w.stageOrder === request.currentStageOrder);
  const nextStage = workflows[currentStageIndex + 1];

  let nextStatus = 'READY_FOR_DOWNLOAD';
  let nextStageOrder = request.currentStageOrder;

  if (nextStage) {
    nextStageOrder = nextStage.stageOrder;
    if (nextStage.roleRequired === 'HOD') nextStatus = 'UNDER_HOD_REVIEW';
    else if (nextStage.roleRequired === 'OFFICE') nextStatus = 'UNDER_OFFICE_PROCESSING';
    else if (nextStage.roleRequired === 'FACULTY') nextStatus = 'UNDER_FACULTY_REVIEW';
    else nextStatus = 'UNDER_OFFICE_PROCESSING';
  }

  const updated = await RequestModel.findByIdAndUpdate(
    requestId,
    { status: nextStatus, currentStageOrder: nextStageOrder, correctionRemarks: null, rejectionReason: null },
    { new: true }
  ).lean();

  await createNotification(
    studentUser?._id?.toString(),
    `Request ${request.requestNumber} Progress Update`,
    `Your ${documentType?.name} request was approved by ${approver.name} (${approver.role}). Status is now: ${nextStatus.replace(/_/g, ' ')}.`,
    'SUCCESS',
    `/student/requests/${request._id}`
  );

  try {
    const { User: UserModel } = await import('../models/index.js');
    let nextApproverEmail: string | undefined;
    let nextApproverName: string | undefined;

    if (nextStage) {
      if (nextStage.roleRequired === 'HOD') {
        const hod = department?.hodId as any;
        nextApproverEmail = hod?.email;
        nextApproverName = hod?.name;
      } else if (nextStage.roleRequired === 'OFFICE') {
        const officeUser = await UserModel.findOne({ role: 'OFFICE', status: 'ACTIVE' }).lean();
        nextApproverEmail = officeUser?.email;
        nextApproverName = officeUser?.name;
      }
    }

    if (studentUser?.email) {
      notifyStageApproved({
        studentEmail: studentUser.email,
        studentName: studentUser.name,
        requestNumber: request.requestNumber,
        documentName: documentType?.name,
        approverRole: approver.role,
        approverName: approver.name,
        nextStageName: nextStage ? nextStage.stageName : 'Document Issuance',
        nextRoleRequired: nextStage ? nextStage.roleRequired : 'OFFICE',
        nextApproverEmail,
        nextApproverName,
        remarks,
        requestId: request._id?.toString(),
      }).catch(err => console.error('Email dispatch error on stage approval:', err));
    }
  } catch (emailErr) {
    console.error('Failed to trigger approval email notification:', emailErr);
  }

  await createAuditLog(
    approverId,
    requestId,
    `${approver.role} ${approver.name} approved request ${request.requestNumber} (Advanced to stage: ${nextStatus})`
  );

  return updated;
}
