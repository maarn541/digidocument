import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Building,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AdminDocumentsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [reqRes, deptRes, docRes] = await Promise.all([
        api.get('/admin/requests'),
        api.get('/admin/departments'),
        api.get('/admin/document-types'),
      ]);
      setRequests(reqRes.data);
      setDepartments(deptRes.data);
      setDocTypes(docRes.data);
    } catch (err) {
      console.error('Failed to load admin document monitoring data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const res = await api.get('/admin/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Refresh failed', err);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'IN_PROGRESS' && ['SUBMITTED', 'UNDER_FACULTY_REVIEW', 'UNDER_HOD_REVIEW', 'UNDER_OFFICE_PROCESSING', 'FACULTY_APPROVED', 'HOD_APPROVED'].includes(r.status)) ||
      (statusFilter === 'COMPLETED' && ['READY_FOR_DOWNLOAD', 'COMPLETED', 'DOCUMENT_GENERATED'].includes(r.status)) ||
      (statusFilter === 'REJECTED' && ['FACULTY_REJECTED', 'HOD_REJECTED', 'CANCELLED'].includes(r.status)) ||
      r.status === statusFilter;

    const matchDept = deptFilter === 'ALL' || r.department?.id === deptFilter || r.departmentId === deptFilter;
    const matchDocType = docTypeFilter === 'ALL' || r.documentType?.id === docTypeFilter || r.documentTypeId === docTypeFilter;

    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      r.requestNumber?.toLowerCase().includes(q) ||
      r.student?.user?.name?.toLowerCase().includes(q) ||
      r.student?.studentIdNumber?.toLowerCase().includes(q) ||
      r.documentType?.name?.toLowerCase().includes(q) ||
      r.purpose?.toLowerCase().includes(q);

    return matchStatus && matchDept && matchDocType && matchSearch;
  });

  const totalCount = requests.length;
  const inProgressCount = requests.filter(r => ['SUBMITTED', 'UNDER_FACULTY_REVIEW', 'UNDER_HOD_REVIEW', 'UNDER_OFFICE_PROCESSING', 'FACULTY_APPROVED', 'HOD_APPROVED'].includes(r.status)).length;
  const completedCount = requests.filter(r => ['READY_FOR_DOWNLOAD', 'COMPLETED', 'DOCUMENT_GENERATED'].includes(r.status)).length;
  const rejectedCount = requests.filter(r => ['FACULTY_REJECTED', 'HOD_REJECTED', 'CANCELLED'].includes(r.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-400/30 mb-2">
          <Layers className="w-4 h-4" /> University Document Operations Monitor
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Institutional Document Registry & Request Monitor
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time oversight of all student certificate applications, stage progress, approvals, and cryptographic PDF issuances.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4 text-brand-400" /> Refresh Monitor
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-brand-50/70 border-brand-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Requests</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">All Filings Across Campus</div>
        </div>

        <div
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-amber-50/70 border-amber-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase">In Pipeline</span>
          <div className="text-2xl font-black text-amber-600 mt-2">{inProgressCount}</div>
          <div className="text-[10px] text-amber-600 mt-1">Under Faculty / HOD / Office</div>
        </div>

        <div
          onClick={() => setStatusFilter('COMPLETED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'COMPLETED'
              ? 'bg-emerald-50/70 border-emerald-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase">Completed / Issued</span>
          <div className="text-2xl font-black text-emerald-600 mt-2">{completedCount}</div>
          <div className="text-[10px] text-emerald-600 mt-1">Ready with QR Stamp</div>
        </div>

        <div
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'REJECTED'
              ? 'bg-rose-50/70 border-rose-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase">Rejected / Cancelled</span>
          <div className="text-2xl font-black text-rose-600 mt-2">{rejectedCount}</div>
          <div className="text-[10px] text-rose-600 mt-1">Requires Revision</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by request # (e.g. DOC-2026), student name, roll number, certificate type..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Department selector */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-brand-500 flex-1 md:flex-none"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>

            {/* Document type selector */}
            <select
              value={docTypeFilter}
              onChange={(e) => setDocTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-brand-500 flex-1 md:flex-none"
            >
              <option value="ALL">All Document Types</option>
              {docTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          {[
            { key: 'ALL', label: 'All Requests' },
            { key: 'IN_PROGRESS', label: 'Under Review / In Progress' },
            { key: 'SUBMITTED', label: 'Submitted' },
            { key: 'UNDER_FACULTY_REVIEW', label: 'Faculty Review' },
            { key: 'UNDER_HOD_REVIEW', label: 'HOD Review' },
            { key: 'UNDER_OFFICE_PROCESSING', label: 'Office Processing' },
            { key: 'COMPLETED', label: 'Completed & Sealed' },
            { key: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading document registry...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No document requests matched your search or filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Request ID</th>
                  <th className="py-3.5 px-6">Student Applicant</th>
                  <th className="py-3.5 px-6">Document Type</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Stage Status</th>
                  <th className="py-3.5 px-6">Submitted</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Request Number */}
                    <td className="py-3.5 px-6 font-mono font-bold text-brand-700">
                      <Link to={`/requests/${r.id}`} className="hover:underline flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-brand-500" />
                        {r.requestNumber}
                      </Link>
                    </td>

                    {/* Student Applicant */}
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">{r.student?.user?.name || 'Student'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {r.student?.studentIdNumber || 'ID Unavailable'}
                      </div>
                    </td>

                    {/* Document Type */}
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {r.documentType?.name || 'Document'}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                        {r.department?.code || '—'}
                      </span>
                    </td>

                    {/* Stage Status */}
                    <td className="py-3.5 px-6">
                      <StatusBadge status={r.status} />
                    </td>

                    {/* Submitted Date */}
                    <td className="py-3.5 px-6 text-slate-500 text-[11px]">
                      {new Date(r.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/requests/${r.id}`}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          title="View Request Details & Approval Chain"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </Link>
                        {r.generatedDocument && (
                          <a
                            href={r.generatedDocument.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                            title="Download Official Sealed PDF"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </a>
                        )}
                        {r.generatedDocument?.verificationCode && (
                          <Link
                            to={`/verify/${r.generatedDocument.verificationCode}`}
                            target="_blank"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-emerald-700 rounded-lg transition-all"
                            title="Public QR Verification View"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
