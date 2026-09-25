import React from 'react';
import { formatCurrency } from '../../utils/helpers';

export default function EstoqueTab({ salesData }) {
  const { 
    inventoryData, 
    invSearchCode, setInvSearchCode, 
    invSearchName, setInvSearchName,
    invActiveCode,
    invFilterBrand, setInvFilterBrand, 
    invFilterCategory, setInvFilterCategory, 
    handleInvCodeBlur, handleInvNameBlur, clearInventoryFilters,
    invUniqueBrands, invUniqueCategories, filteredInventoryProducts,
    filteredInventoryTableData, inventorySearchResult
  } = salesData;

  if (inventoryData.length === 0) {
    return (
      <div className="card empty-chart">
        <p>Importe um ficheiro de Estoque (.csv) no cabeçalho para visualizar esta análise.</p>
      </div>
    );
  }

  return (
    <>
      {/* CARTÃO 1: FILTROS E BUSCA */}
      <section className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Filtrar por Marca</label>
            <select className="select-field" value={invFilterBrand} onChange={e => { setInvFilterBrand(e.target.value); setInvSearchCode(''); setInvSearchName(''); }}>
              <option value="">Todas as Marcas...</option>
              {invUniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Filtrar por Categoria</label>
            <select className="select-field" value={invFilterCategory} onChange={e => { setInvFilterCategory(e.target.value); setInvSearchCode(''); setInvSearchName(''); }}>
              <option value="">Todas as Categorias...</option>
              {invUniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button 
            onClick={clearInventoryFilters} 
            className="print-btn no-print" 
            style={{ height: '42px', color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}
          >
            Limpar Filtros
          </button>
        </div>

        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', margin: '0 0 1rem 0' }}>Busca Individual de Produto</h4>
          
          <datalist id="inv-codes">
            {filteredInventoryProducts.map(p => <option key={p.code} value={p.code} />)}
          </datalist>
          <datalist id="inv-names">
            {filteredInventoryProducts.map(p => <option key={p.code} value={p.name} />)}
          </datalist>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div className="input-group" style={{ flex: '1' }}>
              <label>Código</label>
              <input 
                type="text" list="inv-codes" value={invSearchCode} 
                onChange={e => setInvSearchCode(e.target.value)} onBlur={handleInvCodeBlur}
                className="input-field" placeholder="Ex: 18338" 
              />
            </div>
            <div className="input-group" style={{ flex: '4' }}>
              <label>Descrição / SKU</label>
              <input 
                type="text" list="inv-names" value={invSearchName} 
                onChange={e => setInvSearchName(e.target.value)} onBlur={handleInvNameBlur}
                className="input-field" placeholder="Ex: (BF) (LI) ADAPT. TOMADA..." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* ÁREA DE RESULTADO */}
      {!invActiveCode ? (
        
        /* SE NÃO HOUVER CÓDIGO ATIVO: MOSTRA A TABELA COM SCROLL */
        <section className="card table-section" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
            <h3 className="chart-title" style={{ margin: 0, color: '#4b5563' }}>Resultados • Todos os Produtos</h3>
          </div>
          
          {filteredInventoryTableData.length > 0 ? (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="data-table" style={{ margin: 0 }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f9fafb', zIndex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Marca</th>
                    <th>Categoria</th>
                    <th>Preço Venda</th>
                    <th>Estoque L05</th>
                    <th>Estoque LOJA</th>
                    <th>Estoque REDE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventoryTableData.map(item => (
                    <tr key={item.code}>
                      <td>{item.code}</td>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td>{item.marca}</td>
                      <td>{item.category}</td>
                      <td style={{ color: '#f59e0b', fontWeight: 'bold' }}>{formatCurrency(item.venda)}</td>
                      <td style={{ color: '#059669', fontWeight: 'bold' }}>{item.l05}</td>
                      <td style={{ color: '#3b82f6', fontWeight: 'bold' }}>{item.loja}</td>
                      <td style={{ color: '#dc2626', fontWeight: 'bold' }}>{item.rede}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
              Nenhum produto encontrado para os filtros selecionados.
            </div>
          )}
        </section>

      ) : (

        /* SE HOUVER CÓDIGO ATIVO: MOSTRA O CARTÃO DE PRODUTO ÚNICO */
        <>
          {inventorySearchResult && !inventorySearchResult.notFound ? (
            <section className="card" style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              flexWrap: 'wrap', gap: '2rem', borderLeft: '6px solid #3b82f6'
            }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 300px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#3b82f6' }}>CÓD. {inventorySearchResult.code}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>{inventorySearchResult.name}</span>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {inventorySearchResult.brand && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', backgroundColor: '#f3f4f6', color: '#4b5563', borderRadius: '100px' }}>
                      Marca: {inventorySearchResult.brand}
                    </span>
                  )}
                  {inventorySearchResult.category && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', backgroundColor: '#eef2ff', color: '#4f46e5', borderRadius: '100px' }}>
                      Cat: {inventorySearchResult.category}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'baseline' }}>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Preço Venda</span>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>
                    <span style={{ fontSize: '1.25rem', marginRight: '0.2rem' }}>R$</span>
                    {inventorySearchResult.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Estoque L05</span>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#059669' }}>{inventorySearchResult.l05Qty}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Estoque Loja</span>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6' }}>{inventorySearchResult.storeQty}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Estoque Rede</span>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#dc2626' }}>{inventorySearchResult.networkQty}</span>
                </div>
                
              </div>
            </section>
          ) : (
            <section className="card" style={{ textAlign: 'center', color: '#9ca3af', padding: '3rem' }}>
              <p>Nenhum produto encontrado com o código <b>{inventorySearchResult.code}</b>.</p>
            </section>
          )}
        </>
      )}
    </>
  );
}