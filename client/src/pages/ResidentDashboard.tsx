import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Search, Megaphone, Scale, MessageSquare,
  ArrowRight, CheckCircle, Clock, AlertCircle, Phone, FileSpreadsheet,
  Award, QrCode
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { useAuth } from '../context/AuthContext.js';
import { VoucherModal, ResidentVoucherData } from '../components/VoucherModal.js';

export const ResidentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useAccessibility();
  const { user } = useAuth();

  const [activeReportsCount, setActiveReportsCount] = useState<number>(0);
  const [resolvedReportsCount, setResolvedReportsCount] = useState<number>(0);
  const [scheduledHearingsCount, setScheduledHearingsCount] = useState<number>(0);
  const [latestReport, setLatestReport] = useState<any>(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('bensican_token');
    if (!token) return;

    // Fetch resident's reports summary
    fetch('/api/reports', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.reports) {
          const active = data.reports.filter((r: any) => r.status === 'Pending' || r.status === 'In Progress');
          const resolved = data.reports.filter((r: any) => r.status === 'Resolved' || r.status === 'Closed');
          setActiveReportsCount(active.length);
          setResolvedReportsCount(resolved.length);
          if (data.reports.length > 0) {
            setLatestReport(data.reports[0]);
          }
        }
      })
      .catch(() => {});

    // Fetch resident's hearings
    fetch('/api/hearings', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.hearings) {
          setScheduledHearingsCount(data.hearings.filter((h: any) => h.status === 'Scheduled').length);
        }
      })
      .catch(() => {});
  }, []);

  const residentVoucherData: ResidentVoucherData = {
    residentName: user?.fullName || 'Barangay Resident',
    email: user?.email,
    contactNumber: user?.contactNumber,
    address: `${user?.houseNumber ? user.houseNumber + ', ' : ''}${user?.street || 'Barangay Bensican'}, San Nicolas, Pangasinan`,
    serialNumber: `BSN-VCH-2026-${user?.id ? user.id.substring(0, 4).toUpperCase() : '0881'}`,
    status: user?.status === 'active' ? 'Verified Resident' : 'Pending Verification'
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-8 animate-fadeIn">
      {/* Welcome Greeting & Status Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white p-6 sm:p-8 rounded-3xl shadow-lg border-3 border-emerald-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-emerald-950/60 rounded-full text-amber-300 border border-emerald-500/40">
            Resident Portal • Barangay Bensican
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {language === 'tl' ? `Mabuhay, ${user?.fullName || 'Residente'}!` : language === 'il' ? `Kablaaw, ${user?.fullName || 'Umili'}!` : `Welcome, ${user?.fullName || 'Resident'}!`}
          </h1>
          <p className="text-base text-emerald-100 max-w-xl">
            {activeReportsCount > 0 ? (
              <span>You have <strong>{activeReportsCount}</strong> active concern being attended to by our barangay staff.</span>
            ) : (
              <span>All your submitted concerns are up to date. You can send a new concern anytime below.</span>
            )}
          </p>
        </div>

        {/* Quick summary stats & View Voucher button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setVoucherModalOpen(true)}
            className="p-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-bold flex flex-col items-center justify-center min-w-[90px] shadow-sm transition"
            title="View Official Resident Assistance Voucher"
          >
            <Award className="w-6 h-6 text-slate-950 mb-0.5" />
            <span className="text-xs font-black">View Voucher</span>
          </button>

          <div className="bg-emerald-900/80 p-3 rounded-2xl border border-emerald-500/40 text-center min-w-[90px]">
            <span className="block text-2xl font-black text-amber-300">{activeReportsCount}</span>
            <span className="text-xs font-semibold text-emerald-200">Active</span>
          </div>

          <div className="bg-emerald-900/80 p-3 rounded-2xl border border-emerald-500/40 text-center min-w-[90px]">
            <span className="block text-2xl font-black text-white">{resolvedReportsCount}</span>
            <span className="text-xs font-semibold text-emerald-200">Resolved</span>
          </div>
        </div>
      </div>

      {/* Pending Account Notice if Waiting for Admin Approval */}
      {user?.status === 'pending_verification' && (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/40 border-3 border-amber-400 dark:border-amber-600 rounded-3xl flex items-start gap-4 text-amber-950 dark:text-amber-200 shadow-sm animate-fadeIn">
          <AlertCircle className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="font-black text-lg text-amber-900 dark:text-amber-200">
              Account Status: Verification Pending
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Your resident account registration for Barangay Bensican has been received. Our barangay administrators are currently verifying your proof of residency. You have full access to submit concerns, talk to Bensi, and read public announcements in the meantime.
            </p>
          </div>
        </div>
      )}

      {/* 4 MAIN ACTION CARDS (STRICTLY MAXIMUM 4 MAIN CHOICES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Send a Report */}
        <button
          onClick={() => navigate('/resident/send-report')}
          className="p-8 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700/80 border-4 border-emerald-500 rounded-3xl shadow-md text-left flex flex-col justify-between transition-all transform hover:-translate-y-1 min-h-[220px] group"
        >
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border-2 border-emerald-400 group-hover:scale-110 transition-transform">
              <FileText className="w-9 h-9" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t('residentSendReport')}
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('residentSendReportDesc')}
            </p>
          </div>

          <div className="pt-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-base">
            <span>{language === 'tl' ? 'Magsumbong Ngayon' : language === 'il' ? 'Ibaon ti Report' : 'Send Report'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card 2: Check My Reports */}
        <button
          onClick={() => navigate('/resident/track')}
          className="p-8 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700/80 border-4 border-blue-500 rounded-3xl shadow-md text-left flex flex-col justify-between transition-all transform hover:-translate-y-1 min-h-[220px] group"
        >
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center border-2 border-blue-400 group-hover:scale-110 transition-transform">
              <Search className="w-9 h-9" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t('residentCheckReports')}
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('residentCheckReportsDesc')}
            </p>
          </div>

          <div className="pt-4 flex items-center gap-2 text-blue-700 dark:text-blue-400 font-black text-base">
            <span>View Timeline & Handler</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card 3: Barangay Announcements */}
        <button
          onClick={() => navigate('/resident/announcements')}
          className="p-8 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700/80 border-4 border-amber-500 rounded-3xl shadow-md text-left flex flex-col justify-between transition-all transform hover:-translate-y-1 min-h-[220px] group"
        >
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center border-2 border-amber-400 group-hover:scale-110 transition-transform">
              <Megaphone className="w-9 h-9" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t('residentAnnouncements')}
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('residentAnnouncementsDesc')}
            </p>
          </div>

          <div className="pt-4 flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-base">
            <span>Read Updates & Advisories</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card 4: My Hearings & Subpoenas */}
        <button
          onClick={() => navigate('/resident/hearings')}
          className="p-8 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700/80 border-4 border-purple-500 rounded-3xl shadow-md text-left flex flex-col justify-between transition-all transform hover:-translate-y-1 min-h-[220px] group"
        >
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center border-2 border-purple-400 group-hover:scale-110 transition-transform">
              <Scale className="w-9 h-9" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t('residentHearings')}
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('residentHearingsDesc')}
            </p>
          </div>

          <div className="pt-4 flex items-center gap-2 text-purple-700 dark:text-purple-400 font-black text-base">
            <span>{scheduledHearingsCount > 0 ? `${scheduledHearingsCount} Scheduled Hearing` : 'View Hearing Notices'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Auxiliary Resident Actions: Bensi Chat & Bills Transparency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Chat with Bensi Assistant */}
        <button
          onClick={() => navigate('/resident/chat')}
          className="p-5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 border-2 border-emerald-400 rounded-2xl flex items-center gap-4 transition min-h-[48px]"
        >
          <div className="p-3 bg-emerald-600 text-white rounded-xl shrink-0">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg text-emerald-950 dark:text-emerald-200">
              Chat with Bensi AI Assistant
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Instant answers in Ilocano, Tagalog, and English.
            </p>
          </div>
        </button>

        {/* Public Bills Transparency */}
        <button
          onClick={() => navigate('/resident/bills')}
          className="p-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-2xl flex items-center gap-4 transition min-h-[48px]"
        >
          <div className="p-3 bg-slate-700 text-white rounded-xl shrink-0">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Bills & Finance Transparency
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              View official barangay utility bills & expenditures.
            </p>
          </div>
        </button>
      </div>

      {/* Resident Voucher Modal */}
      <VoucherModal
        isOpen={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        mode="resident"
        residentData={residentVoucherData}
      />
    </div>
  );
};
