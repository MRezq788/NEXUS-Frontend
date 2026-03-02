import type { SidebarTab } from './types';

export const sidebarTabs: SidebarTab[] = [
  { title: 'Dashboard', route: '/dashboard' },
  { title: 'Warehouses', route: '/warehouses' },
  { title: 'Inventory', route: '/dashboard/inventory' },
  { title: 'Orders', route: '/dashboard/orders' },
  { title: 'Reports', route: '/dashboard/reports' },
  { title: 'Settings', route: '/dashboard/settings' },
];

export const warehouseTabs: SidebarTab[] = [
  { title: 'Dashboard', route: '/dashboard' },
  { title: 'Stock', route: '/dashboard/stock' },
  { title: 'Inbound', route: '/dashboard/inbound' },
  { title: 'Outbound', route: '/dashboard/outbound' },
];
