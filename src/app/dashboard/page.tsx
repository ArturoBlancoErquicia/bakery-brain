
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SalesTrendsChart from '@/components/dashboard/sales-trends-chart';
import InventoryLevelsChart from '@/components/dashboard/inventory-levels-chart';
import PricingEffectivenessChart from '@/components/dashboard/pricing-effectiveness-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Package, TrendingUpIcon, Store, Filter } from 'lucide-react';

// Mock store IDs - in a real app, these would come from a DB or config
const storeOptions = [
  { value: "global", label: "Todas las Tiendas (Global)" },
  { value: "S001", label: "Tienda Principal (S001)" },
  { value: "S002", label: "Sucursal Centro (S002)" },
  { value: "S003", label: "Sucursal Norte (S003)" },
  { value: "S004", label: "Panadería Oeste (S004)" },
  { value: "S005", label: "Punto Sur (S005)" },
  { value: "S006", label: "Kiosko Este (S006)" },
];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedStore, setSelectedStore] = useState<string>("global");

  useEffect(() => {
    const storeQuery = searchParams.get('store');
    if (storeQuery && storeOptions.some(opt => opt.value === storeQuery)) {
      setSelectedStore(storeQuery);
    } else {
      setSelectedStore("global"); // Default to global if query is invalid or not present
    }
  }, [searchParams]);

  const handleStoreChange = (newStoreId: string) => {
    setSelectedStore(newStoreId);
    router.push(`/dashboard?store=${newStoreId}`, { scroll: false });
  };

  const summaryStats = [
    { title: "Ventas Totales (Mes, Global)", value: "$73,520", icon: DollarSign, change: "+6.1%", changeType: "positive" as const, description: "Comparado con el mes pasado." },
    { title: "Artículos en Inventario (Global)", value: "7,150", icon: Package, change: "-0.5%", changeType: "negative" as const, description: "Artículos con bajo stock global: 87" },
    { title: "Margen Promedio (Global)", value: "36.2%", icon: TrendingUpIcon, change: "+0.3%", changeType: "positive" as const, description: "Margen general de productos." },
    { title: "Tiendas Activas", value: "6", icon: Store, change: " ", changeType: "neutral" as const, description: "Número total de panaderías operativas." },
  ];

  const getStoreName = (storeId: string) => {
    const store = storeOptions.find(s => s.value === storeId);
    return store ? store.label : "Desconocida";
  };
  
  const currentStoreNameForDisplay = getStoreName(selectedStore);
  const currentStoreSuffix = selectedStore === "global" ? "(Global)" : `(${currentStoreNameForDisplay})`;


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Panel de Control</h1>
          <p className="text-muted-foreground font-body">
            {selectedStore === "global" 
              ? "Una vista consolidada del rendimiento de todas las panaderías." 
              : `Mostrando datos para: ${currentStoreNameForDisplay}.`}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
           <Filter className="h-5 w-5 text-muted-foreground" />
          <Select value={selectedStore} onValueChange={handleStoreChange}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Seleccionar tienda" />
            </SelectTrigger>
            <SelectContent>
              {storeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
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
            <CardTitle>Tendencias de Ventas {currentStoreSuffix}</CardTitle>
            <CardDescription>Resumen semanal de ventas de los últimos 3 meses para {selectedStore === "global" ? "global" : currentStoreNameForDisplay.toLowerCase()}.</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesTrendsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Niveles de Inventario {currentStoreSuffix}</CardTitle>
            <CardDescription>Stock actual de los productos principales para {selectedStore === "global" ? "global" : currentStoreNameForDisplay.toLowerCase()}.</CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryLevelsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Efectividad de Precios {currentStoreSuffix}</CardTitle>
            <CardDescription>Resumen de precios y márgenes de artículos clave para {selectedStore === "global" ? "global" : currentStoreNameForDisplay.toLowerCase()}.</CardDescription>
          </CardHeader>
          <CardContent>
            <PricingEffectivenessChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
