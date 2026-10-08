import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Search, Filter, User, Calendar, CheckCircle2,
  Clock, AlertTriangle, Send, Archive, Plus, ShieldCheck, Scale, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageHeader } from '../components/PageHeader.js';

export const AdminReportsPage: React.FC = () => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [staffList, setStaffList] = useState<any[]>([]);

  // Update states
  const [newStatus, setNewStatus] = useState<string>('');
  const [newPriority, setNewPriority] = useState<string>('');
  const [newAssignedAdmin, setNewAssignedAdmin] = useState<string>('');
  const [outcomeNotes, setOutcomeNotes] = useState<string>('');
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [isAdminRequest, setIsAdminRequest] = useState<boolean>(false);
  const [archiveReason, setArchiveReason] = useState<string>('');

  // Modals
  const [showManageModal, setShowManageModal] = useState<boolean>(false);
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false);
  const [showWalkInModal, setShowWalkInModal] = useState<boolean>(false);
  const [showScheduleHearingModal, setShowScheduleHearingModal] = useState<boolean>(false);

  // Walk-in assist form state
  const [walkInResidents, setWalkInResidents] = useState<any[]>([]);
  const [walkInResidentId, setWalkInResidentId] = useState<string>('');
  const [walkInTitle, setWalkInTitle] = useState<string>('');
  const [walkInCategory, setWalkInCategory] = useState<string>('cat-peace');
  const [walkInLocation, setWalkInLocation] = useState<string>('');
  const [walkInDesc, setWalkInDesc] = useState<string>('');

  // Schedule Hearing Modal state
  const [hearingDate, setHearingDate] = useState<string>('');
  const [hearingTime, setHearingTime] = useState<string>('09:00 AM');
  const [hearingVenue, setHearingVenue] = useState<string>('Lupong Tagapamayapa Mediation Room');
  const [hearingParties, setHearingParties] = useState<string>('');
  const [hearingPurpose, setHearingPurpose] = useState<string>('');
  const [hearingError, setHearingError] = useState<string>('');

  const token = localStorage.getItem('bensican_token');

  const loadReports = () => {
    let url = `/api/reports?search=${encodeURIComponent(search)}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    if (priorityFilter) url += `&priority=${priorityFilter}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.reports) {
          setReports(data.reports);
          if (paramId) {
            const found = data.reports.find((r: any) => r.id === paramId || r.ref_number === paramId);
            if (found) openManage(found);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadReports();

    // Load staff accounts
    fetch('/api/users?role=admin', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.users) setStaffList(data.users);
      })
      .catch(() => {});

    // Load residents for walk-in assist
    fetch('/api/users?role=resident&status=active', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          setWalkInResidents(data.users);
          if (data.users.length > 0) setWalkInResidentId(data.users[0].id);
        }
      })
      .catch(() => {});
  }, [search, statusFilter, priorityFilter]);

  const openManage = (report: any) => {
    // Fetch full report with followups
    fetch(`/api/reports/${report.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.report) {
          setSelectedReport(data.report);
          setNewStatus(data.report.status);
          setNewPriority(data.report.priority);
          setNewAssignedAdmin(data.report.assigned_admin_id || '');
          setOutcomeNotes(data.report.outcome || '');
          setHearingParties(`${data.report.resident_name} vs. `);
          setHearingPurpose(`Mediation regarding: ${data.report.title}`);
          setShowManageModal(true);
        }
      });
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      const res = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          priority: newPriority,
          assignedAdminId: newAssignedAdmin,
          outcome: outcomeNotes
        })
      });

      if (res.ok) {
        setShowManageModal(false);
        loadReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedReport) return;

    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/followups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
          isAdminRequest
        })
      });

      if (res.ok) {
        setReplyMessage('');
        // Reload details
        openManage(selectedReport);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveReport = async () => {
    if (!archiveReason.trim() || !selectedReport) return;

    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: archiveReason })
      });

      if (res.ok) {
        setShowArchiveModal(false);
        setShowManageModal(false);
        loadReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          categoryId: walkInCategory,
          title: walkInTitle,
          description: walkInDesc,
          locationDetails: walkInLocation,
          isWalkInAssist: true,
          targetResidentId: walkInResidentId
        })
      });

      if (res.ok) {
        setShowWalkInModal(false);
        loadReports();
      }
    } catch (err) {}
  };

  const handleScheduleHearingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHearingError('');

    try {
      const res = await fetch('/api/hearings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reportId: selectedReport.id,
          hearingDate,
          hearingTime,
          venue: hearingVenue,
          partiesInvolved: hearingParties,
          purpose: hearingPurpose
        })
      });

      const data = await res.json();
      if (res.ok) {
        setShowScheduleHearingModal(false);
        openManage(selectedReport);
      } else {
        setHearingError(data.error || 'Failed to schedule hearing. Check conflict warnings.');
      }
    } catch (err) {
      setHearingError('Network error scheduling hearing.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <PageHeader
        title="Report & Concern Management Queue"
        subtitle="Review, prioritize, assign, and update community reports filed by residents."
        icon={FileText}
        backTo="/admin/dashboard"
        badges={[`${reports.length} Total Reports`, 'Admin Queue']}
        actions={
          <button
            onClick={() => setShowWalkInModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow transition min-h-[44px]"
          >
            <Plus className="w-5 h-5" />
            <span>Walk-In Assist: File for Resident</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 space-y-6">

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference (BSN-2026-00001), resident, or keywords..."
            className="w-full px-4 py-2.5 pl-10 rounded-xl border text-sm dark:bg-slate-900 focus:border-emerald-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border text-sm dark:bg-slate-900 font-bold"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border text-sm dark:bg-slate-900 font-bold"
        >
          <option value="">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="Normal">Normal</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border-3 border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase text-xs font-bold border-b">
              <tr>
                <th className="py-4 px-6">Reference No</th>
                <th className="py-4 px-6">Concern Title</th>
                <th className="py-4 px-6">Resident</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Assigned Handler</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                  <td className="py-4 px-6 font-mono font-black text-emerald-700 dark:text-emerald-400">
                    {r.ref_number}
                  </td>
                  <td className="py-4 px-6">
                    <strong className="block text-slate-900 dark:text-white text-base">{r.title}</strong>
                    <span className="text-xs text-slate-500">{r.category_name} • {r.location_details}</span>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">
                    {r.resident_name}
                    {r.filed_with_assistance === 1 && (
                      <span className="block text-[10px] text-amber-600 font-bold">Assisted Filing</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-black ${
                      r.priority === 'Urgent' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                      r.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      r.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs font-medium text-slate-600 dark:text-slate-400">
                    {r.assigned_admin_name || <span className="text-amber-600 font-bold">Unassigned</span>}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => openManage(r)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANAGE MODAL / DRAWER */}
      {showManageModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-sm font-mono font-black text-emerald-600">
                  {selectedReport.ref_number}
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {selectedReport.title}
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  Complainant: <strong>{selectedReport.resident_name}</strong> ({selectedReport.resident_contact}) • Address: {selectedReport.resident_street}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowScheduleHearingModal(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Scale className="w-4 h-4" /> Schedule Hearing
                </button>
                <button
                  onClick={() => setShowArchiveModal(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Archive className="w-4 h-4" /> Archive
                </button>
                <button
                  onClick={() => setShowManageModal(false)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs font-bold"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Description & Attachments */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border text-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Report Details:</span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{selectedReport.description}</p>
              {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {selectedReport.attachments.map((att: any) => (
                    <a key={att.id} href={att.file_path} target="_blank" rel="noreferrer">
                      <img src={att.file_path} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Status & Assignment Update Form */}
            <form onSubmit={handleUpdateReport} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Status:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-sm font-bold dark:bg-slate-900"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Priority:</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-sm font-bold dark:bg-slate-900"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Assigned Official:</label>
                <select
                  value={newAssignedAdmin}
                  onChange={(e) => setNewAssignedAdmin(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-sm font-bold dark:bg-slate-900"
                >
                  <option value="">Unassigned Queue</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>{st.full_name} ({st.position || st.role})</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Resolution Outcome Notes:</label>
                <input
                  type="text"
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="Example: Resolved through Barangay Tanod inspection and neighbor agreement."
                  className="w-full p-2.5 rounded-xl border text-sm dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition"
                >
                  Save Status & Assignment
                </button>
              </div>
            </form>

            {/* Follow-up / Communication Thread */}
            <div className="space-y-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Resident Communication Thread:</h3>
              <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border">
                {selectedReport.followups && selectedReport.followups.length > 0 ? (
                  selectedReport.followups.map((f: any) => (
                    <div key={f.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                        <span>{f.sender_name}</span>
                        <span>{new Date(f.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-800 dark:text-slate-200">{f.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400">No messages yet.</div>
                )}
              </div>

              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type official reply or request for additional info..."
                  className="flex-1 px-4 py-2.5 rounded-xl border text-sm dark:bg-slate-900"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Send Reply
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE HEARING MODAL */}
      {showScheduleHearingModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-purple-500 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Schedule Hearing (KP Conciliation)
            </h3>

            {hearingError && (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-bold border border-red-300">
                {hearingError}
              </div>
            )}

            <form onSubmit={handleScheduleHearingSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1">Date *</label>
                <input
                  type="date"
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Time *</label>
                <input
                  type="text"
                  value={hearingTime}
                  onChange={(e) => setHearingTime(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Venue *</label>
                <input
                  type="text"
                  value={hearingVenue}
                  onChange={(e) => setHearingVenue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Parties Involved *</label>
                <input
                  type="text"
                  value={hearingParties}
                  onChange={(e) => setHearingParties(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Purpose *</label>
                <input
                  type="text"
                  value={hearingPurpose}
                  onChange={(e) => setHearingPurpose(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleHearingModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white rounded-xl font-bold"
                >
                  Schedule Hearing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WALK-IN ASSIST MODAL */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Walk-In Assist: File Report on Resident's Behalf
            </h3>
            <p className="text-xs text-slate-500">
              Barangay staff assisted filing. Will be recorded as filed with staff assistance.
            </p>

            <form onSubmit={handleWalkInSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1">Select Verified Resident *</label>
                <select
                  value={walkInResidentId}
                  onChange={(e) => setWalkInResidentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                  required
                >
                  {walkInResidents.map((res) => (
                    <option key={res.id} value={res.id}>{res.full_name} ({res.street})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Category *</label>
                <select
                  value={walkInCategory}
                  onChange={(e) => setWalkInCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                >
                  <option value="cat-peace">Peace and Order</option>
                  <option value="cat-sanitation">Sanitation</option>
                  <option value="cat-infra">Infrastructure & Roads</option>
                  <option value="cat-noise">Noise Disturbance</option>
                  <option value="cat-dispute">Neighborhood Dispute</option>
                  <option value="cat-health">Health & Environment</option>
                  <option value="cat-other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Title *</label>
                <input
                  type="text"
                  value={walkInTitle}
                  onChange={(e) => setWalkInTitle(e.target.value)}
                  placeholder="Incident title"
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Location Details *</label>
                <input
                  type="text"
                  value={walkInLocation}
                  onChange={(e) => setWalkInLocation(e.target.value)}
                  placeholder="Purok and street in Bensican"
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={walkInDesc}
                  onChange={(e) => setWalkInDesc(e.target.value)}
                  placeholder="Incident details"
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  Submit Assisted Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARCHIVE MODAL */}
      {showArchiveModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-red-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-red-600">
              Soft-Archive Report {selectedReport.ref_number}
            </h3>
            <p className="text-xs text-slate-500">
              Note: Hard deletion is blocked. This item will be placed in the Archive center and can be restored by the Super Admin.
            </p>

            <div>
              <label className="block text-xs font-bold mb-1">Reason for Archiving *</label>
              <textarea
                rows={3}
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="Explain why this report is being archived..."
                className="w-full p-2.5 rounded-xl border text-sm dark:bg-slate-800"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowArchiveModal(false)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchiveReport}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm"
              >
                Confirm Soft-Archive
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

