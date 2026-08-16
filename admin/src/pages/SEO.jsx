import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import { PRODUCTS } from '../data/mockData.js';

const scorePill = (n) => {
  const c = n >= 90 ? 'pill-green' : n >= 80 ? 'pill-amber' : 'pill-rose';
  return <span className={`pill ${c}`} style={{ fontFamily: 'var(--mono)' }}>{n}%</span>;
};

export default function SEO() {
  const [search, setSearch] = useState('');

  const rows = PRODUCTS.map(p => {
    // Mocking SEO rules based on real data attributes
    const errors = [];
    if (p.title.length > 140) errors.push('Title too long (>140 chars)');
    if (p.title.length < 40) errors.push('Title too short (<40 chars)');
    if (!p.langs || p.langs.length < 2) errors.push('Missing localization (EN only)');
    if (p.score < 80) errors.push('Quality Score under benchmark');

    return {
      ...p,
      seoErrors: errors,
      passed: errors.length === 0,
    };
  }).filter(p => {
    const q = search.toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  const totalPassed = rows.filter(r => r.passed).length;
  const avgScore = rows.reduce((s, r) => s + r.score, 0) / rows.length;

  return (
    <>
      <TopBar page="SEO" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <div className="page-title">SEO Audit & Marketplace Alignment</div>
            <div className="page-subtitle">Checks title lengths, tags, translations, and quality thresholds before publishing.</div>
          </div>
          <button className="btn btn-ghost btn-sm"><ShieldAlert size={14} /> Full Re-Audit</button>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '20px' }}>
          <StatCard label="SEO Health Index" value={`${avgScore.toFixed(1)}%`} trend="up" trendLabel="+1.4% vs audit average" />
          <StatCard label="Fully Compliant" value={`${totalPassed} / ${rows.length}`} trend="up" trendLabel="Passed all checks" />
          <StatCard label="Etsy Chars Audit" value="Passed" trend="neutral" trendLabel="Title < 140 characters" />
          <StatCard label="Missing Tags" value="0" trend="down" trendLabel="All listings have 13 tags" />
        </div>

        <div className="panel">
          <div className="filter-bar">
            <div className="search-wrap" style={{ flex: 1, maxWidth: '320px' }}>
              <Search size={13} />
              <input className="input input-sm" placeholder="Search audit logs…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)' }}>Real-time database sync</span>
          </div>

          <table className="data-table">
            <thead>
              <tr><th>Product</th><th>Marketplace Alignment</th><th>Audit Result</th><th>SEO Rating</th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="td-primary" style={{ maxWidth: '280px' }}>
                    <div className="truncate">{r.title}</div>
                    <div className="td-mono fs-11">{r.id}</div>
                  </td>
                  <td>
                    {r.seoErrors.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {r.seoErrors.map((err, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--rose)' }}>
                            <AlertCircle size={12} /> {err}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--emerald)' }}>
                        <CheckCircle2 size={13} /> 100% compliant with Etsy & Gumroad guidelines
                      </div>
                    )}
                  </td>
                  <td>
                    {r.passed ? (
                      <span className="pill pill-green">Passed</span>
                    ) : (
                      <span className="pill pill-rose">Needs Optimization</span>
                    )}
                  </td>
                  <td>{scorePill(r.score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
