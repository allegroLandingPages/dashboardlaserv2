import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/helpers';
import AccordionSection, { PrintIcon } from '../AccordionSection';
import TableSection from '../TableSection';

export default function ProdutosTab({ salesData, printProps }) {
  const { 
    singleInputCode, setSingleInputCode, singleInputName, setSingleInputName, 
    handleSingleCodeBlur, handleSingleNameBlur, totalSold, searchedProductName, chartData,
    multiProducts, handleMultiProductChange, handleMultiCodeBlur, handleMultiNameBlur, multiProductsData,
    top10ProductsByRevenue, selectedCategory, setSelectedCategory, uniqueCategories, categoryRanking, topPerCategory 
  } = salesData;
  const { getPrintClass, handlePrint, isPrinting, printSection } = printProps;

  // Configuração da Tabela para reuso com TableSection
  const top10RevenueColumns = [
    { header: 'Rank', render: (_, i) => <span className="rank-badge">{i + 1}</span> },
    { header: 'Código', accessor: 'code' },
    { header: 'Produto', accessor: 'name', style: { fontWeight: 500 } },
    { header: 'Receita Gerada', render: (row) => formatCurrency(row.totalRevenue), style: { fontWeight: 'bold', color: '#dc2626' } },
    { header: 'Volume', accessor: 'totalQty' },
  ];

  const categoryColumns = [
    { header: 'Rank', render: (_, i) => <span className="rank-badge" style={{ backgroundColor: '#6b7280' }}>{i + 1}</span> },
    { header: 'Código', accessor: 'code' },
    { header: 'Produto', accessor: 'name', style: { fontWeight: 500 } },
    { header: 'Total Vendido', accessor: 'totalQty' },
    { header: 'Média/Dia', accessor: 'avgPerDay' },
  ];

  return (
    <>
      {/* SEÇÃO 1: PRODUTO ÚNICO */}
      <section className={getPrintClass('prod-unico')} style={{ marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'stretch' }}>
        
        {/* Painel Esquerdo (Inputs e KPI) */}
        <div className="card" style={{ flex: '1 1 300px', margin: 0, display: 'flex', flexDirection: 'column', justifyContent:'center' }}>
          <div className="no-print" style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Código do Produto</label>
              <input type="text" list="codes-datalist" placeholder="Ex: 1057" value={singleInputCode} onChange={e => setSingleInputCode(e.target.value)} onBlur={handleSingleCodeBlur} className="input-field" />
            </div>
            <div className="input-group">
              <label>Nome do Produto (SKU)</label>
              <input type="text" list="names-datalist" placeholder="Ex: TV..." value={singleInputName} onChange={e => setSingleInputName(e.target.value)} onBlur={handleSingleNameBlur} className="input-field" />
            </div>
          </div>
          <div style={{ textAlign: 'center', backgroundColor: '#fef2f2', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fca5a5' }}>
            <span className="kpi-label" style={{ color: '#b91c1c' }}>Total Vendido</span>
            <span className="kpi-value" style={{ color: '#dc2626', display: 'block', fontSize: '3rem' }}>{totalSold}</span>
            <span className="kpi-subtext" style={{ fontWeight: 'bold', color: '#111827', marginTop: '0.75rem', display: 'block' }}>{searchedProductName || 'Aguardando código'}</span>
          </div>
        </div>

        {/* Painel Direito (Gráfico) */}
        <div className="card" style={{ flex: '3 1 500px', margin: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="chart-title" style={{ margin: 0 }}>Evolução Diária do Produto</h3>
            <button className="print-btn no-print" onClick={() => handlePrint('prod-unico')}><PrintIcon /> Imprimir</button>
          </div>
          
          {chartData.length > 0 ? (
            <div style={{ flex: 1, minHeight: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="quantidade" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-chart" style={{ flex: 1, minHeight: '350px' }}>
              <p>Insira um código válido para gerar o gráfico.</p>
            </div>
          )}
        </div>
      </section>

      {/* SEÇÃO 2: 7 PRODUTOS (GRID DE CARTÕES) */}
      <section className={getPrintClass('prod-multi')} style={{ marginBottom: '3rem' }}>
        <div className="section-header">
          <div><h3 className="chart-title">Análise Individualizada (Até 7 Produtos)</h3></div>
          <button className="print-btn no-print" onClick={() => handlePrint('prod-multi')}><PrintIcon /> Imprimir Bloco</button>
        </div>

        {/* GRID DE CARTÕES DE ENTRADA (INPUTS) */}
        <div className="no-print" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
          gap: '1.5rem', 
          marginTop: '1.5rem', /* CORREÇÃO AQUI: Espaço adicionado para afastar do botão de imprimir */
          marginBottom: '2rem' 
        }}>
          {multiProducts.map((mp, idx) => (
            <div key={idx} className="card" style={{ 
              padding: '1.5rem 1.25rem', 
              margin: 0, 
              position: 'relative', 
              borderTop: '4px solid #fca5a5',
              borderTopLeftRadius: '16px', 
              borderTopRightRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* Badge Flutuante no topo do cartão */}
              <span className="rank-badge" style={{ 
                position: 'absolute', 
                top: '-16px', 
                left: '16px', 
                border: '4px solid var(--bg-app)', 
                width: '32px', 
                height: '32px', 
                fontSize: '0.85rem' 
              }}>
                {idx + 1}
              </span>
              
              <div className="input-group" style={{ marginTop: '0.5rem' }}>
                <label>Código</label>
                <input type="text" list="codes-datalist" value={mp.code} onChange={e => handleMultiProductChange(idx, 'code', e.target.value)} onBlur={() => handleMultiCodeBlur(idx)} className="input-field" placeholder="Ex: 1057" />
              </div>
              <div className="input-group">
                <label>Nome do Produto</label>
                <input type="text" list="names-datalist" value={mp.name} onChange={e => handleMultiProductChange(idx, 'name', e.target.value)} onBlur={() => handleMultiNameBlur(idx)} className="input-field" placeholder="Ex: TV..." />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Data Início</label>
                  <input type="date" value={mp.startDate} onChange={e => handleMultiProductChange(idx, 'startDate', e.target.value)} className="input-field" style={{ padding: '0.5rem' }} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Data Fim</label>
                  <input type="date" value={mp.endDate} onChange={e => handleMultiProductChange(idx, 'endDate', e.target.value)} className="input-field" style={{ padding: '0.5rem' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CARTÕES DE RESULTADO (GRÁFICOS DOS PRODUTOS SELECIONADOS) */}
        {multiProductsData.some(item => item !== null) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {multiProductsData.map((prodData, idx) => prodData && (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: 0 }}>
                
                {/* Info do Produto (KPI Interno) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderRadius: '12px', padding: '1rem 1.5rem' }}>
                  <div>
                    <span className="kpi-label" style={{ color: '#dc2626' }}>CÓD. {prodData.code}</span>
                    <span className="kpi-subtext" style={{ fontWeight: 'bold', display: 'block', color: '#111827', marginTop: '0.25rem' }}>{prodData.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="kpi-value" style={{ fontSize: '2rem', color: '#111827' }}>{prodData.total}</span>
                  </div>
                </div>
                
                {/* Gráfico do Produto */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '1rem', letterSpacing: '0.5px' }}>EVOLUÇÃO NO PERÍODO</h4>
                  {prodData.chartData.length > 0 ? (
                    <div style={{ flex: 1, minHeight: '180px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={prodData.chartData}>
                          <XAxis dataKey="data" hide />
                          <YAxis hide />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="quantidade" fill="#dc2626" radius={[4,4,0,0]} maxBarSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <div className="empty-chart" style={{ flex: 1, minHeight: '180px' }}>Sem vendas no período.</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SEÇÃO 3: TOP 10 FATURAMENTO */}
      <TableSection 
        id="top10-faturamento"
        title="Top 10 Produtos por Faturamento"
        data={top10ProductsByRevenue}
        columns={top10RevenueColumns}
        printProps={printProps}
      />

      {/* SEÇÃO 4: RANKING POR CATEGORIA */}
      <TableSection 
        id="rank-cat"
        title="Ranking por Categoria"
        data={selectedCategory ? categoryRanking : []}
        columns={categoryColumns}
        printProps={printProps}
        headerChildren={
          <select className="select-field no-print" style={{ width: '250px' }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Selecione uma categoria...</option>
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        }
      />

      {/* SEÇÃO 5: VENCEDOR POR CATEGORIA */}
      <AccordionSection id="top-cat" title="Produto Mais Vendido de Cada Categoria" printSection={printSection} isPrinting={isPrinting} handlePrint={handlePrint}>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Categoria</th><th>Código</th><th>Produto Vencedor</th><th>Volume Vendas</th></tr></thead>
            <tbody>
              {topPerCategory.map((cat) => (
                <tr key={cat.category}>
                  <td style={{ fontWeight: 'bold', color: '#dc2626' }}>{cat.category}</td>
                  <td>{cat.code}</td><td style={{ fontWeight: 500 }}>{cat.name}</td><td>{cat.totalQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccordionSection>
    </>
  );
}