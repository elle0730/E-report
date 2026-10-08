import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Mic, MicOff, Camera, Upload, CheckCircle2,
  AlertTriangle, Copy, Printer, ArrowRight, ShieldCheck,
  ShieldAlert, Trash2, Hammer, Volume2, Users, HeartPulse, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { useAuth } from '../context/AuthContext.js';
import { PageHeader } from '../components/PageHeader.js';

export const SendReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, listen, stopListening, isListening } = useAccessibility();
  const { user } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [locationDetails, setLocationDetails] = useState<string>('');
  const [incidentDate, setIncidentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [helperName, setHelperName] = useState<string>(user?.helperName || '');
  const [attachments, setAttachments] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successData, setSuccessData] = useState<{ refNumber: string; reportId: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Load active categories
  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setSelectedCategory(data.categories[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      listen((spokenText) => {
        setDescription(prev => (prev ? `${prev} ${spokenText}` : spokenText));
      });
    }
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const form = new FormData();
    for (let i = 0; i < files.length; i++) {
      form.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('bensican_token')}`
        },
        body: form
      });

      if (res.ok) {
        const data = await res.json();
        setAttachments(prev => [...prev, ...(data.files || [data.file])]);
      }
    } catch (err) {
      // Local fallback preview
      for (let i = 0; i < files.length; i++) {
        setAttachments(prev => [...prev, {
          fileName: files[i].name,
          filePath: URL.createObjectURL(files[i]),
          mimeType: files[i].type
        }]);
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedCategory || !title.trim() || !locationDetails.trim()) {
      setErrorMessage('Please select a category, enter a title, and provide the exact location.');
      return;
    }

    // Photo/Video only mode: Description is optional ONLY if attachments exist
    if (!description.trim() && attachments.length === 0) {
      setErrorMessage('Please either write a description or attach at least one photo/video.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('bensican_token');
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          categoryId: selectedCategory,
          title: title.trim(),
          description: description.trim(),
          locationDetails: locationDetails.trim(),
          incidentDate,
          helperName: helperName.trim(),
          attachments
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessData({ refNumber: data.refNumber, reportId: data.reportId });
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        window.scrollTo(0, 0);
      } else {
        setErrorMessage(data.error || 'Failed to submit report. Please check details.');
      }
    } catch (err) {
      setErrorMessage('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRefNumber = () => {
    if (successData?.refNumber) {
      navigator.clipboard.writeText(successData.refNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Helper icon renderer
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6 text-red-500" />;
      case 'Trash2': return <Trash2 className="w-6 h-6 text-emerald-600" />;
      case 'Hammer': return <Hammer className="w-6 h-6 text-amber-600" />;
      case 'Volume2': return <Volume2 className="w-6 h-6 text-orange-500" />;
      case 'Users': return <Users className="w-6 h-6 text-blue-500" />;
      case 'HeartPulse': return <HeartPulse className="w-6 h-6 text-pink-500" />;
      default: return <HelpCircle className="w-6 h-6 text-slate-500" />;
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center animate-fade-in space-y-6">
        <div className="bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-3xl border-4 border-emerald-500 shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-400">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {t('successTitle')}
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300">
            {t('successSubtitle')}
          </p>

          {/* Big Reference Number Highlight Box */}
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border-3 border-emerald-400 dark:border-emerald-700 space-y-3">
            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
              {t('yourRefNumber')}
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-900 dark:text-emerald-200 select-all">
              {successData.refNumber}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('keepRefNotice')}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={copyRefNumber}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl text-base flex items-center gap-2 transition min-h-[48px]"
            >
              <Copy className="w-5 h-5" />
              <span>{copied ? 'Copied to Clipboard!' : t('copyNumber')}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl text-base flex items-center gap-2 transition min-h-[48px]"
            >
              <Printer className="w-5 h-5" />
              <span>{t('print')}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(`/track/${successData.refNumber}`)}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-lg shadow-lg flex items-center justify-center gap-2 transition min-h-[48px]"
            >
              <span>Track This Report</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate('/resident')}
              className="px-6 py-3.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 font-bold text-base min-h-[48px]"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <PageHeader
        title={t('residentSendReport')}
        subtitle="Report community concerns, infrastructure issues, or disputes directly to Barangay Bensican."
        icon={<FileText className="w-8 h-8 text-emerald-400" />}
        backTo="/resident/dashboard"
      />

      <div className="max-w-3xl mx-auto py-6 px-4 space-y-6 animate-fade-in">

      {/* Confidentiality Notice Banner */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 flex items-start gap-3 text-emerald-950 dark:text-emerald-200">
        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-sm font-medium leading-relaxed">
          {t('confidentialityNotice')}
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/50 border-2 border-red-400 rounded-2xl flex items-start gap-3 text-red-900 dark:text-red-200">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="text-base font-bold">{errorMessage}</div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800/90 p-6 sm:p-10 rounded-3xl border-3 border-emerald-300 dark:border-slate-700 shadow-xl space-y-6">
        {/* Category Selector */}
        <div className="space-y-2">
          <label className="block text-lg font-bold text-slate-900 dark:text-white">
            {t('formCategory')} *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-2xl border-3 text-left flex items-center gap-3 transition min-h-[58px] ${
                  selectedCategory === cat.id
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-slate-900 dark:text-white font-black shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300 font-semibold'
                }`}
              >
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xs shrink-0">
                  {getCategoryIcon(cat.icon)}
                </div>
                <div>
                  <span className="block text-base leading-tight">{cat.name}</span>
                  {cat.description && (
                    <span className="text-xs text-slate-500 line-clamp-1">{cat.description}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <label className="block text-base font-bold text-slate-900 dark:text-white">
            {t('formTitle')} *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('formTitlePlaceholder')}
            className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base font-medium focus:border-emerald-600 dark:bg-slate-900"
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-1">
          <label className="block text-base font-bold text-slate-900 dark:text-white">
            {t('formLocation')} *
          </label>
          <input
            type="text"
            value={locationDetails}
            onChange={(e) => setLocationDetails(e.target.value)}
            placeholder={t('formLocationPlaceholder')}
            className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base font-medium focus:border-emerald-600 dark:bg-slate-900"
            required
          />
        </div>

        {/* Description + Voice Dictation Button */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-base font-bold text-slate-900 dark:text-white">
              {t('formDesc')}
            </label>
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse border-red-600'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-600" />}
              <span>{isListening ? 'Stop Speaking' : t('speakMicrophone')}</span>
            </button>
          </div>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('formDescPlaceholder')}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base font-medium focus:border-emerald-600 dark:bg-slate-900"
          />
          <p className="text-xs text-slate-500">
            Note: If you have difficulty typing, tap the microphone to talk or simply attach pictures below.
          </p>
        </div>

        {/* Attachments / Photos */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-slate-900 dark:text-white">
            {t('formAttachments')}
          </label>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Take a photo with your phone or select from your gallery
            </p>

            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleAttachmentUpload}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
          </div>

          {/* Attachment list & preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {attachments.map((att, idx) => (
                <div key={idx} className="relative group border rounded-xl p-2 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                  <img src={att.filePath} alt="" className="w-12 h-12 object-cover rounded-lg" />
                  <span className="text-xs font-medium max-w-[120px] truncate">{att.fileName}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-red-500 hover:text-red-700 font-bold px-1"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bring a Helper */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <label className="block text-base font-bold text-slate-900 dark:text-white">
            {t('formHelper')}
          </label>
          <input
            type="text"
            value={helperName}
            onChange={(e) => setHelperName(e.target.value)}
            placeholder={t('formHelperPlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-base dark:bg-slate-800"
          />
          <p className="text-xs text-slate-500">
            Optional: Name of daughter, grandson, neighbor, or barangay volunteer who helped you submit this.
          </p>
        </div>

        {/* Incident Date */}
        <div className="space-y-1">
          <label className="block text-base font-bold text-slate-900 dark:text-white">
            {t('formIncidentDate')}
          </label>
          <input
            type="date"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-base dark:bg-slate-900 font-medium"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-black rounded-2xl text-xl shadow-xl flex items-center justify-center gap-3 transition min-h-[56px]"
          >
            {isSubmitting ? (
              <span>Sending Report...</span>
            ) : (
              <>
                <CheckCircle2 className="w-7 h-7" />
                <span>{t('formSendButton')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);
};


