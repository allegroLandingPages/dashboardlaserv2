import { useSalesCore } from './useSalesCore';
import { useProductAnalysis } from './useProductAnalysis';
import { useInventory } from './useInventory';
import { usePredictiveAnalysis } from './usePredictiveAnalysis';
import { usePerformanceManagement } from './usePerformanceManagement';
import { usePricingAnalysis } from './usePricingAnalysis';
import { useBasketAnalysis } from './useBasketAnalysis';
export function useSalesData() {
  const salesCore = useSalesCore();
  const productAnalysis = useProductAnalysis(salesCore.data, salesCore.dateFilteredData);
  const inventory = useInventory();
  const predictive = usePredictiveAnalysis(
    salesCore.regularData, 
    inventory.inventoryData, 
    salesCore.totalDays
  );
  const performance = usePerformanceManagement(
    salesCore.revenueOverview, 
    salesCore.storePerformance
  );
  const pricing = usePricingAnalysis(
    salesCore.dateFilteredData, 
    salesCore.uniqueProductsData
  );
  const basket = useBasketAnalysis(salesCore.dateFilteredData, salesCore.data, salesCore.uniqueProductsData);
  return {
    ...salesCore,
    ...productAnalysis,
    ...inventory,
    ...predictive,
    ...performance,
    ...pricing,
    ...basket
  };
}