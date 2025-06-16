
"use client";

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, // This is the simplified presentation component
  useSidebar 
} from '@/components/ui/sidebar';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { LayoutDashboard, TrendingUp, Archive, FileUp, Store, ClipboardList, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href?: string;
  action?: () => void; // For button-like behavior
  label: string;
  icon: LucideIcon;
  type: 'main-dashboard' | 'store-dashboard' | 'page';
  id: string;
  storeId?: string; // Only for store-dashboard type
}

const mainDashboardItem: NavItem = { href: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard, type: 'main-dashboard', id: 'main-dashboard' };

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
}));

const otherPageItems: NavItem[] = [
  { href: '/sales-forecast', label: 'Pronóstico Ventas', icon: TrendingUp, type: 'page' as const, id: 'sales-forecast'},
  { href: '/stock-alerts', label: 'Alertas de Stock', icon: Archive, type: 'page' as const, id: 'stock-alerts'},
  { href: '/manufacturing-orders', label: 'Órdenes Fabricación', icon: ClipboardList, type: 'page' as const, id: 'manufacturing-orders' },
  { href: '/data-upload', label: 'Carga de Datos', icon: FileUp, type: 'page' as const, id: 'data-upload' },
];

const allNavItems: NavItem[] = [mainDashboardItem, ...storeNavItems, ...otherPageItems];

// Helper component for each navigation item
const SidebarNavItemContent: React.FC<{ item: NavItem; isActive: boolean }> = ({ item, isActive }) => {
  const { isMobile, state: sidebarState } = useSidebar();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const IconComponent = item.icon;

  // Core visual content, wrapped by SidebarMenuButton
  const buttonContent = (
    <>
      <IconComponent />
      <span>{item.label}</span>
    </>
  );

  // Props for SidebarMenuButton (which is now a presentational div/span)
  // These props will be passed down from NextLink or button wrappers due to asChild
  const sidebarMenuButtonProps = {
    'data-active': isActive,
    'data-sidebar': "menu-button", // For potential styling hooks
    className: "font-body peer/menu-button", // peer for menu actions/badges if any
    // variant and size can be set here if needed, defaults are usually fine
  };

  let interactiveElement: JSX.Element;

  if (item.href) {
    interactiveElement = (
      <NextLink href={item.href} passHref={false} legacyBehavior={false} asChild>
        {/* SidebarMenuButton here acts as the child for NextLink's asChild,
            effectively becoming the <a> tag. The ref from TooltipTrigger will
            be passed through NextLink to this SidebarMenuButton instance. */}
        <SidebarMenuButton {...sidebarMenuButtonProps}>
          {buttonContent}
        </SidebarMenuButton>
      </NextLink>
    );
  } else {
    // For items that are just buttons (not links)
    interactiveElement = (
      // <button> wrapper with asChild, making SidebarMenuButton behave like a button
      <button 
        type="button" 
        onClick={item.action} 
        className="w-full" // Ensure button takes full width if SidebarMenuButton doesn't
        // data-active, data-sidebar will be on SidebarMenuButton
        // The ref from TooltipTrigger will be passed to this button,
        // which then passes it to SidebarMenuButton via asChild if button used asChild (not strictly necessary here).
        // For simplicity, if we don't need the button itself to use asChild, we apply props directly.
        // However, to be consistent with the asChild pattern used by TooltipTrigger:
        // Let's make the button also use asChild for cleaner prop merging.
        // No, this is incorrect. The <button> IS the element. SidebarMenuButton is INSIDE it.
        // The ref from TooltipTrigger needs to go to THIS button.
        // So, this button becomes the child of TooltipTrigger.
        // And SidebarMenuButton is the child of this button.
        // To make the button look like SidebarMenuButton, we'd pass asChild to the button
        // and SidebarMenuButton as its child.
      >
        {/* This structure might need adjustment if the button itself needs complex styling via CVA like SidebarMenuButton.
            For now, let's assume the button will directly contain the styled SidebarMenuButton.
            This implies the <button> itself should get the CVA classes.
            Let's simplify: SidebarMenuButton itself will be a button if no href.
            The new `SidebarMenuButton` definition should handle being a button or a div.
            Going back to the new SidebarMenuButton which is just a div:
        */}
         <Slot // This Slot is crucial for the button to adopt SidebarMenuButton's appearance
            className={cn(
              // We need to get classes from sidebarMenuButtonVariants directly here
              // This is becoming complex. Let's rethink the interactive element for non-href.
              // Alternative for non-href:
              // SidebarMenuButton itself is a button.
              // Let's assume SidebarMenuButton can render as a button via a prop.
              // No, simpler: the outer element IS the button or NextLink.
              // SidebarMenuButton just provides the inner content styling.
            )}
            {...sidebarMenuButtonProps} // These apply to the button element itself
            onClick={item.action} 
            type="button"
         >
            {buttonContent}
         </Slot>
      </button>
    );
     // Correction: If no href, the interactive element is a button.
     // This button should have the visual styling.
     // The `SidebarMenuButton` component is a `div` that applies styling.
     // So, the structure should be `<button><SidebarMenuButton>...</SidebarMenuButton></button>`
     // where the outer button is the `asChild` target for `TooltipTrigger`.
     // And the outer button needs the CVA classes.
     // This means SidebarMenuButton can't be the direct child of TooltipTrigger in this case.
     // Let's make the outer element take the CVA classes.

      const ButtonComp = item.href ? NextLink : 'button';
      const commonInteractiveProps: any = {
        ...(item.href ? { href: item.href, passHref: false, legacyBehavior: false } : { type: 'button', onClick: item.action }),
        // Apply CVA styles and other data attributes here, as this is the interactive element.
        className: cn(
            // sidebarMenuButtonVariants({ variant: 'default', size: 'default' }), // Apply CVA directly
            "font-body peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
            { "bg-sidebar-accent font-medium text-sidebar-accent-foreground": isActive } // Simplified active state styling
        ),
        'data-active': isActive,
        'data-sidebar': "menu-button",
      };
      
      interactiveElement = (
        <ButtonComp {...commonInteractiveProps} asChild={!!item.href}> 
          {/* asChild only for NextLink */}
          {/* If NextLink, its child (the effective <a>) IS SidebarMenuButton */}
          {/* If button, its children are directly IconComponent and span */}
          {item.href ? (
            <SidebarMenuButton variant="default" size="default" {...sidebarMenuButtonProps}>
              {buttonContent}
            </SidebarMenuButton>
          ) : (
            <>
              <IconComponent />
              <span>{item.label}</span>
            </>
          )}
        </ButtonComp>
      );
  }


  const tooltipProps = {
    side: "right" as const,
    align: "center" as const,
    className: "font-body",
  };

  const shouldShowTooltip = tooltipProps && hasMounted && !isMobile && sidebarState === "collapsed";

  if (shouldShowTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{interactiveElement}</TooltipTrigger>
        <TooltipContent {...tooltipProps}>{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return interactiveElement;
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
