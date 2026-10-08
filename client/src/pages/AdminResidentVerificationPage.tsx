import React, { useState, useEffect } from 'react';
import {
  UserCheck, CheckCircle2, XCircle, AlertCircle, FileText,
  Search, ShieldAlert, Eye, UserX, Archive, Phone, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageHeader } from '../components/PageHeader.js';

export const AdminResidentVerificationPage: React.FC = () => {
  const { user } = useAuth();
  const [residents, setResidents] = useState<any[]>([]);
  const [statusTab, setStatusTab] = useState<string>('pending_verification');
  const [search, setSearch] = useState<string>('');
  const [selectedResident, setSelectedResident] = useState<any>(null);

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const token = localStorage.getItem('bensican_token');

  const loadResidents = () => {
    let url = `/api/users?role=resident&search=${encodeURIComponent(search)}`;
    if (statusTab !== 'all') url += `&status=${statusTab}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.users) setResidents(data.users);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadResidents();
  }, [statusTab, search]);

  const handleApprove = async (residentId: string) => {
    try {
      const res = await fetch(`/api/users/verify/${residentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'approve' })
      });

      if (res.ok) {
        setSelectedResident(null);
        loadResidents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim() || !selectedResident) return;

    try {
      const res = await fetch(`/api/users/verify/${selectedResident.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason: rejectionReason.trim()
        })
      });

      if (res.ok) {
        setShowRejectModal(false);
        setSelectedResident(null);
        loadResidents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (residentId: string, status: 'active' | 'suspended' | 'archived') => {
    try {
      const res = await fetch(`/api/users/status/${residentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setSelectedResident(null);
        loadResidents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <PageHeader
        title="Resident Verification & Account Approvals"
        subtitle="Review resident 4-step wizard submissions, valid IDs, and proof of residency in Barangay Bensican."
        icon={<UserCheck className="w-8 h-8 text-emerald-400" />}
        backTo="/admin/dashboard"
      />

      <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-fadeIn">

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusTab('pending_verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
            statusTab === 'pending_verification'
              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
          }`}
        >
          Waiting for Approval
        </button>
        <button
          onClick={() => setStatusTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
            statusTab === 'active'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
          }`}
        >
          Active Residents
        </button>
        <button
          onClick={() => setStatusTab('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
            statusTab === 'rejected'
              ? 'bg-red-600 text-white border-red-700 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setStatusTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
            statusTab === 'all'
              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
          }`}
        >
          All Accounts
        </button>
      </div>

      {/* Search Input */}
      <div className="max-w-md relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resident name, street, or email..."
          className="w-full px-4 py-2.5 pl-10 rounded-xl border text-sm dark:bg-slate-900 focus:border-emerald-600"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border-3 border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase text-xs font-bold border-b">
              <tr>
                <th className="py-4 px-6">Full Legal Name</th>
                <th className="py-4 px-6">Bensican Address</th>
                <th className="py-4 px-6">Contact Number</th>
                <th className="py-4 px-6">Proof Attached</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {residents.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                  <td className="py-4 px-6">
                    <strong className="block text-slate-900 dark:text-white text-base">{r.full_name}</strong>
                    <span className="text-xs text-slate-500">{r.email}</span>
                    {r.helper_name && (
                      <span className="block text-[10px] text-emerald-600 font-bold">Helper: {r.helper_name}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-slate-800 dark:text-slate-200">
                    <div>{r.house_number ? `${r.house_number}, ` : ''}{r.street}</div>
                    <span className="text-xs text-slate-500">{r.residency_length || 'Residency not specified'}</span>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-700 dark:text-slate-300">
                    {r.contact_number || 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    {r.valid_id_url ? (
                      <span className="text-xs font-bold text-emerald-600">✓ ID Attached</span>
                    ) : (
                      <span className="text-xs text-slate-400">No file</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${
                      r.status === 'pending_verification' ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300' :
                      r.status === 'active' ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300' :
                      r.status === 'suspended' ? 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300' :
                      'bg-red-100 text-red-900 border-red-300 dark:bg-red-950/60 dark:text-red-300'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${r.status === 'pending_verification' ? 'bg-amber-500 animate-pulse' : r.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {r.status === 'pending_verification' ? 'Waiting for approval' : r.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedResident(r)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Proof</span>
                      </button>

                      {r.status === 'pending_verification' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(r.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT PROOF MODAL */}
      {selectedResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Residency Verification: {selectedResident.full_name}
                </h2>
                <p className="text-sm text-slate-500">
                  Registered: {new Date(selectedResident.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedResident(null)}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Resident Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border">
              <div><span className="text-slate-500 block">Address:</span> <strong>{selectedResident.house_number ? `${selectedResident.house_number}, ` : ''}{selectedResident.street}, Barangay Bensican</strong></div>
              <div><span className="text-slate-500 block">Contact Phone:</span> <strong>{selectedResident.contact_number || 'N/A'}</strong></div>
              <div><span className="text-slate-500 block">Length of Residency:</span> <strong>{selectedResident.residency_length || 'N/A'}</strong></div>
              <div><span className="text-slate-500 block">Assisted by Helper:</span> <strong>{selectedResident.helper_name || 'Self-registered'}</strong></div>
            </div>

            {/* Proof Photos Side-by-side */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Uploaded Proofs:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl text-center space-y-2 border">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Valid ID / Residency Certificate</span>
                  {selectedResident.valid_id_url ? (
                    <img src={selectedResident.valid_id_url} alt="Valid ID" className="h-44 mx-auto object-cover rounded-xl border" />
                  ) : (
                    <div className="h-44 flex items-center justify-center text-slate-400 text-xs">No ID uploaded</div>
                  )}
                </div>

                <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl text-center space-y-2 border">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Selfie Photo</span>
                  {selectedResident.selfieUrl || selectedResident.selfie_url ? (
                    <img src={selectedResident.selfieUrl || selectedResident.selfie_url} alt="Selfie" className="h-44 mx-auto object-cover rounded-xl border" />
                  ) : (
                    <div className="h-44 flex items-center justify-center text-slate-400 text-xs">No selfie uploaded</div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange(selectedResident.id, 'suspended')}
                  className="px-3 py-2 bg-orange-100 text-orange-800 rounded-xl text-xs font-bold hover:bg-orange-200"
                >
                  Suspend Account
                </button>
                <button
                  onClick={() => handleStatusChange(selectedResident.id, 'archived')}
                  className="px-3 py-2 bg-slate-100 text-red-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Soft-Archive
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm"
                >
                  Reject Verification
                </button>
                <button
                  onClick={() => handleApprove(selectedResident.id)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm shadow-md"
                >
                  ✓ Approve & Activate Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-red-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-red-600">
              Reject Verification for {selectedResident.full_name}
            </h3>
            <p className="text-xs text-slate-500">
              Please state clearly why the application was rejected so the resident can correct it.
            </p>

            <div>
              <label className="block text-xs font-bold mb-1">Reason for Rejection *</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Example: Submitted ID photo was blurry or address does not show residency in Bensican."
                className="w-full p-2.5 rounded-xl border text-sm dark:bg-slate-800"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

