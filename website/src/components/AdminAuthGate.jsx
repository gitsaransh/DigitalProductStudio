import React, { useState } from 'react';

export default function AdminAuthGate({ children }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
    if (password === expectedPassword) {
      sessionStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-gate-card {
          animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .auth-gate-input::placeholder {
          color: var(--text-sub);
        }
      `}</style>
      <div className="auth-gate-card glass" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 style={styles.title}>Operator Admin</h2>
          <p style={styles.subtitle}>Enter the administration password to unlock the portal.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              className="auth-gate-input"
              autoFocus
            />
          </div>
          
          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button}>
            Unlock Panel
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '24px',
    backgroundColor: 'var(--bg-deep)',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px 32px',
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
    backgroundColor: 'var(--primary-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto',
    border: '1px solid var(--border-accent)',
  },
  title: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-glass)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.22s var(--ease)',
  },
  error: {
    color: 'var(--rose)',
    fontSize: '13px',
    textAlign: 'left',
    marginTop: '-8px',
  },
  button: {
    padding: '14px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '15px',
    fontWeight: '700',
    transition: 'all 0.22s var(--ease)',
    boxShadow: '0 4px 12px var(--primary-glow)',
  }
};
