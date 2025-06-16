"use client"

import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

const pricingData = [
  { product: 'Croissant', price: 3.50, margin: 1.50 },
  { product: 'Baguette', price: 4.00, margin: 1.20 },
  { product: 'Sourdough', price: 6.50, margin: 2.50 },
  { product: 'Muffin', price: 2.75, margin: 1.00 },
  { product: 'Donut', price: 2.50, margin: 0.90 },
];

const chartConfig = {
  price: {
    label: "Price ($)",
    color: "hsl(var(--chart-2))",
  },
  margin: {
    label: "Margin ($)",
    color: "hsl(var(--chart-5))",
  },
};

export default function PricingEffectivenessChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={pricingData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
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
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip 
            cursor={false}
            content={<ChartTooltipContent />}
          />
          <Legend />
          <Bar dataKey="price" fill="var(--color-price)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="margin" fill="var(--color-margin)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
