import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Nodemailer Transporter
export function getEmailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) {
    return null;
  }

  // Gmail SMTP transporter configuration
  return nodemailer.createTransport({
    host,
    port,
    secure, // true for 465, false for 587 / STARTTLS
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export function isEmailConfigured(): boolean {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  return Boolean(user && pass && user !== 'your-email@gmail.com');
}

export async function verifySmtpConnection(): Promise<{ configured: boolean; success: boolean; message: string }> {
  if (!isEmailConfigured()) {
    return {
      configured: false,
      success: false,
      message: 'SMTP credentials (SMTP_USER and SMTP_PASS) are not configured in backend/.env'
    };
  }

  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      return { configured: false, success: false, message: 'Could not create email transporter' };
    }
    await transporter.verify();
    return {
      configured: true,
      success: true,
      message: `Successfully connected to Gmail SMTP (${process.env.SMTP_USER})`
    };
  } catch (err: any) {
    return {
      configured: true,
      success: false,
      message: `SMTP Connection Failed: ${err.message}. If using Gmail, make sure you created a 16-character App Password (not your normal password).`
    };
  }
}

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendMailParams): Promise<{ success: boolean; simulated?: boolean; messageId?: string; previewUrl?: string; error?: string }> {
  const user = process.env.SMTP_USER?.trim();
  const fromName = process.env.SMTP_FROM_NAME || 'CertiFlow Academic Portal';
  const fromAddress = user || 'no-reply@college.edu';
  const from = `"${fromName}" <${fromAddress}>`;

  if (!isEmailConfigured()) {
    console.log('\n=============================================================');
    console.log(`📨 [REAL-TIME EMAIL SIMULATION] (Configure SMTP_USER & SMTP_PASS in backend/.env to send real inboxes)`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Sender: ${from}`);
    console.log(`Preview: ${text || subject}`);
    console.log('=============================================================\n');
    return { success: true, simulated: true };
  }

  try {
    const transporter = getEmailTransporter();
    if (!transporter) throw new Error('Transporter unavailable');

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || subject,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`✅ [REAL-TIME EMAIL DISPATCHED] To: ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`);
    if (previewUrl) {
      console.log(`📬 [LIVE INBOX PREVIEW URL]: ${previewUrl}`);
    }
    return { success: true, messageId: info.messageId, previewUrl: previewUrl || undefined };
  } catch (err: any) {
    console.error(`❌ [EMAIL DISPATCH ERROR] Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

// -------------------------------------------------------------
// Institutional HTML Email Template Generator
// -------------------------------------------------------------
function buildEmailTemplate({
  headerTitle,
  badgeText,
  badgeColor = '#2563eb',
  greeting,
  message,
  tableRows,
  buttonText,
  buttonUrl,
  calloutText,
}: {
  headerTitle: string;
  badgeText: string;
  badgeColor?: string;
  greeting: string;
  message: string;
  tableRows?: Array<{ label: string; value: string }>;
  buttonText?: string;
  buttonUrl?: string;
  calloutText?: string;
}) {
  const rowsHtml = tableRows
    ? tableRows
        .map(
          (row) => `
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600; width: 35%;">${row.label}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 500;">${row.value}</td>
        </tr>
      `
        )
        .join('')
    : '';

  const buttonHtml =
    buttonText && buttonUrl
      ? `
      <div style="margin-top: 28px; text-align: center;">
        <a href="${buttonUrl}" style="background-color: #2563eb; color: #ffffff; padding: 13px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
          ${buttonText} &rarr;
        </a>
      </div>
    `
      : '';

  const calloutHtml = calloutText
    ? `
      <div style="margin-top: 20px; padding: 14px 16px; background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 4px; font-size: 13px; color: #334155; line-height: 1.5;">
        ${calloutText}
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 32px 16px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
    
    <!-- Top Bar -->
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 28px 32px; text-align: left;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <span style="font-size: 24px; margin-right: 8px;">🎓</span>
          <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">CertiFlow</span>
          <p style="margin: 4px 0 0 0; color: #bfdbfe; font-size: 13px; font-weight: 500;">Digital Academic Document Workflow System</p>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div style="padding: 32px;">
      
      <!-- Status Badge -->
      <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background-color: ${badgeColor}15; color: ${badgeColor}; border: 1px solid ${badgeColor}40; margin-bottom: 16px;">
        ${badgeText}
      </div>

      <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a;">${headerTitle}</h2>
      
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">${greeting},</p>
      
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">${message}</p>

      ${
        tableRows && tableRows.length > 0
          ? `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      `
          : ''
      }

      ${calloutHtml}
      ${buttonHtml}

      <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        <p style="margin: 0 0 4px 0;">This is an automated institutional notification dispatched in real-time from the university academic workflow server.</p>
        <p style="margin: 0;">Do not reply directly to this email address.</p>
      </div>
    </div>

  </div>
</body>
</html>
  `;
}

// -------------------------------------------------------------
// Exported Workflow Real-Time Notification Methods
// -------------------------------------------------------------

/**
 * 1. When a Student submits a Document Request:
 *    - Confirmation to Student
 *    - Action Alert to the 1st Stage Reviewer (Faculty Advisor / HOD / Office)
 */
export async function notifyRequestSubmission({
  studentEmail,
  studentName,
  studentIdNumber,
  requestNumber,
  documentName,
  purpose,
  approverEmail,
  approverName,
  approverRole,
  requestId,
}: {
  studentEmail: string;
  studentName: string;
  studentIdNumber: string;
  requestNumber: string;
  documentName: string;
  purpose: string;
  approverEmail?: string | null;
  approverName?: string | null;
  approverRole?: string | null;
  requestId: string;
}) {
  const studentPortalUrl = `${CLIENT_URL}/student/requests/${requestId}`;
  const reviewerPortalUrl = `${CLIENT_URL}/login`;

  // 1a. Student Confirmation Email
  await sendEmail({
    to: studentEmail,
    subject: `[CertiFlow] Request Submitted: ${requestNumber} - ${documentName}`,
    html: buildEmailTemplate({
      headerTitle: 'Academic Document Request Received',
      badgeText: 'Application Submitted',
      badgeColor: '#2563eb',
      greeting: `Hello ${studentName}`,
      message: `Your application for <strong>${documentName}</strong> has been received by the academic system and forwarded to your department reviewers for verification.`,
      tableRows: [
        { label: 'Request Number', value: requestNumber },
        { label: 'Document Type', value: documentName },
        { label: 'Purpose', value: purpose },
        { label: 'Next Stage', value: approverRole ? `Review by ${approverRole}` : 'Under Review' },
        { label: 'Assigned Reviewer', value: approverName || 'Department Faculty' },
      ],
      buttonText: 'View Live Request Status',
      buttonUrl: studentPortalUrl,
      calloutText: 'You will receive real-time email notifications as your application progresses through Faculty, HOD, and Academic Office approval tiers.',
    }),
    text: `Your request ${requestNumber} for ${documentName} has been submitted successfully and is currently under review.`,
  });

  // 1b. Reviewer Action Required Email (if reviewer email is available)
  if (approverEmail) {
    await sendEmail({
      to: approverEmail,
      subject: `[Action Required] New ${documentName} Request from ${studentName} (${requestNumber})`,
      html: buildEmailTemplate({
        headerTitle: 'New Document Application Awaiting Review',
        badgeText: 'Action Required',
        badgeColor: '#d97706',
        greeting: `Dear ${approverName || approverRole || 'Reviewer'}`,
        message: `A new academic document request has been submitted by student <strong>${studentName}</strong> and requires your verification and endorsement.`,
        tableRows: [
          { label: 'Request Number', value: requestNumber },
          { label: 'Student Name', value: studentName },
          { label: 'Student ID Number', value: studentIdNumber },
          { label: 'Document Requested', value: documentName },
          { label: 'Purpose', value: purpose },
        ],
        buttonText: 'Review and Approve Request',
        buttonUrl: reviewerPortalUrl,
        calloutText: 'Please log in to your designated institutional portal to verify academic criteria (attendance/CGPA) and approve or request corrections.',
      }),
      text: `Action Required: New request ${requestNumber} from ${studentName} (${documentName}) requires your review.`,
    });
  }
}

/**
 * 2. When an Approver approves a Stage (forwarded to next stage):
 *    - Update to Student
 *    - Action Alert to Next Reviewer (HOD or Office)
 */
export async function notifyStageApproved({
  studentEmail,
  studentName,
  requestNumber,
  documentName,
  approverRole,
  approverName,
  nextStageName,
  nextRoleRequired,
  nextApproverEmail,
  nextApproverName,
  remarks,
  requestId,
}: {
  studentEmail: string;
  studentName: string;
  requestNumber: string;
  documentName: string;
  approverRole: string;
  approverName: string;
  nextStageName: string;
  nextRoleRequired: string;
  nextApproverEmail?: string | null;
  nextApproverName?: string | null;
  remarks?: string | null;
  requestId: string;
}) {
  const studentPortalUrl = `${CLIENT_URL}/student/requests/${requestId}`;
  const reviewerPortalUrl = `${CLIENT_URL}/login`;

  // 2a. Student Update Email
  await sendEmail({
    to: studentEmail,
    subject: `[CertiFlow] Progress Update: ${requestNumber} Approved by ${approverRole}`,
    html: buildEmailTemplate({
      headerTitle: 'Document Application Advanced',
      badgeText: `Approved by ${approverRole}`,
      badgeColor: '#059669',
      greeting: `Hello ${studentName}`,
      message: `Great news! Your request for <strong>${documentName}</strong> was verified and approved by <strong>${approverName} (${approverRole})</strong>. It has now progressed to <strong>${nextStageName}</strong>.`,
      tableRows: [
        { label: 'Request Number', value: requestNumber },
        { label: 'Current Tier Status', value: `Approved by ${approverRole}` },
        { label: 'Advancing To', value: nextStageName },
        { label: 'Reviewer Remarks', value: remarks || 'All criteria verified.' },
      ],
      buttonText: 'Track Application Status',
      buttonUrl: studentPortalUrl,
    }),
    text: `Your request ${requestNumber} was approved by ${approverName} (${approverRole}) and moved to ${nextStageName}.`,
  });

  // 2b. Next Reviewer Action Alert
  if (nextApproverEmail) {
    await sendEmail({
      to: nextApproverEmail,
      subject: `[Action Required] Request ${requestNumber} Forwarded for ${nextRoleRequired} Review`,
      html: buildEmailTemplate({
        headerTitle: `Document Request Awaiting ${nextRoleRequired} Decision`,
        badgeText: 'Stage Forwarded',
        badgeColor: '#2563eb',
        greeting: `Dear ${nextApproverName || nextRoleRequired}`,
        message: `Request <strong>${requestNumber}</strong> for <strong>${documentName}</strong> (Student: ${studentName}) has been approved by ${approverRole} and is now pending your sign-off.`,
        tableRows: [
          { label: 'Request Number', value: requestNumber },
          { label: 'Student', value: studentName },
          { label: 'Document Type', value: documentName },
          { label: 'Previous Approver', value: `${approverName} (${approverRole})` },
          { label: 'Previous Remarks', value: remarks || 'Endorsed' },
        ],
        buttonText: 'Open Review Queue',
        buttonUrl: reviewerPortalUrl,
      }),
      text: `Request ${requestNumber} has been approved by ${approverRole} and is awaiting your ${nextRoleRequired} review.`,
    });
  }
}

/**
 * 3. When an Approver requests Corrections from the Student:
 */
export async function notifyCorrectionRequested({
  studentEmail,
  studentName,
  requestNumber,
  documentName,
  approverRole,
  approverName,
  remarks,
  requestId,
}: {
  studentEmail: string;
  studentName: string;
  requestNumber: string;
  documentName: string;
  approverRole: string;
  approverName: string;
  remarks: string;
  requestId: string;
}) {
  const studentPortalUrl = `${CLIENT_URL}/student/requests/${requestId}`;

  await sendEmail({
    to: studentEmail,
    subject: `[Action Required] Corrections Needed for Request ${requestNumber}`,
    html: buildEmailTemplate({
      headerTitle: 'Information or Correction Required',
      badgeText: 'Correction Required',
      badgeColor: '#d97706',
      greeting: `Hello ${studentName}`,
      message: `Your application for <strong>${documentName}</strong> has been reviewed by <strong>${approverName} (${approverRole})</strong>, but requires adjustments before it can proceed.`,
      tableRows: [
        { label: 'Request Number', value: requestNumber },
        { label: 'Reviewer', value: `${approverName} (${approverRole})` },
        { label: 'Remarks / Instructions', value: remarks },
      ],
      buttonText: 'Update Application Details',
      buttonUrl: studentPortalUrl,
      calloutText: 'Please review the requested changes promptly and resubmit your details to proceed with verification.',
    }),
    text: `Your request ${requestNumber} requires corrections: "${remarks}". Please visit ${studentPortalUrl} to update it.`,
  });
}

/**
 * 4. When a Request is Rejected:
 */
export async function notifyRequestRejected({
  studentEmail,
  studentName,
  requestNumber,
  documentName,
  approverRole,
  approverName,
  rejectionReason,
  requestId,
}: {
  studentEmail: string;
  studentName: string;
  requestNumber: string;
  documentName: string;
  approverRole: string;
  approverName: string;
  rejectionReason: string;
  requestId: string;
}) {
  const studentPortalUrl = `${CLIENT_URL}/student/requests/${requestId}`;

  await sendEmail({
    to: studentEmail,
    subject: `[CertiFlow Notice] Document Request ${requestNumber} Declined`,
    html: buildEmailTemplate({
      headerTitle: 'Application Review Outcome',
      badgeText: 'Request Declined',
      badgeColor: '#dc2626',
      greeting: `Hello ${studentName}`,
      message: `We regret to inform you that your request for <strong>${documentName}</strong> was reviewed and declined by <strong>${approverName} (${approverRole})</strong>.`,
      tableRows: [
        { label: 'Request Number', value: requestNumber },
        { label: 'Document Type', value: documentName },
        { label: 'Reviewed By', value: `${approverName} (${approverRole})` },
        { label: 'Official Reason', value: rejectionReason },
      ],
      buttonText: 'View Application Details',
      buttonUrl: studentPortalUrl,
      calloutText: 'If you have questions regarding this decision, please reach out to your department coordinator or class advisor directly.',
    }),
    text: `Your request ${requestNumber} for ${documentName} was declined by ${approverName} (${approverRole}). Reason: ${rejectionReason}`,
  });
}

/**
 * 5. When Document is Generated & Ready for Download:
 */
export async function notifyDocumentReady({
  studentEmail,
  studentName,
  requestNumber,
  documentName,
  documentCode,
  verificationCode,
  requestId,
}: {
  studentEmail: string;
  studentName: string;
  requestNumber: string;
  documentName: string;
  documentCode: string;
  verificationCode: string;
  requestId: string;
}) {
  const studentPortalUrl = `${CLIENT_URL}/student/requests/${requestId}`;
  const publicVerifyUrl = `${CLIENT_URL}/verify/${verificationCode}`;

  await sendEmail({
    to: studentEmail,
    subject: `🎉 [Document Ready] Your Verified ${documentName} is Ready for Download!`,
    html: buildEmailTemplate({
      headerTitle: 'Official Academic Document Issued',
      badgeText: 'Ready For Download',
      badgeColor: '#059669',
      greeting: `Congratulations ${studentName}`,
      message: `Your official verified <strong>${documentName}</strong> has been synthesized, cryptographically sealed with an institutional security hash and QR code, and is now ready for immediate download!`,
      tableRows: [
        { label: 'Request Number', value: requestNumber },
        { label: 'Document Code', value: documentCode },
        { label: 'Verification Code', value: verificationCode },
        { label: 'Public Verification URL', value: `<a href="${publicVerifyUrl}" style="color: #2563eb;">${publicVerifyUrl}</a>` },
      ],
      buttonText: 'Download Verified Document (PDF)',
      buttonUrl: studentPortalUrl,
      calloutText: 'This document features a tamper-proof QR code. Any recipient, employer, or authority can scan the QR code to independently verify institutional authenticity.',
    }),
    text: `Your ${documentName} (${documentCode}) has been generated! Download it at ${studentPortalUrl} or verify at ${publicVerifyUrl}`,
  });
}

/**
 * 6. Send a Test Email to verify SMTP connectivity
 */
export async function sendTestNotificationEmail(recipientEmail: string) {
  return await sendEmail({
    to: recipientEmail,
    subject: '🧪 [CertiFlow] Real-time Email Delivery Test',
    html: buildEmailTemplate({
      headerTitle: 'Real-time Email Notification Test',
      badgeText: 'Test Successful',
      badgeColor: '#059669',
      greeting: 'Hello',
      message: 'This is a live test email confirming that CertiFlow Gmail SMTP integration is fully configured and delivering real-time academic notifications to real inboxes.',
      tableRows: [
        { label: 'Delivery Service', value: 'Google Gmail SMTP (smtp.gmail.com)' },
        { label: 'Recipient', value: recipientEmail },
        { label: 'Dispatched At', value: new Date().toLocaleString() },
      ],
      buttonText: 'Return to CertiFlow Portal',
      buttonUrl: CLIENT_URL,
      calloutText: 'All student requests, faculty reviews, HOD sign-offs, and document issuances will now be delivered in real-time to user mailboxes.',
    }),
    text: `Real-time email test from CertiFlow succeeded! Delivered to ${recipientEmail} at ${new Date().toISOString()}`,
  });
}
