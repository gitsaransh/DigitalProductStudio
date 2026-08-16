import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Instagram, Youtube, Linkedin } from 'lucide-react';

const SHOP = [
  { to: '/products', label: 'All Products' },
  { to: '/categories', label: 'Categories' },
  { to: '/bundles', label: 'Bundles' },
  { to: '/free', label: 'Free Resources' },
];
const COMPANY = [
  { to: '/about', label: 'About Us' },
  { to: '/blog', label: 'Blog' },
  { to: '/affiliate', label: 'Affiliate Program' },
  { to: '/account', label: 'My Account' },
];
const SUPPORT = [
  { to: '/faq', label: 'FAQ' },
  { to: '/support', label: 'Support Center' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/licensing', label: 'Licensing Info' },
];
const LEGAL = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/refund', label: 'Refund Policy' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Brand Column */}
        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="nav-logo-mark">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 48 46" style={{ display: 'block' }}>
                <defs>
                  <linearGradient id="footerBoltGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#818CF8" />
                  </linearGradient>
                </defs>
                <path 
                  fill="url(#footerBoltGrad)" 
                  d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
                />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '15px' }}>Digital Products House</div>
              <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Premium Digital Assets</div>
            </div>
          </Link>
          <p className="footer-brand-desc">
            AI-powered digital publishing studio delivering premium planners, templates, prompt vaults, and creator tools across 10 global marketplaces.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {[
              { 
                Icon: (props) => (
                  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ), 
                href: '#',
                hoverBg: 'rgba(255, 255, 255, 0.12)',
                hoverColor: 'white',
                hoverBorder: 'rgba(255, 255, 255, 0.35)'
              },
              { 
                Icon: Instagram, 
                href: '#',
                hoverBg: 'linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)',
                hoverColor: 'white',
                hoverBorder: 'transparent'
              },
              { 
                Icon: Youtube, 
                href: '#',
                hoverBg: '#FF0000',
                hoverColor: 'white',
                hoverBorder: 'transparent'
              },
              { 
                Icon: Linkedin, 
                href: '#',
                hoverBg: '#0077B5',
                hoverColor: 'white',
                hoverBorder: 'transparent'
              },
            ].map(({ Icon, href, hoverBg, hoverColor, hoverBorder }, i) => {
              const [hovered, setHovered] = React.useState(false);
              return (
                <a
                  key={i}
                  href={href}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  style={{
                    width: '38px', height: '38px',
                    background: hovered ? hoverBg : 'rgba(255,255,255,0.04)',
                    border: '1px solid',
                    borderColor: hovered ? hoverBorder : 'var(--border-glass)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: hovered ? hoverColor : 'var(--text-sub)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: hovered ? 'scale(1.1) translateY(-2px)' : 'none',
                    boxShadow: hovered ? '0 4px 12px rgba(0, 0, 0, 0.25)' : 'none',
                  }}
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Shop */}
        <div>
          <div className="footer-col-title">Shop</div>
          <div className="footer-links">
            {SHOP.map(({ to, label }) => (
              <Link key={to} to={to} className="footer-link">{label}</Link>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <div className="footer-col-title">Company</div>
          <div className="footer-links">
            {COMPANY.map(({ to, label }) => (
              <Link key={to} to={to} className="footer-link">{label}</Link>
            ))}
            <div className="footer-col-title" style={{ marginTop: '20px' }}>Support</div>
            {SUPPORT.map(({ to, label }) => (
              <Link key={to} to={to} className="footer-link">{label}</Link>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div>
          <div className="footer-col-title">Legal</div>
          <div className="footer-links">
            {LEGAL.map(({ to, label }) => (
              <Link key={to} to={to} className="footer-link">{label}</Link>
            ))}
          </div>
          <div style={{ marginTop: '28px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI-Powered Platform</div>
            <div style={{ fontSize: '11px', color: 'var(--text-sub)', lineHeight: '1.6' }}>Powered by 8-agent swarm. 10 marketplace adapters. 100K+ digital assets.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
              <Zap size={11} color="var(--emerald)" />
              <span style={{ fontSize: '11px', color: 'var(--emerald)', fontWeight: '700' }}>Enterprise Production Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">© {new Date().getFullYear()} Digital Products House. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/privacy" className="footer-link" style={{ fontSize: '12px' }}>Privacy</Link>
          <Link to="/terms" className="footer-link" style={{ fontSize: '12px' }}>Terms</Link>
          <Link to="/refund" className="footer-link" style={{ fontSize: '12px' }}>Refunds</Link>
        </div>
      </div>
    </footer>
  );
}
