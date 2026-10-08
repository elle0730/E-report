import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, KeyRound, ShieldAlert, ShieldCheck,
  Search, Filter, Lock, AlertTriangle, CheckCircle2,
  Edit2, UserX, RotateCcw, ArrowLeft, Volume2, Clock, Mail, Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

export const SuperAdminAccountsPage: React.FC = () => {
  const { user } = useAuth();
  const { speak } = useAccessibility();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showResetPassModal, setShowResetPassModal] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [superAdminPassword, setSuperAdminPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    contactNumber: '',
    role: 'admin',
    position: 'Barangay Kagawad',
    password: '',
    newPassword: '',
    statusAction: 'suspended',
    statusReason: ''
  });

  const token = localStorage.getItem('bensican_token');

  const loadUsers = () => {
    setLoading(true);
    let url = '/api/users?';
    if (roleFilter) url += `role=${roleFilter}&`;
    if (statusFilter) url += `status=${statusFilter}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superAdminPassword) {
      setErrorMsg('Super Admin password re-verification is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/users/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          contactNumber: formData.contactNumber,
          role: formData.role,
          position: formData.position,
          password: formData.password,
          superAdminPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create staff account.');
      } else {
        setSuccessMsg(data.message);
        setTimeout(() => {
          setShowCreateModal(false);
          resetForm();
          loadUsers();
        }, 1200);
      }
    } catch {
      setErrorMsg('Network error while creating staff.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superAdminPassword) {
      setErrorMsg('Super Admin password re-verification is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/users/staff/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          contactNumber: formData.contactNumber,
          role: formData.role,
          position: formData.position,
          superAdminPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to update user.');
      } else {
        setSuccessMsg(data.message);
        setTimeout(() => {
          setShowEditModal(false);
          resetForm();
          loadUsers();
        }, 1200);
      }
    } catch {
      setErrorMsg('Network error while updating user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superAdminPassword) {
      setErrorMsg('Super Admin password is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/users/staff/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          newPassword: formData.newPassword,
          superAdminPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to reset password.');
      } else {
        setSuccessMsg('Password successfully reset.');
        setTimeout(() => {
          setShowResetPassModal(false);
          resetForm();
          loadUsers();
        }, 1200);
      }
    } catch {
      setErrorMsg('Network error while resetting password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/users/status/${selectedUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: formData.statusAction,
          reason: formData.statusReason,
          superAdminPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to update user status.');
      } else {
        setSuccessMsg(data.message);
        setTimeout(() => {
          setShowStatusModal(false);
          resetForm();
          loadUsers();
        }, 1200);
      }
    } catch {
      setErrorMsg('Network error while modifying user status.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      contactNumber: '',
      role: 'admin',
      position: 'Barangay Kagawad',
      password: '',
      newPassword: '',
      statusAction: 'suspended',
      statusReason: ''
    });
    setSuperAdminPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedUser(null);
  };

  // Stats
  const staffCount = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
  const residentCount = users.filter(u => u.role === 'resident').length;
  const pendingCount = users.filter(u => u.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-800 text-white border-b border-slate-700 py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              to="/admin/dashboard"
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-1 focus:ring-2 focus:ring-purple-400"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-semibold pr-1">Back</span>
            </Link>
            <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-400/30">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Staff & Account Management</h1>
                <button
                  type="button"
                  onClick={() => speak('Staff and Account Management. Super Admins can create admins, update roles, reset passwords, and manage resident accounts.')}
                  className="p-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-purple-300 transition-colors"
                  title="Listen to overview"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-300 text-sm md:text-base mt-1">
                Full authority over staff roles, permissions, passwords, and resident accounts.
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all focus:ring-2 focus:ring-purple-400"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create Staff Account</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase">Barangay Staff</span>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{staffCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase">Residents Registered</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{residentCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase">Awaiting Verification</span>
            <p className="text-2xl font-black text-amber-500 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase">Security Policy</span>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              &ge;1 Super Admin Active
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or street..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="resident">Resident</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Accounts Grid */}
        {loading ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Clock className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-semibold">Loading accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Users Found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {users.map(u => (
              <div
                key={u.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      u.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      u.status === 'active' ? 'bg-green-100 text-green-800' :
                      u.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      u.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {u.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {u.full_name}
                  </h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-3">
                    {u.position || (u.role === 'resident' ? 'Bensican Resident' : 'Barangay Official')}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-750 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    {u.contact_number && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{u.contact_number}</span>
                      </div>
                    )}
                    {u.role === 'resident' && u.street && (
                      <p className="text-slate-500 pt-1 border-t border-slate-200/50">
                        {u.house_number ? `#${u.house_number} ` : ''}{u.street}, Bensican
                      </p>
                    )}
                  </div>
                </div>

                {/* Super Admin Control Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-2 justify-end">
                  {/* Reset Password */}
                  <button
                    onClick={() => {
                      resetForm();
                      setSelectedUser(u);
                      setShowResetPassModal(true);
                    }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1"
                    title="Reset Password"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset Pass</span>
                  </button>

                  {/* Edit Staff */}
                  {u.role !== 'resident' && (
                    <button
                      onClick={() => {
                        resetForm();
                        setSelectedUser(u);
                        setFormData({
                          ...formData,
                          fullName: u.full_name,
                          contactNumber: u.contact_number || '',
                          role: u.role,
                          position: u.position || ''
                        });
                        setShowEditModal(true);
                      }}
                      className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors flex items-center gap-1"
                      title="Edit Staff Info"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  {/* Suspend or Archive */}
                  <button
                    onClick={() => {
                      resetForm();
                      setSelectedUser(u);
                      setFormData({
                        ...formData,
                        statusAction: u.status === 'suspended' ? 'active' : 'suspended'
                      });
                      setShowStatusModal(true);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                      u.status === 'suspended'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                    title={u.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                  >
                    {u.status === 'suspended' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                    <span>{u.status === 'suspended' ? 'Activate' : 'Suspend'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black">Provision New Staff Account</h2>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Juan De La Cruz"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. j.delacruz@bensican.gov.ph"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm font-bold"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Position *</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Barangay Kagawad"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Contact Number</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="0917-000-0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-purple-700 dark:text-purple-300 uppercase mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Confirm Super Admin Password *
                </label>
                <input
                  type="password"
                  required
                  value={superAdminPassword}
                  onChange={(e) => setSuperAdminPassword(e.target.value)}
                  placeholder="Enter your Super Admin password"
                  className="w-full px-4 py-2.5 rounded-xl border border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-950/20 text-sm"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-black mb-4 text-purple-600">Edit Staff: {selectedUser.full_name}</h2>

            <form onSubmit={handleEditStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm font-bold"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Number</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm"
                />
              </div>

              <div className="pt-2 border-t">
                <label className="block text-xs font-bold text-purple-700 uppercase mb-1">Super Admin Password *</label>
                <input
                  type="password"
                  required
                  value={superAdminPassword}
                  onChange={(e) => setSuperAdminPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm"
                />
              </div>

              {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
              {successMsg && <p className="text-xs text-emerald-600">{successMsg}</p>}

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-black mb-2 text-purple-600 flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Reset Password
            </h2>
            <p className="text-xs text-slate-500 mb-4">Resetting login password for <strong>{selectedUser.full_name}</strong> ({selectedUser.email}).</p>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Enter new strong password"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-700 uppercase mb-1">Super Admin Password *</label>
                <input
                  type="password"
                  required
                  value={superAdminPassword}
                  onChange={(e) => setSuperAdminPassword(e.target.value)}
                  placeholder="Re-enter your password to authorize"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm"
                />
              </div>

              {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
              {successMsg && <p className="text-xs text-emerald-600">{successMsg}</p>}

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowResetPassModal(false)}
                  className="px-4 py-2 rounded-xl border text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend or Status Change Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-black mb-2 text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Change Account Status
            </h2>
            <p className="text-xs text-slate-500 mb-4">Managing status for <strong>{selectedUser.full_name}</strong>.</p>

            <form onSubmit={handleStatusChange} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Status</label>
                <select
                  value={formData.statusAction}
                  onChange={(e) => setFormData({ ...formData, statusAction: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm font-bold"
                >
                  <option value="active">Active (Permit Access)</option>
                  <option value="suspended">Suspended (Block Login)</option>
                  <option value="archived">Archived (Soft Delete)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason for Status Change</label>
                <textarea
                  rows={2}
                  value={formData.statusReason}
                  onChange={(e) => setFormData({ ...formData, statusReason: e.target.value })}
                  placeholder="Provide an explanation for the audit log..."
                  className="w-full px-4 py-2 rounded-xl border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-700 uppercase mb-1">Super Admin Password *</label>
                <input
                  type="password"
                  required
                  value={superAdminPassword}
                  onChange={(e) => setSuperAdminPassword(e.target.value)}
                  placeholder="Re-enter your password to authorize"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm"
                />
              </div>

              {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
              {successMsg && <p className="text-xs text-emerald-600">{successMsg}</p>}

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl border text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

