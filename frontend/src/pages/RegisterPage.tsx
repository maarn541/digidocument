import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Award,
  User,
  Mail,
  Lock,
  Building,
  GraduationCap,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Clock,
  ArrowLeft
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<any[]>([]);
  const initialRole = (searchParams.get('role')?.toUpperCase() || 'STUDENT') as 'STUDENT' | 'FACULTY' | 'HOD' | 'OFFICE' | 'ADMIN';
  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | 'HOD' | 'OFFICE' | 'ADMIN'>(
    ['STUDENT', 'FACULTY', 'HOD', 'OFFICE', 'ADMIN'].includes(initialRole) ? initialRole : 'STUDENT'
  );

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [currentYear, setCurrentYear] = useState('3');
  const [currentSemester, setCurrentSemester] = useState('5');
  const [phone, setPhone] = useState('');
  const [academicBatch, setAcademicBatch] = useState('2023-2027');
  const [advisorId, setAdvisorId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ name: string; email: string; role: string } | null>(null);

  const DEFAULT_DEPTS = [
    {
      id: 'cse-dept',
      name: 'Computer Science and Engineering',
      code: 'CSE',
      courses: [{ id: 'cse-course', name: 'B.Tech in Computer Science and Engineering' }],
      faculty: [{ id: 'fac-1', designation: 'Class Advisor', user: { name: 'Dr. Priya Sharma' } }]
    },
    {
      id: 'it-dept',
      name: 'Information Technology',
      code: 'IT',
      courses: [{ id: 'it-course', name: 'B.Tech in Information Technology' }],
      faculty: [{ id: 'fac-2', designation: 'Assistant Professor', user: { name: 'Prof. Amit Verma' } }]
    },
    {
      id: 'ece-dept',
      name: 'Electronics and Communication Engineering',
      code: 'ECE',
      courses: [{ id: 'ece-course', name: 'B.Tech in Electronics & Communication' }],
      faculty: []
    }
  ];

  useEffect(() => {
    fetchAcademicMeta();
  }, []);

  const fetchAcademicMeta = async () => {
    try {
      const res = await api.get('/auth/academic-meta');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setDepartments(res.data);
        setDepartmentId(res.data[0].id);
        if (res.data[0].courses && res.data[0].courses.length > 0) {
          setCourseId(res.data[0].courses[0].id);
        }
        if (res.data[0].faculty && res.data[0].faculty.length > 0) {
          setAdvisorId(res.data[0].faculty[0].id);
        }
      } else {
        setDepartments(DEFAULT_DEPTS);
        setDepartmentId(DEFAULT_DEPTS[0].id);
        setCourseId(DEFAULT_DEPTS[0].courses[0].id);
      }
    } catch (err) {
      console.error('Failed to load academic metadata, using defaults', err);
      setDepartments(DEFAULT_DEPTS);
      setDepartmentId(DEFAULT_DEPTS[0].id);
      setCourseId(DEFAULT_DEPTS[0].courses[0].id);
    }
  };

  const handleDeptChange = (deptId: string) => {
    setDepartmentId(deptId);
    const dept = departments.find((d) => d.id === deptId);
    if (dept?.courses && dept.courses.length > 0) {
      setCourseId(dept.courses[0].id);
    } else {
      setCourseId('');
    }
    if (dept?.faculty && dept.faculty.length > 0) {
      setAdvisorId(dept.faculty[0].id);
    } else {
      setAdvisorId('');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        departmentId,
        courseId: role === 'STUDENT' ? courseId : undefined,
        studentIdNumber: role === 'STUDENT' ? studentIdNumber : undefined,
        currentYear: role === 'STUDENT' ? currentYear : undefined,
        currentSemester: role === 'STUDENT' ? currentSemester : undefined,
        academicBatch: role === 'STUDENT' ? academicBatch : undefined,
        phone,
        advisorId: role === 'STUDENT' ? advisorId : undefined,
        designation: role !== 'STUDENT' ? designation : undefined,
      };

      const res = await api.post('/auth/register', payload);
      setSuccessInfo({
        name,
        email,
        role,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDeptObj = departments.find((d) => d.id === departmentId);

  // Success Confirmation Screen (Awaiting Admin Approval)
  if (successInfo) {
    const portalKeyMap: Record<string, string> = {
      STUDENT: 'student',
      FACULTY: 'faculty',
      HOD: 'hod',
      OFFICE: 'office',
      ADMIN: 'admin'
    };
    const targetPortalKey = portalKeyMap[successInfo.role] || 'student';

    return (
      <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-xl w-full bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <span className="inline-block mt-4 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Account Registration Submitted &bull; Pending Approval
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
            Awaiting Administrator Approval
          </h1>

          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            Welcome, <strong className="text-white">{successInfo.name}</strong>! Your account has been created for the <strong className="text-amber-300">{successInfo.role} Portal</strong> with email <span className="font-mono text-amber-200">{successInfo.email}</span>.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left text-xs text-amber-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <Sparkles className="w-4 h-4" /> Why can't I log in immediately?
            </div>
            <p className="text-slate-300 leading-relaxed">
              As per university governance security policies, all new accounts across every portal must first be <strong>approved by the University Administrator</strong> before granting system access.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Once the administrator endorses your profile in the User Directory, your account status will transition to <strong className="text-emerald-400">ACTIVE</strong> and you will be able to log in.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to={`/login/${targetPortalKey}`}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Sign In Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Portals</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-2xl w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/20">
            <Award className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-4 tracking-tight">
            Create Real Institutional Account
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Register with your real college email ID. Accounts require Administrator approval before sign-in.
          </p>

          {/* Portal Role Selector (All 5 Roles) */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-slate-800/90 rounded-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => { setRole('STUDENT'); setDesignation('Student'); }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                role === 'STUDENT'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('FACULTY'); setDesignation('Assistant Professor'); }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                role === 'FACULTY'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Faculty</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('HOD'); setDesignation('Head of Department'); }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                role === 'HOD'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>HOD</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('OFFICE'); setDesignation('Registrar / Officer'); }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                role === 'OFFICE'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Office</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('ADMIN'); setDesignation('System Administrator'); }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                role === 'ADMIN'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Johnathan Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Real Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com or student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Department & Course Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Department <span className="text-rose-400">*</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) => handleDeptChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                required
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            {role === 'STUDENT' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Degree Program / Course <span className="text-rose-400">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  required
                >
                  {selectedDeptObj?.courses?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  )) || <option value="">No courses available</option>}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Designation / Title
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder={
                    role === 'HOD' ? 'Head of Department' :
                    role === 'OFFICE' ? 'Senior Administrative Officer / Registrar' :
                    role === 'ADMIN' ? 'University System Administrator' :
                    'Assistant Professor / Class Advisor'
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            )}
          </div>

          {/* Student Specific Fields */}
          {role === 'STUDENT' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Student ID / Roll Number
                  </label>
                  <input
                    type="text"
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    placeholder="e.g. 23CSE045 (Auto-generated if empty)"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Current Standing
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={currentYear}
                      onChange={(e) => setCurrentYear(e.target.value)}
                      className="px-2 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                    <select
                      value={currentSemester}
                      onChange={(e) => setCurrentSemester(e.target.value)}
                      className="px-2 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    >
                      <option value="1">Sem 1</option>
                      <option value="2">Sem 2</option>
                      <option value="3">Sem 3</option>
                      <option value="4">Sem 4</option>
                      <option value="5">Sem 5</option>
                      <option value="6">Sem 6</option>
                      <option value="7">Sem 7</option>
                      <option value="8">Sem 8</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Academic Batch
                  </label>
                  <input
                    type="text"
                    value={academicBatch}
                    onChange={(e) => setAcademicBatch(e.target.value)}
                    placeholder="2023-2027"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Assigned Faculty / Class Advisor
                  </label>
                  <select
                    value={advisorId}
                    onChange={(e) => setAdvisorId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="">Select Advisor (Optional)</option>
                    {selectedDeptObj?.faculty?.map((f: any) => (
                      <option key={f.id} value={f.id}>
                        {f.user?.name} ({f.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Contact Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Complete Real Account Registration <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
