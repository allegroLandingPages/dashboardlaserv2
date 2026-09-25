import { useState, useMemo } from 'react';

export function usePricingAnalysis(dateFilteredData, uniqueProductsData) {
  const [pricingSearchCode, setPricingSearchCode] = useState('');
  const [pricingSearchName, setPricingSearchName] = useState('');
  const [pricingActiveCode, setPricingActiveCode] = useState('');

  const handlePricingCodeBlur = () => {
    if (!pricingSearchCode) { setPricingActiveCode(''); setPricingSearchName(''); return; }
    const match = uniqueProductsData.find(item => item.code.toUpperCase() === pricingSearchCode.trim().toUpperCase());
    if (match) { setPricingSearchName(match.name); setPricingActiveCode(match.code); } 
    else setPricingActiveCode(pricingSearchCode.trim());
  };

  const handlePricingNameBlur = () => {
    if (!pricingSearchName) { setPricingActiveCode(''); setPricingSearchCode(''); return; }
    const upperInput = pricingSearchName.trim().toUpperCase();
    const match = uniqueProductsData.find(item => item.name.toUpperCase().includes(upperInput));
    if (match) { setPricingSearchCode(match.code); setPricingSearchName(match.name); setPricingActiveCode(match.code); }
  };

  const clearPricingSearch = () => {
    setPricingSearchCode(''); setPricingSearchName(''); setPricingActiveCode('');
  };

  const pricingAnalysisResult = useMemo(() => {
    if (!pricingActiveCode || !dateFilteredData.length) return null;

    // Filtra vendas apenas do produto selecionado
    const sales = dateFilteredData.filter(i => i.code === pricingActiveCode && i.qty > 0);
    if (sales.length === 0) return { notFound: true, code: pricingActiveCode };

    let totalQty = 0;
    let totalRevenue = 0;
    let totalDiscount = 0;
    let maxPrice = -Infinity;
    let minPrice = Infinity;

    // Calcula o preço líquido praticado (Unidade) para descobrir extremos
    const processedSales = sales.map(sale => {
      const netUnitPrice = sale.totalValue / sale.qty;
      const discountPerc = (sale.totalValue + sale.discount) > 0 ? (sale.discount / (sale.totalValue + sale.discount)) * 100 : 0;
      
      if (netUnitPrice > maxPrice) maxPrice = netUnitPrice;
      if (netUnitPrice < minPrice) minPrice = netUnitPrice;
      
      totalQty += sale.qty;
      totalRevenue += sale.totalValue;
      totalDiscount += sale.discount;

      return { ...sale, netUnitPrice, discountPerc };
    });

    const avgNetPrice = totalRevenue / totalQty;
    const avgDiscountGlobal = (totalRevenue + totalDiscount) > 0 ? (totalDiscount / (totalRevenue + totalDiscount)) * 100 : 0;

    // Criar 5 Faixas de Preço dinâmicas
    const bands = 5;
    const rangeSize = (maxPrice - minPrice) / bands;
    const priceBuckets = Array.from({ length: bands }, (_, i) => {
      const start = minPrice + (i * rangeSize);
      const end = i === bands - 1 ? maxPrice : minPrice + ((i + 1) * rangeSize);
      return { id: i, start, end, label: `R$ ${start.toFixed(2)} - R$ ${end.toFixed(2)}`, qty: 0, revenue: 0, totalDiscountValue: 0, transactions: 0 };
    });

    // Se o preço não variou nada, junta tudo numa faixa só
    if (rangeSize === 0) {
      priceBuckets.length = 1;
      priceBuckets[0] = { id: 0, start: minPrice, end: maxPrice, label: `Preço Único: R$ ${minPrice.toFixed(2)}`, qty: 0, revenue: 0, totalDiscountValue: 0, transactions: 0 };
    }

    // Distribuir vendas pelas faixas
    processedSales.forEach(sale => {
      const bucketIndex = rangeSize === 0 ? 0 : Math.min(Math.floor((sale.netUnitPrice - minPrice) / rangeSize), bands - 1);
      priceBuckets[bucketIndex].qty += sale.qty;
      priceBuckets[bucketIndex].revenue += sale.totalValue;
      priceBuckets[bucketIndex].totalDiscountValue += sale.discount;
      priceBuckets[bucketIndex].transactions += 1;
    });

    // Formatar os dados do balde para a Tabela e Gráfico
    const chartData = priceBuckets.filter(b => b.qty > 0).map(b => {
      const avgDiscountInBand = (b.revenue + b.totalDiscountValue) > 0 ? (b.totalDiscountValue / (b.revenue + b.totalDiscountValue)) * 100 : 0;
      return {
        faixa: b.label,
        volume: b.qty,
        receita: b.revenue,
        descontoMedio: avgDiscountInBand
      };
    }).sort((a, b) => b.volume - a.volume); // Ordena pelo maior volume

    return {
      name: processedSales[0].name,
      code: pricingActiveCode,
      kpis: {
        totalQty, totalRevenue, totalDiscount,
        avgNetPrice, avgDiscountGlobal,
        minPrice, maxPrice
      },
      chartData
    };

  }, [pricingActiveCode, dateFilteredData]);

  return {
    pricingSearchCode, setPricingSearchCode,
    pricingSearchName, setPricingSearchName,
    pricingActiveCode,
    handlePricingCodeBlur, handlePricingNameBlur, clearPricingSearch,
    pricingAnalysisResult
  };
}