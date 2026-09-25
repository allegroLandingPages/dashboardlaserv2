import { useState, useMemo } from 'react';
import Papa from 'papaparse';

export function useInventory() {
  const [inventoryData, setInventoryData] = useState([]);
  
  const [invSearchCode, setInvSearchCode] = useState('');
  const [invSearchName, setInvSearchName] = useState('');
  const [invActiveCode, setInvActiveCode] = useState('');
  const [invFilterBrand, setInvFilterBrand] = useState('');
  const [invFilterCategory, setInvFilterCategory] = useState('');

  const handleInvCodeBlur = () => {
    if (!invSearchCode) { setInvActiveCode(''); setInvSearchName(''); return; }
    const match = inventoryData.find(item => item.code.toUpperCase() === invSearchCode.trim().toUpperCase());
    if (match) { setInvSearchName(match.name); setInvActiveCode(match.code); } 
    else setInvActiveCode(invSearchCode.trim());
  };

  const handleInvNameBlur = () => {
    if (!invSearchName) { setInvActiveCode(''); setInvSearchCode(''); return; }
    const upperInput = invSearchName.trim().toUpperCase();
    const match = inventoryData.find(item => item.name.toUpperCase().includes(upperInput));
    if (match) { setInvSearchCode(match.code); setInvSearchName(match.name); setInvActiveCode(match.code); }
  };

  const clearInventoryFilters = () => {
    setInvSearchCode(''); setInvSearchName(''); setInvActiveCode('');
    setInvFilterBrand(''); setInvFilterCategory('');
  };

  const handleInventoryUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: false, skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        if (rows.length === 0) return;
        const headers = rows[0].map(h => String(h).toUpperCase().trim());
        const l05Idx = headers.findIndex(h => h.includes('L05'));
        const lojaIdx = headers.findIndex(h => h.includes('LOJA') && !h.includes('L05'));
        const redeIdx = headers.findIndex(h => h.includes('REDE'));
        const vendaIdx = headers.findIndex(h => h.includes('VENDA') || h.includes('PREÇO'));
        
        const parsed = rows.slice(1).map(row => {
          const cleanVenda = String(row[vendaIdx > -1 ? vendaIdx : 7] || '0').replace(/\./g, '').replace(',', '.');
          return {
            section: String(row[0] || '').trim(), code: String(row[1] || '').trim(),
            name: String(row[2] || '').trim(), marca: String(row[3] || '').trim(),
            l05: parseInt(row[l05Idx > -1 ? l05Idx : 4]) || 0,
            loja: parseInt(row[lojaIdx > -1 ? lojaIdx : 5]) || 0,
            rede: parseInt(row[redeIdx > -1 ? redeIdx : 6]) || 0,
            venda: parseFloat(cleanVenda) || 0, category: String(row[33] || '').trim()
          };
        }).filter(item => item.code);
        setInventoryData(parsed);
      }
    });
  };

  const invUniqueBrands = useMemo(() => [...new Set(inventoryData.map(i => i.marca))].filter(b => b && b !== 'N/D').sort(), [inventoryData]);
  const invUniqueCategories = useMemo(() => [...new Set(inventoryData.map(i => i.category))].filter(c => c && c !== 'N/D').sort(), [inventoryData]);
  
  const filteredInventoryProducts = useMemo(() => {
    let filtered = inventoryData;
    if (invFilterBrand) filtered = filtered.filter(i => i.marca === invFilterBrand);
    if (invFilterCategory) filtered = filtered.filter(i => i.category === invFilterCategory);
    const map = new Map(); filtered.forEach(i => map.set(i.code, i.name));
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [inventoryData, invFilterBrand, invFilterCategory]);
  
  const filteredInventoryTableData = useMemo(() => {
    let filtered = inventoryData;
    if (invFilterBrand) filtered = filtered.filter(i => i.marca === invFilterBrand);
    if (invFilterCategory) filtered = filtered.filter(i => i.category === invFilterCategory);
    return filtered.sort((a, b) => b.rede - a.rede);
  }, [inventoryData, invFilterBrand, invFilterCategory]);
  
  const inventorySearchResult = useMemo(() => {
    if (!inventoryData.length || !invActiveCode) return null;
    const match = inventoryData.find(item => item.code === invActiveCode);
    if (!match) return { notFound: true, code: invActiveCode };
    return { code: match.code, name: match.name, brand: match.marca, category: match.category, price: match.venda, l05Qty: match.l05, storeQty: match.loja, networkQty: match.rede };
  }, [inventoryData, invActiveCode]);

  return {
    inventoryData, handleInventoryUpload,
    invSearchCode, setInvSearchCode, invSearchName, setInvSearchName,
    invActiveCode, invFilterBrand, setInvFilterBrand, invFilterCategory, setInvFilterCategory,
    handleInvCodeBlur, handleInvNameBlur, clearInventoryFilters,
    invUniqueBrands, invUniqueCategories, filteredInventoryProducts,
    filteredInventoryTableData, inventorySearchResult
  };
}