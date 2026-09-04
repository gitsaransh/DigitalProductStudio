import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { Star, Download, Globe, CheckCircle2, ArrowLeft, ShieldCheck, RefreshCw, Loader2, ShieldAlert } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb.jsx';
import CTABanner from '../components/CTABanner.jsx';
import { PRODUCTS } from '../data/index.js';
import { useAuth } from '../components/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [purchased, setPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [buying, setBuying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // Live product data from API — overlaid on top of the static baseline.
  const [liveProduct, setLiveProduct] = useState(null);
  // True until the live-price fetch settles (success, failure, or no-row) —
  // gates the price/CTA render so the static baseline's price is never shown
  // if it differs from the authoritative live value (they're different
  // catalog values, not a currency conversion of each other).
  const [priceLoading, setPriceLoading] = useState(true);
  // Inline notice replacing alert() for checkout/download outcomes: { type: 'error' | 'success', title, message }
  const [notice, setNotice] = useState(null);

  // Static baseline lookup (immediate, no loading state)
  let staticProduct = PRODUCTS.find(p => p.slug === slug);

  // Hardcoded fallback for DPS-XLS-001 until static data index is updated
  if (!staticProduct && slug === 'ultimate-finance-os') {
    staticProduct = {
      id: 'ultimate-finance-os',
      sku: 'DPS-XLS-001',
      slug: 'ultimate-finance-os',
      title: 'Ultimate Finance OS',
      subtitle: 'The complete Excel operating system to track expenses, manage budgets, analyze cash flow, and grow your net worth.',
      category: 'Excel Templates',
      categorySlug: 'excel',
      price: 19.00,
      originalPrice: 39.00,
      rating: 5.0,
      reviews: 142,
      downloads: 2980,
      tags: ['Finance', 'Budget', 'Excel', 'Spreadsheet', 'Tracker'],
      localizations: ['en'],
      lifecycle_state: 'published',
      featured: true,
      isBestseller: true,
      description: 'Take control of your personal and business finances with the Ultimate Finance OS. A premium, dual-mode (light/dark) spreadsheet engineered for high-performance financial tracking.',
      includes: [
        'Ultimate Finance OS Excel Spreadsheet (.xlsx)',
        'Google Sheets duplicate version',
        'Video setup walkthrough & instruction guide',
        'Commercial usage license',
        'Lifetime updates access',
      ],
    };
  }

  // Redirect if product not found in static data
  if (!staticProduct) {
    return <Navigate to="/products" replace />;
  }

  // Merge: live API data takes precedence over static baseline for critical fields.
  // Price and currency always come from the live product — this is the exact same
  // row the checkout Edge Function reads, so catalog and checkout can never drift.
  const product = liveProduct
    ? {
        ...staticProduct,
        sku: liveProduct.sku ?? staticProduct.sku,
        price: liveProduct.base_price ?? staticProduct.price,
        originalPrice: liveProduct.compare_at_price ?? staticProduct.originalPrice,
        currency: liveProduct.currency ?? 'USD',
        description: liveProduct.description || staticProduct.description,
        tags: liveProduct.tags?.length ? liveProduct.tags : staticProduct.tags,
      }
    : { ...staticProduct, currency: staticProduct.currency ?? 'USD' };

  // Fetch live product data from Supabase (by slug) to get authoritative SKU + pricing
  useEffect(() => {
    let cancelled = false;
    supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (data && !error) setLiveProduct(data);
        // Resolve loading regardless of outcome — falls back to the static
        // baseline price on error/no-row rather than loading forever.
        setPriceLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  // Check purchase status whenever user is authenticated and we have an SKU.
  // RLS on `orders` already scopes results to the current user, so no user_id filter needed.
  useEffect(() => {
    if (isAuthenticated && product?.sku) {
      checkPurchaseStatus();
    }
  }, [isAuthenticated, product?.sku]);

  const checkPurchaseStatus = async () => {
    setCheckingPurchase(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('sku', product.sku)
        .eq('status', 'paid')
        .limit(1);
      if (!error) setPurchased((data || []).length > 0);
    } catch (err) {
      console.error('Error checking purchase status:', err);
    } finally {
      setCheckingPurchase(false);
    }
  };

  const handleDownload = async () => {
    setNotice(null);
    setDownloading(true);
    try {
      const path = `${product.sku}/${liveProduct?.file_placeholder ?? ''}`;
      const { data: blob, error } = await supabase.storage.from('product-files').download(path);

      if (error || !blob) {
        console.error('Download error:', error);
        setNotice({ type: 'error', title: 'Download failed', message: 'We couldn\'t retrieve your file. Please try again or contact support.' });
        return;
      }

      const filename = liveProduct?.file_placeholder || `${product.sku}_download`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setNotice({ type: 'error', title: 'Download failed', message: 'Something went wrong on our end. Please try again.' });
    } finally {
      setDownloading(false);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/products/${slug}`);
      return;
    }

    setNotice(null);
    setBuying(true);

    try {
      // 1. Create order via Edge Function (holds the Razorpay secret server-side)
      const { data: orderData, error: orderErr } = await supabase.functions.invoke('create-order', {
        body: { sku: product.sku },
      });

      if (orderErr || !orderData) {
        console.error('Order creation error:', orderErr, orderData);
        setNotice({ type: 'error', title: 'Couldn\'t start checkout', message: 'We couldn\'t create your order. Please try again in a moment.' });
        setBuying(false);
        return;
      }

      // 2. Check if mock checkout
      if (orderData.mock) {
        const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 12)}`;

        const { error: verifyErr } = await supabase.functions.invoke('verify-payment', {
          body: {
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: 'mock_signature_approved',
          },
        });

        if (!verifyErr) {
          setPurchased(true);
          setNotice({ type: 'success', title: 'Payment successful', message: 'Your file has been unlocked — you can download it below.' });
        } else {
          setNotice({ type: 'error', title: 'Payment verification failed', message: `Contact support with order ${orderData.order_id} and we'll resolve it right away.` });
        }
        setBuying(false);
        return;
      }

      // 3. Load Razorpay script dynamically
      const loadScript = () => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const scriptLoaded = await loadScript();
      if (!scriptLoaded) {
        setNotice({ type: 'error', title: 'Couldn\'t load payment form', message: 'Check your internet connection and try again.' });
        setBuying(false);
        return;
      }

      // 4. Open Razorpay Widget
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Digital Product Studio',
        description: `Purchase of ${product.title}`,
        order_id: orderData.order_id,
        handler: async function (response) {
          setBuying(true);
          const { error: verifyErr } = await supabase.functions.invoke('verify-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          });

          if (!verifyErr) {
            setPurchased(true);
            setNotice({ type: 'success', title: 'Payment successful', message: 'Your file has been unlocked — you can download it below.' });
          } else {
            // The charge may have already gone through even though verification failed —
            // give the buyer an order reference to hand to support instead of a dead end.
            setNotice({
              type: 'error',
              title: 'Payment verification failed',
              message: `If you were charged, contact support with order ${response.razorpay_order_id} and we'll resolve it right away.`,
            });
          }
          setBuying(false);
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#6366F1'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Checkout error:', err);
      setNotice({ type: 'error', title: 'Checkout error', message: 'Something went wrong. Please try again.' });
    } finally {
      setBuying(false);
    }
  };

  const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const currencySymbol = CURRENCY_SYMBOLS[product.currency] ?? `${product.currency} `;

  return (
    <>
      <div className="container" style={{ marginTop: '24px' }}>
        <style>{`
          .spinner {
            animation: spin 1.2s linear infinite;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>

        <Breadcrumb crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Products', to: '/products' },
          { label: product.category, to: `/products?category=${product.categorySlug}` },
          { label: product.title }
        ]} />

        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-sub)', marginBottom: '24px', fontWeight: '600' }}>
          <ArrowLeft size={14} /> Back to Catalog
        </Link>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '48px',
          alignItems: 'start',
          marginBottom: '64px'
        }}>
          {/* Left Column — Visual CSS Mockup */}
          <div>
            <div className="glass" style={{
              padding: '36px',
              borderRadius: '24px',
              border: '1px solid var(--border-accent)',
              background: 'linear-gradient(135deg, rgba(13, 18, 32, 0.95) 0%, rgba(5, 7, 12, 0.98) 100%)',
              boxShadow: '0 24px 64px rgba(99,102,241,0.18), 0 8px 24px rgba(0,0,0,0.4)',
              minHeight: '380px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative light elements */}
              <div style={{
                position: 'absolute', top: '-100px', left: '-100px',
                width: '300px', height: '300px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              {/* Mockup Header */}
              <div style={{ display: 'flex', zIndex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary" style={{ background: 'var(--primary-subtle)', color: 'var(--primary-light)' }}>
                  {product.category}
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', fontWeight: 'bold' }}>
                  {product.sku || `DPS-${product.id.slice(0, 8).toUpperCase()}`}
                </span>
              </div>

              {/* Mockup App Screen Representation */}
              <div style={{
                margin: '24px 0',
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-glass)',
                textAlign: 'left',
                zIndex: 1
              }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Operating System Active
                </div>
                <h4 style={{ color: 'white', fontSize: '18px', fontWeight: '900', marginBottom: '12px' }}>
                  {product.title.split('|')[0].trim()}
                </h4>

                {/* Progress bars representing dashboard charts */}
                <div style={{ display: 'flex', zIndex: 1, flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'System Accuracy Index', val: 98, col: 'var(--emerald)' },
                    { label: 'Curation Completeness', val: 100, col: 'var(--cyan)' },
                    { label: 'Prompt Deduplication Score', val: 95, col: 'var(--primary)' }
                  ].map(pBar => (
                    <div key={pBar.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px', fontWeight: '600' }}>
                        <span style={{ color: 'var(--text-sub)' }}>{pBar.label}</span>
                        <span style={{ color: 'white' }}>{pBar.val}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${pBar.val}%`, height: '100%', background: pBar.col, borderRadius: 'inherit' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mockup Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={12} fill="var(--amber)" color="var(--amber)" />
                  <span style={{ fontSize: '11px', color: 'white', fontWeight: 'bold' }}>{product.rating}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>({product.reviews} reviews)</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--emerald)', fontWeight: 'bold' }}>
                  {product.downloads.toLocaleString()}+ Downloaded
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Product Pricing and Action */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              {product.isBestseller && (
                <span className="badge badge-amber">🏆 Bestseller</span>
              )}
              {!priceLoading && <span className="badge badge-primary">{product.currency} Checkout</span>}
            </div>

            <h1 style={{ color: 'white', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: '900', margin: '0 0 12px' }}>
              {product.title.split('|')[0].trim()}
            </h1>

            <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 24px' }}>
              {product.subtitle}
            </p>

            <div className="divider" style={{ marginBottom: '24px' }} />

            {/* Price display — gated on priceLoading so the static baseline's
                price (a different catalog value from the live price, not a
                currency conversion of it) is never shown even briefly. */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
              {priceLoading ? (
                <span className="skeleton" style={{ width: '140px', height: '36px' }}>0000.00</span>
              ) : (
                <>
                  <span style={{ fontSize: '36px', color: 'white', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>
                    {currencySymbol}{product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span style={{ fontSize: '18px', color: 'var(--text-sub)', textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>
                      {currencySymbol}{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="badge badge-rose" style={{ marginLeft: '4px' }}>
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Inline notice — replaces alert() for checkout/download outcomes */}
            {notice && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius)',
                  marginBottom: '20px',
                  background: notice.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${notice.type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
                }}
              >
                {notice.type === 'error'
                  ? <ShieldAlert size={16} color="var(--rose)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  : <CheckCircle2 size={16} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />}
                <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <strong style={{ color: notice.type === 'error' ? 'var(--rose)' : 'var(--emerald)' }}>{notice.title}</strong>
                  {notice.message && <div style={{ marginTop: '2px', color: 'var(--text-muted)' }}>{notice.message}</div>}
                </div>
              </div>
            )}

            {/* Checkout / Download CTA */}
            <div style={{ marginBottom: '32px' }}>
              {priceLoading ? (
                <button className="btn btn-secondary btn-lg" disabled style={{ width: '100%', justifyContent: 'center' }}>
                  <Loader2 className="spinner" size={18} /> Loading price...
                </button>
              ) : checkingPurchase ? (
                <button className="btn btn-secondary btn-lg" disabled style={{ width: '100%', justifyContent: 'center' }}>
                  <Loader2 className="spinner" size={18} /> Validating status...
                </button>
              ) : purchased ? (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleDownload}
                  disabled={downloading}
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px', gap: '8px' }}
                >
                  {downloading ? (
                    <>
                      <Loader2 className="spinner" size={18} /> Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={18} /> Download File
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleCheckout}
                  disabled={buying}
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px', gap: '8px' }}
                >
                  {buying ? (
                    <>
                      <Loader2 className="spinner" size={18} /> Initiating Checkout...
                    </>
                  ) : (
                    <>
                      <Download size={18} /> Pay {currencySymbol}{product.price.toFixed(2)}
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Trust List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: <Globe size={16} color="var(--primary-light)" />, text: 'Instant Delivery: Access link sent immediately upon confirmation' },
                { icon: <ShieldCheck size={16} color="var(--emerald)" />, text: 'Commercial Use: Full rights for client and personal projects included' },
                { icon: <RefreshCw size={16} color="var(--cyan)" />, text: 'Lifetime Updates: Free future updates to this template' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', zIndex: 1, alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>{item.icon}</div>
                  <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-sub)', lineHeight: '1.5' }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Tabs / Product Info */}
        <div style={{ textAlign: 'left', marginBottom: '80px' }}>
          <div className="glass" style={{ padding: '36px 40px', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ color: 'white', zIndex: 1, fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>
              Product Specifications & Details
            </h3>
            <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--text-muted)', marginBottom: '32px' }}>
              {product.description}
            </p>

            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              What's Included in the Vault
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              {product.includes.map(inc => (
                <div key={inc} style={{ display: 'flex', zIndex: 1, alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text)' }}>
                  <CheckCircle2 size={14} color="var(--emerald)" /> {inc}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ textAlign: 'left', marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span className="section-label" style={{ justifyContent: 'center' }}>Help Desk</span>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { q: 'How do I access these files?', a: 'Immediately after purchase confirmation, you will receive an automated email containing your unique access link. This will let you download the templates instantly.' },
              { q: 'Are these spreadsheets editable?', a: 'Yes, completely. All templates are fully unlocked without structural passwords so you can customize layout, columns, formulas, and visual themes.' },
              { q: 'Will these work on Google Sheets?', a: 'Absolutely. While optimized for Microsoft Excel, a dedicated pre-configured Google Sheets version link is included in the instructions guide.' },
              { q: 'Is support included?', a: 'Yes! We stand behind our systems. Contact our support center anytime, and our team will get back to you with walkthrough assistance within 24 hours.' }
            ].map(faq => (
              <div key={faq.q} className="glass" style={{ padding: '24px', zIndex: 1, border: '1px solid var(--border-glass)' }}>
                <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>{faq.q}</h4>
                <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <CTABanner
          title="Looking for Custom Corporate Layouts?"
          subtitle="We specialize in automated modeling. Connect with our architects for custom sheets."
          btnText="Submit Request"
          btnTo="/contact?purpose=custom"
        />
      </div>
    </>
  );
}
