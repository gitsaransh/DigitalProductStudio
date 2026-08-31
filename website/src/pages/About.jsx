import React from 'react';
import { Bot, Zap, Globe, ShieldCheck, Layers } from 'lucide-react';
import CTABanner from '../components/CTABanner.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';

const AGENTS = [
  { name: 'Content Agent', role: 'Copywriting & PDF Guide Generation', icon: '✍️', color: 'var(--primary)' },
  { name: 'SEO Agent', role: 'Etsy 140-Char Title & 13 Tag Optimization', icon: '🔍', color: 'var(--emerald)' },
  { name: 'Listing Agent', role: 'Multi-Channel Listing Payload Formatting', icon: '📋', color: 'var(--cyan)' },
  { name: 'Thumbnail Agent', role: '9 Multi-Device Mockup Rendering', icon: '🖼️', color: 'var(--purple)' },
  { name: 'QA Agent', role: 'Policy Compliance & Error Auditing', icon: '🛡️', color: 'var(--amber)' },
  { name: 'Publishing Agent', role: 'Adapter Execution Across 10 Marketplaces', icon: '🚀', color: 'var(--rose)' },
  { name: 'Analytics Agent', role: 'Revenue & Conversion Rate Modeling', icon: '📊', color: 'var(--sky)' },
  { name: 'Support Agent', role: 'Customer Messaging & Review Responses', icon: '💬', color: 'var(--emerald)' },
];

const MILESTONES = [
  { year: '2026', label: 'Studio Founded', desc: 'Digital Product Studio launched as an AI-native publishing operation.' },
  { year: 'Q2 2026', label: 'First 100 Products', desc: 'First 100 digital assets published across Etsy, Gumroad, and direct web.' },
  { year: 'Q3 2026', label: '8-Agent Swarm', desc: 'Full AI agent swarm operational — content, SEO, QA, publishing all automated.' },
  { year: 'Q4 2026', label: '10 Marketplace Adapters', desc: 'Publishing pipeline connected across all 10 major digital marketplaces.' },
];

export default function About() {
  return (
    <>
      <div className="page-header">
        <div className="container page-header-content">
          <Breadcrumb crumbs={[
            { label: 'Home', to: '/' },
            { label: 'About Us' },
          ]} />
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>About Us</span>
          <h1>Built on AI. Crafted for Creators.</h1>
          <p>Digital Product Studio is an enterprise-grade digital publishing operation, combining AI automation with human creative excellence.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Mission */}
          <div className="glass" style={{ padding: '40px 48px', marginBottom: '64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.07) 0, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div className="section-label" style={{ justifyContent: 'center' }}>Our Mission</div>
              <h2 style={{ marginBottom: '16px' }}>Elevating Digital Product Publishing<br /><span className="gradient-text-primary">Through AI Operations</span></h2>
              <p style={{ maxWidth: '620px', margin: '0 auto', fontSize: '16px', lineHeight: '1.8' }}>
                We believe every creator deserves access to premium-quality, professionally optimized digital products — without the months of labor traditionally required to build them. Our AI agent swarm handles the heavy lifting so the final product is consistently excellent.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '64px' }}>
            {[
              { num: 'AI-Assisted', label: 'Content Creation', icon: <Bot size={20} color="var(--purple)" /> },
              { num: 'Instant', label: 'Digital Delivery', icon: <Layers size={20} color="var(--primary-light)" /> },
              { num: '100%', label: 'Secure Checkout', icon: <ShieldCheck size={20} color="var(--amber)" /> },
              { num: 'New', label: 'Products Added Regularly', icon: <Globe size={20} color="var(--emerald)" /> },
            ].map(({ num, label, icon }) => (
              <div key={label} className="glass" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>{icon}</div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>{num}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Agent Swarm */}
          <div style={{ marginBottom: '64px' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div className="section-label" style={{ justifyContent: 'center' }}>Technology</div>
              <h2>The 8-Agent AI Swarm</h2>
              <p style={{ marginTop: '10px', maxWidth: '500px', margin: '10px auto 0' }}>Every product is processed by a pipeline of 8 specialized AI agents before it reaches you.</p>
            </div>
            <div className="grid-4">
              {AGENTS.map((agent, i) => (
                <div key={agent.name} className="glass animate-fade-in-up" style={{ padding: '22px', animationDelay: `${i * 0.07}s`, textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{agent.icon}</div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: 'white', marginBottom: '6px' }}>{agent.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{agent.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: '64px' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div className="section-label" style={{ justifyContent: 'center' }}>Journey</div>
              <h2>Studio Milestones</h2>
            </div>
            <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ position: 'absolute', left: '24px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, var(--primary), transparent)' }} />
              {MILESTONES.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '28px', marginBottom: '32px', paddingLeft: '0' }}>
                  <div style={{ width: '50px', flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: '4px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary)', border: '3px solid var(--bg-dark)', boxShadow: '0 0 12px var(--primary-glow)', flexShrink: 0 }} />
                  </div>
                  <div className="glass" style={{ flex: 1, padding: '20px 24px' }}>
                    <span className="badge badge-primary" style={{ marginBottom: '8px' }}>{m.year}</span>
                    <h4 style={{ color: 'white', marginBottom: '6px' }}>{m.label}</h4>
                    <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <CTABanner title="Start Your Digital Product Journey Today" subtitle="Browse our AI-engineered catalog and download your first product in seconds." btnText="Shop the Catalog" btnTo="/products" />
        </div>
      </section>
    </>
  );
}
