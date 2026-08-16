import React, { useState } from 'react';
import { Send, MapPin, Clock, Mail, MessageCircle } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handle = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <div className="page-header">
        <div className="container page-header-content">
          <span className="badge badge-emerald" style={{ marginBottom: '12px' }}>Get In Touch</span>
          <h1>Contact Us</h1>
          <p>Whether it's a product question, partnership enquiry, or just a hello — we'd love to hear from you.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ gap: '40px', alignItems: 'flex-start' }}>
            {/* Contact Info */}
            <div>
              <h2 style={{ color: 'white', marginBottom: '24px' }}>Let's Talk</h2>
              {[
                { icon: <Mail size={18} color="var(--primary-light)" />, title: 'Email', value: 'hello@digitalproductshouse.com' },
                { icon: <MessageCircle size={18} color="var(--emerald)" />, title: 'Support', value: 'support@digitalproductshouse.com' },
                { icon: <Clock size={18} color="var(--amber)" />, title: 'Response Time', value: 'Within 24 hours (Mon–Fri)' },
                { icon: <MapPin size={18} color="var(--rose)" />, title: 'Timezone', value: 'CET / UTC+1' },
              ].map(({ icon, title, value }) => (
                <div key={title} className="glass" style={{ padding: '18px 24px', marginBottom: '14px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
                    <div style={{ fontSize: '14px', color: 'white', fontWeight: '600' }}>{value}</div>
                  </div>
                </div>
              ))}

              <div className="glass" style={{ padding: '24px', marginTop: '8px' }}>
                <h4 style={{ color: 'white', marginBottom: '12px' }}>Partnerships & Collaborations</h4>
                <p style={{ fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
                  Interested in a co-bundle, affiliate arrangement, or sponsorship? Send us a note via the form and include "Partnership" in your subject line.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass" style={{ padding: '36px' }}>
              {!submitted ? (
                <>
                  <h3 style={{ color: 'white', marginBottom: '24px' }}>Send a Message</h3>
                  <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="grid-2" style={{ gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input className="form-input" placeholder="Your name" required
                          value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input className="form-input" type="email" placeholder="you@email.com" required
                          value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject *</label>
                      <input className="form-input" placeholder="What's this about?" required
                        value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea className="form-input form-textarea" placeholder="Your message…" required
                        value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', gap: '8px' }}>
                      <Send size={15} /> Send Message
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>✉️</div>
                  <h3 style={{ color: 'white', marginBottom: '12px' }}>Message Sent!</h3>
                  <p>Thank you, <strong style={{ color: 'var(--primary-light)' }}>{form.name}</strong>! We'll get back to you at {form.email} within 24 hours.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
