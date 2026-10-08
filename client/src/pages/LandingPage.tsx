import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ShieldCheck, Clock, Users, ArrowRight, Volume2,
  Phone, MapPin, CheckCircle, Award, HeartHandshake, Building2,
  Calendar, AlertCircle
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { useAuth } from '../context/AuthContext.js';

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

  const heroTitle = cmsContent?.hero?.[`title_${language}`] || cmsContent?.hero?.title_en || 'Welcome to Barangay Bensican Online Services';
  const heroSubtitle = cmsContent?.hero?.[`subtitle_${language}`] || cmsContent?.hero?.subtitle_en || 'Fast, transparent, and senior-friendly community reporting and official public service in San Nicolas, Pangasinan.';
  const aboutText = cmsContent?.about?.[`text_${language}`] || cmsContent?.about?.text_en || 'Barangay Bensican is a peaceful, agrarian and united community located in the municipality of San Nicolas, Province of Pangasinan. With E-Report Barangay, we provide our residents—especially the elderly and those who cannot easily walk to the barangay hall—direct digital access to community services, hearing summons, transparent finances, and prompt barangay resolution.';

  const handleReadAloudHero = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(`${heroTitle}. ${heroSubtitle}`);
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12 py-3 animate-fade-in">
      {/* Banner Announcement / Hero Section */}
      <section className="relative overflow-hidden rounded-3xl shadow-xl border-2 sm:border-3 border-emerald-500/60 bg-emerald-950">
        {/* Background Photo with Scenery and 'WE ❤️ BENSICAN' Letters */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url('/bensican-banner.png')` }}
        />

        {/* Semi-transparent gradient overlay ensuring text legibility while letting the photo's vibrant scenery show */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/65 to-emerald-950/80 backdrop-blur-[0.5px]" />

        {/* Content Container: Horizontally Balanced & Compact Height */}
        <div className="relative z-10 px-6 py-5 sm:px-8 sm:py-6 md:px-10 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          {/* Left Column: Official Badge, Title & Subtitle */}
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/75 text-amber-300 text-xs font-bold border border-emerald-500/40 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              {t('officialBarangayPortal')}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-white drop-shadow-md">
              {heroTitle}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-emerald-100 font-medium leading-relaxed drop-shadow-sm max-w-xl">
              {heroSubtitle}
            </p>
          </div>

          {/* Right Column: Horizontally Balanced Announcement / Community Badge */}
          <div className="shrink-0 flex items-center md:items-end justify-between md:justify-center gap-3">
            {announcements.length > 0 ? (
              <div
                onClick={() => navigate('/announcements')}
                className="cursor-pointer bg-emerald-950/80 hover:bg-emerald-950/95 backdrop-blur-md border border-amber-400/50 hover:border-amber-400 rounded-2xl p-3.5 max-w-xs transition shadow-lg space-y-1.5 group"
              >
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                  <span>Announcement</span>
                  <span className="text-[10px] text-emerald-200 ml-auto font-normal group-hover:underline">View →</span>
                </div>
                <p className="text-xs font-bold text-white line-clamp-1">
                  {announcements[0].title}
                </p>
                <p className="text-[11px] text-emerald-100/90 line-clamp-1">
                  {announcements[0].content}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-emerald-950/75 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-500/40 shadow-md">
                <img src="/logo.png" alt="Barangay Bensican Seal" className="w-10 h-10 object-contain drop-shadow" />
                <div>
                  <div className="text-xs font-bold text-white leading-tight">Barangay Bensican</div>
                  <div className="text-[11px] text-emerald-200">San Nicolas, Pangasinan</div>
                  <div className="text-[10px] text-amber-300 font-semibold mt-0.5">● 24/7 Digital Services</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works - 3 Picture Steps */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {t('howItWorks')}
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            {t('howItWorksDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-800/80 p-8 rounded-3xl border-3 border-emerald-200 dark:border-slate-700 shadow-md flex flex-col justify-between transition hover:shadow-lg">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-2xl flex items-center justify-center border-2 border-emerald-300">
                1
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {t('step1Title')}
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('step1Desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {t('step1Badge')}
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-slate-800/80 p-8 rounded-3xl border-3 border-emerald-200 dark:border-slate-700 shadow-md flex flex-col justify-between transition hover:shadow-lg">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-black text-2xl flex items-center justify-center border-2 border-blue-300">
                2
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {t('step2Title')}
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('step2Desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-blue-700 dark:text-blue-400">
              {t('step1Badge')}
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-800/80 p-8 rounded-3xl border-3 border-emerald-200 dark:border-slate-700 shadow-md flex flex-col justify-between transition hover:shadow-lg">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-black text-2xl flex items-center justify-center border-2 border-purple-300">
                3
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {t('step3Title')}
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('step3Desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-purple-700 dark:text-purple-400">
              {t('step3Badge')}
            </div>
          </div>
        </div>
      </section>

      {/* Pinned Announcements */}
      {announcements.length > 0 && (
        <section className="bg-amber-50 dark:bg-slate-800/90 border-3 border-amber-300 dark:border-amber-700 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-amber-500 text-slate-950 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Urgent Community Notice
              </h3>
            </div>
            <button
              onClick={() => navigate('/announcements')}
              className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              View all announcements →
            </button>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 2).map((a) => (
              <div key={a.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">{a.title}</h4>
                  <span className="text-xs px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold rounded-full">
                    {a.target_group}
                  </span>
                </div>
                <p className="text-base text-slate-700 dark:text-slate-300">{a.content}</p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => speak(`${a.title}. ${a.content}`)}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                  >
                    <Volume2 className="w-4 h-4" /> Listen to announcement
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About Barangay Bensican */}
      <section className="bg-white dark:bg-slate-800/80 p-8 sm:p-12 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="w-12 h-12 object-contain" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              About Barangay Bensican
            </h2>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
              Municipality of San Nicolas, Province of Pangasinan
            </p>
          </div>
        </div>

        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
          {aboutText}
        </p>

        {/* Directory Showcase */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Barangay Leadership & Lupon Tagapamayapa
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0">
                PB
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Punong Barangay</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Office of the Barangay Captain</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0">
                BK
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Barangay Kagawad</h4>
                <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">Committee on Peace & Order</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center shrink-0">
                BT
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Barangay Treasurer</h4>
                <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold">Financial Records & Lupon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Development Goals Alignment (SDG 16, 11, 9) */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            United Nations Sustainable Development Goals (SDG) Alignment
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            How E-Report Barangay advances transparent, resilient, and inclusive local governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-6 rounded-3xl border-2 border-emerald-300 dark:border-emerald-800 space-y-3">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-emerald-600 text-white rounded-xl">
                <ShieldCheck className="w-6 h-6" />
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

          <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-3xl border-2 border-blue-300 dark:border-blue-800 space-y-3">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-blue-600 text-white rounded-xl">
                <Building2 className="w-6 h-6" />
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

          <div className="bg-purple-50 dark:bg-purple-950/30 p-6 rounded-3xl border-2 border-purple-300 dark:border-purple-800 space-y-3">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-purple-600 text-white rounded-xl">
                <HeartHandshake className="w-6 h-6" />
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
      </section>
    </div>
  );
};

