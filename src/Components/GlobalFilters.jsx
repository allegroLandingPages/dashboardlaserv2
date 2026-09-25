import React from 'react';

export default function GlobalFilters({ salesData }) {
  const { handleFileUpload, handleInventoryUpload, startDate, setStartDate, endDate, setEndDate, dateError } = salesData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <div className="top-filters no-print">
        <div className="date-inputs">
          <svg width="18" height="18" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" style={{ border: 'none', background: 'transparent', padding: '0.2rem' }} />
          <span style={{ color: '#d1d5db' }}>até</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" style={{ border: 'none', background: 'transparent', padding: '0.2rem' }} />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <label className="file-upload-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Vendas
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </label>
          <label className="file-upload-btn" style={{ backgroundColor: '#111827' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Estoque
            <input type="file" accept=".csv" onChange={handleInventoryUpload} />
          </label>
        </div>
      </div>
      {dateError && <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>{dateError}</span>}
    </div>
  );
}