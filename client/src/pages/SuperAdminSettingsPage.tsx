import React, { useState, useEffect } from 'react';
import {
  Settings, Sliders, Bot, MapPin, FileText,
  DollarSign, Save, ShieldAlert, Lock, CheckCircle2,
  AlertTriangle, Plus, Trash2, ArrowLeft, Volume2, Download,
  Archive, RotateCcw, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { PageHeader } from '../components/PageHeader.js';

export const SuperAdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { speak } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'categories' | 'venues' | 'bills' | 'bensi' | 'barangay' | 'backup'>('categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Category modal
  const [showCatModal, setShowCatModal] = useState<boolean>(false);
  const [catForm, setCatForm] = useState({ id: '', name: '', icon: 'HelpCircle', description: '', sortOrder: 1 });

  // Venues & Bill types state
  const [venues, setVenues] = useState<string[]>([]);
  const [archivedVenues, setArchivedVenues] = useState<string[]>([]);
  const [newVenue, setNewVenue] = useState<string>('');
  const [archiveConfirmVenue, setArchiveConfirmVenue] = useState<string | null>(null);
  const [restoreConfirmVenue, setRestoreConfirmVenue] = useState<string | null>(null);

  const [billTypes, setBillTypes] = useState<string[]>([]);
  const [archivedBillTypes, setArchivedBillTypes] = useState<string[]>([]);
  const [newBillType, setNewBillType] = useState<string>('');

  // Confirmation modals for Archive and Restore
  const [archiveConfirmCategory, setArchiveConfirmCategory] = useState<string | null>(null);
  const [restoreConfirmCategory, setRestoreConfirmCategory] = useState<string | null>(null);

  // Bensi settings state
  const [bensiConfig, setBensiConfig] = useState<any>({
    enabled: true,
    name: 'Bensi',
    welcomeEn: 'Hello! I am Bensi, your Barangay AI assistant. How can I help you today?',
    welcomeTl: 'Kamusta! Ako si Bensi, ang inyong Barangay AI assistant. Paano kita matutulungan ngayon?',
    welcomeIl: 'Kablaaw! Siak ni Bensi, ti Barangay AI katulongan mo. Ania ti maitulong ko kenka ita nga aldaw?',
    allowedTopics: 'community concerns, sanitation, barangay clearance, hearings, office hours'
  });

  // Barangay info state
  const [barangayInfo, setBarangayInfo] = useState<any>({
    punongBarangay: 'Office of the Punong Barangay',
    secretary: 'Office of the Barangay Secretary',
    treasurer: 'Office of the Barangay Treasurer',
    address: 'Barangay Bensican Hall, San Nicolas, Pangasinan 2447',
    contactNumber: '(075) 572-2000 / 0917-800-BENSI',
    emergencyHotline: '0917-800-BENSI'
  });

  // Security password modal
  const [superAdminPassword, setSuperAdminPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const token = localStorage.getItem('bensican_token');

  const loadSettings = () => {
    setLoading(true);
    fetch('/api/settings/all', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
        if (data.settings) {
          setSettings(data.settings);
          if (data.settings.venues) setVenues(data.settings.venues);
          if (data.settings.archived_venues) setArchivedVenues(data.settings.archived_venues);
          if (data.settings.bill_types) setBillTypes(data.settings.bill_types);
          if (data.settings.archived_bill_types) setArchivedBillTypes(data.settings.archived_bill_types);
          if (data.settings.bensi_config) setBensiConfig(data.settings.bensi_config);
          if (data.settings.barangay_info) setBarangayInfo(data.settings.barangay_info);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSetting = async (key: string, value: any, requirePassword = false) => {
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ value, superAdminPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to update setting.');
      } else {
        setSuccessMsg(`Setting "${key}" updated successfully.`);
        setSuperAdminPassword('');
        setTimeout(() => setSuccessMsg(''), 3000);
        loadSettings();
      }
    } catch {
      setErrorMsg('Network error while updating setting.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/settings/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: catForm.id || undefined,
          name: catForm.name,
          icon: catForm.icon,
          description: catForm.description,
          sortOrder: catForm.sortOrder
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save category.');
      } else {
        setShowCatModal(false);
        setCatForm({ id: '', name: '', icon: 'HelpCircle', description: '', sortOrder: 1 });
        setSuccessMsg(data.message);
        setTimeout(() => setSuccessMsg(''), 3000);
        loadSettings();
      }
    } catch {
      setErrorMsg('Network error while saving category.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddVenue = () => {
    if (!newVenue.trim()) return;
    const updated = [...venues, newVenue.trim()];
    setVenues(updated);
    setNewVenue('');
    handleSaveSetting('venues', updated);
  };

  const handleArchiveVenue = (venue: string) => {
    const updatedActive = venues.filter(v => v !== venue);
    const updatedArchived = [...archivedVenues, venue];
    setVenues(updatedActive);
    setArchivedVenues(updatedArchived);
    handleSaveSetting('venues', updatedActive);
    handleSaveSetting('archived_venues', updatedArchived);
    setArchiveConfirmVenue(null);
  };

  const handleRestoreVenue = (venue: string) => {
    const updatedArchived = archivedVenues.filter(v => v !== venue);
    const updatedActive = [...venues, venue];
    setVenues(updatedActive);
    setArchivedVenues(updatedArchived);
    handleSaveSetting('venues', updatedActive);
    handleSaveSetting('archived_venues', updatedArchived);
    setRestoreConfirmVenue(null);
  };

  const handleAddBillType = () => {
    if (!newBillType.trim()) return;
    const updated = [...billTypes, newBillType.trim()];
    setBillTypes(updated);
    setNewBillType('');
    handleSaveSetting('bill_types', updated);
  };

  const handleArchiveBillType = (category: string) => {
    const updatedActive = billTypes.filter(bt => bt !== category);
    const updatedArchived = [...archivedBillTypes, category];
    setBillTypes(updatedActive);
    setArchivedBillTypes(updatedArchived);
    handleSaveSetting('bill_types', updatedActive);
    handleSaveSetting('archived_bill_types', updatedArchived);
    setArchiveConfirmCategory(null);
  };

  const handleRestoreBillType = (category: string) => {
    const updatedArchived = archivedBillTypes.filter(bt => bt !== category);
    const updatedActive = [...billTypes, category];
    setBillTypes(updatedActive);
    setArchivedBillTypes(updatedArchived);
    handleSaveSetting('bill_types', updatedActive);
    handleSaveSetting('archived_bill_types', updatedArchived);
    setRestoreConfirmCategory(null);
  };

  const handleExportBackup = () => {
    // Generate clean JSON download of settings and tables
    const exportBundle = {
      barangay: 'Barangay Bensican, San Nicolas, Pangasinan',
      exportedAt: new Date().toISOString(),
      exportedBy: user?.fullName,
      settings,
      categories,
      venues,
      billTypes,
      bensiConfig,
      barangayInfo
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bensican_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <PageHeader
        title="Master System Settings"
        subtitle="Configure core barangay operations, concern categories, hearing venues, and financial transparency categories."
        icon={<Settings className="w-8 h-8 text-purple-400" />}
        backTo="/admin/dashboard"
        actions={
          <button
            onClick={handleExportBackup}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export System Backup</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700 mb-6 gap-2">
          {[
            { id: 'categories', label: 'Concern Categories', icon: Sliders },
            { id: 'venues', label: 'Hearing Venues', icon: MapPin },
            { id: 'bills', label: 'Bill Types', icon: DollarSign },
            { id: 'bensi', label: 'Bensi AI Assistant', icon: Bot },
            { id: 'barangay', label: 'Barangay Profile', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

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

        {/* 1. CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Resident Concern Categories</h2>
                <p className="text-xs text-slate-500 mt-0.5">Define classifications for community reporting.</p>
              </div>
              <button
                onClick={() => {
                  setCatForm({ id: '', name: '', icon: 'AlertTriangle', description: '', sortOrder: categories.length + 1 });
                  setShowCatModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg">
                        Order #{cat.sort_order}
                      </span>
                      {cat.is_archived === 1 && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase">Archived</span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{cat.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{cat.description || 'No description provided.'}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setCatForm({
                          id: cat.id,
                          name: cat.name,
                          icon: cat.icon || 'HelpCircle',
                          description: cat.description || '',
                          sortOrder: cat.sort_order
                        });
                        setShowCatModal(true);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Edit Category
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. VENUES TAB */}
        {activeTab === 'venues' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lupong Tagapamayapa Hearing Venues</h2>
              <p className="text-xs text-slate-500 mt-0.5">Physical rooms or conference areas available for conciliation hearings.</p>
            </div>

            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                placeholder="e.g. Lupon Conference Room A"
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm dark:bg-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddVenue}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
              >
                Add Venue
              </button>
            </div>

            {/* ACTIVE VENUES */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                Active Venues ({venues.length})
              </span>
              <div className="space-y-2 max-w-lg">
                {venues.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-sm">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{v}</span>
                    <button
                      type="button"
                      onClick={() => setArchiveConfirmVenue(v)}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-900 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition border border-amber-300 dark:border-amber-700"
                      title="Archive this venue"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ARCHIVED VENUES (REVERSIBLE) */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 block flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5 text-slate-400" />
                <span>Archived Venues ({archivedVenues.length})</span>
              </span>

              {archivedVenues.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No archived venues.</p>
              ) : (
                <div className="space-y-2 max-w-lg">
                  {archivedVenues.map((av, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-900 text-sm">
                      <span className="font-medium text-slate-500 dark:text-slate-400 line-through">{av}</span>
                      <button
                        type="button"
                        onClick={() => setRestoreConfirmVenue(av)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition border border-emerald-300 dark:border-emerald-700"
                        title="Restore venue"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. BILL TYPES TAB */}
        {activeTab === 'bills' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Financial Transparency Bill Categories</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage active and archived expense classifications for official public records.</p>
            </div>

            {/* Add New Category Input */}
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newBillType}
                onChange={(e) => setNewBillType(e.target.value)}
                placeholder="e.g. Garbage Collection Services"
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm dark:bg-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddBillType}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
              >
                Add Category
              </button>
            </div>

            {/* ACTIVE CATEGORIES */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                Active Categories ({billTypes.length})
              </span>
              <div className="space-y-2 max-w-lg">
                {billTypes.map((bt, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-sm">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{bt}</span>
                    <button
                      type="button"
                      onClick={() => setArchiveConfirmCategory(bt)}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-900 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition border border-amber-300 dark:border-amber-700"
                      title="Archive this category"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ARCHIVED CATEGORIES (REVERSIBLE) */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 block flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5 text-slate-400" />
                <span>Archived Categories ({archivedBillTypes.length})</span>
              </span>

              {archivedBillTypes.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No archived categories.</p>
              ) : (
                <div className="space-y-2 max-w-lg">
                  {archivedBillTypes.map((abt, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-900 text-sm">
                      <span className="font-medium text-slate-500 dark:text-slate-400 line-through">{abt}</span>
                      <button
                        type="button"
                        onClick={() => setRestoreConfirmCategory(abt)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition border border-emerald-300 dark:border-emerald-700"
                        title="Restore category"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ARCHIVE CONFIRMATION MODAL */}
            {archiveConfirmCategory && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white dark:bg-slate-900 border-4 border-amber-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 dark:bg-amber-950 rounded-2xl text-amber-700">
                      <Archive className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Archive Financial Category?</h3>
                      <p className="text-xs text-slate-500">Category: {archiveConfirmCategory}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Are you sure you want to archive <strong>"{archiveConfirmCategory}"</strong>? It will no longer appear on new bill entries but existing records will remain preserved, and you can restore it at any time.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setArchiveConfirmCategory(null)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchiveBillType(archiveConfirmCategory)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm"
                    >
                      Confirm Archive
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* RESTORE CONFIRMATION MODAL */}
            {restoreConfirmCategory && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-2xl text-emerald-700">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Restore Financial Category?</h3>
                      <p className="text-xs text-slate-500">Category: {restoreConfirmCategory}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Restore <strong>"{restoreConfirmCategory}"</strong> back to active financial bill categories? It will immediately become available again for new public expenditure ledger entries.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRestoreConfirmCategory(null)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRestoreBillType(restoreConfirmCategory)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm"
                    >
                      Confirm Restore
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VENUE ARCHIVE CONFIRMATION MODAL */}
            {archiveConfirmVenue && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white dark:bg-slate-900 border-4 border-amber-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 dark:bg-amber-950 rounded-2xl text-amber-700">
                      <Archive className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Archive Hearing Venue?</h3>
                      <p className="text-xs text-slate-500">Venue: {archiveConfirmVenue}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Are you sure you want to archive <strong>"{archiveConfirmVenue}"</strong>? It will no longer appear in new hearing mediation schedules, but past hearing minutes will be preserved, and you can restore it at any time.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setArchiveConfirmVenue(null)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchiveVenue(archiveConfirmVenue)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm"
                    >
                      Confirm Archive
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VENUE RESTORE CONFIRMATION MODAL */}
            {restoreConfirmVenue && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-2xl text-emerald-700">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Restore Hearing Venue?</h3>
                      <p className="text-xs text-slate-500">Venue: {restoreConfirmVenue}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Restore <strong>"{restoreConfirmVenue}"</strong> back to active Lupong Tagapamayapa hearing venues? It will immediately become available again for mediation hearings and summons.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRestoreConfirmVenue(null)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRestoreVenue(restoreConfirmVenue)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm"
                    >
                      Confirm Restore
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. BENSI AI TAB */}
        {activeTab === 'bensi' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-500" />
                  Bensi AI Assistant Configuration
                </h2>
                <p className="text-xs text-slate-500 mt-1">Tune greetings, allowed topics, and automated handover triggers.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bensiConfig.enabled}
                  onChange={(e) => setBensiConfig({ ...bensiConfig, enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Bensi Enabled</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">English Welcome Message</label>
                <textarea
                  rows={2}
                  value={bensiConfig.welcomeEn || ''}
                  onChange={(e) => setBensiConfig({ ...bensiConfig, welcomeEn: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tagalog Welcome Message</label>
                <textarea
                  rows={2}
                  value={bensiConfig.welcomeTl || ''}
                  onChange={(e) => setBensiConfig({ ...bensiConfig, welcomeTl: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ilocano Welcome Message</label>
                <textarea
                  rows={2}
                  value={bensiConfig.welcomeIl || ''}
                  onChange={(e) => setBensiConfig({ ...bensiConfig, welcomeIl: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Allowed Knowledge Topics</label>
                <input
                  type="text"
                  value={bensiConfig.allowedTopics || ''}
                  onChange={(e) => setBensiConfig({ ...bensiConfig, allowedTopics: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm"
                />
              </div>

              <div className="pt-2 border-t">
                <label className="block text-xs font-bold text-indigo-700 uppercase mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Super Admin Password to Save *
                </label>
                <input
                  type="password"
                  value={superAdminPassword}
                  onChange={(e) => setSuperAdminPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 rounded-xl border text-sm"
                />
              </div>

              <button
                onClick={() => handleSaveSetting('bensi_config', bensiConfig, true)}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Bensi Configuration
              </button>
            </div>
          </div>
        )}

        {/* 5. BARANGAY PROFILE TAB */}
        {activeTab === 'barangay' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 max-w-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Official Barangay Governance Profile</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Punong Barangay (Barangay Captain)</label>
                <input
                  type="text"
                  value={barangayInfo.punongBarangay || ''}
                  onChange={(e) => setBarangayInfo({ ...barangayInfo, punongBarangay: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Barangay Secretary</label>
                  <input
                    type="text"
                    value={barangayInfo.secretary || ''}
                    onChange={(e) => setBarangayInfo({ ...barangayInfo, secretary: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Barangay Treasurer</label>
                  <input
                    type="text"
                    value={barangayInfo.treasurer || ''}
                    onChange={(e) => setBarangayInfo({ ...barangayInfo, treasurer: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Barangay Hall Address</label>
                <input
                  type="text"
                  value={barangayInfo.address || ''}
                  onChange={(e) => setBarangayInfo({ ...barangayInfo, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Emergency 24/7 Hotline</label>
                <input
                  type="text"
                  value={barangayInfo.emergencyHotline || ''}
                  onChange={(e) => setBarangayInfo({ ...barangayInfo, emergencyHotline: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm"
                />
              </div>

              <div className="pt-2 border-t">
                <label className="block text-xs font-bold text-indigo-700 uppercase mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Super Admin Password to Save *
                </label>
                <input
                  type="password"
                  value={superAdminPassword}
                  onChange={(e) => setSuperAdminPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 rounded-xl border text-sm"
                />
              </div>

              <button
                onClick={() => handleSaveSetting('barangay_info', barangayInfo, true)}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Barangay Profile
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-black mb-4 text-indigo-600">
              {catForm.id ? 'Edit Category' : 'Create Concern Category'}
            </h2>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Road Hazard / Pothole"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Brief guidance for residents when choosing this category..."
                  className="w-full px-4 py-2.5 rounded-xl border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sort Priority</label>
                <input
                  type="number"
                  value={catForm.sortOrder}
                  onChange={(e) => setCatForm({ ...catForm, sortOrder: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 rounded-xl border text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

