
"use server";

import { forecastWeeklySales, type ForecastWeeklySalesInput, type ForecastWeeklySalesOutput } from '@/ai/flows/forecast-weekly-sales';
import { suggestStockOptimization, type SuggestStockOptimizationInput, type SuggestStockOptimizationOutput } from '@/ai/flows/suggest-stock-optimization';

export interface CombinedSalesDataInput {
  storeId: string;
  productName: string;
  pastSalesData: string; // JSON string
  promotions?: string;
  externalFactors?: string; // JSON string
  currentInventory: number;
  productCategory: string;
}

export interface CombinedSalesDataOutput {
  forecast?: ForecastWeeklySalesOutput;
  optimization?: SuggestStockOptimizationOutput;
  error?: string;
}

export async function getSalesInsights(data: CombinedSalesDataInput): Promise<CombinedSalesDataOutput> {
  try {
    const forecastInput: ForecastWeeklySalesInput = {
      storeId: data.storeId,
      productName: data.productName,
      pastSalesData: data.pastSalesData,
      promotions: data.promotions,
      externalFactors: data.externalFactors,
    };
    
    const forecastResult = await forecastWeeklySales(forecastInput);

    const optimizationInput: SuggestStockOptimizationInput = {
      storeId: data.storeId,
      salesForecast: `Para el producto "${data.productName}" en la tienda ${data.storeId}, el pronóstico de ventas semanal es ${forecastResult.weeklySalesForecast} unidades.`,
      inventoryLevels: `Para el producto "${data.productName}" en la tienda ${data.storeId}, el nivel de inventario actual es ${data.currentInventory} unidades.`,
      productCategory: data.productCategory,
      pastSalesData: data.pastSalesData, 
    };
    
    const optimizationResult = await suggestStockOptimization(optimizationInput);

    return { forecast: forecastResult, optimization: optimizationResult };
  } catch (err: any) {
    console.error("Error in getSalesInsights:", err);
    const errorMessage = err?.message || 'Ocurrió un error desconocido al procesar su solicitud con el modelo de IA.';
    if (err?.details) {
        console.error("Error details:", err.details);
    }
    return { error: errorMessage };
  }
}
