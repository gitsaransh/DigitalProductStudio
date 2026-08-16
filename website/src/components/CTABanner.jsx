import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function CTABanner({ title, subtitle, btnText = 'Browse Products', btnTo = '/products' }) {
  return (
    <section style={{
      background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
      border: '1px solid var(--border-accent)',
      borderRadius: 'var(--radius-xl)',
      padding: '48px 40px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.08) 0, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--primary-subtle)', border: '1px solid var(--border-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="var(--primary-light)" />
          </div>
        </div>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '900', color: 'white', marginBottom: '12px' }}>{title}</h2>
        {subtitle && <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '16px', maxWidth: '500px', margin: '0 auto 28px' }}>{subtitle}</p>}
        <Link to={btnTo} className="btn btn-primary btn-lg">{btnText}</Link>
      </div>
    </section>
  );
}
