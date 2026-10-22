import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ShieldCheck, Clock, Users, ArrowRight, Volume2,
  Phone, MapPin, CheckCircle, Award, HeartHandshake, Building2,
  Calendar, AlertCircle, Search, Megaphone, FileSpreadsheet
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { useAuth } from '../context/AuthContext.js';
import { getLocalizedAnnouncement } from '../utils/translations.js';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, t, speak, isSpeaking, stopSpeaking } = useAccessibility();
  const { user } = useAuth();

  const [cmsContent, setCmsContent] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    // Fetch published CMS content
    fetch('/api/cms/published')
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setCmsContent(data.content);
        }
      })
      .catch(() => {});

    // Fetch pinned announcements
    fetch('/api/announcements?pinnedOnly=true')
      .then(res => res.json())
      .then(data => {
        if (data.announcements) {
          setAnnouncements(data.announcements);
        }
      })
      .catch(() => {});
  }, []);

  const heroTitle = cmsContent?.hero?.headline || cmsContent?.hero?.[`title_${language}`] || cmsContent?.hero?.title_en || 'Welcome to Barangay Bensican Online Services';
  const heroSubtitle = cmsContent?.hero?.tagline || cmsContent?.hero?.[`subtitle_${language}`] || cmsContent?.hero?.subtitle_en || 'Fast, transparent, and senior-friendly community reporting and official public service in San Nicolas, Pangasinan.';
  const emergencyAlert = cmsContent?.hero?.emergencyAlert;
  const aboutTitle = cmsContent?.about?.title || 'About Barangay Bensican';
  const aboutText = cmsContent?.about?.body || cmsContent?.about?.[`text_${language}`] || cmsContent?.about?.text_en || 'Barangay Bensican is a peaceful, agrarian and united community located in the municipality of San Nicolas, Province of Pangasinan. With E-Report Barangay, we provide our residents—especially the elderly and those who cannot easily walk to the barangay hall—direct digital access to community services, hearing summons, transparent finances, and prompt barangay resolution.';
  const aboutMission = cmsContent?.about?.mission;
  const aboutVision = cmsContent?.about?.vision;
  const contact = cmsContent?.contact;

  const handleReadAloudHero = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(`${heroTitle}. ${heroSubtitle}`);
    }
  };

  return (
    <div className="w-full py-6 sm:py-8">
      {/* Centered consistent max-width container with equal left & right margins */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 animate-fade-in">
        
        {/* Emergency Alert Marquee from CMS if set */}
        {emergencyAlert && (
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-3.5 rounded-2xl shadow-md flex items-center justify-between gap-3 text-sm font-bold border-2 border-amber-400 animate-pulse">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-200 shrink-0" />
              <span>📢 {emergencyAlert}</span>
            </div>
            <span className="text-[10px] sm:text-xs bg-amber-950/70 uppercase tracking-wider px-2.5 py-1 rounded-full text-amber-200 font-extrabold shrink-0">Official Alert</span>
          </div>
        )}
        
        {/* 1. Hero / Announcement Banner */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg border border-emerald-500/40 bg-emerald-950">
          {/* Panoramic Scenery Background with "WE ❤️ BENSICAN" sign */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url('/bensican-banner.png')` }}
          />

          {/* Lower opacity green gradient overlay as requested */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/75 via-emerald-900/40 to-emerald-950/65 backdrop-blur-[0.5px]" />

          {/* Banner content: compact, clean & unobstructed */}
          <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-7 md:px-10 md:py-8 max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 text-amber-300 text-xs font-bold border border-emerald-500/40 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              {t('officialBarangayPortal')}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-white drop-shadow-md">
              {heroTitle}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-emerald-100 font-medium leading-relaxed drop-shadow-sm">
              {heroSubtitle}
            </p>
          </div>
        </section>

        {/* 2. Core Resident Public Services (Direct One-Click Access) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {language === 'tl' ? 'Pangunahing Serbisyong Pambarangay' : language === 'il' ? 'Kangrunaan a Serbisio ti Barangay' : 'Primary Barangay Services'}
            </h2>
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
              Barangay Bensican 24/7 Digital Desk
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Send a Report */}
            <button
              type="button"
              onClick={() => navigate('/resident/report')}
              className="p-5 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-750 border-2 border-emerald-400 dark:border-emerald-700/80 rounded-2xl shadow-xs hover:shadow-md text-left flex flex-col justify-between transition group min-h-[170px]"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-300 dark:border-emerald-700 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {t('residentSendReport')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {t('residentSendReportDesc')}
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400">
                <span>{language === 'tl' ? 'Mag-ulat Ngayon' : language === 'il' ? 'Ipadamag Ita' : 'Send Report'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Card 2: Track / Check Reports */}
            <button
              type="button"
              onClick={() => navigate('/track')}
              className="p-5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 border-2 border-blue-400 dark:border-blue-700/80 rounded-2xl shadow-xs hover:shadow-md text-left flex flex-col justify-between transition group min-h-[170px]"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-300 dark:border-blue-700 group-hover:scale-105 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {t('residentCheckReports')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {t('residentCheckReportsDesc')}
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1.5 text-xs font-black text-blue-700 dark:text-blue-400">
                <span>{language === 'tl' ? 'Sundan ang Ulat' : language === 'il' ? 'Bantayan ti Report' : 'Track Status'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Card 3: Announcements */}
            <button
              type="button"
              onClick={() => navigate('/announcements')}
              className="p-5 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-750 border-2 border-amber-400 dark:border-amber-700/80 rounded-2xl shadow-xs hover:shadow-md text-left flex flex-col justify-between transition group min-h-[170px]"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-300 dark:border-amber-700 group-hover:scale-105 transition-transform">
                  <Megaphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {t('residentAnnouncements')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {t('residentAnnouncementsDesc')}
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-400">
                <span>{language === 'tl' ? 'Tingnan Lahat' : language === 'il' ? 'Kitaen Amin' : 'View Notices'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Card 4: Bills Transparency */}
            <button
              type="button"
              onClick={() => navigate('/bills')}
              className="p-5 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-750 border-2 border-purple-400 dark:border-purple-700/80 rounded-2xl shadow-xs hover:shadow-md text-left flex flex-col justify-between transition group min-h-[170px]"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-300 dark:border-purple-700 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {t('billsTransparencyTitle')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {t('billsTransparencySub')}
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1.5 text-xs font-black text-purple-700 dark:text-purple-400">
                <span>{language === 'tl' ? 'Tingnan Pananalapi' : language === 'il' ? 'Kitaen ti Pinansia' : 'View Finances'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </section>

        {/* 3. How It Works - 3 Picture Steps */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t('howItWorks')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('howItWorksDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-800/90 p-6 sm:p-7 rounded-2xl border-2 border-emerald-100 dark:border-slate-700/80 shadow-xs flex flex-col justify-between transition hover:shadow-md">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-xl flex items-center justify-center border-2 border-emerald-300">
                  1
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {t('step1Title')}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('step1Desc')}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {t('step1Badge')}
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-800/90 p-6 sm:p-7 rounded-2xl border-2 border-blue-100 dark:border-slate-700/80 shadow-xs flex flex-col justify-between transition hover:shadow-md">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-black text-xl flex items-center justify-center border-2 border-blue-300">
                  2
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {t('step2Title')}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('step2Desc')}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-blue-700 dark:text-blue-400">
                {t('step1Badge')}
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-800/90 p-6 sm:p-7 rounded-2xl border-2 border-purple-100 dark:border-slate-700/80 shadow-xs flex flex-col justify-between transition hover:shadow-md">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-black text-xl flex items-center justify-center border-2 border-purple-300">
                  3
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {t('step3Title')}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('step3Desc')}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-purple-700 dark:text-purple-400">
                {t('step3Badge')}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Pinned Urgent Community Notices */}
        {announcements.length > 0 && (
          <section className="bg-amber-50/90 dark:bg-slate-800/90 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-500 text-slate-950 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {t('urgentNoticeTitle')}
                </h3>
              </div>
              <button
                onClick={() => navigate('/announcements')}
                className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {t('viewAllAnnouncements')}
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 2).map((orig) => {
                const a = getLocalizedAnnouncement(orig, language);
                return (
                  <div key={a.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{a.title}</h4>
                      <span className="text-[11px] px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold rounded-full shrink-0">
                        {a.target_group}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{a.content}</p>
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => speak(`${a.title}. ${a.content}`)}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> {t('listenAnnouncement')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. About Barangay Bensican */}
        <section className="bg-white dark:bg-slate-800/90 p-6 sm:p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div className="flex items-center gap-3.5">
            <img src="/logo.png" alt="Barangay Bensican Official Seal" className="w-12 h-12 object-contain drop-shadow" />
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {aboutTitle}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
                Municipality of San Nicolas, Province of Pangasinan
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            {aboutText}
          </p>

          {/* Mission and Vision from CMS if provided */}
          {(aboutMission || aboutVision) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {aboutMission && (
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-1">
                  <h4 className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">Official Mission</h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{aboutMission}</p>
                </div>
              )}
              {aboutVision && (
                <div className="p-4 bg-blue-50/80 dark:bg-blue-950/30 rounded-xl border border-blue-300 dark:border-blue-800 space-y-1">
                  <h4 className="text-xs font-black uppercase text-blue-800 dark:text-blue-300 tracking-wider">Official Vision</h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{aboutVision}</p>
                </div>
              )}
            </div>
          )}

          {/* Leadership Cards: Balanced, evenly spaced & consistent padding */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4">
              Barangay Leadership & Lupon Tagapamayapa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  PB
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">Punong Barangay</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold truncate">Office of the Barangay Captain</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-blue-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  BK
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">Barangay Kagawad</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold truncate">Committee on Peace & Order</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-purple-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  BT
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">Barangay Treasurer</h4>
                  <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold truncate">Financial Records & Lupon</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Sustainable Development Goals Alignment (SDG 16, 11, 9) */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              United Nations Sustainable Development Goals (SDG) Alignment
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              How E-Report Barangay advances transparent, resilient, and inclusive local governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-6 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-black text-lg text-emerald-950 dark:text-emerald-200">SDG 16</h3>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Peace, Justice & Strong Institutions</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Provides fair conciliation hearings, official summons tracking, conflict-free scheduling, and transparent accountability reporting.
                </p>
              </div>
            </div>

            <div className="bg-blue-50/80 dark:bg-blue-950/30 p-6 rounded-2xl border-2 border-blue-300 dark:border-blue-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                    <Building2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-black text-lg text-blue-950 dark:text-blue-200">SDG 11</h3>
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-400">Sustainable Cities & Communities</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Empowers elderly and homebound residents to report infrastructure, broken streetlights, dengue risks, and sanitation hazards promptly.
                </p>
              </div>
            </div>

            <div className="bg-purple-50/80 dark:bg-purple-950/30 p-6 rounded-2xl border-2 border-purple-300 dark:border-purple-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-purple-600 text-white rounded-xl shadow-xs">
                    <HeartHandshake className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-black text-lg text-purple-950 dark:text-purple-200">SDG 9</h3>
                    <p className="text-xs font-bold text-purple-800 dark:text-purple-400">Industry, Innovation & Infrastructure</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Replaces fragile physical paper logbooks with an immutable, cloud-backed Google Drive style record system and verifiable audit trails.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Barangay Hall Official Contacts & Desk Hours */}
        {contact && (contact.hotline || contact.email || contact.address || contact.officeHours) && (
          <section className="bg-white dark:bg-slate-800/90 p-6 sm:p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Barangay Hall Official Contacts & Desk Hours
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Direct communication channels for residents, public inquiries, and emergency services.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {contact.hotline && (
                <div className="p-4 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs font-bold text-slate-500 block uppercase">Emergency Hotline</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{contact.hotline}</p>
                </div>
              )}
              {contact.email && (
                <div className="p-4 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs font-bold text-slate-500 block uppercase">Official Email</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{contact.email}</p>
                </div>
              )}
              {contact.address && (
                <div className="p-4 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs font-bold text-slate-500 block uppercase">Hall Address</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{contact.address}</p>
                </div>
              )}
              {contact.officeHours && (
                <div className="p-4 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs font-bold text-slate-500 block uppercase">Office Hours</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{contact.officeHours}</p>
                </div>
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
