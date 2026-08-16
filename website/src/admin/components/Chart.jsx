import React from 'react';

// Inline SVG sparkline — no external deps
export function Sparkline({ data, color = 'var(--primary-light)', height = 36, width = 100 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="sparkline" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Vertical bar chart
export function BarChart({ data, colorFn, height = 80 }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="bar-chart-wrap" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="bar-item">
          <div
            className="bar-fill"
            style={{
              height: `${(d.value / max) * (height - 20)}px`,
              background: colorFn ? colorFn(d, i) : 'var(--primary)',
              opacity: 0.85,
            }}
          />
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
