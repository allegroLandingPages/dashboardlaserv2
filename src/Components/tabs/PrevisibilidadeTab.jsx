import React from 'react';
import { formatCurrency } from '../../utils/helpers';
import TableSection from '../TableSection';

export default function PrevisibilidadeTab({ salesData, printProps }) {
  const { predictiveTableData, predictiveKpis, inventoryData, data } = salesData;
  const { getPrintClass } = printProps;

  if (data.length === 0 || inventoryData.length === 0) {
    return (
      <div className="card empty-chart">
        <p>Importe os arquivos de <b>Vendas</b> e de <b>Estoque</b> no cabeçalho para gerar a análise preditiva.</p>
      </div>
    );
  }

  const columns = [
    { header: 'Curva', render: (row) => {
        let bgColor = '#f3f4f6', color = '#4b5563';
        if (row.abcClass === 'A') { bgColor = '#fef2f2'; color = '#dc2626'; }
        if (row.abcClass === 'B') { bgColor = '#fffbeb'; color = '#d97706'; }
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', fontWeight: 800, backgroundColor: bgColor, color: color }}>{row.abcClass}</span>;
      }
    },
    { header: 'Código', accessor: 'code' },
    { header: 'Produto', accessor: 'name', style: { fontWeight: 500 } },
    { header: 'Média/Dia', accessor: 'avgDailySales' },
    { header: 'Estoque Atual', accessor: 'stockQty', style: { fontWeight: 'bold' } },
    { header: 'Cobertura', render: (row) => {
        if (row.coverageDays === Infinity) return 'Sem Venda';
        return `${Math.round(row.coverageDays)} dias`;
      }, style: { fontWeight: 'bold' } 
    },
    { header: 'Status', render: (row) => {
        let bgColor = '#ecfdf5', color = '#059669';
        if (row.status === 'Risco de Ruptura') { bgColor = '#fef2f2'; color = '#dc2626'; }
        if (row.status === 'Excesso / Encalhado') { bgColor = '#f3f4f6'; color = '#6b7280'; }
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: bgColor, color: color }}>{row.status}</span>;
      }
    }
  ];

  return (
    <>
      <section className={getPrintClass('predictive-kpis')} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', margin: 0 }}>
          <span className="kpi-label" style={{ color: '#b91c1c' }}>Produtos em Risco de Ruptura (&lt; 3 dias)</span>
          <span className="kpi-value" style={{ color: '#dc2626', fontSize: '2.5rem' }}>{predictiveKpis?.totalRuptura || 0}</span>
          <span className="kpi-subtext" style={{ color: '#b91c1c', marginTop: '0.5rem', fontWeight: 600 }}>Exigem reposição imediata.</span>
        </div>
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', margin: 0 }}>
          <span className="kpi-label" style={{ color: '#4b5563' }}>Capital em Excesso / Encalhado (&gt; 90 dias)</span>
          <span className="kpi-value" style={{ color: '#111827', fontSize: '2.5rem' }}>{formatCurrency(predictiveKpis?.totalEncalhado || 0)}</span>
          <span className="kpi-subtext" style={{ color: '#6b7280', marginTop: '0.5rem', fontWeight: 600 }}>Custo imobilizado sem giro ágil.</span>
        </div>
      </section>

      <TableSection 
        id="predictive-table"
        title="Curva ABC e Cobertura de Estoque"
        subtitle="Analise a importância comercial (Curva A = Top 80% Receita) cruzada com a saúde do estoque disponível."
        data={predictiveTableData}
        columns={columns}
        printProps={printProps}
      />
    </>
  );
}