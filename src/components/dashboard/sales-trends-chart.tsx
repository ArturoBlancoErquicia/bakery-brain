"use client"

import React from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

const salesData = [
  { date: '2024-W10', sales: 2400, lastYearSales: 2200 },
  { date: '2024-W11', sales: 1398, lastYearSales: 1500 },
  { date: '2024-W12', sales: 9800, lastYearSales: 9500 },
  { date: '2024-W13', sales: 3908, lastYearSales: 4000 },
  { date: '2024-W14', sales: 4800, lastYearSales: 4700 },
  { date: '2024-W15', sales: 3800, lastYearSales: 3600 },
  { date: '2024-W16', sales: 4300, lastYearSales: 4100 },
  { date: '2024-W17', sales: 5200, lastYearSales: 5000 },
  { date: '2024-W18', sales: 6800, lastYearSales: 6500 },
  { date: '2024-W19', sales: 7200, lastYearSales: 7000 },
  { date: '2024-W20', sales: 4100, lastYearSales: 3900 },
  { date: '2024-W21', sales: 4500, lastYearSales: 4400 },
];

const chartConfig = {
  sales: {
    label: "Current Year Sales",
    color: "hsl(var(--chart-1))",
  },
  lastYearSales: {
    label: "Last Year Sales",
    color: "hsl(var(--chart-2))",
  },
};

export default function SalesTrendsChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(-3)} // Show W10, W11 etc.
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="lastYearSales" stroke="var(--color-lastYearSales)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
