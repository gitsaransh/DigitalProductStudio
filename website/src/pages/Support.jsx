import React, { useState } from 'react';
import { Send, MessageCircle, Clock, Mail } from 'lucide-react';
import CTABanner from '../components/CTABanner.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';

export default function Support() {
  const [form, setForm] = useState({ name: '', email: '', orderId: '', category: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handle = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <div className="page-header">
        <div className="container page-header-content">
          <Breadcrumb crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Support Center' },
          ]} />
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>Support</span>
          <h1>Support Center</h1>
          <p>We're here to help. Submit a request and we'll respond within 24 hours.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ gap: '40px', alignItems: 'flex-start' }}>
            {/* Support Info */}
            <div>
              <h2 style={{ color: 'white', marginBottom: '24px' }}>Before You Submit</h2>

              {[
                { icon: <Clock size={18} color="var(--emerald)" />, title: 'Response Time', desc: 'We reply within 24 hours Mon–Fri. Weekend responses may be slightly delayed.' },
                { icon: <MessageCircle size={18} color="var(--primary-light)" />, title: 'Check the FAQ', desc: 'Many common questions are answered in our FAQ page — it may save you time.' },
                { icon: <Mail size={18} color="var(--amber)" />, title: 'Check Your Email', desc: 'Download links are sent immediately after purchase. Check spam if not received.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="glass" style={{ padding: '20px 24px', marginBottom: '16px', display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>{icon}</div>
                  <div>
                    <div style={{ fontWeight: '700', color: 'white', marginBottom: '4px', fontSize: '14px' }}>{title}</div>
                    <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}

              <div className="glass" style={{ padding: '24px', marginTop: '24px' }}>
                <div className="section-label">Quick Links</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {[
                    { label: 'Refund Policy', to: '/refund' },
                    { label: 'FAQ', to: '/faq' },
                    { label: 'Licensing', to: '/licensing' },
                    { label: 'Terms of Service', to: '/terms' },
                  ].map(({ label, to }) => (
                    <a key={to} href={to} style={{ fontSize: '13px', color: 'var(--primary-light)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      → {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Support Form */}
            <div className="glass" style={{ padding: '36px' }}>
              {!submitted ? (
                <>
                  <h3 style={{ color: 'white', marginBottom: '24px' }}>Submit a Support Request</h3>
                  <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="grid-2" style={{ gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input className="form-input" placeholder="Jane Smith" required
                          value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address *</label>
                        <input className="form-input" type="email" placeholder="jane@example.com" required
                          value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Order ID (if applicable)</label>
                      <input className="form-input" placeholder="e.g. GUM-12345 or ET-98765"
                        value={form.orderId} onChange={e => setForm(p => ({ ...p, orderId: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Request Category *</label>
                      <select className="form-select" required
                        value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                        <option value="">Select a category…</option>
                        <option value="download">Download Issue</option>
                        <option value="refund">Refund Request</option>
                        <option value="access">Account Access</option>
                        <option value="product">Product Question</option>
                        <option value="licensing">Licensing Enquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea className="form-input form-textarea" placeholder="Describe your issue in detail…" required
                        value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', gap: '8px' }}>
                      <Send size={15} /> Submit Request
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                  <h3 style={{ color: 'white', marginBottom: '12px' }}>Request Submitted!</h3>
                  <p>We've received your support request and will reply to <strong style={{ color: 'var(--primary-light)' }}>{form.email}</strong> within 24 hours.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
