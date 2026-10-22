import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.js';
import { AuthProvider } from './context/AuthContext.js';
import { AccessibilityProvider } from './context/AccessibilityContext.js';
import './index.css';

interface RootErrorBoundaryProps {
  children: React.ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class RootErrorBoundary extends React.Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  constructor(props: RootErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CRITICAL: Root error caught by RootErrorBoundary:', error, errorInfo);
  }

  handleRecover = () => {
    try {
      localStorage.removeItem('bensican_token');
      localStorage.removeItem('bensican_user');
      localStorage.removeItem('bensican_refresh_token');
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#ffffff', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
          <div style={{ maxWidth: '440px', width: '100%', backgroundColor: '#1e293b', border: '2px solid #334155', borderRadius: '24px', padding: '32px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: '#dc2626', color: '#fff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '24px' }}>
              ⚠️
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Barangay Bensican Portal</h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Your session was refreshed. Click below to continue to the Barangay Bensican portal.
            </p>
            <button
              onClick={this.handleRecover}
              style={{ width: '100%', padding: '14px 20px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Go to Homepage
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AccessibilityProvider>
            <App />
          </AccessibilityProvider>
        </AuthProvider>
      </BrowserRouter>
    </RootErrorBoundary>
  </React.StrictMode>
);

