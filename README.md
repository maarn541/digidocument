# 🎓 Digital Academic Document Workflow System (CertiFlow)

A role-based university academic document management platform that streamlines document requests, multi-level approvals, PDF generation, email notifications, and public QR-code verification.

## 🌟 Key Features

### 1. Role-Based Workflows

The system supports five institutional roles:

* **Student:** Submit requests for Bonafide Certificates, Official Transcripts, Recommendation Letters, and Course Completion Certificates. Track application progress and download issued documents.
* **Faculty / Class Advisor:** Review student eligibility, attendance, and CGPA. Approve, reject, or request corrections.
* **Head of Department (HOD):** Review applications and provide departmental approval.
* **Academic Office / Document Officer:** Process approved requests, generate official PDF documents, and issue certificates.
* **University Administrator:** Manage users, departments, workflow configurations, system analytics, and audit logs.

### 2. Automated PDF Generation and QR Verification

* Generate PDF documents on the server using `pdfkit`.
* Include QR codes that direct users to public document verification pages.
* Generate verification codes and security hashes for document verification.
* Include institutional stamps and document details where configured.

### 3. Dynamic Workflow Management

* Configure approval stages for different document types.
* Support multi-level approval workflows.
* Track application status and approval progression.
* Allow administrators to configure workflow stages dynamically, where supported by the implementation.

### 4. Role-Based Login Portals

Dedicated login portals are available for each institutional role.

| Module                 | Login Route      | Role                    |
| ---------------------- | ---------------- | ----------------------- |
| Student Portal         | `/login/student` | Student                 |
| Faculty Portal         | `/login/faculty` | Faculty / Class Advisor |
| HOD Portal             | `/login/hod`     | Head of Department      |
| Academic Office Portal | `/login/office`  | Document Officer        |
| Administrator Portal   | `/login/admin`   | Administrator           |
| Portal Gateway         | `/login`         | Central login gateway   |

The application also supports a demonstration role switcher where configured.

### 5. Real-Time Email Notifications

CertiFlow supports email notifications for important application events:

* **Submission Alert:** Confirms receipt of an application and notifies the relevant reviewer.
* **Workflow Progression:** Notifies students when applications advance to another approval stage.
* **Correction Alert:** Informs students when changes or additional information are required.
* **Rejection Notice:** Communicates application rejection and the associated remarks.
* **Document Ready:** Notifies students when an approved document is available.

Email functionality depends on the backend SMTP configuration.

---

## 🛠️ Technology Stack

The project includes a frontend and backend application.

* **Frontend:** Web application built with the technologies configured in the `frontend` directory.
* **Backend:** Node.js application.
* **Database:** Prisma-compatible database configuration.
* **PDF Generation:** PDFKit.
* **Email Notifications:** Gmail SMTP or another supported SMTP configuration.
* **Firebase Integration:** Cloud Firestore and Firebase Storage, where configured.
* **Document Verification:** QR codes and verification endpoints.

Refer to the project files and package manifests for the exact framework versions and dependencies.

---

## 📋 Prerequisites

Install the following before running the project:

* Node.js 18 or later, subject to the requirements of the installed dependencies.
* npm.
* Git.
* A compatible database configured for Prisma.
* A Firebase project if Firebase features are required.
* Gmail SMTP credentials or another SMTP service if real email notifications are required.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/maarn541/digidocument.git
```

Navigate into the project directory:

```bash
cd digidocument
```

If the repository has a different name or location, use its corresponding URL and directory name.

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment Variables

Create a `.env` file inside the `backend` directory using the project's environment-variable template, if available.

Configure the required database connection and other settings according to the backend implementation.

For example, an SMTP configuration may look like this:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your.email@gmail.com
SMTP_PASS=your_google_app_password
SMTP_FROM_NAME="CertiFlow Academic Portal"
```

Use the actual variable names required by the application. Never commit real passwords, API keys, database credentials, or private service-account keys.

### 4. Configure the Database

If the project uses Prisma, configure its database connection in the appropriate environment file.

Run:

```bash
npx prisma db push
```

If the project includes a Prisma seed script, initialize demonstration data using:

```bash
npx tsx prisma/seed.ts
```

Run these commands from the `backend` directory.

### 5. Start the Backend

If the project supports the following development command, run:

```bash
node --import tsx src/index.ts
```

Otherwise, use the appropriate start script defined in `backend/package.json`.

The backend API is configured to use port `5000` in the documented local setup.

### 6. Install Frontend Dependencies

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create the frontend environment file if required. Use `frontend/.env.example` as a reference when available.

### 7. Start the Frontend

```bash
npm run dev
```

In the documented local configuration, the frontend is available at:

**Frontend:** http://localhost:5173

**Backend API:** http://localhost:5000

These addresses may differ if the application is configured to use other ports.

---

## 🔐 Dedicated Module Login Portals

The application provides separate login routes for institutional roles.

| Portal          | Route            | Purpose                                       |
| --------------- | ---------------- | --------------------------------------------- |
| Student         | `/login/student` | Submit requests and access issued documents   |
| Faculty         | `/login/faculty` | Review student applications                   |
| HOD             | `/login/hod`     | Provide departmental approval                 |
| Academic Office | `/login/office`  | Process approved requests and issue documents |
| Administrator   | `/login/admin`   | Manage users and system workflows             |
| Login Gateway   | `/login`         | Access the institutional login interface      |

### Demonstration Accounts

The original project documentation describes the following sample accounts:

| Role            | Demo Email            | Password      |
| --------------- | --------------------- | ------------- |
| Student         | `student@college.edu` | `password123` |
| Faculty         | `faculty@college.edu` | `password123` |
| HOD             | `hod@college.edu`     | `password123` |
| Academic Office | `office@college.edu`  | `password123` |
| Administrator   | `admin@college.edu`   | `password123` |

These are example credentials from the project documentation. They will work only if the corresponding accounts have been created and configured in the application.

**Security note:** Use demonstration credentials only in a local development environment. Never use default demonstration passwords for real institutional accounts.

---

## 📧 Gmail SMTP Configuration

CertiFlow can be configured to send email notifications to actual email addresses.

### 1. Enable Two-Step Verification

Enable two-step verification in the Google Account that will be used for sending emails.

Google Account security settings:

https://myaccount.google.com/security

### 2. Generate an App Password

If Google makes App Passwords available for the account, generate one for the application.

https://myaccount.google.com/apppasswords

### 3. Configure the Backend

Add the SMTP configuration to `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your.email@gmail.com
SMTP_PASS=your_google_app_password
SMTP_FROM_NAME="CertiFlow Academic Portal"
```

Use the exact environment-variable names expected by the backend.

### 4. Verify Email Functionality

Restart the backend after configuring the environment variables.

Test the email functionality using the application's supported test-email feature, if available.

If SMTP credentials are not configured, the application may support a simulation mode, depending on the backend implementation.

---

## 🔥 Firebase Cloud Firestore and Storage Setup

Firebase can be configured for supported cloud database and storage functionality.

### 1. Create a Firebase Project

Open the Firebase Console:

https://console.firebase.google.com/

Create a project or select an existing project.

### 2. Enable Required Services

Enable Firestore Database and configure Firebase Storage if the application uses them.

Review the security rules before making any service accessible to real users.

### 3. Configure Service Credentials

If the backend uses Firebase Admin SDK authentication, generate a service-account key through the Firebase project settings and configure it securely.

Never upload the private service-account key to GitHub.

Store sensitive credentials outside source control and follow the application's supported configuration method.

### 4. Configure Firebase Environment Variables

Use the provided environment-variable templates, if available, to configure the Firebase settings required by the frontend and backend.

### 5. Initialize Firebase Data

If the project provides the corresponding npm script, run:

```bash
npm run seed:firebase
```

Execute the command from the directory containing the relevant script.

The exact Firebase setup and seeding steps depend on the implementation included in the repository.

---

## 📄 Document Verification

CertiFlow is designed to support public verification of issued academic documents.

The documented verification route follows this pattern:

```text
/verify/:verificationCode
```

A typical verification process is:

1. An authorized staff member approves a document request.
2. The system generates the document when the request reaches the appropriate stage.
3. A verification code and QR code are associated with the issued document.
4. A person scans the QR code or opens the verification URL.
5. The verification page checks the document using the application's verification logic.

Actual verification behavior depends on the backend implementation.

---

## 🛡️ Security Considerations

* Never commit `.env` files containing secrets.
* Never commit Firebase service-account private keys.
* Store credentials securely using environment variables or an appropriate secrets manager.
* Restrict access to administrative functions and document-generation endpoints.
* Configure database permissions and Firebase security rules carefully.
* Protect student information and issued documents from unauthorized access.
* Use HTTPS and secure deployment settings in production.
* Replace demonstration credentials before deployment.
* Validate user input and enforce role-based authorization on the server.
* Ensure document-verification endpoints reveal only information intended for public access.

---

## 📁 Project Structure

The main project is organized into separate frontend and backend directories.

```text
DIGITAL ACADEMIC CERTIFICATION VERIFYING PROJECT/
│
├── backend/
│   ├── prisma/
│   │   └── seed.ts
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

This is a representative structure based on the documented setup commands. Additional directories and files may exist in the actual project.

---

## 🧪 Troubleshooting

### Backend Does Not Start

* Confirm that Node.js and npm are installed.
* Run `npm install` inside the backend directory.
* Check the backend environment variables.
* Verify that the database is available and correctly configured.
* Review the terminal error messages.

### Frontend Does Not Start

* Run `npm install` inside the frontend directory.
* Check the frontend environment variables.
* Confirm that the required port is available.
* Review the frontend terminal output.

### Database Errors

* Verify the database connection settings.
* Confirm that the configured database is running and accessible.
* Run `npx prisma db push` from the backend directory if appropriate for the project.

### Email Notifications Do Not Work

* Check the SMTP host and port.
* Verify the SMTP username and app password.
* Confirm that the backend loads the expected environment variables.
* Review the backend logs for SMTP errors.

### Firebase Errors

* Verify the Firebase project configuration.
* Confirm that the required Firebase services are enabled.
* Check the permissions and configuration of the credentials.
* Never expose private service-account credentials in logs or public repositories.

---

## 🔮 Future Enhancements

Potential future improvements include:

* Advanced application analytics and reporting.
* More comprehensive document audit trails.
* Additional institutional document types.
* Improved document templates and digital-signature integration.
* Enhanced notification preferences.
* Expanded accessibility and mobile responsiveness.
* Production deployment and monitoring improvements.

These are potential enhancements and may not all be implemented in the current version.

---

## 👨‍💻 Project Information

**Project Name:** Digital Academic Document Workflow System

**Project Short Name:** CertiFlow

**Purpose:** To simplify academic document requests, streamline approval workflows, improve document accessibility, and support digital verification.

---

## 📜 License

No license has been specified in this README. Add an appropriate license if the project is intended to be distributed or reused publicly.
