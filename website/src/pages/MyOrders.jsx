import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { ShoppingBag, Download, AlertTriangle, ArrowLeft, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';

export default function MyOrders() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    // RLS on `orders` already scopes results to the current user.
    const { data, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (fetchErr) {
      setError(fetchErr.message || 'Failed to fetch order transactions.');
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const handleDownload = async (sku) => {
    setDownloading(prev => ({ ...prev, [sku]: true }));
    try {
      const { data: product, error: productErr } = await supabase
        .from('products')
        .select('file_placeholder')
        .eq('sku', sku)
        .single();

      const filename = product?.file_placeholder || `${sku}_download`;
      const { data: blob, error: downloadErr } = await supabase.storage
        .from('product-files')
        .download(`${sku}/${filename}`);

      if (productErr || downloadErr || !blob) {
        alert(downloadErr?.message || 'Failed to download the product file. Verify purchase status.');
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('An error occurred while downloading the product file.');
    } finally {
      setDownloading(prev => ({ ...prev, [sku]: false }));
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  if (authLoading || (loading && orders.length === 0)) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 className="spinner" size={32} color="var(--primary)" />
        <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Loading order history...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes orderFadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .orders-page {
          animation: orderFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .order-row-item {
          border-bottom: 1px solid var(--border-glass);
          transition: background-color 0.2s ease;
        }
        .order-row-item:hover {
          background-color: rgba(255, 255, 255, 0.01);
        }
        .status-pill {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .status-paid {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #34d399;
        }
        .status-created {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: var(--amber);
        }
        .status-failed {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: var(--rose);
        }
      `}</style>

      <div className="orders-page" style={styles.content}>
        <Link to="/account" style={styles.backLink}>
          <ArrowLeft size={14} /> Back to Profile
        </Link>

        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <ShoppingBag size={24} color="var(--primary)" />
          </div>
          <h1 style={styles.title}>My Order History</h1>
          <p style={styles.subtitle}>Manage your digital receipts and download purchased vaults.</p>
        </div>

        {error && (
          <div style={styles.errorContainer}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="glass" style={styles.emptyCard}>
            <AlertTriangle size={32} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: 'white', marginBottom: '8px' }}>No Orders Found</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px', maxWidth: '320px', margin: '0 auto 20px', lineHeight: '1.5' }}>
              You haven't purchased any templates or prompt vaults yet.
            </p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="glass" style={styles.tableCard}>
            <div style={styles.tableResponsive}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Order Date</th>
                    <th style={styles.th}>SKU / Product</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Payment Status</th>
                    <th style={styles.th} aria-label="Action"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const isPaid = order.status === 'paid';
                    const isCreating = order.status === 'created';
                    
                    return (
                      <tr key={order.id} className="order-row-item">
                        <td style={styles.td}>{formatDate(order.created_at)}</td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '700', color: 'white' }}>{order.sku}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {order.sku === 'DPS-PRM-001' ? 'Ultimate AI Prompt Vault' : 'Digital Template'}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                            {order.currency === 'INR' ? '₹' : '$'}
                            {order.amount.toFixed(2)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span className={`status-pill ${
                            isPaid ? 'status-paid' : isCreating ? 'status-created' : 'status-failed'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td style={styles.tdRight}>
                          {isPaid ? (
                            <button
                              disabled={downloading[order.sku]}
                              onClick={() => handleDownload(order.sku)}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '8px 12px', fontSize: '12px', gap: '6px' }}
                            >
                              {downloading[order.sku] ? (
                                <>
                                  <Loader2 className="spinner" size={13} />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download size={13} />
                                  Download CSV
                                </>
                              )}
                            </button>
                          ) : isCreating ? (
                            <Link
                              to={`/products/chatgpt-claude-prompt-vault`}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '8px 12px', fontSize: '12px' }}
                            >
                              Complete Pay
                            </Link>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Blocked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
    justifyContent: 'center',
    width: '100%',
    padding: '48px 24px',
    minHeight: '80vh',
  },
  content: {
    width: '100%',
    maxWidth: '800px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-sub)',
    textDecoration: 'none',
    marginBottom: '24px',
    transition: 'color 0.2s',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
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
    fontSize: '28px',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--rose)',
    fontSize: '13px',
    marginBottom: '24px',
  },
  emptyCard: {
    padding: '64px 32px',
    textAlign: 'center',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    border: '1px solid var(--border-glass)',
  },
  tableCard: {
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    border: '1px solid var(--border-glass)',
    overflow: 'hidden',
  },
  tableResponsive: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '16px 20px',
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    borderBottom: '1px solid var(--border-glass)',
    background: 'rgba(255,255,255,0.01)',
  },
  td: {
    padding: '18px 20px',
    fontSize: '14px',
    color: 'var(--text-sub)',
  },
  tdRight: {
    padding: '18px 20px',
    fontSize: '14px',
    textAlign: 'right',
  }
};
