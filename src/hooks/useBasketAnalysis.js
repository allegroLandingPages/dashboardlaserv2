import { useState, useMemo } from 'react';

export function useBasketAnalysis(dateFilteredData, data, uniqueProductsData) {
  const [basketSearchCode, setBasketSearchCode] = useState('');
  const [basketSearchName, setBasketSearchName] = useState('');
  const [basketActiveCode, setBasketActiveCode] = useState('');

  const handleBasketCodeBlur = () => {
    if (!basketSearchCode) { setBasketActiveCode(''); setBasketSearchName(''); return; }
    const match = uniqueProductsData?.find(item => item.code.toUpperCase() === basketSearchCode.trim().toUpperCase());
    if (match) { setBasketSearchName(match.name); setBasketActiveCode(match.code); } 
    else setBasketActiveCode(basketSearchCode.trim());
  };

  const handleBasketNameBlur = () => {
    if (!basketSearchName) { setBasketActiveCode(''); setBasketSearchCode(''); return; }
    const upperInput = basketSearchName.trim().toUpperCase();
    const match = uniqueProductsData?.find(item => item.name.toUpperCase().includes(upperInput));
    if (match) { setBasketSearchCode(match.code); setBasketSearchName(match.name); setBasketActiveCode(match.code); }
  };

  const clearBasketSearch = () => {
    setBasketSearchCode(''); setBasketSearchName(''); setBasketActiveCode('');
  };

  const basketAnalysis = useMemo(() => {
    const targetData = dateFilteredData.length > 0 ? dateFilteredData : data;
    if (!targetData.length) return { topCombos: [], topCategoryCombos: [], totalOrders: 0 };

    const ordersMap = {};
    const categoryOrdersMap = {};
    
    targetData.forEach(item => {
      if (item.isService || !item.code) return; 
      
      const orderId = item.orderId; 
      if (!orderId || orderId.toUpperCase() === 'PEDIDO') return;

      if (!ordersMap[orderId]) ordersMap[orderId] = new Set();
      ordersMap[orderId].add(JSON.stringify({ code: item.code, name: item.name }));

      if (!categoryOrdersMap[orderId]) categoryOrdersMap[orderId] = new Set();
      if (item.category && item.category !== 'Indefinida') {
        categoryOrdersMap[orderId].add(item.category);
      }
    });

    const orderIds = Object.keys(ordersMap);
    const totalOrders = orderIds.length;

    const pairMap = {};
    const categoryPairMap = {};

    orderIds.forEach(orderId => {
      const products = Array.from(ordersMap[orderId]).map(p => JSON.parse(p));
      for (let i = 0; i < products.length; i++) {
        for (let j = i + 1; j < products.length; j++) {
          const p1 = products[i];
          const p2 = products[j];
          const pairKey = p1.code < p2.code ? `${p1.code}|${p2.code}` : `${p2.code}|${p1.code}`;
          
          if (!pairMap[pairKey]) {
            pairMap[pairKey] = { productA: p1.name, codeA: p1.code, productB: p2.name, codeB: p2.code, frequency: 0 };
          }
          pairMap[pairKey].frequency += 1;
        }
      }

      const categories = Array.from(categoryOrdersMap[orderId]);
      for (let i = 0; i < categories.length; i++) {
        for (let j = i + 1; j < categories.length; j++) {
          const c1 = categories[i];
          const c2 = categories[j];
          const catPairKey = c1 < c2 ? `${c1}|${c2}` : `${c2}|${c1}`;
          
          if (!categoryPairMap[catPairKey]) {
            categoryPairMap[catPairKey] = { categoryA: c1, categoryB: c2, frequency: 0 };
          }
          categoryPairMap[catPairKey].frequency += 1;
        }
      }
    });

    const topCombos = Object.values(pairMap).sort((a, b) => b.frequency - a.frequency).slice(0, 20);
    const topCategoryCombos = Object.values(categoryPairMap).sort((a, b) => b.frequency - a.frequency).slice(0, 10);

    return { topCombos, topCategoryCombos, totalOrders, ordersMap };
  }, [dateFilteredData, data]);

  // Sugestões específicas para o produto pesquisado
  const productSuggestions = useMemo(() => {
    if (!basketActiveCode || !basketAnalysis?.ordersMap) return [];
    
    const targetCode = basketActiveCode.toUpperCase();
    const suggestionsMap = {};

    Object.values(basketAnalysis.ordersMap).forEach(productSet => {
      const products = Array.from(productSet).map(p => JSON.parse(p));
      const hasTarget = products.some(p => p.code.toUpperCase() === targetCode);

      if (hasTarget) {
        products.forEach(p => {
          if (p.code.toUpperCase() !== targetCode) {
            if (!suggestionsMap[p.code]) {
              suggestionsMap[p.code] = { code: p.code, name: p.name, frequency: 0 };
            }
            suggestionsMap[p.code].frequency += 1;
          }
        });
      }
    });

    return Object.values(suggestionsMap)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3); // Retorna os Top 3 melhores combos
  }, [basketActiveCode, basketAnalysis]);

  return {
    basketSearchCode, setBasketSearchCode,
    basketSearchName, setBasketSearchName,
    basketActiveCode, handleBasketCodeBlur, handleBasketNameBlur, clearBasketSearch,
    basketAnalysis, productSuggestions
  };
}