import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ShieldAlert,
  Users,
  Building,
  Layers,
  FileCheck2,
  TrendingUp,
  Sliders,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load admin statistics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading administrative telemetry...</div>;
  }

  const overview = stats?.overview || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-400/30 mb-2">
          <ShieldAlert className="w-4 h-4" /> University Administrative Console
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          System Administration & Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Comprehensive institutional telemetry, user provisioning, role assignments, dynamic workflow configurations, and tamper-proof audit trails.
        </p>

        {/* Quick Nav Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/admin/users"
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-brand-400" /> User Approvals & Directory
          </Link>
          <Link
            to="/admin/documents"
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <FileCheck2 className="w-4 h-4 text-sky-400" /> Document Monitor
          </Link>
          <Link
            to="/admin/workflows"
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4 text-purple-400" /> Workflow Stage Builder
          </Link>
          <Link
            to="/admin/audit-logs"
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-emerald-400" /> Audit & Logins
          </Link>
        </div>
      </div>

      {/* Pending User Approvals Quick Alert banner */}
      {(overview.pendingUserApprovals || 0) > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>{overview.pendingUserApprovals} Account Registration{overview.pendingUserApprovals > 1 ? 's' : ''} Awaiting Approval</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-black animate-pulse">Action Required</span>
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Newly registered students, faculty, or staff must be authorized by an admin before they can log in.
              </p>
            </div>
          </div>
          <Link
            to="/admin/users"
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap self-end sm:self-center"
          >
            Review & Approve Users ({overview.pendingUserApprovals})
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Students</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{overview.totalStudents || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Enrolled Profiles</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Faculty</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{overview.totalFaculty || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Class Advisors</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Requests</span>
          <div className="text-2xl font-black text-indigo-700 mt-2">{overview.totalRequests || 0}</div>
          <div className="text-[10px] text-indigo-500 mt-1">Lifetime Filings</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Doc Queue</span>
          <div className="text-2xl font-black text-amber-600 mt-2">{overview.pendingRequests || 0}</div>
          <div className="text-[10px] text-amber-600 mt-1">Active in Review</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">User Approvals</span>
          <div className="text-2xl font-black text-amber-500 mt-2">{overview.pendingUserApprovals || 0}</div>
          <div className="text-[10px] text-amber-600 mt-1">Awaiting Sign-Off</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Completed</span>
          <div className="text-2xl font-black text-emerald-600 mt-2">{overview.completedDocuments || 0}</div>
          <div className="text-[10px] text-emerald-600 mt-1">Generated & Sealed</div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests by Document Type */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-brand-600" />
            Requests by Academic Document Type
          </h3>
          <div className="space-y-3">
            {(stats?.byDocType || []).map((d: any) => {
              const pct = overview.totalRequests > 0 ? (d.count / overview.totalRequests) * 100 : 0;

              return (
                <div key={d.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{d.name}</span>
                    <span className="font-mono text-slate-900">{d.count} requests ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Requests by Department */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-brand-600" />
            Departmental Volume & Enrollment Breakdown
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {(stats?.byDepartment || []).map((dept: any) => (
              <div key={dept.code} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{dept.name} ({dept.code})</div>
                  <div className="text-slate-400 mt-0.5">
                    {dept.studentsCount} Students &bull; {dept.facultyCount} Faculty Staff
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60 font-mono">
                    {dept.requestsCount} Requests
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
