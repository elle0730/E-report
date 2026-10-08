import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Mail, Eye, EyeOff, ShieldCheck, KeyRound,
  AlertCircle, ArrowRight, UserCheck, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { t } = useAccessibility();

  // If already logged in, redirect directly to dashboard
  React.useEffect(() => {
    if (user) {
      if (user.role === 'super_admin' || user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/resident/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // CAPTCHA Challenge State
  const [requiresCaptcha, setRequiresCaptcha] = useState<boolean>(false);
  const [captchaData, setCaptchaData] = useState<{ challengeId: string; question: string; options: number[] } | null>(null);
  const [selectedCaptchaAnswer, setSelectedCaptchaAnswer] = useState<number | null>(null);

  // 2FA Challenge State
  const [requires2FA, setRequires2FA] = useState<boolean>(false);
  const [temp2FAToken, setTemp2FAToken] = useState<string>('');
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');
  const [twoFactorNotice, setTwoFactorNotice] = useState<string>('');

  // Forgot password state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string>('');

  const loadCaptcha = async () => {
    try {
      const res = await fetch('/api/auth/captcha-challenge');
      const data = await res.json();
      setCaptchaData(data);
      setRequiresCaptcha(true);
    } catch (err) {}
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          captchaId: captchaData?.challengeId,
          captchaAnswer: selectedCaptchaAnswer
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requires2FA) {
          setRequires2FA(true);
          setTemp2FAToken(data.tempToken);
          setTwoFactorNotice(data.message || 'Please enter your 6-digit verification code.');
        } else {
          // Direct login
          login(data.token, data.user, data.refreshToken);
          if (data.user.role === 'super_admin' || data.user.role === 'admin') navigate('/admin/dashboard', { replace: true });
          else navigate('/resident/dashboard', { replace: true });
        }
      } else {
        setErrorMessage(data.error || 'Failed to sign in.');
        if (data.requiresCaptcha) {
          loadCaptcha();
        }
      }
    } catch (err) {
      setErrorMessage('Server connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken: temp2FAToken,
          code: twoFactorCode
        })
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user, data.refreshToken);
        if (data.user.role === 'super_admin' || data.user.role === 'admin') navigate('/admin/dashboard', { replace: true });
        else navigate('/resident/dashboard', { replace: true });
      } else {
        setErrorMessage(data.error || 'Invalid 2FA code.');
      }
    } catch (err) {
      setErrorMessage('Server error during 2FA verification.');
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth Simulation
  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          email: `${provider}.resident@example.com`,
          fullName: 'Resident User',
          oauthToken: 'oauth-token'
        })
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user, data.refreshToken);
        navigate('/resident/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage('OAuth sign-in temporarily unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      setForgotSuccessMsg(data.message || 'Reset link issued.');
    } catch (err) {}
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 animate-fade-in space-y-6">
      {/* Login Card */}
      <div className="bg-white dark:bg-slate-800/90 p-8 sm:p-10 rounded-3xl border-3 border-emerald-300 dark:border-slate-700 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="Barangay Bensican Official Seal" className="w-16 h-16 mx-auto drop-shadow object-contain" />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {t('login')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Barangay Bensican, San Nicolas, Pangasinan
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-950/50 border-2 border-red-400 rounded-2xl flex items-start gap-3 text-red-900 dark:text-red-200">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="text-base font-bold">{errorMessage}</div>
          </div>
        )}

        {/* 2FA Prompt Modal if staff login */}
        {requires2FA ? (
          <form onSubmit={handleVerify2FA} className="space-y-4 animate-fade-in">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
                <span>{t('twoFactorRequired')}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {twoFactorNotice}
              </p>
            </div>

            <div>
              <label className="block text-base font-bold text-slate-900 dark:text-white mb-1">
                {t('enter2faCode')}
              </label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full text-center tracking-widest text-2xl font-black px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-lg shadow-lg transition min-h-[48px]"
            >
              {t('verifyAndAccess')}
            </button>

            <button
              type="button"
              onClick={() => {
                setRequires2FA(false);
                setTwoFactorCode('');
                setErrorMessage('');
              }}
              className="w-full py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:underline text-sm transition"
            >
              {t('cancelBack')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-base font-bold text-slate-900 dark:text-white mb-1">
                {t('emailAddress')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('enterEmail')}
                  className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base font-medium focus:border-emerald-600 dark:bg-slate-900"
                  required
                />
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-base font-bold text-slate-900 dark:text-white mb-1">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('enterPassword')}
                  className="w-full px-4 py-3 pl-11 pr-12 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base font-medium focus:border-emerald-600 dark:bg-slate-900"
                  required
                />
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5 text-emerald-600" />}
                </button>
              </div>
            </div>

            {/* Senior Friendly CAPTCHA if prompted */}
            {requiresCaptcha && captchaData && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border-2 border-blue-300 dark:border-blue-700 space-y-3">
                <span className="text-sm font-bold text-blue-900 dark:text-blue-200 block">
                  {t('securityCheck')}
                </span>
                <p className="text-base font-black text-slate-900 dark:text-white">
                  {captchaData.question}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {captchaData.options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedCaptchaAnswer(opt)}
                      className={`py-2 rounded-xl font-black text-base border-2 transition ${
                        selectedCaptchaAnswer === opt
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {t('forgotPassword')}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-lg shadow-lg transition flex items-center justify-center gap-2 min-h-[48px]"
            >
              <span>{isLoading ? t('signingIn') : t('login')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

        {/* OAuth Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block text-center">
            {t('orSignInWith')}
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="py-3 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-sm flex items-center justify-center gap-2 transition min-h-[48px]"
            >
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin('facebook')}
              className="py-3 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-bold rounded-xl border border-blue-300 dark:border-blue-700 text-sm flex items-center justify-center gap-2 transition min-h-[48px]"
            >
              <span>Facebook</span>
            </button>
          </div>
        </div>

        {/* Register link */}
        <div className="pt-2 text-center text-sm">
          <span className="text-slate-600 dark:text-slate-400">{t('newResident')} </span>
          <button
            onClick={() => navigate('/register')}
            className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline ml-1"
          >
            {t('registerHere')}
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Reset Your Password
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enter your registered email address to receive password reset assistance.
            </p>

            {forgotSuccessMsg ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-semibold border border-emerald-300">
                {forgotSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm dark:bg-slate-800"
                  required
                />
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold"
                  >
                    Send Instructions
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

