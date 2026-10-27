import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  GraduationCap,
  Award,
  Building2,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  ChevronRight,
  Layers,
  HelpCircle
} from 'lucide-react';

export type PortalKey = 'student' | 'faculty' | 'hod' | 'office' | 'admin';

export interface PortalConfig {
  key: PortalKey;
  role: 'STUDENT' | 'FACULTY' | 'HOD' | 'OFFICE' | 'ADMIN';
  name: string;
  shortName: string;
  badge: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentGradient: string;
  buttonGradient: string;
  borderHover: string;
  bgGlow: string;
  badgeStyle: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  demoEmail: string;
  demoPassword: string;
  demoName: string;
  targetDashboard: string;
  features: string[];
}

export const PORTALS: Record<PortalKey, PortalConfig> = {
  student: {
    key: 'student',
    role: 'STUDENT',
    name: 'Student Academic Portal',
    shortName: 'Student',
    badge: 'Undergraduate & Postgraduate',
    tagline: 'Document Request & Verification Gateway',
    description: 'Apply for official certifications, bonafides, transcripts, and download verified tamper-proof PDFs with scannable QR verification.',
    icon: GraduationCap,
    accentGradient: 'from-sky-500 to-indigo-600',
    buttonGradient: 'from-sky-600 via-indigo-600 to-brand-600 hover:from-sky-500 hover:to-indigo-500',
    borderHover: 'hover:border-sky-500/60',
    bgGlow: 'bg-sky-500/15',
    badgeStyle: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
    identifierLabel: 'Student Register ID or University Email',
    identifierPlaceholder: 'e.g. STU2023001 or student@college.edu',
    demoEmail: 'student@college.edu',
    demoPassword: 'password123',
    demoName: 'Aditya Verma (STU2023001)',
    targetDashboard: '/student/dashboard',
    features: [
      'Apply for Bonafide, Transcripts & Certificates',
      'Live Stage-by-Stage Approval Progress Bar',
      'Download Cryptographically Sealed PDFs'
    ]
  },
  faculty: {
    key: 'faculty',
    role: 'FACULTY',
    name: 'Faculty & Class Advisor Portal',
    shortName: 'Faculty',
    badge: 'Stage-1 Mentor Reviewer',
    tagline: 'Student Record Verification & Advisor Clearance',
    description: 'Review assigned mentee certificate applications, verify academic standing and CGPA records, and approve or request clarifications.',
    icon: Award,
    accentGradient: 'from-indigo-500 to-purple-600',
    buttonGradient: 'from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500',
    borderHover: 'hover:border-indigo-500/60',
    bgGlow: 'bg-indigo-500/15',
    badgeStyle: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
    identifierLabel: 'Faculty ID Code or Academic Email',
    identifierPlaceholder: 'e.g. FAC-CSE-01 or faculty@college.edu',
    demoEmail: 'faculty@college.edu',
    demoPassword: 'password123',
    demoName: 'Dr. Priya Sharma (CSE Dept)',
    targetDashboard: '/faculty/dashboard',
    features: [
      'Review Mentee Certificate Applications',
      'CGPA, Attendance & Course Eligibility Checks',
      'Submit Approval or Request Corrections'
    ]
  },
  hod: {
    key: 'hod',
    role: 'HOD',
    name: 'Head of Department (HOD) Portal',
    shortName: 'HOD',
    badge: 'Departmental Executive Endorsement',
    tagline: 'Department Executive Sign-Off & Clearance',
    description: 'Executive governance portal for department heads to audit faculty recommendations, endorse certificate requisitions, and authorize issuance.',
    icon: Building2,
    accentGradient: 'from-purple-500 to-pink-600',
    buttonGradient: 'from-purple-600 via-pink-600 to-purple-700 hover:from-purple-500 hover:to-pink-500',
    borderHover: 'hover:border-purple-500/60',
    bgGlow: 'bg-purple-500/15',
    badgeStyle: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
    identifierLabel: 'HOD Institutional Email Address',
    identifierPlaceholder: 'e.g. hod@college.edu',
    demoEmail: 'hod@college.edu',
    demoPassword: 'password123',
    demoName: 'Prof. Rajesh Kumar (CSE HOD)',
    targetDashboard: '/hod/dashboard',
    features: [
      'Department-Wide Document Queues',
      'Executive Clearance & Institutional Endorsement',
      'Batch Application Processing'
    ]
  },
  office: {
    key: 'office',
    role: 'OFFICE',
    name: 'Academic Office Portal',
    shortName: 'Academic Office',
    badge: 'Document Issuance & PDF Engine',
    tagline: 'Cryptographic PDF Synthesis & Institutional Seals',
    description: 'Academic office queue for authorized officers to generate official, tamper-proof PDFs with digital signature seals and cryptographic QR codes.',
    icon: FileCheck,
    accentGradient: 'from-emerald-500 to-teal-600',
    buttonGradient: 'from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500',
    borderHover: 'hover:border-emerald-500/60',
    bgGlow: 'bg-emerald-500/15',
    badgeStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    identifierLabel: 'Office Officer Email Address',
    identifierPlaceholder: 'e.g. office@college.edu',
    demoEmail: 'office@college.edu',
    demoPassword: 'password123',
    demoName: 'Ms. Eleanor Vance (Doc Officer)',
    targetDashboard: '/office/dashboard',
    features: [
      'Server-Side PDF Generation with QR Stamp',
      'Digital Signature Seals & Verification Hashes',
      'Document Dispatch & Archival Registry'
    ]
  },
  admin: {
    key: 'admin',
    role: 'ADMIN',
    name: 'University Administrator Portal',
    shortName: 'Administrator',
    badge: 'System Governance & Workflows',
    tagline: 'Workflow Architecture, Users & Audit Telemetry',
    description: 'Central administrative governance portal to configure multi-tier approval state machines, provision user accounts, and review audit telemetry.',
    icon: ShieldAlert,
    accentGradient: 'from-rose-500 to-amber-600',
    buttonGradient: 'from-rose-600 via-amber-600 to-rose-700 hover:from-rose-500 hover:to-amber-500',
    borderHover: 'hover:border-rose-500/60',
    bgGlow: 'bg-rose-500/15',
    badgeStyle: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    identifierLabel: 'Administrator Email Address',
    identifierPlaceholder: 'e.g. admin@college.edu',
    demoEmail: 'admin@college.edu',
    demoPassword: 'password123',
    demoName: 'Dr. Arthur Sterling (System Admin)',
    targetDashboard: '/admin/dashboard',
    features: [
      'Dynamic Multi-Tier Workflow Builder',
      'User Account Roles & Department Provisioning',
      'Tamper-Proof Audit Trail Explorer'
    ]
  }
};

export const LoginPage: React.FC = () => {
  const { portalRole } = useParams<{ portalRole?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  // Normalize role from URL param if valid; otherwise null (shows Gateway selection)
  const normalizedKey = (portalRole?.toLowerCase() || '') as PortalKey;
  const activePortal = PORTALS[normalizedKey] ? PORTALS[normalizedKey] : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get('expired') ? 'Your session has expired. Please sign in again.' : null
  );

  // Clear inputs and errors when switching portals
  useEffect(() => {
    setError(null);
    setEmail('');
    setPassword('');
  }, [portalRole]);

  const handleFillDemo = () => {
    if (!activePortal) return;
    setEmail(activePortal.demoEmail);
    setPassword(activePortal.demoPassword);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your login credentials.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Pass expectedRole if a dedicated portal is being accessed
      const payload: { email: string; password: string; expectedRole?: string } = {
        email,
        password
      };
      if (activePortal) {
        payload.expectedRole = activePortal.role;
      }

      const res = await api.post('/auth/login', payload);
      login(res.data.token, res.data.user);

      // Route to appropriate dashboard
      const role = res.data.user.role;
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'FACULTY') navigate('/faculty/dashboard');
      else if (role === 'HOD') navigate('/hod/dashboard');
      else if (role === 'OFFICE') navigate('/office/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err: any) {
      const serverErr = err.response?.data?.error;
      setError(serverErr || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VIEW 1: Portal Hub / Gateway (No specific portal selected)
  // ==========================================
  if (!activePortal) {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-3/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-brand-300 mb-6 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>

            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Institutional Access Portals
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Select Your Module Portal
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
              To ensure data security and role-specific workflows, each university tier operates on a dedicated authentication portal. Please select your department module below:
            </p>
          </div>

          {/* 5 Portals Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.keys(PORTALS) as PortalKey[]).map((key) => {
              const portal = PORTALS[key];
              const Icon = portal.icon;
              return (
                <div
                  key={key}
                  className={`bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 group hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-900/20 ${portal.borderHover}`}
                >
                  <div>
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${portal.accentGradient} flex items-center justify-center text-white shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${portal.badgeStyle}`}>
                        {portal.badge}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white mt-5 tracking-tight group-hover:text-brand-300 transition-colors">
                      {portal.name}
                    </h2>
                    <p className="text-xs text-brand-400/90 font-medium mt-1">
                      {portal.tagline}
                    </p>
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                      {portal.description}
                    </p>

                    {/* Features list */}
                    <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
                      {portal.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons: Sign In + Create Account */}
                  <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                    <button
                      onClick={() => navigate(`/login/${portal.key}`)}
                      className={`w-full py-2.5 px-4 rounded-xl bg-gradient-to-r ${portal.buttonGradient} text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 group-hover:gap-3`}
                    >
                      <span>Sign In to {portal.shortName} Portal</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <Link
                      to={`/register?role=${portal.role}`}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Create {portal.shortName} Account</span>
                    </Link>
                    <div className="mt-1 text-center text-[10px] text-slate-500 font-mono">
                      Demo: {portal.demoEmail}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick QR Verify Card as extra bonus */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between border-dashed">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white mt-5">Public QR Verifier</h2>
                <p className="text-xs text-emerald-400/90 font-medium mt-1">
                  Independent Document Authenticator
                </p>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Third-party employers, visa authorities, and embassies can verify issued academic credentials instantly without institutional credentials.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Link
                  to="/verify"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verify by QR Code</span>
                </Link>
                <div className="mt-2 text-center text-[10px] text-slate-500 font-mono">
                  No login required &bull; Public access
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: Dedicated Separate Module Login Page
  // ==========================================
  const Icon = activePortal.icon;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-950 relative overflow-hidden">
      {/* Background glow tailored to module accent */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] ${activePortal.bgGlow} rounded-full blur-[140px] pointer-events-none`} />

      <div className="max-w-xl w-full relative z-10 my-4">
        {/* Top Module Selector Bar / Tabs */}
        <div className="mb-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-1.5 flex items-center justify-between gap-1 overflow-x-auto shadow-xl">
          {(Object.keys(PORTALS) as PortalKey[]).map((key) => {
            const p = PORTALS[key];
            const isActive = p.key === activePortal.key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => navigate(`/login/${p.key}`)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? `bg-gradient-to-r ${p.accentGradient} text-white shadow-md shadow-brand-900/40`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{p.shortName}</span>
              </button>
            );
          })}
          <Link
            to="/login"
            className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors whitespace-nowrap"
            title="View All Portals"
          >
            All Portals
          </Link>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Header */}
          <div className="text-center">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${activePortal.accentGradient} flex items-center justify-center text-white mx-auto shadow-xl shadow-brand-500/20`}>
              <Icon className="w-8 h-8" />
            </div>

            <div className="mt-3">
              <span className={`inline-block text-[10px] font-bold px-3 py-0.5 rounded-full border ${activePortal.badgeStyle}`}>
                {activePortal.badge}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              {activePortal.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
              {activePortal.description}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {error.includes('Portal Role Mismatch') && (
                <div className="pt-2 border-t border-rose-500/20 flex items-center justify-end">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-rose-200 underline hover:text-white flex items-center gap-1"
                  >
                    Go to Portal Selection Hub &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {activePortal.identifierLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activePortal.identifierPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl bg-gradient-to-r ${activePortal.buttonGradient} text-white font-bold text-sm shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2 mt-4`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to {activePortal.shortName} Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Module-Specific Links & Demo Assistance */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col gap-3">
            {/* Notice about approval workflow */}
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>First time here?</strong> You must first create an account and have it approved by the University Administrator before logging in.
              </div>
            </div>

            {/* Quick Credential Pre-fill for testing/evaluation */}
            <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="text-left">
                <span className="text-slate-400 block text-[11px]">Testing demo credentials:</span>
                <span className="font-mono text-slate-200 text-xs">{activePortal.demoEmail}</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-3 py-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-brand-300 hover:text-white font-semibold text-xs border border-slate-600 transition-colors flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Fill Credentials</span>
              </button>
            </div>

            {/* Create Account link for ALL portals */}
            <div className="text-center text-xs text-slate-300 bg-slate-800/40 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-slate-400">Don't have an account yet?</span>
              <Link 
                to={`/register?role=${activePortal.role}`} 
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-300 hover:text-white bg-brand-600/30 hover:bg-brand-600/50 px-3 py-1.5 rounded-xl border border-brand-500/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Create {activePortal.shortName} Account
              </Link>
            </div>

            {/* Back link */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <Link to="/login" className="hover:text-slate-200 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Switch Portal
              </Link>
              <Link to="/verify" className="hover:text-brand-300 flex items-center gap-1 transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Public QR Verifier
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
