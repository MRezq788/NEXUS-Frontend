import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { usersApi, type OwnerStore } from "../api/users";

export function MyStoresPage() {
  const { isDark } = useTheme();
  const [stores, setStores] = useState<OwnerStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteName, setSiteName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const shellClasses = useMemo(
    () =>
      isDark
        ? "bg-[#18191b] border-[#2b2c2e] text-white"
        : "bg-white border-gray-200 text-gray-900",
    [isDark],
  );

  const mutedClasses = isDark ? "text-gray-400" : "text-gray-500";

  const loadStores = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await usersApi.getMyStores();
      setStores(response.data?.stores || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStores();
  }, []);

  const createStore = async () => {
    const normalizedSiteName = siteName.trim().toLowerCase();
    if (!normalizedSiteName) {
      setError("Please enter a site name.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await usersApi.createStore(normalizedSiteName, displayName.trim() || undefined);
      setSiteName("");
      setDisplayName("");
      await loadStores();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create store");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <section className={`rounded-2xl border p-5 ${shellClasses}`}>
        <h2 className="text-xl font-semibold">Create New Store</h2>
        <p className={`mt-1 text-sm ${mutedClasses}`}>
          Site name becomes your store URL slug: `siteName` on `/{"{siteName}"}`.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            value={siteName}
            onChange={(event) => setSiteName(event.target.value)}
            placeholder="site-name"
            className={`h-11 rounded-xl border px-3 text-sm ${
              isDark ? "border-[#2b2c2e] bg-black/30" : "border-gray-200 bg-white"
            }`}
          />
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Display name (optional)"
            className={`h-11 rounded-xl border px-3 text-sm ${
              isDark ? "border-[#2b2c2e] bg-black/30" : "border-gray-200 bg-white"
            }`}
          />
          <button
            type="button"
            disabled={submitting}
            onClick={() => void createStore()}
            className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Store"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </section>

      <section className={`rounded-2xl border p-5 ${shellClasses}`}>
        <h2 className="text-xl font-semibold">My Stores</h2>

        {loading ? (
          <p className={`mt-3 text-sm ${mutedClasses}`}>Loading stores...</p>
        ) : stores.length === 0 ? (
          <p className={`mt-3 text-sm ${mutedClasses}`}>No stores yet. Create your first store above.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {stores.map((store) => (
              <article
                key={store.siteName}
                className={`flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between ${
                  isDark ? "border-[#2b2c2e]" : "border-gray-200"
                }`}
              >
                <div>
                  <h3 className="font-semibold">{store.store?.name || store.siteName}</h3>
                  <p className={`text-sm ${mutedClasses}`}>Slug: {store.siteName}</p>
                  <p className={`text-sm ${mutedClasses}`}>Storefront: /{store.siteName}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/my-stores/${store.siteName}/allocation`}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white"
                  >
                    Allocate Products
                  </Link>
                  <Link
                    to={`/${store.siteName}`}
                    target="_blank"
                    className={`rounded-lg px-3 py-2 text-sm ${
                      isDark ? "bg-[#2b2c2e] text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    Open Storefront
                  </Link>
                  <Link
                    to={`/builder/${store.siteName}`}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
                  >
                    Open Builder
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
