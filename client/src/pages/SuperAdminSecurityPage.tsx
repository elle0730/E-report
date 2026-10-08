import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Key, Laptop, Globe,
  AlertTriangle, Search, Filter, Download, Trash2,
  Lock, ArrowLeft, Volume2, Clock, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

export const SuperAdminSecurityPage: React.FC = () => {
  const { user } = useAuth();
  const { speak } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'audit' | 'sessions' | 'alerts'>('audit');
  const [logs, setLogs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [actionFilter, setActionFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const [actionMessage, setActionMessage] = useState<string>('');

  const token = localStorage.getItem('bensican_token');

  const loadData = () => {
    setLoading(true);
    let auditUrl = '/api/audit?';
    if (actionFilter) auditUrl += `action=${actionFilter}&`;
    if (search) auditUrl += `search=${encodeURIComponent(search)}&`;

    Promise.all([
      fetch(auditUrl, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/audit/security-dashboard', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([auditData, secData]) => {
        if (auditData.logs) setLogs(auditData.logs);
        if (secData.activeSessions) setSessions(secData.activeSessions);
        if (secData.suspiciousAttempts) setAlerts(secData.suspiciousAttempts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to forcibly terminate this user session?')) return;

    try {
      const res = await fetch('/api/audit/terminate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage('Session successfully terminated.');
        setTimeout(() => setActionMessage(''), 3000);
        loadData();
      } else {
        alert(data.error || 'Failed to terminate session.');
      }
    } catch {
      alert('Network error while terminating session.');
    }
  };

  const handleExportAuditCSV = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'User Name', 'Role', 'Action', 'Entity', 'Entity ID', 'Details', 'IP Address'];
    const rows = logs.map(l => [
      `"${l.id}"`,
      `"${l.created_at}"`,
      `"${l.user_name || ''}"`,
      `"${l.user_role || ''}"`,
      `"${l.action}"`,
      `"${l.entity || ''}"`,
      `"${l.entity_id || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ip_address || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bensican_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('FAIL') || action.includes('REJECT') || action.includes('ARCHIVE') || action.includes('TERMINATE')) {
      return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300';
    }
    if (action.includes('LOGIN') || action.includes('APPROVE') || action.includes('RESTORE') || action.includes('PUBLISH')) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-800 text-white border-b border-slate-700 py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              to="/admin/dashboard"
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-1 focus:ring-2 focus:ring-rose-400"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-semibold pr-1">Back</span>
            </Link>
            <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-400/30">
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Security & Audit Center</h1>
                <button
                  type="button"
                  onClick={() => speak('Security and Audit Center. View immutable system audit logs, monitor active sessions, and review suspicious login alerts.')}
                  className="p-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-rose-300 transition-colors"
                  title="Listen to overview"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-300 text-sm md:text-base mt-1">
                Append-only immutable audit trail and real-time session controls under RA 10173 standards.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportAuditCSV}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Trail (CSV)</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Sessions</span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{sessions.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase">Suspicious Alerts</span>
            <p className="text-2xl font-black text-rose-500 mt-1">{alerts.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Audit Logs</span>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{logs.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase">Audit Integrity</span>
            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-2">
              <ShieldCheck className="w-4 h-4" /> 100% Immutable
            </p>
          </div>
        </div>

        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-5 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-rose-600 text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Immutable Audit Trail ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-5 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'sessions'
                ? 'border-rose-600 text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Active User Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 px-5 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'alerts'
                ? 'border-rose-600 text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Suspicious Alerts ({alerts.length})
          </button>
        </div>

        {/* 1. AUDIT TRAIL TAB */}
        {activeTab === 'audit' && (
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search user, action, or details..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm"
                >
                  Filter
                </button>
              </form>

              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Action:</span>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 border-none"
                >
                  <option value="">All Actions</option>
                  <option value="LOGIN_SUCCESS">Login Success</option>
                  <option value="LOGIN_FAILED">Login Failed</option>
                  <option value="CREATE_REPORT">Create Report</option>
                  <option value="APPROVE_RESIDENT">Approve Resident</option>
                  <option value="REJECT_RESIDENT">Reject Resident</option>
                  <option value="SCHEDULE_HEARING">Schedule Hearing</option>
                  <option value="ISSUE_SUBPOENA">Issue Subpoena</option>
                  <option value="PUBLISH_CMS">Publish CMS</option>
                  <option value="RESTORE_ARCHIVED_ITEM">Restore Item</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16 bg-white rounded-2xl border">
                <Clock className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-2" />
                <p className="text-slate-600 text-sm">Loading audit logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border">
                <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 text-sm">No audit logs matching criteria.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map(log => (
                  <div
                    key={log.id}
                    className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="text-slate-400">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {log.details}
                      </p>

                      <p className="text-slate-500">
                        <strong>User:</strong> {log.user_name || 'Anonymous'} ({log.user_role || 'Visitor'}) &bull; <strong>Entity:</strong> {log.entity || 'General'} {log.entity_id ? `[${log.entity_id}]` : ''}
                      </p>
                    </div>

                    <div className="text-right text-slate-400 shrink-0">
                      <p>IP: {log.ip_address || '127.0.0.1'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. ACTIVE SESSIONS TAB */}
        {activeTab === 'sessions' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Currently Logged-in Staff & Resident Sessions</h2>
            <p className="text-xs text-slate-500 -mt-2">Super Admins can remotely invalidate active sessions to prevent unauthorized access.</p>

            <div className="space-y-3 pt-2">
              {sessions.map(s => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{s.full_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-semibold">{s.role}</span>
                    </div>
                    <p className="text-xs text-slate-500">{s.email}</p>
                    <p className="text-xs text-slate-400">IP: {s.ip_address || '127.0.0.1'} &bull; Started: {new Date(s.created_at).toLocaleString()}</p>
                  </div>

                  <div>
                    <button
                      onClick={() => handleTerminateSession(s.id)}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Terminate Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SUSPICIOUS ALERTS TAB */}
        {activeTab === 'alerts' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security Alerts & Failed Authentication Triggers</h2>

            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No suspicious intrusion attempts detected.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(a => (
                  <div key={a.id} className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-800 uppercase">{a.action}</span>
                      <span className="text-red-500">{new Date(a.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-red-900 font-semibold">{a.details}</p>
                    <p className="text-red-700">Origin IP: {a.ip_address || 'Unknown'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

