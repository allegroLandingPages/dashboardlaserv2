import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/helpers';
import TableSection from '../TableSection';
import { PrintIcon } from '../AccordionSection';

export default function PrecificacaoTab({ salesData, printProps }) {
  const { 
    data, uniqueProductsData,
    pricingSearchCode, setPricingSearchCode,
    pricingSearchName, setPricingSearchName,
    pricingActiveCode, handlePricingCodeBlur, handlePricingNameBlur, clearPricingSearch,
    pricingAnalysisResult
  } = salesData;

  const { getPrintClass, handlePrint } = printProps;

  if (data.length === 0) {
    return <div className="card empty-chart"><p>Importe um arquivo de Vendas no cabeçalho para visualizar a análise de precificação.</p></div>;
  }

  const columns = [
    { header: 'Faixa de Preço (Unidade)', accessor: 'faixa', style: { fontWeight: 'bold' } },
    { header: 'Volume Vendido', accessor: 'volume' },
    { header: 'Receita Gerada', render: (row) => formatCurrency(row.receita), style: { color: '#059669', fontWeight: 'bold' } },
    { header: 'Desconto Médio Praticado', render: (row) => `${row.descontoMedio.toFixed(2)}%`, style: { color: '#dc2626', fontWeight: 'bold' } }
  ];

  return (
    <>
      {/* CARTÃO 1: BUSCA INDIVIDUAL */}
      <section className={`card ${getPrintClass('precificacao-busca')}`} style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="chart-title" style={{ margin: 0 }}>Análise de Elasticidade: Preço vs. Desconto</h3>
          <button onClick={clearPricingSearch} className="print-btn no-print" style={{ color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}>
            Limpar Busca
          </button>
        </div>

        <datalist id="pricing-codes">{uniqueProductsData.map(p => <option key={p.code} value={p.code} />)}</datalist>
        <datalist id="pricing-names">{uniqueProductsData.map(p => <option key={p.code} value={p.name} />)}</datalist>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: '1 1 200px' }}>
            <label>Código</label>
            <input 
              type="text" list="pricing-codes" value={pricingSearchCode} 
              onChange={e => setPricingSearchCode(e.target.value)} onBlur={handlePricingCodeBlur}
              className="input-field" placeholder="Ex: 1057" 
            />
          </div>
          <div className="input-group" style={{ flex: '4 1 400px' }}>
            <label>Descrição do Produto</label>
            <input 
              type="text" list="pricing-names" value={pricingSearchName} 
              onChange={e => setPricingSearchName(e.target.value)} onBlur={handlePricingNameBlur}
              className="input-field" placeholder="Buscar por nome..." 
            />
          </div>
        </div>
      </section>

      {/* ÁREA DE RESULTADO */}
      {!pricingActiveCode ? (
        <div className="card empty-chart"><p>Pesquise um produto acima para analisar as faixas de preço que mais vendem.</p></div>
      ) : pricingAnalysisResult?.notFound ? (
        <div className="card empty-chart"><p>Produto sem histórico de vendas no período filtrado.</p></div>
      ) : (
        <>
          {/* KPIs DE PRECIFICAÇÃO */}
          <section className="results-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="card kpi-card" style={{ margin: 0, backgroundColor: '#fef2f2', border: '1px solid #fca5a5' }}>
              <span className="kpi-label" style={{ color: '#b91c1c' }}>Preço Médio Praticado</span>
              <span className="kpi-value" style={{ color: '#dc2626' }}>{formatCurrency(pricingAnalysisResult.kpis.avgNetPrice)}</span>
              <span className="kpi-subtext" style={{ color: '#b91c1c', fontWeight: 600 }}>Custo Médio de Aquisição pelo Cliente</span>
            </div>
            <div className="card kpi-card" style={{ margin: 0 }}>
              <span className="kpi-label">Desconto Médio Concedido</span>
              <span className="kpi-value" style={{ color: '#ea580c' }}>{pricingAnalysisResult.kpis.avgDiscountGlobal.toFixed(2)}%</span>
              <span className="kpi-subtext">Isso representa {formatCurrency(pricingAnalysisResult.kpis.totalDiscount)} concedidos no total.</span>
            </div>
            <div className="card kpi-card" style={{ margin: 0 }}>
              <span className="kpi-label">Maior e Menor Preço de Venda</span>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>▲ {formatCurrency(pricingAnalysisResult.kpis.maxPrice)}</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6b7280' }}>▼ {formatCurrency(pricingAnalysisResult.kpis.minPrice)}</span>
              </div>
            </div>
          </section>

          {/* GRÁFICO EIXO DUPLO: BARRAS (VOLUME) + LINHA (DESCONTO) */}
          <section className={`card ${getPrintClass('precificacao-grafico')}`} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="chart-title" style={{ margin: 0 }}>Volume de Vendas vs. Desconto por Faixa de Preço</h3>
              <button className="print-btn no-print" onClick={() => handlePrint('precificacao-grafico')}><PrintIcon /> Imprimir Gráfico</button>
            </div>
            
            <div className="chart-container" style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={pricingAnalysisResult.chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="faixa" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  
                  {/* Eixo Esquerdo (Volume) */}
                  <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  {/* Eixo Direito (Desconto %) */}
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#dc2626', fontSize: 12 }} tickFormatter={(val) => `${val}%`} />
                  
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} />
                  
                  <Bar yAxisId="left" dataKey="volume" name="Unidades Vendidas" fill="#111827" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  <Line yAxisId="right" type="monotone" dataKey="descontoMedio" name="Desconto Aplicado (%)" stroke="#dc2626" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* TABELA DE FAIXAS */}
          <TableSection 
            id="precificacao-tabela"
            title="Detalhamento das Conversões por Faixa de Preço"
            data={pricingAnalysisResult.chartData}
            columns={columns}
            printProps={printProps}
          />
        </>
      )}
    </>
  );
}