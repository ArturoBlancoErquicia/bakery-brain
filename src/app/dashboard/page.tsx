import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SalesTrendsChart from '@/components/dashboard/sales-trends-chart';
import InventoryLevelsChart from '@/components/dashboard/inventory-levels-chart';
import PricingEffectivenessChart from '@/components/dashboard/pricing-effectiveness-chart';
import { DollarSign, Package, TrendingUpIcon } from 'lucide-react';

export default function DashboardPage() {
  // Mock data for summary cards
  const summaryStats = [
    { title: "Ventas Totales (Mes)", value: "$12,345", icon: DollarSign, change: "+5.2%", changeType: "positive" as const, description: "Comparado con el mes pasado" },
    { title: "Artículos en Inventario", value: "1,280", icon: Package, change: "-1.8%", changeType: "negative" as const, description: "Artículos con bajo stock: 15" },
    { title: "Margen Promedio", value: "35.6%", icon: TrendingUpIcon, change: "+0.5%", changeType: "positive" as const, description: "Margen general de productos" },
  ];


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Panel de Control</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaryStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-body">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">{stat.value}</div>
              <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </p>
              <p className="text-xs text-muted-foreground font-body">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendencias de Ventas</CardTitle>
            <CardDescription>Resumen semanal de ventas de los últimos 3 meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesTrendsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Niveles de Inventario</CardTitle>
            <CardDescription>Stock actual de los productos principales.</CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryLevelsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Efectividad de Precios</CardTitle>
            <CardDescription>Resumen de precios y márgenes de artículos clave.</CardDescription>
          </CardHeader>
          <CardContent>
            <PricingEffectivenessChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
