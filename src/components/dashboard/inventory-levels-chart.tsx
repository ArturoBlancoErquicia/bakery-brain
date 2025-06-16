"use client"

import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

const inventoryData = [
  { product: 'Croissant', stock: 50, reorderPoint: 20 },
  { product: 'Baguette', stock: 30, reorderPoint: 15 },
  { product: 'Masa Madre', stock: 25, reorderPoint: 10 },
  { product: 'Muffin', stock: 75, reorderPoint: 30 },
  { product: 'Dona', stock: 60, reorderPoint: 25 },
  { product: 'Rebanada Pastel', stock: 40, reorderPoint: 15 },
];

const chartConfig = {
  stock: {
    label: "Stock Actual",
    color: "hsl(var(--chart-1))",
  },
  reorderPoint: {
    label: "Punto de Reorden",
    color: "hsl(var(--chart-4))",
  },
};

export default function InventoryLevelsChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={inventoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="product" 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.length > 10 ? `${value.substring(0,8)}...` : value}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <Tooltip 
            cursor={false}
            content={<ChartTooltipContent />}
          />
          <Legend />
          <Bar dataKey="stock" fill="var(--color-stock)" radius={4} />
          <Bar dataKey="reorderPoint" fill="var(--color-reorderPoint)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
