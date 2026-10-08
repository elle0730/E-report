import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  backTo?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  speakText?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  backTo,
  badge,
  actions,
  speakText,
  className = ''
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { speak, stopSpeaking, isSpeaking, t } = useAccessibility();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }
    // Safe fallback: never let an authenticated user navigate back to Landing Page "/"
    if (user) {
      if (window.history.length > 2) {
        navigate(-1);
      } else if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/resident/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(speakText || `${title}. ${subtitle || ''}`);
    }
  };

  return (
    <div className={`bg-slate-800 text-white border-b border-slate-700 py-6 px-4 sm:px-6 lg:px-8 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            type="button"
            onClick={handleBack}
            className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-emerald-400 min-h-[44px] min-w-[44px]"
            title={t('back')}
            aria-label={t('back')}
          >
            <ArrowLeft className="w-5 h-5 text-emerald-400" />
            <span className="text-xs sm:text-sm font-semibold pr-1 hidden sm:inline">{t('back')}</span>
          </button>

          {icon && (
            <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-emerald-400 shrink-0">
              {icon}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                {title}
              </h1>
              {speakText !== undefined || subtitle ? (
                <button
                  type="button"
                  onClick={handleSpeak}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isSpeaking
                      ? 'bg-amber-500 text-slate-950 animate-pulse'
                      : 'bg-slate-700/60 hover:bg-slate-700 text-emerald-300'
                  }`}
                  title="Listen to instructions"
                  aria-label="Listen to instructions"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              ) : null}
            </div>

            {subtitle && (
              <p className="text-slate-300 text-xs sm:text-sm md:text-base mt-1 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center flex-wrap">
          {badge}
          {actions}
        </div>
      </div>
    </div>
  );
};

