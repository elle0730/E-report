import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { HelpModal } from './components/HelpModal.js';
import { FirstTimeTutorial } from './components/FirstTimeTutorial.js';
import { BensiFloatingChatbot } from './components/BensiFloatingChatbot.js';
import { useAuth } from './context/AuthContext.js';
import { useAccessibility } from './context/AccessibilityContext.js';

// Public & Resident Pages
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterWizardPage } from './pages/RegisterWizardPage.js';
import { ResidentDashboard } from './pages/ResidentDashboard.js';
import { SendReportPage } from './pages/SendReportPage.js';
import { ReportTrackingPage } from './pages/ReportTrackingPage.js';
import { BensiChatPage } from './pages/BensiChatPage.js';
import { AnnouncementsPage } from './pages/AnnouncementsPage.js';
import { HearingsPage } from './pages/HearingsPage.js';
import { BillsTransparencyPage } from './pages/BillsTransparencyPage.js';

// Admin & Super Admin Pages
import { AdminDashboard } from './pages/AdminDashboard.js';
import { AdminReportsPage } from './pages/AdminReportsPage.js';
import { AdminResidentVerificationPage } from './pages/AdminResidentVerificationPage.js';
import { AdminHearingSchedulerPage } from './pages/AdminHearingSchedulerPage.js';
import { AdminSubpoenaPage } from './pages/AdminSubpoenaPage.js';
import { AdminBillsPage } from './pages/AdminBillsPage.js';
import { AdminAnnouncementsPage } from './pages/AdminAnnouncementsPage.js';
import { AdminFilesPage } from './pages/AdminFilesPage.js';
import { AccountabilityReportPage } from './pages/AccountabilityReportPage.js';
import { StaffPayrollPage } from './pages/StaffPayrollPage.js';
import { AdminArchivePage } from './pages/AdminArchivePage.js';

// Super Admin Pages
import { SuperAdminAccountsPage } from './pages/SuperAdminAccountsPage.js';
import { SuperAdminCmsPage } from './pages/SuperAdminCmsPage.js';
import { SuperAdminSettingsPage } from './pages/SuperAdminSettingsPage.js';
import { SuperAdminSecurityPage } from './pages/SuperAdminSecurityPage.js';

// Shared Authenticated Pages
import { UserProfilePage } from './pages/UserProfilePage.js';
import { NotificationsPage } from './pages/NotificationsPage.js';

// Guard for requiring authentication
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Route guard for public-only pages (Landing page, login, register).
// Authenticated users CANNOT access these pages and are redirected to their dashboard.
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (user) {
    if (user.role === 'admin' || user.role === 'super_admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/resident/dashboard" replace />;
  }
  return <>{children}</>;
};

// Guard for requiring specific role
const RequireRole: React.FC<{ roles: string[]; children: React.ReactNode }> = ({ roles, children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!roles.includes(user.role)) {
    if (user.role === 'resident') {
      return <Navigate to="/resident/dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
};

// Scroll to top and enforce back-button protection
const RouteHistoryManager: React.FC = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // If user is authenticated and somehow arrives at '/', immediately bounce to dashboard
  useEffect(() => {
    if (user && pathname === '/') {
      const destination = (user.role === 'admin' || user.role === 'super_admin')
        ? '/admin/dashboard'
        : '/resident/dashboard';
      navigate(destination, { replace: true });
    }
  }, [user, pathname, navigate]);

  return null;
};

export const App: React.FC = () => {
  const { tutorialOpen, closeTutorial } = useAccessibility();
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [privacyToast, setPrivacyToast] = useState<string | null>(null);

  // RA 10173 Right-Click & Confidentiality Protection Toast
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.closest('table') || target.closest('form') || target.closest('[data-confidential]'))) {
        setPrivacyToast('Data Privacy Notice: Citizen reports, identity, and hearings in Barangay Bensican are protected under RA 10173.');
        setTimeout(() => setPrivacyToast(null), 4000);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <BrowserRouter>
      <RouteHistoryManager />
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Universal Top Navigation */}
        <Navbar onOpenHelp={() => setHelpOpen(true)} />

        {/* Floating RA 10173 Data Privacy Toast */}
        {privacyToast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 text-xs md:text-sm font-semibold max-w-lg text-center backdrop-blur-md animate-fadeIn">
            🛡️ {privacyToast}
          </div>
        )}

        {/* Main Content Router */}
        <main className="flex-1">
          <Routes>
            {/* PUBLIC ONLY ROUTES (Authenticated users redirected to their dashboard) */}
            <Route
              path="/"
              element={
                <PublicOnlyRoute>
                  <LandingPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterWizardPage />
                </PublicOnlyRoute>
              }
            />

            {/* PUBLIC ACCESSIBLE INFORMATION ROUTES */}
            <Route path="/track" element={<ReportTrackingPage />} />
            <Route path="/track/:refNumber" element={<ReportTrackingPage />} />
            <Route path="/bills" element={<BillsTransparencyPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />

            {/* QUICK ROLE ALIASES */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/superadmin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/resident" element={<Navigate to="/resident/dashboard" replace />} />

            {/* RESIDENT ROUTES */}
            <Route
              path="/resident/dashboard"
              element={
                <RequireAuth>
                  <ResidentDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/resident/report"
              element={
                <RequireAuth>
                  <SendReportPage />
                </RequireAuth>
              }
            />
            {/* Explicit alias to eliminate route mismatch */}
            <Route
              path="/resident/send-report"
              element={
                <RequireAuth>
                  <SendReportPage />
                </RequireAuth>
              }
            />
            <Route
              path="/resident/track"
              element={
                <RequireAuth>
                  <ReportTrackingPage />
                </RequireAuth>
              }
            />
            <Route
              path="/resident/bensi"
              element={
                <RequireAuth>
                  <BensiChatPage />
                </RequireAuth>
              }
            />
            {/* Chat route alias */}
            <Route
              path="/resident/chat"
              element={
                <RequireAuth>
                  <BensiChatPage />
                </RequireAuth>
              }
            />
            <Route
              path="/resident/hearings"
              element={
                <RequireAuth>
                  <HearingsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/resident/bills"
              element={
                <RequireAuth>
                  <BillsTransparencyPage />
                </RequireAuth>
              }
            />
            <Route
              path="/resident/announcements"
              element={
                <RequireAuth>
                  <AnnouncementsPage />
                </RequireAuth>
              }
            />

            {/* ADMIN & SUPER ADMIN ROUTES */}
            <Route
              path="/admin/dashboard"
              element={
                <RequireRole roles={['admin', 'super_admin']}>
                  <AdminDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <RequireRole roles={['admin', 'super_admin']}>
                  <AdminReportsPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/residents"
              element={
                <RequireRole roles={['admin', 'super_admin']}>
                  <AdminResidentVerificationPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/hearings"
              element={
                <RequireRole roles={['admin', 'super_admin']}>
                  <AdminHearingSchedulerPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/subpoenas"
              element={
                <RequireRole roles={['admin', 'super_admin']}>
                  <AdminSubpoenaPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/bills"
              element={
                <RequireRole roles={['admin', 'super_admin']}>
                  <AdminBillsPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <RequireRole roles={['admin', 'super_admin']}>
                  <AdminAnnouncementsPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/files"
              element={
                <RequireRole roles={['admin', 'super_admin']}>
                  <AdminFilesPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/accountability"
              element={
                <RequireRole roles={['admin', 'super_admin']}>
                  <AccountabilityReportPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/payroll"
              element={
                <RequireRole roles={['admin', 'super_admin']}>
                  <StaffPayrollPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/archive"
              element={
                <RequireRole roles={['admin', 'super_admin']}>
                  <AdminArchivePage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/cms"
              element={
                <RequireRole roles={['admin', 'super_admin']}>
                  <SuperAdminCmsPage />
                </RequireRole>
              }
            />

            {/* SUPER ADMIN ONLY ROUTES */}
            <Route
              path="/admin/accounts"
              element={
                <RequireRole roles={['super_admin']}>
                  <SuperAdminAccountsPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <RequireRole roles={['super_admin']}>
                  <SuperAdminSettingsPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/security"
              element={
                <RequireRole roles={['super_admin']}>
                  <SuperAdminSecurityPage />
                </RequireRole>
              }
            />

            {/* SHARED AUTHENTICATED ROUTES */}
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <UserProfilePage />
                </RequireAuth>
              }
            />
            <Route
              path="/notifications"
              element={
                <RequireAuth>
                  <NotificationsPage />
                </RequireAuth>
              }
            />

            {/* 404 CATCH-ALL */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* FIXED FLOATING CHATBOT AT BOTTOM-RIGHT */}
        <BensiFloatingChatbot />

        {/* Universal Footer */}
        <Footer />

        {/* Accessible Visual & Audio Help Guide Modal */}
        <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

        {/* First-time Tutorial Modal */}
        <FirstTimeTutorial isOpen={tutorialOpen} onClose={closeTutorial} />
      </div>
    </BrowserRouter>
  );
};

export default App;
