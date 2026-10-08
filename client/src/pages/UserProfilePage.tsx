import React, { useState, useEffect, useRef } from 'react';
import {
  User, ShieldCheck, Phone, MapPin, Users, HeartHandshake,
  KeyRound, Sliders, Sun, Moon, Eye, Volume2, Save,
  AlertTriangle, CheckCircle2, Lock, ArrowLeft, Globe, Camera,
  Trash2, Upload, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { PageHeader } from '../components/PageHeader.js';

export const UserProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const {
    language, setLanguage, textScale, increaseTextSize, decreaseTextSize, resetTextSize,
    highContrast, toggleHighContrast, theme, toggleTheme, speak
  } = useAccessibility();

  const [fullName, setFullName] = useState<string>(user?.fullName || '');
  const [contactNumber, setContactNumber] = useState<string>(user?.contactNumber || '');
  const [houseNumber, setHouseNumber] = useState<string>(user?.houseNumber || '');
  const [street, setStreet] = useState<string>(user?.street || '');
  const [helperName, setHelperName] = useState<string>(user?.helperName || '');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(user?.photoUrl);

  // Profile picture upload state
  const [photoUploading, setPhotoUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const token = localStorage.getItem('bensican_token');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setContactNumber(user.contactNumber || '');
      setHouseNumber(user.houseNumber || '');
      setStreet(user.street || '');
      setHelperName(user.helperName || '');
      setPhotoUrl(user.photoUrl);
    }
  }, [user]);

  // Profile Picture Upload Handler
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please choose a valid JPG, PNG, or WEBP image.' });
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Profile picture must be under 5MB.' });
      return;
    }

    setPhotoUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('files', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Failed to upload photo.');
      }

      const newUrl = uploadData.file?.filePath || uploadData.files?.[0]?.filePath;
      if (!newUrl) {
        throw new Error('No uploaded file path returned.');
      }

      // Save to user profile in backend
      const updateRes = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          contactNumber,
          houseNumber,
          street,
          helperName,
          photoUrl: newUrl
        })
      });

      if (!updateRes.ok) {
        throw new Error('Failed to update profile photo.');
      }

      setPhotoUrl(newUrl);
      updateUser({ photoUrl: newUrl });
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error uploading profile picture.' });
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove Profile Picture Handler
  const handleRemovePhoto = async () => {
    setPhotoUploading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          contactNumber,
          houseNumber,
          street,
          helperName,
          photoUrl: null
        })
      });

      if (res.ok) {
        setPhotoUrl(undefined);
        updateUser({ photoUrl: undefined });
        setMessage({ type: 'success', text: 'Profile picture removed. Neutral avatar restored.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to remove profile picture.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error while removing photo.' });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          contactNumber,
          houseNumber,
          street,
          helperName,
          photoUrl: photoUrl || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile.' });
      } else {
        setMessage({ type: 'success', text: 'Profile details saved successfully!' });
        updateUser({
          fullName,
          contactNumber,
          houseNumber,
          street,
          helperName,
          photoUrl
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error while updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to change password.' });
      } else {
        setMessage({ type: 'success', text: 'Password successfully changed!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error while changing password.' });
    } finally {
      setSaving(false);
    }
  };

  const getRoleDisplay = () => {
    if (user?.role === 'super_admin') return 'Super Administrator';
    if (user?.role === 'admin') return 'Barangay Administrator';
    return 'Barangay Bensican Resident';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      {/* Consistent Header Pattern */}
      <PageHeader
        title="My Profile & Accessibility"
        subtitle="Manage your profile picture, personal details, assistive helper, and reading comfort."
        icon={<User className="w-8 h-8 text-emerald-400" />}
        backTo={user?.role === 'resident' ? '/resident/dashboard' : '/admin/dashboard'}
        badge={
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {getRoleDisplay()}
          </span>
        }
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Toast / Status Message */}
        {message && (
          <div
            className={`p-4 rounded-2xl text-sm flex items-center gap-2 animate-fadeIn ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* 1. PROFILE PICTURE UPLOAD CARD */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl text-emerald-700 dark:text-emerald-400">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Profile Picture</h2>
              <p className="text-sm text-slate-500">
                Upload a clear photo for your official barangay account. Circular avatar format.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750">
            {/* Circular Avatar */}
            <div className="relative group shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName}
                  className="w-28 h-28 rounded-full object-cover border-4 border-emerald-500 shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-3xl flex items-center justify-center border-4 border-slate-300 dark:border-slate-600 shadow-inner">
                  {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-12 h-12 text-slate-400" />}
                </div>
              )}
            </div>

            {/* Upload & Remove Controls */}
            <div className="space-y-3 text-center sm:text-left flex-1">
              <div>
                <strong className="block text-base font-bold text-slate-900 dark:text-white">
                  {fullName || 'Barangay User'}
                </strong>
                <span className="text-xs text-slate-500 block">
                  Supported formats: JPG, PNG, WEBP • Max size: 5 MB
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={photoUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-xs transition disabled:opacity-50 min-h-[44px]"
                >
                  <Upload className="w-4 h-4" />
                  <span>{photoUploading ? 'Uploading...' : photoUrl ? 'Change Picture' : 'Upload Picture'}</span>
                </button>

                {photoUrl && (
                  <button
                    type="button"
                    disabled={photoUploading}
                    onClick={handleRemovePhoto}
                    className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 font-bold rounded-xl text-sm flex items-center gap-1.5 transition disabled:opacity-50 min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. ACCESSIBILITY & DISPLAY PREFERENCES */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-700 dark:text-amber-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Display & Reading Comfort</h2>
              <p className="text-sm text-slate-500">Settings designed for elderly readers and ease of use.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Font scaling control */}
            <div className="bg-slate-50 dark:bg-slate-750 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Text Size Magnification ({Math.round(textScale * 100)}%)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={decreaseTextSize}
                  className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-bold shadow-xs hover:bg-slate-100 min-h-[48px] min-w-[48px]"
                  title="Make text smaller"
                >
                  A−
                </button>
                <button
                  type="button"
                  onClick={resetTextSize}
                  className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold shadow-xs hover:bg-slate-100 min-h-[48px]"
                  title="Reset to default text size"
                >
                  Standard (100%)
                </button>
                <button
                  type="button"
                  onClick={increaseTextSize}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-lg font-black shadow-xs min-h-[48px] min-w-[48px]"
                  title="Make text bigger"
                >
                  A+
                </button>
              </div>
              <p className="text-xs text-slate-500">Scale all words on the screen up to 200% for comfortable reading.</p>
            </div>

            {/* Language Selection */}
            <div className="bg-slate-50 dark:bg-slate-750 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Language / Lenggwahe
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'tl', label: 'Tagalog' },
                  { code: 'il', label: 'Ilokano' }
                ].map(l => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code as any)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition ${
                      language === l.code
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100 min-h-[48px]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">Select language for menus, forms, voice dictation, and Bensi.</p>
            </div>
          </div>
        </div>

        {/* 3. PERSONAL INFORMATION FORM */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-700 dark:text-blue-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Personal & Contact Details</h2>
              <p className="text-sm text-slate-500">Official information on file with Barangay Bensican.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full legal name"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white text-base min-h-[48px]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Registered Email (Cannot be changed)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 text-base min-h-[48px] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-500" /> Contact Number
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. 0917-000-0000"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white text-base min-h-[48px]"
                />
              </div>
            </div>

            {user?.role === 'resident' && (
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" /> House / Unit Number
                  </label>
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="Enter house or unit number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white text-base min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Street Name (in Barangay Bensican)
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Enter street name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white text-base min-h-[48px]"
                  />
                </div>
              </div>
            )}

            {/* Bring a Helper Section */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-2">
              <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 uppercase flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                "Bring a Helper" Mode (Designated Assistant Name)
              </label>
              <input
                type="text"
                value={helperName}
                onChange={(e) => setHelperName(e.target.value)}
                placeholder="Enter designated family member or helper name (optional)"
                className="w-full px-4 py-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base min-h-[48px]"
              />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                If someone in your family or a barangay worker assists you in preparing and filing reports, specify their name here.
              </p>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-base flex items-center gap-2 shadow-md hover:shadow-lg transition-all min-h-[48px] disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 4. SECURITY & PASSWORD CHANGE */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-600 dark:text-red-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Account Password</h2>
                <p className="text-sm text-slate-500">Update your security password.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswordSection(prev => !prev)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 transition min-h-[40px]"
            >
              {showPasswordSection ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPasswordSection && (
            <form onSubmit={handleChangePassword} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white text-base min-h-[48px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    New Password (Min. 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white text-base min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white text-base min-h-[48px]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition min-h-[48px] disabled:opacity-50"
                >
                  {saving ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
