import React from 'react';
import SalesForecastForm from '@/components/sales-forecast/sales-forecast-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SalesForecastPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Sales Forecast & Stock Optimization</h1>
        <p className="text-muted-foreground font-body">
          Leverage AI to predict weekly sales and receive stock optimization suggestions.
        </p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Product Details & Forecast Input</CardTitle>
          <CardDescription>
            Provide the necessary information for the product you want to forecast.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalesForecastForm />
        </CardContent>
      </Card>
    </div>
  );
}
