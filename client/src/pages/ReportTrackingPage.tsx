import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search, CheckCircle2, Clock, ShieldCheck, User, MessageSquare,
  Send, AlertCircle, Copy, ArrowLeft, Calendar, FileText, Camera,
  MapPin, Check, Plus, RefreshCw, Phone
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { useAuth } from '../context/AuthContext.js';
import { PageHeader } from '../components/PageHeader.js';

export const ReportTrackingPage: React.FC = () => {
  const { refNumber: routeRef } = useParams();
  const navigate = useNavigate();
  const { t } = useAccessibility();
  const { user } = useAuth();

  const [searchInput, setSearchInput] = useState<string>(routeRef || '');
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [followupMessage, setFollowupMessage] = useState<string>('');
  const [isPostingFollowup, setIsPostingFollowup] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const token = localStorage.getItem('bensican_token');

  // Load all user's reports
  const loadReports = () => {
    setLoading(true);
    fetch('/api/reports', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.reports) {
          setReportsList(data.reports);
          if (routeRef) {
            fetchReportDetails(routeRef);
          } else if (data.reports.length > 0) {
            fetchReportDetails(data.reports[0].ref_number);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, [routeRef]);

  const fetchReportDetails = async (refOrId: string) => {
    setErrorMessage('');
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(refOrId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedReport(data.report);
      } else {
        setErrorMessage(data.error || 'Report not found.');
      }
    } catch {
      setErrorMessage('Failed to load report details.');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toLowerCase();
    if (!query) return;

    // First search in loaded reports by title or ref_number
    const match = reportsList.find(r =>
      (r.title && r.title.toLowerCase().includes(query)) ||
      (r.ref_number && r.ref_number.toLowerCase() === query)
    );

    if (match) {
      fetchReportDetails(match.ref_number);
    } else {
      // Direct ref number lookup
      fetchReportDetails(query.toUpperCase());
    }
  };

  const handlePostFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupMessage.trim() || !selectedReport) return;

    setIsPostingFollowup(true);
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/followups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: followupMessage.trim(),
          isAdminRequest: false
        })
      });

      if (res.ok) {
        setFollowupMessage('');
        fetchReportDetails(selectedReport.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPostingFollowup(false);
    }
  };

  const copyRefNumber = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300';
      case 'Resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'Closed': return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  // Filtered reports list based on search
  const filteredReports = searchInput.trim()
    ? reportsList.filter(r =>
        (r.title && r.title.toLowerCase().includes(searchInput.toLowerCase())) ||
        (r.ref_number && r.ref_number.toLowerCase().includes(searchInput.toLowerCase())) ||
        (r.category_name && r.category_name.toLowerCase().includes(searchInput.toLowerCase()))
      )
    : reportsList;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <PageHeader
        title={t('residentCheckReports')}
        subtitle="Track your reports by title, check real-time progress, review admin remarks, and converse with assigned officials."
        icon={<FileText className="w-8 h-8 text-emerald-400" />}
        backTo={user ? (user.role === 'resident' ? '/resident/dashboard' : '/admin/dashboard') : '/'}
        actions={
          <button
            type="button"
            onClick={() => navigate('/resident/send-report')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Report</span>
          </button>
        }
      />

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fadeIn">
        {/* Search Bar by Report Title */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Search Your Reports
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Type the title of your report (e.g., Streetlight, Drainage, Disturbance) or reference ID.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by Report Title (e.g., Broken Streetlight on Mabini St)..."
                className="w-full px-4 py-3.5 pl-11 rounded-2xl border-2 border-slate-300 dark:border-slate-600 text-sm sm:text-base dark:bg-slate-900 focus:outline-hidden focus:border-emerald-600 dark:text-white"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center gap-2 transition min-h-[48px] text-sm"
            >
              <span>Find</span>
            </button>
          </form>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-950/50 border-2 border-red-400 rounded-2xl flex items-center gap-3 text-red-900 dark:text-red-200 animate-fadeIn">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
            <div className="text-sm font-bold">{errorMessage}</div>
          </div>
        )}

        {/* 2-Column Responsive Layout: Left list of report cards, Right details view */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Reports Card Selector (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Your Reports ({filteredReports.length})
              </span>
              <button
                type="button"
                onClick={loadReports}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-400 mt-2">Loading your reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No reports found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {searchInput.trim() ? 'No reports matched your search term.' : 'You have not submitted any barangay reports yet.'}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/resident/send-report')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Submit a Report Now
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
                {filteredReports.map((r) => {
                  const isSelected = selectedReport?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => fetchReportDetails(r.ref_number || r.id)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition text-left space-y-2.5 ${
                        isSelected
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        {/* Prominent Report Title */}
                        <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {r.title}
                        </h3>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border shrink-0 ${getStatusColor(r.status)}`}>
                          {r.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                          {r.category_name || 'Community Concern'}
                        </span>
                        <span>•</span>
                        <span>{new Date(r.created_at).toLocaleDateString()}</span>
                        {r.location_details && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[140px]">{r.location_details}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60 font-mono">
                        <span>Ref: {r.ref_number}</span>
                        <span className="text-emerald-600 font-bold hover:underline">View Details →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Report Full Details View (7 cols on lg) */}
          <div className="lg:col-span-7">
            {selectedReport ? (
              <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-md space-y-6 animate-fadeIn">
                {/* Header Info */}
                <div className="border-b border-slate-200 dark:border-slate-700 pb-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusColor(selectedReport.status)}`}>
                      Status: {selectedReport.status}
                    </span>

                    <div className="flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-xl">
                      <span className="text-slate-500">Ref:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedReport.ref_number}</strong>
                      <button
                        type="button"
                        onClick={() => copyRefNumber(selectedReport.ref_number)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-500"
                        title="Copy reference number"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Headline: Report Title */}
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                    {selectedReport.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Category: {selectedReport.category_name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedReport.location_details}
                    </span>
                    <span>•</span>
                    <span>Filed: {new Date(selectedReport.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* 3-Step Progress Timeline */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Resolution Progress
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-400 text-emerald-900 dark:text-emerald-200">
                      <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                      1. Received
                    </div>
                    <div className={`p-3 rounded-xl border transition ${
                      selectedReport.status === 'In Progress' || selectedReport.status === 'Resolved' || selectedReport.status === 'Closed'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-900 dark:text-blue-200'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-400'
                    }`}>
                      <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                      2. Under Action
                    </div>
                    <div className={`p-3 rounded-xl border transition ${
                      selectedReport.status === 'Resolved' || selectedReport.status === 'Closed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-400'
                    }`}>
                      <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                      3. Resolved
                    </div>
                  </div>
                </div>

                {/* Assigned Official Handler */}
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {selectedReport.assigned_admin_photo ? (
                      <img src={selectedReport.assigned_admin_photo} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-lg flex items-center justify-center border-2 border-emerald-400">
                        {selectedReport.assigned_admin_name ? selectedReport.assigned_admin_name[0] : 'B'}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Assigned Handler</span>
                      <strong className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block">
                        {selectedReport.assigned_admin_name || 'Barangay Administrative Staff'}
                      </strong>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        {selectedReport.assigned_admin_position || 'Barangay Bensican Hall'}
                      </span>
                    </div>
                  </div>

                  <a
                    href="tel:091755523674"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Call Hotline</span>
                  </a>
                </div>

                {/* Description & Attachments */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    Report Description
                  </h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedReport.description || 'No additional text description provided.'}
                  </div>

                  {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-slate-500 block mb-2">Attached Proof & Photos:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedReport.attachments.map((att: any) => (
                          <a
                            key={att.id}
                            href={att.file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:opacity-90 group relative"
                          >
                            <img src={att.file_path} alt="" className="w-full h-28 object-cover group-hover:scale-105 transition-transform" />
                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">View</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedReport.outcome && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border-2 border-emerald-400 space-y-1">
                      <strong className="text-emerald-900 dark:text-emerald-200 font-bold block text-sm">Official Remarks / Resolution:</strong>
                      <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{selectedReport.outcome}</p>
                    </div>
                  )}
                </div>

                {/* Follow-ups Thread */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-5 space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Follow-up Updates ({selectedReport.followups?.length || 0})</span>
                  </h4>

                  <div className="space-y-3">
                    {selectedReport.followups && selectedReport.followups.length > 0 ? (
                      selectedReport.followups.map((f: any) => (
                        <div
                          key={f.id}
                          className={`p-3.5 rounded-2xl border text-sm space-y-1 ${
                            f.sender_role === 'resident'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 ml-4 sm:ml-8'
                              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 mr-4 sm:mr-8'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {f.sender_name} ({f.sender_role === 'resident' ? 'Resident' : 'Barangay Staff'})
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              {new Date(f.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                            {f.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-xs text-slate-400 italic">
                        No additional notes yet. You can post a message below.
                      </div>
                    )}
                  </div>

                  {/* Add Follow-up Input */}
                  <form onSubmit={handlePostFollowup} className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={followupMessage}
                      onChange={(e) => setFollowupMessage(e.target.value)}
                      placeholder="Add an update or question for the barangay handler..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm dark:bg-slate-900 focus:outline-hidden focus:border-emerald-600 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={isPostingFollowup || !followupMessage.trim()}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Select a report to inspect</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Choose a report from the list on the left to see the complete timeline, assigned handler, and remarks.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
