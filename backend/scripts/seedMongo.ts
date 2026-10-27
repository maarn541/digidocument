import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { connectMongoDB } from '../src/config/mongodb.js';
import {
  User, Department, Course, Faculty, Student,
  DocumentType, WorkflowStage, AuditLog, Notification,
  ApprovalHistory, RequestAttachment, GeneratedDocument,
  Request as RequestModel,
} from '../src/models/index.js';

async function main() {
  await connectMongoDB();
  console.log('🌱 Starting MongoDB Database Seeding...');

  // 1. Clear all collections
  await AuditLog.deleteMany({});
  await Notification.deleteMany({});
  await ApprovalHistory.deleteMany({});
  await RequestAttachment.deleteMany({});
  await GeneratedDocument.deleteMany({});
  await RequestModel.deleteMany({});
  await WorkflowStage.deleteMany({});
  await DocumentType.deleteMany({});
  await Student.deleteMany({});
  await Faculty.deleteMany({});
  await Course.deleteMany({});
  await Department.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Users
  const adminUser = await User.create({ email: 'admin@college.edu', name: 'Dr. Arthur Sterling', passwordHash, role: 'ADMIN', status: 'ACTIVE' });
  const officeUser = await User.create({ email: 'office@college.edu', name: 'Ms. Eleanor Vance', passwordHash, role: 'OFFICE', status: 'ACTIVE' });
  const hodUser = await User.create({ email: 'hod@college.edu', name: 'Prof. Rajesh Kumar (HOD CSE)', passwordHash, role: 'HOD', status: 'ACTIVE' });
  const facultyUser = await User.create({ email: 'faculty@college.edu', name: 'Dr. Priya Sharma', passwordHash, role: 'FACULTY', status: 'ACTIVE' });
  const studentUser = await User.create({ email: 'student@college.edu', name: 'Arjun Mehta', passwordHash, role: 'STUDENT', status: 'ACTIVE' });
  const student2User = await User.create({ email: 'student2@college.edu', name: 'Sneha Patel', passwordHash, role: 'STUDENT', status: 'ACTIVE' });

  // 3. Create Department
  const cseDept = await Department.create({
    name: 'Computer Science & Engineering',
    code: 'CSE',
    description: 'Department of Computer Science and Engineering',
    hodId: hodUser._id,
  });

  // 4. Create Course
  const bTechCS = await Course.create({
    departmentId: cseDept._id,
    name: 'B.Tech Computer Science',
    code: 'BTCS',
    durationYears: 4,
  });

  // 5. Create Faculty Profile
  const faculty = await Faculty.create({
    userId: facultyUser._id,
    facultyCode: 'FAC-CSE-001',
    departmentId: cseDept._id,
    designation: 'Associate Professor',
  });

  // 6. Create Student Profiles
  const student1 = await Student.create({
    userId: studentUser._id,
    studentIdNumber: 'STU2023001',
    departmentId: cseDept._id,
    courseId: bTechCS._id,
    currentYear: 3,
    currentSemester: 5,
    academicBatch: '2023-2027',
    phone: '9876543210',
    advisorId: faculty._id,
    cgpa: 8.9,
  });

  const student2 = await Student.create({
    userId: student2User._id,
    studentIdNumber: 'STU2023002',
    departmentId: cseDept._id,
    courseId: bTechCS._id,
    currentYear: 2,
    currentSemester: 3,
    academicBatch: '2023-2027',
    phone: '9876543211',
    advisorId: faculty._id,
    cgpa: 7.8,
  });

  // 7. Create Document Types with Workflows
  const bonafide = await DocumentType.create({
    code: 'BONAFIDE',
    name: 'Bonafide Certificate',
    description: 'Certificate verifying student enrollment at the institution',
    estimatedDays: 2,
    icon: 'Award',
    requiresUpload: false,
    isActive: true,
  });
  await WorkflowStage.create({ documentTypeId: bonafide._id, stageOrder: 1, stageName: 'Faculty Verification', roleRequired: 'FACULTY', description: 'Faculty advisor verifies student details' });
  await WorkflowStage.create({ documentTypeId: bonafide._id, stageOrder: 2, stageName: 'HOD Approval', roleRequired: 'HOD', description: 'Head of Department approves the request' });
  await WorkflowStage.create({ documentTypeId: bonafide._id, stageOrder: 3, stageName: 'Academic Office Processing', roleRequired: 'OFFICE', description: 'Academic office generates and issues the certificate' });

  const transcript = await DocumentType.create({
    code: 'TRANSCRIPT',
    name: 'Academic Transcript',
    description: 'Official record of academic grades and achievements',
    estimatedDays: 5,
    icon: 'FileText',
    requiresUpload: false,
    isActive: true,
  });
  await WorkflowStage.create({ documentTypeId: transcript._id, stageOrder: 1, stageName: 'HOD Verification', roleRequired: 'HOD', description: 'HOD verifies academic performance' });
  await WorkflowStage.create({ documentTypeId: transcript._id, stageOrder: 2, stageName: 'Academic Office Processing', roleRequired: 'OFFICE', description: 'Academic office generates official transcript' });

  const recommendation = await DocumentType.create({
    code: 'RECOMMENDATION',
    name: 'Letter of Recommendation',
    description: 'Faculty or HOD recommendation letter for higher studies or employment',
    estimatedDays: 7,
    icon: 'Star',
    requiresUpload: false,
    isActive: true,
  });
  await WorkflowStage.create({ documentTypeId: recommendation._id, stageOrder: 1, stageName: 'Faculty Recommendation', roleRequired: 'FACULTY', description: 'Faculty writes and signs the recommendation' });
  await WorkflowStage.create({ documentTypeId: recommendation._id, stageOrder: 2, stageName: 'HOD Endorsement', roleRequired: 'HOD', description: 'HOD endorses the recommendation' });
  await WorkflowStage.create({ documentTypeId: recommendation._id, stageOrder: 3, stageName: 'Academic Office Seal', roleRequired: 'OFFICE', description: 'Academic office stamps and issues the letter' });

  const noDue = await DocumentType.create({
    code: 'NO_DUE',
    name: 'No Dues Certificate',
    description: 'Certificate confirming all dues cleared with the institution',
    estimatedDays: 3,
    icon: 'CheckCircle',
    requiresUpload: false,
    isActive: true,
  });
  await WorkflowStage.create({ documentTypeId: noDue._id, stageOrder: 1, stageName: 'HOD Clearance', roleRequired: 'HOD', description: 'HOD confirms departmental clearance' });
  await WorkflowStage.create({ documentTypeId: noDue._id, stageOrder: 2, stageName: 'Academic Office Issuance', roleRequired: 'OFFICE', description: 'Academic office issues no-dues certificate' });

  // 8. Create a sample Request
  const sampleRequest = await RequestModel.create({
    requestNumber: `REQ-${new Date().getFullYear()}-0001`,
    studentId: student1._id,
    departmentId: cseDept._id,
    documentTypeId: bonafide._id,
    purpose: 'Bank account opening / Educational loan application',
    status: 'UNDER_FACULTY_REVIEW',
    currentStageOrder: 1,
  });

  console.log('\n✅ MongoDB Database Seeded Successfully!\n');
  console.log('─────────────────────────────────────────────────────');
  console.log('🔐 Login Credentials (Password for all: password123)');
  console.log('─────────────────────────────────────────────────────');
  console.log('👑 Admin    : admin@college.edu');
  console.log('🏛️  Office   : office@college.edu');
  console.log('🎓 HOD      : hod@college.edu');
  console.log('👨‍🏫 Faculty  : faculty@college.edu');
  console.log('🎒 Student  : student@college.edu    (ID: STU2023001)');
  console.log('🎒 Student2 : student2@college.edu   (ID: STU2023002)');
  console.log('─────────────────────────────────────────────────────\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
