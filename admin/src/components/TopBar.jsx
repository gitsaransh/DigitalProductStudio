import { Bell, ExternalLink, RefreshCw, Menu } from 'lucide-react';

export default function TopBar({ page, subtitle }) {
  const toggle = () => window.dispatchEvent(new Event('toggle-sidebar'));

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        <button
          onClick={toggle}
          className="btn btn-ghost btn-icon btn-sm menu-toggle"
          style={{ marginRight: '8px', display: 'none' }}
          title="Toggle Navigation"
        >
          <Menu size={16} />
        </button>
        <span className="topbar-breadcrumb-home">DPS Admin</span>
        <span className="topbar-breadcrumb-sep">/</span>
        <span className="topbar-breadcrumb-current">{page}</span>
        {subtitle && <>
          <span className="topbar-breadcrumb-sep">/</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{subtitle}</span>
        </>}
      </div>

      <div className="topbar-actions">
        <div className="topbar-system-status">
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }} />
          All Systems Operational
        </div>

        <button className="topbar-badge" title="Refresh">
          <RefreshCw size={14} />
        </button>

        <button className="topbar-badge" title="Notifications">
          <Bell size={14} />
          <span className="topbar-notif-dot" />
        </button>

        <a href="http://localhost:5175" target="_blank" rel="noopener noreferrer" className="topbar-badge" title="View public website">
          <ExternalLink size={14} />
        </a>
      </div>
    </header>
  );
}
