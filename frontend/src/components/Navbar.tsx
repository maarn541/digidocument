import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { NotificationItem } from '../types';
import {
  GraduationCap,
  Bell,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Layers,
  Sparkles,
  Menu,
  X,
  CheckCheck,
  Award,
  Mail,
  Edit3,
  Building2,
  Building,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile & Real Email modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileEmail, setProfileEmail] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const handleOpenProfile = () => {
    if (!user) return;
    setProfileEmail(user.email || '');
    setProfileName(user.name || '');
    setProfilePhone(user.studentProfile?.phone || '');
    setProfileMsg('');
    setProfileErr('');
    setShowProfileModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileEmail.trim()) return;
    setProfileSaving(true);
    setProfileMsg('');
    setProfileErr('');

    try {
      const res = await api.put('/auth/profile', {
        email: profileEmail.trim(),
        name: profileName.trim(),
        phone: profilePhone.trim()
      });
      setProfileMsg(res.data.message || 'Real email linked successfully!');
      await refreshUser();
      setTimeout(() => {
        setShowProfileModal(false);
      }, 1500);
    } catch (err: any) {
      setProfileErr(err.response?.data?.error || 'Failed to update email');
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Polling for demo reactivity
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT': return '/student/dashboard';
      case 'FACULTY': return '/faculty/dashboard';
      case 'HOD': return '/hod/dashboard';
      case 'OFFICE': return '/office/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/login';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      {/* Top Demo Bar */}
      <div className="bg-gradient-to-r from-brand-700 via-indigo-700 to-purple-800 text-xs px-4 py-1.5 text-slate-100 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-[11px] sm:text-xs">
            Digital Academic Document Workflow System &bull; Live Academic Automation Engine
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[11px] text-indigo-200">Module Portals:</span>
          <div className="flex items-center gap-1">
            {[
              { label: 'Student', path: '/login/student', role: 'STUDENT' },
              { label: 'Faculty', path: '/login/faculty', role: 'FACULTY' },
              { label: 'HOD', path: '/login/hod', role: 'HOD' },
              { label: 'Office', path: '/login/office', role: 'OFFICE' },
              { label: 'Admin', path: '/login/admin', role: 'ADMIN' },
            ].map((m) => (
              <Link
                key={m.label}
                to={m.path}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all ${
                  user?.role === m.role
                    ? 'bg-white text-indigo-900 shadow-sm font-bold scale-105'
                    : 'bg-indigo-950/40 hover:bg-white/20 text-indigo-100'
                }`}
              >
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight flex items-center gap-1.5 font-sans">
                CertiFlow <span className="text-[10px] px-1.5 py-0.5 bg-brand-500/20 text-brand-300 font-medium rounded border border-brand-400/30">NIAT</span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
                Document Workflow & Verification
              </p>
            </div>
          </Link>

          {/* Center Links (if authenticated) */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
              <Link
                to={getDashboardPath()}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname.includes('/dashboard') ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Dashboard
              </Link>
              {user.role === 'STUDENT' && (
                <>
                  <Link
                    to="/student/request"
                    className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    Request Document
                  </Link>
                  <Link
                    to="/student/my-requests"
                    className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    My Requests
                  </Link>
                </>
              )}
              {user.role === 'FACULTY' && (
                <Link
                  to="/faculty/dashboard"
                  className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  Advisor Reviews
                </Link>
              )}
              {user.role === 'HOD' && (
                <Link
                  to="/hod/dashboard"
                  className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  Department Requests
                </Link>
              )}
              {user.role === 'OFFICE' && (
                <Link
                  to="/office/dashboard"
                  className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  Processing Queue
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/documents"
                    className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors flex items-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Documents</span>
                  </Link>
                  <Link
                    to="/admin/users"
                    className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/workflows"
                    className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    Workflows
                  </Link>
                  <Link
                    to="/admin/audit-logs"
                    className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    Audit Logs
                  </Link>
                </>
              )}
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
              <a href="/#features" className="hover:text-white transition-colors">Features</a>
              <a href="/#how-it-works" className="hover:text-white transition-colors">Workflow</a>
              <a href="/#documents" className="hover:text-white transition-colors">Documents</a>
              <a href="/#faq" className="hover:text-white transition-colors">FAQ</a>
              
              {/* Portals Dropdown Menu */}
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white py-1.5 px-2.5 rounded-lg hover:bg-slate-800 transition-all font-semibold"
                >
                  <Building2 className="w-4 h-4 text-brand-400" />
                  <span>Portals</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 hidden group-hover:flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Institutional Access Modules
                  </div>
                  <Link
                    to="/login/student"
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-xs text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-sky-400" />
                      <div>
                        <div className="font-bold">Student Portal</div>
                        <div className="text-[10px] text-slate-400">Request & track certificates</div>
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/login/faculty"
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-xs text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="font-bold">Faculty Portal</div>
                        <div className="text-[10px] text-slate-400">Class advisor endorsement</div>
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/login/hod"
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-xs text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-bold">HOD Portal</div>
                        <div className="text-[10px] text-slate-400">Executive departmental sign-off</div>
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/login/office"
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-xs text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-bold">Academic Office</div>
                        <div className="text-[10px] text-slate-400">PDF synthesis & QR seal engine</div>
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/login/admin"
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-xs text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <div>
                        <div className="font-bold">Admin Portal</div>
                        <div className="text-[10px] text-slate-400">User approvals & audit monitor</div>
                      </div>
                    </div>
                  </Link>
                  <div className="pt-1 mt-1 border-t border-slate-800">
                    <Link
                      to="/login"
                      className="block text-center py-1.5 text-[11px] font-bold text-brand-400 hover:text-brand-300 hover:underline"
                    >
                      View All Portals Overview &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <Link to="/verify" className="hover:text-brand-400 flex items-center gap-1.5 transition-colors font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> QR Verifier
              </Link>
            </div>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                          <Bell className="w-4 h-4 text-brand-600" />
                          Notifications ({notifications.length})
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
                          >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (n.link) navigate(n.link);
                                setShowNotifs(false);
                              }}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                                !n.readStatus ? 'bg-indigo-50/40' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-slate-900">{n.title}</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu Badge with Email Settings */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <button
                    onClick={handleOpenProfile}
                    className="flex items-center gap-2 text-right p-1.5 rounded-xl hover:bg-slate-800/80 transition-all text-left group"
                    title="Click to update real email & profile"
                  >
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors flex items-center justify-end gap-1">
                        <span>{user.name}</span>
                        <Edit3 className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100" />
                      </div>
                      <div className="text-[10px] text-brand-400 font-semibold font-mono truncate max-w-[140px]">
                        {user.email}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={logout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all hidden sm:inline-block"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-600/20 transition-all hover:scale-105"
                >
                  Sign In
                </Link>
                {/* Mobile Menu Toggle Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && !user && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-1 text-sm font-medium text-slate-300">
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white"
              >
                Workflow
              </a>
              <a
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white"
              >
                FAQ
              </a>
              <Link
                to="/verify"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-800 text-emerald-400 font-bold flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> QR Verifier
              </Link>
            </div>

            {/* Portals in Mobile Drawer */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Institutional Portals:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { name: 'Student Portal', path: '/login/student', color: 'text-sky-400' },
                  { name: 'Faculty Portal', path: '/login/faculty', color: 'text-indigo-400' },
                  { name: 'HOD Portal', path: '/login/hod', color: 'text-purple-400' },
                  { name: 'Academic Office', path: '/login/office', color: 'text-emerald-400' },
                  { name: 'Admin Portal', path: '/login/admin', color: 'text-rose-400' },
                ].map((p) => (
                  <Link
                    key={p.name}
                    to={p.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold hover:border-brand-500 text-slate-200 flex items-center gap-1.5"
                  >
                    <span className={`w-2 h-2 rounded-full bg-current ${p.color}`} />
                    <span>{p.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-bold text-amber-300 bg-slate-800 rounded-xl border border-slate-700"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-bold text-white bg-brand-600 rounded-xl"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* User Profile & Real Email Settings Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800 animate-in fade-in zoom-in-95 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-600" />
                My Account & Live Email Settings
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                {user?.role}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Link your <strong>real email address</strong> to this account. All document submissions, stage approvals, remarks, and download links will be dispatched directly to your inbox in real time.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Real Email Address (Receives Notifications)
              </label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="your.real.email@gmail.com"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            {user?.role === 'STUDENT' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            )}

            {profileMsg && (
              <div className="p-2.5 rounded-xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileMsg}</span>
              </div>
            )}

            {profileErr && (
              <div className="p-2.5 rounded-xl text-xs bg-rose-50 text-rose-700 border border-rose-200">
                {profileErr}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {profileSaving ? 'Saving...' : 'Save & Link Email'}
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};
