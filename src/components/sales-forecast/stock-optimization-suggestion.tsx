"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PackageCheck, Lightbulb, AlignLeft } from 'lucide-react';
import type { SuggestStockOptimizationOutput } from '@/ai/flows/suggest-stock-optimization';

interface StockOptimizationSuggestionProps {
  optimization: SuggestStockOptimizationOutput;
}

export default function StockOptimizationSuggestion({ optimization }: StockOptimizationSuggestionProps) {
  return (
    <Card className="border-accent">
      <CardHeader>
        <CardTitle className="font-headline">Stock Optimization for {optimization.product}</CardTitle>
        <CardDescription className="font-body">AI-driven suggestions for managing your inventory.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center p-4 bg-background rounded-lg shadow">
          <PackageCheck className="h-8 w-8 text-primary mr-4" />
          <div>
            <p className="text-sm text-muted-foreground font-body">Suggested Order Quantity</p>
            <p className="text-2xl font-bold font-headline">{optimization.suggestedOrderQuantity} units</p>
          </div>
        </div>
        <div className="p-4 bg-background rounded-lg shadow">
         <div className="flex items-start">
            <Lightbulb className="h-6 w-6 text-primary mr-3 mt-1" />
            <div>
                <p className="text-sm text-muted-foreground font-body mb-1">Optimization Strategy</p>
                <p className="text-base font-semibold font-body">{optimization.optimizationStrategy}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-background rounded-lg shadow">
          <div className="flex items-start">
            <AlignLeft className="h-6 w-6 text-primary mr-3 mt-1" />
            <div>
                <p className="text-sm text-muted-foreground font-body mb-1">Reasoning</p>
                <p className="text-base font-body">{optimization.reasoning}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
