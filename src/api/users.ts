import { fetchApi } from "./base";

export interface Product {
  id: string;
  name: string;
  quantity: number;
}

export interface Cashier {
  id: string;
  name: string;
  email?: string;
  totalSold?: number;
  totalSales?: number;
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

export interface OwnerStore {
  siteName: string;
  owner: string;
  store?: {
    name?: string;
    currency?: string;
    shippingFee?: number;
    aiAssistant?: {
      enabled?: boolean;
      systemPrompt?: string;
      updatedAt?: unknown;
    };
    [key: string]: unknown;
  };
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OwnerStorefrontOrder {
  id: string;
  orderId?: string;
  siteName: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  items?: Array<Record<string, unknown>>;
  subtotal?: number;
  shippingFee?: number;
  total: number;
  paymentMethod?: string;
  status?: string;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type StorefrontOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export interface StoreAllocationVariant {
  id: string;
  quantity: number;
  price?: number;
  [key: string]: unknown;
}

export interface StoreAllocationProduct {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  basePrice?: number;
  variants: StoreAllocationVariant[];
  [key: string]: unknown;
}

export interface AllocateProductToStorePayload {
  siteName: string;
  productId: string;
  variantId: string;
  quantity: number;
}

export interface AllocateProductToStoreResult {
  siteName: string;
  productId: string;
  variantId: string;
  allocatedQuantity: number;
  ownerRemainingVariantQuantity: number;
  ownerRemainingProductQuantity: number;
  siteVariantQuantity: number;
  siteProductQuantity: number;
}

export interface InventoryAllocationPayload {
  cashierId: string;
  productId: string;
  variantId: string;
  quantity: number;
}

export interface ReturnInventoryPayload {
  cashierId: string;
  productId: string;
  variantId: string;
  quantity: number;
}

export interface AllocationHistoryEntry {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  variantAttributes: string;
  quantity: number;
  ownerId: string;
  ownerName: string;
  cashierId: string;
  cashierName: string;
  createdAt: string;
  movementType?: "allocate" | "return";
}

export interface InventoryAllocationResult {
  cashierId: string;
  productId: string;
  variantId: string;
  allocatedQuantity: number;
  ownerRemainingVariantQuantity: number;
  ownerRemainingProductQuantity: number;
  cashierVariantQuantity: number;
  cashierProductQuantity: number;
  historyEntry: AllocationHistoryEntry;
}

export interface ReturnInventoryResult {
  cashierId: string;
  productId: string;
  variantId: string;
  returnedQuantity: number;
  ownerVariantQuantity: number;
  ownerProductQuantity: number;
  cashierVariantQuantity: number;
  cashierProductQuantity: number;
  historyEntry: AllocationHistoryEntry;
}

export interface CashierPosSaleItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
}

export interface CashierPosSaleOrderPayload {
  total: number;
}

export interface CashierPosSaleResult {
  orderId: string;
  items: Array<{
    productId: string;
    variantId: string;
    remainingQuantity: number;
  }>;
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
    return fetchApi<{ mostSoldProducts: Product[] }>(
      `/users/most-sold-products/${userId}`,
      {
        params: { range },
      },
    );
  },

  getSoldTotalSpecificDay: async (userId: string, date: string) => {
    return fetchApi<{ totalSold: number }>(
      `/users/sold-total/${userId}/specific-day`,
      {
        params: { date },
      },
    );
  },

  getMostSellingCashiers: async (userId: string, range?: number) => {
    return fetchApi<{ topCashiers: Cashier[] }>(
      `/users/most-selling-cashiers/${userId}`,
      {
        params: { range },
      },
    );
  },

  getRevenue: async (userId: string, period?: "week" | "month" | "year") => {
    return fetchApi<{ data: ChartData[] }>(`/users/revenue/${userId}`, {
      params: { period },
    });
  },

  getRevenueGrowth: async (
    userId: string,
    period?: "week" | "month" | "year",
  ) => {
    return fetchApi<{
      growth: {
        currentPeriodTotal: number;
        previousPeriodTotal: number;
        growth: number;
      };
    }>(`/users/revenue-growth/${userId}`, {
      params: { period },
    });
  },

  getTotalOrdersPeriod: async (
    userId: string,
    period?: "week" | "month" | "year",
  ) => {
    return fetchApi<{ totalOrders: number }>(
      `/users/total-orders-period/${userId}`,
      {
        params: { period },
      },
    );
  },

  getTotalRevenuePeriod: async (
    userId: string,
    period?: "week" | "month" | "year",
  ) => {
    return fetchApi<{ totalRevenue: number }>(
      `/users/total-revenue-period/${userId}`,
      {
        params: { period },
      },
    );
  },

  getRecentOrders: async (userId: string, limit?: number) => {
    return fetchApi<{
      recentOrders: {
        id: string;
        total: number;
        type: string;
        createdAt: Date | string;
      }[];
    }>(`/users/recent-orders/${userId}`, {
      params: { limit },
    });
  },

  createCashier: async (name: string, email: string, password: string) => {
    return fetchApi<{ uid: string; email: string; name: string }>(
      `/users/cashiers`,
      {
        method: "POST",
        body: { name, email, password },
      },
    );
  },

  getUserProfile: async () => {
    return fetchApi<{
      email: string;
      name: string;
      role: string;
      profileImageUrl?: string;
    }>(`/users/profile`);
  },

  getMyStores: async () => {
    return fetchApi<{ stores: OwnerStore[] }>(`/users/stores`);
  },

  getStorefrontOrders: async (limit?: number) => {
    return fetchApi<{ orders: OwnerStorefrontOrder[] }>(`/users/storefront-orders`, {
      params: { limit },
    });
  },

  updateStorefrontOrderStatus: async (
    siteName: string,
    orderId: string,
    status: StorefrontOrderStatus,
  ) => {
    return fetchApi<{ order: OwnerStorefrontOrder }>(
      `/users/storefront-orders/${encodeURIComponent(siteName)}/${encodeURIComponent(orderId)}/status`,
      {
        method: "PATCH",
        body: { status },
      },
    );
  },

  createStore: async (siteName: string, storeDisplayName?: string) => {
    return fetchApi<{ store: OwnerStore }>(`/users/stores`, {
      method: "POST",
      body: {
        siteName,
        storeDisplayName,
      },
    });
  },

  updateStoreAiAssistant: async (
    siteName: string,
    payload: { enabled: boolean; systemPrompt?: string },
  ) => {
    return fetchApi<{ store: OwnerStore }>(
      `/users/stores/${encodeURIComponent(siteName)}/ai-assistant`,
      {
        method: "PATCH",
        body: payload,
      },
    );
  },

  getStoreAllocationOwnerProducts: async () => {
    return fetchApi<{ products: StoreAllocationProduct[] }>(`/users/stores/products`);
  },

  getAllocatedProductsForStore: async (siteName: string) => {
    return fetchApi<{ products: StoreAllocationProduct[] }>(
      `/users/stores/${siteName}/allocated-products`,
    );
  },

  allocateProductToStore: async (payload: AllocateProductToStorePayload) => {
    return fetchApi<AllocateProductToStoreResult>(`/users/stores/allocate-product`, {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
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
      }>;
    }>(`/users/cashiers`);
  },

  allocateInventoryToCashier: async (payload: InventoryAllocationPayload) => {
    return fetchApi<InventoryAllocationResult>(`/users/cashiers/allocate-inventory`, {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  },

  returnInventoryFromCashier: async (payload: ReturnInventoryPayload) => {
    return fetchApi<ReturnInventoryResult>(`/users/cashiers/return-inventory`, {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  },

  getAllocationHistory: async (limit: number = 20) => {
    return fetchApi<{ history: AllocationHistoryEntry[] }>(`/users/allocations/history`, {
      params: { limit },
    });
  },

  createCashierPosSale: async (
    items: CashierPosSaleItem[],
    order: CashierPosSaleOrderPayload,
  ) => {
    return fetchApi<CashierPosSaleResult>(`/users/cashiers/pos-sales`, {
      method: "POST",
      body: { items, order },
    });
  },
};
