import { useState, useMemo } from 'react';

export function useProductAnalysis(data, dateFilteredData) {
  const [singleInputCode, setSingleInputCode] = useState('');
  const [singleInputName, setSingleInputName] = useState('');
  const [activeSingleCode, setActiveSingleCode] = useState(''); 

  const [multiProducts, setMultiProducts] = useState(
    Array.from({ length: 7 }, () => ({ code: '', name: '', startDate: '', endDate: '' }))
  );

  const handleSingleCodeBlur = () => {
    if (!singleInputCode) return;
    const match = data.find(item => item.code.toUpperCase() === singleInputCode.trim().toUpperCase());
    if (match) { setSingleInputName(match.name); setActiveSingleCode(match.code); } 
    else setActiveSingleCode(singleInputCode.trim()); 
  };

  const handleSingleNameBlur = () => {
    if (!singleInputName) return;
    const upperInput = singleInputName.trim().toUpperCase();
    const match = data.find(item => item.name.toUpperCase().includes(upperInput));
    if (match) { setSingleInputCode(match.code); setSingleInputName(match.name); setActiveSingleCode(match.code); }
  };

  const handleMultiProductChange = (index, field, value) => {
    setMultiProducts(prev => {
      const newMulti = [...prev];
      newMulti[index] = { ...newMulti[index], [field]: value };
      return newMulti;
    });
  };

  const handleMultiCodeBlur = (index) => {
    const mp = multiProducts[index];
    if (!mp.code) return;
    const match = data.find(item => item.code.toUpperCase() === mp.code.trim().toUpperCase());
    if (match) {
      setMultiProducts(prev => {
        const newMulti = [...prev];
        newMulti[index] = { ...newMulti[index], code: match.code, name: match.name };
        return newMulti;
      });
    }
  };

  const handleMultiNameBlur = (index) => {
    const mp = multiProducts[index];
    if (!mp.name) return;
    const upperInput = mp.name.trim().toUpperCase();
    const match = data.find(item => item.name.toUpperCase().includes(upperInput));
    if (match) {
      setMultiProducts(prev => {
        const newMulti = [...prev];
        newMulti[index] = { ...newMulti[index], code: match.code, name: match.name };
        return newMulti;
      });
    }
  };

  const { totalSold, chartData, searchedProductName } = useMemo(() => {
    if (!data.length || !activeSingleCode) return { totalSold: 0, chartData: [], searchedProductName: '' };
    const name = data.find(i => i.code === activeSingleCode)?.name || 'Produto não encontrado';
    const td = dateFilteredData.filter(i => i.code === activeSingleCode);
    const agg = td.reduce((acc, curr) => { acc[curr.dateStr] = (acc[curr.dateStr] || 0) + curr.qty; return acc; }, {});
    const chart = Object.keys(agg).map(d => ({ data: d, quantidade: agg[d] })).sort((a, b) => new Date(a.data.split('/').reverse().join('-')) - new Date(b.data.split('/').reverse().join('-')));
    return { totalSold: td.reduce((acc, curr) => acc + curr.qty, 0), chartData: chart, searchedProductName: name };
  }, [data, dateFilteredData, activeSingleCode]);

  const multiProductsData = useMemo(() => {
    if (!data.length) return [];
    return multiProducts.map(filter => {
      if (!filter.code) return null; 
      const code = filter.code.trim();
      let td = data.filter(i => i.code === code);
      if (filter.startDate || filter.endDate) {
        const start = filter.startDate ? new Date(`${filter.startDate}T00:00:00`) : new Date('2000-01-01');
        const end = filter.endDate ? new Date(`${filter.endDate}T23:59:59`) : new Date('2100-01-01');
        td = td.filter(i => i.dateObj >= start && i.dateObj <= end);
      }
      const agg = td.reduce((acc, curr) => { acc[curr.dateStr] = (acc[curr.dateStr] || 0) + curr.qty; return acc; }, {});
      return { code, name: data.find(i => i.code === code)?.name || 'N/E', total: td.reduce((a, c) => a + c.qty, 0), chartData: Object.keys(agg).map(d => ({ data: d, quantidade: agg[d] })).sort((a, b) => new Date(a.data.split('/').reverse().join('-')) - new Date(b.data.split('/').reverse().join('-'))) };
    });
  }, [data, multiProducts]);

  return {
    singleInputCode, setSingleInputCode, singleInputName, setSingleInputName, activeSingleCode,
    handleSingleCodeBlur, handleSingleNameBlur, multiProducts, handleMultiProductChange,
    handleMultiCodeBlur, handleMultiNameBlur, totalSold, chartData, searchedProductName, multiProductsData
  };
}