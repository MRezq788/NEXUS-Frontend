import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useTheme } from "../contexts/ThemeContext";
import { usersApi } from "../api";
import { ChevronDown, ChevronRight } from "lucide-react";

interface FormState {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  submit?: string;
}

interface Cashier {
  id: string;
  email: string;
  name: string;
  role: string;
  businessOwnerId: string;
  createdAt?: unknown;
  profileImageUrl?: string;
}

interface CashierInventoryVariant {
  id: string;
  quantity: number;
  price?: number;
  [key: string]: any;
}

interface CashierInventoryProduct {
  id: string;
  name: string;
  category?: string;
  active?: boolean;
  variants?: CashierInventoryVariant[];
}

interface CashierInventoryResponse {
  success: boolean;
  message: string;
  data: CashierInventoryProduct[];
}

const initialState: FormState = {
  name: "",
  email: "",
  password: "",
};

function formatCreatedAt(value: unknown) {
  if (!value) return "N/A";

  if (typeof value === "string" || typeof value === "number") {
    return new Date(value).toLocaleDateString();
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (typeof value === "object" && value !== null) {
    const maybeSeconds = (value as { seconds?: unknown }).seconds;
    if (typeof maybeSeconds === "number") {
      return new Date(maybeSeconds * 1000).toLocaleDateString();
    }
  }

  return "N/A";
}

export function StaffManagement() {
  const { isDark } = useTheme();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCreateCashierExpanded, setIsCreateCashierExpanded] = useState(false);
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [isLoadingCashiers, setIsLoadingCashiers] = useState(true);
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [cashierInventory, setCashierInventory] = useState<CashierInventoryProduct[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [returnQtyByVariant, setReturnQtyByVariant] = useState<Record<string, number>>({});
  const [returningVariantId, setReturningVariantId] = useState<string | null>(null);
  const [returnMessage, setReturnMessage] = useState<string | null>(null);

  // Fetch cashiers on component mount
  useEffect(() => {
    fetchCashiers();
  }, []);

  const fetchCashiers = async () => {
    setIsLoadingCashiers(true);
    try {
      const response = await usersApi.getCashiers();
      if (response.success && response.data?.cashiers) {
        setCashiers(response.data.cashiers);
      }
    } catch (error) {
      console.error("Error fetching cashiers:", error);
      setCashiers([]);
    } finally {
      setIsLoadingCashiers(false);
    }
  };

  const fetchCashierInventory = async (cashierEmail: string) => {
    setIsLoadingInventory(true);
    setInventoryError(null);
    setReturnMessage(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setCashierInventory([]);
        setInventoryError("User not authenticated.");
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch("http://localhost:3000/api/shop-products?page=1&limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User-Email": cashierEmail,
        },
      });

      const json: CashierInventoryResponse = await res.json();

      if (!res.ok || !json.success) {
        setCashierInventory([]);
        setInventoryError(json.message || "Failed to load cashier inventory.");
        return;
      }

      setCashierInventory(json.data || []);
      const nextQty: Record<string, number> = {};
      (json.data || []).forEach((product) => {
        (product.variants || []).forEach((variant) => {
          nextQty[`${product.id}::${variant.id}`] = variant.quantity > 0 ? 1 : 0;
        });
      });
      setReturnQtyByVariant(nextQty);
    } catch (error) {
      console.error("Error fetching cashier inventory:", error);
      setCashierInventory([]);
      setInventoryError(error instanceof Error ? error.message : "Failed to load cashier inventory.");
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const validate = (state: FormState): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!state.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!state.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(state.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!state.password.trim()) {
      nextErrors.password = "Password is required";
    } else if (state.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    return nextErrors;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setIsSuccess(false);
    setErrors({});

    try {
      // Call the API to create cashier account
      await usersApi.createCashier(form.name, form.email, form.password);

      setIsSuccess(true);
      setForm(initialState);

      // Refresh the cashiers list
      await fetchCashiers();
    } catch (error: unknown) {
      console.error("Error creating cashier:", error);

      // Handle specific error messages from backend
      const errorMessage = error instanceof Error ? error.message : "Failed to create cashier account. Please try again.";
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewCashierDetails = async (cashier: Cashier) => {
    setSelectedCashier(cashier);
    setInventoryError(null);
    setReturnMessage(null);
    await fetchCashierInventory(cashier.email);
  };

  const getVariantLabel = (variant: CashierInventoryVariant, index: number) => {
    const { id, quantity, price, active, status, ...attrs } = variant;
    const attrValues = Object.values(attrs).filter(Boolean);
    if (attrValues.length > 0) return attrValues.join(" / ");
    return `Variant ${index + 1}`;
  };

  const handleReturnQtyChange = (productId: string, variantId: string, value: string, maxQty: number) => {
    const parsed = Number.parseInt(value, 10);
    const key = `${productId}::${variantId}`;

    setReturnQtyByVariant((prev) => ({
      ...prev,
      [key]: maxQty <= 0 ? 0 : Number.isNaN(parsed) ? 1 : Math.min(Math.max(parsed, 1), maxQty),
    }));
  };

  const handleReturnInventory = async (
    productId: string,
    variantId: string,
    availableQty: number,
  ) => {
    if (!selectedCashier || availableQty <= 0) return;

    const key = `${productId}::${variantId}`;
    const requested = returnQtyByVariant[key] ?? 1;
    const returnQty = Math.min(Math.max(requested, 1), availableQty);

    setReturningVariantId(key);
    setInventoryError(null);
    setReturnMessage(null);

    try {
      await usersApi.returnInventoryFromCashier({
        cashierId: selectedCashier.id,
        productId,
        variantId,
        quantity: returnQty,
      });

      setCashierInventory((prev) =>
        prev.map((product) => {
          if (product.id !== productId) return product;
          return {
            ...product,
            variants: (product.variants || []).map((variant) =>
              variant.id === variantId
                ? { ...variant, quantity: Math.max(0, variant.quantity - returnQty) }
                : variant,
            ),
          };
        }),
      );

      setReturnQtyByVariant((prev) => ({
        ...prev,
        [key]: Math.max(0, availableQty - returnQty) > 0 ? 1 : 0,
      }));

      setReturnMessage(
        `Returned ${returnQty} item${returnQty > 1 ? "s" : ""} from cashier inventory back to owner inventory.`,
      );
    } catch (error) {
      console.error("Error returning inventory:", error);
      setInventoryError(error instanceof Error ? error.message : "Failed to return inventory.");
    } finally {
      setReturningVariantId(null);
    }
  };

  const cardClass = isDark
    ? "bg-[#1e1f23] border-[#2d2e33] text-white"
    : "bg-white border-gray-200 text-gray-900";

  const inputClass = isDark
    ? "bg-[#18191b] border-[#2d2e33] text-white placeholder:text-gray-500"
    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400";

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Staff Management
          </h1>
          <p className={`mt-2 text-sm md:text-base ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Create cashier accounts for your business.
          </p>
        </header>

        <section className={`rounded-2xl border p-5 md:p-6 shadow-sm ${cardClass}`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Create Cashier Account</h2>
            <button
              type="button"
              onClick={() => setIsCreateCashierExpanded((prev) => !prev)}
              className={`rounded-lg p-2 transition-colors ${
                isDark
                  ? "bg-[#232428] text-gray-300 hover:bg-[#2a2c30]"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              aria-expanded={isCreateCashierExpanded}
              aria-label={isCreateCashierExpanded ? "Collapse create cashier form" : "Expand create cashier form"}
            >
              {isCreateCashierExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {isCreateCashierExpanded && (
            <>
              <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Enter cashier details to create a new account for your business.
              </p>

              {isSuccess && (
                <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${isDark ? "border-emerald-600/40 bg-emerald-900/20 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                  Cashier account created successfully! Login credentials have been set up.
                </div>
              )}

              {errors.submit && (
                <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${isDark ? "border-red-600/40 bg-red-900/20 text-red-300" : "border-red-200 bg-red-50 text-red-700"}`}>
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="staff-name" className="mb-2 block text-sm font-medium">
                    Name
                  </label>
                  <input
                    id="staff-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${inputClass} ${errors.name ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-300"}`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="staff-email" className="mb-2 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="staff-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${inputClass} ${errors.email ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-300"}`}
                    placeholder="cashier@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="staff-password" className="mb-2 block text-sm font-medium">
                    Password
                  </label>
                  <input
                    id="staff-password"
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${inputClass} ${errors.password ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-300"}`}
                    placeholder="Minimum 6 characters"
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${isSubmitting ? "cursor-not-allowed bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {isSubmitting ? "Creating..." : "Create Cashier"}
                </button>
              </form>
            </>
          )}
        </section>

        {/* Cashiers List Section */}
        <section className={`rounded-2xl border p-5 md:p-6 shadow-sm ${cardClass}`}>
          <h2 className="text-lg font-semibold mb-4">Cashiers List</h2>

          {isLoadingCashiers ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : cashiers.length === 0 ? (
            <div className={`py-8 text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              <p className="text-sm">No cashiers created yet.</p>
              <p className="text-xs mt-1">Create your first cashier using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                    <th className={`text-left py-3 px-4 font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Name
                    </th>
                    <th className={`text-left py-3 px-4 font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Email
                    </th>
                    <th className={`text-left py-3 px-4 font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Status
                    </th>
                    <th className={`text-left py-3 px-4 font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Created
                    </th>
                    <th className={`text-left py-3 px-4 font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cashiers.map((cashier) => (
                    <tr
                      key={cashier.id}
                      className={`border-b transition-colors ${
                        isDark
                          ? "border-gray-700 hover:bg-[#25262b]"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <td className={`py-4 px-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-xs font-semibold">
                              {cashier.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {cashier.name}
                        </div>
                      </td>
                      <td className={`py-4 px-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {cashier.email}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                          Active
                        </span>
                      </td>
                      <td className={`py-4 px-4 text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                        {formatCreatedAt(cashier.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleViewCashierDetails(cashier)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedCashier && (
            <div className={`mt-6 rounded-xl border p-4 ${isDark ? "border-[#2d2e33] bg-[#18191b]" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Cashier Details
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {selectedCashier.name} • {selectedCashier.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCashier(null);
                    setCashierInventory([]);
                    setInventoryError(null);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? "bg-[#232428] text-gray-300 hover:bg-[#2a2c30]" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
                >
                  Close
                </button>
              </div>

              <div className="mt-4">
                <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Inventory (owner can reclaim stock)
                </h4>

                {returnMessage && (
                  <div className={`mb-3 rounded-lg border px-3 py-2 text-xs ${isDark ? "border-emerald-600/40 bg-emerald-900/20 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                    {returnMessage}
                  </div>
                )}

                {isLoadingInventory ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : inventoryError ? (
                  <p className="text-sm text-red-500">{inventoryError}</p>
                ) : cashierInventory.length === 0 ? (
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    No inventory allocated to this cashier yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200/50">
                    <table className="w-full text-sm">
                      <thead className={isDark ? "bg-[#131416]" : "bg-white"}>
                        <tr>
                          <th className="text-left py-2.5 px-3">Product</th>
                          <th className="text-left py-2.5 px-3">Variant</th>
                          <th className="text-left py-2.5 px-3">Category</th>
                          <th className="text-left py-2.5 px-3">Available Qty</th>
                          <th className="text-left py-2.5 px-3">Return Qty</th>
                          <th className="text-left py-2.5 px-3">Action</th>
                          <th className="text-left py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cashierInventory.flatMap((product) => {
                          const active = product.active !== false;
                          const variants = product.variants || [];

                          if (variants.length === 0) {
                            const key = `${product.id}::default`;
                            return (
                              <tr key={key} className={`border-t ${isDark ? "border-[#2d2e33] text-gray-300" : "border-gray-200 text-gray-700"}`}>
                                <td className="py-2.5 px-3">{product.name}</td>
                                <td className="py-2.5 px-3">-</td>
                                <td className="py-2.5 px-3">{product.category || "Uncategorized"}</td>
                                <td className="py-2.5 px-3">0</td>
                                <td className="py-2.5 px-3">-</td>
                                <td className="py-2.5 px-3">-</td>
                                <td className="py-2.5 px-3">{active ? "Out of Stock" : "Inactive"}</td>
                              </tr>
                            );
                          }

                          return variants.map((variant, index) => {
                            const key = `${product.id}::${variant.id}`;
                            const variantQty = Number(variant.quantity) || 0;
                            const status = !active ? "Inactive" : variantQty > 0 ? "In Stock" : "Out of Stock";
                            const inputValue = returnQtyByVariant[key] ?? (variantQty > 0 ? 1 : 0);

                            return (
                              <tr key={key} className={`border-t ${isDark ? "border-[#2d2e33] text-gray-300" : "border-gray-200 text-gray-700"}`}>
                                <td className="py-2.5 px-3">{product.name}</td>
                                <td className="py-2.5 px-3">{getVariantLabel(variant, index)}</td>
                                <td className="py-2.5 px-3">{product.category || "Uncategorized"}</td>
                                <td className="py-2.5 px-3">{variantQty}</td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="number"
                                    min={variantQty > 0 ? 1 : 0}
                                    max={variantQty}
                                    value={inputValue}
                                    disabled={variantQty <= 0 || !active}
                                    onChange={(event) =>
                                      handleReturnQtyChange(product.id, variant.id, event.target.value, variantQty)
                                    }
                                    className={`w-20 rounded-lg border px-2 py-1 text-xs outline-none ${
                                      isDark
                                        ? "border-[#2d2e33] bg-[#131416] text-white"
                                        : "border-gray-200 bg-white text-gray-900"
                                    } disabled:opacity-50`}
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <button
                                    type="button"
                                    onClick={() => handleReturnInventory(product.id, variant.id, variantQty)}
                                    disabled={variantQty <= 0 || !active || returningVariantId === key}
                                    className="rounded-lg bg-amber-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {returningVariantId === key ? "Returning..." : "Return"}
                                  </button>
                                </td>
                                <td className="py-2.5 px-3">{status}</td>
                              </tr>
                            );
                          });
                        })}
                       </tbody>
                     </table>
                   </div>
                 )}
               </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

