import React, { useState, useEffect } from 'react';
import { Scale, Calendar, FileText, Download, Clock, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { PageHeader } from '../components/PageHeader.js';
import { generateSubpoenaPdf } from '../utils/pdfGenerators.js';

export const HearingsPage: React.FC = () => {
  const { t } = useAccessibility();
  const [hearings, setHearings] = useState<any[]>([]);
  const [subpoenas, setSubpoenas] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'hearings' | 'subpoenas'>('hearings');

  const token = localStorage.getItem('bensican_token');

  useEffect(() => {
    // Fetch user hearings
    fetch('/api/hearings', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.hearings) setHearings(data.hearings);
      })
      .catch(() => {});

    // Fetch user subpoenas
    fetch('/api/subpoenas', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.subpoenas) setSubpoenas(data.subpoenas);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      <PageHeader
        title={t('residentHearings')}
        subtitle="Official conciliation schedules and summons from the Lupong Tagapamayapa."
        icon={Scale}
        badges={[`${hearings.length} Scheduled Hearings`, `${subpoenas.length} Subpoenas`]}
        backTo="/resident"
      />

      {/* Tabs */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setActiveTab('hearings')}
          className={`px-6 py-2.5 rounded-2xl font-black text-base border-2 transition min-h-[48px] ${
            activeTab === 'hearings'
              ? 'bg-purple-600 text-white border-purple-700 shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
          }`}
        >
          Scheduled Hearings ({hearings.length})
        </button>
        <button
          onClick={() => setActiveTab('subpoenas')}
          className={`px-6 py-2.5 rounded-2xl font-black text-base border-2 transition min-h-[48px] ${
            activeTab === 'subpoenas'
              ? 'bg-purple-600 text-white border-purple-700 shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
          }`}
        >
          Official Subpoenas / Summons ({subpoenas.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'hearings' ? (
        <div className="space-y-4">
          {hearings.length > 0 ? (
            hearings.map((h) => (
              <div
                key={h.id}
                className="p-6 bg-white dark:bg-slate-800 rounded-3xl border-3 border-purple-200 dark:border-slate-700 shadow-md space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                  <div>
                    <span className="font-mono text-sm font-black text-purple-700 dark:text-purple-400">
                      {h.ref_number}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {h.purpose}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                    h.status === 'Scheduled' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {h.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600 shrink-0" />
                    <span>Date: <strong>{h.hearing_date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600 shrink-0" />
                    <span>Time: <strong>{h.hearing_time}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MapPin className="w-5 h-5 text-purple-600 shrink-0" />
                    <span>Venue: <strong>{h.venue}</strong></span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1 border">
                  <div>Parties Involved: <strong className="text-slate-900 dark:text-white">{h.parties_involved}</strong></div>
                  {h.minutes && <div>Minutes / Notes: <span>{h.minutes}</span></div>}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border text-slate-500">
              You have no scheduled hearings at this time.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {subpoenas.length > 0 ? (
            subpoenas.map((s) => (
              <div
                key={s.id}
                className="p-6 bg-white dark:bg-slate-800 rounded-3xl border-3 border-purple-200 dark:border-slate-700 shadow-md space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                  <div>
                    <span className="font-mono text-sm font-black text-purple-700 dark:text-purple-400">
                      {s.ref_number} (Case: {s.case_number})
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      Subpoena for: {s.respondent}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-300">
                    Status: {s.status}
                  </span>
                </div>

                <div className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
                  <div>Complainant: <strong>{s.complainant}</strong></div>
                  <div>Appearance Date: <strong>{s.hearing_date} at {s.hearing_time}</strong></div>
                  <div>Venue: <strong>{s.venue}</strong></div>
                  <div>Reason: <span>{s.reason}</span></div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => generateSubpoenaPdf({
                      refNumber: s.ref_number,
                      caseNumber: s.case_number,
                      respondent: s.respondent,
                      complainant: s.complainant,
                      hearingDate: s.hearing_date,
                      hearingTime: s.hearing_time,
                      venue: s.venue,
                      reason: s.reason,
                      signatory: s.signatory,
                      signatoryTitle: s.signatory_title
                    })}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow transition min-h-[48px]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official Summons PDF (KP Form 9)</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border text-slate-500">
              No official subpoenas have been issued for your concerns.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

