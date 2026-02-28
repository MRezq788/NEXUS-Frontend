import { useEffect, useState, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";

// ─── Types ───────────────────────────────────────────────────────────────────

interface InventoryItem {
  id?: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  unit: string;
  status: string;
  inStock?: boolean;
  lastUpdated: string;
  updatedAt: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: InventoryItem[];
    nextPageCursor: string | null;
    hasMore: boolean;
  };
  message: string;
}

interface ApiCountResponse {
  success: boolean;
  data: {
    count: number
  };
  message: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const API_URL = "http://localhost:3000/api/business-inventory";
const PAGE_SIZE = 10;
const EMAIL = localStorage.getItem('userEmail') || 'warehouse1@nexus.com'; // hardcoded for development

// ─── Icon helpers ────────────────────────────────────────────────────────────

const IconComponent = ({ name, isDark }: { name: string; isDark: boolean }) => {
  const color = isDark ? "#9ca3af" : "#6b7280";

  const icons: Record<string, React.ReactElement> = {
    box: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    checkCircle: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    xCircle: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    search: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    filter: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
    chevronLeft: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    ),
    chevronRight: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          <p className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
            {title}
          </p>
          <p className={`text-xs mb-3 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {subtitle}
          </p>
          <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
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
          icon === "checkCircle" ? "bg-green-500" : icon === "xCircle" ? "bg-red-500" : "bg-blue-500"
        }`}
      />
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isItemInStock(item: InventoryItem): boolean {
  if (typeof item.inStock === "boolean") return item.inStock;
  if (typeof item.status === "string") {
    return item.status.toLowerCase().replace(/\s+/g, "") === "instock";
  }
  return false;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function Inventory() {
  const { isDark } = useTheme();

  // Data state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state (cursor-based)
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "true" | "false">("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Stat counts
  const [stats, setStats] = useState({ total: 0, inStock: 0, outOfStock: 0 });

  // ── Debounce search ────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCursorStack([]);
    setNextCursor(null);
    setCurrentPage(1);
  }, [debouncedSearch, stockFilter]);

  // ── Fetch stats (separate light calls) ─────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const [totalRes, inStockRes, outStockRes] = await Promise.all([
        fetch(`${API_URL}/count`, {
            headers: { 
                "X-User-Email": EMAIL
            } 
        }),
        fetch(`${API_URL}/count?inStock=true`, {
            headers: { 
                "X-User-Email": EMAIL
            } 
        }),
        fetch(`${API_URL}/count?inStock=false`, {
            headers: { 
                "X-User-Email": EMAIL
            } 
        }),
      ]);
      const [totalJson, inStockJson, outStockJson]: ApiCountResponse[] = await Promise.all([
        totalRes.json(),
        inStockRes.json(),
        outStockRes.json(),
      ]);
      setStats({
        total: totalJson.success ? totalJson.data.count : 0,
        inStock: inStockJson.success ? inStockJson.data.count : 0,
        outOfStock: outStockJson.success ? outStockJson.data.count : 0,
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
    async (cursor?: string) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("limit", String(PAGE_SIZE));
        if (cursor) params.set("startAfter", cursor);
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (stockFilter !== "all") params.set("inStock", stockFilter);

        const res = await fetch(`${API_URL}?${params.toString()}`, {
            headers: { 
                "X-User-Email": EMAIL
            } 
        });
        const json: ApiResponse = await res.json();

        if (!json.success) {
          throw new Error(json.message || "Failed to fetch inventory");
        }

        setItems(json.data.data);
        setNextCursor(json.data.nextPageCursor);
        setHasMore(json.data.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, stockFilter]
  );

  // Initial load & refetch on search/filter change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Pagination handlers ────────────────────────────────────────────────────

  const handleNextPage = () => {
    if (!hasMore || !nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
    setCurrentPage((p) => p + 1);
    fetchData(nextCursor);
  };

  const handlePrevPage = () => {
    if (cursorStack.length === 0) return;
    const newStack = [...cursorStack];
    newStack.pop(); // Remove the cursor for current page
    const prevCursor = newStack.length > 0 ? newStack[newStack.length - 1] : undefined;
    setCursorStack(newStack);
    setCurrentPage((p) => p - 1);
    fetchData(prevCursor);
  };

  // ── Filter label ───────────────────────────────────────────────────────────

  const filterLabel =
    stockFilter === "all" ? "All Items" : stockFilter === "true" ? "In Stock" : "Out of Stock";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Inventory Management
        </h2>
        <p className={`mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
          Today, {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Items"
          subtitle="Total items in inventory"
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 pb-4">
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Inventory Overview
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
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
                className={`w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl text-sm transition-colors ${
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showFilterDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                  <div
                    className={`absolute right-0 mt-2 w-44 rounded-xl z-20 overflow-hidden shadow-lg ${
                      isDark
                        ? "bg-[#232425] border border-gray-800"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    {(["all", "true", "false"] as const).map((val) => {
                      const label = val === "all" ? "All Items" : val === "true" ? "In Stock" : "Out of Stock";
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className={`${
                  isDark ? "bg-black/30 border-y border-gray-800" : "bg-gray-50/80 border-y border-gray-100"
                }`}
              >
                {["Name", "Description", "Category", "Qty", "Price", "Unit", "Status", "Last Updated"].map(
                  (h) => (
                    <th
                      key={h}
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr
                    key={i}
                    className={`${isDark ? "border-b border-gray-800/50" : "border-b border-gray-50"}`}
                  >
                    {Array.from({ length: 8 }).map((_, j) => (
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
                      onClick={() => fetchData(cursorStack[cursorStack.length - 1])}
                      className="mt-3 text-sm text-blue-500 hover:underline"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
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
                          ? "border-b border-gray-800/50 hover:bg-white/[0.02]"
                          : "border-b border-gray-50 hover:bg-gray-50/50"
                      }`}
                    >
                      <td
                        className={`px-6 py-4 font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {item.name}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {item.description}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                            isDark ? "bg-black/40 text-gray-300" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {item.quantity}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        ${item.price.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
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
                      <td className={`px-6 py-4 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                        {formatDate(item.lastUpdated || item.updatedAt)}
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
          className={`flex items-center justify-between px-6 py-4 ${
            isDark ? "border-t border-gray-800/50" : "border-t border-gray-100"
          }`}
        >
          <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
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
              disabled={!hasMore}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                !hasMore
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
