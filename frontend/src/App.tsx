import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { VerificationPage } from './pages/VerificationPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { RequestDocumentPage } from './pages/student/RequestDocumentPage';
import { MyRequestsPage } from './pages/student/MyRequestsPage';
import { RequestDetailsPage } from './pages/student/RequestDetailsPage';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';

// HOD Pages
import { HodDashboard } from './pages/hod/HodDashboard';

// Academic Office Pages
import { OfficeDashboard } from './pages/office/OfficeDashboard';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { WorkflowConfigPage } from './pages/admin/WorkflowConfigPage';
import { UsersManagementPage } from './pages/admin/UsersManagementPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/:portalRole" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/verify/:verificationCode" element={<VerificationPage />} />

          {/* Shared Request Details / Review Route (Accessible by all roles) */}
          <Route element={<AppLayout allowedRoles={['STUDENT', 'FACULTY', 'HOD', 'OFFICE', 'ADMIN']} />}>
            <Route path="/requests/:id" element={<RequestDetailsPage />} />
            <Route path="/student/requests/:id" element={<RequestDetailsPage />} />
          </Route>

          {/* Student Protected Routes */}
          <Route element={<AppLayout allowedRoles={['STUDENT', 'ADMIN']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/request" element={<RequestDocumentPage />} />
            <Route path="/student/my-requests" element={<MyRequestsPage />} />
          </Route>

          {/* Faculty Protected Routes */}
          <Route element={<AppLayout allowedRoles={['FACULTY', 'ADMIN']} />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/requests/:id" element={<RequestDetailsPage />} />
          </Route>

          {/* HOD Protected Routes */}
          <Route element={<AppLayout allowedRoles={['HOD', 'ADMIN']} />}>
            <Route path="/hod/dashboard" element={<HodDashboard />} />
            <Route path="/hod/requests/:id" element={<RequestDetailsPage />} />
          </Route>

          {/* Office Protected Routes */}
          <Route element={<AppLayout allowedRoles={['OFFICE', 'ADMIN']} />}>
            <Route path="/office/dashboard" element={<OfficeDashboard />} />
            <Route path="/office/requests/:id" element={<RequestDetailsPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<AppLayout allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/documents" element={<AdminDocumentsPage />} />
            <Route path="/admin/users" element={<UsersManagementPage />} />
            <Route path="/admin/workflows" element={<WorkflowConfigPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
