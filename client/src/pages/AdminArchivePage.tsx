import React, { useState, useEffect } from 'react';
import {
  Archive, RotateCcw, Search, Filter, ShieldAlert,
  AlertTriangle, CheckCircle2, Clock, Lock, ArrowLeft, Volume2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

export const AdminArchivePage: React.FC = () => {
  const { user } = useAuth();
  const { speak } = useAccessibility();
  const isSuperAdmin = user?.role === 'super_admin';

  const [items, setItems] = useState<any[]>([]);
  const [restoreRequests, setRestoreRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'items' | 'requests'>('items');

  // Super Admin Restore modal
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [superAdminPassword, setSuperAdminPassword] = useState<string>('');
  const [restoreError, setRestoreError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Admin Request Restore modal
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [requestReason, setRequestReason] = useState<string>('');
  const [requestSuccess, setRequestSuccess] = useState<string>('');

  const token = localStorage.getItem('bensican_token');

  const loadArchive = () => {
    setLoading(true);
    let url = '/api/archive?';
    if (filterType) url += `type=${filterType}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.items) setItems(data.items);
        if (data.restoreRequests) setRestoreRequests(data.restoreRequests);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadArchive();
  }, [filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadArchive();
  };

  // Super Admin direct restore
  const handleDirectRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superAdminPassword) {
      setRestoreError('Super Admin password is required to verify your identity.');
      return;
    }

    setSubmitting(true);
    setRestoreError('');
    try {
      const res = await fetch('/api/archive/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          itemType: selectedItem.item_type,
          itemId: selectedItem.id,
          superAdminPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setRestoreError(data.error || 'Failed to restore item.');
      } else {
        setShowRestoreModal(false);
        setSuperAdminPassword('');
        setSelectedItem(null);
        loadArchive();
      }
    } catch {
      setRestoreError('Network error while restoring item.');
    } finally {
      setSubmitting(false);
    }
  };

  // Admin request restore
  const handleRequestRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestReason.trim()) {
      setRestoreError('Please provide a reason for the restore request.');
      return;
    }

    setSubmitting(true);
    setRestoreError('');
    try {
      const res = await fetch('/api/archive/request-restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          itemType: selectedItem.item_type,
          itemId: selectedItem.id,
          itemName: selectedItem.title,
          reason: requestReason.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setRestoreError(data.error || 'Failed to send restore request.');
      } else {
        setRequestSuccess('Your restore request has been submitted to the Super Admin.');
        setTimeout(() => {
          setShowRequestModal(false);
          setRequestReason('');
          setRequestSuccess('');
          setSelectedItem(null);
          loadArchive();
        }, 1500);
      }
    } catch {
      setRestoreError('Network error while submitting request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getItemTypeBadge = (type: string) => {
    switch (type) {
      case 'report':
        return <span className="bg-amber-100 text-amber-800 text-sm font-bold px-3 py-1 rounded-full uppercase">Report</span>;
      case 'hearing':
        return <span className="bg-purple-100 text-purple-800 text-sm font-bold px-3 py-1 rounded-full uppercase">Hearing</span>;
      case 'subpoena':
        return <span className="bg-rose-100 text-rose-800 text-sm font-bold px-3 py-1 rounded-full uppercase">Subpoena</span>;
      case 'bill':
        return <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full uppercase">Financial Bill</span>;
      case 'user':
        return <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full uppercase">User Account</span>;
      case 'announcement':
        return <span className="bg-emerald-100 text-emerald-800 text-sm font-bold px-3 py-1 rounded-full uppercase">Announcement</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-sm font-bold px-3 py-1 rounded-full uppercase">{type}</span>;
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
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-1 focus:ring-2 focus:ring-amber-400"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-semibold pr-1">Back</span>
            </Link>
            <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-400/30">
              <Archive className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Barangay Archive & Recovery</h1>
                <button
                  type="button"
                  onClick={() => speak('Barangay Archive and Recovery. Records are never deleted. Admins can view and request restore; Super Admins can restore items with password.')}
                  className="p-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-amber-300 transition-colors"
                  title="Listen to overview"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-300 text-sm md:text-base mt-1">
                Records are permanently safeguarded under RA 10173 and DILG record retention policies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-700 text-xs font-semibold text-slate-200">
              {isSuperAdmin ? 'Full Recovery Authority' : 'Read & Request Authority'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('items')}
            className={`py-3 px-5 font-bold text-base border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'items'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Archive className="w-5 h-5" />
            Archived Items ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 px-5 font-bold text-base border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'requests'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
            Restore Requests ({restoreRequests.length})
          </button>
        </div>

        {activeTab === 'items' && (
          <div>
            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by reference, title, or reason..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-colors focus:ring-2 focus:ring-amber-400"
                >
                  Search
                </button>
              </form>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                {[
                  { id: '', label: 'All' },
                  { id: 'reports', label: 'Reports' },
                  { id: 'hearings', label: 'Hearings' },
                  { id: 'subpoenas', label: 'Subpoenas' },
                  { id: 'bills', label: 'Bills' },
                  { id: 'users', label: 'Users' },
                  { id: 'announcements', label: 'Notices' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterType(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                      filterType === cat.id
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Items List */}
            {loading ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Clock className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-300 font-semibold">Loading archived barangay records...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Archive is Clean</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">No archived records matching this criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <div
                    key={`${item.item_type}-${item.id}`}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {getItemTypeBadge(item.item_type)}
                        <span className="text-xs text-slate-400">
                          {new Date(item.archived_at).toLocaleDateString()} at {new Date(item.archived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                          {item.subtitle}
                        </p>
                      )}

                      <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-600/60 mb-4 text-xs space-y-1">
                        <p className="text-slate-500 dark:text-slate-400">
                          <strong className="text-slate-700 dark:text-slate-200">Archived By:</strong> {item.archived_by_name || 'System / Staff'}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          <strong className="text-slate-700 dark:text-slate-200">Archive Reason:</strong> {item.archive_reason || 'Administrative archiving'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      {isSuperAdmin ? (
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setRestoreError('');
                            setSuperAdminPassword('');
                            setShowRestoreModal(true);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-emerald-400"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Direct Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setRestoreError('');
                            setRequestReason('');
                            setShowRequestModal(true);
                          }}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-amber-400"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Request Restore
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Admin Restore Requests</h3>
                <span className="text-xs text-slate-500 font-semibold">
                  {restoreRequests.filter(r => r.status === 'Pending').length} Pending Requests
                </span>
              </div>

              {restoreRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No restore requests currently logged.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {restoreRequests.map(req => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            req.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {req.status}
                          </span>
                          <span className="text-xs uppercase font-semibold text-slate-400">
                            {req.item_type}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white text-base">
                          {req.item_name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          <strong className="text-slate-700 dark:text-slate-200">Requested by:</strong> {req.requester_name} &bull; <strong className="text-slate-700 dark:text-slate-200">Reason:</strong> {req.reason}
                        </p>
                      </div>

                      {isSuperAdmin && req.status === 'Pending' && (
                        <div>
                          <button
                            onClick={() => {
                              setSelectedItem({ item_type: req.item_type, id: req.item_id, title: req.item_name });
                              setRestoreError('');
                              setSuperAdminPassword('');
                              setShowRestoreModal(true);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-emerald-400"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve & Restore
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Super Admin Direct Restore Modal */}
      {showRestoreModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black">Restore Archived Record</h2>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              You are restoring <strong>{selectedItem.title}</strong> back into the active database. This item will become visible and active immediately.
            </p>

            <form onSubmit={handleDirectRestore} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Super Admin Password Required
                </label>
                <input
                  type="password"
                  required
                  value={superAdminPassword}
                  onChange={(e) => setSuperAdminPassword(e.target.value)}
                  placeholder="Enter your Super Admin password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {restoreError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{restoreError}</span>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? 'Restoring...' : 'Confirm Restore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Request Restore Modal */}
      {showRequestModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black">Request Record Restore</h2>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              As an Admin, your request to restore <strong>{selectedItem.title}</strong> will be submitted to the Super Admin for authorization.
            </p>

            <form onSubmit={handleRequestRestore} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Reason for Restore Request *
                </label>
                <textarea
                  required
                  rows={3}
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Explain why this record needs to be restored to active status..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {restoreError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{restoreError}</span>
                </div>
              )}

              {requestSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{requestSuccess}</span>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

