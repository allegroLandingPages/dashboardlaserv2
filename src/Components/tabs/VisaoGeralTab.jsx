import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, Treemap, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/helpers';
import { PIE_COLORS, CATEGORY_COLORS } from '../../utils/constants';
import { PrintIcon } from '../AccordionSection';
import KPICard from '../KPICard';
import TableSection from '../TableSection';

const TreemapCustomContent = ({ x, y, width, height, index, name, value }) => (
  <g>
    <rect x={x} y={y} width={width} height={height} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} stroke="#fff" strokeWidth={2} />
    {width > 65 && height > 40 && (
      <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={11} fontWeight="bold">
        <tspan x={x + width / 2} dy="-0.5em">{name}</tspan>
        <tspan x={x + width / 2} dy="1.4em" fontSize={10} fontWeight="normal">{formatCurrency(value)}</tspan>
      </text>
    )}
  </g>
);

export default function VisaoGeralTab({ salesData, printProps }) {
  const { revenueOverview, categoryRevenueData, top10Products, overallEvolutionChartData } = salesData;
  const { getPrintClass, handlePrint } = printProps;

  if (revenueOverview.totalGeral === 0) return null;

  const top10Columns = [
    { header: 'Rank', render: (_, index) => <span className="rank-badge">{index + 1}</span> },
    { header: 'Código', accessor: 'code' },
    { header: 'Produto', accessor: 'name', style: { fontWeight: 500 } },
    { header: 'Total Vendido', accessor: 'totalQty' },
    { header: 'Média/Dia', accessor: 'avgPerDay' },
  ];

  return (
    <>
      <section className={`results-grid ${getPrintClass('macro')}`} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginBottom: '2rem' }}>
        
        <div className="no-print" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginBottom: '-1rem' }}>
          <button className="print-btn" onClick={() => handlePrint('macro')}><PrintIcon /> Imprimir Macro</button>
        </div>

        {/* 1. KPI TOTAL */}
        <div style={{ gridColumn: '1 / -1' }}>
          <KPICard 
            label="Faturamento Total (Bruto)" 
            value={formatCurrency(revenueOverview.totalGeral)}
            valueColor="#1f2937"
            customStyle={{ backgroundColor: '#fff7ed', borderColor: '#fdba74', padding: '2rem' }}
            subtext={
              <>
                Produtos: <span style={{ color: '#059669' }}>{formatCurrency(revenueOverview.totalProducts)}</span> |{' '}
                Serviços: <span style={{ color: '#ea580c' }}>{formatCurrency(revenueOverview.totalServices)}</span>
              </>
            }
          />
        </div>

        {/* 2. GRÁFICO: EVOLUÇÃO GERAL (FULL WIDTH) */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="chart-title">Evolução Geral de Faturamento (Rede)</h3>
          {overallEvolutionChartData.length > 0 ? (
            <div className="chart-container" style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overallEvolutionChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} formatter={(val) => formatCurrency(val)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="faturamento" name="Faturamento" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-chart" style={{ height: '350px' }}>Sem dados de evolução para o período.</div>
          )}
        </div>

        {/* 3. GRÁFICOS: PIE E TREEMAP (LADO A LADO) */}
        <div className="card">
          <h3 className="chart-title" style={{ textAlign: 'center' }}>Macro: Produtos vs Serviços</h3>
          <div className="chart-container" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueOverview.pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {revenueOverview.pieData.map((_, idx) => <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="chart-title" style={{ textAlign: 'center' }}>Faturamento por Categoria (Heatmap)</h3>
          <div className="chart-container" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <Treemap data={categoryRevenueData} dataKey="value" aspectRatio={4/3} stroke="#fff" content={<TreemapCustomContent />}>
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 4. TABELA: TOP 10 */}
      <TableSection 
        id="top10"
        title="Top 10 Produtos Mais Vendidos (Volume)"
        data={top10Products}
        columns={top10Columns}
        printProps={printProps}
      />
    </>
  );
}