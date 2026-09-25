import { useState, useMemo } from 'react';

export function usePerformanceManagement(revenueOverview, storePerformance) {
  // Meta Global (agora representa MILHÕES)
  const [globalTarget, setGlobalTarget] = useState('');

  // Metas de Lojas (livre)
  const [storeTargets, setStoreTargets] = useState([
    { store: '', target: '' },
    { store: '', target: '' },
    { store: '', target: '' }
  ]);

  const handleStoreTargetChange = (index, field, value) => {
    setStoreTargets(prev => {
      const newTargets = [...prev];
      newTargets[index] = { ...newTargets[index], [field]: value };
      return newTargets;
    });
  };

  const globalPerformanceData = useMemo(() => {
    const achieved = revenueOverview?.totalGeral || 0;
    
    // Multiplica o input por 1 Milhão
    const targetValue = (parseFloat(globalTarget) || 0) * 1000000;
    
    const percent = targetValue > 0 ? (achieved / targetValue) * 100 : 0;
    const remaining = Math.max(0, targetValue - achieved);
    
    return { 
      achieved, 
      target: targetValue, 
      percent, 
      remaining,
      isGoalMet: percent >= 100
    };
  }, [revenueOverview, globalTarget]);

  const storePerformanceComparisons = useMemo(() => {
    return storeTargets.map(st => {
      if (!st.store) return null;
      
      const storeData = storePerformance.find(s => s.store === st.store);
      const achieved = storeData ? storeData.totalRevenue : 0;
      
      // Converte o input livre para número
      const targetValue = parseFloat(st.target) || 0;
      
      const percent = targetValue > 0 ? (achieved / targetValue) * 100 : 0;
      const remaining = Math.max(0, targetValue - achieved);
      
      return { 
        store: st.store, 
        target: targetValue, 
        achieved, 
        percent, 
        remaining,
        isGoalMet: percent >= 100
      };
    });
  }, [storeTargets, storePerformance]);

  return {
    globalTarget, setGlobalTarget,
    storeTargets, handleStoreTargetChange,
    globalPerformanceData, storePerformanceComparisons
  };
}