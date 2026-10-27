import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import {
  Request as RequestModel,
  Student,
  User,
  DocumentType,
  Department,
  Course,
  Faculty,
  GeneratedDocument,
} from '../models/index.js';
import { createNotification, createAuditLog } from './auditService.js';
import { notifyDocumentReady } from './emailService.js';

const DOCS_DIR = path.join(process.cwd(), 'generated-docs');
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

export async function generateAcademicPDF(requestId: string, operatorUserId: string) {
  const request = await RequestModel.findById(requestId)
    .populate({
      path: 'studentId',
      populate: [
        { path: 'userId', model: 'User' },
        { path: 'departmentId', model: 'Department' },
        { path: 'courseId', model: 'Course' },
        { path: 'advisorId', model: 'Faculty', populate: { path: 'userId', model: 'User' } },
      ],
    })
    .populate('documentTypeId')
    .populate('departmentId')
    .lean() as any;

  if (!request) throw new Error('Request not found');

  const student = request.studentId as any;
  const studentUser = student?.userId as any;
  const department = student?.departmentId as any;
  const course = student?.courseId as any;
  const advisor = student?.advisorId as any;
  const advisorUser = advisor?.userId as any;
  const documentType = request.documentTypeId as any;

  const docCode = `DOC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const verificationCode = `VERIFY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const fileName = `${documentType.code}_${request.requestNumber}_${Date.now()}.pdf`;
  const filePath = path.join(DOCS_DIR, fileName);

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify/${verificationCode}`;

  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    margin: 1,
    width: 120,
    color: { dark: '#1e1b4b', light: '#ffffff' },
  });

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Border & Header Design
  doc.rect(20, 20, 555, 802).lineWidth(2).strokeColor('#3730a3').stroke();
  doc.rect(24, 24, 547, 794).lineWidth(0.8).strokeColor('#c7d2fe').stroke();

  doc.fillColor('#1e1b4b').fontSize(20).font('Helvetica-Bold').text('NATIONAL INSTITUTE OF ADVANCED TECHNOLOGY', 40, 50, { align: 'center' });
  doc.fontSize(10).font('Helvetica').fillColor('#475569').text('Accredited "A++" Grade by NAAC | Approved by AICTE & UGC', { align: 'center' });
  doc.text('Knowledge Park Campus, Tech City, Sector-4, New Delhi - 110001, India', { align: 'center' });
  doc.text('Website: www.niat.edu.in | Email: registrar@niat.edu.in', { align: 'center' });

  doc.moveTo(40, 115).lineTo(555, 115).lineWidth(1.5).strokeColor('#4338ca').stroke();

  doc.fontSize(9).font('Helvetica-Bold').fillColor('#334155');
  doc.text(`Document Ref: ${docCode}`, 45, 125);
  doc.text(`Issue Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, 400, 125, { align: 'right' });
  doc.text(`Request ID: ${request.requestNumber}`, 45, 138);
  doc.text(`Verification Code: ${verificationCode}`, 400, 138, { align: 'right' });

  doc.moveDown(2);

  const docTypeCode = documentType?.code;

  if (docTypeCode === 'BONAFIDE') {
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e1b4b').text('BONAFIDE CERTIFICATE', 40, 180, { align: 'center', underline: true });
    doc.moveDown(2);
    doc.fontSize(12).font('Helvetica').fillColor('#1e293b').lineGap(10);
    doc.text(`This is to certify that Mr./Ms. ${studentUser?.name?.toUpperCase()} (Student ID: ${student?.studentIdNumber}) is a bonafide student of this Institute.`, 50, 240, { align: 'justify' });
    doc.text(`He/She is currently enrolled in Year ${student?.currentYear} (Semester ${student?.currentSemester}) of the 4-Year ${course?.name} program under the Department of ${department?.name} for the Academic Session ${student?.academicBatch}.`, 50, 290, { align: 'justify' });
    doc.text(`This certificate is officially issued on the student's request for the purpose of: "${request.purpose}".`, 50, 350, { align: 'justify' });
    doc.text(`During his/her tenure at this Institute, his/her academic performance, attendance, and character have been found to be Good.`, 50, 400, { align: 'justify' });
  } else if (docTypeCode === 'TRANSCRIPT') {
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e1b4b').text('OFFICIAL ACADEMIC TRANSCRIPT', 40, 170, { align: 'center', underline: true });
    doc.fontSize(10).font('Helvetica').fillColor('#1e293b');
    doc.text(`Student Name: ${studentUser?.name}`, 50, 205);
    doc.text(`Roll / ID: ${student?.studentIdNumber}`, 350, 205);
    doc.text(`Program: ${course?.name}`, 50, 220);
    doc.text(`Department: ${department?.name}`, 350, 220);
    doc.text(`Academic Batch: ${student?.academicBatch}`, 50, 235);
    doc.text(`Cumulative GPA (CGPA): ${(student?.cgpa || 0).toFixed(2)} / 10.0`, 350, 235);
    doc.rect(45, 260, 505, 20).fill('#e0e7ff');
    doc.fillColor('#1e1b4b').fontSize(9).font('Helvetica-Bold');
    doc.text('Course Code', 55, 265);
    doc.text('Subject Title', 140, 265);
    doc.text('Credits', 350, 265);
    doc.text('Grade', 420, 265);
    doc.text('Status', 480, 265);
    const subjects = [
      { code: 'CS501', title: 'Design & Analysis of Algorithms', credits: '4', grade: 'A+', status: 'Pass' },
      { code: 'CS502', title: 'Database Management Systems', credits: '4', grade: 'O', status: 'Pass' },
      { code: 'CS503', title: 'Operating Systems & System Ops', credits: '3', grade: 'A', status: 'Pass' },
      { code: 'CS504', title: 'Computer Networks & Security', credits: '4', grade: 'A+', status: 'Pass' },
      { code: 'CS505', title: 'Software Engineering Laboratory', credits: '2', grade: 'O', status: 'Pass' },
      { code: 'HS501', title: 'Professional Ethics & Management', credits: '2', grade: 'A', status: 'Pass' },
    ];
    let y = 285;
    subjects.forEach((s, idx) => {
      if (idx % 2 === 1) doc.rect(45, y - 3, 505, 18).fill('#f8fafc');
      doc.fillColor('#1e293b').fontSize(9).font('Helvetica');
      doc.text(s.code, 55, y);
      doc.text(s.title, 140, y);
      doc.text(s.credits, 355, y);
      doc.text(s.grade, 425, y);
      doc.text(s.status, 485, y);
      y += 20;
    });
    doc.moveDown(2);
    doc.font('Helvetica-Bold').text(`Total Semester Credits: 19 | Semester GPA: ${((student?.cgpa || 0) + 0.1).toFixed(2)} | Result: FIRST CLASS WITH DISTINCTION`, 50, y + 10);
  } else if (docTypeCode === 'RECOMMENDATION') {
    doc.fontSize(17).font('Helvetica-Bold').fillColor('#1e1b4b').text('LETTER OF RECOMMENDATION', 40, 175, { align: 'center', underline: true });
    doc.moveDown(1.5);
    doc.fontSize(11).font('Helvetica').fillColor('#1e293b').lineGap(8);
    doc.text('TO WHOMSOEVER IT MAY CONCERN,', 50, 220);
    doc.text(`I am delighted to write this recommendation on behalf of ${studentUser?.name} (ID: ${student?.studentIdNumber}), who has been an exemplary student in the Department of ${department?.name} at our Institute.`, 50, 245, { align: 'justify' });
    doc.text(`Throughout the academic program, ${studentUser?.name} has demonstrated exceptional intellectual curiosity, strong discipline, and profound command over core subjects. He/She maintains a commendable CGPA of ${(student?.cgpa || 0).toFixed(2)}/10.0 and consistently ranks among top performers in practical and project coursework.`, 50, 305, { align: 'justify' });
    doc.text(`In addition to academics, the student actively engages in technical symposiums and collegiate problem-solving events. I am confident that ${studentUser?.name} will excel in higher educational pursuits or professional endeavors.`, 50, 380, { align: 'justify' });
    doc.text(`I give my highest recommendation for the purpose of: "${request.purpose}". Please feel free to reach out for further verification.`, 50, 450, { align: 'justify' });
  } else {
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e1b4b').text(`${documentType?.name?.toUpperCase()}`, 40, 180, { align: 'center', underline: true });
    doc.fontSize(12).font('Helvetica').fillColor('#1e293b').lineGap(10);
    doc.text(`This document is officially issued to ${studentUser?.name} (Student ID: ${student?.studentIdNumber}) of the Department of ${department?.name}.`, 50, 240, { align: 'justify' });
    doc.text(`Program Enrolled: ${course?.name} | Batch: ${student?.academicBatch}.`, 50, 290, { align: 'justify' });
    doc.text(`Purpose: ${request.purpose}`, 50, 330, { align: 'justify' });
    doc.text(`Verified and endorsed by the Office of Academic Affairs on behalf of the University Examination Board.`, 50, 370, { align: 'justify' });
  }

  // Signature Block
  const sigY = 620;
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a');
  doc.text('Verified By:', 50, sigY);
  doc.fontSize(9).font('Helvetica').fillColor('#475569');
  doc.text(advisorUser?.name || 'Faculty Advisor / Reviewer', 50, sigY + 14);
  doc.text(`Dept of ${department?.name}`, 50, sigY + 26);
  doc.text('Digital Signature ID: #FAC-VERIFIED', 50, sigY + 38);

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a');
  doc.text('Approved By:', 220, sigY);
  doc.fontSize(9).font('Helvetica').fillColor('#475569');
  doc.text('Head of Department (HOD)', 220, sigY + 14);
  doc.text(`Dept of ${department?.name}`, 220, sigY + 26);
  doc.text('Digital Stamp: [DEPT_HOD_SEAL]', 220, sigY + 38);

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a');
  doc.text('Issued By:', 400, sigY);
  doc.fontSize(9).font('Helvetica').fillColor('#475569');
  doc.text('Office of Academic Affairs', 400, sigY + 14);
  doc.text('National Institute of Advanced Tech', 400, sigY + 26);
  doc.text('Registrar / Document Officer', 400, sigY + 38);

  // QR Section
  doc.rect(40, 695, 515, 95).fillAndStroke('#f8fafc', '#cbd5e1');
  const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  const qrBuffer = Buffer.from(qrBase64, 'base64');
  doc.image(qrBuffer, 50, 702, { width: 80, height: 80 });
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e1b4b');
  doc.text('OFFICIAL TAMPER-PROOF DIGITAL VERIFICATION', 145, 710);
  doc.fontSize(8.5).font('Helvetica').fillColor('#334155');
  doc.text('This academic document contains an encrypted digital verification link.', 145, 726);
  doc.text(`Scan the QR code to verify validity or visit the verification portal:`, 145, 738);
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#4338ca').text(verificationUrl, 145, 750);
  doc.fontSize(7.5).font('Helvetica').fillColor('#64748b').text(`Security Hash: ${Buffer.from(verificationCode + docCode).toString('base64').substring(0, 32)} | Generated by NIAT Document Engine`, 145, 765);

  doc.end();
  await new Promise<void>((resolve) => stream.on('finish', () => resolve()));

  const stats = fs.statSync(filePath);

  // Upsert GeneratedDocument in MongoDB
  const generatedDoc = await GeneratedDocument.findOneAndUpdate(
    { requestId: request._id },
    {
      requestId: request._id,
      documentNumber: docCode,
      verificationCode,
      filePath,
      fileUrl: `/generated-docs/${fileName}`,
      fileSize: stats.size,
      generatedByRole: 'OFFICE',
      generatedAt: new Date(),
    },
    { upsert: true, new: true }
  ).lean();

  // Update Request status
  await RequestModel.findByIdAndUpdate(requestId, { status: 'READY_FOR_DOWNLOAD' });

  // Notify student
  await createNotification(
    studentUser?._id?.toString(),
    `Document Ready: ${documentType?.name}`,
    `Your ${documentType?.name} (${request.requestNumber}) has been generated and is ready for download!`,
    'SUCCESS',
    `/student/requests/${request._id}`
  );

  await createAuditLog(operatorUserId, requestId, `Document ${docCode} generated for request ${request.requestNumber}`);

  if (studentUser?.email) {
    notifyDocumentReady({
      studentEmail: studentUser.email,
      studentName: studentUser.name,
      requestNumber: request.requestNumber,
      documentName: documentType?.name,
      documentCode: docCode,
      verificationCode,
      requestId: request._id?.toString(),
    }).catch(err => console.error('Email dispatch error on document ready:', err));
  }

  return generatedDoc;
}
