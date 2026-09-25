import React from 'react';
import TableSection from '../TableSection';

export default function CestaComprasTab({ salesData, printProps }) {
  const { 
    data, uniqueProductsData, basketAnalysis,
    basketSearchCode, setBasketSearchCode,
    basketSearchName, setBasketSearchName,
    basketActiveCode, handleBasketCodeBlur, handleBasketNameBlur, clearBasketSearch,
    productSuggestions
  } = salesData;
  
  const { getPrintClass } = printProps;

  if (data.length === 0) {
    return <div className="card empty-chart"><p>Importe um ficheiro de Vendas para analisar o comportamento de compra conjunta.</p></div>;
  }

  const productColumns = [
    { header: 'Produto A', accessor: 'productA', style: { fontWeight: 500 } },
    { header: 'Produto B (Comprado Junto)', accessor: 'productB', style: { fontWeight: 500 } },
    { header: 'Vezes em Conjunto', accessor: 'frequency', style: { fontWeight: 'bold', color: '#dc2626' } },
    { header: 'Afinidade', render: () => <span style={{ padding: '0.2rem 0.6rem', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem' }}>Cross-Selling</span> }
  ];

  const categoryColumns = [
    { header: 'Categoria A', accessor: 'categoryA', style: { fontWeight: 'bold', color: '#1f2937' } },
    { header: 'Categoria B (Combinada)', accessor: 'categoryB', style: { fontWeight: 'bold', color: '#1f2937' } },
    { header: 'Transações em Conjunto', accessor: 'frequency', style: { fontWeight: 'bold', color: '#ea580c' } },
    { header: 'Oportunidade', render: () => <span style={{ padding: '0.2rem 0.6rem', backgroundColor: '#fff7ed', color: '#c2410c', borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem' }}>Combo de Categorias</span> }
  ];

  return (
    <>
      <section className={getPrintClass('cesta-kpis')} style={{ marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, backgroundColor: '#fff7ed', border: '1px solid #fdba74', margin: 0 }}>
          <span className="kpi-label" style={{ color: '#c2410c' }}>Total de Pedidos Analisados </span>
          <span className="kpi-value" style={{ color: '#9a3412', fontSize: '2.5rem' }}>{basketAnalysis?.totalOrders || 0}</span>
          <span className="kpi-subtext" style={{ color: '#c2410c', fontWeight: 600 }}> Cruzamento efetuado com base no número do pedido (Coluna C).</span>
        </div>
      </section>

      {/* SECÇÃO: GERADOR DE 3 OPÇÕES DE COMBO POR PRODUTO */}
      <section className="card" style={{ marginBottom: '2rem', borderTop: '4px solid #ea580c' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 className="chart-title" style={{ margin: 0 }}>Gerador de Combos por Produto (Cross-Selling)</h3>
            <p className="kpi-subtext">Digite um produto para descobrir automaticamente as 3 melhores opções complementares baseadas em pedidos reais.</p>
          </div>
          {basketActiveCode && (
            <button onClick={clearBasketSearch} className="print-btn no-print" style={{ color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}>
              Limpar Busca
            </button>
          )}
        </div>

        <datalist id="basket-codes">{uniqueProductsData?.map(p => <option key={p.code} value={p.code} />)}</datalist>
        <datalist id="basket-names">{uniqueProductsData?.map(p => <option key={p.code} value={p.name} />)}</datalist>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div className="input-group" style={{ flex: '1 1 200px' }}>
            <label>Código do Produto</label>
            <input 
              type="text" list="basket-codes" value={basketSearchCode} 
              onChange={e => setBasketSearchCode(e.target.value)} onBlur={handleBasketCodeBlur}
              className="input-field" placeholder="Ex: 1057" 
            />
          </div>
          <div className="input-group" style={{ flex: '4 1 400px' }}>
            <label>Descrição do Produto Principal</label>
            <input 
              type="text" list="basket-names" value={basketSearchName} 
              onChange={e => setBasketSearchName(e.target.value)} onBlur={handleBasketNameBlur}
              className="input-field" placeholder="Pesquisar por nome do produto..." 
            />
          </div>
        </div>

        {basketActiveCode && (
          <div>
            <h4 style={{ fontSize: '1rem', color: '#111827', marginBottom: '1rem' }}>
              Top 3 Melhores Opções de Combo para: <span style={{ color: '#ea580c' }}>{basketSearchName || basketActiveCode}</span>
            </h4>
            
            {productSuggestions.length === 0 ? (
              <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '12px', textAlign: 'center', color: '#6b7280' }}>
                Não foram encontrados registos de outros produtos vendidos no mesmo pedido que este item.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {productSuggestions.map((item, index) => (
                  <div key={item.code} style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#fff7ed', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#ea580c', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '100px' }}>
                        Opção 0{index + 1}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c2410c' }}>
                        {item.frequency} pedidos em conjunto
                      </span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Código: {item.code}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* TABELA 1: COMBOS POR CATEGORIA */}
      <div style={{ marginBottom: '2rem' }}>
        <TableSection 
          id="cesta-categorias"
          title="Combos por Categoria (Ex: Fogão + Refrigerador)"
          subtitle="Identifique quais as famílias de produtos que os clientes mais frequentemente compram na mesma transação."
          data={basketAnalysis?.topCategoryCombos || []}
          columns={categoryColumns}
          printProps={printProps}
        />
      </div>

      {/* TABELA 2: PARES DE PRODUTOS INDIVIDUAIS */}
      <TableSection 
        id="cesta-produtos"
        title="Pares de Produtos Individuais Mais Vendidos Juntos"
        subtitle="Detalhe SKU a SKU das maiores afinidades de cross-selling."
        data={basketAnalysis?.topCombos || []}
        columns={productColumns}
        printProps={printProps}
      />
    </>
  );
}