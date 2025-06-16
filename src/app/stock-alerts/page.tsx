import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import StockAlertItem from '@/components/stock-alerts/stock-alert-item';
import { AlertTriangle, PackageSearch, ShoppingCart } from 'lucide-react';

// Mock data for stock alerts
const mockAlerts = [
  { id: '1', productName: 'Sourdough Bread', currentStock: 8, reorderPoint: 10, suggestedReorderQty: 20, status: 'low' as const },
  { id: '2', productName: 'Almond Croissants', currentStock: 5, reorderPoint: 15, suggestedReorderQty: 30, status: 'critical' as const },
  { id: '3', productName: 'Whole Wheat Loaf', currentStock: 22, reorderPoint: 20, suggestedReorderQty: 25, status: 'reorder' as const },
  { id: '4', productName: 'Blueberry Muffins', currentStock: 12, reorderPoint: 25, suggestedReorderQty: 40, status: 'ok' as const }, // Example of ok stock
  { id: '5', productName: 'Chocolate Eclairs', currentStock: 3, reorderPoint: 10, suggestedReorderQty: 20, status: 'critical' as const },
];

export default function StockAlertsPage() {
  const criticalAlerts = mockAlerts.filter(alert => alert.status === 'critical');
  const lowStockAlerts = mockAlerts.filter(alert => alert.status === 'low');
  const reorderAlerts = mockAlerts.filter(alert => alert.status === 'reorder');

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Stock Alerts</h1>
        <p className="text-muted-foreground font-body">
          Monitor inventory levels and receive timely reorder suggestions.
        </p>
      </header>

      {criticalAlerts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-destructive font-headline">Critical Stock Levels</CardTitle>
            </div>
            <CardDescription className="font-body">These items require immediate attention to prevent stockouts.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {criticalAlerts.map(alert => <StockAlertItem key={alert.id} {...alert} />)}
          </CardContent>
        </Card>
      )}

      {lowStockAlerts.length > 0 && (
        <Card className="border-yellow-500 dark:border-yellow-400">
          <CardHeader>
             <div className="flex items-center gap-2">
              <PackageSearch className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
              <CardTitle className="text-yellow-700 dark:text-yellow-500 font-headline">Low Stock Items</CardTitle>
            </div>
            <CardDescription className="font-body">Consider reordering these items soon.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lowStockAlerts.map(alert => <StockAlertItem key={alert.id} {...alert} />)}
          </CardContent>
        </Card>
      )}
      
      {reorderAlerts.length > 0 && (
        <Card className="border-blue-500 dark:border-blue-400">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-500" />
              <CardTitle className="text-blue-700 dark:text-blue-500 font-headline">Reorder Suggestions</CardTitle>
            </div>
            <CardDescription className="font-body">Items at or below reorder point.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reorderAlerts.map(alert => <StockAlertItem key={alert.id} {...alert} />)}
          </CardContent>
        </Card>
      )}

      {criticalAlerts.length === 0 && lowStockAlerts.length === 0 && reorderAlerts.length === 0 && (
         <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground font-body">No active stock alerts. Inventory levels are looking good!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
