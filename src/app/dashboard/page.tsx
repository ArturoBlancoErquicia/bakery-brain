import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SalesTrendsChart from '@/components/dashboard/sales-trends-chart';
import InventoryLevelsChart from '@/components/dashboard/inventory-levels-chart';
import PricingEffectivenessChart from '@/components/dashboard/pricing-effectiveness-chart';
import { DollarSign, Package, TrendingUpIcon } from 'lucide-react';

export default function DashboardPage() {
  // Mock data for summary cards
  const summaryStats = [
    { title: "Total Sales (Month)", value: "$12,345", icon: DollarSign, change: "+5.2%", changeType: "positive" as const, description: "Compared to last month" },
    { title: "Inventory Items", value: "1,280", icon: Package, change: "-1.8%", changeType: "negative" as const, description: "Low stock items: 15" },
    { title: "Average Margin", value: "35.6%", icon: TrendingUpIcon, change: "+0.5%", changeType: "positive" as const, description: "Overall product margin" },
  ];


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
      
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
            <CardTitle>Sales Trends</CardTitle>
            <CardDescription>Weekly sales overview for the last 3 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesTrendsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Levels</CardTitle>
            <CardDescription>Current stock for top products.</CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryLevelsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pricing Effectiveness</CardTitle>
            <CardDescription>Price and margin overview for key items.</CardDescription>
          </CardHeader>
          <CardContent>
            <PricingEffectivenessChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
