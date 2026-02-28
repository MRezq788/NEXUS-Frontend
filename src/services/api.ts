import type { Order, OrderStatus, Product, ProductStatus } from "../config/types";

const API_BASE_URL = "http://localhost:3000/api";

// Helper to get auth headers from localStorage
function getAuthHeaders(): Record<string, string> {
  const email = localStorage.getItem('userEmail') || '';
  return {
    "Content-Type": "application/json",
    "X-User-Email": email, // Send email with every request
  };
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ==================== PAGINATION ====================

export interface PaginatedResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetProductsParams {
  page: number;
  limit: number;
  search?: string;
  status?: ProductStatus | "All";
}

export async function getProducts(params: GetProductsParams): Promise<PaginatedResponse> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    ...(params.search && { search: params.search }),
    ...(params.status && params.status !== "All" && { status: params.status }),
  });

  return fetchWithAuth(`${API_BASE_URL}/products?${queryParams}`);
}

// ==================== CRUD OPERATIONS ====================

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  return fetchWithAuth(`${API_BASE_URL}/products`, {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  return fetchWithAuth(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return fetchWithAuth(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
  });
}

export async function deleteProductsBatch(ids: string[]): Promise<void> {
  return fetchWithAuth(`${API_BASE_URL}/products/batch`, {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}
export async function getProductStats(): Promise<{ total: number; inStock: number; outOfStock: number }> {
  const response = await fetchWithAuth(`${API_BASE_URL}/products/stats`);
  // Handle both wrapped and unwrapped responses
  return response.data || response;
}

// ==================== ORDERS API ====================

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  const queryParams = new URLSearchParams();
  if (status) {
    queryParams.append('status', status.toLocaleLowerCase());
  }
  
  const query = queryParams.toString();
  const url = `${API_BASE_URL}/orders${query ? `?${query}` : ''}`;
  
  const response = await fetchWithAuth(url);
  return response.data || response;
}

export async function getOrderById(orderId: string): Promise<Order> {
  const response = await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}`);
  return response.data || response;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const response = await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response.data || response;
}

// Accept order - validates stock and deducts quantities
export async function acceptOrder(orderId: string): Promise<{ success: boolean; message?: string }> {
  const response = await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/accept`, {
    method: "POST",
  });
  return response.data || response;
}

// Reject order - sets status to Cancelled
export async function rejectOrder(orderId: string): Promise<Order> {
  const response = await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/reject`, {
    method: "POST",
  });
  return response.data || response;
}

export async function getProductById(productId: string): Promise<Product> {
  const response = await fetchWithAuth(`${API_BASE_URL}/products/${productId}`);
  return response.data || response;
}