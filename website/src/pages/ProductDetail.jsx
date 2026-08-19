import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Star, Download, Globe, CheckCircle2, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb.jsx';
import CTABanner from '../components/CTABanner.jsx';
import { PRODUCTS } from '../data/index.js';

export default function ProductDetail() {
  const { slug } = useParams();
  const [claimed, setClaimed] = useState(false);

  // Look up product in static database
  let product = PRODUCTS.find(p => p.slug === slug);

  // Hardcoded mockup data for the flagship product "Ultimate Finance OS" (from PRODUCT_CATALOG.md)
  if (slug === 'ultimate-finance-os') {
    product = {
      id: "ultimate-finance-os",
      sku: "DPS-XLS-001",
      slug: "ultimate-finance-os",
      title: "Ultimate Finance OS",
      subtitle: "The complete Excel operating system to track expenses, manage budgets, analyze cash flow, and grow your net worth.",
      category: "Excel Templates",
      categorySlug: "excel",
      price: 19.00,
      originalPrice: 39.00,
      rating: 5.0,
      reviews: 142,
      downloads: 2980,
      tags: ["Finance", "Budget", "Excel", "Spreadsheet", "Tracker"],
      localizations: ["en"],
      lifecycle_state: "published",
      featured: true,
      isBestseller: true,
      description: "Take control of your personal and business finances with the Ultimate Finance OS. A premium, dual-mode (light/dark) spreadsheet engineered for high-performance financial tracking. Tracks your MTD revenue, expenses, net worth, OKRs, and goals automatically in a fully integrated layout.",
      includes: [
        "Ultimate Finance OS Excel Spreadsheet (.xlsx)",
        "Google Sheets duplicate version",
        "Video setup walkthrough & instruction guide",
        "Commercial usage license",
        "Lifetime updates access"
      ]
    };
  }

  // Fallback redirect if product is not found
  if (!product) {
    return <Navigate to="/products" replace />;
  }

  const handleClaim = () => {
    setClaimed(true);
  };

  return (
    <>
      <div className="container" style={{ marginTop: '24px' }}>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
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
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Budget Allocations', val: 78, col: 'var(--emerald)' },
                    { label: 'Savings Target Progress', val: 92, col: 'var(--cyan)' },
                    { label: 'Net Profit Margin MTD', val: 64, col: 'var(--primary)' }
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
              <span className="badge badge-primary">Excel Compatible</span>
            </div>

            <h1 style={{ color: 'white', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: '900', margin: '0 0 12px' }}>
              {product.title.split('|')[0].trim()}
            </h1>

            <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 24px' }}>
              {product.subtitle}
            </p>

            <div className="divider" style={{ marginBottom: '24px' }} />

            {/* Price display */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '28px' }}>
              <span style={{ fontSize: '36px', color: 'white', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '18px', color: 'var(--text-sub)', textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.originalPrice && (
                <span className="badge badge-rose" style={{ marginLeft: '4px' }}>
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Add to Cart/Claim CTA */}
            <div style={{ marginBottom: '32px' }}>
              {claimed ? (
                <div className="glass" style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(16,185,129,0.3)',
                  background: 'rgba(16,185,129,0.06)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <CheckCircle2 size={18} color="var(--emerald)" /> 
                  Claimed successfully! Your download will begin shortly.
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleClaim}
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px' }}
                >
                  <Download size={18} /> Instant Download
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
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
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
            <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>
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
                <div key={inc} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text)' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {[
              { q: 'How do I access these files?', a: 'Immediately after purchase confirmation, you will receive an automated email containing your unique access link. This will let you download the templates instantly.' },
              { q: 'Are these spreadsheets editable?', a: 'Yes, completely. All templates are fully unlocked without structural passwords so you can customize layout, columns, formulas, and visual themes.' },
              { q: 'Will these work on Google Sheets?', a: 'Absolutely. While optimized for Microsoft Excel, a dedicated pre-configured Google Sheets version link is included in the instructions guide.' },
              { q: 'Is support included?', a: 'Yes! We stand behind our systems. Contact our support center anytime, and our team will get back to you with walkthrough assistance within 24 hours.' }
            ].map(faq => (
              <div key={faq.q} className="glass" style={{ padding: '24px', border: '1px solid var(--border-glass)' }}>
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
