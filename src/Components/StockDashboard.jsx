import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import './Dashboard.css';

const resolveProductCode = (inputStr, dataset) => {
  if (!inputStr) return null;
  const upperInput = String(inputStr).trim().toUpperCase();
  
  let match = dataset.find(item => item.code.toUpperCase() === upperInput);
  
  if (!match && upperInput.includes(' - ')) {
    const extractedCode = upperInput.split(' - ')[0].trim();
    match = dataset.find(item => item.code.toUpperCase() === extractedCode);
  }
  
  if (!match) {
    match = dataset.find(item => item.name.toUpperCase().includes(upperInput));
  }

  return match ? match.code : String(inputStr).trim(); 
};

export default function StockDashboard() {
  const [data, setData] = useState([]);
  
  const [singleInputCode, setSingleInputCode] = useState('');
  const [singleInputName, setSingleInputName] = useState('');
  const [activeSingleCode, setActiveSingleCode] = useState('');
  
  // Filtros Globais
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data
          .filter((row, index) => index > 0 && row[1] && String(row[1]).trim().toUpperCase() !== 'CÓDIGO')
          .map(row => ({
            section: String(row[0] || '').trim(),
            code: String(row[1] || '').trim(),
            name: String(row[2] || '').trim(),
            marca: String(row[3] || '').trim(),
            l05: parseInt(row[10]) || 0,
            loja: parseInt(row[11]) || 0,
            rede: parseInt(row[15]) || 0,
            category: String(row[33] || '').trim() // Extração da coluna 35 para Categoria
          }));
        
        setData(parsedData);
      }
    });
  };

  const handleSingleCodeBlur = () => {
    if (!singleInputCode) {
      setSingleInputName('');
      setActiveSingleCode('');
      return;
    }
    const match = data.find(item => item.code.toUpperCase() === singleInputCode.trim().toUpperCase());
    if (match) {
      setSingleInputName(match.name);
      setActiveSingleCode(match.code);
    } else {
      setActiveSingleCode(singleInputCode.trim()); 
    }
  };

  const handleSingleNameBlur = () => {
    if (!singleInputName) {
      setSingleInputCode('');
      setActiveSingleCode('');
      return;
    }
    const upperInput = singleInputName.trim().toUpperCase();
    const match = data.find(item => item.name.toUpperCase().includes(upperInput));
    if (match) {
      setSingleInputCode(match.code);
      setSingleInputName(match.name);
      setActiveSingleCode(match.code);
    }
  };

  const uniqueProductsData = useMemo(() => {
    const map = new Map();
    data.forEach(item => {
      if (!map.has(item.code)) map.set(item.code, item.name);
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [data]);

  const uniqueMarcas = useMemo(() => {
    const marcas = new Set(data.map(item => item.marca).filter(Boolean));
    return Array.from(marcas).sort();
  }, [data]);

  const uniqueCategories = useMemo(() => {
    const categorias = new Set(data.map(item => item.category).filter(Boolean));
    return Array.from(categorias).sort();
  }, [data]);

  const searchedProduct = useMemo(() => {
    if (!activeSingleCode) return null;
    return data.find(item => item.code === activeSingleCode) || null;
  }, [data, activeSingleCode]);

  // Aplica os filtros de Marca e Categoria simultaneamente
  const tableData = useMemo(() => {
    let filtered = data;
    
    if (selectedMarca) {
      filtered = filtered.filter(item => item.marca === selectedMarca);
    }
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Ordena sempre pelo produto que tem o maior estoque na REDE
    return filtered.sort((a, b) => b.rede - a.rede);
  }, [data, selectedMarca, selectedCategory]);

  const filteredTotals = useMemo(() => {
    if (!selectedMarca && !selectedCategory) return { l05: 0, loja: 0, rede: 0 };
    return tableData.reduce((acc, curr) => {
      acc.l05 += curr.l05;
      acc.loja += curr.loja;
      acc.rede += curr.rede;
      return acc;
    }, { l05: 0, loja: 0, rede: 0 });
  }, [tableData, selectedMarca, selectedCategory]);

  return (
    <div className="dashboard-container">
      
      <datalist id="stock-codes-datalist">
        {uniqueProductsData.map((prod) => <option key={`c-${prod.code}`} value={prod.code} />)}
      </datalist>
      <datalist id="stock-names-datalist">
        {uniqueProductsData.map((prod) => <option key={`n-${prod.code}`} value={prod.name} />)}
      </datalist>

        <div className="header-content">
          <h1 className="header-title">Consulta de Estoque (L05, LOJA e REDE)</h1>
        </div>

      <main className="main-content">
        
        <section className="card" style={{ border: '2px dashed #f97316', backgroundColor: '#fff7ed', textAlign: 'center' }}>
          <h2 className="filters-title" style={{ borderBottom: 'none', color: '#c2410c', marginBottom: '0.5rem' }}>1. Importe o CSV de Estoque</h2>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            className="file-input" 
            style={{ margin: '0 auto', display: 'block' }} 
          />
        </section>

        <section className="card">
          <div className="filters-grid" style={{ marginBottom: '2rem', gridTemplateColumns: '1fr 1fr' }}>
            <div className="input-group">
              <label>Filtrar por Marca</label>
              <select 
                className="select-field" 
                value={selectedMarca} 
                onChange={e => setSelectedMarca(e.target.value)}
                disabled={data.length === 0}
              >
                <option value="">Todas as Marcas...</option>
                {uniqueMarcas.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Filtrar por Categoria</label>
              <select 
                className="select-field" 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)}
                disabled={data.length === 0}
              >
                <option value="">Todas as Categorias...</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="filters-title">Busca Individual de Produto</h2>
          <div className="filters-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
            <div className="input-group">
              <label>Código</label>
              <input 
                type="text" 
                list="stock-codes-datalist"
                placeholder="Ex: 16926" 
                value={singleInputCode} 
                onChange={e => setSingleInputCode(e.target.value)} 
                onBlur={handleSingleCodeBlur}
                className="input-field" 
                disabled={data.length === 0}
              />
            </div>
            <div className="input-group">
              <label>Descrição / SKU</label>
              <input 
                type="text" 
                list="stock-names-datalist"
                placeholder="Ex: CABO HDMI..." 
                value={singleInputName} 
                onChange={e => setSingleInputName(e.target.value)} 
                onBlur={handleSingleNameBlur}
                className="input-field" 
                disabled={data.length === 0}
              />
            </div>
          </div>
        </section>

        {searchedProduct && (
          <section className="results-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
            <div className="card kpi-card" style={{ gridColumn: '1 / -1', flexDirection: 'row', justifyContent: 'space-between', padding: '1.5rem 2rem' }}>
              <div style={{ textAlign: 'left' }}>
                <span className="kpi-label" style={{ color: '#3b82f6' }}>CÓD. {searchedProduct.code}</span>
                <h3 style={{ margin: '0.5rem 0', fontSize: '1.25rem', color: '#1f2937' }}>{searchedProduct.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-block', backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563' }}>
                    Marca: {searchedProduct.marca || 'N/A'}
                  </span>
                  <span style={{ display: 'inline-block', backgroundColor: '#e0e7ff', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, color: '#3730a3' }}>
                    Cat: {searchedProduct.category || 'N/A'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2rem', textAlign: 'center' }}>
                <div>
                  <span className="kpi-label">Estoque L05</span>
                  <span className="kpi-value" style={{ fontSize: '2.5rem', background: 'none', color: '#059669' }}>{searchedProduct.l05}</span>
                </div>
                <div>
                  <span className="kpi-label">Estoque LOJA</span>
                  <span className="kpi-value" style={{ fontSize: '2.5rem', background: 'none', color: '#2563eb' }}>{searchedProduct.loja}</span>
                </div>
                <div>
                  <span className="kpi-label">Estoque REDE</span>
                  <span className="kpi-value" style={{ fontSize: '2.5rem', background: 'none', color: '#dc2626' }}>{searchedProduct.rede}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {(selectedMarca || selectedCategory) && !activeSingleCode && (
          <section className="results-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '2rem' }}>
             <div className="card kpi-card">
                <span className="kpi-label">Total L05 (Filtrado)</span>
                <span className="kpi-value" style={{ fontSize: '2.5rem', background: 'none', color: '#059669' }}>{filteredTotals.l05}</span>
             </div>
             <div className="card kpi-card">
                <span className="kpi-label">Total LOJA (Filtrado)</span>
                <span className="kpi-value" style={{ fontSize: '2.5rem', background: 'none', color: '#2563eb' }}>{filteredTotals.loja}</span>
             </div>
             <div className="card kpi-card">
                <span className="kpi-label">Total REDE (Filtrado)</span>
                <span className="kpi-value" style={{ fontSize: '2.5rem', background: 'none', color: '#dc2626' }}>{filteredTotals.rede}</span>
             </div>
          </section>
        )}

        {data.length > 0 && !activeSingleCode && (
          <section className="card table-section">
            <div className="section-header">
              <h3 className="chart-title" style={{ margin: 0 }}>
                Resultados 
                {selectedMarca && ` • Marca: ${selectedMarca}`}
                {selectedCategory && ` • Cat: ${selectedCategory}`}
                {!selectedMarca && !selectedCategory && ' • Todos os Produtos'}
              </h3>
            </div>
            <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Marca</th>
                    <th>Categoria</th>
                    <th>Estoque L05</th>
                    <th>Estoque LOJA</th>
                    <th>Estoque REDE</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((item, index) => (
                    <tr key={`${item.code}-${index}`}>
                      <td style={{ fontWeight: 600 }}>{item.code}</td>
                      <td>{item.name}</td>
                      <td>{item.marca}</td>
                      <td>{item.category}</td>
                      <td style={{ fontWeight: 'bold', color: item.l05 > 0 ? '#059669' : '#9ca3af' }}>{item.l05}</td>
                      <td style={{ fontWeight: 'bold', color: item.loja > 0 ? '#2563eb' : '#9ca3af' }}>{item.loja}</td>
                      <td style={{ fontWeight: 'bold', color: item.rede > 0 ? '#dc2626' : '#9ca3af' }}>{item.rede}</td>
                    </tr>
                  ))}
                  {tableData.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum produto encontrado com esses filtros.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}