
// src/components/manufacturing-orders/manufacturing-order-item.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Store, CalendarDays, CheckCircle2, RefreshCw, AlertCircle, XCircle, ClipboardList } from 'lucide-react';
import type { ManufacturingOrder } from '@/app/manufacturing-orders/page';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';


interface ManufacturingOrderItemProps {
  order: ManufacturingOrder;
  onStatusChange: (orderId: string, newStatus: ManufacturingOrder['status']) => void;
}

const statusConfig: Record<ManufacturingOrder['status'], { icon: React.ElementType, color: string, label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
  Pendiente: { icon: AlertCircle, color: 'text-orange-500', label: 'Pendiente', variant: 'outline' },
  'En Progreso': { icon: RefreshCw, color: 'text-blue-500', label: 'En Progreso', variant: 'default' },
  Completada: { icon: CheckCircle2, color: 'text-green-500', label: 'Completada', variant: 'secondary' },
  Cancelada: { icon: XCircle, color: 'text-red-500', label: 'Cancelada', variant: 'destructive' },
};

const storeLabelMapping: Record<string, string> = {
  "S001": "Tienda Principal",
  "S002": "Sucursal Centro",
  "S003": "Sucursal Norte",
  "S004": "Panadería Oeste",
  "S005": "Punto Sur",
  "S006": "Kiosko Este",
};


export default function ManufacturingOrderItem({ order, onStatusChange }: ManufacturingOrderItemProps) {
  const currentStatusConfig = statusConfig[order.status];

  const handleSelectStatusChange = (newStatus: ManufacturingOrder['status']) => {
    onStatusChange(order.id, newStatus);
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <CardTitle className={cn("text-lg font-headline flex items-center gap-2", currentStatusConfig.color)}>
                <ClipboardList className="h-5 w-5" />
                Orden: {order.id}
            </CardTitle>
            <Badge variant={currentStatusConfig.variant} className="capitalize">
                <currentStatusConfig.icon className={cn("h-3.5 w-3.5 mr-1.5", currentStatusConfig.color)} />
                {currentStatusConfig.label}
            </Badge>
        </div>
        <CardDescription className="font-body pt-1 flex items-center text-sm">
          <Package className="h-4 w-4 mr-1.5 text-muted-foreground" />
          {order.productName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 font-body flex-grow">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Cantidad:</span>
          <span className="font-semibold">{order.quantity} unidades</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tienda Destino:</span>
          <span className="font-semibold">{storeLabelMapping[order.storeId] || order.storeId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Creada:</span>
          <span className="font-semibold">{new Date(order.creationDate + 'T00:00:00').toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Entrega Prevista:</span>
          <span className="font-semibold">{new Date(order.expectedCompletionDate + 'T00:00:00').toLocaleDateString()}</span>
        </div>
        {order.status === 'Completada' && order.completionDate && (
          <div className="flex justify-between text-sm text-green-600">
            <span className="text-muted-foreground">Completada:</span>
            <span className="font-semibold">{new Date(order.completionDate + 'T00:00:00').toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
      <div className="p-4 pt-2 mt-auto">
        {order.status !== 'Completada' && order.status !== 'Cancelada' && (
          <Select 
            value={order.status} 
            onValueChange={(value: ManufacturingOrder['status']) => handleSelectStatusChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Cambiar estado" />
            </SelectTrigger>
            <SelectContent>
              {order.status === 'Pendiente' && <SelectItem value="En Progreso">Marcar En Progreso</SelectItem>}
              {order.status === 'En Progreso' && <SelectItem value="Completada">Marcar Completada</SelectItem>}
              {(order.status === 'Pendiente' || order.status === 'En Progreso') && <SelectItem value="Cancelada">Cancelar Orden</SelectItem>}
            </SelectContent>
          </Select>
        )}
         {(order.status === 'Completada' || order.status === 'Cancelada') && (
            <p className={cn("text-xs text-center p-2 rounded-md", 
                order.status === 'Completada' ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            )}>
                {order.status === 'Completada' ? "Esta orden ha sido completada." : "Esta orden ha sido cancelada."}
            </p>
        )}
      </div>
    </Card>
  );
}
```