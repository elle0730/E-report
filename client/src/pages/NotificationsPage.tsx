import React, { useState, useEffect } from 'react';
import {
  Bell, CheckCheck, Clock, ArrowLeft, Volume2,
  CheckCircle2, AlertCircle, Calendar, FileText, ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { speak } = useAccessibility();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const token = localStorage.getItem('bensican_token');

  const loadNotifications = () => {
    setLoading(true);
    fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.notifications) setNotifications(data.notifications);
        if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string, linkUrl?: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadNotifications();
      if (linkUrl) {
        navigate(linkUrl);
      }
    } catch {
      if (linkUrl) navigate(linkUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadNotifications();
    } catch {}
  };

  const filteredNotifs = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const getNotifIcon = (title: string) => {
    if (title.toLowerCase().includes('hearing')) return <Calendar className="w-5 h-5 text-purple-500" />;
    if (title.toLowerCase().includes('report') || title.toLowerCase().includes('status')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (title.toLowerCase().includes('approved') || title.toLowerCase().includes('verified')) return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    return <AlertCircle className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-800 text-white border-b border-slate-700 py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              to={user?.role === 'resident' ? '/resident/dashboard' : '/admin/dashboard'}
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-1 focus:ring-2 focus:ring-emerald-400"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-semibold pr-1">Back</span>
            </Link>
            <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-400/30">
              <Bell className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Notifications & Alerts</h1>
                <button
                  type="button"
                  onClick={() => speak('Notifications and Alerts. Stay updated on your concerns, hearings, and barangay messages.')}
                  className="p-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-blue-300 transition-colors"
                  title="Listen to overview"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-300 text-sm md:text-base mt-1">
                Updates regarding your submitted concerns, hearing dates, and approvals.
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors min-h-[48px]"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All As Read</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Filter bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[48px] ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[48px] ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <Clock className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-semibold">Loading your updates...</p>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">You are all caught up!</h3>
            <p className="text-slate-500 text-sm mt-1">No new notifications at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifs.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id, notif.link)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  notif.is_read
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    : 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200/80 dark:border-slate-600 shadow-xs shrink-0 mt-0.5">
                    {getNotifIcon(notif.title)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-xs text-slate-400 block pt-0.5">
                      {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {notif.link && (
                  <div className="shrink-0 flex items-center justify-end">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 group-hover:text-blue-600">
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

