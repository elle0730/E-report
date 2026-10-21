import React from 'react';
import { X, Volume2, Phone, FileText, Mic, Eye, Users, HelpCircle } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { speak, isSpeaking, stopSpeaking, t, language, setLanguage } = useAccessibility();

  if (!isOpen) return null;

  const handleReadGuide = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const readText =
        language === 'tl'
          ? `${t('help')}. ${t('helpGuideTitle')}. Hakbang 1: ${t('helpStep1Title')}. ${t('helpStep1Desc')}. Hakbang 2: ${t('helpStep2Title')}. ${t('helpStep2Desc')}. Hakbang 3: ${t('helpStep3Title')}. ${t('helpStep3Desc')}. Hakbang 4: ${t('helpStep4Title')}. ${t('helpStep4Desc')}. Hotline: 0917-555-BENSI.`
          : language === 'il'
          ? `${t('help')}. ${t('helpGuideTitle')}. Addang 1: ${t('helpStep1Title')}. ${t('helpStep1Desc')}. Addang 2: ${t('helpStep2Title')}. ${t('helpStep2Desc')}. Addang 3: ${t('helpStep3Title')}. ${t('helpStep3Desc')}. Addang 4: ${t('helpStep4Title')}. ${t('helpStep4Desc')}. Hotline: 0917-555-BENSI.`
          : `${t('help')}. ${t('helpGuideTitle')}. Step 1: ${t('helpStep1Title')}. ${t('helpStep1Desc')}. Step 2: ${t('helpStep2Title')}. ${t('helpStep2Desc')}. Step 3: ${t('helpStep3Title')}. ${t('helpStep3Desc')}. Step 4: ${t('helpStep4Title')}. ${t('helpStep4Desc')}. Hotline: 0917-555-BENSI.`;
      speak(readText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-slate-900 border-4 border-amber-500 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-guide-title"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4 mb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 rounded-xl text-amber-800 dark:text-amber-400 shrink-0">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-300 text-xs font-black uppercase mb-1.5 border border-amber-300 dark:border-amber-700 shadow-2xs">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{t('help')}</span>
              </div>
              <h2 id="help-guide-title" className="text-2xl font-black text-slate-900 dark:text-white">
                {t('helpGuideTitle')}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('helpGuideSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-end">
            {/* Quick Language Switcher inside Help Modal */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg transition ${
                  language === 'en' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('tl')}
                className={`px-2 py-1 rounded-lg transition ${
                  language === 'tl' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Tagalog
              </button>
              <button
                type="button"
                onClick={() => setLanguage('il')}
                className={`px-2 py-1 rounded-lg transition ${
                  language === 'il' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Ilokano
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close help guide"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Read aloud button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleReadGuide}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow transition"
          >
            <Volume2 className="w-5 h-5" />
            <span>
              {isSpeaking
                ? (language === 'tl' ? 'Ihinto ang Audio' : language === 'il' ? 'Isardeng ti Audio' : 'Stop Audio')
                : t('helpListenGuide')}
            </span>
          </button>
        </div>

        {/* Visual Steps */}
        <div className="space-y-4 text-base">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 font-black text-lg">
              1
            </div>
            <div>
              <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-300">
                {t('helpStep1Title')}
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {t('helpStep1Desc')}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border-2 border-blue-300 dark:border-blue-800">
            <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 font-black text-lg">
              2
            </div>
            <div>
              <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300">
                {t('helpStep2Title')}
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {t('helpStep2Desc')}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border-2 border-purple-300 dark:border-purple-800">
            <div className="p-2 bg-purple-600 text-white rounded-xl shrink-0 font-black text-lg">
              3
            </div>
            <div>
              <h3 className="font-bold text-lg text-purple-900 dark:text-purple-300">
                {t('helpStep3Title')}
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {t('helpStep3Desc')}
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border-2 border-amber-300 dark:border-amber-800">
            <div className="p-2 bg-amber-600 text-slate-950 rounded-xl shrink-0 font-black text-lg">
              4
            </div>
            <div>
              <h3 className="font-bold text-lg text-amber-900 dark:text-amber-300">
                {t('helpStep4Title')}
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {t('helpStep4Desc')}
              </p>
              <div className="mt-3">
                <a
                  href="tel:091755523674"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('callHotlineButton')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-base shadow transition min-h-[48px]"
          >
            {t('gotItStart')}
          </button>
        </div>
      </div>
    </div>
  );
};

