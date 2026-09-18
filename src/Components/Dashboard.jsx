import React, { useState, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, Treemap, LineChart, Line 
} from 'recharts';
import './Dashboard.css';
import logo from '../assets/logo.png';

const formatCurrency = (value) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDateBr = (dateObj) => {
  if (!dateObj) return '';
  return dateObj.toLocaleDateString('pt-BR');
};

const PrintIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

// --- COMPONENTE ACCORDION (SANFONA) ---
const AccordionSection = ({ id, title, subtitle, printSection, isPrinting, handlePrint, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isThisPrinting = isPrinting && printSection === id;
  const getPrintClass = () => (isPrinting && printSection === id ? 'print-active' : (isPrinting ? 'no-print' : ''));

  return (
    <section className={`card table-section ${getPrintClass()}`}>
      <div 
        className="section-header" 
        style={{ cursor: 'pointer', marginBottom: isOpen || isThisPrinting ? '1.5rem' : '0', userSelect: 'none' }} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="chart-title" style={{ marginBottom: subtitle ? '0.5rem' : '0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ transform: isOpen || isThisPrinting ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', minWidth: '16px' }}>
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
            {title}
          </h3>
          {subtitle && <p className="kpi-subtext no-print" style={{ margin: 0, paddingLeft: '1.5rem' }}>{subtitle}</p>}
        </div>
        <button className="print-btn no-print" onClick={(e) => { e.stopPropagation(); handlePrint(id); }}>
          <PrintIcon /> Imprimir
        </button>
      </div>
      {(isOpen || isThisPrinting) && (
        <div className="accordion-content">
          {children}
        </div>
      )}
    </section>
  );
};

const SERVICE_KEYWORDS = ['ACRÉSCIMO', 'ACRESCIMO', 'GARANTIA', 'RECARGA', 'SEGURO'];
const SERVICE_CODES = ['19466', '15489'];
const PIE_COLORS = ['#059669', '#f97316']; 

const CATEGORY_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#64748b', '#84cc16'
];

const TreemapCustomContent = ({ depth, x, y, width, height, index, name, value }) => {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} stroke="#fff" strokeWidth={2} />
      {width > 65 && height > 40 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={11} fontWeight="bold">
          <tspan x={x + width / 2} dy="-0.5em">{name}</tspan>
          <tspan x={x + width / 2} dy="1.4em" fontSize={10} fontWeight="normal">{formatCurrency(value)}</tspan>
        </text>
      )}
    </g>
  );
};

const RAW_STORE_JSON = {
  "Lojas de Shoppping em Recife": { "04": "S.Guararapes", "33": "S.Boa Vista", "123": "S.North Way Paulista", "124": "S.Tacaruna", "130": "S.Patteo Olinda" },
  "Lojas Região Metropolitana Recife": { "01": "Centro", "09": "Palma", "13": "Paulista", "23": "Concordia", "24": "Camaragibe", "46": "Imbiribeira", "57": "C. Amarela 1", "58": "C Amarela 2", "60": "Afogados", "61": "S. Lourenço", "62": "Abreu e Lima", "64": "Agua Fria", "78": "Peixinhos 2", "79": "Peixinhos", "87": "Jaboatão centro", "89": "Palma/Concordia", "95": "Beberibe", "114": "Cavaleiro", "115": "Prazeres 01", "117": "Prazeres 02", "129": "Cavaleiro II", "132": "Igarassu" },
  "Lojas Interior PB": { "12": "Guarabira", "17": "Centro Campina Grande" },
  "Lojas do Interior Pernambuco": { "07": "Bezerros", "08": "Goiana 2", "37": "Garanhuns", "39": "Cabo", "55": "Palmares", "59": "Serra Talhada", "63": "Barreiros", "66": "Carpina", "70": "Timbauba", "71": "Goiana", "72": "Ipojuca", "76": "Toritama", "88": "Cabo 2", "91": "Af. Ingazeira", "92": "S.J. Egito", "102": "Petrolina", "105": "Escada", "107": "Sh Costa Dourada", "110": "Limoeiro", "125": "Santa Cruz", "133": "Surubim2" },
  "Lojas de Natal RN": { "14": "Cid. Alta", "15": "Alecrim", "16": "Cid. Alta", "50": "Sho Midway", "111": "Igapó", "134": "Parnamirim", "135": "Natal Alecrim II", "137": "Partage Shopping" },
  "Lojas de João Pessoa PB": { "10": "Shop Manaira", "35": "Centro", "81": "Mangabeira", "97": "Centro" },
  "Lojas de Fortaleza CE": { "19": "Centro", "20": "S. North way", "43": "Centro", "73": "Shop. Joquei", "100": "General Sampaio" },
  "Lojas da BA": { "99": "Juazeiro", "101": "P. Afonso" },
  "Lojas de Interior RN": { "38": "Centro", "54": "Centro", "118": "Mossoró", "131": "Caicó" },
  "Lojas de Vitoria": { "06": "Centro", "96": "VITORIA" },
  "Lojas de Caruaru": { "25": "Centro", "47A": "Nsª Sra das Dores", "47B": "Nsª Sra Dores", "122": "North Shopping" },
  "Lojas de Maceio AL": { "26": "Centro", "27": "Centro", "29": "Centro", "74": "São Miguel", "86": "Shop Pátio", "120": "Centro", "126": "Delmiro Gouveia", "127": "Palmeira Índios" },
  "Lojas de Arapiraca AL": { "30": "Centro", "67": "Centro" }
};

const STORE_MAP = {};
Object.entries(RAW_STORE_JSON).forEach(([regionName, stores]) => {
  let state = 'BR';
  if (/Recife|Pernambuco|Vitoria|Caruaru/i.test(regionName)) state = 'PE';
  else if (/PB|Pessoa/i.test(regionName)) state = 'PB';
  else if (/RN|Natal/i.test(regionName)) state = 'RN';
  else if (/CE|Fortaleza/i.test(regionName)) state = 'CE';
  else if (/BA/i.test(regionName)) state = 'BA';
  else if (/AL|Maceio|Arapiraca/i.test(regionName)) state = 'AL';

  const cleanRegion = regionName.replace(/^Lojas (de |do |da )?/i, '');

  Object.entries(stores).forEach(([id, name]) => {
    const display = `[${id}] ${name} - ${cleanRegion} (${state})`;
    STORE_MAP[id] = display;
    STORE_MAP[parseInt(id, 10).toString()] = display; 
  });
});

export default function Dashboard() {
  const [data, setData] = useState([]);
  
  const [singleInputCode, setSingleInputCode] = useState('');
  const [singleInputName, setSingleInputName] = useState('');
  const [activeSingleCode, setActiveSingleCode] = useState(''); 

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [topProductsLimit, setTopProductsLimit] = useState(10);
  const [activeTab, setActiveTab] = useState('visao-geral');

  const [printSection, setPrintSection] = useState(null);
  const isPrinting = printSection !== null;

  const [evolutionScope, setEvolutionScope] = useState('loja'); 
  const [evolutionSelection, setEvolutionSelection] = useState('');
  const [multiStores, setMultiStores] = useState(['', '', '', '', '']);

  const handlePrint = (sectionId) => {
    setPrintSection(sectionId);
    setTimeout(() => {
      window.print();
      setPrintSection(null);
    }, 400); 
  };

  const getPrintClass = (id) => (isPrinting && printSection === id ? 'print-active' : '');

  const [multiProducts, setMultiProducts] = useState([
    { code: '', name: '', startDate: '', endDate: '' },
    { code: '', name: '', startDate: '', endDate: '' },
    { code: '', name: '', startDate: '', endDate: '' },
    { code: '', name: '', startDate: '', endDate: '' },
    { code: '', name: '', startDate: '', endDate: '' }
  ]);

  const handleSingleCodeBlur = () => {
    if (!singleInputCode) return;
    const match = data.find(item => item.code.toUpperCase() === singleInputCode.trim().toUpperCase());
    if (match) {
      setSingleInputName(match.name);
      setActiveSingleCode(match.code);
    } else {
      setActiveSingleCode(singleInputCode.trim()); 
    }
  };

  const handleSingleNameBlur = () => {
    if (!singleInputName) return;
    const upperInput = singleInputName.trim().toUpperCase();
    const match = data.find(item => item.name.toUpperCase().includes(upperInput));
    if (match) {
      setSingleInputCode(match.code);
      setSingleInputName(match.name); 
      setActiveSingleCode(match.code);
    }
  };

  const handleMultiCodeBlur = (index) => {
    const mp = multiProducts[index];
    if (!mp.code) return;
    const match = data.find(item => item.code.toUpperCase() === mp.code.trim().toUpperCase());
    if (match) {
      const newMulti = [...multiProducts];
      newMulti[index].code = match.code;
      newMulti[index].name = match.name;
      setMultiProducts(newMulti);
    }
  };

  const handleMultiNameBlur = (index) => {
    const mp = multiProducts[index];
    if (!mp.name) return;
    const upperInput = mp.name.trim().toUpperCase();
    const match = data.find(item => item.name.toUpperCase().includes(upperInput));
    if (match) {
      const newMulti = [...multiProducts];
      newMulti[index].code = match.code;
      newMulti[index].name = match.name;
      setMultiProducts(newMulti);
    }
  };

  const handleMultiProductChange = (index, field, value) => {
    const newMulti = [...multiProducts];
    newMulti[index][field] = value;
    setMultiProducts(newMulti);
  };

  const handleMultiStoreChange = (index, value) => {
    const newStores = [...multiStores];
    newStores[index] = value;
    setMultiStores(newStores);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data.map(row => {
          const [day, month, year] = (row[3] || '').split('/');
          const rawTotal = row[7] ? String(row[7]).replace(/\./g, '').replace(',', '.') : '0';
          
          const codeStr = String(row[0] || '').trim();
          const nameStr = String(row[1] || '').trim();
          const nameUpper = nameStr.toUpperCase();
          const rawStoreId = String(row[4] || '').trim();
          
          const isService = SERVICE_KEYWORDS.some(svc => nameUpper.includes(svc)) || SERVICE_CODES.includes(codeStr);
          const storeDisplay = STORE_MAP[rawStoreId] || (rawStoreId ? `[${rawStoreId}] Loja Desconhecida` : 'N/A');

          return {
            code: codeStr,
            name: nameStr || 'Sem Descrição', 
            dateStr: row[3],
            dateObj: new Date(`${year}-${month}-${day}T00:00:00`),
            store: storeDisplay,
            qty: parseFloat(row[5]) || 0,
            totalValue: parseFloat(rawTotal) || 0,
            category: row[11] ? row[11].trim() : 'Indefinida',
            city: row[16] ? row[16].trim() : 'Indefinida',
            isService: isService
          };
        }).filter(item => !isNaN(item.dateObj));
        
        setData(parsedData);
      }
    });
  };

  const uniqueProductsData = useMemo(() => {
    const map = new Map();
    data.forEach(item => {
      if (!map.has(item.code) && !item.isService) {
        map.set(item.code, item.name);
      }
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [data]);

  const { minCsvDate, maxCsvDate } = useMemo(() => {
    if (!data.length) return { minCsvDate: null, maxCsvDate: null };
    let min = data[0].dateObj.getTime();
    let max = data[0].dateObj.getTime();
    for(let i = 1; i < data.length; i++) {
      const time = data[i].dateObj.getTime();
      if(time < min) min = time;
      if(time > max) max = time;
    }
    return { minCsvDate: new Date(min), maxCsvDate: new Date(max) };
  }, [data]);

  const dateError = useMemo(() => {
    if (!startDate && !endDate) return null;
    if (!maxCsvDate || !minCsvDate) return null;
    const start = startDate ? new Date(`${startDate}T00:00:00`) : minCsvDate;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : maxCsvDate;
    if (end > maxCsvDate || start < minCsvDate) {
      return `Atenção: Período selecionado fora do limite do arquivo. O CSV contém dados de ${formatDateBr(minCsvDate)} até ${formatDateBr(maxCsvDate)}.`;
    }
    return null;
  }, [startDate, endDate, minCsvDate, maxCsvDate]);

  const dateFilteredData = useMemo(() => {
    if (!data.length) return [];
    if (!startDate || !endDate) return data;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);
    return data.filter(item => item.dateObj >= start && item.dateObj <= end);
  }, [data, startDate, endDate]);

  const regularData = useMemo(() => dateFilteredData.filter(item => !item.isService), [dateFilteredData]);
  const serviceData = useMemo(() => dateFilteredData.filter(item => item.isService), [dateFilteredData]);

  const totalDays = useMemo(() => {
    if (!data.length) return 1;
    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T23:59:59`);
      return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    }
    return new Set(data.map(item => item.dateStr)).size || 1;
  }, [data, startDate, endDate]);

  const revenueOverview = useMemo(() => {
    let totalProducts = 0;
    let totalServices = 0;
    dateFilteredData.forEach(item => {
      if (item.isService) totalServices += item.totalValue;
      else totalProducts += item.totalValue;
    });
    return {
      totalGeral: totalProducts + totalServices,
      totalProducts,
      totalServices,
      pieData: [
        { name: 'Produtos Físicos', value: totalProducts },
        { name: 'Serviços/Financeiro', value: totalServices }
      ]
    };
  }, [dateFilteredData]);

  const categoryRevenueData = useMemo(() => {
    const catMap = {};
    let totalRevenueFisico = 0;
    regularData.forEach(item => {
      if (!catMap[item.category]) catMap[item.category] = 0;
      catMap[item.category] += item.totalValue;
      totalRevenueFisico += item.totalValue;
    });
    const sortedCategories = Object.keys(catMap).map(cat => ({ name: cat, value: catMap[cat] })).sort((a, b) => b.value - a.value);
    const threshold = totalRevenueFisico * 0.02;
    const result = [];
    let outrosValue = 0;
    sortedCategories.forEach(cat => {
      if (cat.value >= threshold) result.push(cat);
      else outrosValue += cat.value;
    });
    if (outrosValue > 0) result.push({ name: 'OUTROS', value: outrosValue });
    return result;
  }, [regularData]);

  const { totalSold, chartData, searchedProductName } = useMemo(() => {
    if (!data.length || !activeSingleCode) return { totalSold: 0, chartData: [], searchedProductName: '' };
    
    const nameMatch = data.find(item => item.code === activeSingleCode);
    const name = nameMatch ? nameMatch.name : 'Produto não encontrado';
    const targetData = dateFilteredData.filter(item => item.code === activeSingleCode);
    
    const total = targetData.reduce((acc, curr) => acc + curr.qty, 0);
    const aggregatedByDate = targetData.reduce((acc, curr) => {
      acc[curr.dateStr] = (acc[curr.dateStr] || 0) + curr.qty;
      return acc;
    }, {});
    
    const chart = Object.keys(aggregatedByDate).map(date => ({
      data: date,
      quantidade: aggregatedByDate[date]
    })).sort((a, b) => {
      const [d1, m1, y1] = a.data.split('/');
      const [d2, m2, y2] = b.data.split('/');
      return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
    });
    
    return { totalSold: total, chartData: chart, searchedProductName: name };
  }, [data, dateFilteredData, activeSingleCode]);

  const multiProductsData = useMemo(() => {
    if (!data.length) return [];
    return multiProducts.map(filter => {
      if (!filter.code) return null; 
      
      const targetCode = filter.code.trim();
      const nameMatch = data.find(item => item.code === targetCode);
      const name = nameMatch ? nameMatch.name : 'Produto não encontrado';
      
      let targetData = data.filter(item => item.code === targetCode);
      
      if (filter.startDate || filter.endDate) {
        const start = filter.startDate ? new Date(`${filter.startDate}T00:00:00`) : new Date('2000-01-01');
        const end = filter.endDate ? new Date(`${filter.endDate}T23:59:59`) : new Date('2100-01-01');
        targetData = targetData.filter(item => item.dateObj >= start && item.dateObj <= end);
      }
      
      const total = targetData.reduce((acc, curr) => acc + curr.qty, 0);
      const aggregatedByDate = targetData.reduce((acc, curr) => {
        acc[curr.dateStr] = (acc[curr.dateStr] || 0) + curr.qty;
        return acc;
      }, {});
      
      const chart = Object.keys(aggregatedByDate).map(date => ({
        data: date,
        quantidade: aggregatedByDate[date]
      })).sort((a, b) => {
        const [d1, m1, y1] = a.data.split('/');
        const [d2, m2, y2] = b.data.split('/');
        return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
      });
      
      return { code: targetCode, name, total, chartData: chart };
    });
  }, [data, multiProducts]);

  const uniqueCategories = useMemo(() => [...new Set(regularData.map(item => item.category))].sort(), [regularData]);
  const uniqueStores = useMemo(() => [...new Set(regularData.map(item => item.store))].sort(), [regularData]);
  const uniqueCities = useMemo(() => [...new Set(regularData.map(item => item.city))].sort(), [regularData]);

  const storeProductsByQty = useMemo(() => {
    if (!selectedStore) return [];
    const productMap = {};
    regularData.filter(item => item.store === selectedStore).forEach(item => {
      if (!productMap[item.code]) productMap[item.code] = { code: item.code, name: item.name, totalQty: 0, totalRevenue: 0 };
      productMap[item.code].totalQty += item.qty;
      productMap[item.code].totalRevenue += item.totalValue;
    });
    return Object.values(productMap).sort((a, b) => b.totalQty - a.totalQty).slice(0, topProductsLimit);
  }, [regularData, selectedStore, topProductsLimit]);

  const storeProductsByRevenue = useMemo(() => {
    if (!selectedStore) return [];
    const productMap = {};
    regularData.filter(item => item.store === selectedStore).forEach(item => {
      if (!productMap[item.code]) productMap[item.code] = { code: item.code, name: item.name, totalQty: 0, totalRevenue: 0 };
      productMap[item.code].totalQty += item.qty;
      productMap[item.code].totalRevenue += item.totalValue;
    });
    return Object.values(productMap).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, topProductsLimit);
  }, [regularData, selectedStore, topProductsLimit]);

  const top10Products = useMemo(() => {
    const productMap = {};
    regularData.forEach(item => {
      if (!productMap[item.code]) productMap[item.code] = { code: item.code, name: item.name, totalQty: 0 };
      productMap[item.code].totalQty += item.qty;
    });
    return Object.values(productMap).sort((a, b) => b.totalQty - a.totalQty).slice(0, 10).map(prod => ({ ...prod, avgPerDay: (prod.totalQty / totalDays).toFixed(2) }));
  }, [regularData, totalDays]);

  const top10ProductsByRevenue = useMemo(() => {
    const productMap = {};
    regularData.forEach(item => {
      if (!productMap[item.code]) productMap[item.code] = { code: item.code, name: item.name, totalQty: 0, totalRevenue: 0 };
      productMap[item.code].totalQty += item.qty;
      productMap[item.code].totalRevenue += item.totalValue;
    });
    return Object.values(productMap).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);
  }, [regularData]);

  const categoryRanking = useMemo(() => {
    if (!selectedCategory) return [];
    const productMap = {};
    regularData.filter(item => item.category === selectedCategory).forEach(item => {
      if (!productMap[item.code]) productMap[item.code] = { code: item.code, name: item.name, totalQty: 0 };
      productMap[item.code].totalQty += item.qty;
    });
    return Object.values(productMap).sort((a, b) => b.totalQty - a.totalQty).map(prod => ({ ...prod, avgPerDay: (prod.totalQty / totalDays).toFixed(2) }));
  }, [regularData, selectedCategory, totalDays]);

  const topPerCategory = useMemo(() => {
    const catMap = {};
    regularData.forEach(item => {
      if (!catMap[item.category]) catMap[item.category] = {};
      if (!catMap[item.category][item.code]) catMap[item.category][item.code] = { code: item.code, name: item.name, qty: 0 };
      catMap[item.category][item.code].qty += item.qty;
    });
    const result = [];
    for (const cat in catMap) {
      const products = Object.values(catMap[cat]);
      products.sort((a, b) => b.qty - a.qty);
      if (products.length > 0) result.push({ category: cat, code: products[0].code, name: products[0].name, totalQty: products[0].qty });
    }
    return result.sort((a, b) => b.totalQty - a.totalQty);
  }, [regularData]);

  const cityRanking = useMemo(() => {
    const cityMap = {};
    regularData.forEach(item => {
      if (!cityMap[item.city]) cityMap[item.city] = { city: item.city, totalQty: 0 };
      cityMap[item.city].totalQty += item.qty;
    });
    return Object.values(cityMap).sort((a, b) => b.totalQty - a.totalQty);
  }, [regularData]);

  const storePerformance = useMemo(() => {
    const storeMap = {};
    regularData.forEach(item => {
      if (!storeMap[item.store]) storeMap[item.store] = { store: item.store, totalQty: 0, totalRevenue: 0, products: {} };
      storeMap[item.store].totalQty += item.qty;
      storeMap[item.store].totalRevenue += item.totalValue;
      if (!storeMap[item.store].products[item.code]) storeMap[item.store].products[item.code] = { name: item.name, qty: 0 };
      storeMap[item.store].products[item.code].qty += item.qty;
    });
    return Object.values(storeMap).map(store => {
      const topProduct = Object.values(store.products).sort((a, b) => b.qty - a.qty)[0];
      return { ...store, topProductName: topProduct ? topProduct.name : '-', topProductQty: topProduct ? topProduct.qty : 0 };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [regularData]);

  // NOVO: Qual loja vende mais de cada categoria (por volume)
  const topStorePerCategory = useMemo(() => {
    const catMap = {};
    regularData.forEach(item => {
      if (!catMap[item.category]) catMap[item.category] = {};
      if (!catMap[item.category][item.store]) catMap[item.category][item.store] = { store: item.store, qty: 0, revenue: 0 };
      catMap[item.category][item.store].qty += item.qty;
      catMap[item.category][item.store].revenue += item.totalValue;
    });
    const result = [];
    for (const cat in catMap) {
      const stores = Object.values(catMap[cat]);
      stores.sort((a, b) => b.qty - a.qty);
      if (stores.length > 0) {
        result.push({ 
          category: cat, 
          store: stores[0].store, 
          totalQty: stores[0].qty, 
          totalRevenue: stores[0].revenue 
        });
      }
    }
    return result.sort((a, b) => b.totalQty - a.totalQty);
  }, [regularData]);

  const servicePerformance = useMemo(() => {
    const svcMap = {};
    let totalGeral = 0;
    serviceData.forEach(item => {
      if (!svcMap[item.code]) svcMap[item.code] = { code: item.code, name: item.name, totalQty: 0, totalRevenue: 0 };
      svcMap[item.code].totalQty += item.qty;
      svcMap[item.code].totalRevenue += item.totalValue;
      totalGeral += item.totalValue;
    });
    return { items: Object.values(svcMap).sort((a, b) => b.totalRevenue - a.totalRevenue), totalGeral };
  }, [serviceData]);

  const evolutionChartData = useMemo(() => {
    if (!evolutionSelection) return [];
    
    const filtered = regularData.filter(item => {
      if (evolutionScope === 'loja') return item.store === evolutionSelection;
      return item.city === evolutionSelection;
    });

    const map = {};
    filtered.forEach(item => {
      if (!map[item.dateStr]) {
        map[item.dateStr] = { data: item.dateStr, faturamento: 0, dateObj: item.dateObj };
      }
      map[item.dateStr].faturamento += item.totalValue;
    });

    return Object.values(map).sort((a, b) => a.dateObj - b.dateObj);
  }, [regularData, evolutionScope, evolutionSelection]);

  const comparativeStoreEvolution = useMemo(() => {
    const activeStores = multiStores.filter(s => s.trim() !== '');
    if (!regularData.length || activeStores.length === 0) return { chartData: [], lines: [] };

    const map = {};
    regularData.forEach(item => {
      if (!map[item.dateStr]) {
        map[item.dateStr] = { data: item.dateStr, dateObj: item.dateObj };
        activeStores.forEach(s => map[item.dateStr][s] = 0);
      }
      if (activeStores.includes(item.store)) {
        map[item.dateStr][item.store] += item.totalValue;
      }
    });

    const chartData = Object.values(map).sort((a, b) => a.dateObj - b.dateObj);
    return { chartData, lines: activeStores };
  }, [regularData, multiStores]);
  
  
  const inputRef = useRef(null);
  
    const handleDivClick = ()=>{
      inputRef.current.click()
    }
  return (
    <div className={`dashboard-container ${isPrinting ? 'is-printing' : ''}`}>
      
      <datalist id="codes-datalist">
        {uniqueProductsData.map((prod) => <option key={`c-${prod.code}`} value={prod.code} />)}
      </datalist>
      <datalist id="names-datalist">
        {uniqueProductsData.map((prod) => <option key={`n-${prod.code}`} value={prod.name} />)}
      </datalist>

      <header className={`header ${isPrinting ? 'no-print' : ''}`}>
        <div className="header-content">
          <img src={logo} alt="Logo" className="logo-img" />
          <h1 className="header-title">Dashboard de Vendas</h1>
        </div>
      </header>

      <main className="main-content">
        
        <section className={`card ${getPrintClass('filtros')} no-print`}>
          <h2 className="filters-title">Filtros Globais de Dados</h2>
          
          {dateError && (
            <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 500, border: '1px solid #fecaca' }}>
              {dateError}
            </div>
          )}
            <section className="card" onClick={handleDivClick} style={{ border: '2px dashed #f97316', backgroundColor: '#fff7ed', textAlign: 'center' , cursor: 'pointer' }}>
          <h2 className="filters-title" style={{ borderBottom: 'none', color: '#c2410c', marginBottom: '0.5rem' }}>1. Importe o CSV de Vendas</h2>
          <input 
            type="file"
            ref={inputRef}
            accept=".csv" 
            onChange={handleFileUpload} 
            className="file-input" 
            style={{ margin: '0 auto', display: 'block' }} 
          />
        </section>
          <div className="filters-grid">
            <div className="input-group">
              <label>Data Inicial</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
            </div>
            <div className="input-group">
              <label>Data Final</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" />
            </div>
          </div>
        </section>

        {data.length > 0 && (
          <div className={`tabs-container ${isPrinting ? 'no-print' : ''}`}>
            <div className="tabs-header">
              <button className={`tab-button ${activeTab === 'visao-geral' ? 'active' : ''}`} onClick={() => setActiveTab('visao-geral')}>
                Visão Geral
              </button>
              <button className={`tab-button ${activeTab === 'produtos' ? 'active' : ''}`} onClick={() => setActiveTab('produtos')}>
                Produtos & Categorias
              </button>
              <button className={`tab-button ${activeTab === 'lojas' ? 'active' : ''}`} onClick={() => setActiveTab('lojas')}>
                Lojas & Cidades
              </button>
              <button className={`tab-button ${activeTab === 'servicos' ? 'active' : ''}`} onClick={() => setActiveTab('servicos')}>
                Serviços Financeiros
              </button>
            </div>
          </div>
        )}

        {/* =========================================
            ABA 1: VISÃO GERAL
        ========================================= */}
        {activeTab === 'visao-geral' && data.length > 0 && (
          <>
            {revenueOverview.totalGeral > 0 && (
              <section className={`results-grid ${getPrintClass('macro')}`} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginBottom: '2rem' }}>
                <div className="no-print" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginBottom: '-1rem' }}>
                  <button className="print-btn" onClick={() => handlePrint('macro')}>
                    <PrintIcon /> Imprimir Macro
                  </button>
                </div>

                <div className="card kpi-card" style={{ backgroundColor: '#fff7ed', borderColor: '#fdba74' }}>
                  <span className="kpi-label" style={{ color: '#c2410c' }}>Faturamento Total (Bruto)</span>
                  <span className="kpi-value" style={{ fontSize: '2.5rem' }}>{formatCurrency(revenueOverview.totalGeral)}</span>
                  <span className="kpi-subtext" style={{ fontWeight: 'bold', color: '#374151', marginTop: '1rem' }}>
                    Produtos: <span style={{ color: '#059669' }}>{formatCurrency(revenueOverview.totalProducts)}</span>
                  </span>
                  <span className="kpi-subtext" style={{ fontWeight: 'bold', color: '#374151' }}>
                    Serviços: <span style={{ color: '#ea580c' }}>{formatCurrency(revenueOverview.totalServices)}</span>
                  </span>
                </div>

                <div className="card">
                  <h3 className="chart-title" style={{ textAlign: 'center' }}>Macro: Produtos vs Serviços</h3>
                  <div className="chart-container" style={{ height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={revenueOverview.pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {revenueOverview.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <h3 className="chart-title" style={{ textAlign: 'center' }}>Faturamento por Categoria (Heatmap)</h3>
                  <div className="chart-container" style={{ height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <Treemap
                        data={categoryRevenueData}
                        dataKey="value"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        content={<TreemapCustomContent />}
                      >
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </Treemap>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            )}

            {top10Products.length > 0 && (
              <section className={`card table-section ${getPrintClass('top10')}`}>
                <div className="section-header">
                  <h3 className="chart-title">Top 10 Produtos Mais Vendidos (Geral)</h3>
                  <button className="print-btn no-print" onClick={() => handlePrint('top10')}>
                    <PrintIcon /> Imprimir Tabela
                  </button>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Código</th>
                        <th>Produto</th>
                        <th>Total Vendido</th>
                        <th>Média/Dia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top10Products.map((produto, index) => (
                        <tr key={produto.code}>
                          <td><span className="rank-badge">{index + 1}</span></td>
                          <td>{produto.code}</td>
                          <td style={{ fontWeight: 500 }}>{produto.name}</td>
                          <td>{produto.totalQty}</td>
                          <td>{produto.avgPerDay}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}

        {/* =========================================
            ABA 2: PRODUTOS & CATEGORIAS
        ========================================= */}
        {activeTab === 'produtos' && data.length > 0 && (
          <>
            <section className={`results-grid ${getPrintClass('prod-unico')}`} style={{ marginBottom: '2rem' }}>
              <div className="no-print" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginBottom: '-1rem' }}>
                <button className="print-btn" onClick={() => handlePrint('prod-unico')}>
                  <PrintIcon /> Imprimir Análise Única
                </button>
              </div>

              <div className="card kpi-card" style={{ alignSelf: 'start' }}>
                <div className="no-print" style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                  <div className="input-group">
                    <label>Código do Produto</label>
                    <input 
                      type="text" 
                      list="codes-datalist"
                      placeholder="Ex: 1057" 
                      value={singleInputCode} 
                      onChange={e => setSingleInputCode(e.target.value)} 
                      onBlur={handleSingleCodeBlur}
                      className="input-field" 
                    />
                  </div>
                  <div className="input-group">
                    <label>Nome do Produto (SKU)</label>
                    <input 
                      type="text" 
                      list="names-datalist"
                      placeholder="Ex: TV 32 POLEGADAS..." 
                      value={singleInputName} 
                      onChange={e => setSingleInputName(e.target.value)} 
                      onBlur={handleSingleNameBlur}
                      className="input-field" 
                    />
                  </div>
                </div>

                <span className="kpi-label">Total Vendido</span>
                <span className="kpi-value">{totalSold}</span>
                <span className="kpi-subtext" style={{ fontWeight: 'bold', color: '#374151', marginTop: '0.75rem' }}>
                  {searchedProductName || 'Aguardando código'}
                </span>
              </div>

              <div className="card">
                <h3 className="chart-title">Evolução Diária do Produto</h3>
                {chartData.length > 0 ? (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="quantidade" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="empty-chart">
                    <p>Insira um código válido para gerar o gráfico.</p>
                  </div>
                )}
              </div>
            </section>

            <section className={`card table-section ${getPrintClass('prod-multi')}`} style={{ border: '1px solid #d1d5db', backgroundColor: '#fafafa' }}>
              <div className="section-header">
                <div>
                  <h3 className="chart-title">Análise Individualizada (Até 5 Produtos)</h3>
                  <p className="kpi-subtext no-print" style={{ margin: 0 }}>Compara múltiplos códigos configurando o período independente. (Ignora data global).</p>
                </div>
                <button className="print-btn no-print" onClick={() => handlePrint('prod-multi')}>
                  <PrintIcon /> Imprimir Bloco
                </button>
              </div>

              <div className="no-print" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginBottom: '2rem' ,flexWrap: 'wrap' }}>
                {multiProducts.map((mp, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 'bold', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', backgroundColor: '#f3f4f6', borderRadius: '50%' }}>{idx + 1}</span>
                    <div className="input-group" style={{ flex: '1', minWidth: '100px' }}>
                      <label>Código</label>
                      <input 
                        type="text" 
                        list="codes-datalist"
                        value={mp.code} 
                        onChange={e => handleMultiProductChange(idx, 'code', e.target.value)}
                        onBlur={() => handleMultiCodeBlur(idx)}
                        className="input-field" 
                        placeholder="Ex: 1057" 
                      />
                    </div>
                    <div className="input-group" style={{ flex: '2', minWidth: '200px' }}>
                      <label>Nome do Produto (SKU)</label>
                      <input 
                        type="text" 
                        list="names-datalist"
                        value={mp.name} 
                        onChange={e => handleMultiProductChange(idx, 'name', e.target.value)}
                        onBlur={() => handleMultiNameBlur(idx)}
                        className="input-field" 
                        placeholder="Ex: TV 32..." 
                      />
                    </div>
                    <div className="input-group" style={{ flex: '1', minWidth: '130px' }}>
                      <label>Data Inicial</label>
                      <input type="date" value={mp.startDate} onChange={e => handleMultiProductChange(idx, 'startDate', e.target.value)} className="input-field" />
                    </div>
                    <div className="input-group" style={{ flex: '1', minWidth: '130px' }}>
                      <label>Data Final</label>
                      <input type="date" value={mp.endDate} onChange={e => handleMultiProductChange(idx, 'endDate', e.target.value)} className="input-field" />
                    </div>
                  </div>
                ))}
              </div>

              {multiProductsData.some(item => item !== null) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {multiProductsData.map((prodData, idx) => {
                    if (!prodData) return null;
                    return (
                      <div key={idx} className="results-grid" style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div className="kpi-card" style={{ alignSelf: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span className="kpi-label" style={{ color: '#3b82f6' }}>CÓD. {prodData.code}</span>
                          <span className="kpi-value" style={{ fontSize: '2.5rem', background: 'none', color: '#1f2937' }}>{prodData.total}</span>
                          <span className="kpi-subtext" style={{ fontWeight: 'bold', color: '#4b5563', marginTop: '0.5rem' }}>{prodData.name}</span>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '1rem', textTransform: 'uppercase' }}>Evolução no Período</h4>
                          {prodData.chartData.length > 0 ? (
                            <div style={{ height: '180px', width: '100%' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={prodData.chartData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                  <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} dy={5} />
                                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                  <Bar dataKey="quantidade" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="empty-chart" style={{ height: '180px' }}>
                              <p>Sem vendas no período.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {top10ProductsByRevenue.length > 0 && (
              <section className={`card table-section ${getPrintClass('top10-faturamento')}`}>
                <div className="section-header">
                  <div>
                    <h3 className="chart-title" style={{ marginBottom: '0.5rem' }}>Top 10 Produtos por Faturamento</h3>
                    <p className="kpi-subtext" style={{ margin: 0 }}>Os itens que mais geraram receita globalmente.</p>
                  </div>
                  <button className="print-btn no-print" onClick={() => handlePrint('top10-faturamento')}>
                    <PrintIcon /> Imprimir Tabela
                  </button>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Código</th>
                        <th>Produto</th>
                        <th>Receita Gerada</th>
                        <th>Volume (Unidades)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top10ProductsByRevenue.map((produto, index) => (
                        <tr key={produto.code}>
                          <td><span className="rank-badge" style={{ backgroundColor: '#059669' }}>{index + 1}</span></td>
                          <td>{produto.code}</td>
                          <td style={{ fontWeight: 500 }}>{produto.name}</td>
                          <td style={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(produto.totalRevenue)}</td>
                          <td>{produto.totalQty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {uniqueCategories.length > 0 && (
              <section className={`card table-section ${getPrintClass('rank-cat')}`}>
                <div className="category-header">
                  <div>
                    <h3 className="chart-title" style={{ marginBottom: '0.5rem' }}>Ranking por Categoria</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="input-group no-print" style={{ width: '250px' }}>
                      <select className="select-field" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">Selecione uma categoria...</option>
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <button className="print-btn no-print" onClick={() => handlePrint('rank-cat')} style={{ height: '42px' }}>
                      <PrintIcon /> Imprimir
                    </button>
                  </div>
                </div>

                {selectedCategory && (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Código</th>
                          <th>Produto</th>
                          <th>Total Vendido</th>
                          <th>Média/Dia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryRanking.map((produto, index) => (
                          <tr key={produto.code}>
                            <td><span className="rank-badge" style={{ backgroundColor: '#6b7280' }}>{index + 1}</span></td>
                            <td>{produto.code}</td>
                            <td style={{ fontWeight: 500 }}>{produto.name}</td>
                            <td>{produto.totalQty}</td>
                            <td>{produto.avgPerDay}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {topPerCategory.length > 0 && (
              <AccordionSection 
                id="top-cat" 
                title="Produto Mais Vendido de Cada Categoria" 
                printSection={printSection} 
                isPrinting={isPrinting} 
                handlePrint={handlePrint}
              >
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Categoria</th>
                        <th>Código</th>
                        <th>Produto Vencedor</th>
                        <th>Volume Vendas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPerCategory.map((cat) => (
                        <tr key={cat.category}>
                          <td style={{ fontWeight: 'bold', color: '#dc2626' }}>{cat.category}</td>
                          <td>{cat.code}</td>
                          <td style={{ fontWeight: 500 }}>{cat.name}</td>
                          <td>{cat.totalQty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionSection>
            )}
          </>
        )}

        {/* =========================================
            ABA 3: LOJAS & CIDADES
        ========================================= */}
        {activeTab === 'lojas' && data.length > 0 && (
          <>
            <section className={`card table-section ${getPrintClass('evolucao-loja-cidade')}`}>
              <div className="section-header">
                <div>
                  <h3 className="chart-title" style={{ marginBottom: '0.5rem' }}>Evolução de Faturamento Individual</h3>
                  <p className="kpi-subtext no-print" style={{ margin: 0 }}>Acompanhe o faturamento diário segmentando por Loja ou Cidade específica.</p>
                </div>
                <button className="print-btn no-print" onClick={() => handlePrint('evolucao-loja-cidade')}>
                  <PrintIcon /> Imprimir Gráfico
                </button>
              </div>

              <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div className="input-group" style={{ width: '200px' }}>
                  <label>Agrupar por</label>
                  <select className="select-field" value={evolutionScope} onChange={e => { setEvolutionScope(e.target.value); setEvolutionSelection(''); }}>
                    <option value="loja">Loja Específica</option>
                    <option value="cidade">Cidade Inteira</option>
                  </select>
                </div>
                <div className="input-group" style={{ width: '300px' }}>
                  <label>{evolutionScope === 'loja' ? 'Selecione a Loja' : 'Selecione a Cidade'}</label>
                  <select className="select-field" value={evolutionSelection} onChange={e => setEvolutionSelection(e.target.value)}>
                    <option value="">Selecione...</option>
                    {evolutionScope === 'loja' 
                      ? uniqueStores.map(item => <option key={item} value={item}>{item}</option>)
                      : uniqueCities.map(item => <option key={item} value={item}>{item}</option>)
                    }
                  </select>
                </div>
              </div>

              {evolutionSelection && (
                <div className="chart-container" style={{ height: '350px' }}>
                  {evolutionChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={evolutionChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                        <Tooltip 
                          cursor={{ fill: '#f3f4f6' }} 
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                        />
                        <Bar dataKey="faturamento" name="Faturamento" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty-chart">Sem dados de faturamento para o período.</div>
                  )}
                </div>
              )}
            </section>

            <section className={`card table-section ${getPrintClass('comparativo-lojas')}`}>
              <div className="section-header">
                <div>
                  <h3 className="chart-title" style={{ marginBottom: '0.5rem' }}>Comparativo Diário Customizado</h3>
                  <p className="kpi-subtext no-print" style={{ margin: 0 }}>Selecione até 5 lojas manualmente para colocar o faturamento lado a lado.</p>
                </div>
                <button className="print-btn no-print" onClick={() => handlePrint('comparativo-lojas')}>
                  <PrintIcon /> Imprimir Gráfico
                </button>
              </div>

              <div className="no-print" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {multiStores.map((store, idx) => (
                  <div key={idx} className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                     <span style={{ fontWeight: 'bold', color: '#9ca3af', width: '20px' }}>{idx + 1}.</span>
                     <select 
                       className="select-field" 
                       value={store} 
                       onChange={e => handleMultiStoreChange(idx, e.target.value)}
                       style={{ maxWidth: '400px' }}
                     >
                       <option value="">Selecione uma loja para comparar...</option>
                       {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
                ))}
              </div>

              {comparativeStoreEvolution.lines.length > 0 ? (
                <div className="chart-container" style={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={comparativeStoreEvolution.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                      <Tooltip 
                        cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '3 3' }} 
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      />
                      <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                      {comparativeStoreEvolution.lines.map((lineName, index) => (
                        <Line 
                          key={lineName} 
                          type="monotone" 
                          dataKey={lineName} 
                          name={lineName} 
                          stroke={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                          strokeWidth={2} 
                          dot={{ r: 3, strokeWidth: 0 }} 
                          activeDot={{ r: 5 }} 
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="empty-chart">Selecione pelo menos uma loja para visualizar a comparação.</div>
              )}
            </section>

            {uniqueStores.length > 0 && (
              <section className={`card table-section ${getPrintClass('top-loja')}`}>
                <div className="category-header">
                  <div>
                    <h3 className="chart-title" style={{ marginBottom: '0.5rem' }}>Top Produtos por Loja (Volume)</h3>
                    <p className="kpi-subtext no-print" style={{ margin: 0 }}>Analise o que mais vende em quantidade em um estabelecimento específico.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end',flexWrap: 'wrap' }}>
                    <div className="input-group no-print" style={{ width: '250px' }}>
                      <label>Estabelecimento</label>
                      <select className="select-field" value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}>
                        <option value="">Selecione uma loja...</option>
                        {uniqueStores.map(store => <option key={store} value={store}>{store}</option>)}
                      </select>
                    </div>
                    <div className="input-group no-print" style={{ width: '100px' }}>
                      <label>Limite</label>
                      <input type="number" min="1" max="30" value={topProductsLimit} onChange={e => setTopProductsLimit(Math.min(30, Math.max(1, Number(e.target.value))))} className="input-field" />
                    </div>
                    <button className="print-btn no-print" onClick={() => handlePrint('top-loja')} style={{ height: '42px' }}>
                      <PrintIcon /> Imprimir
                    </button>
                  </div>
                </div>

                {selectedStore && (
                  <div className="table-container" style={{ marginTop: '1rem' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Código</th>
                          <th>Produto</th>
                          <th>Volume Vendido</th>
                          <th>Receita</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeProductsByQty.map((produto, index) => (
                          <tr key={produto.code}>
                            <td><span className="rank-badge" style={{ backgroundColor: '#6b7280' }}>{index + 1}</span></td>
                            <td>{produto.code}</td>
                            <td style={{ fontWeight: 500 }}>{produto.name}</td>
                            <td>{produto.totalQty}</td>
                            <td style={{ color: '#059669', fontWeight: 500 }}>{formatCurrency(produto.totalRevenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {selectedStore && storeProductsByRevenue.length > 0 && (
              <section className={`card table-section ${getPrintClass('top-loja-fat')}`}>
                <div className="section-header">
                  <div>
                    <h3 className="chart-title" style={{ marginBottom: '0.5rem' }}>Top Produtos por Faturamento na Loja</h3>
                    <p className="kpi-subtext" style={{ margin: 0 }}>Os itens que representam a maior parte da receita desta loja.</p>
                  </div>
                  <button className="print-btn no-print" onClick={() => handlePrint('top-loja-fat')}>
                    <PrintIcon /> Imprimir Tabela
                  </button>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Código</th>
                        <th>Produto</th>
                        <th>Receita Gerada</th>
                        <th>Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeProductsByRevenue.map((produto, index) => (
                        <tr key={produto.code}>
                          <td><span className="rank-badge" style={{ backgroundColor: '#059669' }}>{index + 1}</span></td>
                          <td>{produto.code}</td>
                          <td style={{ fontWeight: 500 }}>{produto.name}</td>
                          <td style={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(produto.totalRevenue)}</td>
                          <td>{produto.totalQty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {topStorePerCategory.length > 0 && (
              <AccordionSection 
                id="loja-destaque-cat" 
                title="Loja Destaque por Categoria" 
                subtitle="Qual estabelecimento mais vende (em volume) cada categoria de produto."
                printSection={printSection} 
                isPrinting={isPrinting} 
                handlePrint={handlePrint}
              >
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Categoria</th>
                        <th>Loja Líder</th>
                        <th>Volume Vendido</th>
                        <th>Receita da Categoria</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topStorePerCategory.map((cat) => (
                        <tr key={cat.category}>
                          <td style={{ fontWeight: 'bold', color: '#dc2626' }}>{cat.category}</td>
                          <td style={{ fontWeight: 500 }}>{cat.store}</td>
                          <td>{cat.totalQty}</td>
                          <td style={{ color: '#059669', fontWeight: 500 }}>{formatCurrency(cat.totalRevenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionSection>
            )}

            {storePerformance.length > 0 && (
              <AccordionSection 
                id="desempenho-lojas" 
                title="Desempenho Geral por Estabelecimento" 
                printSection={printSection} 
                isPrinting={isPrinting} 
                handlePrint={handlePrint}
              >
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Loja</th>
                        <th>Volume Vendas (Unidades)</th>
                        <th>Receita Total</th>
                        <th>Produto Mais Vendido (Geral)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storePerformance.map((loja) => (
                        <tr key={loja.store}>
                          <td style={{ fontWeight: 'bold', color: '#dc2626' }}>{loja.store}</td>
                          <td>{loja.totalQty}</td>
                          <td style={{ fontWeight: 500, color: '#059669' }}>{formatCurrency(loja.totalRevenue)}</td>
                          <td>{loja.topProductName} <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>({loja.topProductQty} un.)</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionSection>
            )}

            {cityRanking.length > 0 && (
               <AccordionSection 
               id="desempenho-lojas" 
               title="Desempenho Geral por cidade"
               printSection={printSection} 
               isPrinting={isPrinting} 
               handlePrint={handlePrint}
             >
              <section className={`card table-section ${getPrintClass('ranking-cidades')}`}>
                <div className="section-header">
                  <h3 className="chart-title">Cidades com Maior Volume de Vendas</h3>
                  <button className="print-btn no-print" onClick={() => handlePrint('ranking-cidades')}>
                    <PrintIcon /> Imprimir Tabela
                  </button>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Cidade</th>
                        <th>Total Vendido (Unidades)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cityRanking.map((cidade, index) => (
                        <tr key={cidade.city}>
                          <td style={{ width: '60px' }}><span className="rank-badge" style={{ backgroundColor: '#6b7280' }}>{index + 1}</span></td>
                          <td style={{ fontWeight: 500 }}>{cidade.city}</td>
                          <td>{cidade.totalQty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              </AccordionSection>
            )}
          </>
        )}

        {/* =========================================
            ABA 4: SERVIÇOS E FINANCEIRO
        ========================================= */}
        {activeTab === 'servicos' && data.length > 0 && (
          <>
            {servicePerformance.items.length > 0 ? (
              <section className={`card table-section ${getPrintClass('servicos-det')}`} style={{ border: '2px solid #f97316' }}>
                <div className="section-header">
                  <h3 className="chart-title" style={{ color: '#c2410c' }}>Detalhamento: Serviços e Financeiro</h3>
                  <button className="print-btn no-print" onClick={() => handlePrint('servicos-det')}>
                    <PrintIcon /> Imprimir Relatório
                  </button>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Serviço / Item Financeiro</th>
                        <th>Volume (Unidades)</th>
                        <th>Receita Gerada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicePerformance.items.map((svc) => (
                        <tr key={svc.code}>
                          <td>{svc.code}</td>
                          <td style={{ fontWeight: 500 }}>{svc.name}</td>
                          <td>{svc.totalQty}</td>
                          <td style={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(svc.totalRevenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : (
              <div className="card empty-chart">
                <p>Nenhum serviço financeiro encontrado no período.</p>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}