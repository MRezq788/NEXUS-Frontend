import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { usersApi, type OwnerStore } from "../api/users";

export function MyStoresPage() {
  const { isDark } = useTheme();
  const [stores, setStores] = useState<OwnerStore[]>([]);
  const [aiDrafts, setAiDrafts] = useState<
    Record<string, { enabled: boolean; systemPrompt: string }>
  >({});
  const [savingAiSite, setSavingAiSite] = useState("");
  const [savedAiSite, setSavedAiSite] = useState("");
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
      const nextStores = response.data?.stores || [];
      setStores(nextStores);
      setAiDrafts(
        nextStores.reduce<Record<string, { enabled: boolean; systemPrompt: string }>>(
          (drafts, store) => {
            drafts[store.siteName] = {
              enabled: Boolean(store.store?.aiAssistant?.enabled),
              systemPrompt: store.store?.aiAssistant?.systemPrompt || "",
            };
            return drafts;
          },
          {},
        ),
      );
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

  const updateAiDraft = (
    storeSiteName: string,
    patch: Partial<{ enabled: boolean; systemPrompt: string }>,
  ) => {
    setSavedAiSite("");
    setAiDrafts((current) => ({
      ...current,
      [storeSiteName]: {
        enabled: current[storeSiteName]?.enabled ?? false,
        systemPrompt: current[storeSiteName]?.systemPrompt ?? "",
        ...patch,
      },
    }));
  };

  const saveAiAssistant = async (store: OwnerStore) => {
    const draft = aiDrafts[store.siteName] || { enabled: false, systemPrompt: "" };
    setSavingAiSite(store.siteName);
    setError("");

    try {
      const response = await usersApi.updateStoreAiAssistant(store.siteName, {
        enabled: draft.enabled,
        systemPrompt: draft.systemPrompt.trim() || undefined,
      });

      setStores((current) =>
        current.map((item) => (item.siteName === store.siteName ? response.data.store : item)),
      );
      setAiDrafts((current) => ({
        ...current,
        [store.siteName]: {
          enabled: Boolean(response.data.store.store?.aiAssistant?.enabled),
          systemPrompt: response.data.store.store?.aiAssistant?.systemPrompt || "",
        },
      }));
      setSavedAiSite(store.siteName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save AI assistant settings");
    } finally {
      setSavingAiSite("");
    }
  };

  const defaultPromptPreview = (store: OwnerStore) =>
    `You are the AI shopping assistant for ${store.store?.name || store.siteName}. Help customers find products, compare options, and answer only from this store's available inventory. Keep links and image URLs out of the text because product cards are shown separately.`;

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
                className={`rounded-xl border p-4 ${
                  isDark ? "border-[#2b2c2e]" : "border-gray-200"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                </div>

                <div
                  className={`mt-4 rounded-xl border p-4 ${
                    isDark ? "border-[#2b2c2e] bg-black/20" : "border-emerald-100 bg-emerald-50/50"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold">AI Assistant</h4>
                      <p className={`text-xs ${mutedClasses}`}>
                        Show a chat helper on this storefront and let it search allocated products.
                      </p>
                    </div>
                    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                      <span className={mutedClasses}>
                        {aiDrafts[store.siteName]?.enabled ? "Enabled" : "Disabled"}
                      </span>
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={Boolean(aiDrafts[store.siteName]?.enabled)}
                        onChange={(event) =>
                          updateAiDraft(store.siteName, { enabled: event.target.checked })
                        }
                      />
                      <span className="relative h-7 w-12 rounded-full bg-gray-300 transition peer-checked:bg-emerald-600 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
                    </label>
                  </div>

                  <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    System prompt
                  </label>
                  <textarea
                    value={aiDrafts[store.siteName]?.systemPrompt || ""}
                    onChange={(event) =>
                      updateAiDraft(store.siteName, { systemPrompt: event.target.value })
                    }
                    placeholder={defaultPromptPreview(store)}
                    className={`mt-2 min-h-24 w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500 ${
                      isDark
                        ? "border-[#2b2c2e] bg-black/30 text-white placeholder:text-gray-500"
                        : "border-emerald-100 bg-white text-gray-900 placeholder:text-gray-400"
                    }`}
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className={`text-xs ${mutedClasses}`}>
                      Leave empty to use the default prompt for {store.store?.name || store.siteName}.
                    </p>
                    <div className="flex items-center gap-2">
                      {savedAiSite === store.siteName && (
                        <span className="text-xs font-medium text-emerald-600">Saved</span>
                      )}
                      <button
                        type="button"
                        disabled={savingAiSite === store.siteName}
                        onClick={() => void saveAiAssistant(store)}
                        className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                      >
                        {savingAiSite === store.siteName ? "Saving..." : "Save AI"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
