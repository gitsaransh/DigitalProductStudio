import React, { useState } from 'react';
import { Save, ShieldCheck, Key, RefreshCw } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';

export default function Settings() {
  const [config, setConfig] = useState({
    storeName: 'Digital Product Studio',
    supportEmail: 'support@digitalproductstudio.in',
    currency: 'USD',
    taxRate: '0',
    etsyKey: '••••••••••••••••••••••••••••••••',
    gumroadKey: '••••••••••••••••••••••••••••••••',
    lemonKey: '••••••••••••••••••••••••••••••••',
    resendKey: 're_1234567890abcdef',
  });

  const [saved, setSaved] = useState(false);

  const save = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <TopBar page="Settings" />
      <div className="page-content" style={{ maxWidth: '800px' }}>
        <div className="page-header">
          <div>
            <div className="page-title">Settings & Configuration</div>
            <div className="page-subtitle">Manage system API keys, support credentials, and marketplace sync parameters.</div>
          </div>
        </div>

        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* General Config */}
          <div className="panel">
            <div className="panel-header"><span className="panel-title">General Settings</span></div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Store Name</label>
                  <input className="input" value={config.storeName} onChange={e => setConfig(p=>({...p, storeName: e.target.value}))} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Support Email</label>
                  <input className="input" type="email" value={config.supportEmail} onChange={e => setConfig(p=>({...p, supportEmail: e.target.value}))} required />
                </div>
              </div>

              <div className="grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Default Store Currency</label>
                  <select className="select" style={{ height: '36px' }} value={config.currency} onChange={e => setConfig(p=>({...p, currency: e.target.value}))}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Sales Tax Rate (%)</label>
                  <input className="input" type="number" min="0" max="100" value={config.taxRate} onChange={e => setConfig(p=>({...p, taxRate: e.target.value}))} required />
                </div>
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Marketplace & Delivery Integration API Keys</span>
              <span className="pill pill-green"><ShieldCheck size={11} /> Secure</span>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Etsy Developer API Key', key: 'etsyKey' },
                { label: 'Gumroad API Token', key: 'gumroadKey' },
                { label: 'Lemon Squeezy API Token', key: 'lemonKey' },
                { label: 'Resend SMTP API Key', key: 'resendKey' },
              ].map(({ label, key }) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>{label}</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input className="input" type="password" value={config[key]} onChange={e => setConfig(p=>({...p, [key]: e.target.value}))} required />
                    <button type="button" className="btn btn-ghost btn-icon" title="Regenerate token"><RefreshCw size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '14px' }}>
            {saved && <span style={{ color: 'var(--emerald)', fontWeight: '700', fontSize: '13px' }}>✓ Settings Saved Successfully</span>}
            <button type="submit" className="btn btn-primary" style={{ gap: '8px' }}>
              <Save size={15} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
