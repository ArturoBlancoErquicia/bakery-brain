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
  productName: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  pastSalesData: z.string().refine((data) => {
    try {
      JSON.parse(data);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "Past sales data must be valid JSON." }),
  promotions: z.string().optional(),
  externalFactors: z.string().optional().refine((data) => {
    if (data === undefined || data === "") return true;
    try {
      JSON.parse(data);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "External factors must be valid JSON if provided." }),
  currentInventory: z.coerce.number().positive({ message: "Current inventory must be a positive number." }),
  productCategory: z.string().min(2, { message: "Product category must be at least 2 characters." }),
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
      externalFactors: `{"weather": "sunny", "event": "local festival"}`,
      currentInventory: 50,
      productCategory: "Pastries",
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
          title: "Error fetching insights",
          description: insightResults.error,
        });
      } else {
        setResults(insightResults);
      }
    } catch (error) {
      console.error("Failed to get sales insights:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
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
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Croissant" {...field} />
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
                  <FormLabel>Product Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bread, Pastries" {...field} />
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
                <FormLabel>Past Sales Data (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='e.g., [{"date": "YYYY-MM-DD", "quantity": 10}, ...]'
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide historical sales data in JSON format.
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
                <FormLabel>Current Inventory Level</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 50" {...field} />
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
                  <FormLabel>Promotions (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Buy one get one free" {...field} />
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
                  <FormLabel>External Factors (JSON, Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., {"weather": "rainy", "holiday": "none"}' {...field} />
                  </FormControl>
                  <FormDescription>
                    Relevant external factors like weather or events in JSON format.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Get Insights
          </Button>
        </form>
      </Form>

      {isLoading && (
        <div className="mt-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 font-body">Generating insights...</p>
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
