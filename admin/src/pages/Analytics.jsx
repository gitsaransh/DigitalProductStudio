import React from 'react';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import { REVENUE_TREND, MARKETPLACE_SPLIT, PRODUCTS, ORDERS } from '../data/mockData.js';

export default function Analytics() {
  const topByRev = [...PRODUCTS].filter(p => p.price && p.downloads).sort((a,b) => b.price*b.downloads - a.price*a.downloads).slice(0,5);
  const maxRev = Math.max(...REVENUE_TREND.map(r => r.revenue));

  return (
    <>
      <TopBar page="Analytics" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <div className="page-title">Analytics</div>
            <div className="page-subtitle">Revenue, downloads, and conversion data across all channels.</div>
          </div>
          <select className="select">
            <option>Last 14 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>

        <div className="stat-grid">
          <StatCard label="Revenue (14d)" value="$3,468.12" trend="up" trendLabel="+22.1% vs prior" />
          <StatCard label="Avg Order Value" value="$19.43" trend="up" trendLabel="+$1.20 vs prior" />
          <StatCard label="Conversion Rate" value="3.8%" trend="up" trendLabel="+0.4% vs prior" />
          <StatCard label="Refund Rate" value="1.2%" trend="down" trendLabel="Below 3% target ✓" />
        </div>

        {/* Revenue Chart */}
        <div className="panel mb-20" style={{ marginBottom: '20px' }}>
          <div className="panel-header">
            <span className="panel-title">Daily Revenue — Last 14 Days</span>
            <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Total: $3,468.12</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
              {REVENUE_TREND.map((r, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      width: '100%',
                      background: `linear-gradient(180deg, var(--primary), rgba(99,102,241,0.5))`,
                      borderRadius: '4px 4px 0 0',
                      height: `${(r.revenue / maxRev) * 96}px`,
                      transition: 'height 0.4s',
                      opacity: i === REVENUE_TREND.length - 1 ? 0.6 : 0.9,
                    }}
                    title={`${r.day}: $${r.revenue}`}
                  />
                  {i % 3 === 0 && <span style={{ fontSize: '9px', color: 'var(--text-sub)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>{r.day.replace('202',''+'').slice(-5)}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Marketplace split */}
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Revenue by Marketplace</span></div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {MARKETPLACE_SPLIT.map(m => (
                <div key={m.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{m.name}</span>
                    <span style={{ color: 'white', fontWeight: '700', fontFamily: 'var(--mono)' }}>${m.revenue} <span style={{ color: 'var(--text-sub)', fontWeight: '400' }}>({m.pct}%)</span></span>
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-fill" style={{ width: `${m.pct}%`, background: 'var(--primary)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top products by revenue */}
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Top Products by Est. Revenue</span></div>
            <table className="data-table">
              <thead><tr><th>Product</th><th>Price</th><th>Est. Rev</th></tr></thead>
              <tbody>
                {topByRev.map(p => (
                  <tr key={p.id}>
                    <td className="td-primary truncate" style={{ maxWidth: '200px' }}>{p.title}</td>
                    <td className="td-mono">${p.price}</td>
                    <td style={{ color: 'var(--emerald)', fontWeight: '700', fontFamily: 'var(--mono)' }}>
                      ${(p.price * p.downloads / 10).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="panel mt-20">
          <div className="panel-header"><span className="panel-title">Conversion Funnel (Estimated)</span></div>
          <div className="panel-body" style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
            {[
              { label: 'Visitors', value: '18,400', pct: 100, color: 'var(--primary)' },
              { label: 'Product Views', value: '6,200', pct: 34, color: 'var(--cyan)' },
              { label: 'Add to Cart', value: '1,840', pct: 10, color: 'var(--amber)' },
              { label: 'Purchases', value: '698', pct: 3.8, color: 'var(--emerald)' },
            ].map((step, i) => (
              <div key={step.label} style={{ flex: 1, textAlign: 'center', padding: '16px 12px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: '22px', fontWeight: '900', color: 'white', fontFamily: 'var(--mono)' }}>{step.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '4px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{step.label}</div>
                <div className="progress-wrap">
                  <div className="progress-fill" style={{ width: `${step.pct}%`, background: step.color }} />
                </div>
                <div style={{ fontSize: '11px', color: step.color, fontWeight: '700', marginTop: '6px' }}>{step.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
