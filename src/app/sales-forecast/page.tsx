import React from 'react';
import SalesForecastForm from '@/components/sales-forecast/sales-forecast-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SalesForecastPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Pronóstico de Ventas y Optimización de Stock</h1>
        <p className="text-muted-foreground font-body">
          Utiliza IA para predecir ventas semanales y recibir sugerencias de optimización de stock.
        </p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Producto e Información para Pronóstico</CardTitle>
          <CardDescription>
            Proporciona la información necesaria para el producto que deseas pronosticar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalesForecastForm />
        </CardContent>
      </Card>
    </div>
  );
}
