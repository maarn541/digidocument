import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  Award,
  Users,
  User,
  Building,
  GraduationCap,
  FileCheck,
  Mail,
  HelpCircle,
  CheckSquare
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const modulePortals = [
    {
      role: 'student',
      title: 'Student Portal',
      subtitle: 'Aditya Verma (STU2023001)',
      desc: 'Submit requests, track live stages & download verified PDFs.',
      path: '/login/student',
      badge: 'Student Access',
      color: 'text-sky-400',
      badgeColor: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      borderColor: 'hover:border-sky-500/60'
    },
    {
      role: 'faculty',
      title: 'Faculty Advisor',
      subtitle: 'Dr. Priya Sharma',
      desc: 'Mentee verification, CGPA checks & stage-1 endorsements.',
      path: '/login/faculty',
      badge: 'Mentor Review',
      color: 'text-indigo-400',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      borderColor: 'hover:border-indigo-500/60'
    },
    {
      role: 'hod',
      title: 'Department HOD',
      subtitle: 'Prof. Rajesh Kumar',
      desc: 'Department executive review & clearance authorization.',
      path: '/login/hod',
      badge: 'Executive Sign-Off',
      color: 'text-purple-400',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      borderColor: 'hover:border-purple-500/60'
    },
    {
      role: 'office',
      title: 'Academic Office',
      subtitle: 'Ms. Eleanor Vance',
      desc: 'PDF generation engine, digital seals & document issuance.',
      path: '/login/office',
      badge: 'PDF Engine & Seals',
      color: 'text-emerald-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      borderColor: 'hover:border-emerald-500/60'
    },
    {
      role: 'admin',
      title: 'Administrator',
      subtitle: 'Dr. Arthur Sterling',
      desc: 'Workflow configuration, user roles & tamper-proof audit trail.',
      path: '/login/admin',
      badge: 'Governance & Audits',
      color: 'text-rose-400',
      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      borderColor: 'hover:border-rose-500/60'
    }
  ];

  const documentTypes = [
    { title: 'Bonafide Certificate', desc: 'Instant student bonafide verification for bank loans, visas, and concessions.', days: '1-2 Days', icon: Award, tag: 'Most Requested' },
    { title: 'Official Transcript', desc: 'Consolidated semester marks, credit records, GPA calculation, and Dean seal.', days: '3-4 Days', icon: GraduationCap, tag: 'Official' },
    { title: 'Recommendation Letter', desc: 'Faculty endorsed appraisal letter for research fellowships and graduate admissions.', days: '2-3 Days', icon: FileCheck, tag: 'Academic' },
    { title: 'Course Completion', desc: 'Attestation of complete coursework and laboratory degree requirements.', days: '4-5 Days', icon: CheckCircle2, tag: 'Graduation' },
    { title: 'No Due Certificate', desc: 'Automated multi-department clearance across Library, Labs, and Accounts.', days: '2-3 Days', icon: ShieldCheck, tag: 'Clearance' },
    { title: 'Conduct & Character', desc: 'Disciplinary clearance verifying exemplary student conduct on campus.', days: '1-2 Days', icon: Zap, tag: 'Certification' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-brand-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/30 text-brand-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            University Academic Workflow Automation 2.0
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight">
            Digital Academic Document <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Workflow & Verification System
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminate long queues and paper forms. Request, verify, approve, digitally sign, and download official university credentials with tamper-proof cryptographic QR verification.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-brand-600/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              Select Portal to Sign In
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <User className="w-5 h-5" />
              Register Real Account
            </Link>
            <Link
              to="/verify"
              className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-base transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Verify Document by QR
            </Link>
          </div>

          {/* Dedicated Module Login Portals */}
          <div className="mt-14 max-w-5xl mx-auto p-6 bg-slate-800/60 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-700">
              <div className="text-left">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand-400" />
                  Dedicated Module Login Portals
                </h2>
                <p className="text-xs text-slate-400">
                  Select your institutional module to access its dedicated secure login screen:
                </p>
              </div>
              <Link
                to="/login"
                className="text-[11px] font-semibold px-2.5 py-1 bg-brand-900/60 text-brand-300 border border-brand-500/30 rounded-lg hover:bg-brand-800/80 transition-colors"
              >
                View All Portals &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
              {modulePortals.map((m) => (
                <div
                  key={m.role}
                  className={`p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 ${m.borderColor} text-left transition-all group flex flex-col justify-between`}
                >
                  <div>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded border mb-2 ${m.badgeColor}`}>
                      {m.badge}
                    </span>
                    <div className={`${m.color} font-bold text-xs group-hover:underline`}>{m.title}</div>
                    <div className="text-[11px] text-slate-300 font-medium mt-0.5">{m.subtitle}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-snug">{m.desc}</div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5">
                    <Link
                      to={m.path}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 group-hover:bg-brand-600 text-slate-200 group-hover:text-white text-[11px] font-bold border border-slate-700 group-hover:border-brand-500 transition-all flex items-center justify-center gap-1"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      to={`/register?role=${m.role}`}
                      className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white text-[10px] font-semibold border border-slate-700/80 transition-all"
                      title={`Register a new ${m.title} account`}
                    >
                      Register
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white">How CertiFlow Works</h2>
            <p className="mt-3 text-slate-400 text-base">
              A streamlined, fully automated 5-step pipeline from initial request to verified graduation delivery.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { num: '01', title: 'Submit Request', desc: 'Student selects document type, specifies purpose, and uploads prerequisites.' },
              { num: '02', title: 'Advisor Review', desc: 'Assigned Class Advisor verifies student records, CGPA, and course credentials.' },
              { num: '03', title: 'HOD Approval', desc: 'Head of Department conducts department audit and endorses request.' },
              { num: '04', title: 'PDF Generation', desc: 'Academic Office creates official PDF with cryptographic QR verification stamp.' },
              { num: '05', title: 'Download & Verify', desc: 'Student downloads certificate instantly. Anyone can scan the QR code to verify.' }
            ].map((step) => (
              <div key={step.num} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative group hover:border-brand-500/50 transition-all">
                <div className="text-3xl font-black text-brand-500/30 group-hover:text-brand-400 transition-colors">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-white mt-3">{step.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Documents Section */}
      <section id="documents" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white">Supported Academic Documents</h2>
            <p className="mt-3 text-slate-400 text-base">
              Fully configurable workflows accommodating all types of collegiate certifications.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentTypes.map((doc) => {
              const Icon = doc.icon;
              return (
                <div key={doc.title} className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 hover:border-brand-500/60 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-400/20 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        {doc.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-4">{doc.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{doc.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      Turnaround: {doc.days}
                    </span>
                    <span className="text-brand-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Apply Online &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security & Verification Spotlight */}
      <section id="workflow" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-brand-950 via-slate-900 to-indigo-950 rounded-3xl border border-brand-800/40 p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full">
                Tamper-Proof & Cryptographically Sealed
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4">
                Public QR Code Verification Portal
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
                Every generated academic certificate incorporates a high-entropy verification hash and a scannable QR code. Employers, embassies, and partner universities can independently authenticate documents without phone calls or email delays.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Link
                  to="/verify"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all"
                >
                  Try Verification Demo
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm bg-white text-slate-900 p-6 rounded-2xl shadow-2xl border-4 border-brand-500/30 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="font-extrabold text-base text-slate-900">VERIFIED ACADEMIC CREDENTIAL</div>
              <div className="text-xs text-slate-500 mt-1">National Institute of Advanced Technology</div>
              <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1">
                <div><span className="font-bold">Doc ID:</span> DOC-2026-894120</div>
                <div><span className="font-bold">Student:</span> Aditya Verma (STU2023001)</div>
                <div><span className="font-bold">Status:</span> <span className="text-emerald-700 font-bold">AUTHENTIC & VALID</span></div>
              </div>
              <div className="text-[11px] text-slate-400">Scanned via Public Verification Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Platform Features Section */}
      <section id="features" className="py-24 bg-slate-900/90 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 bg-brand-500/10 border border-brand-400/30 text-brand-300 text-xs font-bold rounded-full">
              Enterprise Grade Academic Technology
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight">
              Powerful Features for Seamless Campus Governance
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
              Designed to replace physical queues, manual paperwork, and forgery risks with unified cryptographic security and automated approval pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Mandatory Admin Verification & Onboarding',
                desc: 'All user accounts across all 5 portals must be reviewed and approved by the University Administrator before login access is authorized, preventing unauthorized access.',
                color: 'text-amber-400',
                badge: 'Access Governance'
              },
              {
                icon: Layers,
                title: 'Multi-Tier Role State Machines',
                desc: 'Configurable multi-step approval workflows (Class Advisor -> HOD -> Academic Office) tailored individually for each certificate and document type.',
                color: 'text-indigo-400',
                badge: 'Dynamic Pipelines'
              },
              {
                icon: FileCheck,
                title: 'Automated Cryptographic PDF Seals',
                desc: 'Server-side vector PDF generation equipped with tamper-proof institutional seals, high-entropy verification codes, and dynamic scannable QR stamps.',
                color: 'text-emerald-400',
                badge: 'Tamper-Proof'
              },
              {
                icon: Mail,
                title: 'Real-Time Notification Engine',
                desc: 'Instant email delivery to students and staff upon submission, faculty review, HOD sign-off, correction requests, and document readiness.',
                color: 'text-sky-400',
                badge: 'Live SMTP'
              },
              {
                icon: Zap,
                title: 'Instant QR Public Authenticator',
                desc: 'Embassies, employers, and foreign universities can scan document QR codes to verify authenticity instantly without needing system login credentials.',
                color: 'text-purple-400',
                badge: 'Global Trust'
              },
              {
                icon: Lock,
                title: 'Immutable Audit Trail & Telemetry',
                desc: 'Every login, approval click, rejection feedback, and document download is recorded with timestamps, user IDs, and audit actions.',
                color: 'text-rose-400',
                badge: 'Compliance & Audit'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 hover:border-brand-500/50 transition-all hover:shadow-2xl hover:shadow-brand-900/20 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {feature.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs font-semibold text-brand-400 group-hover:translate-x-1 transition-transform">
                    <span>Learn more in documentation &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section id="faq" className="py-24 bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-bold rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
              Everything You Need to Know
            </h2>
            <p className="mt-3 text-slate-400 text-sm leading-relaxed">
              Find answers to common questions regarding account creation, admin approvals, document issuance, and QR verification.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How do I create an account and access my portal?',
                a: 'Click "Create Account" or "Register" from the top header or your portal login page. Fill in your name, college email, password, and department. Once submitted, your account status is set to "Pending Approval". As soon as the Administrator approves your account, you will be notified via email and can sign in.'
              },
              {
                q: 'Why does my account say "Awaiting Admin Approval" when logging in?',
                a: 'To guarantee university data security and verify that only enrolled students and authorized faculty access student academic records, all registrations must be endorsed by the System Administrator in the User Directory before the first login.'
              },
              {
                q: 'Where does the Administrator review and approve new user signups?',
                a: 'The Administrator signs in via the Admin Portal (/login/admin) and accesses the "User Directory" (/admin/users). An Attention Banner highlights all pending registrations with direct 1-click "Approve" and "Reject" buttons.'
              },
              {
                q: 'What academic documents can students request online?',
                a: 'Students can request Bonafide Certificates (for passports, bus passes, bank loans), Consolidated Transcripts, Course Completion Letters, Letters of Recommendation, and No-Due Clearances across departments.'
              },
              {
                q: 'How does the multi-stage approval workflow work?',
                a: 'When a student files a request, it is forwarded first to their assigned Class Advisor (Faculty Portal). Once approved, it advances to the Head of Department (HOD Portal). Finally, the Academic Office seals and generates the official QR-stamped PDF.'
              },
              {
                q: 'How does third-party verification work for employers and embassies?',
                a: 'Anyone can visit the Public QR Verifier (/verify) or scan the printed QR code using any smartphone camera. The system instantly displays the authentic document details from the university database without needing any login.'
              }
            ].map((faq, index) => (
              <details
                key={index}
                className="group bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer text-white font-bold text-sm sm:text-base group-hover:text-brand-300 transition-colors">
                  <span>{faq.q}</span>
                  <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-4">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center p-6 bg-slate-900/60 rounded-3xl border border-slate-800">
            <h4 className="text-white font-bold text-sm">Still have questions about your university workflow?</h4>
            <p className="text-xs text-slate-400 mt-1">Contact your department academic coordinator or registrar office for assistance.</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link
                to="/register"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Create Account Now
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700"
              >
                Go to Portals Hub
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-500" />
            <span className="font-bold text-slate-300">CertiFlow Academic System</span>
            <span>&bull; Built for National Institute of Advanced Technology</span>
          </div>
          <div>&copy; {new Date().getFullYear()} Digital Academic Document Workflow System. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
