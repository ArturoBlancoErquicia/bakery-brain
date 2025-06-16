
"use client";

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
  sidebarMenuButtonVariants, // Import CVA variants
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LayoutDashboard, TrendingUp, Archive, FileUp, Store, ClipboardList, type LucideIcon, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href?: string;
  action?: () => void;
  label: string;
  icon: LucideIcon;
  type: 'main-dashboard' | 'store-dashboard' | 'page';
  id: string;
  storeId?: string;
  tooltipText?: string; // Added for tooltip
}

const mainDashboardItem: NavItem = { href: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard, type: 'main-dashboard', id: 'main-dashboard', tooltipText: "Panel de Control Global" };

const storeDefinitions = [
  { value: "S001", label: "Tienda Principal (S001)" },
  { value: "S002", label: "Sucursal Centro (S002)" },
  { value: "S003", label: "Sucursal Norte (S003)" },
  { value: "S004", label: "Panadería Oeste (S004)" },
  { value: "S005", label: "Punto Sur (S005)" },
  { value: "S006", label: "Kiosko Este (S006)" },
];

const storeNavItems: NavItem[] = storeDefinitions.map(store => ({
  href: `/dashboard?store=${store.value}`,
  label: store.label,
  icon: Store,
  type: 'store-dashboard' as const,
  storeId: store.value,
  id: store.value,
  tooltipText: store.label,
}));

const otherPageItems: NavItem[] = [
  { href: '/sales-forecast', label: 'Pronóstico Ventas', icon: TrendingUp, type: 'page' as const, id: 'sales-forecast', tooltipText: "Pronóstico de Ventas" },
  { href: '/stock-alerts', label: 'Alertas de Stock', icon: Archive, type: 'page' as const, id: 'stock-alerts', tooltipText: "Alertas de Stock" },
  { href: '/manufacturing-orders', label: 'Órdenes Fabricación', icon: ClipboardList, type: 'page' as const, id: 'manufacturing-orders', tooltipText: "Órdenes de Fabricación" },
  { href: '/data-upload', label: 'Carga de Datos', icon: FileUp, type: 'page' as const, id: 'data-upload', tooltipText: "Carga de Datos Históricos" },
];

const allNavItems: NavItem[] = [mainDashboardItem, ...storeNavItems, ...otherPageItems];


// This component directly renders NextLink or button with styles and content
const SidebarNavItemContent: React.FC<{ item: NavItem; isActive: boolean }> = ({ item, isActive }) => {
  const { isMobile, state: sidebarState } = useSidebar();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const IconComponent = item.icon || Minus; // Fallback icon

  // Props for the actual interactive element (<a> or <button>)
  // These include styling from CVA and data attributes.
  const interactiveElementProps = {
    className: cn(
      sidebarMenuButtonVariants({ variant: 'default', size: 'default' }),
      "peer/menu-button" // Specific class for this context if needed
    ),
    'data-active': isActive,
    'data-sidebar': "menu-button",
    // Add other common props if necessary
  };

  let elementToRender: JSX.Element;

  if (item.href) {
    elementToRender = (
      <NextLink
        href={item.href}
        {...interactiveElementProps} // Spread classes and data-attributes directly onto NextLink
      >
        <IconComponent />
        <span>{item.label}</span>
      </NextLink>
    );
  } else {
    elementToRender = (
      <button
        type="button"
        onClick={item.action}
        {...interactiveElementProps} // Spread classes and data-attributes
      >
        <IconComponent />
        <span>{item.label}</span>
      </button>
    );
  }

  const tooltipContent = item.tooltipText || item.label;
  const shouldShowTooltip = tooltipContent && hasMounted && !isMobile && sidebarState === "collapsed";

  if (shouldShowTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{elementToRender}</TooltipTrigger>
        <TooltipContent side="right" align="center" className="font-body">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    );
  }

  return elementToRender;
};


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
        } else {
          isActive = pathname === item.href;
        }

        return (
          <SidebarMenuItem key={item.id}>
            <SidebarNavItemContent item={item} isActive={isActive} />
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
