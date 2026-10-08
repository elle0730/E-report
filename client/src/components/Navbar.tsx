import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell, User as UserIcon, LogOut, MoreVertical, Sun, Moon,
  Eye, Volume2, VolumeX, Sparkles, HelpCircle, Shield, Settings,
  Check, ToggleLeft, ToggleRight, Globe, Layers, ArrowRight
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  onOpenHelp: () => void;
  pageTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHelp, pageTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    language,
    setLanguage,
    increaseTextSize,
    decreaseTextSize,
    resetTextSize,
    highContrast,
    toggleHighContrast,
    theme,
    toggleTheme,
    speak,
    stopSpeaking,
    isSpeaking,
    openTutorial,
    t
  } = useAccessibility();

  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isStaffAvailable, setIsStaffAvailable] = useState<boolean>(true);
  const [staffPresenceLoading, setStaffPresenceLoading] = useState<boolean>(false);

  // Dropdown states
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState<boolean>(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setProfileMenuOpen(false);
    setSettingsMenuOpen(false);
  }, [location.pathname]);

  // Fetch unread notifications count if logged in
  useEffect(() => {
    if (user) {
      fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('bensican_token')}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.unreadCount !== undefined) {
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const toggleStaffPresence = async () => {
    if (!user || user.role === 'resident') return;
    setStaffPresenceLoading(true);
    try {
      const nextState = !isStaffAvailable;
      const res = await fetch('/api/bensi/presence/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bensican_token')}`
        },
        body: JSON.stringify({ isAvailable: nextState })
      });
      if (res.ok) {
        setIsStaffAvailable(nextState);
      }
    } catch (err) {
      console.error('Failed to toggle presence:', err);
    } finally {
      setStaffPresenceLoading(false);
    }
  };

  const handleReadAloudCurrentPage = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const text = pageTitle
        ? `${pageTitle}. Welcome to Barangay Bensican E-Report system. Tap any card or button to proceed.`
        : 'Welcome to Barangay Bensican online portal. Please choose an option.';
      speak(text);
    }
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Left Side: Official Brand & Logo */}
        <button
          type="button"
          onClick={() => {
            if (user?.role === 'super_admin' || user?.role === 'admin') navigate('/admin/dashboard');
            else if (user?.role === 'resident') navigate('/resident/dashboard');
            else navigate('/');
          }}
          className="flex items-center gap-3 text-left group focus:outline-hidden"
          aria-label="Go to Home"
        >
          <img src="/logo.png" alt="Barangay Bensican Official Seal" className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow object-contain rounded-full" />
          <div>
            <div className="text-lg sm:text-xl font-black text-emerald-800 dark:text-emerald-400 group-hover:text-emerald-700 leading-tight">
              E-Report Bensican
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              San Nicolas, Pangasinan
            </div>
          </div>
        </button>

        {/* Center: Dynamic Page Title Indicator (if available on desktop) */}
        {pageTitle && (
          <div className="hidden lg:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 font-bold text-xs">
            <span>{pageTitle}</span>
          </div>
        )}

        {/* Right Side: STRICTLY Notifications, Profile Menu, and Three-Dot (⋮) Menu */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* 1. NOTIFICATIONS BELL */}
              <button
                type="button"
                onClick={() => navigate('/notifications')}
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center transition focus:outline-hidden"
                aria-label="View notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* 2. PROFILE MENU DROPDOWN */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(prev => !prev);
                    setSettingsMenuOpen(false);
                  }}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl flex items-center gap-2 font-bold min-h-[44px] transition border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                  aria-label="User Account Menu"
                  aria-expanded={profileMenuOpen}
                >
                  {user.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt={user.fullName}
                      className="w-7 h-7 rounded-full object-cover border border-emerald-500"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-black">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                    </div>
                  )}

                  <span className="hidden sm:inline text-xs sm:text-sm font-semibold truncate max-w-[110px]">
                    {user.fullName}
                  </span>

                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 uppercase font-black">
                    {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Resident'}
                  </span>
                </button>

                {/* Profile Flyout Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-2 z-50 animate-fadeIn space-y-1">
                    {/* User Info Header */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-700/60 mb-2">
                      <div className="flex items-center gap-3">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-emerald-500" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black flex items-center justify-center text-sm">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <strong className="block text-sm font-bold text-slate-900 dark:text-white truncate">
                            {user.fullName}
                          </strong>
                          <span className="text-xs text-slate-500 truncate block">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links inside Profile Menu */}
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/profile');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold flex items-center gap-2.5 text-slate-800 dark:text-slate-200 transition"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-600" />
                      <span>{t('profile')}</span>
                    </button>

                    {user.role === 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/admin/settings');
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold flex items-center gap-2.5 text-slate-800 dark:text-slate-200 transition"
                      >
                        <Settings className="w-4 h-4 text-purple-600" />
                        <span>{t('masterSettings')}</span>
                      </button>
                    )}

                    {(user.role === 'admin' || user.role === 'super_admin') && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/admin/dashboard');
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold flex items-center gap-2.5 text-slate-800 dark:text-slate-200 transition"
                      >
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>{t('adminWorkstation')}</span>
                      </button>
                    )}

                    {user.role === 'resident' && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/resident/dashboard');
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold flex items-center gap-2.5 text-slate-800 dark:text-slate-200 transition"
                      >
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <span>{t('residentDashboard')}</span>
                      </button>
                    )}

                    {/* Divider */}
                    <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

                    {/* Logout inside Profile Menu */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-sm font-bold flex items-center gap-2.5 text-red-600 transition"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : !isAuthPage ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl text-sm min-h-[44px] transition"
              >
                {t('login')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm min-h-[44px] shadow-xs transition"
              >
                {t('register')}
              </button>
            </div>
          ) : null}

          {/* 3. MICROSOFT EDGE-STYLE THREE-DOT (⋮) MENU */}
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={() => {
                setSettingsMenuOpen(prev => !prev);
                setProfileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center transition border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              aria-label="Settings and more"
              title="Settings and more (⋮)"
              aria-expanded={settingsMenuOpen}
            >
              <MoreVertical className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>

            {/* Edge-Style Settings Flyout Menu */}
            {settingsMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-4 z-50 animate-fadeIn space-y-4 max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    {t('settingsPreferences')}
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-bold text-slate-600 dark:text-slate-300">
                    Bensican E-Report
                  </span>
                </div>

                {/* Display Section */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> {t('displayAppearance')}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 text-left text-xs font-bold flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-1.5">
                        {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                        {theme === 'dark' ? t('dark') : t('light')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleHighContrast}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition ${
                        highContrast
                          ? 'bg-yellow-400 text-black border-yellow-500'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-emerald-600" />
                        {t('contrast')}
                      </span>
                      {highContrast && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Reading Comfort Section */}
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-blue-500" /> {t('readingComfort')}
                  </span>

                  {/* Text Size Resizer */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t('textSize')}:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={decreaseTextSize}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-xs font-bold shadow-xs hover:bg-slate-100"
                        title="Decrease text size"
                      >
                        A−
                      </button>
                      <button
                        type="button"
                        onClick={resetTextSize}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 text-[10px] font-semibold shadow-xs hover:bg-slate-100"
                        title="Reset text size"
                      >
                        100%
                      </button>
                      <button
                        type="button"
                        onClick={increaseTextSize}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                        title="Increase text size"
                      >
                        A+
                      </button>
                    </div>
                  </div>

                  {/* Read Aloud Button */}
                  <button
                    type="button"
                    onClick={handleReadAloudCurrentPage}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition ${
                      isSpeaking
                        ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-black" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                      <span>{isSpeaking ? t('stopAudio') : t('readAloud')}</span>
                    </span>
                    {isSpeaking && <span className="text-[10px] uppercase font-black">{t('playing')}</span>}
                  </button>
                </div>

                {/* Language Section */}
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-500" /> {t('language')}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'tl', label: 'Tagalog' },
                      { code: 'il', label: 'Ilokano' }
                    ].map(l => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setLanguage(l.code as any)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition ${
                          language === l.code
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Help & Tutorials Section */}
                <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-700 pt-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Learning & Assistance
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsMenuOpen(false);
                      openTutorial();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Guide Tips (Interactive Tutorial)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSettingsMenuOpen(false);
                      onOpenHelp();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-xs transition"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-950" />
                    <span>{t('help')}</span>
                  </button>
                </div>

                {/* Staff Availability Toggle (Only for Admin & Super Admin) */}
                {user && (user.role === 'admin' || user.role === 'super_admin') && (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Staff Presence Status
                    </span>
                    <button
                      type="button"
                      onClick={toggleStaffPresence}
                      disabled={staffPresenceLoading}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                        isStaffAvailable
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                          : 'bg-amber-600 text-white border-amber-500'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isStaffAvailable ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        <span>{isStaffAvailable ? 'Staff: Available (Live Chat)' : 'Staff: Away (Bensi Active)'}</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
