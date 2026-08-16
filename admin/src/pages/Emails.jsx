import React, { useState } from 'react';
import { Search, Mail, Play, Pause, Edit } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import { EMAIL_TEMPLATES } from '../data/mockData.js';

const statusPill = (s) => {
  const map = { active: 'pill-green', paused: 'pill-amber', draft: 'pill-gray' };
  return <span className={`pill ${map[s] || 'pill-gray'}`}>{s}</span>;
};

export default function Emails() {
  const [search, setSearch] = useState('');
  const [templates, setTemplates] = useState(EMAIL_TEMPLATES);

  const toggleStatus = (id) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'active' ? 'paused' : 'active';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const rows = templates.filter(t => {
    const q = search.toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || t.trigger.toLowerCase().includes(q);
  });

  return (
    <>
      <TopBar page="Emails" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <div className="page-title">Email Templates & Automation</div>
            <div className="page-subtitle">Welcome workflows, transaction receipts, download links, and subscriber updates.</div>
          </div>
          <button className="btn btn-primary btn-sm"><Mail size={14} /> New Template</button>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '20px' }}>
          <StatCard label="Total Templates" value={templates.length} trend="neutral" trendLabel="operational triggers" />
          <StatCard label="Active Workflows" value={templates.filter(t=>t.status==='active').length} trend="up" trendLabel="running automatically" />
          <StatCard label="Average Open Rate" value="63.4%" trend="up" trendLabel="High engagement" />
          <StatCard label="Average Click Rate" value="35.1%" trend="up" trendLabel="Instant asset access" />
        </div>

        <div className="panel">
          <div className="filter-bar">
            <div className="search-wrap" style={{ flex: 1, maxWidth: '320px' }}>
              <Search size={13} />
              <input className="input input-sm" placeholder="Search templates…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)' }}>Powered by SMTP & SES Adapters</span>
          </div>

          <table className="data-table">
            <thead>
              <tr><th>Template Name</th><th>System Trigger</th><th>Status</th><th>Open Rate</th><th>Click Rate</th><th>Last Sent</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map(t => (
                <tr key={t.id}>
                  <td className="td-primary">
                    <div>{t.name}</div>
                    <div className="td-mono fs-11">{t.id}</div>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{t.trigger}</td>
                  <td>{statusPill(t.status)}</td>
                  <td className="td-mono">{t.opens || '—'}</td>
                  <td className="td-mono">{t.clicks || '—'}</td>
                  <td className="td-mono fs-12">{t.lastSent || 'Never'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => toggleStatus(t.id)}
                        className={`btn btn-icon btn-xs ${t.status === 'active' ? 'btn-ghost' : 'btn-success'}`}
                        title={t.status === 'active' ? 'Pause Trigger' : 'Activate Trigger'}
                      >
                        {t.status === 'active' ? <Pause size={11} /> : <Play size={11} />}
                      </button>
                      <button className="btn btn-ghost btn-icon btn-xs" title="Edit Template"><Edit size={11} /></button>
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
