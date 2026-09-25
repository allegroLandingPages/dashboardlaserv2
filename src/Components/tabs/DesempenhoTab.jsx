import React from 'react';
import { formatCurrency } from '../../utils/helpers';
import { PrintIcon } from '../AccordionSection';

export default function DesempenhoTab({ salesData, printProps }) {
  const { 
    data, uniqueStores,
    globalTarget, setGlobalTarget, globalPerformanceData,
    storeTargets, handleStoreTargetChange, storePerformanceComparisons 
  } = salesData;
  const { getPrintClass, handlePrint } = printProps;

  if (data.length === 0) {
    return <div className="card empty-chart"><p>Importe um ficheiro de Vendas no cabeçalho para visualizar o desempenho.</p></div>;
  }

  return (
    <>
      {/* SECÇÃO 1: META GLOBAL DA REDE (EM MILHÕES) */}
      <section className={`card ${getPrintClass('meta-global')}`} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', borderTop: '4px solid #dc2626' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 className="chart-title" style={{ margin: 0 }}>Desempenho Global da Rede</h3>
            <p className="kpi-subtext">Defina a meta de faturação (em milhões) e acompanhe o progresso.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div className="input-group">
              <label>Meta Global (em Milhões)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#6b7280', fontWeight: 'bold' }}>R$</span>
                <input 
                  type="number" 
                  step="0.1"
                  value={globalTarget} 
                  onChange={(e) => setGlobalTarget(e.target.value)} 
                  className="input-field no-print" 
                  placeholder="Ex: 2.5" 
                  style={{ width: '180px', fontSize: '1.1rem', fontWeight: 'bold', paddingLeft: '36px', paddingRight: '36px' }}
                />
                <span style={{ position: 'absolute', right: '12px', color: '#6b7280', fontWeight: 'bold' }}>M</span>
              </div>
              {globalTarget && (
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.25rem' }}>
                  = {formatCurrency(parseFloat(globalTarget) * 1000000 || 0)}
                </span>
              )}
            </div>
            <button className="print-btn no-print" onClick={() => handlePrint('meta-global')} style={{ height: '42px', marginTop: '1.5rem' }}>
              <PrintIcon /> Imprimir
            </button>
          </div>
        </div>

        {globalPerformanceData.target > 0 && (
          <div style={{ backgroundColor: '#f9fafb', padding: '2rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Faturação Realizada</span>
                <span style={{ fontSize: '3rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{formatCurrency(globalPerformanceData.achieved)}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: globalPerformanceData.isGoalMet ? '#059669' : '#dc2626' }}>
                  {globalPerformanceData.percent.toFixed(1)}%
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280' }}>da meta atingida</span>
              </div>
            </div>

            <div style={{ width: '100%', height: '24px', backgroundColor: '#fecaca', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ 
                width: `${Math.min(globalPerformanceData.percent, 100)}%`, 
                height: '100%', 
                backgroundColor: globalPerformanceData.isGoalMet ? '#059669' : '#dc2626', 
                transition: 'width 0.5s ease-in-out' 
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}>
              <span style={{ color: '#4b5563' }}>Falta: {globalPerformanceData.isGoalMet ? 'Meta Superada!' : formatCurrency(globalPerformanceData.remaining)}</span>
              <span style={{ color: '#4b5563' }}>Meta: {formatCurrency(globalPerformanceData.target)}</span>
            </div>
          </div>
        )}
      </section>

      {/* SECÇÃO 2: COMPARATIVO DE LOJAS */}
      <section className={`card ${getPrintClass('meta-lojas')}`}>
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h3 className="chart-title" style={{ margin: 0 }}>Desempenho por Loja (Até 3 Estabelecimentos)</h3>
            <p className="kpi-subtext">Atribua metas individuais. Formatação automática ao digitar.</p>
          </div>
          <button className="print-btn no-print" onClick={() => handlePrint('meta-lojas')}><PrintIcon /> Imprimir Bloco</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {storeTargets.map((st, idx) => {
            const result = storePerformanceComparisons[idx];
            
            return (
              <div key={idx} style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Inputs da Loja */}
                <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '1.5rem', borderBottom: '1px dashed #e5e7eb' }}>
                  <div className="input-group">
                    <label>Loja {idx + 1}</label>
                    <select className="select-field" value={st.store} onChange={(e) => handleStoreTargetChange(idx, 'store', e.target.value)}>
                      <option value="">Selecione a loja...</option>
                      {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Meta da Loja (Livre)</label>
                    <input 
                      type="number" 
                      value={st.target} 
                      onChange={(e) => handleStoreTargetChange(idx, 'target', e.target.value)} 
                      className="input-field" 
                      placeholder="Ex: 150000" 
                    />
                    {/* HELPER TEXT: Formata o valor dinamicamente abaixo do input */}
                    <div style={{ height: '16px', marginTop: '0.25rem' }}>
                      {st.target && (
                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                          = {formatCurrency(parseFloat(st.target) || 0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resultado da Loja */}
                {result ? (
                  result.target > 0 ? (
                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#111827' }}>{result.store}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{formatCurrency(result.achieved)}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: result.isGoalMet ? '#059669' : '#dc2626' }}>{result.percent.toFixed(1)}%</span>
                      </div>
                      
                      <div style={{ width: '100%', height: '12px', backgroundColor: '#fecaca', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        <div style={{ width: `${Math.min(result.percent, 100)}%`, height: '100%', backgroundColor: result.isGoalMet ? '#059669' : '#dc2626', transition: 'width 0.5s ease-in-out' }} />
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span style={{ color: '#6b7280' }}>Falta: {result.isGoalMet ? '-' : formatCurrency(result.remaining)}</span>
                        <span style={{ color: '#6b7280' }}>Meta: {formatCurrency(result.target)}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                      Defina um valor de meta para calcular.
                    </div>
                  )
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                    Selecione uma loja.
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}