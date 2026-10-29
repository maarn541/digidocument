import bcrypt from 'bcryptjs';
import { Course, Department, Faculty, Student, User } from '../models/index.js';

const demoAccounts = [
  { email: 'admin@college.edu', name: 'Dr. Arthur Sterling', role: 'ADMIN' },
  { email: 'office@college.edu', name: 'Ms. Eleanor Vance', role: 'OFFICE' },
  { email: 'hod@college.edu', name: 'Prof. Rajesh Kumar (HOD CSE)', role: 'HOD' },
  { email: 'faculty@college.edu', name: 'Dr. Priya Sharma', role: 'FACULTY' },
  { email: 'student@college.edu', name: 'Aditya Verma', role: 'STUDENT' },
] as const;

export async function ensureDemoAccounts(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', 10);
  const users = new Map<string, { _id: string }>();

  for (const account of demoAccounts) {
    const user = await User.findOneAndUpdate(
      { email: account.email },
      {
        $set: {
          ...account,
          passwordHash,
          status: 'ACTIVE',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select('_id');

    if (!user) {
      throw new Error(`Failed to initialize demo account ${account.email}`);
    }

    users.set(account.email, user);
  }

  const hod = users.get('hod@college.edu')!;
  const facultyUser = users.get('faculty@college.edu')!;
  const studentUser = users.get('student@college.edu')!;

  const department = await Department.findOneAndUpdate(
    { code: 'CSE' },
    {
      $setOnInsert: {
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Department of Computer Science and Engineering',
        hodId: hod._id,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const course = await Course.findOneAndUpdate(
    { code: 'BTCS' },
    {
      $setOnInsert: {
        departmentId: department._id,
        name: 'B.Tech Computer Science',
        code: 'BTCS',
        durationYears: 4,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Faculty.findOneAndUpdate(
    { userId: facultyUser._id },
    {
      $setOnInsert: {
        userId: facultyUser._id,
        facultyCode: 'FAC-DEMO-001',
        departmentId: department._id,
        designation: 'Associate Professor',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await Faculty.findOneAndUpdate(
    { userId: hod._id },
    {
      $setOnInsert: {
        userId: hod._id,
        facultyCode: 'FAC-DEMO-HOD',
        departmentId: department._id,
        designation: 'Head of Department',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await Student.findOneAndUpdate(
    { userId: studentUser._id },
    {
      $setOnInsert: {
        userId: studentUser._id,
        studentIdNumber: 'STU2023001',
        departmentId: department._id,
        courseId: course._id,
        currentYear: 3,
        currentSemester: 5,
        academicBatch: '2023-2027',
        cgpa: 8.9,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Demo accounts are ready (password: password123).');
}
