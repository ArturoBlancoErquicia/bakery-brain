"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getSalesInsights, type CombinedSalesDataInput, type CombinedSalesDataOutput } from '@/lib/actions/bakery-actions';
import ForecastResults from './forecast-results';
import StockOptimizationSuggestion from './stock-optimization-suggestion';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const formSchema = z.object({
  productName: z.string().min(2, { message: "El nombre del producto debe tener al menos 2 caracteres." }),
  pastSalesData: z.string().refine((data) => {
    try {
      JSON.parse(data);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "Los datos de ventas anteriores deben ser un JSON válido." }),
  promotions: z.string().optional(),
  externalFactors: z.string().optional().refine((data) => {
    if (data === undefined || data === "") return true;
    try {
      JSON.parse(data);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "Los factores externos deben ser un JSON válido si se proporcionan." }),
  currentInventory: z.coerce.number().positive({ message: "El inventario actual debe ser un número positivo." }),
  productCategory: z.string().min(2, { message: "La categoría del producto debe tener al menos 2 caracteres." }),
});

type SalesForecastFormValues = z.infer<typeof formSchema>;

export default function SalesForecastForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CombinedSalesDataOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<SalesForecastFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      pastSalesData: `[{"date": "2024-05-01", "quantity": 10}, {"date": "2024-05-08", "quantity": 12}]`,
      promotions: "",
      externalFactors: `{"weather": "soleado", "event": "festival local"}`,
      currentInventory: 50,
      productCategory: "Repostería",
    },
  });

  async function onSubmit(values: SalesForecastFormValues) {
    setIsLoading(true);
    setResults(null);
    try {
      const data: CombinedSalesDataInput = {
        productName: values.productName,
        pastSalesData: values.pastSalesData,
        promotions: values.promotions,
        externalFactors: values.externalFactors,
        currentInventory: values.currentInventory,
        productCategory: values.productCategory,
      };
      const insightResults = await getSalesInsights(data);
      if (insightResults.error) {
        toast({
          variant: "destructive",
          title: "Error al obtener información",
          description: insightResults.error,
        });
      } else {
        setResults(insightResults);
      }
    } catch (error) {
      console.error("Error al obtener información de ventas:", error);
      toast({
        variant: "destructive",
        title: "Error de Envío",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input placeholder="ej., Croissant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría del Producto</FormLabel>
                  <FormControl>
                    <Input placeholder="ej., Pan, Repostería" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="pastSalesData"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Datos de Ventas Anteriores (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='ej., [{"date": "AAAA-MM-DD", "quantity": 10}, ...]'
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Proporciona datos históricos de ventas en formato JSON.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentInventory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel de Inventario Actual</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ej., 50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="promotions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promociones (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ej., Compra uno y lleva otro gratis" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="externalFactors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Factores Externos (JSON, Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder='ej., {"clima": "lluvioso", "feriado": "ninguno"}' {...field} />
                  </FormControl>
                  <FormDescription>
                    Factores externos relevantes como clima o eventos en formato JSON.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Obtener Información
          </Button>
        </form>
      </Form>

      {isLoading && (
        <div className="mt-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 font-body">Generando información...</p>
        </div>
      )}

      {results && !results.error && (
        <div className="mt-8 space-y-6">
          {results.forecast && <ForecastResults forecast={results.forecast} productName={form.getValues("productName")} />}
          {results.optimization && <StockOptimizationSuggestion optimization={results.optimization} />}
        </div>
      )}
    </>
  );
}
