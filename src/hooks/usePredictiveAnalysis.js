import { useMemo } from 'react';

export function usePredictiveAnalysis(regularData, inventoryData, totalDays) {
  const predictiveAnalysis = useMemo(() => {
    if (!regularData?.length || !inventoryData?.length) return { tableData: [], kpis: null };

    const salesMap = {};
    let totalRevenueGlobal = 0;
    
    regularData.forEach(item => {
      if (!salesMap[item.code]) {
        salesMap[item.code] = { code: item.code, name: item.name, salesQty: 0, revenue: 0 };
      }
      salesMap[item.code].salesQty += item.qty;
      salesMap[item.code].revenue += item.totalValue;
      totalRevenueGlobal += item.totalValue;
    });

    const combined = [];
    let totalRuptura = 0;
    let totalEncalhado = 0;

    inventoryData.forEach(invItem => {
      const sales = salesMap[invItem.code] || { salesQty: 0, revenue: 0 };
      const avgDailySales = sales.salesQty / totalDays;
      const coverageDays = avgDailySales > 0 ? (invItem.rede / avgDailySales) : Infinity;
      
      let status = 'Saudável';
      if (coverageDays < 3 && avgDailySales > 0) {
          status = 'Risco de Ruptura';
          totalRuptura++;
      } else if (coverageDays > 90 || (coverageDays === Infinity && invItem.rede > 0)) {
          status = 'Excesso / Encalhado';
          totalEncalhado += (invItem.venda * invItem.rede);
      }

      if (sales.revenue > 0 || invItem.rede > 0) {
        combined.push({
          code: invItem.code,
          name: invItem.name,
          revenue: sales.revenue,
          stockQty: invItem.rede,
          avgDailySales: parseFloat(avgDailySales.toFixed(2)),
          coverageDays: coverageDays,
          status: status,
          costValue: invItem.venda * invItem.rede
        });
      }
    });

    // Ordenação Pareto (Receita Decrescente)
    combined.sort((a, b) => b.revenue - a.revenue);
    
    let cumulativeRevenue = 0;
    combined.forEach(item => {
      cumulativeRevenue += item.revenue;
      const percent = totalRevenueGlobal > 0 ? (cumulativeRevenue / totalRevenueGlobal) * 100 : 0;
      
      if (percent <= 80) item.abcClass = 'A';
      else if (percent <= 95) item.abcClass = 'B';
      else item.abcClass = 'C';
    });

    return { tableData: combined, kpis: { totalRuptura, totalEncalhado } };
  }, [regularData, inventoryData, totalDays]);

  return {
    predictiveTableData: predictiveAnalysis.tableData,
    predictiveKpis: predictiveAnalysis.kpis
  };
}