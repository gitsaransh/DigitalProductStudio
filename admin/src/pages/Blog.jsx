import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import { BLOG_POSTS } from '../data/mockData.js';

const statusPill = (s) => {
  const map = { published: 'pill-green', draft: 'pill-gray' };
  return <span className={`pill ${map[s] || 'pill-gray'}`}>{s}</span>;
};

const scorePill = (n) => {
  const c = n >= 90 ? 'pill-green' : n >= 75 ? 'pill-amber' : 'pill-rose';
  return <span className={`pill ${c}`}>{n}</span>;
};

export default function Blog() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const rows = BLOG_POSTS.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <TopBar page="Blog" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <div className="page-title">Blog Post Manager</div>
            <div className="page-subtitle">Publish guides, tutorials and SEO optimized content for creators.</div>
          </div>
          <button className="btn btn-primary btn-sm"><Plus size={14} /> New Post</button>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '20px' }}>
          <StatCard label="Total Posts" value={BLOG_POSTS.length} trend="neutral" trendLabel="content inventory" />
          <StatCard label="Published" value={BLOG_POSTS.filter(p=>p.status==='published').length} trend="up" trendLabel="live on website" />
          <StatCard label="Total Blog Views" value="9.5K" trend="up" trendLabel="+1.2K this week" />
          <StatCard label="Avg SEO Score" value="86.1" trend="up" trendLabel="Etsy & Google audits" />
        </div>

        <div className="panel">
          <div className="filter-bar">
            <div className="search-wrap" style={{ flex: 1, maxWidth: '280px' }}>
              <Search size={13} />
              <input className="input input-sm" placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {['all','published','draft'].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`btn btn-xs ${filter===s ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize' }}>{s}</button>
            ))}
          </div>

          <table className="data-table">
            <thead>
              <tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th>Views</th><th>SEO Score</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.id}>
                  <td className="td-primary" style={{ maxWidth: '320px' }}>
                    <div className="truncate">{p.title}</div>
                    <div className="td-mono fs-11">{p.id}</div>
                  </td>
                  <td><span className="tag">{p.category}</span></td>
                  <td>{statusPill(p.status)}</td>
                  <td className="td-mono fs-12">{p.date || 'Draft'}</td>
                  <td className="td-mono">{p.views.toLocaleString()}</td>
                  <td>{scorePill(p.seoScore)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost btn-icon btn-xs" title="Preview"><Eye size={12} /></button>
                      <button className="btn btn-ghost btn-icon btn-xs" title="Edit"><Edit2 size={12} /></button>
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
