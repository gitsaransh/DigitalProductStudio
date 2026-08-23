import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { HelpCircle, Shield, Sparkles, User, Mail, LogIn } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Login() {
  const { login, user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [showMockForm, setShowMockForm] = useState(false);
  const [mockEmail, setMockEmail] = useState('');
  const [mockName, setMockName] = useState('');
  const [mockAvatar, setMockAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gsiLoaded, setGsiLoaded] = useState(false);

  // Handle incoming token from custom URL parameters if redirected
  useEffect(() => {
    const token = searchParams.get('token');
    const oauthError = searchParams.get('error');
    const isMockRequested = searchParams.get('mock') === 'true';

    if (token) {
      login(token);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (oauthError) {
      setError(oauthError === 'credentials_missing' 
        ? 'Google OAuth credentials are not configured on the backend server. Please use developer mock login.' 
        : `Google Authentication failed: ${oauthError}`);
    }

    if (isMockRequested) {
      setShowMockForm(true);
    }
  }, [searchParams, login]);

  // Load Google Identity Services SDK dynamically
  useEffect(() => {
    let script = document.getElementById('google-gsi-client-script');
    if (!script) {
      script = document.createElement('script');
      script.id = 'google-gsi-client-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setGsiLoaded(true);
      script.onerror = () => setError('Failed to load Google Identity Services SDK. Check your network.');
      document.body.appendChild(script);
    } else {
      setGsiLoaded(true);
    }
  }, []);

  // Initialize GSI Sign-In Button
  useEffect(() => {
    if (gsiLoaded && window.google && !showMockForm) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn('VITE_GOOGLE_CLIENT_ID is not configured in .env. Falling back to Developer Mock Login.');
        setShowMockForm(true);
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn-div'),
          {
            theme: 'outline',
            size: 'large',
            width: '360',
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
      } catch (err) {
        console.error('Error initializing Google Sign-In button:', err);
      }
    }
  }, [gsiLoaded, showMockForm]);

  const handleCredentialResponse = async (response) => {
    setLoading(true);
    setError('');
    const idToken = response.credential;

    try {
      const res = await fetch(`${API_URL}/api/auth/google/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.token, data.user);
      } else {
        const errData = await res.json();
        setError(errData.detail || 'Google authentication failed.');
      }
    } catch (err) {
      setError('Could not connect to the backend server to verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/account');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleMockLogin = async (e) => {
    e.preventDefault();
    if (!mockEmail) {
      setError('Email address is required.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/mock/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: mockEmail,
          name: mockName || 'Mock Developer',
          avatar_url: mockAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(mockEmail)}`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token, data.user);
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Mock login failed.');
      }
    } catch (err) {
      setError('Could not connect to the backend server. Make sure FastAPI is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
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

      <div className="login-card glass" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <Sparkles size={24} color="var(--primary)" />
          </div>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Log in to access your digital workspace or account portal.</p>
        </div>

        {error && (
          <div style={styles.errorContainer}>
            <Shield size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {!showMockForm ? (
          <div style={styles.btnGroup}>
            <div style={styles.googleBtnContainer}>
              {loading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '12px' }}>
                  Authenticating...
                </div>
              ) : (
                <div id="google-signin-btn-div" style={{ width: '100%', minHeight: '44px' }}></div>
              )}
            </div>

            <button
              onClick={() => setShowMockForm(true)}
              style={styles.devToggleBtn}
            >
              <HelpCircle size={14} style={{ marginRight: '6px' }} />
              Use Developer Mock Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleMockLogin} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label className="login-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} className="login-input-icon" />
                <input
                  type="email"
                  className="login-input"
                  placeholder="name@gmail.com"
                  value={mockEmail}
                  onChange={(e) => setMockEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label className="login-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} className="login-input-icon" />
                <input
                  type="text"
                  className="login-input"
                  placeholder="John Doe"
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
            >
              <LogIn size={16} style={{ marginRight: '8px' }} />
              {loading ? 'Signing in...' : 'Simulate Google Authentication'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowMockForm(false);
                setError('');
              }}
              style={styles.backBtn}
            >
              Back to Google Sign-In
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Secured by Google Identity. By continuing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
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
  btnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  googleBtnContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '44px',
    marginBottom: '8px',
  },
  devToggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-sub)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '8px auto 0 auto',
    width: 'fit-content',
    transition: 'color 0.2s ease',
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
  }
};
