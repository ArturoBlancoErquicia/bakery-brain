
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SalesTrendsChart from '@/components/dashboard/sales-trends-chart';
import InventoryLevelsChart from '@/components/dashboard/inventory-levels-chart';
import PricingEffectivenessChart from '@/components/dashboard/pricing-effectiveness-chart';
import { DollarSign, Package, TrendingUpIcon, Store } from 'lucide-react';

export default function DashboardPage() {
  const summaryStats = [
    { title: "Ventas Totales (Mes, Todas las Tiendas)", value: "$73,520", icon: DollarSign, change: "+6.1%", changeType: "positive" as const, description: "Comparado con el mes pasado." },
    { title: "Artículos en Inventario (Global)", value: "7,150", icon: Package, change: "-0.5%", changeType: "negative" as const, description: "Artículos con bajo stock global: 87" },
    { title: "Margen Promedio (Global)", value: "36.2%", icon: TrendingUpIcon, change: "+0.3%", changeType: "positive" as const, description: "Margen general de productos." },
    { title: "Tiendas Activas", value: "6", icon: Store, change: " ", changeType: "neutral" as const, description: "Número total de panaderías operativas." },
  ];


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Panel de Control Global</h1>
      <p className="text-muted-foreground font-body">
        Una vista consolidada del rendimiento de todas las panaderías. Próximamente: filtros por tienda.
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-body">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">{stat.value}</div>
              <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground'}`}>
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
            <CardTitle>Tendencias de Ventas (Global)</CardTitle>
            <CardDescription>Resumen semanal de ventas de los últimos 3 meses en todas las tiendas.</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesTrendsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Niveles de Inventario (Global)</CardTitle>
            <CardDescription>Stock actual de los productos principales en todas las tiendas.</CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryLevelsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Efectividad de Precios (Promedio Global)</CardTitle>
            <CardDescription>Resumen de precios y márgenes de artículos clave, promediado entre tiendas.</CardDescription>
          </CardHeader>
          <CardContent>
            <PricingEffectivenessChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
