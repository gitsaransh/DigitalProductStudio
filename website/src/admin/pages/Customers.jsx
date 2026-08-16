import React, { useState } from 'react';
import { Search, UserPlus, Mail } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import { CUSTOMERS } from '../data/mockData.js';

const tagPill = (t) => {
  const map = { vip: 'pill-purple', repeat: 'pill-blue', new: 'pill-green', refunded: 'pill-rose', pending: 'pill-amber' };
  return <span className={`pill ${map[t] || 'pill-gray'}`}>{t}</span>;
};

export default function Customers() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const rows = CUSTOMERS.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.email.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || c.tag === filter;
    return matchSearch && matchFilter;
  });

  const totalLTV = CUSTOMERS.reduce((s, c) => s + c.ltv, 0);
  const avgLTV = totalLTV / CUSTOMERS.length;

  return (
    <>
      <TopBar page="Customers" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <div className="page-title">Customer Relationship Management</div>
            <div className="page-subtitle">{CUSTOMERS.length} total customers synced across Gumroad, Etsy, & direct web.</div>
          </div>
          <button className="btn btn-primary btn-sm"><UserPlus size={14} /> Add Customer</button>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '20px' }}>
          <StatCard label="Total Customers" value={CUSTOMERS.length} trend="up" trendLabel="+14 this week" />
          <StatCard label="Average LTV" value={`$${avgLTV.toFixed(2)}`} trend="up" trendLabel="+$2.40 vs last week" />
          <StatCard label="VIP Members" value={CUSTOMERS.filter(c=>c.tag==='vip').length} trend="up" trendLabel="LTV > $40" />
          <StatCard label="Repeat Buyers" value={CUSTOMERS.filter(c=>c.orders > 1).length} trend="up" trendLabel="Multi-order profiles" />
        </div>

        <div className="panel">
          <div className="filter-bar">
            <div className="search-wrap" style={{ flex: 1, maxWidth: '280px' }}>
              <Search size={13} />
              <input className="input input-sm" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {['all','vip','repeat','new','refunded'].map(t => (
              <button key={t} onClick={() => setFilter(t)} className={`btn btn-xs ${filter===t ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize' }}>{t}</button>
            ))}
          </div>

          <table className="data-table">
            <thead>
              <tr><th>Customer ID</th><th>Name</th><th>Email</th><th>Orders</th><th>LTV</th><th>Last Order</th><th>Marketplace</th><th>Segment</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.id}>
                  <td className="td-mono">{c.id}</td>
                  <td className="td-primary">{c.name}</td>
                  <td className="td-mono fs-12">{c.email}</td>
                  <td className="td-mono">{c.orders}</td>
                  <td style={{ color: 'var(--emerald)', fontWeight: '700', fontFamily: 'var(--mono)' }}>${c.ltv.toFixed(2)}</td>
                  <td className="td-mono">{c.lastPurchase}</td>
                  <td><span className="tag">{c.marketplace}</span></td>
                  <td>{tagPill(c.tag)}</td>
                  <td>
                    <button className="btn btn-ghost btn-xs" style={{ gap: '4px' }} title="Send Email">
                      <Mail size={12} /> Contact
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
