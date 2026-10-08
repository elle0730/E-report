import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet, Plus, Edit2, Archive, CheckCircle2,
  Clock, AlertTriangle, FileText, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageHeader } from '../components/PageHeader.js';
import { VoucherModal, BillVoucherData } from '../components/VoucherModal.js';

export const AdminBillsPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [bills, setBills] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalAmount: 0, paidAmount: 0, unpaidAmount: 0, overdueAmount: 0, totalCount: 0 });
  const [billTypes, setBillTypes] = useState<string[]>([]);
  const [selectedVoucherBill, setSelectedVoucherBill] = useState<BillVoucherData | null>(null);

  // Add bill modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [payee, setPayee] = useState<string>('');
  const [billType, setBillType] = useState<string>('Electricity (Pangasinan Electric Cooperative)');
  const [status, setStatus] = useState<string>('Unpaid');

  // Edit bill modal (Super admin only)
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  // Archive modal with password check (Super admin only)
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false);
  const [archiveReason, setArchiveReason] = useState<string>('');
  const [superAdminPassword, setSuperAdminPassword] = useState<string>('');
  const [archiveError, setArchiveError] = useState<string>('');

  const token = localStorage.getItem('bensican_token');

  const loadBills = () => {
    fetch('/api/bills', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.bills) setBills(data.bills);
        if (data.summary) setSummary(data.summary);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadBills();

    fetch('/api/settings/public', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.billTypes) setBillTypes(data.billTypes);
      })
      .catch(() => {});
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          dueDate,
          payee,
          billType,
          status
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setTitle('');
        setAmount('');
        setDueDate('');
        setPayee('');
        loadBills();
      }
    } catch (err) {}
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      const res = await fetch(`/api/bills/${selectedBill.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: selectedBill.title,
          amount: parseFloat(selectedBill.amount),
          dueDate: selectedBill.due_date,
          payee: selectedBill.payee,
          status: selectedBill.status
        })
      });

      if (res.ok) {
        setShowEditModal(false);
        loadBills();
      }
    } catch (err) {}
  };

  const handleArchiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setArchiveError('');
    if (!selectedBill) return;

    try {
      const res = await fetch(`/api/bills/${selectedBill.id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: archiveReason,
          superAdminPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        setShowArchiveModal(false);
        setSuperAdminPassword('');
        setArchiveReason('');
        loadBills();
      } else {
        setArchiveError(data.error || 'Failed to archive bill.');
      }
    } catch (err) {
      setArchiveError('Network error archiving bill.');
    }
  };

  const handleOpenVoucher = (bill: any) => {
    setSelectedVoucherBill({
      refNumber: `DISB-${bill.id ? bill.id.substring(0, 8).toUpperCase() : '2026-EXP'}`,
      title: bill.title || 'Official Disbursement',
      category: bill.bill_type || 'General Expense',
      amount: bill.amount || 0,
      billingPeriod: bill.due_date ? `Due Date: ${bill.due_date}` : 'FY 2026',
      paymentDate: bill.status === 'Paid' ? (bill.due_date || 'Paid & Settled') : 'Pending Settlement',
      status: bill.status || 'Settled',
      notes: `Official Barangay Bensican Expense Ledger entry. Payee: ${bill.payee || 'Authorized Vendor'}.`,
      supplier: bill.payee || 'Authorized Contractor'
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      <PageHeader
        title="Barangay Bills & Financial Ledger"
        subtitle={isSuperAdmin
          ? 'Full management control: Add, edit, verify, and archive official expenditures.'
          : 'Staff transparency view: Add bill records and inspect disbursement vouchers.'}
        icon={FileSpreadsheet}
        badges={[`${bills.length} Total Bills`, isSuperAdmin ? 'Super Admin' : 'Admin Staff']}
        backTo={isSuperAdmin ? '/super-admin' : '/admin'}
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow transition min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bill Entry</span>
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border text-center">
          <span className="text-xs text-slate-400 font-bold uppercase block">Total Expenses</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">₱{summary.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-300 text-center">
          <span className="text-xs text-emerald-700 font-bold uppercase block">Paid</span>
          <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200">₱{summary.paidAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-300 text-center">
          <span className="text-xs text-blue-700 font-bold uppercase block">Unpaid</span>
          <span className="text-2xl font-black text-blue-800 dark:text-blue-200">₱{summary.unpaidAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-300 text-center">
          <span className="text-xs text-red-700 font-bold uppercase block">Overdue</span>
          <span className="text-2xl font-black text-red-800 dark:text-red-200">₱{summary.overdueAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border-3 border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase text-xs font-bold border-b">
              <tr>
                <th className="py-4 px-6">Expense Title</th>
                <th className="py-4 px-6">Payee</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                  <td className="py-4 px-6">
                    <strong className="block text-slate-900 dark:text-white text-base">{b.title}</strong>
                    <span className="text-xs text-slate-500">{b.bill_type}</span>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">
                    {b.payee}
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-600 dark:text-slate-400">
                    {b.due_date}
                  </td>
                  <td className="py-4 px-6 font-black text-slate-900 dark:text-white text-base">
                    ₱{b.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      b.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      b.status === 'Unpaid' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenVoucher(b)}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Voucher</span>
                    </button>
                    {isSuperAdmin ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedBill(b);
                            setShowEditModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBill(b);
                            setShowArchiveModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-red-600 rounded-lg text-xs font-bold"
                        >
                          Archive
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Read-only entry</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD BILL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Add New Bill Entry
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1">Title / Purpose *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. PANELCO I Streetlight Power - Oct 2026"
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Amount (₱) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Due Date *</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Payee / Vendor *</label>
                <input
                  type="text"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  placeholder="e.g. Pangasinan Electric Cooperative"
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Category / Type *</label>
                <select
                  value={billType}
                  onChange={(e) => setBillType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                >
                  <option value="Electricity (Pangasinan Electric Cooperative)">Electricity</option>
                  <option value="Water Utility (San Nicolas Water District)">Water Utility</option>
                  <option value="Office Supplies & Paperwork">Office Supplies</option>
                  <option value="Streetlight Maintenance & Bulbs">Streetlight Maintenance</option>
                  <option value="Community Health Center Supplies">Health Supplies</option>
                  <option value="Waste Management & Fuel">Waste & Fuel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  Save Bill Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BILL MODAL (SUPER ADMIN ONLY) */}
      {showEditModal && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-blue-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Edit Bill Entry (Super Admin)
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1">Title</label>
                <input
                  type="text"
                  value={selectedBill.title}
                  onChange={(e) => setSelectedBill({ ...selectedBill, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Amount (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  value={selectedBill.amount}
                  onChange={(e) => setSelectedBill({ ...selectedBill, amount: e.target.value })}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Payee</label>
                <input
                  type="text"
                  value={selectedBill.payee}
                  onChange={(e) => setSelectedBill({ ...selectedBill, payee: e.target.value })}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Status</label>
                <select
                  value={selectedBill.status}
                  onChange={(e) => setSelectedBill({ ...selectedBill, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                  Update Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARCHIVE BILL MODAL (SUPER ADMIN ONLY WITH PASSWORD CHECK) */}
      {showArchiveModal && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-red-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-red-600 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span>Confirm Archiving Bill</span>
            </h3>

            {archiveError && (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-bold border border-red-300">
                {archiveError}
              </div>
            )}

            <form onSubmit={handleArchiveSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1">Reason for Archiving *</label>
                <textarea
                  rows={2}
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  placeholder="State reason..."
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Re-enter Super Admin Password *</label>
                <input
                  type="password"
                  value={superAdminPassword}
                  onChange={(e) => setSuperAdminPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
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
                  type="submit"
                  className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold"
                >
                  Verify & Soft-Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Voucher Certificate Modal */}
      <VoucherModal
        isOpen={!!selectedVoucherBill}
        onClose={() => setSelectedVoucherBill(null)}
        mode="bill"
        billData={selectedVoucherBill}
      />
    </div>
  );
};

