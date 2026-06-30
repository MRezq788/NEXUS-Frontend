import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import type { Product, ProductStatus } from "../config/types";
import {
  getProducts,
  deleteProduct,
  deleteProductsBatch,
  getProductStats,
  batchUploadProducts,
  type BatchUploadResult,
  type PaginatedResponse,
} from "../services/warehouse.inventory.api";

// Import components
import { StatusBadge } from "../components/warehouse/StatusBadge";
import { StatCard } from "../components/warehouse/StatCard";
import { ProductDetailsModal } from "../components/warehouse/ProductDetailsModal";
import { ConfirmationModal } from "../components/warehouse/ConfirmationModal";
import { Toast } from "../components/warehouse/Toast";
import { Pagination } from "../components/warehouse/Pagination";
import { BatchUploadModal } from "../components/warehouse/BatchUploadModal";

export function StockPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Search states
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<ProductStatus | "All">(
    "All",
  );

  // Selection states
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(),
  );

  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isBatchUploadModalOpen, setIsBatchUploadModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "info",
    onConfirm: () => {},
  });

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const [isVisible, setIsVisible] = useState(false);

  // Statistics state
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ==================== API FUNCTIONS ====================

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PaginatedResponse = await getProducts({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
        status: filterStatus,
      });
      setProducts(response.products);
      setTotalPages(response.totalPages);
      setSelectedProducts(new Set());
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to fetch products",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, filterStatus]);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const statsData = await getProductStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, [fetchProducts, fetchStats]);

  // ==================== HELPERS ====================

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  // ==================== HANDLERS ====================

  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1);
    setTimeout(() => {
      setSearchQuery(searchInput);
      setIsSearching(false);
    }, 300);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Product",
      message:
        "Are you sure you want to delete this product? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsActionLoading(true);

        try {
          await deleteProduct(id);
          showToast("Product deleted successfully", "success");
          fetchStats();
          if (products.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else {
            fetchProducts();
          }
        } catch (error) {
          showToast(
            error instanceof Error ? error.message : "Failed to delete product",
            "error",
          );
        } finally {
          setIsActionLoading(false);
        }
      },
    });
  };

  const handleBatchDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Multiple Products",
      message: `Are you sure you want to delete ${selectedProducts.size} selected products? This action cannot be undone.`,
      confirmText: "Delete All",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsActionLoading(true);

        try {
          await deleteProductsBatch(Array.from(selectedProducts));
          showToast(
            `${selectedProducts.size} products deleted successfully`,
            "success",
          );
          fetchStats();
          setSelectedProducts(new Set());
          fetchProducts();
        } catch (error) {
          showToast(
            error instanceof Error
              ? error.message
              : "Failed to delete products",
            "error",
          );
        } finally {
          setIsActionLoading(false);
        }
      },
    });
  };

  const handleBatchUpload = async (products: Partial<Product>[]) => {
    if (products.length === 0) return;

    setIsActionLoading(true);
    setIsBatchUploadModalOpen(false);

    try {
      const result: BatchUploadResult = await batchUploadProducts(products);

      if (result.created > 0) {
        showToast(`Successfully created ${result.created} products`, "success");
        fetchStats();
        fetchProducts();
      }

      if (result.failed > 0) {
        console.error("Batch upload errors:", result.errors);
        if (result.created === 0) {
          showToast(`Failed to upload: ${result.errors[0]}`, "error");
        } else {
          showToast(
            `${result.failed} products failed to upload. Check console for details.`,
            "error",
          );
        }
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to upload products",
        "error",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const openEditModal = (product: Product) => {
    navigate(`/dashboard/inventory/edit/${product.id}`);
  };

  const openAddPage = () => {
    navigate("/dashboard/inventory/add");
  };

  const openDetailsModal = (product: Product) => {
    setViewingProduct(product);
    setIsDetailsModalOpen(true);
  };

  const getDelayClass = (ms: number) => {
    const validDelays = [0, 75, 100, 150, 200, 300, 500, 700, 1000];
    if (validDelays.includes(ms)) return `delay-${ms}`;
    return "delay-75";
  };

  return (
    <div className="space-y-6">
      <Toast {...toast} />

      {/* Header */}
      <div
        className={`${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        } transition-all duration-500`}
      >
        <h2
          className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Warehouse Stock
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Items"
          value={stats.total}
          subtitle="Total items in inventory"
          icon="📦"
          color="blue"
          delay={100}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="In Stock Items"
          value={stats.inStock}
          subtitle="Items currently available"
          icon="✅"
          color="green"
          delay={200}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Out of Stock Items"
          value={stats.outOfStock}
          subtitle="Items currently unavailable"
          icon="❌"
          color="red"
          delay={300}
          isLoading={isStatsLoading}
        />
      </div>

      {/* Inventory Table */}
      <div
        className={`rounded-2xl overflow-hidden ${
          isDark
            ? "bg-[#18191b] border border-gray-800"
            : "bg-white border border-gray-100 shadow-xl"
        }`}
      >
        {/* Table Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b ${
            isDark ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <h3
            className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Inventory Overview
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                placeholder="Search item"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className={`pl-4 pr-4 py-2 rounded-lg border text-lg ${
                  isDark
                    ? "bg-black border-gray-700 text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                } focus:outline-none focus:border-blue-500 w-64`}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  isDark
                    ? "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    : "bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                }`}
                title="Search"
              >
                {isSearching ? (
                  <svg
                    className="w-6 h-6 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </button>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className={`p-3 rounded-lg transition-colors ${
                    isDark
                      ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
                  title="Clear search"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <select
              aria-label="Filter by stock status"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as ProductStatus | "All");
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-lg border text-lg ${
                isDark
                  ? "bg-black border-gray-700 text-gray-300"
                  : "bg-gray-50 border-gray-200 text-gray-700"
              } focus:outline-none focus:border-blue-500`}
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <button
              onClick={openAddPage}
              className={`px-4 py-2 rounded-lg font-medium text-white text-lg flex items-center gap-2 transition-all ${
                isDark
                  ? "bg-teal-600 hover:bg-teal-700"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Item
            </button>

            <button
              onClick={() => setIsBatchUploadModalOpen(true)}
              className={`px-4 py-2 rounded-lg font-medium text-white text-lg flex items-center gap-2 transition-all ${
                isDark
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Batch Upload
            </button>
          </div>
        </div>

        {/* Batch Actions */}
        {selectedProducts.size > 0 && (
          <div
            className={`px-6 py-3 border-b flex items-center justify-between ${
              isDark
                ? "bg-blue-500/10 border-gray-800"
                : "bg-blue-50 border-gray-100"
            }`}
          >
            <span
              className={`text-lg ${isDark ? "text-blue-400" : "text-blue-700"}`}
            >
              {selectedProducts.size} item(s) selected
            </span>
            <button
              onClick={handleBatchDelete}
              className={`px-3 py-1.5 rounded-lg text-lg font-medium flex items-center gap-2 transition-colors ${
                isDark
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Selected
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <svg
              className={`w-12 h-12 animate-spin mb-4 ${isDark ? "text-blue-500" : "text-blue-600"}`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Loading products...
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`text-xs uppercase tracking-wider ${
                    isDark
                      ? "bg-black/50 text-gray-400"
                      : "bg-gray-50 text-gray-500"
                  }`}
                >
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        aria-label="Select all products"
                        type="checkbox"
                        checked={
                          products.length > 0 &&
                          selectedProducts.size === products.length
                        }
                        onChange={handleSelectAll}
                        className="w-4.5 h-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold">
                      Item Name
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {products.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`transition-colors ${getDelayClass(index * 50)} ${
                        isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                      } ${selectedProducts.has(product.id) ? (isDark ? "bg-blue-500/10" : "bg-blue-50") : ""}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          aria-label={`Select product ${product.name}`}
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td
                        className={`px-6 py-4 text-lg font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {product.name}
                      </td>
                      <td
                        className={`px-6 py-4 text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        {product.quantity} {product.unit}
                      </td>
                      <td
                        className={`px-6 py-4 text-lg font-semibold ${isDark ? "text-green-400" : "text-green-600"}`}
                      >
                        ${product.price.toFixed(2)}
                      </td>
                      <td
                        className={`px-6 py-4  ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        <span
                          className={`px-2 py-1 rounded-full text-lg ${
                            isDark
                              ? "bg-gray-800 text-gray-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetailsModal(product)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? "hover:bg-green-500/20 text-green-400 hover:text-green-300"
                                : "hover:bg-green-50 text-green-600 hover:text-green-700"
                            }`}
                            title="View Details"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? "hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                                : "hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                            }`}
                            title="Edit Product"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                : "hover:bg-red-50 text-red-600 hover:text-red-700"
                            }`}
                            title="Delete Product"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {products.length === 0 && !isLoading && (
              <div className="py-12 text-center">
                <div className="text-7xl mb-4">📦</div>
                <p
                  className={`text-4xl font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  No products found
                </p>
                <p
                  className={`text-lg mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  Try adjusting your search or filter
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setViewingProduct(null);
        }}
        product={viewingProduct}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        isLoading={isActionLoading}
      />

      <BatchUploadModal
        isOpen={isBatchUploadModalOpen}
        onClose={() => setIsBatchUploadModalOpen(false)}
        onUpload={handleBatchUpload}
        isLoading={isActionLoading}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
