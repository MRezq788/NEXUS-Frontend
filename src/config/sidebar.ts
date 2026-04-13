import type { SidebarTab } from "./types";

export const sidebarTabs: SidebarTab[] = [
  { title: "Dashboard", route: "/dashboard" },
  { title: "Warehouses", route: "/warehouses" },
  { title: "Inventory", route: "/dashboard/inventory" },
  { title: "Inventory Allocation", route: "/dashboard/inventory-allocation" },
  { title: "Orders", route: "/orders" },
  { title: "Reports", route: "/reports" },
  { title: "My Stores", route: "/my-stores" },
  { title: "Settings", route: "/dashboard" },
  { title: "Staff Management", route: "/staff-management" },
];

export const warehouseTabs: SidebarTab[] = [
  { title: "Dashboard", route: "/dashboard" },
  { title: "Inventory", route: "/dashboard/stock" },
  { title: "Orders", route: "/dashboard/orders" },
];

