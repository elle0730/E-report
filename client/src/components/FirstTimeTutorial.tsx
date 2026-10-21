import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, Volume2, Mic, Eye, Phone } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';

interface FirstTimeTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstTimeTutorial: React.FC<FirstTimeTutorialProps> = ({ isOpen, onClose }) => {
  const { t, language, setLanguage, speak, isSpeaking, stopSpeaking } = useAccessibility();
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: t('tutorialStep0Title'),
      desc: t('tutorialStep0Desc'),
      icon: <Sparkles className="w-12 h-12 text-amber-500" />
    },
    {
      title: t('tutorialStep1Title'),
      desc: t('tutorialStep1Desc'),
      icon: <Eye className="w-12 h-12 text-blue-500" />
    },
    {
      title: t('tutorialStep2Title'),
      desc: t('tutorialStep2Desc'),
      icon: <Mic className="w-12 h-12 text-emerald-500" />
    },
    {
      title: t('tutorialStep3Title'),
      desc: t('tutorialStep3Desc'),
      icon: <Check className="w-12 h-12 text-purple-500" />
    },
    {
      title: t('tutorialStep4Title'),
      desc: t('tutorialStep4Desc'),
      icon: <Phone className="w-12 h-12 text-amber-600" />
    }
  ];

  const current = steps[currentStep];

  const handleReadCurrentStep = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(`${current.title}. ${current.desc}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header: Step Badge & Language Selector & Skip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-700">
              {language === 'tl'
                ? `Gabay • Hakbang ${currentStep + 1} sa ${steps.length}`
                : language === 'il'
                ? `Pangiwanwan • Addang ${currentStep + 1} iti ${steps.length}`
                : `Tutorial • Step ${currentStep + 1} of ${steps.length}`}
            </span>
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-end">
            {/* Quick In-Modal Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  language === 'en' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('tl')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  language === 'tl' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Tagalog
              </button>
              <button
                type="button"
                onClick={() => setLanguage('il')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  language === 'il' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Ilokano
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline"
            >
              {t('skipGuide')}
            </button>
          </div>
        </div>

        <div className="text-center my-6">
          <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 shadow-inner">
            {current.icon}
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {current.title}
          </h3>
          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
            {current.desc}
          </p>
        </div>

        {/* Read aloud step */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleReadCurrentStep}
            className="px-3 py-1.5 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-900 dark:text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Volume2 className="w-4 h-4" />
            <span>
              {isSpeaking
                ? (language === 'tl' ? 'Ihinto ang Audio' : language === 'il' ? 'Isardeng ti Audio' : 'Stop Audio')
                : t('listenTip')}
            </span>
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          {currentStep > 0 ? (
            <button
              onClick={() => {
                stopSpeaking();
                setCurrentStep(prev => prev - 1);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold flex items-center gap-1 text-sm transition min-h-[48px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('back')}</span>
            </button>
          ) : <div />}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => {
                stopSpeaking();
                setCurrentStep(prev => prev + 1);
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 text-base transition shadow min-h-[48px]"
            >
              <span>{t('next')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 text-base transition shadow min-h-[48px]"
            >
              <Check className="w-5 h-5" />
              <span>{t('gotItStart')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

