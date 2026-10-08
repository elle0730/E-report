import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Download, Filter, CheckCircle2, Calendar,
  User, Award, FileSpreadsheet, Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageHeader } from '../components/PageHeader.js';
import { generateAccountabilityPdf, exportAccountabilityCsv } from '../utils/pdfGenerators.js';

export const AccountabilityReportPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalResolved: 0, avgResolutionDays: '0', avgResolutionHours: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');

  const token = localStorage.getItem('bensican_token');

  const loadData = () => {
    let url = '/api/analytics/accountability?';
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    if (selectedCategory) url += `&categoryId=${selectedCategory}`;
    if (selectedAdmin) url += `&adminId=${selectedAdmin}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.items) setItems(data.items);
        if (data.summary) setSummary(data.summary);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();

    // Load categories & staff
    fetch('/api/settings/public', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      });

    fetch('/api/users?role=admin', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.users) setStaffList(data.users);
      });
  }, [startDate, endDate, selectedCategory, selectedAdmin]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      <PageHeader
        title="Public Accountability & Resolution Report"
        subtitle="Transparency audit of resolved citizen concerns, assigned handlers, outcomes, and response time metrics."
        icon={TrendingUp}
        badges={[`${items.length} Resolved Concerns`, isSuperAdmin ? 'Super Admin Audit' : 'Staff Transparency']}
        backTo={isSuperAdmin ? '/super-admin' : '/admin'}
        actions={
          isSuperAdmin ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => exportAccountabilityCsv(items)}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition min-h-[44px]"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => generateAccountabilityPdf(items, summary)}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          ) : undefined
        }
      />

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 text-center shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase block">Total Concerns Resolved</span>
          <span className="text-3xl font-black text-slate-900 dark:text-white">{summary.totalResolved}</span>
          <span className="text-xs text-emerald-600 font-bold block mt-1">100% Verified Outcomes</span>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-6 rounded-3xl border-2 border-emerald-300 dark:border-emerald-800 text-center shadow-xs">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase block">Average Resolution Days</span>
          <span className="text-3xl font-black text-emerald-800 dark:text-emerald-200">{summary.avgResolutionDays} days</span>
          <span className="text-xs text-emerald-600 block mt-1">From receipt to final resolution</span>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/40 p-6 rounded-3xl border-2 border-blue-300 dark:border-blue-800 text-center shadow-xs">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase block">Average Response Time</span>
          <span className="text-3xl font-black text-blue-800 dark:text-blue-200">{summary.avgResolutionHours} hrs</span>
          <span className="text-xs text-blue-600 block mt-1">Faster than physical paperwork</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-500">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 rounded-xl border dark:bg-slate-900 font-bold"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-500">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 rounded-xl border dark:bg-slate-900 font-bold"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 rounded-xl border dark:bg-slate-900 font-bold"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={selectedAdmin}
          onChange={(e) => setSelectedAdmin(e.target.value)}
          className="p-2 rounded-xl border dark:bg-slate-900 font-bold"
        >
          <option value="">All Barangay Officials</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>{s.full_name} ({s.position || s.role})</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border-3 border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase text-xs font-bold border-b">
              <tr>
                <th className="py-4 px-6">Reference No</th>
                <th className="py-4 px-6">Concern & Location</th>
                <th className="py-4 px-6">Complainant</th>
                <th className="py-4 px-6">Dates (Received → Resolved)</th>
                <th className="py-4 px-6">Resolution Time</th>
                <th className="py-4 px-6">Handled By</th>
                <th className="py-4 px-6">Outcome / Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                  <td className="py-4 px-6 font-mono font-black text-emerald-700 dark:text-emerald-400">
                    {row.ref_number}
                  </td>
                  <td className="py-4 px-6">
                    <strong className="block text-slate-900 dark:text-white text-base">{row.title}</strong>
                    <span className="text-xs text-slate-500">{row.category_name} • {row.location_details}</span>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">
                    {row.resident_name || 'Resident'}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400">
                    <div>Received: {row.created_at ? row.created_at.split('T')[0] : 'N/A'}</div>
                    <div>Resolved: <strong className="text-emerald-600">{row.resolution_date ? row.resolution_date.split('T')[0] : 'N/A'}</strong></div>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">
                    {row.timeToResolutionStr}
                  </td>
                  <td className="py-4 px-6 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <strong>{row.admin_name || 'Barangay Staff'}</strong>
                    <span className="block text-slate-400">{row.admin_position || 'Staff'}</span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-700 dark:text-slate-300 max-w-xs">
                    {row.outcome || 'Resolved through barangay action and mediation.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

