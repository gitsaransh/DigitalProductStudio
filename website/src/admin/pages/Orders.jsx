import React, { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import { ORDERS } from '../data/mockData.js';

const statusPill = (s) => {
  const map = { delivered: 'pill-green', pending: 'pill-amber', refunded: 'pill-rose' };
  return <span className={`pill ${map[s] || 'pill-gray'}`}>{s}</span>;
};

const mktPill = (m) => {
  const map = { Etsy: 'pill-amber', Gumroad: 'pill-blue', Direct: 'pill-green', 'Creative Market': 'pill-purple' };
  return <span className={`pill ${map[m] || 'pill-gray'}`}>{m}</span>;
};

export default function Orders() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const rows = ORDERS.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.buyer.toLowerCase().includes(q) || o.product.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const revenue = ORDERS.filter(o => o.status !== 'refunded').reduce((s, o) => s + o.amount, 0);
  const refunds = ORDERS.filter(o => o.status === 'refunded').reduce((s, o) => s + o.amount, 0);

  return (
    <>
      <TopBar page="Orders" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <div className="page-title">Order Log</div>
            <div className="page-subtitle">{ORDERS.length} total orders · synced across all marketplaces</div>
          </div>
          <button className="btn btn-ghost btn-sm"><RefreshCw size={13} /> Sync Now</button>
        </div>

        <div className="stat-grid">
          <StatCard label="Total Revenue" value={`$${revenue.toFixed(2)}`} trend="up" trendLabel="net after refunds" />
          <StatCard label="Orders" value={ORDERS.length} trend="up" trendLabel="+2 today" />
          <StatCard label="Delivered" value={ORDERS.filter(o=>o.status==='delivered').length} trend="up" trendLabel="instant downloads" />
          <StatCard label="Refunds" value={`$${refunds.toFixed(2)}`} trend="down" trendLabel={`${ORDERS.filter(o=>o.status==='refunded').length} orders`} />
        </div>

        <div className="panel">
          <div className="filter-bar">
            <div className="search-wrap" style={{ flex: 1, maxWidth: '280px' }}>
              <Search size={13} />
              <input className="input input-sm" placeholder="Order ID, buyer, product…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {['all','delivered','pending','refunded'].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`btn btn-xs ${filter===s ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize' }}>{s}</button>
            ))}
          </div>

          <table className="data-table">
            <thead>
              <tr><th>Order ID</th><th>Product</th><th>Buyer</th><th>Marketplace</th><th>Amount</th><th>Date</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {rows.map(o => (
                <tr key={o.id}>
                  <td className="td-mono">{o.id}</td>
                  <td className="td-primary" style={{ maxWidth: '180px' }}><div className="truncate">{o.product}</div></td>
                  <td className="td-mono fs-12">{o.buyer}</td>
                  <td>{mktPill(o.marketplace)}</td>
                  <td style={{ color: 'var(--emerald)', fontWeight: '700', fontFamily: 'var(--mono)' }}>${o.amount}</td>
                  <td className="td-mono">{o.date}</td>
                  <td>{statusPill(o.status)}</td>
                  <td>
                    {o.status === 'pending' && <button className="btn btn-success btn-xs">Resend</button>}
                    {o.status === 'delivered' && <button className="btn btn-ghost btn-xs">Receipt</button>}
                    {o.status === 'refunded' && <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Processed</span>}
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
