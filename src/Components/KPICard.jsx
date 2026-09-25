import React from 'react';

export default function KPICard({ label, value, subtext, valueColor = 'var(--text-dark)', customStyle = {} }) {
  return (
    <div className="card kpi-card" style={customStyle}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value" style={{ color: valueColor }}>
        {value}
      </span>
      {subtext && (
        <span className="kpi-subtext" style={{ color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          {subtext}
        </span>
      )}
    </div>
  );
}