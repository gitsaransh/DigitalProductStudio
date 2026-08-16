import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import CTABanner from '../components/CTABanner.jsx';
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
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-sub)' }}>
            <Link to="/" style={{ color: 'var(--text-sub)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={13} />
            <Link to="/categories" style={{ color: 'var(--text-sub)', textDecoration: 'none' }}>Categories</Link>
            <ChevronRight size={13} />
            <span style={{ color: 'white' }}>{category.name}</span>
          </nav>

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', width: '100%' }}>
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
                  <h3 className="category-card-title" style={{ fontSize: '16px' }}>{sub.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0, flex: 1 }}>{sub.description}</p>
                  <div className="category-card-link" style={{ color: sub.color, marginTop: '16px' }}>
                    Browse Templates <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Browse all CTA */}
          <div style={{
            padding: '40px',
            background: 'rgba(33,115,70,0.06)',
            border: '1px solid rgba(33,115,70,0.2)',
            borderRadius: '20px',
            textAlign: 'center',
            marginBottom: '64px',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>📊</div>
            <h3 style={{ color: 'white', marginBottom: '8px' }}>Browse All Excel Templates</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px', maxWidth: '420px', margin: '0 auto 24px' }}>
              View the full catalog across all subcategories in one place.
            </p>
            <Link to={`/products?category=${category.slug}`} className="btn btn-primary">
              View All Templates <ArrowRight size={15} />
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
