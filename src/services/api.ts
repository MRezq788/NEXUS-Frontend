import type { Product, ProductStatus } from "../config/types";

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