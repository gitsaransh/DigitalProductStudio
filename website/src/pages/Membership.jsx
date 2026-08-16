import React, { useState } from 'react';
import { Check, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import CTABanner from '../components/CTABanner.jsx';

export default function Membership() {
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'yearly'
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const price = billing === 'monthly' ? 9 : 99;
  const period = billing === 'monthly' ? 'month' : 'year';

  const benefits = [
    'Instant download access to every existing template',
    'Free lifetime updates to all digital assets',
    'New premium productivity systems released weekly',
    'Exclusive monthly AI Prompt Vault drops',
    'Commercial licenses included for all assets',
    'Priority support & template requests dashboard',
  ];

  return (
    <>
      <div className="page-header">
        <div className="container page-header-content">
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>Tier 4 Membership</span>
          <h1>Unlimited Creator Pass</h1>
          <p>Ditch individual purchases. Build your entire system with a predictable, recurring membership.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <span style={{ fontWeight: billing === 'monthly' ? '800' : '500', color: billing === 'monthly' ? 'white' : 'var(--text-sub)', fontSize: '14px' }}>Monthly</span>
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
              style={{
                width: '50px', height: '26px', borderRadius: '15px',
                background: 'var(--primary)',
                border: 'none', position: 'relative', outline: 'none',
                padding: '2px', cursor: 'pointer',
              }}
            >
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: 'white', position: 'absolute',
                left: billing === 'monthly' ? '2px' : '26px',
                top: '2px', transition: 'left 0.2s',
              }} />
            </button>
            <span style={{ fontWeight: billing === 'yearly' ? '800' : '500', color: billing === 'yearly' ? 'white' : 'var(--text-sub)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Yearly <span className="badge badge-emerald" style={{ fontSize: '10px', padding: '2px 6px' }}>Save 8%</span>
            </span>
          </div>

          <div className="grid-2" style={{ alignItems: 'center', maxWidth: '960px', margin: '0 auto' }}>
            {/* Left: Pricing Card */}
            <div className="glass" style={{ padding: '40px', border: '1px solid var(--border-accent)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--purple))' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '6px' }}>ALL ACCESS</span>
                  <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>VIP Creator Membership</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '42px', fontWeight: '900', color: 'white', lineHeight: '1', fontFamily: 'var(--mono)' }}>${price}</div>
                  <span style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: '700' }}>per {period}</span>
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border-glass)', margin: '24px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                {benefits.map(b => (
                  <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justify: 'center', marginTop: '2px', flexShrink: 0 }}>
                      <Check size={11} color="var(--emerald)" />
                    </div>
                    <span style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{b}</span>
                  </div>
                ))}
              </div>

              {!submitted ? (
                <form onSubmit={e => { e.preventDefault(); if (email.trim()) setSubmitted(true); }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      style={{ flex: 1, minWidth: '180px' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ gap: '6px', whiteSpace: 'nowrap' }}>
                      <Sparkles size={14} /> Join Membership Waitlist
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ padding: '16px 20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius)', color: 'var(--emerald)', fontWeight: '700', fontSize: '14px', textAlign: 'center' }}>
                  ✓ Request accepted! You will receive early-access pricing options shortly.
                </div>
              )}
            </div>

            {/* Right: Info Panels */}
            <div>
              <h2 style={{ color: 'white', marginBottom: '24px' }}>Why Join the Membership?</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { title: 'Best Value For Builders', desc: 'If you download more than 3 templates a year, the membership pays for itself instantly. Perfect for founders running multiple operations.', icon: <Zap size={18} color="var(--primary-light)" /> },
                  { title: 'Always Up To Date', desc: 'When Notion makes API changes or spreadsheet tax rules update, members get updated templates automatically pushed to their dashboards.', icon: <Sparkles size={18} color="var(--purple)" /> },
                  { title: 'Custom Systems Requests', desc: 'Need a custom system built? Members can request specific spreadsheets, Notion setups, or prompt templates directly from our AI developers.', icon: <ShieldCheck size={18} color="var(--emerald)" /> },
                ].map(({ title, desc, icon }) => (
                  <div key={title} className="glass" style={{ padding: '20px 24px', display: 'flex', gap: '16px' }}>
                    <div style={{ flexShrink: 0, marginTop: '2px' }}>{icon}</div>
                    <div>
                      <div style={{ fontWeight: '700', color: 'white', marginBottom: '4px', fontSize: '14px' }}>{title}</div>
                      <p style={{ fontSize: '12.5px', lineHeight: '1.6', margin: 0, color: 'var(--text-muted)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '64px' }}>
            <CTABanner
              title="Not Ready to Join the Membership?"
              subtitle="Browse our high-value category bundles and professional packs starting at $49."
              btnText="Explore Bundles"
              btnTo="/bundles"
            />
          </div>
        </div>
      </section>
    </>
  );
}
