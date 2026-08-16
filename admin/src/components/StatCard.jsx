import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ label, value, trend, trendLabel, icon, iconBg, iconColor }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendClass = trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-neutral';

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {icon && (
          <div className="stat-card-icon" style={{ background: iconBg }}>
            <span style={{ color: iconColor }}>{icon}</span>
          </div>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      {trendLabel && (
        <div className={`stat-card-trend ${trendClass}`}>
          <TrendIcon size={12} />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
