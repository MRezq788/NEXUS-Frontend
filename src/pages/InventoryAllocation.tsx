import { useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import { useTheme } from "../contexts/ThemeContext";
import { usersApi } from "../api";
import type { AllocationHistoryEntry as AllocationHistoryItem } from "../api/users";

interface Cashier {
  id: string;
  email: string;
  name: string;
  role: string;
  businessOwnerId: string;
  createdAt?: unknown;
  profileImageUrl?: string;
}

interface AllocationVariant {
  id: string;
  label: string;
  attributeSummary: string;
  quantity: number;
  price: number;
}

interface AllocationLine {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  status: "In Stock" | "Out of Stock" | "Inactive";
  isActive: boolean;
  variants: AllocationVariant[];
}

interface OwnerProductVariant {
  id: string;
  quantity: number;
  attributes?: Record<string, string>;
  price?: number;
}

interface OwnerProduct {
  id: string;
  name: string;
  description?: string;
  category?: string;
  basePrice?: number;
  active?: boolean;
  variants?: OwnerProductVariant[];
}

interface OwnerProductsResponse {
  success: boolean;
  message: string;
  data: OwnerProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function getProductStatus(quantity: number, isActive: boolean) {
  if (!isActive) return "Inactive" as const;
  if (quantity <= 0) return "Out of Stock" as const;
  return "In Stock" as const;
}

function formatVariantLabel(variant: OwnerProductVariant, index: number) {
  const attributes = variant.attributes
    ? Object.values(variant.attributes).filter(Boolean)
    : [];

  if (attributes && attributes.length > 0) {
    return attributes.join(" / ");
  }

  return `Variant ${index + 1}`;
}

function formatAttributeSummary(attributes?: Record<string, string>) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return "Default variant";
  }

  return Object.entries(attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}

export function InventoryAllocation() {
  const { isDark } = useTheme();
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [isLoadingCashiers, setIsLoadingCashiers] = useState(true);
  const [cashiersError, setCashiersError] = useState<string | null>(null);
  const [selectedCashierId, setSelectedCashierId] = useState<string | null>(null);
  const [lines, setLines] = useState<AllocationLine[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedVariantByProduct, setSelectedVariantByProduct] = useState<Record<string, string>>({});
  const [allocationQtyByVariant, setAllocationQtyByVariant] = useState<Record<string, number>>({});
  const [allocationMessage, setAllocationMessage] = useState<string | null>(null);
  const [allocationError, setAllocationError] = useState<string | null>(null);
  const [allocatingVariantId, setAllocatingVariantId] = useState<string | null>(null);
  const [allocationHistory, setAllocationHistory] = useState<AllocationHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState<"all" | "In Stock" | "Out of Stock" | "Inactive">("all");

  useEffect(() => {
    const fetchCashiers = async () => {
      setIsLoadingCashiers(true);
      setCashiersError(null);
      try {
        const response = await usersApi.getCashiers();
        if (response.success && response.data?.cashiers) {
          setCashiers(response.data.cashiers);
          return;
        }
        setCashiers([]);
        setCashiersError("Failed to load cashiers.");
      } catch (error) {
        console.error("Error fetching cashiers:", error);
        setCashiers([]);
        setCashiersError("Failed to load cashiers.");
      } finally {
        setIsLoadingCashiers(false);
      }
    };

    fetchCashiers();
  }, []);

  useEffect(() => {
    const fetchOwnerProducts = async () => {
      setIsLoadingProducts(true);
      setProductsError(null);

      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setLines([]);
          setProductsError("User not authenticated.");
          return;
        }

        const token = await user.getIdToken();
        const res = await fetch("http://localhost:3000/api/shop-products?page=1&limit=100", {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-Email": user.email || "",
          },
        });

        const json: OwnerProductsResponse = await res.json();

        if (!res.ok || !json.success) {
          setLines([]);
          setProductsError(json.message || "Failed to fetch products");
          return;
        }

        const mappedLines = json.data.map((product) => {
          const fallbackPrice = product.variants?.find((variant) => typeof variant.price === "number")?.price ?? 0;
          const basePrice = typeof product.basePrice === "number" ? product.basePrice : fallbackPrice;
          const variants = (product.variants || []).map((variant, index) => ({
            id: variant.id,
            label: formatVariantLabel(variant, index),
            attributeSummary: formatAttributeSummary(variant.attributes),
            quantity: Number(variant.quantity) || 0,
            price: typeof variant.price === "number" ? variant.price : basePrice,
          }));
          const quantity = variants.reduce((sum, variant) => sum + variant.quantity, 0);
          const isActive = product.active !== false;

          return {
            id: product.id,
            name: product.name,
            description: product.description || "No description available",
            category: product.category || "Uncategorized",
            quantity,
            price: basePrice,
            status: getProductStatus(quantity, isActive),
            isActive,
            variants,
          } satisfies AllocationLine;
        });

        setLines(mappedLines);
      } catch (error) {
        console.error("Error fetching owner products:", error);
        setLines([]);
        setProductsError(
          error instanceof Error ? error.message : "Failed to load products.",
        );
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchOwnerProducts();
  }, []);

  useEffect(() => {
    const fetchAllocationHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await usersApi.getAllocationHistory(10);
        const historyData = response.data?.history;
        setAllocationHistory(Array.isArray(historyData) ? historyData : historyData ? [historyData] : []);
      } catch (error) {
        console.error("Error fetching allocation history:", error);
        setAllocationHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchAllocationHistory();
  }, []);

  const selectedCashier = useMemo(
    () => cashiers.find((cashier) => cashier.id === selectedCashierId) ?? null,
    [cashiers, selectedCashierId],
  );

  const selectedProduct = useMemo(
    () => lines.find((line) => line.id === selectedProductId) ?? null,
    [lines, selectedProductId],
  );

  const selectedVariant = useMemo(() => {
    if (!selectedProduct) return null;
    const selectedVariantId = selectedVariantByProduct[selectedProduct.id];
    return (
      selectedProduct.variants.find((variant) => variant.id === selectedVariantId) ??
      null
    );
  }, [selectedProduct, selectedVariantByProduct]);

  useEffect(() => {
    if (!selectedProduct) return;

    const existingSelectedVariantId = selectedVariantByProduct[selectedProduct.id];
    const hasSelectedVariant = selectedProduct.variants.some(
      (variant) => variant.id === existingSelectedVariantId,
    );
    const fallbackVariant =
      selectedProduct.variants.find((variant) => variant.quantity > 0) ??
      selectedProduct.variants[0];

    if (!hasSelectedVariant && fallbackVariant) {
      setSelectedVariantByProduct((prev) => ({
        ...prev,
        [selectedProduct.id]: fallbackVariant.id,
      }));
    }

    if (fallbackVariant) {
      setAllocationQtyByVariant((prev) => {
        const currentValue = prev[fallbackVariant.id];
        const maxQty = fallbackVariant.quantity;
        const nextValue =
          maxQty <= 0
            ? 0
            : Math.min(Math.max(currentValue ?? 1, 1), maxQty);

        if (currentValue === nextValue) {
          return prev;
        }

        return {
          ...prev,
          [fallbackVariant.id]: nextValue,
        };
      });
    }
  }, [selectedProduct, selectedVariantByProduct]);

  const totals = useMemo(() => {
    return lines.reduce(
      (acc, line) => {
        acc.totalProducts += 1;
        acc.totalQuantity += line.quantity;
        if (line.status === "In Stock") acc.inStockProducts += 1;
        return acc;
      },
      { totalProducts: 0, totalQuantity: 0, inStockProducts: 0 },
    );
  }, [lines]);

  const filteredLines = useMemo(() => {
    const normalizedQuery = productSearchQuery.trim().toLowerCase();

    return lines.filter((line) => {
      const matchesStatus = productStatusFilter === "all" || line.status === productStatusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        line.name.toLowerCase().includes(normalizedQuery) ||
        line.category.toLowerCase().includes(normalizedQuery) ||
        line.description.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [lines, productSearchQuery, productStatusFilter]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setAllocationMessage(null);
    setAllocationError(null);
  };

  const handleSelectVariant = (productId: string, variantId: string, maxQty: number) => {
    setSelectedVariantByProduct((prev) => ({
      ...prev,
      [productId]: variantId,
    }));

    setAllocationQtyByVariant((prev) => {
      const currentValue = prev[variantId];
      const nextValue =
        maxQty <= 0 ? 0 : Math.min(Math.max(currentValue ?? 1, 1), maxQty);

      if (currentValue === nextValue) {
        return prev;
      }

      return {
        ...prev,
        [variantId]: nextValue,
      };
    });
  };

  const handleAllocationQtyChange = (variantId: string, value: string, maxQty: number) => {
    const parsedValue = Number.parseInt(value, 10);

    setAllocationQtyByVariant((prev) => ({
      ...prev,
      [variantId]:
        maxQty <= 0
          ? 0
          : Number.isNaN(parsedValue)
            ? 1
            : Math.min(Math.max(parsedValue, 1), maxQty),
    }));
  };

  const handleAllocateVariant = async (productId: string, variantId: string) => {
    if (!selectedCashier) return;

    const product = lines.find((line) => line.id === productId);
    const variant = product?.variants.find((item) => item.id === variantId);

    if (!product || !variant || variant.quantity <= 0) {
      return;
    }

    const requestedQty = allocationQtyByVariant[variantId] ?? 1;
    const allocatedQty = Math.min(Math.max(requestedQty, 1), variant.quantity);

    setSelectedProductId(productId);
    setSelectedVariantByProduct((prev) => ({
      ...prev,
      [productId]: variantId,
    }));
    setAllocationMessage(null);
    setAllocationError(null);
    setAllocatingVariantId(variantId);

    try {
      const response = await usersApi.allocateInventoryToCashier({
        cashierId: selectedCashier.id,
        productId,
        variantId,
        quantity: allocatedQty,
      });

      const result = response.data;

      setLines((prev) =>
        prev.map((line) => {
          if (line.id !== productId) return line;

          const updatedVariants = line.variants.map((item) =>
            item.id === variantId
              ? { ...item, quantity: result.ownerRemainingVariantQuantity }
              : item,
          );

          return {
            ...line,
            variants: updatedVariants,
            quantity: result.ownerRemainingProductQuantity,
            status: getProductStatus(result.ownerRemainingProductQuantity, line.isActive),
          };
        }),
      );
      setAllocationQtyByVariant((prev) => ({
        ...prev,
        [variantId]: result.ownerRemainingVariantQuantity > 0 ? 1 : 0,
      }));
      setAllocationHistory((prev) => [result.historyEntry, ...prev].slice(0, 10));
      setAllocationMessage(
        `Allocated ${result.allocatedQuantity} unit${result.allocatedQuantity > 1 ? "s" : ""} of ${product.name} (${variant.label}) to ${selectedCashier.name}.`,
      );
    } catch (error) {
      console.error("Error allocating inventory:", error);
      setAllocationError(
        error instanceof Error ? error.message : "Failed to allocate inventory.",
      );
    } finally {
      setAllocatingVariantId(null);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <section
        className={`rounded-2xl border p-6 ${
          isDark ? "bg-[#18191b] border-[#232428]" : "bg-white border-gray-100"
        }`}
      >
        <h1 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
          Inventory Allocation
        </h1>
        <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          First choose one of your cashiers, then select a product, pick a variant, and choose how many units to allocate.
        </p>
      </section>

      <section
        className={`rounded-2xl border p-5 ${
          isDark ? "bg-[#18191b] border-[#232428]" : "bg-white border-gray-100"
        }`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            Select Cashier
          </h2>
          {selectedCashier && (
            <span
              className={`text-xs px-3 py-1 rounded-full ${
                isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
              }`}
            >
              Selected: {selectedCashier.name}
            </span>
          )}
        </div>

        {isLoadingCashiers ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : cashiersError ? (
          <p className="text-sm text-red-500 mt-4">{cashiersError}</p>
        ) : cashiers.length === 0 ? (
          <p className={`text-sm mt-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            No cashiers found. Create cashier accounts first from Staff Management.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {cashiers.map((cashier) => {
              const isSelected = cashier.id === selectedCashierId;
              return (
                <button
                  key={cashier.id}
                  type="button"
                  onClick={() => setSelectedCashierId(cashier.id)}
                  className={`text-left rounded-xl border p-4 transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10"
                      : isDark
                        ? "border-[#2d2e33] hover:border-gray-500"
                        : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {cashier.name}
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {cashier.email}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedCashier ? (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Total Products" value={totals.totalProducts} isDark={isDark} />
            <StatCard label="Total Quantity" value={totals.totalQuantity} isDark={isDark} />
            <StatCard label="In Stock Products" value={totals.inStockProducts} isDark={isDark} />
          </section>

          {allocationMessage && (
            <section
              className={`rounded-2xl border px-4 py-3 text-sm ${
                isDark
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {allocationMessage}
            </section>
          )}

          {allocationError && (
            <section
              className={`rounded-2xl border px-4 py-3 text-sm ${
                isDark
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {allocationError}
            </section>
          )}

          {selectedProduct ? (
            <section
              className={`rounded-2xl border p-6 ${
                isDark ? "bg-[#18191b] border-[#232428]" : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className={`text-xs uppercase tracking-[0.2em] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    Selected Product
                  </p>
                  <h3 className={`mt-2 text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {selectedProduct.name}
                  </h3>
                  <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {selectedProduct.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProductId(null)}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    isDark
                      ? "bg-[#232428] text-gray-300 hover:bg-[#2a2c30]"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Close
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
                <DetailItem label="Category" value={selectedProduct.category} isDark={isDark} />
                <DetailItem label="Total Quantity" value={String(selectedProduct.quantity)} isDark={isDark} />
                <DetailItem label="Base Price" value={`$${selectedProduct.price.toFixed(2)}`} isDark={isDark} />
                <DetailItem label="Status" value={selectedProduct.status} isDark={isDark} />
                <DetailItem label="Assigned Cashier" value={selectedCashier.name} isDark={isDark} />
                <DetailItem label="Active State" value={selectedProduct.isActive ? "Active" : "Inactive"} isDark={isDark} />
                <DetailItem label="Variant Count" value={String(selectedProduct.variants.length)} isDark={isDark} />
                <DetailItem label="Selected Variant" value={selectedVariant?.label || "Choose a variant below"} isDark={isDark} />
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={isDark ? "bg-[#131416]" : "bg-gray-50"}>
                    <tr>
                      <th className="text-left px-4 py-3">Variant</th>
                      <th className="text-left px-4 py-3">Attributes</th>
                      <th className="text-left px-4 py-3">Available</th>
                      <th className="text-left px-4 py-3">Price</th>
                      <th className="text-left px-4 py-3">Allocate Qty</th>
                      <th className="text-left px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProduct.variants.map((variant) => {
                      const isVariantSelected = selectedVariant?.id === variant.id;
                      const inputValue = allocationQtyByVariant[variant.id] ?? (variant.quantity > 0 ? 1 : 0);

                      return (
                        <tr
                          key={variant.id}
                          onClick={() => handleSelectVariant(selectedProduct.id, variant.id, variant.quantity)}
                          className={`border-t cursor-pointer transition-colors ${
                            isVariantSelected
                              ? isDark
                                ? "bg-[#232428] text-white"
                                : "bg-blue-50 text-gray-900"
                              : isDark
                                ? "border-[#232428] text-gray-200 hover:bg-[#202124]"
                                : "border-gray-100 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-4 py-4 font-medium">{variant.label}</td>
                          <td className="px-4 py-4">{variant.attributeSummary}</td>
                          <td className="px-4 py-4">{variant.quantity}</td>
                          <td className="px-4 py-4">${variant.price.toFixed(2)}</td>
                          <td className="px-4 py-4">
                            <input
                              type="number"
                              min={variant.quantity > 0 ? 1 : 0}
                              max={variant.quantity}
                              value={inputValue}
                              disabled={variant.quantity <= 0}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) =>
                                handleAllocationQtyChange(
                                  variant.id,
                                  event.target.value,
                                  variant.quantity,
                                )
                              }
                              className={`w-24 rounded-lg border px-3 py-2 outline-none ${
                                isDark
                                  ? "border-[#2d2e33] bg-[#131416] text-white"
                                  : "border-gray-200 bg-white text-gray-900"
                              } disabled:opacity-50`}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleSelectVariant(selectedProduct.id, variant.id, variant.quantity);
                                }}
                                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                  isVariantSelected
                                    ? isDark
                                      ? "bg-blue-500/20 text-blue-300"
                                      : "bg-blue-100 text-blue-700"
                                    : isDark
                                      ? "bg-[#232428] text-gray-300 hover:bg-[#2a2c30]"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {isVariantSelected ? "Selected" : "Choose"}
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleAllocateVariant(selectedProduct.id, variant.id);
                                }}
                                disabled={variant.quantity <= 0 || !selectedCashier || allocatingVariantId === variant.id}
                                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                              >
                                {allocatingVariantId === variant.id ? "Allocating..." : "Allocate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <section
              className={`rounded-2xl border p-4 ${
                isDark ? "bg-[#18191b] border-[#232428] text-gray-400" : "bg-white border-gray-100 text-gray-500"
              }`}
            >
              Click any product row to open its details card, then choose a variant and quantity to allocate.
            </section>
          )}

          <section
            className={`rounded-2xl border overflow-hidden ${
              isDark ? "bg-[#18191b] border-[#232428]" : "bg-white border-gray-100"
            }`}
          >
            <div className={`px-6 py-4 border-b ${isDark ? "border-[#232428]" : "border-gray-100"}`}>
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                Allocation Queue for {selectedCashier.name}
              </h2>
            </div>

            <div className={`px-6 py-4 border-b flex flex-col md:flex-row gap-3 ${isDark ? "border-[#232428]" : "border-gray-100"}`}>
              <input
                type="text"
                value={productSearchQuery}
                onChange={(event) => setProductSearchQuery(event.target.value)}
                placeholder="Filter products by name, category, or description..."
                className={`w-full md:flex-1 rounded-lg border px-3 py-2 text-sm outline-none ${
                  isDark
                    ? "border-[#2d2e33] bg-[#131416] text-white placeholder-gray-500"
                    : "border-gray-200 bg-white text-gray-900 placeholder-gray-400"
                }`}
              />
              <select
                value={productStatusFilter}
                onChange={(event) =>
                  setProductStatusFilter(
                    event.target.value as "all" | "In Stock" | "Out of Stock" | "Inactive",
                  )
                }
                className={`w-full md:w-52 rounded-lg border px-3 py-2 text-sm outline-none ${
                  isDark
                    ? "border-[#2d2e33] bg-[#131416] text-white"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                <option value="all">All Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : productsError ? (
              <p className="px-6 py-8 text-sm text-red-500">{productsError}</p>
            ) : lines.length === 0 ? (
              <p className={`px-6 py-8 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                No products found for this owner.
              </p>
            ) : filteredLines.length === 0 ? (
              <p className={`px-6 py-8 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                No products match your current filter.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={isDark ? "bg-[#131416]" : "bg-gray-50"}>
                    <tr>
                      <th className="text-left px-6 py-3">Name</th>
                      <th className="text-left px-6 py-3">Description</th>
                      <th className="text-left px-6 py-3">Category</th>
                      <th className="text-left px-6 py-3">Qty</th>
                      <th className="text-left px-6 py-3">Price</th>
                      <th className="text-left px-6 py-3">Status</th>
                      <th className="text-left px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLines.map((line) => (
                      <tr
                        key={line.id}
                        onClick={() => handleSelectProduct(line.id)}
                        className={`border-t cursor-pointer transition-colors ${
                          selectedProductId === line.id
                            ? isDark
                              ? "bg-[#232428] text-white"
                              : "bg-blue-50 text-gray-900"
                            : isDark
                              ? "border-[#232428] text-gray-200 hover:bg-[#202124]"
                              : "border-gray-100 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 font-medium">{line.name}</td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="line-clamp-2">{line.description}</p>
                        </td>
                        <td className="px-6 py-4">{line.category}</td>
                        <td className="px-6 py-4">{line.quantity}</td>
                        <td className="px-6 py-4">${line.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              line.status === "In Stock"
                                ? "bg-green-500/15 text-green-500"
                                : line.status === "Out of Stock"
                                  ? "bg-red-500/15 text-red-500"
                                  : "bg-gray-500/15 text-gray-400"
                            }`}
                          >
                            {line.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSelectProduct(line.id);
                            }}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 transition-colors"
                          >
                            Choose Variant
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section
            className={`rounded-2xl border overflow-hidden ${
              isDark ? "bg-[#18191b] border-[#232428]" : "bg-white border-gray-100"
            }`}
          >
            <div className={`px-6 py-4 border-b ${isDark ? "border-[#232428]" : "border-gray-100"}`}>
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                Recent Allocation History
              </h2>
            </div>

            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : allocationHistory.length === 0 ? (
              <p className={`px-6 py-8 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                No allocations recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={isDark ? "bg-[#131416]" : "bg-gray-50"}>
                    <tr>
                      <th className="text-left px-6 py-3">Product</th>
                      <th className="text-left px-6 py-3">Direction</th>
                      <th className="text-left px-6 py-3">Variant</th>
                      <th className="text-left px-6 py-3">Cashier</th>
                      <th className="text-left px-6 py-3">Qty</th>
                      <th className="text-left px-6 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocationHistory.map((entry) => (
                      <tr
                        key={entry.id}
                        className={`border-t ${
                          isDark ? "border-[#232428] text-gray-200" : "border-gray-100 text-gray-700"
                        }`}
                      >
                        <td className="px-6 py-4 font-medium">{entry.productName}</td>
                        <td className="px-6 py-4">
                          {entry.movementType === "return"
                            ? "Cashier -> Owner"
                            : "Owner -> Cashier"}
                        </td>
                        <td className="px-6 py-4">{entry.variantAttributes}</td>
                        <td className="px-6 py-4">{entry.cashierName}</td>
                        <td className="px-6 py-4">{entry.quantity}</td>
                        <td className="px-6 py-4">{new Date(entry.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : (
        <section
          className={`rounded-2xl border p-6 ${
            isDark ? "bg-[#18191b] border-[#232428] text-gray-400" : "bg-white border-gray-100 text-gray-500"
          }`}
        >
          Choose a cashier to unlock allocation.
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  isDark,
}: {
  label: string;
  value: number;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isDark ? "bg-[#18191b] border-[#232428]" : "bg-white border-gray-100"
      }`}
    >
      <p className={`text-xs uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isDark ? "border-[#232428] bg-[#131416]" : "border-gray-100 bg-gray-50"
      }`}
    >
      <p className={`text-xs uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}>
        {label}
      </p>
      <p className={`mt-2 text-sm font-medium break-words ${isDark ? "text-white" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}
