import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { History, Search, ShieldCheck, Clock, UserCheck, LogIn, UserPlus, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'ALL' | 'LOGINS' | 'REGISTRATIONS_APPROVALS' | 'DOCUMENTS'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const act = (l.action || '').toLowerCase();

    // Category filter
    if (category === 'LOGINS') {
      if (!act.includes('logged in')) return false;
    } else if (category === 'REGISTRATIONS_APPROVALS') {
      if (!act.includes('registration') && !act.includes('approval') && !act.includes('status') && !act.includes('user')) {
        return false;
      }
    } else if (category === 'DOCUMENTS') {
      if (!act.includes('request') && !act.includes('document') && !act.includes('pdf') && !l.request) {
        return false;
      }
    }

    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      act.includes(q) ||
      l.user?.name?.toLowerCase().includes(q) ||
      l.user?.email?.toLowerCase().includes(q) ||
      l.user?.role?.toLowerCase().includes(q) ||
      l.request?.requestNumber?.toLowerCase().includes(q)
    );
  });

  const loginCount = logs.filter(l => (l.action || '').toLowerCase().includes('logged in')).length;
  const userApprovalCount = logs.filter(l => {
    const act = (l.action || '').toLowerCase();
    return act.includes('registration') || act.includes('approval') || act.includes('status');
  }).length;
  const docCount = logs.filter(l => Boolean(l.request) || (l.action || '').toLowerCase().includes('document') || (l.action || '').toLowerCase().includes('request')).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 mb-2">
          <History className="w-4 h-4" /> Real-time System Telemetry
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Audit Logs & User Login Monitor
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Chronological, tamper-proof record of all user logins, registration submissions, admin approvals, and document lifecycle events.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" /> Refresh Logs
          </button>
        </div>
      </div>

      {/* KPI Activity Quick Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setCategory('ALL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            category === 'ALL'
              ? 'bg-brand-50 border-brand-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">All Activity</span>
            <History className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{logs.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Total System Events</div>
        </div>

        <div
          onClick={() => setCategory('LOGINS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            category === 'LOGINS'
              ? 'bg-sky-50 border-sky-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-700 uppercase">User Logins</span>
            <LogIn className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-600 mt-2">{loginCount}</div>
          <div className="text-[10px] text-sky-600 mt-0.5">Authentication Sessions</div>
        </div>

        <div
          onClick={() => setCategory('REGISTRATIONS_APPROVALS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            category === 'REGISTRATIONS_APPROVALS'
              ? 'bg-amber-50 border-amber-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase">Signups & Approvals</span>
            <UserPlus className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{userApprovalCount}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Onboarding Actions</div>
        </div>

        <div
          onClick={() => setCategory('DOCUMENTS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            category === 'DOCUMENTS'
              ? 'bg-emerald-50 border-emerald-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Document Events</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{docCount}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Requests, Signs & Seals</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs by operator name, email, action description, role, or request ID..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
          />
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Showing:</span>
          <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredLogs.length} Records
          </span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading audit history...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No audit records found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Operator User</th>
                  <th className="py-3.5 px-6">Portal Role</th>
                  <th className="py-3.5 px-6">Recorded Action</th>
                  <th className="py-3.5 px-6 text-right">Associated Request</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLogs.map((log) => {
                  const act = (log.action || '').toLowerCase();
                  const isLogin = act.includes('logged in');
                  const isApproval = act.includes('approved') || act.includes('active');
                  const isPending = act.includes('pending_approval') || act.includes('registration');
                  const isReject = act.includes('reject');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-900">
                          {log.user ? log.user.name : 'System Automated'}
                        </div>
                        {log.user?.email && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            {log.user.email}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {log.user ? log.user.role : 'SYSTEM'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2">
                          {isLogin && <LogIn className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                          {isApproval && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          {isPending && <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          <span
                            className={`font-medium ${
                              isLogin
                                ? 'text-sky-900'
                                : isApproval
                                ? 'text-emerald-900'
                                : isReject
                                ? 'text-rose-900'
                                : 'text-slate-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-brand-700">
                        {log.request ? (
                          <a href={`/requests/${log.request.id}`} className="hover:underline">
                            {log.request.requestNumber}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
