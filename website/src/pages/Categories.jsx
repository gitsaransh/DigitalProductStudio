import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import CTABanner from '../components/CTABanner.jsx';
import { CATEGORIES } from '../data/index.js';

const LIVE_CATEGORIES = CATEGORIES.filter(c => c.visible);

export default function Categories() {
  return (
    <>
      <div className="page-header">
        <div className="container page-header-content">
          <span className="badge badge-purple" style={{ marginBottom: '12px' }}>Browse</span>
          <h1>Product Categories</h1>
          <p>Explore our library organized by type — built for professionals who mean business.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">

          {/* ── Live Categories ───────────────────────────────────────── */}
          {LIVE_CATEGORIES.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: 'var(--emerald)',
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                  padding: '4px 10px', borderRadius: '20px',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }} />
                  Now Available
                </span>
              </div>

              <div className="grid-3" style={{ marginBottom: '64px' }}>
                {LIVE_CATEGORIES.map((cat, i) => (
                  <Link
                    key={cat.slug}
                    to={`/categories/${cat.slug}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div
                      className="glass category-card-premium animate-fade-in-up"
                      style={{ animationDelay: `${i * 0.07}s`, position: 'relative', overflow: 'hidden' }}
                    >
                      {/* Gradient wash */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: cat.gradient,
                        pointerEvents: 'none', borderRadius: 'inherit',
                      }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', width: '100%' }}>
                        <div className="category-card-icon" style={{
                          background: cat.color.startsWith('#') ? `${cat.color}15` : 'rgba(99,102,241,0.12)',
                          border: `1px solid ${cat.color.startsWith('#') ? `${cat.color}30` : 'rgba(99,102,241,0.25)'}`,
                          color: cat.color.startsWith('#') ? cat.color : 'var(--primary-light)',
                          marginBottom: 0,
                        }}>
                          {cat.icon}
                        </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: '800', textTransform: 'uppercase',
                          letterSpacing: '0.08em', color: 'var(--emerald)',
                          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)',
                          padding: '3px 8px', borderRadius: '12px',
                        }}>LIVE</span>
                        {cat.collectionLabel && (
                          <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: cat.color.startsWith('#') ? cat.color : 'var(--emerald)' }}>
                            {cat.collectionLabel}
                          </span>
                        )}
                      </div>
                      </div>
                      <h3 className="category-card-title" style={{ fontSize: '16px' }}>{cat.name}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0, flex: 1 }}>{cat.description}</p>
                      <div className="category-card-link" style={{ color: cat.color.startsWith('#') ? cat.color : 'var(--primary-light)', marginTop: '16px' }}>
                        Browse Products <ArrowRight size={13} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* ── Coming Soon ───────────────────────────────────────────── */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'var(--text-muted)',
                background: 'rgba(148,163,184,0.08)', border: '1px solid var(--border-glass)',
                padding: '4px 10px', borderRadius: '20px',
              }}>
                <Lock size={10} /> Coming Soon
              </span>
            </div>

            <div className="grid-3">
              {CATEGORIES.filter(c => !c.visible).map((cat, i) => (
                <div
                  key={cat.slug}
                  className="glass category-card-premium animate-fade-in-up"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    opacity: 0.45,
                    pointerEvents: 'none',
                    cursor: 'default',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', width: '100%' }}>
                    <div className="category-card-icon" style={{
                      background: 'rgba(148,163,184,0.08)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-muted)',
                      marginBottom: 0,
                      filter: 'grayscale(1)',
                    }}>
                      {cat.icon}
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: '800', textTransform: 'uppercase',
                      letterSpacing: '0.08em', color: 'var(--text-muted)',
                      background: 'rgba(148,163,184,0.06)', border: '1px solid var(--border-glass)',
                      padding: '3px 8px', borderRadius: '12px',
                    }}>SOON</span>
                  </div>
                  <h3 className="category-card-title" style={{ fontSize: '16px', color: 'var(--text-muted)' }}>{cat.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: '1.5', margin: 0, flex: 1 }}>{cat.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <CTABanner
              title="Want Early Access to New Categories?"
              subtitle="Join the waitlist and be first to know when Notion, Canva, and AI Prompt packs go live."
              btnText="Contact Us"
              btnTo="/contact"
            />
          </div>
        </div>
      </section>
    </>
  );
}
