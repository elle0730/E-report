import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, MapPin, Upload, CheckCircle2, ArrowRight, ArrowLeft,
  Camera, FileText, AlertTriangle, ShieldCheck, HeartHandshake, Eye
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { useAuth } from '../context/AuthContext.js';

export const RegisterWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useAccessibility();
  const { user, login } = useAuth();

  // Load wizard draft from localStorage
  const [step, setStep] = useState<number>(() => {
    const savedStep = localStorage.getItem('bensican_reg_step');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('bensican_reg_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      fullName: '',
      email: '',
      password: '',
      birthday: '',
      contactNumber: '',
      houseNumber: '',
      street: '',
      barangay: 'Bensican',
      residencyLength: '',
      validIdUrl: '',
      selfieUrl: '',
      helperName: '',
      agreePrivacyPolicy: false
    };
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [createdUserId, setCreatedUserId] = useState<string>('');

  // If already authenticated and not viewing registration completion, redirect to dashboard
  useEffect(() => {
    if (user && !isSuccess) {
      if (user.role === 'super_admin' || user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/resident/dashboard', { replace: true });
      }
    }
  }, [user, isSuccess, navigate]);

  // Autosave progress to localStorage
  useEffect(() => {
    localStorage.setItem('bensican_reg_data', JSON.stringify(formData));
    localStorage.setItem('bensican_reg_step', step.toString());
  }, [formData, step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'validIdUrl' | 'selfieUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate/Perform upload via endpoint
    const form = new FormData();
    form.append('files', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          // Upload open for registration or public file handler
        },
        body: form
      });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev: any) => ({ ...prev, [fieldName]: data.file?.filePath || URL.createObjectURL(file) }));
      } else {
        // Fallback to local object url preview
        setFormData((prev: any) => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
      }
    } catch (err) {
      setFormData((prev: any) => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
    }
  };

  const validateStep = (currentStep: number): boolean => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        setErrorMessage('Please enter your complete legal name (Pangalan).');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('Please enter a valid email address (Email).');
        return false;
      }
      if (!formData.password || formData.password.length < 6) {
        setErrorMessage('Please create a password of at least 6 characters.');
        return false;
      }
      if (!formData.contactNumber.trim()) {
        setErrorMessage('Please enter your contact or cellphone number.');
        return false;
      }
    } else if (currentStep === 2) {
      if (formData.barangay.trim().toLowerCase() !== 'bensican') {
        setErrorMessage('Registration is exclusive only to residents of Barangay Bensican, San Nicolas, Pangasinan.');
        return false;
      }
      if (!formData.street.trim()) {
        setErrorMessage('Please provide your street or purok in Bensican.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.validIdUrl) {
        setErrorMessage('Please provide a photo of your Valid ID, Senior ID, or Barangay Residency Proof.');
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.agreePrivacyPolicy) {
        setErrorMessage('You must check the agreement box for the Philippine Data Privacy Act (RA 10173).');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setErrorMessage('');
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        if (data.token && data.user) {
          login(data.token, data.user, data.refreshToken);
        }
        setIsSuccess(true);
        setCreatedUserId(data.userId);
        // Clear wizard draft
        localStorage.removeItem('bensican_reg_data');
        localStorage.removeItem('bensican_reg_step');
      } else {
        setErrorMessage(data.error || 'Failed to submit registration. Please verify details.');
      }
    } catch (err: any) {
      setErrorMessage('Server connection error. Please try again or visit the Barangay Hall.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in text-center">
        <div className="bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-3xl border-4 border-emerald-500 shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-400">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Registration Submitted!
          </h1>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border-2 border-amber-300 dark:border-amber-700 text-base text-slate-800 dark:text-slate-200">
            <strong className="text-amber-800 dark:text-amber-300 block text-lg font-bold mb-1">
              Account Status: Waiting for Approval
            </strong>
            Your residency in Barangay Bensican is currently being verified by our administrators. You will be notified once approved.
          </div>

          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Need urgent help or want to follow up in person? Call our hotline at <strong>0917-555-BENSI</strong> or drop by the Barangay Hall during office hours.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/resident/dashboard', { replace: true })}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-base shadow transition min-h-[48px]"
            >
              Go to Resident Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in space-y-8">
      {/* Title & Progress Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Resident Registration
        </h1>
        <p className="text-base text-emerald-800 dark:text-emerald-400 font-semibold">
          Barangay Bensican, San Nicolas, Pangasinan
        </p>

        {/* 4-Step Progress Indicator */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
            <span>Step {step} of 4</span>
            <span>{step === 1 ? 'Personal Info' : step === 2 ? 'Address' : step === 3 ? 'Proof of ID' : 'Review & Send'}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/50 border-2 border-red-400 rounded-2xl flex items-start gap-3 text-red-900 dark:text-red-200">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="text-base font-bold">{errorMessage}</div>
        </div>
      )}

      {/* Main Wizard Form Card */}
      <div className="bg-white dark:bg-slate-800/90 p-6 sm:p-10 rounded-3xl border-3 border-emerald-300 dark:border-slate-700 shadow-xl space-y-6">
        {/* STEP 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-7 h-7 text-emerald-600" />
                <span>{language === 'tl' ? 'Hakbang 1: Impormasyon ng Residente' : 'Step 1: Personal Information'}</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Please type your complete name as written on your official ID.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-base font-bold text-slate-900 dark:text-white mb-1">
                  {language === 'tl' ? 'Buong Pangalan *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full legal name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base font-medium focus:border-emerald-600 dark:bg-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-slate-900 dark:text-white mb-1">
                    {language === 'tl' ? 'Email Address *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base font-medium focus:border-emerald-600 dark:bg-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-slate-900 dark:text-white mb-1">
                    {language === 'tl' ? 'Password *' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base font-medium focus:border-emerald-600 dark:bg-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-slate-900 dark:text-white mb-1">
                    {language === 'tl' ? 'Numero ng Telepono / Cellphone *' : 'Contact / Cellphone Number *'}
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Enter your contact number"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base font-medium focus:border-emerald-600 dark:bg-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-slate-900 dark:text-white mb-1">
                    Date of Birth (Kapanganakan)
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base font-medium focus:border-emerald-600 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Where do you live? */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-7 h-7 text-emerald-600" />
                <span>Step 2: Where do you live in Bensican?</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                This service is strictly for residents living within Barangay Bensican, San Nicolas, Pangasinan.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-slate-900 dark:text-white mb-1">
                    House / Lot / Unit Number
                  </label>
                  <input
                    type="text"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleChange}
                    placeholder="Enter house / lot / unit number"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base font-medium focus:border-emerald-600 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-slate-900 dark:text-white mb-1">
                    Street / Purok *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Enter street or purok"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base font-medium focus:border-emerald-600 dark:bg-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-slate-900 dark:text-white mb-1">
                    Barangay (Pre-set)
                  </label>
                  <input
                    type="text"
                    name="barangay"
                    value="Bensican (San Nicolas, Pangasinan)"
                    disabled
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-slate-900 dark:text-white mb-1">
                    Years of Residency
                  </label>
                  <input
                    type="text"
                    name="residencyLength"
                    value={formData.residencyLength}
                    onChange={handleChange}
                    placeholder="Enter years of residency"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base font-medium focus:border-emerald-600 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Prove it */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-7 h-7 text-emerald-600" />
                <span>Step 3: Prove It (Patunay ng ID at Mukha)</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Upload a photo of your ID (Senior ID, Voter ID, Driver's License, or Barangay Certificate) and a selfie photo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Photo of Valid ID */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Photo of Valid ID or Residency Proof *
                </h3>
                <p className="text-xs text-slate-500">
                  Senior Citizen ID, Voter's Certificate, PhilSys, etc.
                </p>

                {formData.validIdUrl ? (
                  <div className="mt-2 space-y-2">
                    <img src={formData.validIdUrl} alt="Valid ID Preview" className="h-28 mx-auto object-cover rounded-lg border" />
                    <span className="text-xs text-emerald-600 font-bold block">✓ Photo Attached</span>
                  </div>
                ) : null}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'validIdUrl')}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {/* Selfie Photo */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Photo of Face (Selfie)
                </h3>
                <p className="text-xs text-slate-500">
                  A clear front-facing picture of your face for verification.
                </p>

                {formData.selfieUrl ? (
                  <div className="mt-2 space-y-2">
                    <img src={formData.selfieUrl} alt="Selfie Preview" className="h-28 mx-auto object-cover rounded-lg border" />
                    <span className="text-xs text-emerald-600 font-bold block">✓ Photo Attached</span>
                  </div>
                ) : null}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'selfieUrl')}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Check and Send */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                <span>Step 4: Check and Send (Suriin at Ipadala)</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Please double check all your information below before submitting.
              </p>
            </div>

            {/* Review Summary Box */}
            <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-base">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500 text-sm">Full Name:</span> <strong className="block text-slate-900 dark:text-white">{formData.fullName}</strong></div>
                <div><span className="text-slate-500 text-sm">Contact:</span> <strong className="block text-slate-900 dark:text-white">{formData.contactNumber}</strong></div>
                <div><span className="text-slate-500 text-sm">Address:</span> <strong className="block text-slate-900 dark:text-white">{formData.houseNumber ? `${formData.houseNumber}, ` : ''}{formData.street}, Barangay Bensican</strong></div>
                <div><span className="text-slate-500 text-sm">Residency:</span> <strong className="block text-slate-900 dark:text-white">{formData.residencyLength || 'Long-time resident'}</strong></div>
              </div>
            </div>

            {/* Helper option */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
              <label className="block text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                <span>{language === 'tl' ? 'Pangalan ng Tumulong (Opsyonal)' : 'Bring a Helper (Optional)'}</span>
              </label>
              <input
                type="text"
                name="helperName"
                value={formData.helperName}
                onChange={handleChange}
                placeholder="Enter helper or assistant name (optional)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-base dark:bg-slate-900"
              />
              <p className="text-xs text-slate-500">Optional: Enter helper name if an assistant or family member helped you register.</p>
            </div>

            {/* Data Privacy Consent (RA 10173) */}
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreePrivacyPolicy"
                  checked={formData.agreePrivacyPolicy}
                  onChange={handleChange}
                  className="w-6 h-6 mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                  required
                />
                <span className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  <strong>Philippine Data Privacy Consent (RA 10173):</strong> I certify that I am a resident of Barangay Bensican, San Nicolas, Pangasinan. I voluntarily submit my information and ID for verification purposes only.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl text-base flex items-center gap-2 transition min-h-[48px]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('back')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Already registered? Sign in
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-lg flex items-center gap-2 shadow-lg transition min-h-[48px]"
            >
              <span>{t('next')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-black rounded-xl text-lg flex items-center gap-2 shadow-xl transition min-h-[48px]"
            >
              {isSubmitting ? (
                <span>Submitting to Barangay...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Send Registration (Isumite)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

