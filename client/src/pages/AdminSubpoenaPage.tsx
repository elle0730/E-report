import React, { useState, useEffect } from 'react';
import {
  Scale, Plus, Download, FileText, CheckCircle2, Clock,
  AlertCircle, Search, Edit3, Printer, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { generateSubpoenaPdf } from '../utils/pdfGenerators.js';
import { PageHeader } from '../components/PageHeader.js';

export const AdminSubpoenaPage: React.FC = () => {
  const { user } = useAuth();
  const [subpoenas, setSubpoenas] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Issue modal
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [caseNumber, setCaseNumber] = useState<string>('BSN-KP-2026-');
  const [respondent, setRespondent] = useState<string>('');
  const [complainant, setComplainant] = useState<string>('');
  const [hearingDate, setHearingDate] = useState<string>('');
  const [hearingTime, setHearingTime] = useState<string>('09:30 AM');
  const [venue, setVenue] = useState<string>('Lupong Tagapamayapa Mediation Room, Barangay Hall');
  const [reason, setReason] = useState<string>('');
  const [signatory, setSignatory] = useState<string>('');
  const [signatoryTitle, setSignatoryTitle] = useState<string>('Punong Barangay / Lupon Chairman');

  const token = localStorage.getItem('bensican_token');

  const loadSubpoenas = () => {
    let url = `/api/subpoenas?search=${encodeURIComponent(search)}`;
    if (statusFilter) url += `&status=${statusFilter}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.subpoenas) setSubpoenas(data.subpoenas);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadSubpoenas();

    // Load reports for auto-filling
    fetch('/api/reports', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.reports) {
          setReports(data.reports);
          if (data.reports.length > 0) {
            handleSelectReport(data.reports[0].id, data.reports);
          }
        }
      })
      .catch(() => {});
  }, [statusFilter, search]);

  const handleSelectReport = (repId: string, currentReports = reports) => {
    setSelectedReportId(repId);
    const rep = currentReports.find(r => r.id === repId);
    if (rep) {
      setComplainant(rep.resident_name || 'Resident');
      setReason(rep.title);
      setCaseNumber(`BSN-KP-2026-0${Math.floor(Math.random() * 80) + 10}`);
    }
  };

  const handleCreateSubpoena = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/subpoenas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reportId: selectedReportId,
          caseNumber,
          respondent,
          complainant,
          hearingDate,
          hearingTime,
          venue,
          reason,
          signatory,
          signatoryTitle,
          status: 'Issued'
        })
      });

      if (res.ok) {
        setShowIssueModal(false);
        loadSubpoenas();
      }
    } catch (err) {}
  };

  const handleUpdateStatus = async (subId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/subpoenas/${subId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) loadSubpoenas();
    } catch (err) {}
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <PageHeader
        title="Official Subpoenas & Summons (Patawag)"
        subtitle="Issue legal appearance summons (KP Form No. 9) with official Barangay Bensican letterhead."
        icon={Scale}
        backTo="/admin/dashboard"
        badges={[`${subpoenas.length} Issued Records`, 'KP Form 9']}
        actions={
          <button
            onClick={() => setShowIssueModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow transition min-h-[44px]"
          >
            <Plus className="w-5 h-5" />
            <span>Write / Issue Subpoena</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 space-y-6">

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {['', 'Draft', 'Issued', 'Served', 'Attended', 'Missed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              statusFilter === st
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            {st === '' ? 'All Subpoenas' : st}
          </button>
        ))}
      </div>

      {/* Subpoena Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border-3 border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase text-xs font-bold border-b">
              <tr>
                <th className="py-4 px-6">Reference No</th>
                <th className="py-4 px-6">Case No / Reason</th>
                <th className="py-4 px-6">Respondent</th>
                <th className="py-4 px-6">Complainant</th>
                <th className="py-4 px-6">Hearing Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">PDF & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {subpoenas.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                  <td className="py-4 px-6 font-mono font-black text-amber-700 dark:text-amber-400">
                    {sub.ref_number}
                  </td>
                  <td className="py-4 px-6">
                    <strong className="block text-slate-900 dark:text-white font-mono">{sub.case_number}</strong>
                    <span className="text-xs text-slate-500 line-clamp-1">{sub.reason}</span>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                    {sub.respondent}
                  </td>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                    {sub.complainant}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400">
                    <strong>{sub.hearing_date}</strong> at {sub.hearing_time}
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={sub.status}
                      onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                      className="px-2 py-1 rounded-lg border text-xs font-bold dark:bg-slate-900"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Issued">Issued</option>
                      <option value="Served">Served</option>
                      <option value="Attended">Attended</option>
                      <option value="Missed">Missed</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => generateSubpoenaPdf({
                        refNumber: sub.ref_number,
                        caseNumber: sub.case_number,
                        respondent: sub.respondent,
                        complainant: sub.complainant,
                        hearingDate: sub.hearing_date,
                        hearingTime: sub.hearing_time,
                        venue: sub.venue,
                        reason: sub.reason,
                        signatory: sub.signatory,
                        signatoryTitle: sub.signatory_title
                      })}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto shadow-xs"
                    >
                      <Download className="w-4 h-4" /> Export Letterhead PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ISSUE SUBPOENA MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border-4 border-amber-500 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Write & Issue Legal Subpoena (KP Form No. 9)
            </h3>

            <form onSubmit={handleCreateSubpoena} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1">Select Case / Report *</label>
                <select
                  value={selectedReportId}
                  onChange={(e) => handleSelectReport(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                  required
                >
                  {reports.map((r) => (
                    <option key={r.id} value={r.id}>{r.ref_number} - {r.title} ({r.resident_name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Barangay Case Number *</label>
                  <input
                    type="text"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Respondent (Pinapatawag) *</label>
                  <input
                    type="text"
                    value={respondent}
                    onChange={(e) => setRespondent(e.target.value)}
                    placeholder="Full name of respondent"
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Complainant (Nagsusumbong) *</label>
                  <input
                    type="text"
                    value={complainant}
                    onChange={(e) => setComplainant(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Reason / Cause of Action *</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Hearing Date *</label>
                  <input
                    type="date"
                    value={hearingDate}
                    onChange={(e) => setHearingDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Hearing Time *</label>
                  <input
                    type="text"
                    value={hearingTime}
                    onChange={(e) => setHearingTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Venue *</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Official Signatory *</label>
                  <input
                    type="text"
                    value={signatory}
                    onChange={(e) => setSignatory(e.target.value)}
                    placeholder="Official Signatory Name (e.g. Punong Barangay)"
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Signatory Title</label>
                  <input
                    type="text"
                    value={signatoryTitle}
                    onChange={(e) => setSignatoryTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md"
                >
                  Issue Subpoena & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

