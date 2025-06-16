"use server";

import { forecastWeeklySales, type ForecastWeeklySalesInput, type ForecastWeeklySalesOutput } from '@/ai/flows/forecast-weekly-sales';
import { suggestStockOptimization, type SuggestStockOptimizationInput, type SuggestStockOptimizationOutput } from '@/ai/flows/suggest-stock-optimization';

export interface CombinedSalesDataInput {
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
      productName: data.productName,
      pastSalesData: data.pastSalesData,
      promotions: data.promotions,
      externalFactors: data.externalFactors,
    };
    
    const forecastResult = await forecastWeeklySales(forecastInput);

    // Prepare input for stock optimization.
    // The AI flow schema expects `salesForecast` and `inventoryLevels` as potentially general strings.
    // We provide specific information for the product in question.
    const optimizationInput: SuggestStockOptimizationInput = {
      salesForecast: `For product "${data.productName}", the weekly sales forecast is ${forecastResult.weeklySalesForecast} units. Other product forecasts are not available in this context.`,
      inventoryLevels: `For product "${data.productName}", the current inventory level is ${data.currentInventory} units. Other product inventories are not available in this context.`,
      productCategory: data.productCategory,
      pastSalesData: data.pastSalesData, 
    };
    
    const optimizationResult = await suggestStockOptimization(optimizationInput);

    return { forecast: forecastResult, optimization: optimizationResult };
  } catch (err: any) {
    console.error("Error in getSalesInsights:", err);
    // Check if it's a Genkit specific error structure if available, otherwise generic message
    const errorMessage = err?.message || 'An unknown error occurred while processing your request with the AI model.';
    if (err?.details) {
        console.error("Error details:", err.details);
    }
    return { error: errorMessage };
  }
}
