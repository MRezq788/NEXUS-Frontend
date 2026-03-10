import type { SidebarTab } from "./types";

export const sidebarTabs: SidebarTab[] = [
  { title: "Dashboard", route: "/dashboard" },
  { title: "Warehouses", route: "/warehouses" },
  { title: "Inventory", route: "/dashboard/inventory" },
  { title: "Orders", route: "/orders" },
  { title: "Reports", route: "/reports" },
  { title: "Settings", route: "/dashboard" },
  { title: "Staff Management", route: "/staff-management" },
];

export const warehouseTabs: SidebarTab[] = [
  { title: "Dashboard", route: "/dashboard" },
  { title: "Inventory", route: "/dashboard/stock" },
  { title: "Orders", route: "/dashboard/orders" },
];

export const cashierTabs: SidebarTab[] = [
  { title: "Dashboard", route: "/dashboard" },
  { title: "Orders", route: "/dashboard/orders" },
  { title: "Reports", route: "/dashboard" },
];
