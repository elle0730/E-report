import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, Users, Plus, AlertTriangle,
  CheckCircle2, Scale, History, FileText, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageHeader } from '../components/PageHeader.js';

export const AdminHearingSchedulerPage: React.FC = () => {
  const { user } = useAuth();
  const [hearings, setHearings] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedHearing, setSelectedHearing] = useState<any>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);

  // Modals
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [showMinutesModal, setShowMinutesModal] = useState<boolean>(false);

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [rescheduleVenue, setRescheduleVenue] = useState<string>('');
  const [rescheduleNotes, setRescheduleNotes] = useState<string>('');
  const [rescheduleError, setRescheduleError] = useState<string>('');

  // Minutes & Outcome state
  const [minutesText, setMinutesText] = useState<string>('');
  const [outcomeText, setOutcomeText] = useState<string>('');
  const [statusUpdate, setStatusUpdate] = useState<string>('Completed');

  const token = localStorage.getItem('bensican_token');

  const loadHearings = () => {
    fetch('/api/hearings', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.hearings) setHearings(data.hearings);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadHearings();
  }, []);

  const openReschedule = (hearing: any) => {
    setSelectedHearing(hearing);
    setRescheduleDate(hearing.hearing_date);
    setRescheduleTime(hearing.hearing_time);
    setRescheduleVenue(hearing.venue);
    setRescheduleNotes('');
    setRescheduleError('');
    setShowRescheduleModal(true);
  };

  const openMinutes = (hearing: any) => {
    setSelectedHearing(hearing);
    setMinutesText(hearing.minutes || '');
    setOutcomeText(hearing.outcome || '');
    setStatusUpdate(hearing.status || 'Completed');
    setShowMinutesModal(true);
  };

  const openHistory = async (hearing: any) => {
    setSelectedHearing(hearing);
    try {
      const res = await fetch(`/api/hearings/${hearing.id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.history) setHistoryList(data.history);
    } catch (err) {}
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRescheduleError('');

    try {
      const res = await fetch(`/api/hearings/${selectedHearing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'Rescheduled',
          hearingDate: rescheduleDate,
          hearingTime: rescheduleTime,
          venue: rescheduleVenue,
          actionNotes: rescheduleNotes || 'Rescheduled schedule'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setShowRescheduleModal(false);
        loadHearings();
      } else {
        setRescheduleError(data.error || 'Failed to reschedule. Possible venue double-booking conflict.');
      }
    } catch (err) {
      setRescheduleError('Network error rescheduling.');
    }
  };

  const handleMinutesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/hearings/${selectedHearing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: statusUpdate,
          minutes: minutesText,
          outcome: outcomeText
        })
      });

      if (res.ok) {
        setShowMinutesModal(false);
        loadHearings();
      }
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      <PageHeader
        title="Barangay Hearing Scheduler & Mediation Center"
        subtitle="Lupong Tagapamayapa case proceedings, conflict and double-booking detection, minutes, and history."
        icon={Calendar}
        badges={[`${hearings.length} Total Hearings`, 'Lupon Tagapamayapa']}
        backTo={user?.role === 'super_admin' ? '/super-admin' : '/admin'}
        actions={
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'list' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'calendar' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              Calendar View
            </button>
          </div>
        }
      />

      {/* Main Content */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {hearings.map((h) => (
            <div
              key={h.id}
              className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-3 border-purple-200 dark:border-slate-700 shadow-md space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div>
                  <span className="font-mono text-sm font-black text-purple-700 dark:text-purple-400">
                    {h.ref_number} (Report: {h.report_ref_number})
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {h.purpose}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    h.status === 'Scheduled' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    h.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    'bg-slate-100 text-slate-800 border-slate-300'
                  }`}>
                    {h.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block font-bold">Schedule:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{h.hearing_date} at {h.hearing_time}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-bold">Venue:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{h.venue}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-bold">Parties:</span>
                  <span className="text-slate-700 dark:text-slate-300 line-clamp-1">{h.parties_involved}</span>
                </div>
              </div>

              {h.outcome && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs space-y-1 border border-emerald-200">
                  <strong className="text-emerald-900 dark:text-emerald-200 block">Hearing Outcome:</strong>
                  <p className="text-slate-700 dark:text-slate-300">{h.outcome}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => openHistory(h)}
                  className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1 hover:underline"
                >
                  <History className="w-4 h-4" /> View History & Reschedules
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => openReschedule(h)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => openMinutes(h)}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    Enter Minutes / Outcome
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Calendar Schedule Grid View */
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-3 border-purple-200 dark:border-slate-700 shadow-md space-y-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Upcoming Hearing Dates (Calendar Matrix)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {hearings.map((h) => (
              <div key={h.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-purple-200 dark:border-purple-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-purple-700">{h.hearing_date}</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400">{h.hearing_time}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2">
                  {h.purpose}
                </h3>
                <div className="text-xs text-slate-500 line-clamp-1">{h.venue}</div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => openMinutes(h)}
                    className="text-xs font-bold text-purple-600 hover:underline"
                  >
                    Manage Hearing →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL WITH DOUBLE-BOOKING CONFLICT WARNING */}
      {showRescheduleModal && selectedHearing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-purple-500 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Reschedule Hearing {selectedHearing.ref_number}
            </h3>

            {rescheduleError && (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-bold border border-red-300">
                {rescheduleError}
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1">New Date *</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">New Time *</label>
                <input
                  type="text"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Venue (Conflict Checked) *</label>
                <input
                  type="text"
                  value={rescheduleVenue}
                  onChange={(e) => setRescheduleVenue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Reason for Rescheduling</label>
                <textarea
                  rows={2}
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  placeholder="Explain why this hearing was moved..."
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MINUTES & OUTCOME MODAL */}
      {showMinutesModal && selectedHearing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-purple-500 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Meeting Minutes & Resolution Outcome: {selectedHearing.ref_number}
            </h3>

            <form onSubmit={handleMinutesSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1">Hearing Status:</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border font-bold dark:bg-slate-800"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed / Mediated</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Official Minutes (Buod ng Pinag-usapan):</label>
                <textarea
                  rows={4}
                  value={minutesText}
                  onChange={(e) => setMinutesText(e.target.value)}
                  placeholder="Record summary of discussion, Lupon observations, agreements..."
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Outcome / Kasunduan:</label>
                <textarea
                  rows={3}
                  value={outcomeText}
                  onChange={(e) => setOutcomeText(e.target.value)}
                  placeholder="Final resolution agreed upon by parties or certified for court..."
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMinutesModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold"
                >
                  Save Minutes & Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

