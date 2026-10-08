import React, { useState, useEffect } from 'react';
import {
  Folder, FileText, Upload, Plus, Star, Search,
  ChevronRight, Archive, ShieldCheck, Download, X, Eye, File
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageHeader } from '../components/PageHeader.js';

export const AdminFilesPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'starred' | 'recent'>('all');
  const [selectedFileItem, setSelectedFileItem] = useState<any | null>(null);

  // New folder modal
  const [showFolderModal, setShowFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  // Upload file modal
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('/uploads/sample-case.pdf');

  // Archive modal
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false);
  const [archiveItem, setArchiveItem] = useState<any>(null);
  const [archiveReason, setArchiveReason] = useState<string>('');

  const token = localStorage.getItem('bensican_token');

  const loadItems = (folderId = currentFolderId) => {
    let url = `/api/files?filter=${filterMode}&search=${encodeURIComponent(search)}`;
    if (folderId && filterMode === 'all') url += `&parentId=${folderId}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.items) setItems(data.items);
        if (data.breadcrumbs) setBreadcrumbs(data.breadcrumbs);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadItems(currentFolderId);
  }, [currentFolderId, filterMode, search]);

  const navigateToFolder = (fId: string | null) => {
    setCurrentFolderId(fId);
    setFilterMode('all');
  };

  const toggleStar = async (itemId: string) => {
    try {
      const res = await fetch(`/api/files/${itemId}/star`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) loadItems();
    } catch (err) {}
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch('/api/files/folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentId: currentFolderId
        })
      });

      if (res.ok) {
        setShowFolderModal(false);
        setNewFolderName('');
        loadItems();
      }
    } catch (err) {}
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    try {
      const res = await fetch('/api/files/file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newFileName.trim(),
          parentId: currentFolderId,
          fileUrl
        })
      });

      if (res.ok) {
        setShowUploadModal(false);
        setNewFileName('');
        loadItems();
      }
    } catch (err) {}
  };

  const handleArchive = async () => {
    if (!archiveItem || !archiveReason.trim()) return;
    try {
      const res = await fetch(`/api/files/${archiveItem.id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: archiveReason })
      });

      if (res.ok) {
        setShowArchiveModal(false);
        loadItems();
      }
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <PageHeader
        title="Barangay Records Explorer (Barangay Drive)"
        subtitle="Unified document, report attachment, and public notice records system with versioning."
        icon={<Folder className="w-8 h-8 text-amber-400" />}
        backTo="/admin/dashboard"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setShowFolderModal(true)}
              className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>New Folder</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Record</span>
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-fadeIn">

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => { setFilterMode('all'); setCurrentFolderId(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === 'all' && !currentFolderId ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Root Folders
          </button>
          <button
            onClick={() => setFilterMode('starred')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === 'starred' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            ★ Starred Items
          </button>
          <button
            onClick={() => setFilterMode('recent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === 'recent' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Recent Documents
          </button>
        </div>

        <div className="max-w-xs w-full relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records and files..."
            className="w-full px-3 py-1.5 pl-8 rounded-lg border text-xs dark:bg-slate-900"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Breadcrumb Path */}
      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 px-1">
        <button
          onClick={() => navigateToFolder(null)}
          className="hover:text-emerald-600 hover:underline"
        >
          Barangay Drive
        </button>
        {breadcrumbs.map((b) => (
          <React.Fragment key={b.id}>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button
              onClick={() => navigateToFolder(b.id)}
              className="hover:text-emerald-600 hover:underline"
            >
              {b.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it) => {
          const isFolder = it.type === 'folder';
          return (
            <div
              key={it.id}
              onClick={() => isFolder ? navigateToFolder(it.id) : setSelectedFileItem(it)}
              className="group relative bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-500 hover:shadow-md transition space-y-3 flex flex-col justify-between cursor-pointer"
            >
              {/* Hover inspect badge */}
              <div className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {isFolder ? 'Open' : 'Preview'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div
                  className={`p-3 rounded-2xl ${isFolder ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'}`}
                >
                  {isFolder ? <Folder className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleStar(it.id)}
                    className={`p-1.5 rounded-lg transition ${it.is_starred ? 'text-amber-500 bg-amber-50 dark:bg-amber-950' : 'text-slate-300 hover:text-amber-400'}`}
                    title="Star / Unstar"
                  >
                    ★
                  </button>
                  <button
                    onClick={() => { setArchiveItem(it); setShowArchiveModal(true); }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg text-xs transition"
                    title="Archive item"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3
                  className={`font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 transition-colors`}
                >
                  {it.name}
                </h3>
                <span className="text-[10px] text-slate-400 block mt-0.5 truncate font-mono">
                  {it.path}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded font-bold">
                  {it.permissions}
                </span>
                {!isFolder && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFileItem(it);
                    }}
                    className="text-emerald-600 font-bold hover:underline flex items-center gap-1 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE FOLDER MODAL */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-amber-500 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Create New Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-3">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full p-2.5 rounded-xl border dark:bg-slate-800 text-sm font-bold"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowFolderModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD FILE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Add Document Entry</h3>
            <form onSubmit={handleCreateFile} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">File Name *</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. Case_Minutes_Oct2026.pdf"
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 text-sm font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">File URL *</label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 text-sm font-mono"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Save File</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARCHIVE MODAL */}
      {showArchiveModal && archiveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-red-500 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-red-600">Soft-Archive: {archiveItem.name}</h3>
            <div>
              <label className="block text-xs font-bold mb-1">Reason *</label>
              <textarea
                rows={2}
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="Reason..."
                className="w-full p-2.5 rounded-xl border text-sm dark:bg-slate-800"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowArchiveModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Cancel</button>
              <button type="button" onClick={handleArchive} className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold">Archive</button>
            </div>
          </div>
        </div>
      )}

      {/* FULL FILE DETAILS & VIEWER MODAL */}
      {selectedFileItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative text-slate-900 dark:text-white">
            <button
              onClick={() => setSelectedFileItem(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pr-8">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl text-emerald-700 dark:text-emerald-400">
                <FileText className="w-7 h-7" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Barangay Drive Record
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">
                  {selectedFileItem.name}
                </h3>
              </div>
            </div>

            {/* Preview Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              {selectedFileItem.file_url && (selectedFileItem.file_url.endsWith('.png') || selectedFileItem.file_url.endsWith('.jpg') || selectedFileItem.file_url.endsWith('.webp')) ? (
                <img
                  src={selectedFileItem.file_url}
                  alt={selectedFileItem.name}
                  className="max-h-56 mx-auto rounded-xl object-contain shadow-xs"
                />
              ) : (
                <div className="py-6 space-y-2">
                  <File className="w-16 h-16 text-emerald-600 mx-auto" />
                  <span className="text-xs text-slate-500 font-mono block">
                    {selectedFileItem.name}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold inline-block">
                    Official Barangay Document
                  </span>
                </div>
              )}
            </div>

            {/* File Metadata Details */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between pb-2">
                <span className="text-slate-500">Folder Path:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{selectedFileItem.path}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Access Permission:</span>
                <span className="font-bold text-emerald-600 uppercase">{selectedFileItem.permissions || 'Admin Read/Write'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Starred Status:</span>
                <span className="font-bold">{selectedFileItem.is_starred ? '★ Starred' : 'Normal'}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500">Record Classification:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Barangay Bensican Official Archive</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedFileItem(null)}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition"
              >
                Close
              </button>
              {selectedFileItem.file_url && (
                <a
                  href={selectedFileItem.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Open / Download</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

