import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Send,
  Edit2,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';

export const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Email SMTP state
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Edit user email modal
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editEmailValue, setEditEmailValue] = useState('');
  const [editEmailLoading, setEditEmailLoading] = useState(false);
  const [editEmailError, setEditEmailError] = useState('');

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('STUDENT');
  const [departmentId, setDepartmentId] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchData();
    fetchEmailStatus();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/departments')
      ]);
      setUsers(usersRes.data);
      setDepartments(deptsRes.data);
      if (deptsRes.data.length > 0) {
        setDepartmentId(deptsRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load user management', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailStatus = async () => {
    try {
      const res = await api.get('/admin/email-status');
      setEmailStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch email status', err);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailInput.trim()) return;
    setTestSending(true);
    setTestResult(null);

    try {
      const res = await api.post('/admin/test-email', { email: testEmailInput.trim() });
      setTestResult({
        success: true,
        message: res.data.message || 'Live test email dispatched successfully!'
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.error || err.message || 'Failed to dispatch test email'
      });
    } finally {
      setTestSending(false);
    }
  };

  const handleOpenEditEmail = (user: any) => {
    setEditingUser(user);
    setEditEmailValue(user.email);
    setEditEmailError('');
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editEmailValue.trim()) return;

    setEditEmailLoading(true);
    setEditEmailError('');

    try {
      await api.put(`/admin/users/${editingUser.id}/email`, { email: editEmailValue.trim() });
      setUsers(prev =>
        prev.map(u => (u.id === editingUser.id ? { ...u, email: editEmailValue.trim() } : u))
      );
      setEditingUser(null);
    } catch (err: any) {
      setEditEmailError(err.response?.data?.error || 'Failed to update user email');
    } finally {
      setEditEmailLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const selectedDept = departments.find(d => d.id === departmentId);
      const courseId = selectedDept?.courses?.[0]?.id || '';

      await api.post('/admin/users', {
        name,
        email,
        password,
        role,
        departmentId,
        studentIdNumber: role === 'STUDENT' ? studentIdNumber || `STU${Date.now().toString().slice(-4)}` : undefined,
        courseId: role === 'STUDENT' ? courseId : undefined
      });

      setShowAddModal(false);
      setName('');
      setEmail('');
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create user');
    } finally {
      setModalLoading(false);
    }
  };

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    setUpdatingStatusId(userId);
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: newStatus } : u)));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.studentProfile?.studentIdNumber?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  const pendingApprovalsCount = users.filter(u => u.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Institutional User & Email Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage student credentials, faculty advisors, HODs, and configure real-time notification email delivery.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Provision New User
        </button>
      </div>

      {/* Real-time Gmail SMTP Dispatcher Hub Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-extrabold tracking-wide text-brand-300 flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> Real-time Email Notification Engine
              </span>
              {emailStatus?.configured ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Gmail SMTP Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Simulation Mode (Console Logs)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When documents are requested, approved by Faculty, endorsed by HOD, or synthesized by the Academic Office, CertiFlow dispatches instant, styled HTML notification emails directly to recipients' inboxes.
            </p>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
              <span>Host: <strong className="text-slate-200">{emailStatus?.smtpHost || 'smtp.gmail.com'}</strong></span>
              <span>Port: <strong className="text-slate-200">{emailStatus?.smtpPort || '465'}</strong></span>
              <span>Sender: <strong className="text-slate-200">{emailStatus?.smtpUser || '(None in backend/.env)'}</strong></span>
            </div>
          </div>

          {/* Test Email Dispatch Form */}
          <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/80 w-full lg:w-96 shrink-0 space-y-3">
            <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>Send Live Email Test</span>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[10px] text-brand-300 hover:text-brand-200 underline flex items-center gap-1"
              >
                <Info className="w-3 h-3" /> Setup Guide
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  placeholder="Enter your real email..."
                  required
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={testSending}
                  className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                >
                  {testSending ? (
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Test</span>
                </button>
              </div>
            </form>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl text-[11px] flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800'
                    : 'bg-rose-950/60 text-rose-200 border border-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="leading-tight">{testResult.message}</div>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Setup Instructions */}
        {showGuide && (
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <span>🔑 How to link your real Gmail account (2 Minutes):</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
              <li>Go to your Google Account at <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-brand-300 underline">myaccount.google.com/security</a></li>
              <li>Make sure <strong>2-Step Verification</strong> is enabled.</li>
              <li>Search for or open <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-brand-300 underline">App Passwords</a>.</li>
              <li>Create a new App Password named <strong>"CertiFlow"</strong> and copy the 16-character code.</li>
              <li>Open <code className="bg-slate-800 px-1.5 py-0.5 rounded text-brand-300">backend/.env</code> and set:
                <pre className="mt-1 p-2 bg-slate-950 rounded-lg text-emerald-400 font-mono text-[10px] overflow-x-auto">
SMTP_USER=yourname@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx</pre>
              </li>
              <li>That's it! Real emails will now immediately deliver to students, faculty, and HODs.</li>
            </ol>
          </div>
        )}
      </div>

      {/* Pending Approvals Attention Banner */}
      {pendingApprovalsCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5 text-amber-950">
                <span>{pendingApprovalsCount} New Account Registration{pendingApprovalsCount > 1 ? 's' : ''} Awaiting Your Approval</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-black animate-pulse">Action Required</span>
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Users who created an account across portals must be approved before they can log in.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setStatusFilter('PENDING_APPROVAL'); }}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap self-end sm:self-center"
          >
            Review Pending Users ({pendingApprovalsCount})
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name, email, or Student ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval ({pendingApprovalsCount})</option>
            <option value="ACTIVE">Active</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="FACULTY">Faculty Advisors</option>
            <option value="HOD">HODs</option>
            <option value="OFFICE">Academic Office</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Name & ID</th>
                  <th className="py-3.5 px-6">Email Address (Live Recipient)</th>
                  <th className="py-3.5 px-6">System Role</th>
                  <th className="py-3.5 px-6">Affiliation / Dept</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredUsers.map((u) => {
                  let roleBadge = 'bg-slate-100 text-slate-700';
                  if (u.role === 'STUDENT') roleBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                  else if (u.role === 'FACULTY') roleBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  else if (u.role === 'HOD') roleBadge = 'bg-purple-50 text-purple-700 border-purple-200';
                  else if (u.role === 'OFFICE') roleBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  else if (u.role === 'ADMIN') roleBadge = 'bg-rose-50 text-rose-700 border-rose-200';

                  const dept =
                    u.studentProfile?.department?.name ||
                    u.facultyProfile?.department?.name ||
                    'University Wide';

                  const isGmail = u.email.endsWith('@gmail.com');

                    let statusBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                    if (u.status === 'ACTIVE') {
                      statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                    } else if (u.status === 'PENDING_APPROVAL') {
                      statusBadge = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                    } else if (u.status === 'REJECTED') {
                      statusBadge = 'bg-rose-100 text-rose-800 border-rose-200';
                    } else if (u.status === 'SUSPENDED') {
                      statusBadge = 'bg-red-100 text-red-800 border-red-200';
                    }

                    const isUpdating = updatingStatusId === u.id;

                    return (
                      <tr 
                        key={u.id} 
                        className={`transition-colors ${
                          u.status === 'PENDING_APPROVAL' ? 'bg-amber-50/50 hover:bg-amber-50/80' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          {u.studentProfile && (
                            <div className="text-[11px] font-mono text-brand-700">
                              {u.studentProfile.studentIdNumber}
                            </div>
                          )}
                          {u.facultyProfile && (
                            <div className="text-[11px] font-mono text-indigo-600">
                              {u.facultyProfile.facultyCode}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-800 font-medium">{u.email}</span>
                            {isGmail && (
                              <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.2 rounded font-semibold">
                                Gmail
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Receives automated notifications
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadge}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600">{dept}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-flex items-center gap-1.5 ${statusBadge}`}>
                            {u.status === 'PENDING_APPROVAL' && <Clock className="w-3 h-3 text-amber-700 animate-pulse" />}
                            {u.status === 'ACTIVE' && <Check className="w-3 h-3 text-emerald-600" />}
                            {u.status === 'REJECTED' && <XCircle className="w-3 h-3 text-rose-600" />}
                            {u.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* If Pending Approval, show prominent Approve & Reject buttons */}
                            {u.status === 'PENDING_APPROVAL' && (
                              <>
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleStatusUpdate(u.id, 'ACTIVE')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition-all disabled:opacity-50"
                                  title="Approve user registration"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleStatusUpdate(u.id, 'REJECTED')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all disabled:opacity-50"
                                  title="Reject user registration"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            )}

                            {u.status === 'ACTIVE' && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(u.id, 'SUSPENDED')}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Suspend account"
                              >
                                Suspend
                              </button>
                            )}

                            {u.status === 'SUSPENDED' && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(u.id, 'ACTIVE')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Reactivate account"
                              >
                                Reactivate
                              </button>
                            )}

                            {u.status === 'REJECTED' && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(u.id, 'ACTIVE')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all"
                                title="Approve this rejected account"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEditEmail(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors ml-1"
                              title="Change user email to real address"
                            >
                              <Edit2 className="w-3 h-3" /> Email
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Email Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEmail}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-600" />
                Update Real Email Address
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {editingUser.role}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Update <strong>{editingUser.name}</strong>'s email to a real Gmail or active inbox. All future workflow alerts will be dispatched in real-time to this address.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Email Address
              </label>
              <input
                type="email"
                value={editEmailValue}
                onChange={(e) => setEditEmailValue(e.target.value)}
                placeholder="e.g. realname@gmail.com"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            {editEmailError && (
              <div className="p-2.5 rounded-xl text-xs bg-rose-50 text-rose-700 border border-rose-200">
                {editEmailError}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editEmailLoading}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                {editEmailLoading ? 'Saving...' : 'Save & Link Email'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-900">Provision New Institutional User</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Johnathan Doe"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Real Inbox)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                A welcome email with login credentials will be automatically dispatched to this address.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty / Advisor</option>
                  <option value="HOD">Head of Department (HOD)</option>
                  <option value="OFFICE">Academic Office</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {role === 'STUDENT' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student ID / Roll Number</label>
                <input
                  type="text"
                  value={studentIdNumber}
                  onChange={(e) => setStudentIdNumber(e.target.value)}
                  placeholder="STU2026..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                required
              />
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow"
              >
                {modalLoading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
