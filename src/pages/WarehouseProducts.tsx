import { useEffect, useState, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { getAuth } from "firebase/auth";
import { BASE_URL } from "../api/base";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  basePrice?: number;
  unit: string;
  status: string;
  images?: string[];
  lastUpdated: string | { _seconds: number; _nanoseconds: number };
  updatedAt: string | { _seconds: number; _nanoseconds: number };
  createdAt: string | { _seconds: number; _nanoseconds: number };
  variants?: {
    id: string;
    quantity: number;
    price: number;
    attributes?: Record<string, string>;
  }[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data:
    | Product[]
    | {
        data: Product[];
        nextPageCursor: string | null;
        hasMore: boolean;
      };
}

// ─── Config ──────────────────────────────────────────────────────────────────


const PAGE_SIZE = 8;

// ─── Icon helpers ────────────────────────────────────────────────────────────

const IconComponent = ({ name }: { name: string; isDark?: boolean }) => {
  const icons: Record<string, React.ReactElement> = {
    search: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    chevronLeft: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    ),
    chevronRight: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    ),
    package: (
      <svg
        className="w-10 h-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  };

  return icons[name] || null;
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface WarehouseProductsProps {
  warehouseEmail: string;
  warehouseName: string;
  onSelectProduct: (product: Product) => void;
  onBack: () => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function WarehouseProducts({
  warehouseEmail,
  warehouseName,
  onSelectProduct,
  onBack,
}: WarehouseProductsProps) {
  const { isDark } = useTheme();

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Debounce ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setCursorStack([]);
    setNextCursor(null);
    setHasMore(false);
    setCurrentPage(1);
  }, [debouncedSearch]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setError(null);

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : "";

        const params = new URLSearchParams();
        params.set("limit", String(PAGE_SIZE));
        if (cursor) params.set("startAfter", cursor);
        if (debouncedSearch) params.set("search", debouncedSearch);

        const res = await fetch(
          `${BASE_URL}/warehouse-products?${params.toString()}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "X-User-Email": warehouseEmail,
            },
          },
        );
        const json: ApiResponse = await res.json();

        if (!json.success) {
          throw new Error(json.message || "Failed to fetch products");
        }

        if (Array.isArray(json.data)) {
          setProducts(json.data);
          setNextCursor(null);
          setHasMore(false);
        } else {
          setProducts(Array.isArray(json.data.data) ? json.data.data : []);
          setNextCursor(json.data.nextPageCursor ?? null);
          setHasMore(Boolean(json.data.hasMore));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setProducts([]);
        setNextCursor(null);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, warehouseEmail],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Pagination ─────────────────────────────────────────────────────────────

  const handleNextPage = () => {
    if (!hasMore || !nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
    setCurrentPage((p) => p + 1);
    fetchData(nextCursor);
  };

  const handlePrevPage = () => {
    if (currentPage <= 1) return;
    const newStack = [...cursorStack];
    newStack.pop();
    const prevCursor =
      newStack.length > 0 ? newStack[newStack.length - 1] : undefined;
    setCursorStack(newStack);
    setCurrentPage((p) => p - 1);
    fetchData(prevCursor);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-xl transition-colors ${
            isDark
              ? "hover:bg-[#2b2c2e] text-gray-400 hover:text-white"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div>
          <h2
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {warehouseName}
          </h2>
          <p className={`mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {warehouseEmail}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative sm:w-72">
        <div
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        >
          <IconComponent name="search" />
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-colors ${
            isDark
              ? "bg-[#18191b] border border-gray-800 text-white placeholder-gray-500 focus:border-blue-500"
              : "bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500"
          } outline-none`}
        />
      </div>

      {/* Product Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl overflow-hidden ${
                isDark
                  ? "bg-[#18191b]"
                  : "bg-white border border-gray-100 shadow-lg shadow-gray-200/50"
              }`}
            >
              <div
                className={`h-40 animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`}
              />
              <div className="p-4 space-y-3">
                <div
                  className={`h-4 w-2/3 rounded animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`}
                />
                <div
                  className={`h-3 w-1/3 rounded animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`}
                />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() =>
              fetchData(
                currentPage > 1
                  ? cursorStack[cursorStack.length - 1]
                  : undefined,
              )
            }
            className="mt-3 text-sm text-blue-500 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div
          className={`text-center py-16 ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <button
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className={`group text-left rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                isDark
                  ? "bg-[#18191b] border border-[#18191b] hover:border-gray-700"
                  : "bg-white border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl"
              }`}
              style={{
                animation: `fadeInUp 0.4s ease-out ${idx * 50}ms both`,
              }}
            >
              {/* Image */}
              <div
                className={`h-40 flex items-center justify-center overflow-hidden ${
                  isDark
                    ? "bg-gradient-to-br from-gray-800 to-gray-900"
                    : "bg-gradient-to-br from-gray-100 to-gray-200"
                }`}
              >
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="opacity-40 group-hover:opacity-60 transition-opacity">
                    <IconComponent name="package" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3
                  className={`font-semibold truncate ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {product.name}
                </h3>
                <p
                  className={`text-lg font-bold mt-1 ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  ${(product.price || product.basePrice || 0).toFixed(2)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && products.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            Page {currentPage}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentPage <= 1
                  ? isDark
                    ? "bg-black/20 text-gray-600 cursor-not-allowed"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : isDark
                    ? "bg-[#18191b] text-gray-300 hover:bg-[#2b2c2e] hover:text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <IconComponent name="chevronLeft" />
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!hasMore}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                !hasMore
                  ? isDark
                    ? "bg-black/20 text-gray-600 cursor-not-allowed"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : isDark
                    ? "bg-[#18191b] text-gray-300 hover:bg-[#2b2c2e] hover:text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
              <IconComponent name="chevronRight" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
