import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Star, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BundleCard({ bundle, index = 0 }) {
  return (
    <div
      className="glass animate-fade-in-up"
      style={{
        padding: '28px',
        animationDelay: `${index * 0.1}s`,
        position: 'relative',
        overflow: 'hidden',
        borderColor: bundle.featured ? 'var(--border-accent)' : undefined,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Glow accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, transparent, ${bundle.color}, transparent)`,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <span className={`badge ${bundle.badgeColor}`}>{bundle.badge}</span>
        <span className="badge badge-emerald">Save {bundle.savings}%</span>
      </div>

      <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>{bundle.title}</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>{bundle.subtitle}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        {bundle.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={14} color="var(--emerald)" />
            {item}
          </div>
        ))}
      </div>

      {/* Spacer to push pricing to bottom */}
      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-sub)', display: 'block', marginBottom: '2px' }}>Bundle Price</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '26px', fontWeight: '900', color: 'var(--emerald)' }}>${bundle.price}</span>
            <span style={{ fontSize: '14px', color: 'var(--text-sub)', textDecoration: 'line-through' }}>${bundle.originalPrice}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>You save</span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--amber)' }}>
            ${(bundle.originalPrice - bundle.price).toFixed(2)}
          </div>
        </div>
      </div>

      <Link to="/bundles" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '8px' }}>
        <Sparkles size={15} /> Get This Bundle
      </Link>
    </div>
  );
}
