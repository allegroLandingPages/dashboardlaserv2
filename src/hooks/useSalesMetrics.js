import { useMemo } from 'react';

export function useSalesMetrics({ dateFilteredData, regularData, serviceData, selectedCategory, selectedStore, topProductsLimit, totalDays }) {
  const revenueOverview = useMemo(() => {
    let tp = 0, ts = 0;
    dateFilteredData.forEach(i => { if (i.isService) ts += i.totalValue; else tp += i.totalValue; });
    return { totalGeral: tp + ts, totalProducts: tp, totalServices: ts, pieData: [{ name: 'Produtos', value: tp }, { name: 'Serviços', value: ts }] };
  }, [dateFilteredData]);

  const categoryRevenueData = useMemo(() => {
    const catMap = {}; let tot = 0;
    regularData.forEach(i => { catMap[i.category] = (catMap[i.category] || 0) + i.totalValue; tot += i.totalValue; });
    const res = []; let outros = 0;
    Object.entries(catMap).sort((a, b) => b[1] - a[1]).forEach(([name, value]) => { if (value >= tot * 0.02) res.push({ name, value }); else outros += value; });
    if (outros > 0) res.push({ name: 'OUTROS', value: outros });
    return res;
  }, [regularData]);

  const storeProductsByQty = useMemo(() => {
    const map = {}; regularData.filter(i => i.store === selectedStore).forEach(i => { if (!map[i.code]) map[i.code] = { code: i.code, name: i.name, totalQty: 0, totalRevenue: 0 }; map[i.code].totalQty += i.qty; map[i.code].totalRevenue += i.totalValue; });
    return Object.values(map).sort((a, b) => b.totalQty - a.totalQty).slice(0, topProductsLimit);
  }, [regularData, selectedStore, topProductsLimit]);
  
  const storeProductsByRevenue = useMemo(() => {
    const map = {}; regularData.filter(i => i.store === selectedStore).forEach(i => { if (!map[i.code]) map[i.code] = { code: i.code, name: i.name, totalQty: 0, totalRevenue: 0 }; map[i.code].totalQty += i.qty; map[i.code].totalRevenue += i.totalValue; });
    return Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, topProductsLimit);
  }, [regularData, selectedStore, topProductsLimit]);
  
  const top10Products = useMemo(() => {
    const map = {}; regularData.forEach(i => { if (!map[i.code]) map[i.code] = { code: i.code, name: i.name, totalQty: 0 }; map[i.code].totalQty += i.qty; });
    return Object.values(map).sort((a, b) => b.totalQty - a.totalQty).slice(0, 10).map(p => ({ ...p, avgPerDay: (p.totalQty / totalDays).toFixed(2) }));
  }, [regularData, totalDays]);
  
  const top10ProductsByRevenue = useMemo(() => {
    const map = {}; regularData.forEach(i => { if (!map[i.code]) map[i.code] = { code: i.code, name: i.name, totalQty: 0, totalRevenue: 0 }; map[i.code].totalQty += i.qty; map[i.code].totalRevenue += i.totalValue; });
    return Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);
  }, [regularData]);
  
  const categoryRanking = useMemo(() => {
    const map = {}; regularData.filter(i => i.category === selectedCategory).forEach(i => { if (!map[i.code]) map[i.code] = { code: i.code, name: i.name, totalQty: 0 }; map[i.code].totalQty += i.qty; });
    return Object.values(map).sort((a, b) => b.totalQty - a.totalQty).map(p => ({ ...p, avgPerDay: (p.totalQty / totalDays).toFixed(2) }));
  }, [regularData, selectedCategory, totalDays]);
  
  const topPerCategory = useMemo(() => {
    const catMap = {}; regularData.forEach(i => { if (!catMap[i.category]) catMap[i.category] = {}; if (!catMap[i.category][i.code]) catMap[i.category][i.code] = { code: i.code, name: i.name, qty: 0 }; catMap[i.category][i.code].qty += i.qty; });
    return Object.keys(catMap).map(cat => { const prods = Object.values(catMap[cat]).sort((a, b) => b.qty - a.qty); return { category: cat, code: prods[0]?.code, name: prods[0]?.name, totalQty: prods[0]?.qty }; }).sort((a, b) => b.totalQty - a.totalQty);
  }, [regularData]);
  
  const cityRanking = useMemo(() => {
    const map = {}; regularData.forEach(i => { if (!map[i.city]) map[i.city] = { city: i.city, totalQty: 0 }; map[i.city].totalQty += i.qty; });
    return Object.values(map).sort((a, b) => b.totalQty - a.totalQty);
  }, [regularData]);
  
  const storePerformance = useMemo(() => {
    const map = {}; regularData.forEach(i => { if (!map[i.store]) map[i.store] = { store: i.store, totalQty: 0, totalRevenue: 0, products: {} }; map[i.store].totalQty += i.qty; map[i.store].totalRevenue += i.totalValue; if (!map[i.store].products[i.code]) map[i.store].products[i.code] = { name: i.name, qty: 0 }; map[i.store].products[i.code].qty += i.qty; });
    return Object.values(map).map(store => { const topProd = Object.values(store.products).sort((a, b) => b.qty - a.qty)[0]; return { ...store, topProductName: topProd?.name || '-', topProductQty: topProd?.qty || 0 }; }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [regularData]);
  
  const topStorePerCategory = useMemo(() => {
    const catMap = {}; regularData.forEach(i => { if (!catMap[i.category]) catMap[i.category] = {}; if (!catMap[i.category][i.store]) catMap[i.category][i.store] = { store: i.store, qty: 0, revenue: 0 }; catMap[i.category][i.store].qty += i.qty; catMap[i.category][i.store].revenue += i.totalValue; });
    return Object.keys(catMap).map(cat => { const stores = Object.values(catMap[cat]).sort((a, b) => b.qty - a.qty); return { category: cat, store: stores[0]?.store, totalQty: stores[0]?.qty, totalRevenue: stores[0]?.revenue }; }).sort((a, b) => b.totalQty - a.totalQty);
  }, [regularData]);
  
  const servicePerformance = useMemo(() => {
    const map = {}; let totalGeral = 0; serviceData.forEach(i => { if (!map[i.code]) map[i.code] = { code: i.code, name: i.name, totalQty: 0, totalRevenue: 0 }; map[i.code].totalQty += i.qty; map[i.code].totalRevenue += i.totalValue; totalGeral += i.totalValue; });
    return { items: Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue), totalGeral };
  }, [serviceData]);

  return {
    revenueOverview, categoryRevenueData, storeProductsByQty, storeProductsByRevenue, 
    top10Products, top10ProductsByRevenue, categoryRanking, topPerCategory, 
    cityRanking, storePerformance, topStorePerCategory, servicePerformance
  };
}