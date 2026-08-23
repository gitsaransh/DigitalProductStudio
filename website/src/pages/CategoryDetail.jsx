import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import CTABanner from '../components/CTABanner.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import { CATEGORIES, EXCEL_SUBCATEGORIES } from '../data/index.js';

export default function CategoryDetail() {
  const { slug } = useParams();

  // Only render visible categories — redirect unknown / hidden slugs
  const category = CATEGORIES.find(c => c.slug === slug && c.visible);
  if (!category) return <Navigate to="/categories" replace />;

  // Excel is the only live category; subcategories are always EXCEL_SUBCATEGORIES
  const subcategories = slug === 'excel' ? EXCEL_SUBCATEGORIES : [];

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container page-header-content">
          <Breadcrumb crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Categories', to: '/categories' },
            { label: category.name },
          ]} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span className="badge badge-purple">Category</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '10px', fontWeight: '800', textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--emerald)',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              padding: '3px 8px', borderRadius: '12px',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }} />
              LIVE
            </span>
          </div>

          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '36px' }}>{category.icon}</span>
            {category.name}
          </h1>
          <p style={{ maxWidth: '560px' }}>{category.description}</p>
          {category.collectionLabel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <span style={{
                fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                letterSpacing: '0.08em', color: category.color.startsWith('#') ? category.color : 'var(--emerald)',
                background: 'rgba(33,115,70,0.10)', border: '1px solid rgba(33,115,70,0.22)',
                padding: '4px 10px', borderRadius: '12px',
              }}>{category.collectionLabel}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-sub)', fontWeight: '600' }}>
                {category.countLabel}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Link
              to={`/products?category=${category.slug}`}
              className="btn btn-primary btn-lg"
            >
              Browse All {category.name} <ArrowRight size={16} />
            </Link>
            <Link to="/categories" className="btn btn-secondary">
              <ArrowLeft size={14} /> Back to Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Subcategories */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Browse by Type</div>
            <h2>Subcategories</h2>
            <p style={{ marginTop: '10px', maxWidth: '480px', margin: '10px auto 0', fontSize: '15px' }}>
              Select a subcategory to explore focused templates built for that domain.
            </p>
          </div>


          {/* ── Flagship Product Card ───────────────────────────────── */}
          {category.flagship && (() => {
            const f = category.flagship;
            return (
              <div style={{
                position: 'relative',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(10,20,50,0.95) 0%, rgba(15,30,60,0.90) 100%)',
                border: '1px solid rgba(99,102,241,0.30)',
                boxShadow: '0 0 0 1px rgba(99,102,241,0.10), 0 24px 64px rgba(0,0,0,0.5)',
                padding: '36px 40px',
                marginBottom: '52px',
                overflow: 'hidden',
              }}>
                {/* Subtle gradient glow top-right */}
                <div style={{
                  position: 'absolute', top: '-60px', right: '-60px',
                  width: '260px', height: '260px', borderRadius: '50%',
                  background: `radial-gradient(circle, ${category.slug === 'excel' ? 'rgba(33,115,70,0.18)' : 'rgba(6,182,212,0.18)'} 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />

                {/* Top badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: 'var(--emerald)',
                    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.28)',
                    padding: '4px 10px', borderRadius: '20px',
                  }}>Flagship Product</span>
                  <span style={{
                    fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: 'var(--cyan)',
                    background: 'rgba(6,182,212,0.10)', border: '1px solid rgba(6,182,212,0.25)',
                    padding: '4px 10px', borderRadius: '20px',
                  }}>{f.badge}</span>
                </div>

                {/* Title */}
                <h2 style={{
                  color: 'white', fontSize: 'clamp(22px, 3vw, 30px)',
                  fontWeight: '900', margin: '0 0 10px', lineHeight: '1.2',
                }}>{f.title}</h2>

                {/* Subtitle */}
                <p style={{
                  color: 'var(--text-sub)', fontSize: '15px',
                  lineHeight: '1.6', margin: '0 0 20px', maxWidth: '560px',
                }}>{f.subtitle}</p>

                {/* Feature pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '28px' }}>
                  {f.features.map(feat => (
                    <span key={feat} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '13px', fontWeight: '700', color: 'white',
                    }}>
                      <CheckCircle2 size={15} color="var(--emerald)" fill="rgba(16,185,129,0.15)" />
                      {feat}
                    </span>
                  ))}
                </div>

                {/* Bottom row: price + learn more */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <Link
                    to={f.href}
                    className="btn btn-sm"
                    style={{
                      background: 'rgba(245,158,11,0.15)',
                      border: '1px solid rgba(245,158,11,0.4)',
                      color: 'var(--amber)',
                      fontWeight: '800',
                      gap: '6px',
                    }}
                  >
                    <Star size={13} fill="var(--amber)" color="var(--amber)" />
                    {f.priceLabel}
                  </Link>
                  <Link
                    to={f.href}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '14px', fontWeight: '700', color: 'var(--text-sub)',
                      textDecoration: 'none', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sub)'}
                  >
                    Learn more <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })()}

          <div className="grid-3" style={{ marginBottom: '64px' }}>
            {subcategories.map((sub, i) => (
              <Link
                key={sub.slug}
                to={`/products?category=${category.slug}&sub=${sub.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  className="glass category-card-premium animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', width: '100%' }}>
                    <div className="category-card-icon" style={{
                      background: 'rgba(99,102,241,0.10)',
                      border: '1px solid rgba(99,102,241,0.20)',
                      color: sub.color,
                      marginBottom: 0,
                      fontSize: '20px',
                    }}>
                      {sub.icon}
                    </div>
                  </div>
                  <h3 className="category-card-title" style={{ fontSize: '16px', marginBottom: '12px' }}>{sub.name}</h3>

                  {/* Template name list */}
                  {sub.items && (
                    <ul style={{ listStyle: 'none', margin: '0 0 16px', padding: 0, display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {sub.items.map(item => (
                        <li key={item} style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          fontSize: '13px', color: 'var(--text-sub)', fontWeight: '500',
                        }}>
                          <span style={{
                            width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                            background: sub.color.startsWith('var') ? 'var(--primary-light)' : sub.color,
                            opacity: 0.8,
                          }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="category-card-link" style={{ color: sub.color, marginTop: 'auto' }}>
                    Browse Templates <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Browse all CTA */}
          <div style={{
            padding: '40px',
            background: category.slug === 'excel' ? 'rgba(33,115,70,0.06)' : 'rgba(6,182,212,0.06)',
            border: category.slug === 'excel' ? '1px solid rgba(33,115,70,0.2)' : '1px solid rgba(6,182,212,0.2)',
            borderRadius: '20px',
            textAlign: 'center',
            marginBottom: '64px',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>{category.icon || '📊'}</div>
            <h3 style={{ color: 'white', marginBottom: '8px' }}>Browse All {category.name}</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px', maxWidth: '420px', margin: '0 auto 24px' }}>
              View the full catalog for {category.name} in one place.
            </p>
            <Link to={`/products?category=${category.slug}`} className="btn btn-primary">
              View All Products <ArrowRight size={15} />
            </Link>
          </div>

          <CTABanner
            title="Can't Find What You Need?"
            subtitle="Request a specific template or join the waitlist for upcoming products."
            btnText="Contact Us"
            btnTo="/contact"
          />
        </div>
      </section>
    </>
  );
}
