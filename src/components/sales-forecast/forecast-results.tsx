
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, HelpCircle, Percent, Store } from 'lucide-react';
import type { ForecastWeeklySalesOutput } from '@/ai/flows/forecast-weekly-sales';

interface ForecastResultsProps {
  forecast: ForecastWeeklySalesOutput;
  productName: string;
  storeId: string;
}

export default function ForecastResults({ forecast, productName, storeId }: ForecastResultsProps) {
  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="font-headline">Pronóstico de Ventas para {productName}</CardTitle>
        <CardDescription className="font-body flex items-center">
            <Store className="h-4 w-4 mr-1.5 text-muted-foreground"/> 
            Tienda: {storeId} - Predicción impulsada por IA para la próxima semana.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center p-4 bg-background rounded-lg shadow">
          <TrendingUp className="h-8 w-8 text-accent mr-4" />
          <div>
            <p className="text-sm text-muted-foreground font-body">Ventas Semanales Previstas</p>
            <p className="text-2xl font-bold font-headline">{forecast.weeklySalesForecast} unidades</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-background rounded-lg shadow">
          <Percent className="h-8 w-8 text-accent mr-4" />
          <div>
            <p className="text-sm text-muted-foreground font-body">Intervalo de Confianza</p>
            <p className="text-xl font-semibold font-headline">&plusmn; {forecast.confidenceInterval.toFixed(1)}{forecast.explanation.toLowerCase().includes("porcentual") || forecast.explanation.toLowerCase().includes("%") ? "%" : " unidades"}</p>
          </div>
        </div>
        <div className="p-4 bg-background rounded-lg shadow">
          <div className="flex items-start">
            <HelpCircle className="h-6 w-6 text-accent mr-3 mt-1" />
            <div>
              <p className="text-sm text-muted-foreground font-body mb-1">Explicación</p>
              <p className="text-base font-body">{forecast.explanation}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
