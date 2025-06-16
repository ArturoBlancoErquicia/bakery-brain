
// src/ai/flows/forecast-weekly-sales.ts
'use server';

/**
 * @fileOverview AI-powered sales forecasting tool for bakeries.
 *
 * - forecastWeeklySales - A function that predicts weekly sales for bakery products at a specific store.
 * - ForecastWeeklySalesInput - The input type for the forecastWeeklySales function.
 * - ForecastWeeklySalesOutput - The return type for the forecastWeeklySales function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastWeeklySalesInputSchema = z.object({
  storeId: z.string().describe('The ID of the bakery store.'),
  productName: z.string().describe('The name of the bakery product.'),
  pastSalesData: z.string().describe('Past sales data for this product at this store, in JSON format with date and sales quantity.'),
  promotions: z.string().optional().describe('Any planned promotions for the week at this store.'),
  externalFactors: z.string().optional().describe('External factors like weather or holidays relevant to this store, in JSON format.'),
});
export type ForecastWeeklySalesInput = z.infer<typeof ForecastWeeklySalesInputSchema>;

const ForecastWeeklySalesOutputSchema = z.object({
  weeklySalesForecast: z.number().describe('Predicted weekly sales quantity for the product at the specified store.'),
  confidenceInterval: z.number().describe('Confidence interval for the sales forecast (e.g., 5 for +/- 5%).'),
  explanation: z.string().describe('Explanation of the factors influencing the forecast for this store and product.'),
});
export type ForecastWeeklySalesOutput = z.infer<typeof ForecastWeeklySalesOutputSchema>;

export async function forecastWeeklySales(input: ForecastWeeklySalesInput): Promise<ForecastWeeklySalesOutput> {
  return forecastWeeklySalesFlow(input);
}

const forecastWeeklySalesPrompt = ai.definePrompt({
  name: 'forecastWeeklySalesPrompt',
  input: {schema: ForecastWeeklySalesInputSchema},
  output: {schema: ForecastWeeklySalesOutputSchema},
  prompt: `Eres un experimentado pronosticador de ventas para una panadería.

  Basándote en la siguiente información para la tienda {{storeId}}, predice las ventas semanales para el producto {{productName}}:

  Datos de Ventas Anteriores: {{{pastSalesData}}}
  Promociones: {{promotions}}
  Factores Externos: {{externalFactors}}

  Considera la estacionalidad, tendencias, promociones y factores externos en tu análisis para esta tienda específica.

  Proporciona el pronóstico de ventas semanales, un intervalo de confianza (por ejemplo, si el intervalo es +/- 5 unidades y el pronóstico es 100, el intervalo es 5. Si es +/- 2%, y el pronóstico es 100, el intervalo es 2), y una breve explicación de los factores que influyen en tu pronóstico.

  Formatea tu salida como un objeto JSON:
  {
    "weeklySalesForecast": number,
    "confidenceInterval": number, 
    "explanation": string
  }`,
});

const forecastWeeklySalesFlow = ai.defineFlow(
  {
    name: 'forecastWeeklySalesFlow',
    inputSchema: ForecastWeeklySalesInputSchema,
    outputSchema: ForecastWeeklySalesOutputSchema,
  },
  async input => {
    const {output} = await forecastWeeklySalesPrompt(input);
    return output!;
  }
);
