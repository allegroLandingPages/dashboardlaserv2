import React from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { formatCurrency } from '../../utils/helpers';
import { CATEGORY_COLORS } from '../../utils/constants';
import AccordionSection, { PrintIcon } from '../AccordionSection';

export default function LojasTab({ salesData, printProps }) {
  const {
    evolutionScope, setEvolutionScope, evolutionSelection, setEvolutionSelection, uniqueStores, uniqueCities,
    evolutionTotalRevenue, evolutionChartData, multiStores, handleMultiStoreChange, comparativeStoreEvolution,
    selectedStore, setSelectedStore, topProductsLimit, setTopProductsLimit, storeProductsByQty, storeProductsByRevenue,
    topStorePerCategory, storePerformance, cityRanking
  } = salesData;
  const { getPrintClass, handlePrint, isPrinting, printSection } = printProps;

  return (
    <>
      <section className={`card table-section ${getPrintClass('evolucao-loja-cidade')}`}>
        <div className="section-header">
          <div>
            <h3 className="chart-title" style={{ marginBottom: '0.5rem' }}>Evolução de Faturamento Individual</h3>
            <p className="kpi-subtext no-print" style={{ margin: 0 }}>Acompanhe o faturamento diário segmentando por Loja ou Cidade específica.</p>
          </div>
          <button className="print-btn no-print" onClick={() => handlePrint('evolucao-loja-cidade')}><PrintIcon /> Imprimir Gráfico</button>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <select className="select-field" style={{ width: '200px' }} value={evolutionScope} onChange={e => { setEvolutionScope(e.target.value); setEvolutionSelection(''); }}>
            <option value="loja">Loja Específica</option><option value="cidade">Cidade Inteira</option>
          </select>
          <select className="select-field" style={{ width: '300px' }} value={evolutionSelection} onChange={e => setEvolutionSelection(e.target.value)}>
            <option value="">Selecione...</option>
            {evolutionScope === 'loja' ? uniqueStores.map(i => <option key={i} value={i}>{i}</option>) : uniqueCities.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        {/* MENSAGEM CLARA QUANDO NÃO HÁ SELEÇÃO */}
        {!evolutionSelection ? (
          <div className="empty-chart">Selecione uma Loja ou Cidade no filtro acima para visualizar a evolução.</div>
        ) : (
          <>
            <div className="kpi-card" style={{ alignSelf: 'flex-start', margin: '0 auto 1.5rem auto', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '1.5rem', borderRadius: '12px' }}>
              <span className="kpi-label" style={{ color: '#b91c1c' }}>Faturamento Total ({evolutionScope})</span>
              <span className="kpi-value" style={{ fontSize: '2.5rem', color: '#dc2626' }}>{formatCurrency(evolutionTotalRevenue)}</span>
            </div>
            <div className="chart-container" style={{ height: '350px' }}>
              {evolutionChartData.length > 0 ? (
                // CORREÇÃO AQUI: width e height explícitos no ResponsiveContainer
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={evolutionChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} formatter={(val) => formatCurrency(val)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="faturamento" name="Faturamento" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="empty-chart">Sem dados de faturamento para o período.</div>}
            </div>
          </>
        )}
      </section>

      <section className={`card table-section ${getPrintClass('comparativo-lojas')}`}>
        <div className="section-header">
          <div><h3 className="chart-title" style={{ marginBottom: '0.5rem' }}>Comparativo Diário Customizado</h3></div>
          <button className="print-btn no-print" onClick={() => handlePrint('comparativo-lojas')}><PrintIcon /> Imprimir</button>
        </div>
        <div className="no-print" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginBottom: '2rem' }}>
          {multiStores.map((store, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <span style={{ fontWeight: 'bold' }}>{idx + 1}.</span>
               <select className="select-field" value={store} onChange={e => handleMultiStoreChange(idx, e.target.value)} style={{ maxWidth: '200px' }}>
                 <option value="">Selecione uma loja...</option>
                 {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>
          ))}
        </div>
        
        {comparativeStoreEvolution.lines.length > 0 ? (
          <div className="chart-container" style={{ height: '400px' }}>
            {/* CORREÇÃO AQUI TAMBÉM */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparativeStoreEvolution.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                <Tooltip cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '3 3' }} formatter={(val) => formatCurrency(val)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                {comparativeStoreEvolution.lines.map((line, idx) => (
                  <Line key={line} type="monotone" dataKey={line} stroke={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : <div className="empty-chart">Selecione pelo menos uma loja para comparar.</div>}
      </section>

      <section className={`card table-section ${getPrintClass('top-loja')}`}>
        <div className="category-header">
          <h3 className="chart-title">Análise da Loja</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <select className="select-field no-print" style={{ width: '250px' }} value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}>
              <option value="">Selecione uma loja...</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="number" min="1" max="30" value={topProductsLimit} onChange={e => setTopProductsLimit(Math.min(30, Math.max(1, Number(e.target.value))))} className="input-field no-print" style={{ width: '80px' }} />
            <button className="print-btn no-print" onClick={() => handlePrint('top-loja')}><PrintIcon /> Imprimir</button>
          </div>
        </div>

        {selectedStore && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h4 style={{ color: '#4b5563', marginBottom: '1rem' }}>Top Volume</h4>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Rank</th><th>Código</th><th>Produto</th><th>Volume</th><th>Receita</th></tr></thead>
                  <tbody>
                    {storeProductsByQty.map((p, i) => (
                      <tr key={p.code}>
                        <td><span className="rank-badge" style={{  }}>{i + 1}</span></td>
                        <td>{p.code}</td><td style={{ fontWeight: 500 }}>{p.name}</td><td>{p.totalQty}</td><td style={{ color: '#059669' }}>{formatCurrency(p.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#4b5563', marginBottom: '1rem' }}>Top Faturamento</h4>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Rank</th><th>Código</th><th>Produto</th><th>Receita</th><th>Volume</th></tr></thead>
                  <tbody>
                    {storeProductsByRevenue.map((p, i) => (
                      <tr key={p.code}>
                        <td><span className="rank-badge" style={{}}>{i + 1}</span></td>
                        <td>{p.code}</td><td style={{ fontWeight: 500 }}>{p.name}</td><td style={{ fontWeight: 'bold', color: '#dc2626' }}>{formatCurrency(p.totalRevenue)}</td><td>{p.totalQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>

      <AccordionSection id="loja-destaque-cat" title="Loja Destaque por Categoria" printSection={printSection} isPrinting={isPrinting} handlePrint={handlePrint}>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Categoria</th><th>Loja Líder</th><th>Volume</th><th>Receita</th></tr></thead>
            <tbody>
              {topStorePerCategory.map((cat) => (
                <tr key={cat.category}>
                  <td style={{ fontWeight: 'bold', color: '#dc2626' }}>{cat.category}</td>
                  <td style={{ fontWeight: 500 }}>{cat.store}</td><td>{cat.totalQty}</td><td style={{ color: '#059669' }}>{formatCurrency(cat.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccordionSection>

      <AccordionSection id="desempenho-lojas" title="Desempenho Geral por Estabelecimento" printSection={printSection} isPrinting={isPrinting} handlePrint={handlePrint}>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Loja</th><th>Volume</th><th>Receita</th><th>Top Produto</th></tr></thead>
            <tbody>
              {storePerformance.map((loja) => (
                <tr key={loja.store}>
                  <td style={{ fontWeight: 'bold', color: '#dc2626' }}>{loja.store}</td>
                  <td>{loja.totalQty}</td><td style={{ fontWeight: 500, color: '#059669' }}>{formatCurrency(loja.totalRevenue)}</td>
                  <td>{loja.topProductName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccordionSection>

      <section className={`card table-section ${getPrintClass('ranking-cidades')}`}>
        <div className="section-header">
          <h3 className="chart-title">Cidades com Maior Volume</h3>
          <button className="print-btn no-print" onClick={() => handlePrint('ranking-cidades')}><PrintIcon /> Imprimir</button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Rank</th><th>Cidade</th><th>Total Vendido (Unidades)</th></tr></thead>
            <tbody>
              {cityRanking.map((cidade, i) => (
                <tr key={cidade.city}>
                  <td><span className="rank-badge" style={{ }}>{i + 1}</span></td>
                  <td style={{ fontWeight: 500 }}>{cidade.city}</td><td>{cidade.totalQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}