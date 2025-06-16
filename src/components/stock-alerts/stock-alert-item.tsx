
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PackageSearch, ShoppingCart, CheckCircle2, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockAlertItemProps {
  storeId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  suggestedReorderQty: number;
  status: 'critical' | 'low' | 'reorder' | 'ok';
}

const statusConfig = {
  critical: {
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive',
    title: '¡Stock Crítico!',
  },
  low: {
    icon: PackageSearch,
    color: 'text-yellow-600 dark:text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500 dark:border-yellow-400',
    title: 'Bajo Stock',
  },
  reorder: {
    icon: ShoppingCart,
    color: 'text-blue-600 dark:text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500 dark:border-blue-400',
    title: 'Reorden Sugerido',
  },
  ok: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500 dark:border-green-400',
    title: 'Stock OK',
  }
};

export default function StockAlertItem({ storeId, productName, currentStock, reorderPoint, suggestedReorderQty, status }: StockAlertItemProps) {
  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <Card className={cn("shadow-md hover:shadow-lg transition-shadow", config.borderColor)}>
      <CardHeader className={cn("pb-3", config.bgColor)}>
        <div className="flex items-center gap-3">
          <IconComponent className={cn("h-6 w-6", config.color)} />
          <CardTitle className={cn("text-lg font-headline", config.color)}>{productName}</CardTitle>
        </div>
         <CardDescription className="font-body pt-1 flex items-center">
            <Store className="h-3.5 w-3.5 mr-1 text-muted-foreground"/> Tienda: {storeId} - {config.title}
         </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-2 font-body">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Stock Actual:</span>
          <span className={cn("font-semibold", currentStock <= reorderPoint ? config.color : 'text-foreground' )}>{currentStock} unidades</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Punto de Reorden:</span>
          <span className="font-semibold">{reorderPoint} unidades</span>
        </div>
        {status !== 'ok' && (
            <div className="flex justify-between text-sm pt-1">
            <span className="text-muted-foreground">Cant. Sugerida:</span>
            <span className="font-semibold">{suggestedReorderQty} unidades</span>
            </div>
        )}
        {status !== 'ok' && (
            <Button size="sm" className="w-full mt-4" variant={status === 'critical' ? 'destructive' : 'default'}>
            Reordenar Ahora
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
