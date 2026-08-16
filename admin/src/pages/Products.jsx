import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Globe } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import { PRODUCTS } from '../data/mockData.js';

const statusPill = (s) => {
  const map = { published: 'pill-green', draft: 'pill-gray', review: 'pill-amber' };
  return <span className={`pill ${map[s] || 'pill-gray'}`}>{s}</span>;
};

const scorePill = (n) => {
  const c = n >= 90 ? 'pill-green' : n >= 75 ? 'pill-amber' : 'pill-rose';
  return <span className={`pill ${c}`}>{n}</span>;
};

export default function Products() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const rows = PRODUCTS.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <TopBar page="Products" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <div className="page-title">Product Catalog</div>
            <div className="page-subtitle">{PRODUCTS.length} products · {PRODUCTS.filter(p=>p.status==='published').length} published · {PRODUCTS.filter(p=>p.status==='draft').length} drafts</div>
          </div>
          <button className="btn btn-primary btn-sm"><Plus size={14} /> New Product</button>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '20px' }}>
          <StatCard label="Published" value={PRODUCTS.filter(p=>p.status==='published').length} trend="up" trendLabel="active listings" />
          <StatCard label="Drafts" value={PRODUCTS.filter(p=>p.status==='draft').length} trend="neutral" trendLabel="awaiting review" />
          <StatCard label="In Review" value={PRODUCTS.filter(p=>p.status==='review').length} trend="neutral" trendLabel="QA pipeline" />
          <StatCard label="Avg QA Score" value="88.1" trend="up" trendLabel="+2.4 vs last week" />
        </div>

        <div className="panel">
          <div className="filter-bar">
            <div className="search-wrap" style={{ flex: 1, maxWidth: '320px' }}>
              <Search size={13} />
              <input className="input input-sm" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {['all','published','draft','review'].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`btn btn-xs ${filter===s ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize' }}>{s}</button>
            ))}
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Score</th>
                <th>Downloads</th>
                <th>Rating</th>
                <th>Langs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.id}>
                  <td className="td-primary" style={{ maxWidth: '220px' }}>
                    <div className="truncate">{p.title}</div>
                    <div className="td-mono fs-11">{p.id}</div>
                  </td>
                  <td><span className="tag">{p.category}</span></td>
                  <td style={{ color: 'var(--emerald)', fontWeight: '700', fontFamily: 'var(--mono)' }}>${p.price}</td>
                  <td>{statusPill(p.status)}</td>
                  <td>{scorePill(p.score)}</td>
                  <td className="td-mono">{p.downloads.toLocaleString()}</td>
                  <td style={{ color: 'var(--amber)', fontWeight: '700' }}>{p.rating ? `${p.rating}★` : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {p.langs.map(l => <span key={l} className="tag">{l}</span>)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost btn-icon btn-xs" title="Edit"><Edit2 size={12} /></button>
                      <button className="btn btn-danger btn-icon btn-xs" title="Delete"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-title">No products found</div></div>
          )}
        </div>
      </div>
    </>
  );
}
