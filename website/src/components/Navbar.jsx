import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, Globe, Zap, LogOut, LogIn } from 'lucide-react';
import { useAuth } from './AuthContext.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
  { to: '/bundles', label: 'Bundles' },
  { to: '/free', label: 'Free Resources' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  // /admin and /coo are intentionally omitted — operator-only routes accessed directly by URL
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-logo">
          <div className="nav-logo-mark">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 48 46" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="navBoltGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
              </defs>
              <path 
                fill="url(#navBoltGrad)" 
                d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
              />
            </svg>
          </div>
          <div className="nav-logo-text-wrapper">
            <div className="nav-logo-text">Digital Product Studio</div>
            <div className="nav-logo-sub">Premium Digital Assets</div>
          </div>
        </Link>

        <div className="nav-links">
          {NAV_LINKS.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <>
              <NavLink
                to="/account"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                Account
              </NavLink>
              <NavLink
                to="/orders"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                My Orders
              </NavLink>
            </>
          )}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Admin Dashboard
            </NavLink>
          )}
        </div>

        <div className="nav-actions">
          <Link to="/products" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
            <ShoppingBag size={14} /> Shop Now
          </Link>
          
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="btn btn-sm"
              style={{
                gap: '6px',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: 'var(--rose)',
              }}
            >
              <LogOut size={14} /> Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="btn btn-sm"
              style={{
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text)',
              }}
            >
              <LogIn size={14} /> Login
            </Link>
          )}
          
          <button
            className="nav-hamburger"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="nav-mobile-menu">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-mobile-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <>
              <NavLink to="/account" className="nav-mobile-link" onClick={() => setOpen(false)}>Account</NavLink>
              <NavLink to="/orders" className="nav-mobile-link" onClick={() => setOpen(false)}>My Orders</NavLink>
            </>
          )}
          {isAdmin && (
            <NavLink to="/admin" className="nav-mobile-link" onClick={() => setOpen(false)}>Admin Dashboard</NavLink>
          )}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '8px 0' }} />
          <NavLink to="/faq" className="nav-mobile-link" onClick={() => setOpen(false)}>FAQ</NavLink>
          <NavLink to="/support" className="nav-mobile-link" onClick={() => setOpen(false)}>Support</NavLink>
          <NavLink to="/contact" className="nav-mobile-link" onClick={() => setOpen(false)}>Contact</NavLink>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '8px 0' }} />
          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="nav-mobile-link"
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                color: 'var(--rose)',
                fontWeight: '600',
              }}
            >
              Logout
            </button>
          ) : (
            <NavLink to="/login" className="nav-mobile-link" style={{ fontWeight: '600', color: 'var(--primary-light)' }} onClick={() => setOpen(false)}>Login</NavLink>
          )}
        </div>
      )}
    </>
  );
}
