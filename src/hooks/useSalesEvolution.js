import { useMemo } from 'react';

export function useSalesEvolution({ dateFilteredData, regularData, evolutionScope, evolutionSelection, multiStores }) {
  const overallEvolutionChartData = useMemo(() => {
    if (!dateFilteredData.length) return [];
    const map = {};
    dateFilteredData.forEach(item => {
      if (!map[item.dateStr]) map[item.dateStr] = { data: item.dateStr, faturamento: 0, dateObj: item.dateObj };
      map[item.dateStr].faturamento += item.totalValue;
    });
    return Object.values(map).sort((a, b) => a.dateObj - b.dateObj);
  }, [dateFilteredData]);

  const evolutionChartData = useMemo(() => {
    if (!evolutionSelection) return []; 
    const filtered = regularData.filter(i => evolutionScope === 'loja' ? i.store === evolutionSelection : i.city === evolutionSelection);
    const map = {}; 
    filtered.forEach(i => { 
      if (!map[i.dateStr]) map[i.dateStr] = { data: i.dateStr, faturamento: 0, dateObj: i.dateObj }; 
      map[i.dateStr].faturamento += i.totalValue; 
    });
    return Object.values(map).sort((a, b) => a.dateObj - b.dateObj);
  }, [regularData, evolutionScope, evolutionSelection]);
  
  const evolutionTotalRevenue = useMemo(() => evolutionChartData.reduce((acc, curr) => acc + curr.faturamento, 0), [evolutionChartData]);
  
  const comparativeStoreEvolution = useMemo(() => {
    const activeStores = multiStores.filter(s => s.trim() !== ''); 
    if (!regularData.length || activeStores.length === 0) return { chartData: [], lines: [] };
    const map = {}; 
    regularData.forEach(i => { 
      if (!map[i.dateStr]) { map[i.dateStr] = { data: i.dateStr, dateObj: i.dateObj }; activeStores.forEach(s => map[i.dateStr][s] = 0); } 
      if (activeStores.includes(i.store)) map[i.dateStr][i.store] += i.totalValue; 
    });
    return { chartData: Object.values(map).sort((a, b) => a.dateObj - b.dateObj), lines: activeStores };
  }, [regularData, multiStores]);

  return {
    overallEvolutionChartData, evolutionChartData, evolutionTotalRevenue, comparativeStoreEvolution
  };
}