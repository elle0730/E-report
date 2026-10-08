import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Users, Scale, Calendar, AlertCircle, CheckCircle2,
  Clock, ShieldAlert, ArrowRight, UserCheck, Plus, Sparkles,
  TrendingUp, FileSpreadsheet, Eye, ToggleLeft, ToggleRight,
  Settings, ShieldCheck, KeyRound, Archive, Globe, DollarSign,
  Download, Lock, Crown, Bell, User, History, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, speak } = useAccessibility();
  const isSuperAdmin = user?.role === 'super_admin';

  const [metrics, setMetrics] = useState<any>({
    totalReports: 0,
    totalHearings: 0,
    todayHearings: 0,
    upcomingSubpoenas: 0,
    pendingResidents: 0,
    activeStaff: 0
  });

  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [isStaffAvailable, setIsStaffAvailable] = useState<boolean>(true);

  const [selectedStatusCard, setSelectedStatusCard] = useState<{
    title: string;
    count: string | number;
    subtitle: string;
    breakdown: { label: string; value: string | number }[];
    navPath: string;
    navLabel: string;
  } | null>(null);

  const token = localStorage.getItem('bensican_token');

  useEffect(() => {
    // Fetch overview analytics
    fetch('/api/analytics/overview', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.metrics) setMetrics(data.metrics);
      })
      .catch(() => {});

    // Fetch recent reports queue
    fetch('/api/reports', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.reports) setRecentReports(data.reports.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  const toggleAvailability = async () => {
    try {
      const next = !isStaffAvailable;
      const res = await fetch('/api/bensi/presence/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: next })
      });
      if (res.ok) setIsStaffAvailable(next);
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8 animate-fadeIn">
      {/* 1. Header Banner & Identity */}
      <div className={`text-white p-6 sm:p-8 rounded-3xl shadow-xl border-3 flex flex-wrap items-center justify-between gap-4 transition-all ${
        isSuperAdmin
          ? 'bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border-purple-500/60'
          : 'bg-gradient-to-r from-emerald-800 to-green-700 border-emerald-600'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border ${
              isSuperAdmin
                ? 'bg-purple-950/80 text-amber-300 border-purple-400/40'
                : 'bg-emerald-950/80 text-amber-300 border-emerald-400/40'
            }`}>
              {isSuperAdmin ? <Crown className="w-3.5 h-3.5 text-amber-300" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />}
              {isSuperAdmin ? 'Super Administrator Portal • Full Authority' : 'Barangay Administrator Portal • Operations'}
            </span>
            <span className="text-xs text-slate-200 hidden sm:inline">
              Barangay Bensican • San Nicolas, Pangasinan
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">
            {user?.fullName || 'Barangay Official'}
          </h1>
          <p className="text-sm text-slate-200">
            Position: <strong className="text-white">{user?.position || (isSuperAdmin ? 'Punong Barangay' : 'Barangay Kagawad')}</strong> &bull;
            Role: <strong className="text-amber-300">{isSuperAdmin ? 'Super Administrator' : 'Barangay Administrator'}</strong>
          </p>
        </div>

        {/* Presence Toggle & Quick Tools */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-inner">
            <div>
              <span className="text-xs font-bold block text-slate-300">Live Chat Desk:</span>
              <span className="text-sm font-black text-white">
                {isStaffAvailable ? 'Available (Take Over Chat)' : 'Away (Bensi AI Active)'}
              </span>
            </div>
            <button
              onClick={toggleAvailability}
              className={`p-2 rounded-xl transition ${isStaffAvailable ? 'bg-emerald-500 text-white shadow-md' : 'bg-amber-600 text-white'}`}
              title="Toggle Live Chat Availability"
            >
              {isStaffAvailable ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
            </button>
          </div>

          <button
            onClick={() => navigate('/notifications')}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 transition flex items-center gap-1.5 text-xs font-bold"
            title="View Notifications"
          >
            <Bell className="w-5 h-5 text-amber-300" />
            <span className="hidden sm:inline">Alerts</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Concerns */}
        <div
          onClick={() => setSelectedStatusCard({
            title: 'Total Community Concerns',
            count: metrics.totalReports,
            subtitle: 'Overview of all citizen reports filed in Barangay Bensican',
            breakdown: [
              { label: 'Active Concerns', value: metrics.activeReports },
              { label: 'Resolved Concerns', value: metrics.resolvedReports },
              { label: 'Urgent Priority', value: metrics.urgentReports },
              { label: 'Total Recorded', value: metrics.totalReports }
            ],
            navPath: '/admin/reports',
            navLabel: 'Open Concerns Management'
          })}
          className="group relative bg-white dark:bg-slate-800 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xs text-center cursor-pointer hover:border-emerald-500 hover:shadow-md transition"
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Inspect</span>
          </div>
          <FileText className="w-6 h-6 mx-auto mb-1 text-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black text-slate-900 dark:text-white block">{metrics.totalReports}</span>
          <span className="text-xs font-bold text-slate-500">Total Concerns</span>
        </div>

        {/* Card 2: Pending Approvals */}
        <div
          onClick={() => setSelectedStatusCard({
            title: 'Pending Resident Approvals',
            count: metrics.pendingResidents,
            subtitle: 'Registrations from residents awaiting valid ID verification',
            breakdown: [
              { label: 'Waiting for Approval', value: metrics.pendingResidents },
              { label: 'Verified Accounts', value: 'Active on file' },
              { label: 'Review Step', value: 'ID & proof verification' }
            ],
            navPath: '/admin/residents',
            navLabel: 'Open Resident Approvals'
          })}
          className="group relative bg-white dark:bg-slate-800 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xs text-center cursor-pointer hover:border-blue-500 hover:shadow-md transition"
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Inspect</span>
          </div>
          <UserCheck className="w-6 h-6 mx-auto mb-1 text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black text-blue-600 block">{metrics.pendingResidents}</span>
          <span className="text-xs font-bold text-slate-500">Pending Approvals</span>
        </div>

        {/* Card 3: Today's Hearings */}
        <div
          onClick={() => setSelectedStatusCard({
            title: "Today's Conciliation Hearings",
            count: metrics.todayHearings,
            subtitle: 'Sessions scheduled for amicable dispute resolution today',
            breakdown: [
              { label: "Today's Sessions", value: metrics.todayHearings },
              { label: 'Upcoming Calendar', value: metrics.upcomingHearings },
              { label: 'Venue', value: 'Barangay Bensican Hall' }
            ],
            navPath: '/admin/hearings',
            navLabel: 'Open Hearing Scheduler'
          })}
          className="group relative bg-white dark:bg-slate-800 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xs text-center cursor-pointer hover:border-purple-500 hover:shadow-md transition"
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Inspect</span>
          </div>
          <Calendar className="w-6 h-6 mx-auto mb-1 text-purple-600 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black text-purple-600 block">{metrics.todayHearings}</span>
          <span className="text-xs font-bold text-slate-500">Today's Hearings</span>
        </div>

        {/* Card 4: Subpoenas */}
        <div
          onClick={() => setSelectedStatusCard({
            title: 'Active Subpoenas & Summons',
            count: metrics.upcomingSubpoenas,
            subtitle: 'Formal summon notices issued under Katarungang Pambarangay',
            breakdown: [
              { label: 'Active Summons', value: metrics.upcomingSubpoenas },
              { label: 'Service Coverage', value: 'San Nicolas, Pangasinan' },
              { label: 'Legal Basis', value: 'RA 7160 / Local Code' }
            ],
            navPath: '/admin/subpoenas',
            navLabel: 'Open Subpoena Manager'
          })}
          className="group relative bg-white dark:bg-slate-800 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xs text-center cursor-pointer hover:border-amber-500 hover:shadow-md transition"
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Inspect</span>
          </div>
          <Scale className="w-6 h-6 mx-auto mb-1 text-amber-600 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black text-amber-600 block">{metrics.upcomingSubpoenas}</span>
          <span className="text-xs font-bold text-slate-500">Active Subpoenas</span>
        </div>

        {/* Card 5: Public Bills */}
        <div
          onClick={() => setSelectedStatusCard({
            title: 'Barangay Financial Transparency Ledger',
            count: '₱ Ledger',
            subtitle: 'Published utilities, maintenance, and community project expenses',
            breakdown: [
              { label: 'Status', value: 'Transparent & Audited' },
              { label: 'Utility Providers', value: 'Electric & Water' },
              { label: 'Public Access', value: 'Open Citizen Review' }
            ],
            navPath: '/admin/bills',
            navLabel: 'Open Bills Management'
          })}
          className="group relative bg-white dark:bg-slate-800 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xs text-center cursor-pointer hover:border-emerald-500 hover:shadow-md transition"
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Inspect</span>
          </div>
          <FileSpreadsheet className="w-6 h-6 mx-auto mb-1 text-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black text-slate-900 dark:text-white block">₱ Ledger</span>
          <span className="text-xs font-bold text-slate-500">Public Bills</span>
        </div>

        {/* Card 6: Staff Active */}
        <div
          onClick={() => setSelectedStatusCard({
            title: 'Active Barangay Staff & Officers',
            count: metrics.activeStaff,
            subtitle: 'Barangay kagawads, administration personnel, and duty staff',
            breakdown: [
              { label: 'Active Staff', value: metrics.activeStaff },
              { label: 'Live Chat Presence', value: isStaffAvailable ? 'Available' : 'Away' },
              { label: 'Official Hours', value: '8:00 AM - 5:00 PM' }
            ],
            navPath: '/admin/payroll',
            navLabel: 'Open Staff & Payroll'
          })}
          className="group relative bg-white dark:bg-slate-800 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xs text-center cursor-pointer hover:border-indigo-500 hover:shadow-md transition"
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">Inspect</span>
          </div>
          <Users className="w-6 h-6 mx-auto mb-1 text-indigo-600 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black text-indigo-600 block">{metrics.activeStaff}</span>
          <span className="text-xs font-bold text-slate-500">Staff Active</span>
        </div>
      </div>

      {/* 3. SUPER ADMIN EXCLUSIVE COMMAND CENTER (Visible to Super Admin) */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-b from-purple-50/70 via-slate-50 to-white dark:from-purple-950/30 dark:via-slate-850 dark:to-slate-800 rounded-3xl p-6 sm:p-8 border-3 border-purple-400 dark:border-purple-600/60 shadow-lg space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-purple-200 dark:border-purple-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-md">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Super Admin Governance Center
                </h2>
                <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 font-semibold">
                  Executive controls: Staff provisioning, live CMS publishing, master settings, security dashboard, and archive restoration.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Super Admin Tool 1: Staff & Accounts */}
            <button
              onClick={() => navigate('/admin/accounts')}
              className="p-5 bg-white dark:bg-slate-800 hover:bg-purple-50/50 dark:hover:bg-slate-750 rounded-2xl border-2 border-purple-300 dark:border-purple-700/70 text-left space-y-2 shadow-xs hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <Users className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md uppercase">Super Admin</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Staff & User Accounts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create & edit Admins, manage roles, suspend accounts, and reset passwords with security confirmation.
              </p>
            </button>

            {/* Super Admin Tool 2: CMS Live Publishing */}
            <button
              onClick={() => navigate('/admin/cms')}
              className="p-5 bg-white dark:bg-slate-800 hover:bg-purple-50/50 dark:hover:bg-slate-750 rounded-2xl border-2 border-purple-300 dark:border-purple-700/70 text-left space-y-2 shadow-xs hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <Globe className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md uppercase">Super Admin</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Landing Page CMS & Live Publish</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review Admin drafts, publish live to bensican.gov.ph with password verification, version history & rollback.
              </p>
            </button>

            {/* Super Admin Tool 3: Master Settings */}
            <button
              onClick={() => navigate('/admin/settings')}
              className="p-5 bg-white dark:bg-slate-800 hover:bg-purple-50/50 dark:hover:bg-slate-750 rounded-2xl border-2 border-purple-300 dark:border-purple-700/70 text-left space-y-2 shadow-xs hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <Settings className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md uppercase">Super Admin</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Master System Settings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Concern categories CRUD, hearing venues, bill types, official barangay directory, and database JSON backup.
              </p>
            </button>

            {/* Super Admin Tool 4: Security & Audit */}
            <button
              onClick={() => navigate('/admin/security')}
              className="p-5 bg-white dark:bg-slate-800 hover:bg-purple-50/50 dark:hover:bg-slate-750 rounded-2xl border-2 border-purple-300 dark:border-purple-700/70 text-left space-y-2 shadow-xs hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <ShieldAlert className="w-6 h-6 text-rose-600 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md uppercase">Super Admin</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Security & Audit Center</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100% immutable audit log trail, monitor active user sessions, terminate unauthorized sessions, and intrusion alerts.
              </p>
            </button>

            {/* Super Admin Tool 5: Direct Archive Recovery */}
            <button
              onClick={() => navigate('/admin/archive')}
              className="p-5 bg-white dark:bg-slate-800 hover:bg-purple-50/50 dark:hover:bg-slate-750 rounded-2xl border-2 border-purple-300 dark:border-purple-700/70 text-left space-y-2 shadow-xs hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <Archive className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md uppercase">Super Admin</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Direct Archive Restoration</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Directly restore any soft-archived concern, hearing, subpoena, bill, or account with password re-entry.
              </p>
            </button>

            {/* Super Admin Tool 6: Full Payroll & Disbursement */}
            <button
              onClick={() => navigate('/admin/payroll')}
              className="p-5 bg-white dark:bg-slate-800 hover:bg-purple-50/50 dark:hover:bg-slate-750 rounded-2xl border-2 border-purple-300 dark:border-purple-700/70 text-left space-y-2 shadow-xs hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <DollarSign className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md uppercase">Super Admin</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Payroll & Compensation Ledger</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compute monthly staff salaries and honoraria, process deductions, approve cash advances, and print payslips.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* 4. ALL DAY-TO-DAY ADMIN OPERATIONS (For Both Admin and Super Admin) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Barangay Operational Workstation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Day-to-day community concerns, resident verifications, hearings, transparency, and notices.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Operation 1: Report Queue */}
          <button
            onClick={() => navigate('/admin/reports')}
            className="p-5 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-750 rounded-2xl border-2 border-emerald-400 text-left space-y-1.5 shadow-xs hover:shadow-md transition group"
          >
            <FileText className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Community Concerns Queue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review, assign handlers, prioritize (*Urgent/Normal*), update statuses, and chat with residents.
            </p>
          </button>

          {/* Operation 2: Resident Approvals */}
          <button
            onClick={() => navigate('/admin/residents')}
            className="p-5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 rounded-2xl border-2 border-blue-400 text-left space-y-1.5 shadow-xs hover:shadow-md transition group"
          >
            <UserCheck className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Resident Approvals (4-Step)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify valid IDs & selfies, confirm Bensican residency, approve or reject with clear reasons.
            </p>
          </button>

          {/* Operation 3: Hearing Scheduler */}
          <button
            onClick={() => navigate('/admin/hearings')}
            className="p-5 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-750 rounded-2xl border-2 border-purple-400 text-left space-y-1.5 shadow-xs hover:shadow-md transition group"
          >
            <Calendar className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Lupong Hearing Scheduler</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Schedule Katarungang Pambarangay hearings with conflict & double-booking prevention.
            </p>
          </button>

          {/* Operation 4: Subpoenas */}
          <button
            onClick={() => navigate('/admin/subpoenas')}
            className="p-5 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-750 rounded-2xl border-2 border-amber-400 text-left space-y-1.5 shadow-xs hover:shadow-md transition group"
          >
            <Scale className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">KP Form 9 Subpoenas</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate official summons (`BSN-S-YYYY-NNNNN`) and download official letterhead PDFs.
            </p>
          </button>

          {/* Operation 5: Announcements */}
          <button
            onClick={() => navigate('/admin/announcements')}
            className="p-5 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-750 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-left space-y-1.5 shadow-xs hover:shadow-md transition group"
          >
            <Sparkles className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Public Announcements</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Publish community news, health advisories, curfew notices, and targeted notifications.
            </p>
          </button>

          {/* Operation 6: Bills & Finance */}
          <button
            onClick={() => navigate('/admin/bills')}
            className="p-5 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-750 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-left space-y-1.5 shadow-xs hover:shadow-md transition group"
          >
            <FileSpreadsheet className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Bills & Transparency Ledger</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add utility bills, streetlighting, and vouchers for the public financial ledger.
            </p>
          </button>

          {/* Operation 7: Records Explorer */}
          <button
            onClick={() => navigate('/admin/files')}
            className="p-5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-left space-y-1.5 shadow-xs hover:shadow-md transition group"
          >
            <FileText className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Records Explorer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Google Drive-style directory for digitized cases, vouchers, certificates, and folders.
            </p>
          </button>

          {/* Operation 8: Accountability Report */}
          <button
            onClick={() => navigate('/admin/accountability')}
            className="p-5 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-750 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-left space-y-1.5 shadow-xs hover:shadow-md transition group"
          >
            <TrendingUp className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Accountability Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Resolution rates, average completion times, SDG 16/11/9 metrics, and PDF/Excel export.
            </p>
          </button>

          {/* Operation 9: Archive Explorer (Admin View & Request Restore) */}
          <button
            onClick={() => navigate('/admin/archive')}
            className="p-5 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-750 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-left space-y-1.5 shadow-xs hover:shadow-md transition group"
          >
            <Archive className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Barangay Archive Explorer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspect soft-archived items and submit restore authorization requests to Super Admin.
            </p>
          </button>

          {/* Operation 10: Landing Page CMS Draft (Admin) */}
          <button
            onClick={() => navigate('/admin/cms')}
            className="p-5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-left space-y-1.5 shadow-xs hover:shadow-md transition group"
          >
            <Globe className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Landing Page CMS Draft</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Edit public site headlines and contact details (saved as draft awaiting Super Admin approval).
            </p>
          </button>

          {/* Operation 11: Staff Attendance & Punch Clock */}
          <button
            onClick={() => navigate('/admin/payroll')}
            className="p-5 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-750 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-left space-y-1.5 shadow-xs hover:shadow-md transition group"
          >
            <Clock className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Staff Punch Clock & HR</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily Time In / Time Out punch clock, leave requests, and attendance history.
            </p>
          </button>

          {/* Operation 12: My Profile & Settings */}
          <button
            onClick={() => navigate('/profile')}
            className="p-5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-left space-y-1.5 shadow-xs hover:shadow-md transition group"
          >
            <User className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">My Profile & Security</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal contact details, password change, and elderly accessibility preferences.
            </p>
          </button>
        </div>
      </div>

      {/* 5. Real-time Incoming Reports Queue Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border-3 border-slate-200 dark:border-slate-700 shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Live Concerns & Cases Queue
            </h2>
          </div>
          <button
            onClick={() => navigate('/admin/reports')}
            className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Open Full Queue ({metrics.totalReports})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase text-xs font-bold border-b">
              <tr>
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-4">Title / Concern</th>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Handler</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentReports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {r.ref_number}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {r.title}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {r.resident_name}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      r.priority === 'Urgent' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                      r.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      r.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                    {r.assigned_admin_name || 'Unassigned Queue'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate('/admin/reports')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STATUS CARD DETAILED BREAKDOWN MODAL */}
      {selectedStatusCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative text-slate-900 dark:text-white">
            <button
              onClick={() => setSelectedStatusCard(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-8">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                Metric Details & Breakdown
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {selectedStatusCard.title}
              </h2>
              <p className="text-xs text-slate-500">
                {selectedStatusCard.subtitle}
              </p>
            </div>

            <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-850 rounded-2xl border border-emerald-200 dark:border-slate-700 text-center space-y-1">
              <span className="text-4xl font-black text-emerald-700 dark:text-emerald-400 block">
                {selectedStatusCard.count}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Current Total Metric
              </span>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Category Breakdown
              </span>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700 overflow-hidden">
                {selectedStatusCard.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 text-sm">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStatusCard(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-sm transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = selectedStatusCard.navPath;
                  setSelectedStatusCard(null);
                  navigate(target);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition"
              >
                {selectedStatusCard.navLabel} →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
