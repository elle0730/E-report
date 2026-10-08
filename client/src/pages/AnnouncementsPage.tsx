import React, { useState, useEffect } from 'react';
import { Megaphone, Volume2, Calendar, AlertCircle, Pin, Tag } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { PageHeader } from '../components/PageHeader.js';

export const AnnouncementsPage: React.FC = () => {
  const { t, speak, isSpeaking, stopSpeaking } = useAccessibility();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('All');

  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if (data.announcements) {
          setAnnouncements(data.announcements);
        }
      })
      .catch(() => {});
  }, []);

  const groups = ['All', 'All Residents', 'Senior Citizens', 'Purok 1', 'Purok 2', 'Purok 3', 'Purok 4'];

  const filtered = selectedGroup === 'All'
    ? announcements
    : announcements.filter(a => a.target_group === selectedGroup || a.target_group === 'All Residents');

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      <PageHeader
        title={t('residentAnnouncements')}
        subtitle="Official community updates, emergency advisories, medical missions, and scheduled services."
        icon={Megaphone}
        badges={[`${announcements.length} Published Updates`, 'Official Bulletin']}
        backTo="/resident"
      />

      {/* Target group filter tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {groups.map((grp) => (
          <button
            key={grp}
            onClick={() => setSelectedGroup(grp)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              selectedGroup === grp
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-6 bg-white dark:bg-slate-800 rounded-3xl border-3 shadow-md space-y-3 transition ${
                item.is_pinned
                  ? 'border-amber-400 bg-amber-50/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  {item.is_pinned === 1 && (
                    <span className="p-1 bg-amber-400 text-slate-950 rounded-lg" title="Pinned Announcement">
                      <Pin className="w-4 h-4" />
                    </span>
                  )}
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {item.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-300">
                    <Tag className="w-3 h-3 inline mr-1" />
                    {item.target_group}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Posted by: <strong>{item.author_name || 'Barangay Office'}</strong> ({item.author_position || 'Staff'})
                </span>

                <button
                  onClick={() => speak(`${item.title}. ${item.content}`)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Listen Aloud</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border text-slate-500">
            No announcements found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

