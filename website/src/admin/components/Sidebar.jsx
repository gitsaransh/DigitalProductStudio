import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, Users,
  Megaphone, FileText, Search, Mail, Download, Settings, Zap
} from 'lucide-react';

const NAV = [
  { label: 'Core', items: [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders', badge: 2 },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/customers', icon: Users, label: 'Customers' },
  ]},
  { label: 'Content & Growth', items: [
    { to: '/marketing', icon: Megaphone, label: 'Marketing' },
    { to: '/blog', icon: FileText, label: 'Blog' },
    { to: '/seo', icon: Search, label: 'SEO' },
    { to: '/emails', icon: Mail, label: 'Emails' },
  ]},
  { label: 'Operations', items: [
    { to: '/downloads', icon: Download, label: 'Downloads' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

export default function Sidebar({ onClose }) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 48 46" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="adminBoltGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#818CF8" />
              </linearGradient>
            </defs>
            <path 
              fill="url(#adminBoltGrad)" 
              d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
            />
          </svg>
        </div>
        <div>
          <div className="sidebar-brand-text">DPH Admin</div>
          <div className="sidebar-brand-sub">Internal Operations</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map(section => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map(({ to, icon: Icon, label, badge, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <Icon size={15} />
                {label}
                {badge && <span className="badge-count">{badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">S</div>
          <div>
            <div className="sidebar-user-name">Studio Owner</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
          <Zap size={13} color="var(--emerald)" style={{ marginLeft: 'auto' }} />
        </div>
      </div>
    </aside>
  );
}
