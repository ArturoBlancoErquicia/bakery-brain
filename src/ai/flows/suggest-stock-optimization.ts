
// This is an autogenerated file from Firebase Studio.

'use server';

/**
 * @fileOverview A stock optimization suggestion AI agent for a specific bakery store.
 *
 * - suggestStockOptimization - A function that handles the stock optimization suggestion process.
 * - SuggestStockOptimizationInput - The input type for the suggestStockOptimization function.
 * - SuggestStockOptimizationOutput - The return type for the suggestStockOptimization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStockOptimizationInputSchema = z.object({
  storeId: z.string().describe('The ID of the bakery store for which optimization is requested.'),
  salesForecast: z
    .string()
    .describe('The sales forecast for the next week for products at this store. Can be a general string describing forecasts or specific values if available.'),
  inventoryLevels: z
    .string()
    .describe('The current inventory levels for products at this store. Can be a general string describing levels or specific values if available.'),
  productCategory: z
    .string()
    .describe('The category of the product, for example: bread, pastries, cakes.'),
  pastSalesData: z
    .string()
    .describe(
      'Past sales data of the product at this store, to understand trends and seasonality.'
    ),
});
export type SuggestStockOptimizationInput = z.infer<
  typeof SuggestStockOptimizationInputSchema
>;

const SuggestStockOptimizationOutputSchema = z.object({
  product: z.string().describe('The name of the product for which the suggestion is made.'),
  optimizationStrategy: z.string().describe('The suggested stock optimization strategy for this product at this store.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested strategy, considering store-specific factors if relevant from inputs.'),
  suggestedOrderQuantity: z
    .number()
    .describe('The suggested order quantity for the product for this store.'),
});

export type SuggestStockOptimizationOutput = z.infer<
  typeof SuggestStockOptimizationOutputSchema
>;

export async function suggestStockOptimization(
  input: SuggestStockOptimizationInput
): Promise<SuggestStockOptimizationOutput> {
  return suggestStockOptimizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStockOptimizationPrompt',
  input: {schema: SuggestStockOptimizationInputSchema},
  output: {schema: SuggestStockOptimizationOutputSchema},
  prompt: `Eres un experto gestor de inventario de panadería.

Para la tienda con ID {{storeId}}, utilizarás el pronóstico de ventas proporcionado, los niveles de inventario y los datos de ventas anteriores para sugerir estrategias de optimización de stock para cada producto mencionado en las entradas.

Pronóstico de Ventas: {{{salesForecast}}}
Niveles de Inventario: {{{inventoryLevels}}}
Categoría del Producto: {{{productCategory}}}
Datos de Ventas Anteriores: {{{pastSalesData}}}

Considera factores como el deterioro, la estacionalidad y los próximos eventos relevantes para la tienda {{storeId}} para proporcionar el mejor consejo posible.

Propón una estrategia, el razonamiento detrás de ella y una cantidad de pedido sugerida para un producto específico. Asegúrate de que el campo "product" en la salida corresponde al producto analizado.
`,
});

const suggestStockOptimizationFlow = ai.defineFlow(
  {
    name: 'suggestStockOptimizationFlow',
    inputSchema: SuggestStockOptimizationInputSchema,
    outputSchema: SuggestStockOptimizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
