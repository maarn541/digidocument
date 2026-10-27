# 🎓 Digital Academic Document Workflow System (CertiFlow)

A production-style, role-based university academic document request, multi-tier approval workflow, tamper-proof PDF generation, and public QR verification platform.

---

## 🌟 Key Features

1. **Role-Based Workflows**:
   - **Student**: Submit applications for Bonafide Certificates, Official Transcripts, Recommendation Letters, and Course Completion Certificates. Monitor live stage progression and download verified PDFs.
   - **Faculty / Class Advisor**: Review student eligibility, attendance, and CGPA; approve, reject, or request corrections.
   - **Head of Department (HOD)**: Departmental executive sign-off and recommendation.
   - **Academic Office / Document Officer**: Process approved queues, trigger server-side PDF generation with digital signature seals, and issue documents.
   - **University Administrator**: Telemetry analytics, user account provisioning, department management, dynamic workflow stage hierarchy configuration, and tamper-proof audit log explorer.

2. **Automated Cryptographic Document Engine & QR Verification**:
   - Real server-side PDF document synthesis using `pdfkit`.
   - Embedded scannable QR codes pointing to the public verification endpoint (`/verify/:verificationCode`).
   - Tamper-proof security hashes and institutional stamps.

3. **Dynamic Workflow State Machine**:
   - Workflows are defined per Document Type in the database and can be reconfigured dynamically by the Administrator.

4. **Live Quick-Demo Role Switcher**:
   - Seamlessly switch between **STUDENT**, **FACULTY**, **HOD**, **OFFICE**, and **ADMIN** personas with one click from the top demo bar or login screen.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)

### Setup & Run
Run the backend and frontend concurrently:

```bash
# 1. Backend Setup & Database Seed
cd backend
npm install
npx prisma db push
npx tsx prisma/seed.ts
node --import tsx src/index.ts

# 2. Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and backend API at `http://localhost:5000`.

---

## 🏛️ Dedicated Module Login Portals

Instead of a generic 1-click bypass, each institutional module has its own dedicated, secured login portal with role validation:

| Module Portal | Dedicated Login URL | Default Demo Email | Password | Role Description |
|---|---|---|---|---|
| 🎓 **Student Portal** | [`/login/student`](http://localhost:5173/login/student) | `student@college.edu` | `password123` | Aditya Verma (STU2023001) - Request & Download Documents |
| 👨‍🏫 **Faculty Advisor** | [`/login/faculty`](http://localhost:5173/login/faculty) | `faculty@college.edu` | `password123` | Dr. Priya Sharma - Class Advisor & 1st Stage Reviewer |
| 🏛️ **Department HOD** | [`/login/hod`](http://localhost:5173/login/hod) | `hod@college.edu` | `password123` | Prof. Rajesh Kumar - CSE Head of Department |
| 🏢 **Academic Office** | [`/login/office`](http://localhost:5173/login/office) | `office@college.edu` | `password123` | Ms. Eleanor Vance - Document Officer & PDF Generator |
| 🛡️ **Administrator** | [`/login/admin`](http://localhost:5173/login/admin) | `admin@college.edu` | `password123` | Dr. Arthur Sterling - Workflow & System Governance |
| 🌐 **Portal Gateway** | [`/login`](http://localhost:5173/login) | — | — | Central Institutional Selection Gateway Hub |

---

## 📧 Real-Time Email Notification & Gmail SMTP Engine

CertiFlow automatically dispatches professional, institutional HTML notification emails in real time to recipients' actual mailboxes whenever workflow events occur:

1. **Submission Alert**: Confirms receipt to the Student and alerts the Faculty Advisor of an application awaiting verification.
2. **Workflow Progression**: Notifies the Student when approved by Faculty/HOD and alerts the next reviewer (HOD / Academic Office) to take action.
3. **Correction Alert**: Dispatches remarks and instructions to the Student if documents or details require revision.
4. **Rejection Notice**: Informs the Student with formal reasons if an application is declined.
5. **Document Ready**: Sends congratulations and public verification/download links to the Student once the certified PDF is synthesized.

### ⚙️ How to Connect Your Real Gmail Account:

1. Enable **2-Step Verification** in your Google Account ([myaccount.google.com/security](https://myaccount.google.com/security)).
2. Generate a 16-character **App Password** ([myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)) named `CertiFlow`.
3. Open `backend/.env` and fill in your Gmail credentials:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your.email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM_NAME="CertiFlow Academic Portal"
```
4. *(If credentials are not yet entered, the server automatically runs in Simulation Mode, logging all outgoing email payloads and previews cleanly to the console).*

### 👤 Using Real Emails for Students, HODs, & Staff:

- **Via Top Navigation**: Click on your account badge in the top right corner of the portal to open **"My Account & Live Email Settings"**, enter your real email, and click **Save & Link Email**.
- **Via Admin Portal**: Navigate to `/admin/users` to view the **Live Email Notification Hub**, send instant test emails to verify your SMTP connection, or update any student, faculty, HOD, or office user's email address directly.
- **Via Student/Faculty Self-Registration**: Any new user registering at `/register` can register with their real email and will immediately receive a welcome onboarding email.

---

## 🔥 Firebase Cloud Firestore & Storage Setup


1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** in production or test mode.
3. Download your Service Account Key (`serviceAccountKey.json`) from *Project Settings > Service accounts > Generate new private key* and place it inside the `backend/` folder (or configure `backend/.env` with your Firebase project credentials).
4. Run the Firebase Seeding script:
```bash
npm run seed:firebase
```
5. Configure `frontend/.env` with your Firebase Web client configuration keys from `frontend/.env.example`.

