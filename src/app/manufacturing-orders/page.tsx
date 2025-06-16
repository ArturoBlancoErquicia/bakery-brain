
// src/app/manufacturing-orders/page.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ManufacturingOrderItem from '@/components/manufacturing-orders/manufacturing-order-item';
import { PlusCircle, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';


// Mock product list - in a real app, this would come from a DB
const productOptions = [
  { id: "P001", name: "Pan de Masa Madre" },
  { id: "P002", name: "Croissants de Almendra" },
  { id: "P003", name: "Pan Integral" },
  { id: "P004", name: "Muffins de Arándano" },
  { id: "P005", name: "Eclairs de Chocolate" },
  { id: "P006", name: "Baguette Rústica" },
  { id: "P007", name: "Pan de Centeno" },
  { id: "P008", name: "Galletas de Jengibre" },
];

// Mock store list
const storeOptions = [
  { value: "S001", label: "Tienda Principal (S001)" },
  { value: "S002", label: "Sucursal Centro (S002)" },
  { value: "S003", label: "Sucursal Norte (S003)" },
  { value: "S004", label: "Panadería Oeste (S004)" },
  { value: "S005", label: "Punto Sur (S005)" },
  { value: "S006", label: "Kiosko Este (S006)" },
];


export interface ManufacturingOrder {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  storeId: string;
  status: 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada';
  creationDate: string;
  expectedCompletionDate: string;
  completionDate?: string;
}

const initialMockOrders: ManufacturingOrder[] = [
  { id: 'MFG001', productId: 'P001', productName: 'Pan de Masa Madre', quantity: 50, storeId: 'S001', status: 'En Progreso', creationDate: '2024-07-28', expectedCompletionDate: '2024-07-29' },
  { id: 'MFG002', productId: 'P002', productName: 'Croissants de Almendra', quantity: 100, storeId: 'S002', status: 'Pendiente', creationDate: '2024-07-29', expectedCompletionDate: '2024-07-30' },
  { id: 'MFG003', productId: 'P003', productName: 'Pan Integral', quantity: 30, storeId: 'S001', status: 'Completada', creationDate: '2024-07-27', expectedCompletionDate: '2024-07-28', completionDate: '2024-07-28' },
  { id: 'MFG004', productId: 'P006', productName: 'Baguette Rústica', quantity: 70, storeId: 'S004', status: 'Pendiente', creationDate: '2024-07-30', expectedCompletionDate: '2024-07-31' },
  { id: 'MFG005', productId: 'P005', productName: 'Eclairs de Chocolate', quantity: 60, storeId: 'S002', status: 'En Progreso', creationDate: '2024-07-29', expectedCompletionDate: '2024-07-30' },
];

export default function ManufacturingOrdersPage() {
  const [orders, setOrders] = useState<ManufacturingOrder[]>(initialMockOrders);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newOrderData, setNewOrderData] = useState<{productId: string; quantity: string; storeId: string; expectedCompletionDate: string}>({
    productId: '', quantity: '', storeId: '', expectedCompletionDate: ''
  });
  const { toast } = useToast();

  const handleOrderStatusChange = (orderId: string, newStatus: ManufacturingOrder['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, ...(newStatus === 'Completada' && { completionDate: new Date().toISOString().split('T')[0] }) }
          : order
      )
    );
    if (newStatus === 'Completada') {
      const order = orders.find(o => o.id === orderId);
      toast({
        title: "Orden Completada (Simulación)",
        description: `El stock de ${order?.productName} para la tienda ${order?.storeId} se incrementaría en ${order?.quantity} unidades.`,
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewOrderData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreateOrder = () => {
    if (!newOrderData.productId || !newOrderData.quantity || !newOrderData.storeId || !newOrderData.expectedCompletionDate) {
      toast({ variant: "destructive", title: "Error", description: "Todos los campos son obligatorios." });
      return;
    }
    const product = productOptions.find(p => p.id === newOrderData.productId);
    if (!product) {
      toast({ variant: "destructive", title: "Error", description: "Producto no válido." });
      return;
    }

    const newManufacturingOrder: ManufacturingOrder = {
      id: `MFG${String(orders.length + 1).padStart(3, '0')}`,
      productId: newOrderData.productId,
      productName: product.name,
      quantity: parseInt(newOrderData.quantity, 10),
      storeId: newOrderData.storeId,
      status: 'Pendiente',
      creationDate: new Date().toISOString().split('T')[0],
      expectedCompletionDate: newOrderData.expectedCompletionDate,
    };
    setOrders(prev => [newManufacturingOrder, ...prev]);
    setIsFormOpen(false);
    setNewOrderData({ productId: '', quantity: '', storeId: '', expectedCompletionDate: '' }); // Reset form
    toast({ title: "Orden Creada", description: `Nueva orden de fabricación para ${product.name} creada.` });
  };


  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Órdenes de Fabricación</h1>
          <p className="text-muted-foreground font-body">
            Gestiona y monitorea el proceso de producción de artículos de panadería.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Orden
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Orden de Fabricación</DialogTitle>
              <DialogDescription>
                Completa los detalles para la nueva orden de producción.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="productId" className="text-right">Producto</Label>
                 <Select name="productId" onValueChange={(value) => handleSelectChange("productId", value)} value={newOrderData.productId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productOptions.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">Cantidad</Label>
                <Input id="quantity" name="quantity" type="number" value={newOrderData.quantity} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="storeId" className="text-right">Tienda Destino</Label>
                <Select name="storeId" onValueChange={(value) => handleSelectChange("storeId", value)} value={newOrderData.storeId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona una tienda" />
                  </SelectTrigger>
                  <SelectContent>
                    {storeOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expectedCompletionDate" className="text-right">Fecha Entrega Prev.</Label>
                <Input id="expectedCompletionDate" name="expectedCompletionDate" type="date" value={newOrderData.expectedCompletionDate} onChange={handleInputChange} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button onClick={handleCreateOrder}>Crear Orden</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* TODO: Add filtering options here */}
      {/* <div className="flex items-center gap-2">
        <Input placeholder="Filtrar por ID o producto..." className="max-w-sm" />
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="in_progress">En Progreso</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Aplicar Filtros</Button>
      </div> */}
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground font-body">No hay órdenes de fabricación activas.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {orders.map(order => (
            <ManufacturingOrderItem key={order.id} order={order} onStatusChange={handleOrderStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}

```