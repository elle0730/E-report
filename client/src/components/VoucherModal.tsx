import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, FileText, Building2, Calendar, User, QrCode } from 'lucide-react';

export interface ResidentVoucherData {
  residentName: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  serialNumber?: string;
  issueDate?: string;
  status?: string;
}

export interface BillVoucherData {
  refNumber: string;
  title: string;
  category: string;
  amount: number;
  billingPeriod?: string;
  paymentDate?: string;
  status?: string;
  notes?: string;
  supplier?: string;
}

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'resident' | 'bill';
  residentData?: ResidentVoucherData | null;
  billData?: BillVoucherData | null;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  mode,
  residentData,
  billData
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative text-slate-900 dark:text-white my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 pr-10">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl text-emerald-700 dark:text-emerald-400">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black">
              {mode === 'resident' ? 'Official Barangay Resident Voucher' : 'Disbursement & Expense Voucher'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Barangay Bensican • Municipality of San Nicolas, Province of Pangasinan
            </p>
          </div>
        </div>

        {/* VOUCHER CONTENT - PRINTABLE CERTIFICATE CARD */}
        <div className="border-3 border-emerald-600/40 rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 dark:from-slate-850 dark:via-slate-800 dark:to-slate-900 space-y-6 relative shadow-inner">
          {/* Header Seal */}
          <div className="flex items-center justify-between border-b-2 border-emerald-600/30 pb-4">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Barangay Bensican Seal" className="w-14 h-14 drop-shadow" />
              <div>
                <span className="text-[11px] font-bold tracking-widest text-emerald-800 dark:text-emerald-400 uppercase block">
                  Republic of the Philippines
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white block">
                  BARANGAY BENSICAN
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block">
                  San Nicolas, Pangasinan • 2447
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Voucher Serial No.</span>
              <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                {mode === 'resident'
                  ? residentData?.serialNumber || 'BSN-VCH-2026-0881'
                  : billData?.refNumber || 'BSN-EXP-2026-0042'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 mt-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Official Verified
              </span>
            </div>
          </div>

          {/* Body Content */}
          {mode === 'resident' ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 block">Beneficiary / Resident Name</span>
                    <strong className="text-base text-slate-900 dark:text-white">
                      {residentData?.residentName || 'Registered Resident'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Residential Address</span>
                    <strong className="text-slate-900 dark:text-white">
                      {residentData?.address || 'Barangay Bensican, San Nicolas, Pangasinan'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Contact Information</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {residentData?.contactNumber || 'On file with barangay'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Date of Issuance</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {residentData?.issueDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <p className="leading-relaxed">
                  <strong>Certification:</strong> This digital resident assistance voucher certifies that the individual named above is a duly verified resident of Barangay Bensican, eligible for official community services, barangay social assistance, and citizen programs under the Barangay Governance Code.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 block">Disbursement Category</span>
                    <strong className="text-base text-slate-900 dark:text-white">
                      {billData?.category || 'Utility / Expenditure'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Payee / Service Provider</span>
                    <strong className="text-slate-900 dark:text-white">
                      {billData?.supplier || 'Official Public Utility'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Total Amount Paid</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      ₱{billData?.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Billing Period / Date</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {billData?.billingPeriod || billData?.paymentDate || 'Current Fiscal Period'}
                    </span>
                  </div>
                </div>
              </div>

              {billData?.notes && (
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold block text-slate-700 dark:text-slate-300">Transaction Notes:</span>
                  <p className="mt-0.5">{billData.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Signatures & Security Footer */}
          <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <span className="text-[10px] text-slate-400">
                Secured by E-Report Bensican<br />Digital Transparency Ledger
              </span>
            </div>

            <div className="text-right">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Office of the Punong Barangay
              </span>
              <span className="text-[10px] text-slate-500 block">
                Barangay Bensican Administration
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-sm transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Voucher</span>
          </button>
        </div>
      </div>
    </div>
  );
};

