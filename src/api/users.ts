import { fetchApi } from "./base";

export interface Product {
  id: string;
  name: string;
  quantity: number;
}

export interface Cashier {
  id: string;
  name: string;
  totalSales: number;
}

export interface ChartData {
  label: string;
  value: number;
}

export interface UserSites {
  ownedSites: string[];
  isUserOwner: boolean;
}

export interface UserRevenue {
  data: ChartData[];
}

export const usersApi = {
  getSoldTotal: async (userId: string) => {
    return fetchApi<{ totalSold: number }>(`/users/sold-total/${userId}`);
  },

  getBoughtTotal: async (userId: string) => {
    return fetchApi<{ totalBought: number }>(`/users/bought-total/${userId}`);
  },

  getOwnedSites: async (userId: string) => {
    return fetchApi<UserSites>(`/users/owned-sites/${userId}`);
  },

  getMostSoldProducts: async (userId: string, range?: number) => {
    return fetchApi<{ mostSoldProducts: Product[] }>(`/users/most-sold-products/${userId}`, {
      params: { range },
    });
  },

  getSoldTotalSpecificDay: async (userId: string, date: string) => {
    return fetchApi<{ totalSold: number }>(`/users/sold-total/${userId}/specific-day`, {
      params: { date },
    });
  },

  getMostSellingCashiers: async (userId: string, range?: number) => {
    return fetchApi<{ topCashiers: Cashier[] }>(`/users/most-selling-cashiers/${userId}`, {
      params: { range },
    });
  },

  getRevenue: async (userId: string, period?: "week" | "month" | "year") => {
    return fetchApi<{ data: ChartData[] }>(`/users/revenue/${userId}`, {
      params: { period },
    });
  },

  getRevenueGrowth: async (userId: string, period?: "week" | "month" | "year") => {
    return fetchApi<{ growth: { currentPeriodTotal: number; previousPeriodTotal: number; growth: number } }>(`/users/revenue-growth/${userId}`, {
      params: { period },
    });
  },

  getTotalOrdersPeriod: async (userId: string, period?: "week" | "month" | "year") => {
    return fetchApi<{ totalOrders: number }>(`/users/total-orders-period/${userId}`, {
      params: { period },
    });
  },

  getTotalRevenuePeriod: async (userId: string, period?: "week" | "month" | "year") => {
    return fetchApi<{ totalRevenue: number }>(`/users/total-revenue-period/${userId}`, {
      params: { period },
    });
  },

  getRecentOrders: async (userId: string, limit?: number) => {
    return fetchApi<{ recentOrders: { id: string; total: number; type: string; createdAt: Date }[] }>(`/users/recent-orders/${userId}`, {
      params: { limit },
    });
  },

  createCashier: async (name: string, email: string, password: string) => {
    return fetchApi<{ uid: string; email: string; name: string }>(`/users/cashiers`, {
      method: "POST",
      body: { name, email, password },
    });
  },

  getUserProfile: async () => {
    return fetchApi<{ email: string; name: string; role: string; profileImageUrl?: string }>(`/users/profile`);
  },

  getCashiers: async () => {
    return fetchApi<{
      cashiers: Array<{
        id: string;
        email: string;
        name: string;
        role: string;
        businessOwnerId: string;
        createdAt?: unknown;
        profileImageUrl?: string;
      }>
    }>(`/users/cashiers`);
  },
};
