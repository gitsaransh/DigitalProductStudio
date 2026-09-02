import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function AdminAuthGate({ children }) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{`
          .spinner {
            border: 3px solid rgba(255, 255, 255, 0.05);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: var(--primary);
            animation: spin 0.8s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Verifying administrative access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirecting via useEffect
  }

  if (!isAdmin) {
    return (
      <div style={styles.container}>
        <style>{`
          @keyframes gateFade {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .gate-card {
            animation: gateFade 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}</style>
        <div className="gate-card glass" style={styles.card}>
          <div style={styles.header}>
            <div style={styles.iconCircle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 style={styles.title}>Access Denied</h2>
            <p style={styles.subtitle}>
              The Operator Admin Portal is restricted to system administrators.
              {user?.email
                ? <> Your active account <strong>{user.email}</strong> is registered as a customer and does not have permission.</>
                : ' We could not verify your account permissions — please try signing in again.'}
            </p>
          </div>
          
          <div style={styles.actions}>
            <button onClick={() => navigate('/account')} style={styles.primaryBtn}>
              Go to My Account
            </button>
            <button onClick={() => navigate('/')} style={styles.secondaryBtn}>
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '24px',
    backgroundColor: 'var(--bg-deep)',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '44px 36px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    textAlign: 'center',
  },
  header: {
    marginBottom: '32px',
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto',
    border: '1px solid rgba(239, 68, 68, 0.25)',
  },
  title: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '12px',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryBtn: {
    padding: '13px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.22s var(--ease)',
    boxShadow: '0 4px 12px var(--primary-glow)',
  },
  secondaryBtn: {
    padding: '13px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-glass)',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.22s var(--ease)',
  }
};
