import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── User ────────────────────────────────────────────────────────────────────
export interface IUser extends Document<any> {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'STUDENT' | 'FACULTY' | 'HOD' | 'OFFICE' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL' | 'REJECTED';
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['STUDENT', 'FACULTY', 'HOD', 'OFFICE', 'ADMIN'], required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL', 'REJECTED'], default: 'PENDING_APPROVAL' },
    avatarUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// ─── Department ──────────────────────────────────────────────────────────────
export interface IDepartment extends Document<any> {
  _id: string;
  name: string;
  code: string;
  description?: string;
  hodId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String },
    hodId: { type: Schema.Types.ObjectId as any, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

// ─── Course ───────────────────────────────────────────────────────────────────
export interface ICourse extends Document<any> {
  _id: string;
  departmentId: string;
  name: string;
  code: string;
  durationYears: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    departmentId: { type: Schema.Types.ObjectId as any, ref: 'Department', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    durationYears: { type: Number, default: 4 },
  },
  { timestamps: true }
);

export const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

// ─── Faculty ──────────────────────────────────────────────────────────────────
export interface IFaculty extends Document<any> {
  _id: string;
  userId: string;
  facultyCode: string;
  departmentId: string;
  designation: string;
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema = new Schema<IFaculty>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, unique: true },
    facultyCode: { type: String, required: true, unique: true },
    departmentId: { type: Schema.Types.ObjectId as any, ref: 'Department', required: true },
    designation: { type: String, default: 'Assistant Professor' },
  },
  { timestamps: true }
);

export const Faculty: Model<IFaculty> = mongoose.models.Faculty || mongoose.model<IFaculty>('Faculty', FacultySchema);

// ─── Student ──────────────────────────────────────────────────────────────────
export interface IStudent extends Document<any> {
  _id: string;
  userId: string;
  studentIdNumber: string;
  departmentId: string;
  courseId: string;
  currentYear: number;
  currentSemester: number;
  academicBatch: string;
  phone?: string;
  advisorId?: string;
  cgpa: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, unique: true },
    studentIdNumber: { type: String, required: true, unique: true },
    departmentId: { type: Schema.Types.ObjectId as any, ref: 'Department', required: true },
    courseId: { type: Schema.Types.ObjectId as any, ref: 'Course', required: true },
    currentYear: { type: Number, default: 3 },
    currentSemester: { type: Number, default: 5 },
    academicBatch: { type: String, required: true },
    phone: { type: String, default: null },
    advisorId: { type: Schema.Types.ObjectId as any, ref: 'Faculty', default: null },
    cgpa: { type: Number, default: 8.5 },
  },
  { timestamps: true }
);

export const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

// ─── DocumentType ────────────────────────────────────────────────────────────
export interface IDocumentType extends Document<any> {
  _id: string;
  code: string;
  name: string;
  description: string;
  estimatedDays: number;
  icon: string;
  requiresUpload: boolean;
  uploadDocLabel?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentTypeSchema = new Schema<IDocumentType>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    estimatedDays: { type: Number, default: 3 },
    icon: { type: String, default: 'FileText' },
    requiresUpload: { type: Boolean, default: false },
    uploadDocLabel: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DocumentType: Model<IDocumentType> =
  mongoose.models.DocumentType || mongoose.model<IDocumentType>('DocumentType', DocumentTypeSchema);

// ─── WorkflowStage ────────────────────────────────────────────────────────────
export interface IWorkflowStage extends Document<any> {
  _id: string;
  documentTypeId: string;
  stageOrder: number;
  stageName: string;
  roleRequired: 'FACULTY' | 'HOD' | 'OFFICE' | 'ADMIN';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowStageSchema = new Schema<IWorkflowStage>(
  {
    documentTypeId: { type: Schema.Types.ObjectId as any, ref: 'DocumentType', required: true },
    stageOrder: { type: Number, required: true },
    stageName: { type: String, required: true },
    roleRequired: { type: String, enum: ['FACULTY', 'HOD', 'OFFICE', 'ADMIN'], required: true },
    description: { type: String },
  },
  { timestamps: true }
);

WorkflowStageSchema.index({ documentTypeId: 1, stageOrder: 1 }, { unique: true });

export const WorkflowStage: Model<IWorkflowStage> =
  mongoose.models.WorkflowStage || mongoose.model<IWorkflowStage>('WorkflowStage', WorkflowStageSchema);

// ─── Request ──────────────────────────────────────────────────────────────────
export interface IRequest extends Document<any> {
  _id: string;
  requestNumber: string;
  studentId: string;
  departmentId: string;
  documentTypeId: string;
  purpose: string;
  requiredDate?: Date;
  additionalRemarks?: string;
  status: string;
  currentStageOrder: number;
  assignedFacultyId?: string;
  rejectionReason?: string;
  correctionRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>(
  {
    requestNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId as any, ref: 'Student', required: true },
    departmentId: { type: Schema.Types.ObjectId as any, ref: 'Department', required: true },
    documentTypeId: { type: Schema.Types.ObjectId as any, ref: 'DocumentType', required: true },
    purpose: { type: String, required: true },
    requiredDate: { type: Date, default: null },
    additionalRemarks: { type: String, default: null },
    status: { type: String, default: 'SUBMITTED' },
    currentStageOrder: { type: Number, default: 1 },
    assignedFacultyId: { type: Schema.Types.ObjectId as any, ref: 'Faculty', default: null },
    rejectionReason: { type: String, default: null },
    correctionRemarks: { type: String, default: null },
  },
  { timestamps: true }
);

export const Request: Model<IRequest> = mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema);

// ─── RequestAttachment ────────────────────────────────────────────────────────
export interface IRequestAttachment extends Document<any> {
  _id: string;
  requestId: string;
  fileName: string;
  fileOriginalName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

const RequestAttachmentSchema = new Schema<IRequestAttachment>(
  {
    requestId: { type: Schema.Types.ObjectId as any, ref: 'Request', required: true },
    fileName: { type: String, required: true },
    fileOriginalName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const RequestAttachment: Model<IRequestAttachment> =
  mongoose.models.RequestAttachment ||
  mongoose.model<IRequestAttachment>('RequestAttachment', RequestAttachmentSchema);

// ─── ApprovalHistory ─────────────────────────────────────────────────────────
export interface IApprovalHistory extends Document<any> {
  _id: string;
  requestId: string;
  approverId: string;
  stageOrder: number;
  stageName: string;
  role: string;
  action: string;
  remarks?: string;
  createdAt: Date;
}

const ApprovalHistorySchema = new Schema<IApprovalHistory>(
  {
    requestId: { type: Schema.Types.ObjectId as any, ref: 'Request', required: true },
    approverId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
    stageOrder: { type: Number, required: true },
    stageName: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    remarks: { type: String, default: null },
  },
  { timestamps: true }
);

export const ApprovalHistory: Model<IApprovalHistory> =
  mongoose.models.ApprovalHistory || mongoose.model<IApprovalHistory>('ApprovalHistory', ApprovalHistorySchema);

// ─── GeneratedDocument ───────────────────────────────────────────────────────
export interface IGeneratedDocument extends Document<any> {
  _id: string;
  requestId: string;
  documentNumber: string;
  verificationCode: string;
  filePath: string;
  fileUrl: string;
  fileSize?: number;
  generatedByRole: string;
  generatedAt: Date;
  downloadCount: number;
  lastDownloadedAt?: Date;
}

const GeneratedDocumentSchema = new Schema<IGeneratedDocument>(
  {
    requestId: { type: Schema.Types.ObjectId as any, ref: 'Request', required: true, unique: true },
    documentNumber: { type: String, required: true, unique: true },
    verificationCode: { type: String, required: true, unique: true },
    filePath: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, default: null },
    generatedByRole: { type: String, default: 'OFFICE' },
    generatedAt: { type: Date, default: Date.now },
    downloadCount: { type: Number, default: 0 },
    lastDownloadedAt: { type: Date, default: null },
  },
  { timestamps: false }
);

export const GeneratedDocument: Model<IGeneratedDocument> =
  mongoose.models.GeneratedDocument ||
  mongoose.model<IGeneratedDocument>('GeneratedDocument', GeneratedDocumentSchema);

// ─── Notification ─────────────────────────────────────────────────────────────
export interface INotification extends Document<any> {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  link?: string;
  readStatus: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'], default: 'INFO' },
    link: { type: String, default: null },
    readStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

// ─── AuditLog ─────────────────────────────────────────────────────────────────
export interface IAuditLog extends Document<any> {
  _id: string;
  userId?: string;
  requestId?: string;
  action: string;
  ipAddress?: string;
  metadata?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', default: null },
    requestId: { type: Schema.Types.ObjectId as any, ref: 'Request', default: null },
    action: { type: String, required: true },
    ipAddress: { type: String, default: null },
    metadata: { type: String, default: null },
  },
  { timestamps: true }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
