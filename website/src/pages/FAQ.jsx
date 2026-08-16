import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FAQS } from '../data/index.js';
import CTABanner from '../components/CTABanner.jsx';

export default function FAQ() {
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen(open === i ? null : i);

  return (
    <>
      <div className="page-header">
        <div className="container page-header-content">
          <span className="badge badge-amber" style={{ marginBottom: '12px' }}>FAQ</span>
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know before buying. Can't find your answer? Contact our support team.</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: '760px' }}>
          <div className="glass" style={{ overflow: 'hidden' }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => toggle(i)}
                  style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
                >
                  <span>{faq.q}</span>
                  {open === i
                    ? <ChevronUp size={18} color="var(--primary-light)" style={{ flexShrink: 0 }} />
                    : <ChevronDown size={18} color="var(--text-sub)" style={{ flexShrink: 0 }} />}
                </button>
                {open === i && (
                  <div className="faq-answer animate-fade-in">{faq.a}</div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '64px' }}>
            <CTABanner
              title="Still Have Questions?"
              subtitle="Our support team responds within 24 hours on business days."
              btnText="Contact Support"
              btnTo="/support"
            />
          </div>
        </div>
      </section>
    </>
  );
}
