import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { Shield, Sparkles, User, Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('sign-in'); // 'sign-in' | 'sign-up'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin/dashboard' : '/account');
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoogle = async () => {
    setError('');
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (oauthErr) setError(oauthErr.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    if (mode === 'sign-up') {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name || 'Customer' } },
      });
      if (signUpErr) {
        setError(signUpErr.message);
      } else if (signUpData?.session) {
        // Email confirmation is disabled on this project, so signUp() already
        // returns an active session — the user is logged in now. AuthContext's
        // onAuthStateChange picks it up and the redirect effect above navigates
        // once isAuthenticated flips true; nothing else to do here.
      } else {
        // Only reachable if email confirmation is ever re-enabled.
        setMessage('Account created. Check your email to confirm, then sign in below.');
        setMode('sign-in');
      }
    } else {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) setError(signInErr.message);
      // On success, AuthContext's onAuthStateChange listener picks up the session automatically.
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div className="login-card glass" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <Sparkles size={24} color="var(--primary)" />
          </div>
          <h2 style={styles.title}>{mode === 'sign-up' ? 'Create your account' : 'Welcome back'}</h2>
          <p style={styles.subtitle}>Log in to access your digital workspace or account portal.</p>
        </div>

        {error && (
          <div style={styles.errorContainer}>
            <Shield size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div style={styles.messageContainer}>
            <span>{message}</span>
          </div>
        )}

        <button onClick={handleGoogle} style={styles.googleBtn}>
          Continue with Google
        </button>

        <div style={styles.divider}><span>or</span></div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'sign-up' && (
            <div style={styles.fieldGroup}>
              <label className="login-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} className="login-input-icon" />
                <input
                  type="text"
                  className="login-input"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div style={styles.fieldGroup}>
            <label className="login-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} className="login-input-icon" />
              <input
                type="email"
                className="login-input"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label className="login-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} className="login-input-icon" />
              <input
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            <LogIn size={16} style={{ marginRight: '8px' }} />
            {loading ? 'Please wait...' : mode === 'sign-up' ? 'Sign Up' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up');
              setError('');
              setMessage('');
            }}
            style={styles.backBtn}
          >
            {mode === 'sign-up' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            By continuing, you agree to our Terms of Service &amp; Privacy Policy.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-card {
          animation: loginFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .login-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          color: var(--text);
          outline: none;
          font-size: 14px;
          transition: all 0.22s var(--ease);
        }
        .login-input:focus {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }
        .login-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-sub);
          pointer-events: none;
        }
        .login-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 6px;
          display: block;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    width: '100%',
    padding: '40px 24px',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '48px 36px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-subtle)',
    border: '1px solid var(--border-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '12px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--rose)',
    fontSize: '13px',
    marginBottom: '24px',
    lineHeight: '1.4',
  },
  messageContainer: {
    padding: '12px 14px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--emerald)',
    fontSize: '13px',
    marginBottom: '24px',
    lineHeight: '1.4',
  },
  googleBtn: {
    width: '100%',
    padding: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border-glass)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '20px 0',
    color: 'var(--text-sub)',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  submitBtn: {
    padding: '14px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '700',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.22s var(--ease)',
    boxShadow: '0 4px 12px var(--primary-glow)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'color 0.2s ease',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
    borderTop: '1px solid var(--border-glass)',
    paddingTop: '20px',
  },
  footerText: {
    fontSize: '11px',
    color: 'var(--text-sub)',
    lineHeight: '1.5',
  },
};
