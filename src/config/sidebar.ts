import type { SidebarTab } from './types';

export const sidebarTabs: SidebarTab[] = [
  { title: 'Dashboard', route: '/dashboard' },
  { title: 'Warehouses', route: '/warehouses' },
  { title: 'Inventory', route: '/dashboard/inventory' },
  { title: 'Orders', route: '/dashboard/business-owner-orders' },
  { title: 'Reports', route: '/dashboard/reports' },
  { title: 'Settings', route: '/dashboard/settings' },
  { title: 'Staff Management', route: '/staff-management' },
];

export const warehouseTabs: SidebarTab[] = [
  { title: 'Dashboard', route: '/dashboard' },
  { title: 'Stock', route: '/dashboard/stock' },
  { title: 'Orders', route: '/dashboard/orders' },
];

export const cashierTabs: SidebarTab[] = [
  { title: 'Dashboard', route: '/pos' },
  { title: 'Point of Sale', route: '/pos' },
  { title: 'Inventory', route: '/dashboard/inventory' },
  { title: 'Orders', route: '/dashboard/orders' },
  { title: 'Reports', route: '/dashboard/reports' },
];


