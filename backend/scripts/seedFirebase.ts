import { db } from '../src/config/firebase.js';
import bcrypt from 'bcryptjs';

async function seedFirebase() {
  console.log('🌱 Starting Firebase Cloud Firestore database seeding for Academic Workflow System...');

  const passwordHash = await bcrypt.hash('password123', 10);
  const now = new Date().toISOString();

  // 1. Seed Departments
  console.log('📁 Seeding Departments...');
  const departments = [
    {
      id: 'dept-cse-01',
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science and Engineering',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'dept-it-02',
      name: 'Information Technology',
      code: 'IT',
      description: 'Department of Information Technology & Software Systems',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'dept-ece-03',
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
      description: 'Department of Electronics & Communication',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'dept-mech-04',
      name: 'Mechanical Engineering',
      code: 'MECH',
      description: 'Department of Mechanical Engineering',
      createdAt: now,
      updatedAt: now
    }
  ];

  for (const dept of departments) {
    await db.collection('departments').doc(dept.id).set(dept);
  }

  // 2. Seed Courses
  console.log('🎓 Seeding Courses...');
  const courses = [
    {
      id: 'course-btech-cse',
      departmentId: 'dept-cse-01',
      name: 'B.Tech in Computer Science & Engineering',
      code: 'BT-CSE',
      durationYears: 4,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'course-btech-it',
      departmentId: 'dept-it-02',
      name: 'B.Tech in Information Technology',
      code: 'BT-IT',
      durationYears: 4,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'course-btech-ece',
      departmentId: 'dept-ece-03',
      name: 'B.Tech in Electronics and Communication',
      code: 'BT-ECE',
      durationYears: 4,
      createdAt: now,
      updatedAt: now
    }
  ];

  for (const course of courses) {
    await db.collection('courses').doc(course.id).set(course);
  }

  // 3. Seed Users
  console.log('👥 Seeding System Users & Profiles...');
  const users = [
    {
      id: 'user-admin-01',
      email: 'admin@college.edu',
      name: 'Dr. Arthur Sterling',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'user-office-01',
      email: 'office@college.edu',
      name: 'Ms. Eleanor Vance',
      passwordHash,
      role: 'OFFICE',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'user-hod-01',
      email: 'hod@college.edu',
      name: 'Prof. Rajesh Kumar (HOD CSE)',
      passwordHash,
      role: 'HOD',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'user-faculty-01',
      email: 'faculty@college.edu',
      name: 'Dr. Priya Sharma (Advisor)',
      passwordHash,
      role: 'FACULTY',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'user-student-01',
      email: 'student@college.edu',
      name: 'Aditya Verma',
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    }
  ];

  for (const user of users) {
    await db.collection('users').doc(user.id).set(user);
  }

  // 4. Seed Faculty and Student Profiles
  await db.collection('faculty').doc('fac-cse-01').set({
    id: 'fac-cse-01',
    userId: 'user-faculty-01',
    facultyCode: 'FAC-CSE-01',
    departmentId: 'dept-cse-01',
    designation: 'Assistant Professor',
    createdAt: now,
    updatedAt: now
  });

  await db.collection('students').doc('stu-cse-01').set({
    id: 'stu-cse-01',
    userId: 'user-student-01',
    studentIdNumber: 'STU2023001',
    departmentId: 'dept-cse-01',
    courseId: 'course-btech-cse',
    currentYear: 3,
    currentSemester: 5,
    academicBatch: '2023-2027',
    phone: '+91 98765 43210',
    advisorId: 'fac-cse-01',
    cgpa: 8.85,
    createdAt: now,
    updatedAt: now
  });

  // 5. Seed Document Types and Stages
  console.log('📄 Seeding Document Types & Approval Workflows...');
  const documentTypes = [
    {
      id: 'doctype-bonafide',
      code: 'BONAFIDE',
      name: 'Bonafide Certificate',
      description: 'Official proof of active student enrolment for passport, visa, scholarship, or bank loan purposes.',
      estimatedDays: 2,
      icon: 'FileBadge',
      requiresUpload: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      stages: [
        { stageOrder: 1, stageName: 'Faculty Verification', roleRequired: 'FACULTY' },
        { stageOrder: 2, stageName: 'HOD Recommendation', roleRequired: 'HOD' },
        { stageOrder: 3, stageName: 'Academic Office Seal & Generation', roleRequired: 'OFFICE' }
      ]
    },
    {
      id: 'doctype-transcript',
      code: 'TRANSCRIPT',
      name: 'Official Academic Transcript',
      description: 'Complete semester-wise grade sheet and GPA validation signed by the Controller of Examinations.',
      estimatedDays: 4,
      icon: 'Award',
      requiresUpload: true,
      uploadDocLabel: 'Previous Marksheets / Grade Cards (PDF)',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      stages: [
        { stageOrder: 1, stageName: 'Academic Advisor Review', roleRequired: 'FACULTY' },
        { stageOrder: 2, stageName: 'HOD Endorsement', roleRequired: 'HOD' },
        { stageOrder: 3, stageName: 'Academic Office Generation', roleRequired: 'OFFICE' }
      ]
    },
    {
      id: 'doctype-recommendation',
      code: 'RECOMMENDATION',
      name: 'Letter of Recommendation (LOR)',
      description: 'Academic recommendation from faculty advisor and department head for higher studies or internships.',
      estimatedDays: 5,
      icon: 'CheckCircle',
      requiresUpload: true,
      uploadDocLabel: 'Student Resume / Statement of Purpose (PDF)',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      stages: [
        { stageOrder: 1, stageName: 'Faculty Advisor Review', roleRequired: 'FACULTY' },
        { stageOrder: 2, stageName: 'HOD Final Approval', roleRequired: 'HOD' },
        { stageOrder: 3, stageName: 'Academic Office Dispatch', roleRequired: 'OFFICE' }
      ]
    },
    {
      id: 'doctype-nodues',
      code: 'NO_DUE',
      name: 'No-Dues Clearance Certificate',
      description: 'Clearance document validating zero pending dues across library, laboratories, and hostel accounts.',
      estimatedDays: 3,
      icon: 'ShieldCheck',
      requiresUpload: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      stages: [
        { stageOrder: 1, stageName: 'Department Verification', roleRequired: 'FACULTY' },
        { stageOrder: 2, stageName: 'HOD Clearance', roleRequired: 'HOD' },
        { stageOrder: 3, stageName: 'Office Clearance & Seal', roleRequired: 'OFFICE' }
      ]
    }
  ];

  for (const dt of documentTypes) {
    await db.collection('documentTypes').doc(dt.id).set(dt);
  }

  // 6. Sample Sample Requests
  console.log('📝 Seeding Sample Certificate Requests...');
  const sampleRequest = {
    id: 'req-sample-001',
    requestNumber: 'REQ-2026-0001',
    studentId: 'stu-cse-01',
    departmentId: 'dept-cse-01',
    documentTypeId: 'doctype-bonafide',
    purpose: 'Application for Government Merit Scholarship Scheme 2026',
    status: 'READY_FOR_DOWNLOAD',
    currentStageOrder: 3,
    assignedFacultyId: 'fac-cse-01',
    createdAt: now,
    updatedAt: now
  };
  await db.collection('requests').doc(sampleRequest.id).set(sampleRequest);

  // Sample Generated Document for Verification
  const sampleDoc = {
    id: 'gen-doc-001',
    requestId: 'req-sample-001',
    documentNumber: 'DOC-2026-000101',
    verificationCode: 'VERIFY-793421',
    filePath: 'generated-docs/BONAFIDE_REQ-2026-0001_sample.pdf',
    fileUrl: '/generated-docs/sample-bonafide.pdf',
    generatedByRole: 'OFFICE',
    generatedAt: now,
    downloadCount: 1
  };
  await db.collection('generatedDocuments').doc(sampleDoc.id).set(sampleDoc);

  console.log('✅ Firebase Cloud Firestore database seeded successfully!');
  console.log('Credentials:');
  console.log('  Admin:   admin@college.edu / password123');
  console.log('  Office:  office@college.edu / password123');
  console.log('  HOD:     hod@college.edu / password123');
  console.log('  Faculty: faculty@college.edu / password123');
  console.log('  Student: student@college.edu (STU2023001) / password123');
}

seedFirebase().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Error during Firebase seeding:', err);
  process.exit(1);
});
