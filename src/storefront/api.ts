import { BASE_URL } from "../api/base";
import type { Product, SiteOrder, SitePage, SiteSettings, SiteUser } from "./types";

const API_BASE = `${BASE_URL}/storefront`;

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

const readError = async (response: Response) => {
  const payload = (await response.json().catch(() => ({ message: response.statusText }))) as {
    message?: string;
  };

  throw new Error(payload.message || response.statusText || "Request failed");
};

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    await readError(response);
  }

  const payload = (await response.json()) as Envelope<T>;
  return payload.data;
};

export const storefrontApi = {
  getSiteSettings: (siteName: string) =>
    request<SiteSettings>(`${API_BASE}/sites/${encodeURIComponent(siteName)}/settings`),

  listPages: (siteName: string) =>
    request<SitePage[]>(`${API_BASE}/sites/${encodeURIComponent(siteName)}/pages`),

  createPage: (siteName: string, pageName: string, pageSlug: string) =>
    request<SitePage>(`${API_BASE}/sites/${encodeURIComponent(siteName)}/pages`, {
      method: "POST",
      body: JSON.stringify({ pageName, pageSlug }),
    }),

  updatePage: (
    siteName: string,
    pageId: string,
    payload: Partial<Pick<SitePage, "pageName" | "pageSlug" | "isHomepage" | "puckData">>,
  ) =>
    request<SitePage>(`${API_BASE}/sites/${encodeURIComponent(siteName)}/pages/${encodeURIComponent(pageId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deletePage: (siteName: string, pageId: string) =>
    request<boolean>(`${API_BASE}/sites/${encodeURIComponent(siteName)}/pages/${encodeURIComponent(pageId)}`, {
      method: "DELETE",
    }),

  getHomepage: (siteName: string) =>
    request<SitePage>(`${API_BASE}/sites/${encodeURIComponent(siteName)}/pages/home`),

  getPageBySlug: (siteName: string, slug: string) =>
    request<SitePage>(`${API_BASE}/sites/${encodeURIComponent(siteName)}/pages/slug/${encodeURIComponent(slug)}`),

  listProducts: (siteName: string, query?: { search?: string; category?: string; sort?: string }) => {
    const params = new URLSearchParams();

    if (query?.search) params.set("search", query.search);
    if (query?.category) params.set("category", query.category);
    if (query?.sort) params.set("sort", query.sort);

    const suffix = params.toString() ? `?${params.toString()}` : "";

    return request<Product[]>(`${API_BASE}/sites/${encodeURIComponent(siteName)}/products${suffix}`);
  },

  getProduct: (siteName: string, productId: string) =>
    request<Product>(`${API_BASE}/sites/${encodeURIComponent(siteName)}/products/${encodeURIComponent(productId)}`),

  signup: (siteName: string, idToken: string, name: string) =>
    request<SiteUser>(`${API_BASE}/auth/signup`, {
      method: "POST",
      body: JSON.stringify({ siteName, idToken, name }),
    }),

  login: (siteName: string, idToken: string) =>
    request<SiteUser>(`${API_BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ siteName, idToken }),
    }),

  getUser: (siteName: string, email: string) =>
    request<SiteUser>(`${API_BASE}/site-users/${encodeURIComponent(siteName)}/${encodeURIComponent(email)}`),

  updateCart: (siteName: string, email: string, items: Array<Record<string, unknown>>) =>
    request<SiteUser>(`${API_BASE}/site-users/${encodeURIComponent(siteName)}/${encodeURIComponent(email)}/cart`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),

  updateWishlist: (siteName: string, email: string, wishlist: string[]) =>
    request<SiteUser>(`${API_BASE}/site-users/${encodeURIComponent(siteName)}/${encodeURIComponent(email)}/wishlist`, {
      method: "PUT",
      body: JSON.stringify({ wishlist }),
    }),

  updateAddresses: (siteName: string, email: string, savedAddresses: Array<Record<string, unknown>>) =>
    request<SiteUser>(`${API_BASE}/site-users/${encodeURIComponent(siteName)}/${encodeURIComponent(email)}/addresses`, {
      method: "PUT",
      body: JSON.stringify({ savedAddresses }),
    }),

  createOrder: (
    siteName: string,
    payload: {
      customerEmail: string;
      customerName: string;
      customerPhone: string;
      shippingAddress: Record<string, unknown>;
      items: Array<Record<string, unknown>>;
      subtotal: number;
      shippingFee: number;
      total: number;
      notes?: string;
    },
  ) =>
    request<SiteOrder>(`${API_BASE}/sites/${encodeURIComponent(siteName)}/orders`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listOrders: (siteName: string, email: string) =>
    request<SiteOrder[]>(`${API_BASE}/sites/${encodeURIComponent(siteName)}/orders/customer/${encodeURIComponent(email)}`),

  generateWithAi: (siteName: string, prompt: string, currentPages: SitePage[], activePageId?: string) =>
    request<SitePage[]>(`${API_BASE}/sites/${encodeURIComponent(siteName)}/ai-builder`, {
      method: "POST",
      body: JSON.stringify({ prompt, currentPages, activePageId }),
    }),
};
