import React from 'react';
import { PrintIcon } from './AccordionSection';
import DataTable from './DataTable';

export default function TableSection({ id, title, subtitle, data, columns, printProps, customStyle = {}, titleColor = '#374151', headerChildren }) {
  const { getPrintClass, handlePrint } = printProps;

  if (!data || data.length === 0) return null;

  return (
    <section className={`card table-section ${getPrintClass(id)}`} style={customStyle}>
      <div className="section-header">
        <div>
          <h3 className="chart-title" style={{ marginBottom: subtitle ? '0.5rem' : '0', color: titleColor }}>{title}</h3>
          {subtitle && <p className="kpi-subtext no-print" style={{ margin: 0 }}>{subtitle}</p>}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          {/* headerChildren permite injetar seletores (dropdowns) ao lado do botão de imprimir se necessário */}
          {headerChildren} 
          <button className="print-btn no-print" onClick={() => handlePrint(id)} style={headerChildren ? { height: '42px' } : {}}>
            <PrintIcon /> Imprimir
          </button>
        </div>
      </div>
      <DataTable data={data} columns={columns} />
    </section>
  );
}