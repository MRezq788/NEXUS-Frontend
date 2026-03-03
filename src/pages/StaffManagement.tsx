import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { usersApi } from "../api";

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

const initialState: FormState = {
  name: "",
  email: "",
  password: "",
};

export function StaffManagement() {
  const { isDark } = useTheme();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [isLoadingCashiers, setIsLoadingCashiers] = useState(true);

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
          <h2 className="text-lg font-semibold">Create Cashier Account</h2>
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
                        {cashier.createdAt
                          ? new Date(
                              typeof cashier.createdAt === "object" &&
                              "seconds" in cashier.createdAt
                                ? (cashier.createdAt as { seconds: number }).seconds * 1000
                                : cashier.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

