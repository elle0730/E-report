import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, CheckCircle2, Clock, AlertTriangle, FileText, Download } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { PageHeader } from '../components/PageHeader.js';
import { VoucherModal, BillVoucherData } from '../components/VoucherModal.js';

export const BillsTransparencyPage: React.FC = () => {
  const { t } = useAccessibility();
  const [bills, setBills] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    overdueAmount: 0,
    totalCount: 0
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedVoucherBill, setSelectedVoucherBill] = useState<BillVoucherData | null>(null);

  const token = localStorage.getItem('bensican_token');

  useEffect(() => {
    fetch('/api/bills', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.bills) {
          setBills(data.bills);
          if (data.summary) setSummary(data.summary);
        }
      })
      .catch(() => {});
  }, []);

  const filteredBills = filterStatus === 'all'
    ? bills
    : bills.filter(b => b.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-xs rounded-full border border-emerald-300">✓ Paid</span>;
      case 'Unpaid':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-black text-xs rounded-full border border-blue-300">Pending Payment</span>;
      case 'Overdue':
        return <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-black text-xs rounded-full border border-red-300">Overdue</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const handleOpenVoucher = (bill: any) => {
    setSelectedVoucherBill({
      refNumber: `DISB-${bill.id ? bill.id.substring(0, 8).toUpperCase() : '2026-EXP'}`,
      title: bill.title || 'Official Disbursement',
      category: bill.bill_type || 'General Governance',
      amount: bill.amount || 0,
      billingPeriod: bill.due_date ? `Due Date: ${bill.due_date}` : 'FY 2026',
      paymentDate: bill.status === 'Paid' ? (bill.due_date || 'Paid & Settled') : 'Pending Settlement',
      status: bill.status || 'Settled',
      notes: `Official Barangay Bensican Financial Transparency item. Recorded for public audit and community accountability. Payee: ${bill.payee || 'Authorized Vendor'}.`,
      supplier: bill.payee || 'Authorized Contractor'
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      {/* Transparency Header */}
      <PageHeader
        title="Barangay Financial Transparency"
        subtitle="Open governance ledger of official utility bills, maintenance expenditures, and community allocations."
        icon={FileSpreadsheet}
        badges={[`${bills.length} Published Bills`, 'Public Audit Ready']}
        backTo="/resident"
      />

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <span className="text-xs font-bold text-slate-500 uppercase block">Total Recorded</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">₱{summary.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span className="text-xs text-slate-400 block mt-1">{summary.totalCount} bills</span>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 shadow-sm text-center">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase block">Settled (Paid)</span>
          <span className="text-2xl font-black text-emerald-900 dark:text-emerald-200">₱{summary.paidAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span className="text-xs text-emerald-600 block mt-1">Disbursed with receipt</span>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/40 p-5 rounded-2xl border-2 border-blue-300 dark:border-blue-800 shadow-sm text-center">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase block">Pending Payment</span>
          <span className="text-2xl font-black text-blue-900 dark:text-blue-200">₱{summary.unpaidAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span className="text-xs text-blue-600 block mt-1">Due this period</span>
        </div>

        <div className="bg-red-50 dark:bg-red-950/40 p-5 rounded-2xl border-2 border-red-300 dark:border-red-800 shadow-sm text-center">
          <span className="text-xs font-bold text-red-700 dark:text-red-300 uppercase block">Overdue</span>
          <span className="text-2xl font-black text-red-900 dark:text-red-200">₱{summary.overdueAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span className="text-xs text-red-600 block mt-1">Needs settlement</span>
        </div>
      </div>

      {/* Status filter buttons */}
      <div className="flex justify-center gap-2">
        {['all', 'Paid', 'Unpaid', 'Overdue'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
              filterStatus === s
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            {s === 'all' ? 'All Bills' : s}
          </button>
        ))}
      </div>

      {/* Bills Ledger Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border-3 border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 uppercase text-xs font-bold border-b">
              <tr>
                <th className="py-4 px-6">Expense Title / Item</th>
                <th className="py-4 px-6">Payee / Vendor</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                  <td className="py-4 px-6">
                    <strong className="block text-slate-900 dark:text-white text-base">{bill.title}</strong>
                    <span className="text-xs text-slate-500">{bill.bill_type}</span>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">
                    {bill.payee}
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-600 dark:text-slate-400">
                    {bill.due_date}
                  </td>
                  <td className="py-4 px-6 font-black text-slate-900 dark:text-white text-base">
                    ₱{bill.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(bill.status)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenVoucher(bill)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl transition shadow-sm"
                    >
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>View Voucher</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

