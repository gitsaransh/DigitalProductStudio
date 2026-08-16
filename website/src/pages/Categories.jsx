import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import CTABanner from '../components/CTABanner.jsx';
import { PRODUCTS, CATEGORIES } from '../data/index.js';

export default function Categories() {
  const [active, setActive] = useState(null);
  const filtered = active ? PRODUCTS.filter(p => p.categorySlug === active) : [];

  return (
    <>
      <div className="page-header">
        <div className="container page-header-content">
          <span className="badge badge-purple" style={{ marginBottom: '12px' }}>Browse</span>
          <h1>Product Categories</h1>
          <p>Explore our full library organized by type — planners, templates, spreadsheets, AI kits, and more.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid-3" style={{ marginBottom: '48px' }}>
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.slug}
                onClick={() => setActive(active === cat.slug ? null : cat.slug)}
                style={{ all: 'unset', cursor: 'pointer', display: 'block' }}
              >
                <div
                  className="glass category-card-premium animate-fade-in-up"
                  style={{
                    animationDelay: `${i * 0.07}s`,
                    borderColor: active === cat.slug ? 'var(--border-accent)' : undefined,
                    background: active === cat.slug ? 'rgba(99,102,241,0.07)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', width: '100%' }}>
                    <div className="category-card-icon" style={{
                      background: cat.color.startsWith('#') ? `${cat.color}15` : 'rgba(99,102,241,0.12)',
                      border: `1px solid ${cat.color.startsWith('#') ? `${cat.color}30` : 'rgba(99,102,241,0.25)'}`,
                      color: cat.color.startsWith('#') ? cat.color : 'var(--primary-light)',
                      marginBottom: 0,
                    }}>
                      {cat.icon}
                    </div>
                    <span className="category-card-count">{cat.count} products</span>
                  </div>
                  <h3 className="category-card-title" style={{ fontSize: '16px' }}>{cat.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0, flex: 1 }}>{cat.description}</p>
                  <div className="category-card-link" style={{ color: cat.color.startsWith('#') ? cat.color : 'var(--primary-light)' }}>
                    {active === cat.slug ? 'Collapse ↑' : 'Browse Products'} <ArrowRight size={13} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {active && filtered.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '800', color: 'white' }}>
                {CATEGORIES.find(c => c.slug === active)?.name}
              </h3>
              <div className="grid-auto">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </div>
          )}

          {active && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-sub)' }}>
              More products in this category coming soon.
            </div>
          )}

          <div style={{ marginTop: '64px' }}>
            <CTABanner title="Can't Find Your Category?" subtitle="New categories are added monthly. Drop us a request." btnText="Contact Us" btnTo="/contact" />
          </div>
        </div>
      </section>
    </>
  );
}
