import React from 'react';
import { Phone, MapPin, Clock, ShieldCheck, HeartHandshake, Building2, HelpCircle } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';

export const Footer: React.FC = () => {
  const { t } = useAccessibility();

  return (
    <footer className="w-full bg-slate-900 text-slate-200 border-t-4 border-emerald-600 mt-16 py-12 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1: Barangay Identity & Hotline */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Barangay Bensican Official Seal" className="w-12 h-12 drop-shadow object-contain" />
              <div>
                <h3 className="text-xl font-black text-white">Barangay Bensican</h3>
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">San Nicolas, Pangasinan</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              E-Report Barangay is the centralized digital governance and concern reporting portal dedicated to serving every resident of Barangay Bensican, with special design care for our elderly and non-tech-savvy community members.
            </p>

            <a
              href="tel:091755523674"
              className="inline-flex items-center gap-2.5 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-base shadow-lg transition min-h-[48px]"
            >
              <Phone className="w-5 h-5 animate-pulse text-amber-300" />
              <span>{t('callHotline')}</span>
            </a>
          </div>

          {/* Col 2: Hall Location, Hours & Emergency Contacts */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Barangay Hall Information</h4>
            <div className="flex items-start gap-2.5 text-sm text-slate-300">
              <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t('barangayAddress')} 2447</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-slate-300">
              <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t('officeHours')}</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-slate-300">
              <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Tel: +63 (075) 572-2345 / Mobile: 0917-555-BENSI</span>
            </div>
          </div>

          {/* Col 3: SDG Commitments & Data Privacy Act */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Public Trust & Standards</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
              <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 text-amber-300">
                <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                SDG 16<br /><span className="text-[10px] text-slate-300 font-normal">Peace & Justice</span>
              </div>
              <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 text-amber-300">
                <Building2 className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                SDG 11<br /><span className="text-[10px] text-slate-300 font-normal">Safe Community</span>
              </div>
              <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 text-amber-300">
                <HeartHandshake className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                SDG 9<br /><span className="text-[10px] text-slate-300 font-normal">Innovation</span>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs text-slate-300 leading-relaxed">
              <strong className="text-emerald-400 block mb-1">Philippine Data Privacy Act (RA 10173)</strong>
              {t('confidentialityNotice')}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-xs text-slate-400">
          © 2026 Barangay Bensican, San Nicolas, Pangasinan. Republic of the Philippines. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
