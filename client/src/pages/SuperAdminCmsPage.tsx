import React, { useState, useEffect } from 'react';
import {
  Layout, Eye, Save, Send, RotateCcw, Lock,
  AlertTriangle, CheckCircle2, History, Palette,
  Sparkles, ArrowLeft, Volume2, Globe, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

export const SuperAdminCmsPage: React.FC = () => {
  const { user } = useAuth();
  const { speak } = useAccessibility();
  const isSuperAdmin = user?.role === 'super_admin';

  const [cmsData, setCmsData] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  // Content state for editing
  const [content, setContent] = useState<any>({
    hero: {
      headline: 'E-Report Barangay Bensican',
      tagline: 'Your Direct Bridge to Fast, Transparent Barangay Public Service',
      emergencyAlert: 'Barangay Health Center Free Medical Mission this Friday at the Bensican Plaza.'
    },
    about: {
      title: 'About Barangay Bensican',
      body: 'Located in the heart of San Nicolas, Pangasinan, Barangay Bensican is committed to sustainable, citizen-first governance aligning with UN Sustainable Development Goals 16, 11, and 9.',
      mission: 'To foster peace, rapid resolution of community concerns, and complete financial transparency for all residents.',
      vision: 'A progressive, safe, and digitally inclusive agricultural and residential community.'
    },
    contact: {
      hotline: '(075) 572-2000 / 0917-800-BENSI',
      email: 'bensican.sannicolas@gmail.com',
      address: 'Barangay Bensican Hall, San Nicolas, Pangasinan 2447',
      officeHours: 'Monday - Friday, 8:00 AM - 5:00 PM'
    },
    announcementsBanner: true
  });

  // Super Admin publish / rollback modal
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showRollbackModal, setShowRollbackModal] = useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [superAdminPassword, setSuperAdminPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const token = localStorage.getItem('bensican_token');

  const loadCms = () => {
    setLoading(true);
    fetch('/api/cms/current', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.published) {
          setCmsData(data.published);
        }
        if (data.draft) {
          setDraft(data.draft);
          setContent(data.draft.content);
        } else if (data.published) {
          setContent(data.published.content);
        }
        if (data.versions) {
          setVersions(data.versions);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCms();
  }, []);

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/cms/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save draft.');
      } else {
        setSuccessMsg(data.message);
        setTimeout(() => setSuccessMsg(''), 3000);
        loadCms();
      }
    } catch {
      setErrorMsg('Network error while saving draft.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superAdminPassword) {
      setErrorMsg('Super Admin password is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/cms/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          draftId: draft?.id,
          superAdminPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to publish draft.');
      } else {
        setSuccessMsg(data.message);
        setShowPublishModal(false);
        setSuperAdminPassword('');
        setTimeout(() => setSuccessMsg(''), 3000);
        loadCms();
      }
    } catch {
      setErrorMsg('Network error while publishing draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superAdminPassword || selectedVersion === null) {
      setErrorMsg('Super Admin password is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/cms/rollback/${selectedVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ superAdminPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to rollback version.');
      } else {
        setSuccessMsg(data.message);
        setShowRollbackModal(false);
        setSuperAdminPassword('');
        setSelectedVersion(null);
        setTimeout(() => setSuccessMsg(''), 3000);
        loadCms();
      }
    } catch {
      setErrorMsg('Network error while rolling back version.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-800 text-white border-b border-slate-700 py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              to="/admin/dashboard"
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-1 focus:ring-2 focus:ring-blue-400"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-semibold pr-1">Back</span>
            </Link>
            <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-400/30">
              <Layout className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Landing Page CMS</h1>
                <button
                  type="button"
                  onClick={() => speak('Landing Page CMS. Admins can edit and save drafts. Super Admin can approve, publish live, and manage version history.')}
                  className="p-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-blue-300 transition-colors"
                  title="Listen to overview"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-300 text-sm md:text-base mt-1">
                Manage public website copy, emergency alerts, mission/vision, and contact information.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? 'Exit Preview' : 'Live Preview'}</span>
            </button>
            <Link
              to="/"
              target="_blank"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>View Live Website</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Status Notification */}
        {draft && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 p-4 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                  Unpublished Draft Saved
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Last updated by {draft.draft_saved_by_name || 'Admin'} on {new Date(draft.updated_at).toLocaleString()}.
                  {isSuperAdmin ? ' You can review and publish this draft directly.' : ' Waiting for Super Admin approval to publish live.'}
                </p>
              </div>
            </div>

            {isSuperAdmin && (
              <button
                onClick={() => {
                  setErrorMsg('');
                  setSuperAdminPassword('');
                  setShowPublishModal(true);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Approve & Publish Live</span>
              </button>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {previewMode ? (
          /* PREVIEW SIMULATOR */
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl space-y-8 animate-fadeIn">
            <div className="border-b pb-4 flex justify-between items-center">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                <Eye className="w-4 h-4" /> Live Website Preview
              </span>
              <button
                onClick={() => setPreviewMode(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Close Preview
              </button>
            </div>

            {/* Emergency Banner Preview */}
            {content.hero?.emergencyAlert && (
              <div className="bg-amber-500 text-white p-3 rounded-2xl text-center text-sm font-bold shadow-sm">
                📢 {content.hero.emergencyAlert}
              </div>
            )}

            {/* Hero Section Preview */}
            <div className="text-center py-12 px-4 bg-gradient-to-b from-blue-50 to-slate-50 dark:from-slate-850 dark:to-slate-800 rounded-3xl">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {content.hero?.headline}
              </h2>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mt-4 max-w-2xl mx-auto">
                {content.hero?.tagline}
              </p>
            </div>

            {/* About Section Preview */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{content.about?.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">{content.about?.body}</p>
                <div className="space-y-2 text-xs">
                  <p><strong>Mission:</strong> {content.about?.mission}</p>
                  <p><strong>Vision:</strong> {content.about?.vision}</p>
                </div>
              </div>

              {/* Contact Info Preview */}
              <div className="p-6 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Barangay Hall Contact</h3>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p>📞 <strong>Hotline:</strong> {content.contact?.hotline}</p>
                  <p>✉️ <strong>Email:</strong> {content.contact?.email}</p>
                  <p>📍 <strong>Address:</strong> {content.contact?.address}</p>
                  <p>🕒 <strong>Hours:</strong> {content.contact?.officeHours}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CMS EDITORS */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSaveDraft} className="lg:col-span-2 space-y-6">
              {/* Hero Banner Editor */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-500" />
                  Hero Banner & Announcements
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Main Headline Title
                  </label>
                  <input
                    type="text"
                    value={content.hero?.headline || ''}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, headline: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Tagline / Subheading
                  </label>
                  <input
                    type="text"
                    value={content.hero?.tagline || ''}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, tagline: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Emergency Alert Marquee Text (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={content.hero?.emergencyAlert || ''}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, emergencyAlert: e.target.value } })}
                    placeholder="Leave blank if no urgent advisory..."
                    className="w-full px-4 py-2.5 rounded-xl border text-sm dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              {/* About Bensican Editor */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  About Barangay & SDG Alignment
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={content.about?.title || ''}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, title: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Barangay Profile & Overview
                  </label>
                  <textarea
                    rows={3}
                    value={content.about?.body || ''}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, body: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Official Mission
                    </label>
                    <textarea
                      rows={2}
                      value={content.about?.mission || ''}
                      onChange={(e) => setContent({ ...content, about: { ...content.about, mission: e.target.value } })}
                      className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Official Vision
                    </label>
                    <textarea
                      rows={2}
                      value={content.about?.vision || ''}
                      onChange={(e) => setContent({ ...content, about: { ...content.about, vision: e.target.value } })}
                      className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Editor */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Barangay Hall Contact Information
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Official Hotline Phone(s)
                    </label>
                    <input
                      type="text"
                      value={content.contact?.hotline || ''}
                      onChange={(e) => setContent({ ...content, contact: { ...content.contact, hotline: e.target.value } })}
                      className="w-full px-4 py-2 rounded-xl border text-sm dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={content.contact?.email || ''}
                      onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                      className="w-full px-4 py-2 rounded-xl border text-sm dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Physical Hall Address
                  </label>
                  <input
                    type="text"
                    value={content.contact?.address || ''}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, address: e.target.value } })}
                    className="w-full px-4 py-2 rounded-xl border text-sm dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Office Hours
                  </label>
                  <input
                    type="text"
                    value={content.contact?.officeHours || ''}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, officeHours: e.target.value } })}
                    className="w-full px-4 py-2 rounded-xl border text-sm dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Draft...' : 'Save As Draft'}</span>
                </button>
              </div>
            </form>

            {/* Sidebar: Version History & Rollback */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-500" />
                  Version History & Rollback
                </h3>

                <div className="space-y-3">
                  {versions.length === 0 ? (
                    <p className="text-xs text-slate-500">No previous versions archived.</p>
                  ) : (
                    versions.map(v => (
                      <div
                        key={v.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          v.is_published
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            Version {v.version} {v.is_published && '(CURRENT LIVE)'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(v.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-500">
                          By: {v.saved_by_name || 'Admin'} {v.approved_by_name ? `• Published by: ${v.approved_by_name}` : ''}
                        </p>

                        {isSuperAdmin && !v.is_published && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVersion(v.version);
                                setErrorMsg('');
                                setSuperAdminPassword('');
                                setShowRollbackModal(true);
                              }}
                              className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Rollback To V{v.version}
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Super Admin Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-black mb-2 text-emerald-600 flex items-center gap-2">
              <Send className="w-5 h-5" />
              Publish Landing Page
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              This action will publish all changes live to <strong>bensican.gov.ph</strong>. All visitors will see the updated content immediately.
            </p>

            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Super Admin Password Required *
                </label>
                <input
                  type="password"
                  required
                  value={superAdminPassword}
                  onChange={(e) => setSuperAdminPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 text-sm"
                />
              </div>

              {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 rounded-xl border text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md"
                >
                  {saving ? 'Publishing...' : 'Confirm Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Rollback Modal */}
      {showRollbackModal && selectedVersion !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-black mb-2 text-purple-600 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Rollback to Version {selectedVersion}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              The public landing page will revert back to version {selectedVersion}.
            </p>

            <form onSubmit={handleRollback} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-purple-700 dark:text-purple-300 uppercase mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Super Admin Password Required *
                </label>
                <input
                  type="password"
                  required
                  value={superAdminPassword}
                  onChange={(e) => setSuperAdminPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-xl border border-purple-300 text-sm"
                />
              </div>

              {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRollbackModal(false)}
                  className="px-4 py-2 rounded-xl border text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-md"
                >
                  {saving ? 'Reverting...' : 'Confirm Rollback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

