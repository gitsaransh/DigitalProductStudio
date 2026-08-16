import React, { useState } from 'react';
import { Download, Gift } from 'lucide-react';
import { FREE_RESOURCES } from '../data/index.js';
import CTABanner from '../components/CTABanner.jsx';

export default function FreeResources() {
  const [claimed, setClaimed] = useState({});

  return (
    <>
      <div className="page-header">
        <div className="container page-header-content">
          <span className="badge badge-emerald" style={{ marginBottom: '12px' }}>100% Free</span>
          <h1>Free Resources</h1>
          <p>High-quality digital tools and templates — absolutely free, no catch.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="glass" style={{ padding: '20px 28px', marginBottom: '40px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Gift size={20} color="var(--emerald)" />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
              These are completely free — no upsells, no email required (unless marked). Our gift to the creator community.
            </p>
          </div>

          <div className="grid-3">
            {FREE_RESOURCES.map((res, i) => (
              <div key={res.id} className="glass animate-fade-in-up" style={{ padding: '28px', animationDelay: `${i * 0.1}s`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{res.icon}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className={`badge ${res.badgeColor}`}>{res.badge}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{res.downloadCount.toLocaleString()} downloads</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '10px', lineHeight: '1.4' }}>{res.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', flex: 1 }}>{res.description}</p>
                <div style={{ marginTop: '20px' }}>
                  {claimed[res.id] ? (
                    <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius)', color: 'var(--emerald)', fontWeight: '700', fontSize: '14px' }}>
                      ✓ Downloading…
                    </div>
                  ) : (
                    <button
                      className="btn btn-emerald"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => setClaimed(p => ({ ...p, [res.id]: true }))}
                    >
                      <Download size={15} /> Free Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '64px' }}>
            <CTABanner
              title="Loved the Free Resources?"
              subtitle="Check out our premium catalog for the full experience."
              btnText="Browse Premium Products"
              btnTo="/products"
            />
          </div>
        </div>
      </section>
    </>
  );
}
