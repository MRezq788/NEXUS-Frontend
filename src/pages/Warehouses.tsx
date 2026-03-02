import { useEffect, useState, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Warehouse {
  id: string;
  role: string;
  siteIds: string[];
  email: string;
  name: string;
  category: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: Warehouse[];
    nextPageCursor: string | null;
    hasMore: boolean;
  };
  message: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const API_URL = "http://localhost:3000" as string;
const PAGE_SIZE = 8;

const HARDCODED_CATEGORIES = [
  "General",
  "Retail",
  "Electronics",
  "Grocery",
  "Pharmacy",
  "Clothing",
  "Automotive",
  "Furniture",
];

// ─── Icon helpers ────────────────────────────────────────────────────────────

const IconComponent = ({ name, isDark }: { name: string; isDark: boolean }) => {
  const color = isDark ? "#9ca3af" : "#6b7280";

  const icons: Record<string, React.ReactElement> = {
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
    warehouse: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 20h20M4 20V8l8-5 8 5v12M9 20v-5h6v5M9 12h.01M15 12h.01" />
      </svg>
    ),
  };

  return icons[name] || null;
};

// ─── Main Component ──────────────────────────────────────────────────────────

export function Warehouses() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Data state
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Available categories (hardcoded)
  const [categories] = useState<string[]>(HARDCODED_CATEGORIES);

  // ── Debounce search ────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCursorStack([]);
    setNextCursor(null);
    setCurrentPage(1);
  }, [debouncedSearch, categoryFilter]);

  // categories are provided by HARDCODED_CATEGORIES; no fetch on mount

  // ── Fetch warehouse data ───────────────────────────────────────────────────

  const fetchData = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("limit", String(PAGE_SIZE));
        if (cursor) params.set("startAfter", cursor);
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (categoryFilter !== "all") params.set("category", categoryFilter);

        const res = await fetch(`${API_URL}/api/warehouses?${params.toString()}`);
        const json: ApiResponse = await res.json();

        if (!json.success) {
          throw new Error(json.message || "Failed to fetch warehouses");
        }

        setWarehouses(json.data.data);
        setNextCursor(json.data.nextPageCursor);
        setHasMore(json.data.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setWarehouses([]);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, categoryFilter]
  );

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
    newStack.pop();
    const prevCursor = newStack.length > 0 ? newStack[newStack.length - 1] : undefined;
    setCursorStack(newStack);
    setCurrentPage((p) => p - 1);
    fetchData(prevCursor);
  };

  // ── Card click ─────────────────────────────────────────────────────────────

  const handleWarehouseClick = (warehouse: Warehouse) => {
    navigate(`/warehouses/shop`, {
      state: { email: warehouse.email, warehouseName: warehouse.name },
    });
  };

  // ── Filter label ───────────────────────────────────────────────────────────

  const filterLabel = categoryFilter === "all" ? "All Categories" : categoryFilter;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Warehouses
        </h2>
        <p className={`mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
          Browse available warehouses and their products.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            placeholder="Search warehouses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full sm:w-72 pl-10 pr-4 py-2.5 rounded-xl text-sm transition-colors ${
              isDark
                ? "bg-[#18191b] border border-gray-800 text-white placeholder-gray-500 focus:border-blue-500"
                : "bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500"
            } outline-none`}
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isDark
                ? "bg-[#18191b] border border-gray-800 text-gray-300 hover:border-gray-600"
                : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
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
                className={`absolute right-0 mt-2 w-48 rounded-xl z-20 overflow-hidden shadow-lg ${
                  isDark
                    ? "bg-[#232425] border border-gray-800"
                    : "bg-white border border-gray-200"
                }`}
              >
                <button
                  onClick={() => {
                    setCategoryFilter("all");
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    categoryFilter === "all"
                      ? isDark
                        ? "bg-blue-600/20 text-blue-400"
                        : "bg-blue-50 text-blue-600"
                      : isDark
                      ? "text-gray-300 hover:bg-[#2b2c2e]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategoryFilter(cat);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      categoryFilter === cat
                        ? isDark
                          ? "bg-blue-600/20 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                        : isDark
                        ? "text-gray-300 hover:bg-[#2b2c2e]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl overflow-hidden ${
                isDark ? "bg-[#18191b]" : "bg-white border border-gray-100 shadow-lg shadow-gray-200/50"
              }`}
            >
              <div className={`h-40 animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
              <div className="p-4 space-y-3">
                <div className={`h-4 w-2/3 rounded animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                <div className={`h-3 w-1/3 rounded animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => fetchData(cursorStack[cursorStack.length - 1])}
            className="mt-3 text-sm text-blue-500 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : warehouses.length === 0 ? (
        <div className={`text-center py-16 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          No warehouses found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {warehouses.map((warehouse, idx) => (
            <button
              key={warehouse.id}
              onClick={() => handleWarehouseClick(warehouse)}
              className={`group text-left rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                isDark
                  ? "bg-[#18191b] border border-[#18191b] hover:border-gray-700"
                  : "bg-white border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl"
              }`}
              style={{
                animation: `fadeInUp 0.4s ease-out ${idx * 50}ms both`,
              }}
            >
              {/* Placeholder image */}
              <div
                className={`h-40 flex items-center justify-center ${
                  isDark
                    ? "bg-gradient-to-br from-gray-800 to-gray-900"
                    : "bg-gradient-to-br from-gray-100 to-gray-200"
                }`}
              >
                <div className={`opacity-40 group-hover:opacity-60 transition-opacity`}>
                  <IconComponent name="warehouse" isDark={isDark} />
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3
                  className={`font-semibold truncate ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {warehouse.name}
                </h3>
                <span
                  className={`inline-block mt-2 px-2.5 py-1 rounded-lg text-xs font-medium ${
                    isDark ? "bg-black/40 text-gray-300" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {warehouse.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && warehouses.length > 0 && (
        <div
          className={`flex items-center justify-between pt-2`}
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
                  ? "bg-[#18191b] text-gray-300 hover:bg-[#2b2c2e] hover:text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
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
                  ? "bg-[#18191b] text-gray-300 hover:bg-[#2b2c2e] hover:text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
              <IconComponent name="chevronRight" isDark={isDark} />
            </button>
          </div>
        </div>
      )}

      {/* Keyframe animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
