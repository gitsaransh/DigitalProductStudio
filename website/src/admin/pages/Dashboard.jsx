import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Download, Star, ArrowRight, Zap, Package, Users } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import { Sparkline } from '../components/Chart.jsx';
import { ORDERS, PRODUCTS, REVENUE_TREND } from '../data/mockData.js';

const statusPill = (s) => {
  const map = { delivered: 'pill-green', pending: 'pill-amber', refunded: 'pill-rose' };
  return <span className={`pill ${map[s] || 'pill-gray'}`}>{s}</span>;
};

export default function Dashboard() {
  const totalRevenue = ORDERS.filter(o => o.status !== 'refunded').reduce((s, o) => s + o.amount, 0);
  const sparkData = REVENUE_TREND.map(r => r.revenue);
  const recentOrders = ORDERS.slice(0, 5);
  const topProducts = [...PRODUCTS].sort((a, b) => b.downloads - a.downloads).slice(0, 5);

  return (
    <>
      <TopBar page="Dashboard" />
      <div className="page-content">
        {/* Page header */}
        <div className="page-header">
          <div>
            <div className="page-title">Good morning, Studio 👋</div>
            <div className="page-subtitle">Here's your operation status for today — Aug 9, 2026.</div>
          </div>
          <Link to="/admin/products" className="btn btn-primary btn-sm"><Package size={14} /> New Product</Link>
        </div>

        {/* KPI Cards */}
        <div className="stat-grid">
          <StatCard
            label="Revenue (MTD)"
            value={`$${totalRevenue.toFixed(2)}`}
            trend="up"
            trendLabel="+18.4% vs last month"
            icon={<DollarSign size={16} />}
            iconBg="rgba(16,185,129,0.12)"
            iconColor="var(--emerald)"
          />
          <StatCard
            label="Orders (MTD)"
            value={ORDERS.length}
            trend="up"
            trendLabel="+12 new today"
            icon={<ShoppingCart size={16} />}
            iconBg="rgba(99,102,241,0.12)"
            iconColor="var(--primary-light)"
          />
          <StatCard
            label="Total Downloads"
            value="14.2K"
            trend="up"
            trendLabel="+340 this week"
            icon={<Download size={16} />}
            iconBg="rgba(6,182,212,0.12)"
            iconColor="var(--cyan)"
          />
          <StatCard
            label="Active Products"
            value={PRODUCTS.filter(p => p.status === 'published').length}
            trend="neutral"
            trendLabel={`${PRODUCTS.filter(p => p.status === 'draft').length} in draft`}
            icon={<Package size={16} />}
            iconBg="rgba(245,158,11,0.12)"
            iconColor="var(--amber)"
          />
        </div>

        {/* Revenue Chart + System Status */}
        <div className="grid-2" style={{ marginBottom: '20px' }}>
          {/* Revenue sparkline */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Revenue — Last 14 Days</span>
              <span className="pill pill-green">Live</span>
            </div>
            <div className="panel-body">
              <div style={{ fontSize: '26px', fontWeight: '900', color: 'white', fontFamily: 'var(--mono)', marginBottom: '12px' }}>
                ${totalRevenue.toFixed(2)}
              </div>
              <div style={{ position: 'relative', width: '100%', height: '80px' }}>
                <svg viewBox="0 0 400 80" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                  {(() => {
                    const d = sparkData;
                    const min = Math.min(...d), max = Math.max(...d), range = max - min || 1;
                    const pts = d.map((v, i) => {
                      const x = (i / (d.length - 1)) * 400;
                      const y = 76 - ((v - min) / range) * 68;
                      return `${x},${y}`;
                    }).join(' ');
                    const areaClose = `${(d.length-1)/(d.length-1)*400},80 0,80`;
                    return (
                      <>
                        <defs>
                          <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <polygon points={`${pts} ${areaClose}`} fill="url(#rev-grad)" />
                        <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                      </>
                    );
                  })()}
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-sub)' }}>
                <span>Jul 27</span><span>Aug 9</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">System Status</span>
              <span className="pill pill-green"><span style={{ width: '6px', height: '6px', background: 'var(--emerald)', borderRadius: '50%', display: 'inline-block' }} /> All operational</span>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'AI Agent Swarm (8 agents)', status: 'Operational', color: 'pill-green' },
                { label: 'Etsy Adapter', status: 'Operational', color: 'pill-green' },
                { label: 'Gumroad Adapter', status: 'Operational', color: 'pill-green' },
                { label: 'Direct Download CDN', status: 'Operational', color: 'pill-green' },
                { label: 'Email Delivery (SMTP)', status: 'Operational', color: 'pill-green' },
                { label: 'QA Pipeline', status: 'Operational', color: 'pill-green' },
              ].map(({ label, status, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
                  <span className={`pill ${color}`}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders + Top Products */}
        <div className="grid-2">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Recent Orders</span>
              <Link to="/admin/orders" className="btn btn-ghost btn-xs">View All <ArrowRight size={11} /></Link>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Order</th><th>Product</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td className="td-mono">{o.id}</td>
                    <td className="td-primary truncate" style={{ maxWidth: '160px' }}>{o.product}</td>
                    <td style={{ color: 'var(--emerald)', fontWeight: '700', fontFamily: 'var(--mono)' }}>${o.amount}</td>
                    <td>{statusPill(o.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Top Products by Downloads</span>
              <Link to="/admin/products" className="btn btn-ghost btn-xs">View All <ArrowRight size={11} /></Link>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Product</th><th>Downloads</th><th>Rating</th></tr>
              </thead>
              <tbody>
                {topProducts.map(p => (
                  <tr key={p.id}>
                    <td className="td-primary truncate" style={{ maxWidth: '180px' }}>{p.title}</td>
                    <td className="td-mono">{p.downloads.toLocaleString()}</td>
                    <td style={{ color: 'var(--amber)', fontWeight: '700' }}>{p.rating ? `${p.rating}★` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="panel mt-20">
          <div className="panel-header"><span className="panel-title">Quick Actions</span></div>
          <div className="panel-body" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: 'New Product', to: '/admin/products', icon: <Package size={13} /> },
              { label: 'View Orders', to: '/admin/orders', icon: <ShoppingCart size={13} /> },
              { label: 'Blog Manager', to: '/admin/blog', icon: null },
              { label: 'SEO Audit', to: '/admin/seo', icon: null },
              { label: 'Email Campaigns', to: '/admin/emails', icon: null },
              { label: 'Settings', to: '/admin/settings', icon: null },
            ].map(({ label, to, icon }) => (
              <Link key={label} to={to} className="btn btn-ghost btn-sm" style={{ gap: '6px' }}>
                {icon} {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
