import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export default function ComingSoonBanner({ title, description, featureLabel = 'Coming Soon' }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handle = (e) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
      <div className="coming-soon-wrap">
        <div className="coming-soon-icon">
          <Bell size={32} color="var(--primary-light)" />
        </div>
        <span className="badge badge-primary" style={{ display: 'inline-flex', marginBottom: '16px' }}>{featureLabel}</span>
        <h1 className="coming-soon-title">{title}</h1>
        <p className="coming-soon-desc">{description}</p>
        {!submitted ? (
          <form className="coming-soon-email" onSubmit={handle}>
            <input
              className="form-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Notify Me
            </button>
          </form>
        ) : (
          <div style={{ padding: '16px 24px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius)', color: 'var(--emerald)', fontWeight: '700', fontSize: '14px' }}>
            ✓ You're on the early access list!
          </div>
        )}
      </div>
    </div>
  );
}
