import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { usersApi, type StoreAllocationProduct, type StoreAllocationVariant } from "../api/users";

const INTERNAL_VARIANT_KEYS = new Set([
  "id",
  "price",
  "quantity",
  "basePrice",
  "active",
  "status",
  "sourceOwnerId",
  "sourceProductId",
  "sourceVariantId",
  "sourceProductRef",
  "sourceVariantRef",
  "createdAt",
  "updatedAt",
]);

const getVariantLabel = (variant: StoreAllocationVariant) => {
  const parts = Object.entries(variant)
    .filter(([key, value]) => !INTERNAL_VARIANT_KEYS.has(key) && typeof value === "string" && value.trim().length > 0)
    .map(([, value]) => String(value));

  if (parts.length === 0) {
    return "Default";
  }

  return parts.join(" / ");
};

export function StoreProductAllocationPage() {
  const { isDark } = useTheme();
  const { siteName = "" } = useParams();
  const [ownerProducts, setOwnerProducts] = useState<StoreAllocationProduct[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreAllocationProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allocationMessage, setAllocationMessage] = useState("");
  const [qtyByVariant, setQtyByVariant] = useState<Record<string, number>>({});
  const [allocatingKey, setAllocatingKey] = useState("");

  const shellClasses = useMemo(
    () =>
      isDark
        ? "bg-[#18191b] border-[#2b2c2e] text-white"
        : "bg-white border-gray-200 text-gray-900",
    [isDark],
  );

  const mutedClasses = isDark ? "text-gray-400" : "text-gray-500";

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [ownerRes, storeRes] = await Promise.all([
        usersApi.getStoreAllocationOwnerProducts(),
        usersApi.getAllocatedProductsForStore(siteName),
      ]);

      setOwnerProducts(ownerRes.data?.products || []);
      setStoreProducts(storeRes.data?.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load allocation data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!siteName) return;
    void loadData();
  }, [siteName]);

  const getVariantInputKey = (productId: string, variantId: string) => `${productId}:${variantId}`;

  const getAllocatedStoreQuantity = (productId: string, variantId: string) => {
    const storeProduct = storeProducts.find((product) => product.id === productId);
    const storeVariant = storeProduct?.variants?.find((variant) => variant.id === variantId);
    return Number(storeVariant?.quantity) || 0;
  };

  const onAllocate = async (productId: string, variantId: string, maxOwnerQty: number) => {
    const key = getVariantInputKey(productId, variantId);
    const inputQty = qtyByVariant[key] ?? 1;
    const quantity = Math.min(Math.max(Number(inputQty) || 1, 1), maxOwnerQty);

    setAllocationMessage("");
    setError("");
    setAllocatingKey(key);
    try {
      const result = await usersApi.allocateProductToStore({
        siteName,
        productId,
        variantId,
        quantity,
      });
      const syncStatus = result.data.supabaseSync;
      const syncMessage =
        syncStatus?.status === "failed"
          ? ` Allocation saved, but Supabase sync failed: ${syncStatus.error}`
          : syncStatus?.status === "skipped"
            ? ` Allocation saved, but Supabase sync was skipped (${syncStatus.reason}).`
            : " Supabase sync completed.";

      setAllocationMessage(
        `Allocated ${result.data.allocatedQuantity} unit(s) to ${siteName}. Store variant now has ${result.data.siteVariantQuantity}.${syncMessage}`,
      );
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to allocate product");
    } finally {
      setAllocatingKey("");
    }
  };

  if (!siteName) {
    return <div className="p-6">Missing store site name.</div>;
  }

  return (
    <div className="space-y-6 pb-8">
      <section className={`rounded-2xl border p-5 ${shellClasses}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Store Product Allocation</h2>
            <p className={`mt-1 text-sm ${mutedClasses}`}>
              Allocate owner inventory variants to store: <span className="font-semibold">{siteName}</span>
            </p>
          </div>
          <Link
            to="/my-stores"
            className={`rounded-lg px-3 py-2 text-sm ${isDark ? "bg-[#2b2c2e] text-white" : "bg-gray-100 text-gray-900"}`}
          >
            Back to My Stores
          </Link>
        </div>

        {allocationMessage && <p className="mt-3 text-sm text-emerald-500">{allocationMessage}</p>}
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </section>

      <section className={`rounded-2xl border p-5 ${shellClasses}`}>
        <h3 className="text-lg font-semibold">Owner Inventory</h3>
        {loading ? (
          <p className={`mt-3 text-sm ${mutedClasses}`}>Loading products...</p>
        ) : ownerProducts.length === 0 ? (
          <p className={`mt-3 text-sm ${mutedClasses}`}>No owner products found.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {ownerProducts.map((product) => (
              <article
                key={product.id}
                className={`rounded-xl border p-4 ${isDark ? "border-[#2b2c2e]" : "border-gray-200"}`}
              >
                <h4 className="font-semibold">{product.name || product.id}</h4>
                <p className={`mt-1 text-sm ${mutedClasses}`}>
                  Category: {product.category || "Uncategorized"}
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className={isDark ? "text-gray-300" : "text-gray-600"}>
                      <tr>
                        <th className="px-2 py-2 text-left">Variant</th>
                        <th className="px-2 py-2 text-left">Owner Qty</th>
                        <th className="px-2 py-2 text-left">Store Qty</th>
                        <th className="px-2 py-2 text-left">Allocate Qty</th>
                        <th className="px-2 py-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(product.variants || []).map((variant) => {
                        const inputKey = getVariantInputKey(product.id, variant.id);
                        const ownerQty = Number(variant.quantity) || 0;
                        const storeQty = getAllocatedStoreQuantity(product.id, variant.id);
                        const inputQty = qtyByVariant[inputKey] ?? (ownerQty > 0 ? 1 : 0);

                        return (
                          <tr key={variant.id} className={isDark ? "border-t border-[#2b2c2e]" : "border-t border-gray-200"}>
                            <td className="px-2 py-2">{getVariantLabel(variant)}</td>
                            <td className="px-2 py-2">{ownerQty}</td>
                            <td className="px-2 py-2">{storeQty}</td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min={ownerQty > 0 ? 1 : 0}
                                max={ownerQty}
                                value={inputQty}
                                disabled={ownerQty <= 0}
                                onChange={(event) =>
                                  setQtyByVariant((prev) => ({
                                    ...prev,
                                    [inputKey]: Number(event.target.value) || 1,
                                  }))
                                }
                                className={`w-24 rounded-lg border px-3 py-1.5 ${
                                  isDark ? "border-[#2b2c2e] bg-black/20" : "border-gray-200 bg-white"
                                }`}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <button
                                type="button"
                                disabled={ownerQty <= 0 || allocatingKey === inputKey}
                                onClick={() => void onAllocate(product.id, variant.id, ownerQty)}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white disabled:opacity-50"
                              >
                                {allocatingKey === inputKey ? "Allocating..." : "Allocate"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
