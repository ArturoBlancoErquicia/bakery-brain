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
        <CardTitle className="font-headline">Optimización de Stock para {optimization.product}</CardTitle>
        <CardDescription className="font-body">Sugerencias impulsadas por IA para gestionar tu inventario.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center p-4 bg-background rounded-lg shadow">
          <PackageCheck className="h-8 w-8 text-primary mr-4" />
          <div>
            <p className="text-sm text-muted-foreground font-body">Cantidad de Pedido Sugerida</p>
            <p className="text-2xl font-bold font-headline">{optimization.suggestedOrderQuantity} unidades</p>
          </div>
        </div>
        <div className="p-4 bg-background rounded-lg shadow">
         <div className="flex items-start">
            <Lightbulb className="h-6 w-6 text-primary mr-3 mt-1" />
            <div>
                <p className="text-sm text-muted-foreground font-body mb-1">Estrategia de Optimización</p>
                <p className="text-base font-semibold font-body">{optimization.optimizationStrategy}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-background rounded-lg shadow">
          <div className="flex items-start">
            <AlignLeft className="h-6 w-6 text-primary mr-3 mt-1" />
            <div>
                <p className="text-sm text-muted-foreground font-body mb-1">Razonamiento</p>
                <p className="text-base font-body">{optimization.reasoning}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
