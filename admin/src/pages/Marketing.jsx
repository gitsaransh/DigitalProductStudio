import React, { useState } from 'react';
import { Tag, Sparkles, Plus, Edit2, Play, Pause } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import { PROMOTIONS } from '../data/mockData.js';

const statusPill = (s) => {
  const map = { active: 'pill-green', expired: 'pill-rose', paused: 'pill-amber' };
  return <span className={`pill ${map[s] || 'pill-gray'}`}>{s}</span>;
};

export default function Marketing() {
  const [promotions, setPromotions] = useState(PROMOTIONS);

  const toggleStatus = (id) => {
    setPromotions(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'active' ? 'paused' : 'active';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  return (
    <>
      <TopBar page="Marketing" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <div className="page-title">Marketing & Promotions</div>
            <div className="page-subtitle">Manage coupon codes, category bundles, and VIP incentives.</div>
          </div>
          <button className="btn btn-primary btn-sm"><Plus size={14} /> Create Discount</button>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
          <StatCard label="Active Coupons" value={promotions.filter(p=>p.status==='active').length} trend="neutral" trendLabel="applied at checkout" />
          <StatCard label="Total Coupon Uses" value={promotions.reduce((s,p)=>s+p.uses, 0)} trend="up" trendLabel="+42 this week" />
          <StatCard label="Active Bundles" value={3} trend="up" trendLabel="40-50% savings" />
        </div>

        <div className="grid-2">
          {/* Coupon Code Manager */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Coupon Codes</span>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Name / Code</th><th>Discount</th><th>Uses</th><th>Status</th><th>Expires</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {promotions.map(p => (
                  <tr key={p.id}>
                    <td className="td-primary">
                      <div>{p.name}</div>
                      <div className="td-mono fs-11" style={{ letterSpacing: '0.05em', color: 'var(--primary-light)', fontWeight: '700' }}>{p.code}</div>
                    </td>
                    <td className="td-mono" style={{ color: 'var(--emerald)', fontWeight: '700' }}>{p.discount}</td>
                    <td className="td-mono">{p.uses}{p.limit ? ` / ${p.limit}` : ''}</td>
                    <td>{statusPill(p.status)}</td>
                    <td className="td-mono fs-12">{p.expires || 'Never'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => toggleStatus(p.id)}
                          className={`btn btn-icon btn-xs ${p.status === 'active' ? 'btn-ghost' : 'btn-success'}`}
                          title={p.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {p.status === 'active' ? <Pause size={11} /> : <Play size={11} />}
                        </button>
                        <button className="btn btn-ghost btn-icon btn-xs" title="Edit"><Edit2 size={11} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Tiers & Bundles Preview */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Product Packaging Tiers</span>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { name: 'Tier 1: Single Products', price: '$9 - $29', desc: 'Focus tools, specific planners, spreadsheets or guides.', tag: '100+ assets' },
                { name: 'Tier 2: Category Bundles', price: '$49 - $99', desc: 'Curated discipline packs. (e.g. All Finance Templates).', tag: '40-50% savings' },
                { name: 'Tier 3: Professional Packs', price: '$149', desc: 'Enterprise-grade frameworks (e.g. Business Owner Toolkit).', tag: 'High-margin PMO/BA' },
                { name: 'Tier 4: Creator Membership', price: '$9/mo or $99/yr', desc: 'VIP access pass for recurring template downloads.', tag: 'Predictable MRR' },
              ].map(tier => (
                <div key={tier.name} className="glass" style={{ padding: '16px 20px', borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontWeight: '800', color: 'white', fontSize: '13.5px' }}>{tier.name}</div>
                    <span className="badge badge-emerald" style={{ fontSize: '11px', fontFamily: 'var(--mono)' }}>{tier.price}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>{tier.desc}</p>
                  <span className="tag" style={{ marginTop: '10px', display: 'inline-flex' }}>{tier.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
