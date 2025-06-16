// src/ai/flows/forecast-weekly-sales.ts
'use server';

/**
 * @fileOverview AI-powered sales forecasting tool for bakeries.
 *
 * - forecastWeeklySales - A function that predicts weekly sales for bakery products.
 * - ForecastWeeklySalesInput - The input type for the forecastWeeklySales function.
 * - ForecastWeeklySalesOutput - The return type for the forecastWeeklySales function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastWeeklySalesInputSchema = z.object({
  productName: z.string().describe('The name of the bakery product.'),
  pastSalesData: z.string().describe('Past sales data in JSON format with date and sales quantity.'),
  promotions: z.string().optional().describe('Any planned promotions for the week.'),
  externalFactors: z.string().optional().describe('External factors like weather or holidays in JSON format.'),
});
export type ForecastWeeklySalesInput = z.infer<typeof ForecastWeeklySalesInputSchema>;

const ForecastWeeklySalesOutputSchema = z.object({
  weeklySalesForecast: z.number().describe('Predicted weekly sales quantity for the product.'),
  confidenceInterval: z.number().describe('Confidence interval for the sales forecast.'),
  explanation: z.string().describe('Explanation of the factors influencing the forecast.'),
});
export type ForecastWeeklySalesOutput = z.infer<typeof ForecastWeeklySalesOutputSchema>;

export async function forecastWeeklySales(input: ForecastWeeklySalesInput): Promise<ForecastWeeklySalesOutput> {
  return forecastWeeklySalesFlow(input);
}

const forecastWeeklySalesPrompt = ai.definePrompt({
  name: 'forecastWeeklySalesPrompt',
  input: {schema: ForecastWeeklySalesInputSchema},
  output: {schema: ForecastWeeklySalesOutputSchema},
  prompt: `You are an experienced sales forecaster for a bakery.

  Based on the following information, predict the weekly sales for {{productName}}:

  Past Sales Data: {{{pastSalesData}}}
  Promotions: {{promotions}}
  External Factors: {{externalFactors}}

  Consider seasonality, trends, promotions, and external factors in your analysis.

  Provide the weekly sales forecast, a confidence interval, and a brief explanation of the factors influencing your forecast.

  Format your output as a JSON object:
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
