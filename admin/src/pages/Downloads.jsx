import React, { useState } from 'react';
import { Search, Plus, ShieldCheck, Mail, RefreshCw } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import { DOWNLOADS } from '../data/mockData.js';

const statusPill = (s) => {
  const map = { active: 'pill-green', expired: 'pill-rose' };
  return <span className={`pill ${map[s] || 'pill-gray'}`}>{s}</span>;
};

export default function Downloads() {
  const [search, setSearch] = useState('');

  const rows = DOWNLOADS.filter(d => {
    const q = search.toLowerCase();
    return !q || d.product.toLowerCase().includes(q) || d.file.toLowerCase().includes(q);
  });

  return (
    <>
      <TopBar page="Downloads" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <div className="page-title">Download Link & File Delivery Manager</div>
            <div className="page-subtitle">Tracks downloadable assets, file sizes, access keys, and access counts.</div>
          </div>
          <button className="btn btn-primary btn-sm"><Plus size={14} /> Upload File</button>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '20px' }}>
          <StatCard label="Total Files Hosted" value={DOWNLOADS.length} trend="neutral" trendLabel="stored on secure CDN" />
          <StatCard label="Links Generated" value="14.2K" trend="up" trendLabel="+112 this week" />
          <StatCard label="Active Downloads" value={DOWNLOADS.filter(d=>d.status==='active').length} trend="neutral" trendLabel="serving live traffic" />
          <StatCard label="Bandwidth (MTD)" value="124 GB" trend="up" trendLabel="CDN analytics" />
        </div>

        <div className="panel">
          <div className="filter-bar">
            <div className="search-wrap" style={{ flex: 1, maxWidth: '320px' }}>
              <Search size={13} />
              <input className="input input-sm" placeholder="Search by file or product…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)' }}>Secure SHA-256 asset keys enabled</span>
          </div>

          <table className="data-table">
            <thead>
              <tr><th>Product</th><th>File Name</th><th>File Size</th><th>Lifetime Accesses</th><th>Link Expiry</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map(d => (
                <tr key={d.id}>
                  <td className="td-primary">{d.product}</td>
                  <td className="td-mono fs-12">{d.file}</td>
                  <td className="td-mono">{d.size}</td>
                  <td className="td-mono">{d.accesses.toLocaleString()}</td>
                  <td className="td-mono fs-12">{d.expiry || 'Permanent'}</td>
                  <td>{statusPill(d.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost btn-xs" style={{ gap: '4px' }} title="Generate new link">
                        <RefreshCw size={11} /> Regenerate
                      </button>
                    </div>
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
