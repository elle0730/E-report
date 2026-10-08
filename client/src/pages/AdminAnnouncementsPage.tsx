import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Pin, Edit, Archive, Volume2, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { PageHeader } from '../components/PageHeader.js';

export const AdminAnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const { speak } = useAccessibility();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Create / Edit modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [targetGroup, setTargetGroup] = useState<string>('All Residents');
  const [isPinned, setIsPinned] = useState<boolean>(false);

  // Archive modal
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [archiveReason, setArchiveReason] = useState<string>('');

  const token = localStorage.getItem('bensican_token');

  const loadAnnouncements = () => {
    fetch('/api/announcements', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.announcements) setAnnouncements(data.announcements);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setTargetGroup('All Residents');
    setIsPinned(false);
    setShowModal(true);
  };

  const openEdit = (a: any) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setTargetGroup(a.target_group);
    setIsPinned(a.is_pinned === 1);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/announcements/${editingId}` : '/api/announcements';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          targetGroup,
          isPinned
        })
      });

      if (res.ok) {
        setShowModal(false);
        loadAnnouncements();
      }
    } catch (err) {}
  };

  const handleArchive = async () => {
    if (!archiveId || !archiveReason.trim()) return;
    try {
      const res = await fetch(`/api/announcements/${archiveId}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: archiveReason })
      });
      if (res.ok) {
        setShowArchiveModal(false);
        loadAnnouncements();
      }
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      <PageHeader
        title="Community Announcements Manager"
        subtitle="Publish broadcast advisories, pin critical emergency alerts, and broadcast to targeted puroks."
        icon={Megaphone}
        badges={[`${announcements.length} Total Announcements`, user?.role === 'super_admin' ? 'Super Admin' : 'Admin Staff']}
        backTo={user?.role === 'super_admin' ? '/super-admin' : '/admin'}
        actions={
          <button
            onClick={openCreate}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow transition min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        }
      />

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a.id}
            className={`p-6 bg-white dark:bg-slate-800 rounded-3xl border-3 shadow-md space-y-3 ${
              a.is_pinned ? 'border-amber-400' : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-3">
              <div className="flex items-center gap-2">
                {a.is_pinned === 1 && (
                  <span className="p-1 bg-amber-400 text-slate-950 rounded-lg">
                    <Pin className="w-4 h-4" />
                  </span>
                )}
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{a.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 text-xs font-bold rounded-full">
                  <Tag className="w-3 h-3 inline mr-1" />
                  {a.target_group}
                </span>
                <span className="text-xs text-slate-500">{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="text-base text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">
              {a.content}
            </p>

            <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => speak(`${a.title}. ${a.content}`)}
                className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline"
              >
                <Volume2 className="w-4 h-4" /> Test Speech Audio
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(a)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setArchiveId(a.id);
                    setArchiveReason('');
                    setShowArchiveModal(true);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-red-600 rounded-lg text-xs font-bold"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {editingId ? 'Edit Announcement' : 'Create New Announcement'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Free Medical Checkup for Senior Citizens"
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Content / Body *</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type full announcement text..."
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Target Audience:</label>
                <select
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                >
                  <option value="All Residents">All Residents</option>
                  <option value="Senior Citizens">Senior Citizens</option>
                  <option value="Purok 1">Purok 1</option>
                  <option value="Purok 2">Purok 2</option>
                  <option value="Purok 3">Purok 3</option>
                  <option value="Purok 4">Purok 4</option>
                  <option value="Youth Council (SK)">Youth Council (SK)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-xl border flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-5 h-5"
                />
                <label htmlFor="pinCheck" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Pin this announcement to top of portal
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARCHIVE MODAL */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-red-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-red-600">Soft-Archive Announcement</h3>
            <div>
              <label className="block text-xs font-bold mb-1">Reason *</label>
              <textarea
                rows={2}
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="State reason..."
                className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowArchiveModal(false)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchive}
                className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

