import React, { useState } from 'react';

export const PrintIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

export default function AccordionSection({ id, title, subtitle, printSection, isPrinting, handlePrint, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isThisPrinting = isPrinting && printSection === id;
  const getPrintClass = () => (isPrinting && printSection === id ? 'print-active' : (isPrinting ? 'no-print' : ''));

  
  return (
    <section className={`card table-section ${getPrintClass()}`}>
      <div 
        className="section-header" 
        style={{ cursor: 'pointer', marginBottom: isOpen || isThisPrinting ? '1.5rem' : '0', userSelect: 'none' }} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="chart-title" style={{ marginBottom: subtitle ? '0.5rem' : '0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ transform: isOpen || isThisPrinting ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', minWidth: '16px' }}>
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
            {title}
          </h3>
          {subtitle && <p className="kpi-subtext no-print" style={{ margin: 0, paddingLeft: '1.5rem' }}>{subtitle}</p>}
        </div>
        <button className="print-btn no-print" onClick={(e) => { e.stopPropagation(); handlePrint(id); }}>
          <PrintIcon /> Imprimir
        </button>
      </div>
      {(isOpen || isThisPrinting) && (
        <div className="accordion-content">
          {children}
        </div>
      )}
    </section>
  );
}