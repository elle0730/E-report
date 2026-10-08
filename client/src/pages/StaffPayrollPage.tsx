import React, { useState, useEffect } from 'react';
import {
  Users, Clock, CheckCircle2, XCircle, Plus, FileText,
  DollarSign, Calendar, TrendingUp, Download, Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const StaffPayrollPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  // Personal state
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [myPayrolls, setMyPayrolls] = useState<any[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<string>('Ready');

  // Super Admin state
  const [allAttendance, setAllAttendance] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [allPayrolls, setAllPayrolls] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Request modal
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [requestType, setRequestType] = useState<'leave' | 'cash_advance'>('leave');
  const [requestAmount, setRequestAmount] = useState<string>('1');
  const [requestReason, setRequestReason] = useState<string>('');

  // Generate payroll modal (Super admin)
  const [showGenModal, setShowGenModal] = useState<boolean>(false);
  const [genStaffId, setGenStaffId] = useState<string>('');
  const [genPeriodStart, setGenPeriodStart] = useState<string>('2026-10-01');
  const [genPeriodEnd, setGenPeriodEnd] = useState<string>('2026-10-15');
  const [genBasicPay, setGenBasicPay] = useState<string>('12500');
  const [genOvertime, setGenOvertime] = useState<string>('0');
  const [genDeductions, setGenDeductions] = useState<string>('850');

  const token = localStorage.getItem('bensican_token');

  const loadData = () => {
    // Load personal records
    fetch('/api/payroll/my-records', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.attendance) setMyAttendance(data.attendance);
        if (data.requests) setMyRequests(data.requests);
        if (data.payrolls) setMyPayrolls(data.payrolls);
      })
      .catch(() => {});

    // Super Admin loads all
    if (isSuperAdmin) {
      fetch('/api/payroll/admin/all', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.attendance) setAllAttendance(data.attendance);
          if (data.requests) setAllRequests(data.requests);
          if (data.payrolls) setAllPayrolls(data.payrolls);
          if (data.staff) {
            setStaffList(data.staff);
            if (data.staff.length > 0) setGenStaffId(data.staff[0].id);
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadData();
  }, [isSuperAdmin]);

  const handleTimeLog = async () => {
    try {
      const res = await fetch('/api/payroll/attendance/log', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAttendanceStatus(data.message || 'Logged');
      loadData();
    } catch (err) {}
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payroll/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: requestType,
          amountOrDays: parseFloat(requestAmount),
          reason: requestReason
        })
      });

      if (res.ok) {
        setShowRequestModal(false);
        setRequestReason('');
        loadData();
      }
    } catch (err) {}
  };

  const handleReviewRequest = async (reqId: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`/api/payroll/requests/${reqId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) loadData();
    } catch (err) {}
  };

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payroll/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: genStaffId,
          periodStart: genPeriodStart,
          periodEnd: genPeriodEnd,
          basicPay: parseFloat(genBasicPay),
          overtimePay: parseFloat(genOvertime),
          deductions: parseFloat(genDeductions)
        })
      });

      if (res.ok) {
        setShowGenModal(false);
        loadData();
      }
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            <span>Barangay Staff Payroll & Human Resources</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Attendance monitoring, cash advances, sick/vacation leave requests, and payroll disbursements.
          </p>
        </div>

        {/* Attendance Stamp Button for Staff */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTimeLog}
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-base shadow-lg flex items-center gap-2 transition min-h-[48px]"
          >
            <Clock className="w-5 h-5 text-amber-300" />
            <span>Punch Clock: Time In / Time Out</span>
          </button>

          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition min-h-[48px]"
          >
            + File Leave / Cash Advance
          </button>
        </div>
      </div>

      {attendanceStatus !== 'Ready' && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300">
          ✓ {attendanceStatus}
        </div>
      )}

      {/* =========================================
          SUPER ADMIN SECTION: ALL HR & PAYROLL
          ========================================= */}
      {isSuperAdmin && (
        <div className="space-y-6 pt-4 border-t-2 border-emerald-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Super Admin HR & Payroll Command
            </h2>
            <button
              onClick={() => setShowGenModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Generate Staff Payroll
            </button>
          </div>

          {/* Pending HR Requests (Leaves & Cash Advances) */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-3 border-slate-200 dark:border-slate-700 shadow-md space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Staff Leave & Cash Advance Approvals
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 uppercase text-xs font-bold border-b">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Request Type</th>
                    <th className="py-3 px-4">Amount / Days</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {allRequests.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {r.full_name} <span className="text-xs text-slate-400 font-normal">({r.position})</span>
                      </td>
                      <td className="py-3 px-4 uppercase font-bold text-xs">
                        {r.type === 'leave' ? 'Sick / Vacation Leave' : 'Cash Advance'}
                      </td>
                      <td className="py-3 px-4 font-black">
                        {r.type === 'leave' ? `${r.amount_or_days} Days` : `₱${r.amount_or_days?.toLocaleString()}`}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {r.reason}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                          r.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          'bg-red-100 text-red-800 border-red-300'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {r.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleReviewRequest(r.id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewRequest(r.id, 'Rejected')}
                              className="px-2.5 py-1 bg-red-600 text-white rounded text-xs font-bold"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payroll Ledger */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-3 border-slate-200 dark:border-slate-700 shadow-md space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Generated Staff Payroll Slips
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 uppercase text-xs font-bold border-b">
                  <tr>
                    <th className="py-3 px-4">Staff</th>
                    <th className="py-3 px-4">Pay Period</th>
                    <th className="py-3 px-4">Basic Pay</th>
                    <th className="py-3 px-4">Overtime</th>
                    <th className="py-3 px-4">Deductions</th>
                    <th className="py-3 px-4">Net Take-Home</th>
                    <th className="py-3 px-4 text-right">Print Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {allPayrolls.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-4 font-bold">{p.full_name}</td>
                      <td className="py-3 px-4 font-mono text-xs">{p.period_start} to {p.period_end}</td>
                      <td className="py-3 px-4">₱{p.basic_pay?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4">₱{p.overtime_pay?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-red-600">-₱{p.deductions?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 font-black text-base text-emerald-600">₱{p.net_pay?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-bold inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          PERSONAL WORKSTATION: ATTENDANCE & REQUESTS
          ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-3 border-slate-200 dark:border-slate-700 shadow-md space-y-3">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            My Recent Attendance Logs
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 uppercase font-bold border-b">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Time In</th>
                  <th className="py-2.5 px-3">Time Out</th>
                  <th className="py-2.5 px-3">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-mono">
                {myAttendance.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2 px-3">{a.date}</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">{a.time_in}</td>
                    <td className="py-2 px-3 text-blue-600">{a.time_out || 'Active'}</td>
                    <td className="py-2 px-3 font-bold">{a.total_hours} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-3 border-slate-200 dark:border-slate-700 shadow-md space-y-3">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            My HR Requests History
          </h3>
          <div className="space-y-2 text-xs">
            {myRequests.map((r) => (
              <div key={r.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border flex justify-between items-center">
                <div>
                  <strong className="block text-sm">{r.type === 'leave' ? 'Leave Request' : 'Cash Advance'}</strong>
                  <span className="text-slate-500">{r.reason}</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold border ${
                  r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  r.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FILE REQUEST MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-blue-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">File Leave / Cash Advance Request</h3>
            <form onSubmit={handleRequestSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1">Type *</label>
                <select
                  value={requestType}
                  onChange={(e: any) => setRequestType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                >
                  <option value="leave">Leave Request (Sick / Vacation)</option>
                  <option value="cash_advance">Cash Advance (Bale / Vale)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">{requestType === 'leave' ? 'Days Count *' : 'Amount in Pesos (₱) *'}</label>
                <input
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Reason *</label>
                <textarea
                  rows={3}
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Explain reason for leave or cash advance..."
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowRequestModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold">Submit to Punong Barangay</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATE PAYROLL MODAL (SUPER ADMIN ONLY) */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-purple-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Compute & Generate Payroll Slip</h3>
            <form onSubmit={handleGeneratePayroll} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1">Staff Member *</label>
                <select
                  value={genStaffId}
                  onChange={(e) => setGenStaffId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>{st.full_name} ({st.position})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold mb-1">Period Start</label>
                  <input type="date" value={genPeriodStart} onChange={(e) => setGenPeriodStart(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Period End</label>
                  <input type="date" value={genPeriodEnd} onChange={(e) => setGenPeriodEnd(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-slate-800" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Basic Salary / Honorarium (₱) *</label>
                <input type="number" value={genBasicPay} onChange={(e) => setGenBasicPay(e.target.value)} className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold" required />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Overtime / Hazard Pay (₱)</label>
                <input type="number" value={genOvertime} onChange={(e) => setGenOvertime(e.target.value)} className="w-full p-2.5 rounded-xl border dark:bg-slate-800" />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Government Deductions (SSS/PhilHealth/PagIBIG) (₱)</label>
                <input type="number" value={genDeductions} onChange={(e) => setGenDeductions(e.target.value)} className="w-full p-2.5 rounded-xl border dark:bg-slate-800 text-red-600 font-bold" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowGenModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-xl font-bold">Generate Slip</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

