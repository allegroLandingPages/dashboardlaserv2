import { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { STORE_MAP, SERVICE_KEYWORDS, SERVICE_CODES } from '../utils/constants';
import { formatDateBr } from '../utils/helpers';
import { useSalesMetrics } from './useSalesMetrics';
import { useSalesEvolution } from './useSalesEvolution';

// Lógica pura fora do Hook (evita recriação em memória a cada renderização)
const parseSalesCSV = (rows) => {
  return rows.map(row => {
    // Se o seu CSV tiver cabeçalho na linha 0, isto garante que ignoramos se o valor for a palavra "Pedido"
    const orderId = String(row[2] || '').trim();
    if (orderId.toUpperCase() === 'PEDIDO') return null;

    const [day, month, year] = (String(row[3] || '')).split('/');
    const rawUnitPrice = row[6] ? String(row[6]).replace(/\./g, '').replace(',', '.') : '0';
    const rawTotal = row[7] ? String(row[7]).replace(/\./g, '').replace(',', '.') : '0';
    const rawDiscount = row[8] ? String(row[8]).replace(/\./g, '').replace(',', '.') : '0';
    
    const codeStr = String(row[0] || '').trim();
    const nameStr = String(row[1] || '').trim();
    const rawStoreId = String(row[4] || '').trim();
    
    const isService = SERVICE_KEYWORDS.some(svc => nameStr.toUpperCase().includes(svc)) || SERVICE_CODES.includes(codeStr);
    
    return {
      orderId,
      code: codeStr, 
      name: nameStr || 'Sem Descrição', 
      dateStr: row[3],
      dateObj: new Date(`${year}-${month}-${day}T00:00:00`),
      store: STORE_MAP[rawStoreId] || (rawStoreId ? `[${rawStoreId}] Loja` : 'N/A'),
      qty: parseFloat(row[5]) || 0, 
      unitPrice: parseFloat(rawUnitPrice) || 0, 
      totalValue: parseFloat(rawTotal) || 0, 
      discount: parseFloat(rawDiscount) || 0, 
      category: row[11] ? String(row[11]).trim() : 'Indefinida', 
      city: row[16] ? String(row[16]).trim() : 'Indefinida', 
      isService: isService
    };
  }).filter(item => item !== null && !isNaN(item.dateObj));
};

export function useSalesCore() {
  // 1. ESTADO
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [topProductsLimit, setTopProductsLimit] = useState(10);
  const [evolutionScope, setEvolutionScope] = useState('loja'); 
  const [evolutionSelection, setEvolutionSelection] = useState('');
  const [multiStores, setMultiStores] = useState(['', '', '', '', '']);

  // 2. HANDLERS BÁSICOS
  const handleMultiStoreChange = (index, value) => {
    setMultiStores(prev => {
      const newStores = [...prev];
      newStores[index] = value;
      return newStores;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: false, 
      skipEmptyLines: true,
      delimiter: "", // Auto-deteta vírgula, ponto e vírgula ou tabulações
      complete: (results) => setData(parseSalesCSV(results.data))
    });
  };

  // 3. PROCESSAMENTO DE DATAS E FILTROS BASE
  const { minCsvDate, maxCsvDate } = useMemo(() => {
    if (!data.length) return { minCsvDate: null, maxCsvDate: null };
    let min = data[0].dateObj.getTime(), max = min;
    for(let i = 1; i < data.length; i++) { const t = data[i].dateObj.getTime(); if(t < min) min = t; if(t > max) max = t; }
    return { minCsvDate: new Date(min), maxCsvDate: new Date(max) };
  }, [data]);
  
  const dateError = useMemo(() => {
    if (!startDate && !endDate) return null;
    if (!maxCsvDate || !minCsvDate) return null;
    const start = startDate ? new Date(`${startDate}T00:00:00`) : minCsvDate;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : maxCsvDate;
    if (end > maxCsvDate || start < minCsvDate) return `Atenção: Período fora do limite.`;
    return null;
  }, [startDate, endDate, minCsvDate, maxCsvDate]);
  
  const dateFilteredData = useMemo(() => {
    if (!data.length) return [];
    if (!startDate || !endDate) return data;
    const start = new Date(`${startDate}T00:00:00`), end = new Date(`${endDate}T23:59:59`);
    return data.filter(item => item.dateObj >= start && item.dateObj <= end);
  }, [data, startDate, endDate]);

  const regularData = useMemo(() => dateFilteredData.filter(item => !item.isService), [dateFilteredData]);
  const serviceData = useMemo(() => dateFilteredData.filter(item => item.isService), [dateFilteredData]);
  
  const totalDays = useMemo(() => {
    if (!data.length) return 1;
    if (startDate && endDate) return Math.max(1, Math.ceil((new Date(`${endDate}T23:59:59`) - new Date(`${startDate}T00:00:00`)) / (1000 * 60 * 60 * 24)));
    return new Set(data.map(item => item.dateStr)).size || 1;
  }, [data, startDate, endDate]);

  // Listas Únicas para Dropdowns
  const uniqueProductsData = useMemo(() => Array.from(new Map(data.filter(i => !i.isService).map(i => [i.code, i.name])).entries()).map(([code, name]) => ({ code, name })), [data]);
  const uniqueCategories = useMemo(() => [...new Set(regularData.map(i => i.category))].sort(), [regularData]);
  const uniqueStores = useMemo(() => [...new Set(regularData.map(i => i.store))].sort(), [regularData]);
  const uniqueCities = useMemo(() => [...new Set(regularData.map(i => i.city))].sort(), [regularData]);

  // 4. INTEGRAÇÃO DOS SUB-DOMÍNIOS
  const metrics = useSalesMetrics({ 
    dateFilteredData, regularData, serviceData, selectedCategory, selectedStore, topProductsLimit, totalDays 
  });

  const evolution = useSalesEvolution({ 
    dateFilteredData, regularData, evolutionScope, evolutionSelection, multiStores 
  });

  return {
    data, dateFilteredData, regularData, totalDays, startDate, setStartDate, endDate, setEndDate,
    selectedCategory, setSelectedCategory, selectedStore, setSelectedStore,
    topProductsLimit, setTopProductsLimit, evolutionScope, setEvolutionScope,
    evolutionSelection, setEvolutionSelection, multiStores, handleMultiStoreChange,
    handleFileUpload, uniqueProductsData, uniqueCategories, uniqueStores, uniqueCities, dateError,
    
    // Spread dos módulos externos mantendo as chaves originais
    ...metrics,
    ...evolution,

  };
}