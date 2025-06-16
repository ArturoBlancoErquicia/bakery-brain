
"use client";

import React from 'react';
// Removed import of Link from 'next/link' as SidebarMenuButton will handle it
import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, TrendingUp, Archive, FileUp, Store, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

const mainDashboardItem = { href: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard, type: 'main-dashboard', id: 'main-dashboard' };

const storeDefinitions = [
  { value: "S001", label: "Tienda Principal (S001)" },
  { value: "S002", label: "Sucursal Centro (S002)" },
  { value: "S003", label: "Sucursal Norte (S003)" },
  { value: "S004", label: "Panadería Oeste (S004)" },
  { value: "S005", label: "Punto Sur (S005)" },
  { value: "S006", label: "Kiosko Este (S006)" },
];

const storeNavItems = storeDefinitions.map(store => ({
  href: `/dashboard?store=${store.value}`,
  label: store.label,
  icon: Store,
  type: 'store-dashboard' as const,
  storeId: store.value,
  id: store.value,
}));

const otherPageItems = [
  { href: '/sales-forecast', label: 'Pronóstico Ventas', icon: TrendingUp, type: 'page' as const, id: 'sales-forecast'},
  { href: '/stock-alerts', label: 'Alertas de Stock', icon: Archive, type: 'page' as const, id: 'stock-alerts'},
  { href: '/manufacturing-orders', label: 'Órdenes Fabricación', icon: ClipboardList, type: 'page' as const, id: 'manufacturing-orders' },
  { href: '/data-upload', label: 'Carga de Datos', icon: FileUp, type: 'page' as const, id: 'data-upload' },
];

const allNavItems = [mainDashboardItem, ...storeNavItems, ...otherPageItems];

export default function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStoreQuery = searchParams.get('store');

  return (
    <SidebarMenu>
      {allNavItems.map((item) => {
        let isActive = false;
        if (item.type === 'main-dashboard') {
          isActive = pathname === item.href && (!currentStoreQuery || currentStoreQuery === 'global');
        } else if (item.type === 'store-dashboard') {
          isActive = pathname === '/dashboard' && currentStoreQuery === item.storeId;
        } else { // type === 'page'
          isActive = pathname === item.href;
        }
        
        const IconComponent = item.icon;

        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              href={item.href}
              isActive={isActive}
              tooltip={{ children: item.label, className: "font-body" }}
              className="font-body"
            >
              <IconComponent />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
