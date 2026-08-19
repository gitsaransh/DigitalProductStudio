import React from 'react';
import BundleCard from '../components/BundleCard.jsx';
import TestimonialCard from '../components/TestimonialCard.jsx';
import CTABanner from '../components/CTABanner.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import { BUNDLES, TESTIMONIALS } from '../data/index.js';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function Bundles() {
  return (
    <>
      <div className="page-header">
        <div className="container page-header-content">
          <Breadcrumb crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Bundles & Packs' },
          ]} />
          <span className="badge badge-amber" style={{ marginBottom: '12px' }}>Best Value</span>
          <h1>Product Bundles</h1>
          <p>Save up to 50% by grabbing curated product packs designed to work together.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Value Props */}
          <div className="glass" style={{ padding: '24px 32px', marginBottom: '48px', display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
            {[
              { icon: '💰', label: 'Save 40–50%', desc: 'vs buying separately' },
              { icon: '⚡', label: 'Instant Access', desc: 'All items at once' },
              { icon: '🔄', label: 'Lifetime Updates', desc: 'Free for purchasers' },
              { icon: '🌍', label: 'Multi-Language', desc: 'Included per product' },
            ].map(({ icon, label, desc }) => (
              <div key={label} style={{ minWidth: '140px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
                <div style={{ fontWeight: '800', color: 'white', fontSize: '15px' }}>{label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{desc}</div>
              </div>
            ))}
          </div>

          <div className="grid-3">
            {BUNDLES.map((bundle, i) => <BundleCard key={bundle.id} bundle={bundle} index={i} />)}
          </div>

          {/* FAQ snippet */}
          <div style={{ marginTop: '64px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '24px', color: 'white' }}>Frequently Asked Bundle Questions</h3>
            <div className="grid-2" style={{ textAlign: 'left', gap: '16px' }}>
              {[
                { q: 'Are bundles downloadable immediately?', a: 'Yes — all bundle items are available instantly via your download email and account.' },
                { q: 'Can I buy bundle items individually later?', a: 'Yes, all bundle components are also sold separately on our Products page.' },
                { q: 'Are bundles covered by the refund policy?', a: 'Yes — bundles are covered by our 7-day satisfaction guarantee.' },
                { q: 'Do bundles include all language editions?', a: 'Bundles include all languages available per individual product.' },
              ].map(({ q, a }) => (
                <div key={q} className="glass" style={{ padding: '20px' }}>
                  <div style={{ fontWeight: '700', color: 'white', marginBottom: '8px', fontSize: '14px' }}>{q}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{a}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '64px' }}>
            <CTABanner title="Not Sure Which Bundle?" subtitle="Browse individual products and build your own wishlist." btnText="Browse Products" btnTo="/products" />
          </div>
        </div>
      </section>
    </>
  );
}
