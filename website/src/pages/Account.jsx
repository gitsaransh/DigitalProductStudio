import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { User, Mail, Shield, LogOut, ArrowRight, Calendar, Clock } from 'lucide-react';

export default function Account() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
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
        <p style={{ color: 'var(--text-muted)' }}>Loading account profile...</p>
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const avatarUrl = user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email)}`;

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes accountFade {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .account-card {
          animation: accountFade 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .badge-admin {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid var(--border-accent);
          color: var(--primary-light);
        }
        .badge-customer {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
        }
        .account-link-card {
          border: 1px solid var(--border-glass);
          background: rgba(255, 255, 255, 0.01);
          transition: all 0.22s ease;
        }
        .account-link-card:hover {
          border-color: var(--border-hover);
          background: rgba(99, 102, 241, 0.04);
          transform: translateX(4px);
        }
      `}</style>

      <div className="account-card glass" style={styles.card}>
        <div style={styles.profileSection}>
          <div style={styles.avatarWrapper}>
            <img 
              src={avatarUrl} 
              alt={user.name || 'User profile'} 
              style={styles.avatarImg}
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email)}`;
              }}
            />
          </div>
          
          <h2 style={styles.userName}>{user.name || 'Digital Creator'}</h2>
          <span className={user.role === 'admin' ? 'badge-admin' : 'badge-customer'} style={styles.roleBadge}>
            {user.role === 'admin' ? 'Studio Administrator' : 'Customer Account'}
          </span>
        </div>

        <div style={styles.detailsList}>
          <div style={styles.detailRow}>
            <div style={styles.detailIconWrapper}>
              <Mail size={16} color="var(--text-sub)" />
            </div>
            <div style={styles.detailContent}>
              <div style={styles.detailLabel}>Email Address</div>
              <div style={styles.detailValue}>{user.email}</div>
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIconWrapper}>
              <Calendar size={16} color="var(--text-sub)" />
            </div>
            <div style={styles.detailContent}>
              <div style={styles.detailLabel}>Member Since</div>
              <div style={styles.detailValue}>{formatDate(user.created_at)}</div>
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIconWrapper}>
              <Clock size={16} color="var(--text-sub)" />
            </div>
            <div style={styles.detailContent}>
              <div style={styles.detailLabel}>Last Login</div>
              <div style={styles.detailValue}>
                {formatDate(user.last_login)} at {formatTime(user.last_login)}
              </div>
            </div>
          </div>
        </div>

        {user.role === 'admin' && (
          <div style={styles.adminActions}>
            <Link to="/admin" className="account-link-card" style={styles.adminLinkCard}>
              <div>
                <h4 style={{ color: '#ffffff', marginBottom: '4px', fontSize: '15px' }}>Operator Admin Panel</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                  Manage product pipelines, approvals, listings, and metadata.
                </p>
              </div>
              <ArrowRight size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
            </Link>
          </div>
        )}

        <button onClick={logout} style={styles.logoutBtn}>
          <LogOut size={16} style={{ marginRight: '8px' }} />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    width: '100%',
  },
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
    maxWidth: '520px',
    padding: '48px 40px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  },
  profileSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '36px',
  },
  avatarWrapper: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    border: '3px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: '16px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  userName: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '8px',
  },
  roleBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '36px',
    borderTop: '1px solid var(--border-glass)',
    borderBottom: '1px solid var(--border-glass)',
    padding: '24px 0',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  detailIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-glass)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailLabel: {
    fontSize: '12px',
    color: 'var(--text-sub)',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: '14px',
    color: '#ffffff',
    fontWeight: '600',
  },
  adminActions: {
    marginBottom: '24px',
  },
  adminLinkCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderRadius: 'var(--radius)',
    textDecoration: 'none',
    gap: '16px',
  },
  logoutBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: 'var(--radius)',
    color: 'var(--rose)',
    fontWeight: '700',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.22s ease',
  }
};
