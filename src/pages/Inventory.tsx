import { useEffect, useState, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/base";

// ─── Types ───────────────────────────────────────────────────────────────────

interface InventoryItem {
  id?: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  basePrice?: number;
  price: number;
  unit: string;
  status: string;
  inStock?: boolean;
  lastUpdated: string | { _seconds: number; _nanoseconds: number };
  updatedAt: string | { _seconds: number; _nanoseconds: number };
  createdAt: string | { _seconds: number; _nanoseconds: number };
  active?: boolean;
  variants?: { price: number; quantity: number }[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiCountResponse {
  success: boolean;
  data: {
    totalProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    totalUnits: number;
    totalInventoryValue: number;
  };
  message: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const API_URL = `${BASE_URL}/shop-products`;
const PAGE_SIZE = 10;

// ─── Icon helpers ────────────────────────────────────────────────────────────

const IconComponent = ({ name, isDark }: { name: string; isDark: boolean }) => {
  const color = isDark ? "#9ca3af" : "#6b7280";

  const icons: Record<string, React.ReactElement> = {
    box: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    checkCircle: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#22c55e"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    xCircle: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#ef4444"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
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
    filter: (
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
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
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
  };

  return icons[name] || null;
};

// ─── Stat Card ───────────────────────────────────────────────────────────────

const StatCard = ({
  title,
  subtitle,
  value,
  icon,
  isDark,
  delay,
}: {
  title: string;
  subtitle: string;
  value: number;
  icon: string;
  isDark: boolean;
  delay: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
        isDark
          ? "bg-[#18191b] border border-[#18191b]"
          : "bg-white border border-gray-100 shadow-xl shadow-gray-200/50"
      } ${isVisible ? "opacity-100" : "opacity-0"}`}
      style={{
        transition: `all 0.5s ease-out ${delay}ms`,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {title}
          </p>
          <p
            className={`text-xs mb-3 ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            {subtitle}
          </p>
          <p
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {value}
          </p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDark ? "bg-black/40" : "bg-gray-50"
          }`}
        >
          <IconComponent name={icon} isDark={isDark} />
        </div>
      </div>
      <div
        className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 ${
          icon === "checkCircle"
            ? "bg-green-500"
            : icon === "xCircle"
              ? "bg-red-500"
              : "bg-blue-500"
        }`}
      />
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isItemInStock(item: InventoryItem): boolean {
  // If explicitly provided
  if (typeof item.inStock === "boolean") return item.inStock;

  // New API uses 'active' for visibility, but we can also check actual quantity
  const totalQty =
    item.variants && item.variants.length > 0
      ? item.variants.reduce((acc, v) => acc + (v.quantity || 0), 0)
      : item.quantity || 0;

  if (item.active === false) return false;
  return totalQty > 0;
}

function formatDate(date: any): string {
  if (!date) return "-";
  try {
    let d: Date;
    if (typeof date === "string") {
      d = new Date(date);
    } else if (typeof date === "object" && date._seconds) {
      d = new Date(date._seconds * 1000);
    } else {
      return String(date);
    }

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(date);
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function Inventory() {
  const { isDark } = useTheme();

  // Data state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state (page-based)
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "true" | "false">(
    "all",
  );
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Stat counts
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
  });

  // ── Debounce search ────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, stockFilter]);

  // ── Fetch stats from real backend summary endpoint ─────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const summaryRes = await fetch(`${API_URL}/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User-Email": user.email || "",
        },
      });

      const summaryJson: ApiCountResponse = await summaryRes.json();

      setStats({
        total: summaryJson.success ? summaryJson.data.totalProducts : 0,
        inStock: summaryJson.success ? summaryJson.data.inStockProducts : 0,
        outOfStock: summaryJson.success
          ? summaryJson.data.outOfStockProducts
          : 0,
        lowStock: summaryJson.success ? summaryJson.data.lowStockProducts : 0,
      });
    } catch {
      // Stats are supplementary — silently fail
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ── Fetch table data ───────────────────────────────────────────────────────

  const fetchData = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        const params = new URLSearchParams();
        params.set("limit", String(PAGE_SIZE));
        params.set("page", String(page));
        params.set("sortBy", "createdAt");
        params.set("sortOrder", "desc");
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (stockFilter !== "all") params.set("inStock", stockFilter);

        const res = await fetch(`${API_URL}?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-Email": user.email || "",
          },
        });
        const json: ApiResponse = await res.json();

        if (!json.success) {
          throw new Error(json.message || "Failed to fetch inventory");
        }

        setItems(json.data);
        setTotalPages(json.totalPages);
        setTotalItems(json.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, stockFilter],
  );

  // Initial load & refetch on page/search/filter change
  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  // ── Pagination handlers ────────────────────────────────────────────────────

  const handleNextPage = () => {
    if (currentPage >= totalPages) return;
    setCurrentPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    if (currentPage <= 1) return;
    setCurrentPage((p) => p - 1);
  };

  // ── Filter label ───────────────────────────────────────────────────────────

  const filterLabel =
    stockFilter === "all"
      ? "All Items"
      : stockFilter === "true"
        ? "In Stock"
        : "Out of Stock";

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch(
        `${BASE_URL}/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-email": user.email || "",
          },
        },
      );

      const json = await res.json();
      if (json.success) {
        // Refresh data and stats
        fetchData(currentPage);
        fetchStats();
      } else {
        alert("Error: " + json.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Inventory Management
          </h2>
          <p className={`mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            Today,{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/inventory/add")}
          className={`group w-full md:w-auto justify-center flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
            isDark
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
              : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 font-bold"
          }`}
        >
          <svg
            className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Product
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          subtitle="All products in your inventory"
          value={stats.total}
          icon="box"
          isDark={isDark}
          delay={100}
        />
        <StatCard
          title="In Stock"
          subtitle="Items currently available"
          value={stats.inStock}
          icon="checkCircle"
          isDark={isDark}
          delay={200}
        />
        <StatCard
          title="Out of Stock"
          subtitle="Items currently unavailable"
          value={stats.outOfStock}
          icon="xCircle"
          isDark={isDark}
          delay={300}
        />
        <StatCard
          title="Low Stock"
          subtitle="Products with 1-5 units"
          value={stats.lowStock}
          icon="filter"
          isDark={isDark}
          delay={400}
        />
      </div>

      {/* Inventory Table Section */}
      <div
        className={`rounded-2xl overflow-hidden ${
          isDark
            ? "bg-[#18191b] border border-[#18191b]"
            : "bg-white border border-gray-100 shadow-xl shadow-gray-200/50"
        }`}
      >
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 sm:p-6 pb-4">
          <h3
            className={`text-lg sm:text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Inventory Overview
            <span
              className={`ml-2 sm:ml-3 text-xs sm:text-sm font-normal ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              ({totalItems} total products)
            </span>
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <div
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                <IconComponent name="search" isDark={isDark} />
              </div>
              <input
                type="text"
                placeholder="Search Item"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full sm:min-w-[18rem] lg:w-64 pl-10 pr-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isDark
                    ? "bg-black/40 border border-gray-800 text-white placeholder-gray-500 focus:border-blue-500"
                    : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                } outline-none`}
              />
            </div>

            {/* Filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown((prev) => !prev)}
                className={`w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isDark
                    ? "bg-black/40 border border-gray-800 text-gray-300 hover:border-gray-600"
                    : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                <IconComponent name="filter" isDark={isDark} />
                <span>{filterLabel}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showFilterDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFilterDropdown(false)}
                  />
                  <div
                    className={`absolute right-0 mt-2 w-44 rounded-xl z-20 overflow-hidden shadow-lg ${
                      isDark
                        ? "bg-[#232425] border border-gray-800"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    {(["all", "true", "false"] as const).map((val) => {
                      const label =
                        val === "all"
                          ? "All Items"
                          : val === "true"
                            ? "In Stock"
                            : "Out of Stock";
                      const active = stockFilter === val;
                      return (
                        <button
                          key={val}
                          onClick={() => {
                            setStockFilter(val);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            active
                              ? isDark
                                ? "bg-blue-600/20 text-blue-400"
                                : "bg-blue-50 text-blue-600"
                              : isDark
                                ? "text-gray-300 hover:bg-[#2b2c2e]"
                                : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Cards */}
        <div className="block lg:hidden px-4 sm:px-6 pb-4 space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl ${isDark ? "bg-black/30" : "bg-gray-50"}`}
              >
                <div
                  className={`h-4 w-2/3 rounded animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`}
                />
                <div
                  className={`h-3 w-1/2 mt-2 rounded animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`}
                />
                <div
                  className={`h-3 w-1/3 mt-3 rounded animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`}
                />
              </div>
            ))
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-red-500 font-medium text-sm">{error}</p>
              <button
                onClick={() => fetchData(currentPage)}
                className="mt-3 text-sm text-blue-500 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div
              className={`py-10 text-center text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              No items found
            </div>
          ) : (
            items.map((item, idx) => {
              const inStock = isItemInStock(item);
              const quantity =
                item.variants && item.variants.length > 0
                  ? item.variants.reduce((acc, v) => acc + (v.quantity || 0), 0)
                  : item.quantity || 0;
              const price =
                item.variants && item.variants.length > 0
                  ? Math.min(
                      ...item.variants.map(
                        (v) => v.price || item.basePrice || 0,
                      ),
                    )
                  : item.price || item.basePrice || 0;

              return (
                <div
                  key={item.id || idx}
                  className={`p-4 rounded-xl border ${
                    isDark
                      ? "bg-black/30 border-gray-800"
                      : "bg-gray-50/70 border-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={`font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {item.name}
                      </p>
                      <p
                        className={`text-xs mt-1 line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {item.description}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        inStock
                          ? isDark
                            ? "bg-green-500/15 text-green-400"
                            : "bg-green-50 text-green-600"
                          : isDark
                            ? "bg-red-500/15 text-red-400"
                            : "bg-red-50 text-red-600"
                      }`}
                    >
                      {inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                      Category:{" "}
                      <span
                        className={isDark ? "text-gray-200" : "text-gray-800"}
                      >
                        {item.category}
                      </span>
                    </p>
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                      Qty:{" "}
                      <span
                        className={isDark ? "text-gray-200" : "text-gray-800"}
                      >
                        {quantity} {item.unit}
                      </span>
                    </p>
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                      Price:{" "}
                      <span
                        className={isDark ? "text-gray-200" : "text-gray-800"}
                      >
                        ${price.toFixed(2)}
                      </span>
                    </p>
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                      Updated:{" "}
                      <span
                        className={isDark ? "text-gray-200" : "text-gray-800"}
                      >
                        {formatDate(item.updatedAt || item.lastUpdated)}
                      </span>
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/inventory/edit/${item.id}`)
                      }
                      className={`p-2 rounded-lg transition-all ${
                        isDark
                          ? "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                      aria-label="Edit product"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id || "")}
                      className={`p-2 rounded-lg transition-all ${
                        isDark
                          ? "bg-red-600/10 text-red-400 hover:bg-red-600/20"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                      aria-label="Delete product"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className={`${
                  isDark
                    ? "bg-black/30 border-y border-gray-800"
                    : "bg-gray-50/80 border-y border-gray-100"
                }`}
              >
                {[
                  "Name",
                  "Description",
                  "Category",
                  "Qty",
                  "Price",
                  "Unit",
                  "Status",
                  "Last Updated",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr
                    key={i}
                    className={`${isDark ? "border-b border-gray-800/50" : "border-b border-gray-50"}`}
                  >
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div
                          className={`h-4 rounded-md animate-pulse ${
                            isDark ? "bg-gray-800" : "bg-gray-200"
                          }`}
                          style={{ width: `${50 + Math.random() * 40}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <p className="text-red-500 font-medium">{error}</p>
                    <button
                      onClick={() => fetchData(currentPage)}
                      className="mt-3 text-sm text-blue-500 hover:underline"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`px-6 py-16 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    No items found
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const inStock = isItemInStock(item);
                  return (
                    <tr
                      key={item.id || idx}
                      className={`transition-colors ${
                        isDark
                          ? "border-b border-gray-800/50 hover:bg-white/2"
                          : "border-b border-gray-50 hover:bg-gray-50/50"
                      }`}
                    >
                      <td
                        className={`px-6 py-4 font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {item.name}
                      </td>
                      <td
                        className={`px-6 py-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {item.description}
                      </td>
                      <td
                        className={`px-6 py-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                            isDark
                              ? "bg-black/40 text-gray-300"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        {item.variants && item.variants.length > 0
                          ? item.variants.reduce(
                              (acc, v) => acc + (v.quantity || 0),
                              0,
                            )
                          : item.quantity || 0}
                      </td>
                      <td
                        className={`px-6 py-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        ${" "}
                        {(item.variants && item.variants.length > 0
                          ? Math.min(
                              ...item.variants.map(
                                (v) => v.price || item.basePrice || 0,
                              ),
                            )
                          : item.price || item.basePrice || 0
                        ).toFixed(2)}
                        {item.variants && item.variants.length > 1 && "+"}
                      </td>
                      <td
                        className={`px-6 py-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {item.unit}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            inStock
                              ? isDark
                                ? "bg-green-500/15 text-green-400"
                                : "bg-green-50 text-green-600"
                              : isDark
                                ? "bg-red-500/15 text-red-400"
                                : "bg-red-50 text-red-600"
                          }`}
                        >
                          {inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 ${isDark ? "text-gray-500" : "text-gray-500"}`}
                      >
                        {formatDate(item.updatedAt || item.lastUpdated)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/inventory/edit/${item.id}`)
                      }
                      className={`p-2 rounded-lg transition-all ${
                        isDark
                          ? "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                      aria-label="Edit product"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id || "")}
                      className={`p-2 rounded-lg transition-all ${
                        isDark
                          ? "bg-red-600/10 text-red-400 hover:bg-red-600/20"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                      aria-label="Delete product"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 ${
            isDark ? "border-t border-gray-800/50" : "border-t border-gray-100"
          }`}
        >
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
                    ? "bg-black/40 text-gray-300 hover:bg-[#2b2c2e] hover:text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <IconComponent name="chevronLeft" isDark={isDark} />
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentPage >= totalPages
                  ? isDark
                    ? "bg-black/20 text-gray-600 cursor-not-allowed"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : isDark
                    ? "bg-black/40 text-gray-300 hover:bg-[#2b2c2e] hover:text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Next
              <IconComponent name="chevronRight" isDark={isDark} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
