import { Render } from "@puckeditor/core";
import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { storefrontApi } from "./api";
import { ProductCard } from "./components/ProductCard";
import { StorefrontAiAssistant } from "./components/StorefrontAiAssistant";
import { StorefrontSessionProvider, useStorefrontSession } from "./context/StorefrontSessionContext";
import { puckConfig } from "./puckConfig";
import type { Product, SiteAddress, SiteOrder, SitePage, SiteSettings } from "./types";

const defaultPageData = { content: [], root: { props: {} } };
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2";
const controlMotion = "transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
const primaryButton = `${controlMotion} ${focusRing} rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-700`;
const secondaryButton = `${controlMotion} ${focusRing} rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 hover:border-amber-400 hover:bg-amber-50`;
const iconButton = `${controlMotion} ${focusRing} rounded-lg border border-stone-300 bg-white text-stone-900 hover:border-amber-400 hover:bg-amber-50`;
const dangerButton = `${controlMotion} ${focusRing} rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50`;
const fieldClass = `${focusRing} rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400 transition hover:border-amber-300`;
const inlineLink = `${focusRing} rounded-md text-amber-700 transition hover:bg-amber-50 hover:text-amber-800`;
const signedOutRedirect = (siteName: string) => `/${siteName}/login`;
const reservedPageSlugs = new Set([
  "products",
  "cart",
  "wishlist",
  "checkout",
  "account",
  "login",
  "signup",
]);
const internalVariantKeys = new Set([
  "id",
  "price",
  "quantity",
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

const isDisplayValue = (value: unknown): value is string | number | boolean =>
  ["string", "number", "boolean"].includes(typeof value) && String(value).trim().length > 0;

const getProductAttributeNames = (product?: Product | null) =>
  (Array.isArray(product?.attributes) ? product.attributes : [])
    .map((attribute) => {
      if (typeof attribute === "string") return attribute;
      if (attribute && typeof attribute === "object" && "name" in attribute) {
        return String((attribute as { name?: unknown }).name || "");
      }
      return "";
    })
    .filter((name) => name.trim().length > 0);

const getVariantLabel = (variant: Record<string, unknown> | undefined, product?: Product | null, index = 0) => {
  if (!variant) return "Default";

  const attributeNames = getProductAttributeNames(product);
  const preferredValues = attributeNames
    .map((name) => variant[name])
    .filter(isDisplayValue)
    .map((value) => String(value));

  if (preferredValues.length > 0) return preferredValues.join(" / ");

  const nestedAttributes = variant.attributes;
  if (nestedAttributes && typeof nestedAttributes === "object" && !Array.isArray(nestedAttributes)) {
    const values = Object.values(nestedAttributes as Record<string, unknown>)
      .filter(isDisplayValue)
      .map((value) => String(value));

    if (values.length > 0) return values.join(" / ");
  }

  const fallbackValues = Object.entries(variant)
    .filter(([key, value]) => !internalVariantKeys.has(key) && isDisplayValue(value))
    .map(([, value]) => String(value));

  return fallbackValues.length > 0 ? fallbackValues.join(" / ") : `Option ${index + 1}`;
};

const getVariantStock = (variant: Record<string, unknown> | undefined) => Number(variant?.quantity ?? 0) || 0;

const normalizePageSlug = (slug?: string) =>
  String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");

const StorefrontNavbar = () => {
  const { siteName = "" } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [pages, setPages] = useState<SitePage[]>([]);
  const { cart, user, logout } = useStorefrontSession();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!siteName) {
        return;
      }

      try {
        const pageList = await storefrontApi.listPages(siteName);
        if (mounted) {
          setPages(pageList);
        }
      } catch {
        if (mounted) {
          setPages([]);
        }
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [siteName]);

  const navPages = useMemo(
    () =>
      pages
        .filter((page) => !page.isHomepage)
        .map((page) => ({ ...page, pageSlug: normalizePageSlug(page.pageSlug) }))
        .filter((page) => page.pageSlug && !reservedPageSlugs.has(page.pageSlug)),
    [pages],
  );

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const found = await storefrontApi.listProducts(siteName, { search: search.trim() });
      setResults(found.slice(0, 5));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, siteName]);

  return (
    <header className="sticky top-0 z-[80] border-b border-amber-200 bg-white/90 backdrop-blur">
      <div className="pointer-events-auto relative mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to={`/${siteName}`} className="font-black uppercase tracking-wide text-stone-900">
          {siteName}
        </Link>
        <nav className="flex items-center gap-3 text-sm text-stone-600">
          <Link to={`/${siteName}/products`} className={inlineLink}>Products</Link>
          {navPages.map((page) => (
            <Link key={page.id} to={`/${siteName}/${page.pageSlug}`} className={inlineLink}>
              {page.pageName}
            </Link>
          ))}
          <Link to={`/${siteName}/wishlist`} className={inlineLink}>Wishlist</Link>
          <Link to={`/${siteName}/cart`} className={inlineLink}>Cart ({cart.length})</Link>
          <Link to={`/${siteName}/account`} className={inlineLink}>Account</Link>
        </nav>

        <div className="relative ml-auto min-w-[220px] flex-1 sm:max-w-sm">
          <input
            className={`${fieldClass} h-10 w-full rounded-xl border-amber-200 text-sm`}
            placeholder="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {!!results.length && (
            <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-amber-200 bg-white p-2 shadow-lg">
              {results.map((product) => (
                <Link
                  key={product.id}
                  to={`/${siteName}/products/${product.id}`}
                  className="block rounded-lg px-2 py-1 text-sm hover:bg-amber-50"
                  onClick={() => setSearch("")}
                >
                  {product.name}
                </Link>
              ))}
              <Link
                to={`/${siteName}/products?search=${encodeURIComponent(search)}`}
                className="mt-1 block rounded-lg px-2 py-1 text-xs text-stone-500 hover:bg-amber-50"
                onClick={() => setSearch("")}
              >
                View all results
              </Link>
            </div>
          )}
        </div>

        {user ? (
          <button
            type="button"
            className={secondaryButton}
            onClick={() => {
              logout();
              navigate(`/${siteName}`, { replace: true });
            }}
          >
            Logout
          </button>
        ) : (
          <Link to={`/${siteName}/login`} className={secondaryButton}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

const DynamicPage = ({ slug }: { slug?: string }) => {
  const { siteName = "" } = useParams();
  const [page, setPage] = useState<SitePage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      try {
        const data = slug
          ? await storefrontApi.getPageBySlug(siteName, slug)
          : await storefrontApi.getHomepage(siteName);
        if (mounted) {
          setPage(data);
        }
      } catch {
        if (mounted) {
          setPage(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [siteName, slug]);

  if (loading) {
    return <main className="p-6">Loading page...</main>;
  }

  if (!page) {
    return <main className="p-6">Page not found.</main>;
  }

  return (
    <main>
      <Render config={puckConfig} data={page.puckData || defaultPageData} />
    </main>
  );
};

const ProductListPage = () => {
  const { siteName = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const { addToCart } = useStorefrontSession();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      const data = await storefrontApi.listProducts(siteName, {
        search,
        category,
        sort,
      });

      if (mounted) {
        setProducts(data);
        setLoading(false);
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [category, search, siteName, sort]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => String(product.category || "uncategorized")))),
    [products],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900">All products</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(event) => setSearchParams({ search: event.target.value, category, sort })}
          placeholder="Search products"
          className={`${fieldClass} h-10 min-w-[220px] text-sm`}
        />
        <select
          value={category}
          onChange={(event) => setSearchParams({ search, category: event.target.value, sort })}
          className={`${fieldClass} h-10 text-sm`}
        >
          <option value="">All categories</option>
          {categories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSearchParams({ search, category, sort: event.target.value })}
          className={`${fieldClass} h-10 text-sm`}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price low to high</option>
          <option value="price_desc">Price high to low</option>
          <option value="name">Name</option>
        </select>
        <button
          type="button"
          className={`${secondaryButton} h-10`}
          onClick={() => setView((current) => (current === "grid" ? "list" : "grid"))}
        >
          View: {view}
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-stone-500">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="mt-6 text-sm text-stone-500">No products found.</p>
      ) : (
        <div className={`mt-6 grid gap-4 ${view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={(productId) => void addToCart(productId)} />
          ))}
        </div>
      )}
    </main>
  );
};

const ProductDetailPage = () => {
  const { siteName = "", productId = "" } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [variantId, setVariantId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState<Product[]>([]);
  const { addToCart, toggleWishlist, wishlist } = useStorefrontSession();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const item = await storefrontApi.getProduct(siteName, productId);
      const list = await storefrontApi.listProducts(siteName, {
        category: String(item.category || ""),
      });

      if (mounted) {
        setProduct(item);
        setVariantId(item.variants?.find((variant) => getVariantStock(variant) > 0)?.id || item.variants?.[0]?.id);
        setRelated(list.filter((next) => next.id !== item.id).slice(0, 4));
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [productId, siteName]);

  const selectedVariant = product?.variants?.find((variant) => variant.id === variantId);
  const selectedVariantIndex = product?.variants?.findIndex((variant) => variant.id === variantId) ?? -1;
  const selectedVariantStock = selectedVariant ? getVariantStock(selectedVariant) : Number(product?.quantity ?? 0) || 0;
  const selectedVariantSoldOut = Boolean(selectedVariant && selectedVariantStock <= 0);

  useEffect(() => {
    if (!product?.variants?.length || !variantId) return;
    setQuantity((current) => Math.max(1, Math.min(current, Math.max(1, selectedVariantStock))));
  }, [product, selectedVariantStock, variantId]);

  if (!product) {
    return <main className="p-6">Loading product...</main>;
  }

  const displayPrice = Number(selectedVariant?.price ?? product.price ?? 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <img
          src={product.images?.[0] || "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=60"}
          alt={product.name || "Product"}
          className="aspect-[4/3] w-full rounded-2xl object-cover"
        />

        <section>
          <h1 className="text-3xl font-bold text-stone-900">{product.name}</h1>
          <p className="mt-2 text-stone-600">{product.description}</p>
          <p className="mt-4 text-2xl font-semibold text-amber-700">EGP {displayPrice.toFixed(2)}</p>

          {!!product.variants?.length && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-stone-500">Variant</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, index) => {
                  const soldOut = getVariantStock(variant) <= 0;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setVariantId(variant.id)}
                      className={`${controlMotion} ${focusRing} rounded-lg border px-3 py-1 text-sm ${
                        variant.id === variantId && soldOut
                          ? "border-red-300 bg-red-50 text-red-700 shadow-sm"
                          : variant.id === variantId
                            ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                            : soldOut
                            ? "border-stone-200 bg-stone-100 text-stone-500 hover:border-stone-300"
                            : "border-stone-300 bg-white text-stone-900 hover:border-amber-400 hover:bg-amber-50"
                      }`}
                    >
                      {getVariantLabel(variant, product, index)}
                      {soldOut && <span className="ml-2 text-xs font-semibold text-red-600">Sold out</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedVariant && (
            <p className={`mt-2 text-sm ${selectedVariantSoldOut ? "text-red-600" : "text-stone-500"}`}>
              {selectedVariantSoldOut
                ? `${getVariantLabel(selectedVariant, product, Math.max(0, selectedVariantIndex))} is sold out`
                : `${selectedVariantStock} available`}
            </p>
          )}

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              className={`${iconButton} h-10 w-10`}
              disabled={quantity <= 1}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              -
            </button>
            <div className="min-w-12 text-center text-sm">{quantity}</div>
            <button
              type="button"
              className={`${iconButton} h-10 w-10`}
              disabled={selectedVariant ? quantity >= selectedVariantStock : false}
              onClick={() => setQuantity((current) => current + 1)}
            >
              +
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className={primaryButton}
              disabled={selectedVariantSoldOut}
              onClick={() => void addToCart(product.id, variantId, quantity)}
            >
              {selectedVariantSoldOut ? "Sold out" : "Add to cart"}
            </button>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => void toggleWishlist(product.id)}
            >
              {wishlist.includes(product.id) ? "Remove wishlist" : "Add wishlist"}
            </button>
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-stone-900">Related products</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
};

const CartPage = () => {
  const { siteName = "" } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const { user, hydrateProductCart, updateCartQty, removeFromCart } = useStorefrontSession();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const list = await storefrontApi.listProducts(siteName);
      if (mounted) {
        setProducts(list);
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [siteName]);

  const items = hydrateProductCart(products);

  const subtotal = items.reduce((sum, item) => {
    const variant = item.product.variants?.find((current) => current.id === item.variantId);
    const price = Number(variant?.price ?? item.product.price ?? 0);
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 0 ? 75 : 0;
  const total = subtotal + shipping;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900">Cart</h1>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-stone-600">
          Cart is empty. <Link to={`/${siteName}/products`} className={inlineLink}>Continue shopping</Link>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {items.map(({ product, variantId, quantity }) => {
              const variantIndex = product.variants?.findIndex((variant) => variant.id === variantId) ?? -1;
              const variant = product.variants?.find((current) => current.id === variantId);
              const variantStock = variant ? getVariantStock(variant) : Number(product.quantity ?? 0) || 0;

              return (
                <article key={`${product.id}-${variantId || ""}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
                  <img
                    src={product.images?.[0] || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=60"}
                    alt={product.name || "Product"}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="min-w-[160px] flex-1">
                    <h3 className="font-semibold text-stone-900">{product.name}</h3>
                    <p className="text-sm text-stone-500">
                      Variant: {variant ? getVariantLabel(variant, product, Math.max(0, variantIndex)) : "Default"}
                      {variant && variantStock <= 0 && <span className="ml-2 font-semibold text-red-600">Sold out</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`${iconButton} h-8 w-8`}
                      onClick={() => void updateCartQty(product.id, variantId, quantity - 1)}
                    >
                      -
                    </button>
                    <span className="text-sm">{quantity}</span>
                    <button
                      type="button"
                      className={`${iconButton} h-8 w-8`}
                      disabled={variant ? quantity >= variantStock : false}
                      onClick={() => void updateCartQty(product.id, variantId, quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void removeFromCart(product.id, variantId);
                    }}
                  >
                    Remove
                  </button>
                </article>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-600">Subtotal: EGP {subtotal.toFixed(2)}</p>
            <p className="text-sm text-stone-600">Shipping: EGP {shipping.toFixed(2)}</p>
            <p className="mt-1 text-lg font-semibold text-stone-900">Total: EGP {total.toFixed(2)}</p>
            <Link to={user ? `/${siteName}/checkout` : `/${siteName}/login`} className={`mt-4 inline-block ${primaryButton}`}>
              Proceed to checkout
            </Link>
          </div>
        </>
      )}
    </main>
  );
};

const WishlistPage = () => {
  const { siteName = "" } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const { user, wishlist, toggleWishlist, addToCart } = useStorefrontSession();

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const list = await storefrontApi.listProducts(siteName);
      if (mounted) {
        setProducts(list);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [siteName]);

  if (!user) {
    return <Navigate to={signedOutRedirect(siteName)} replace />;
  }

  const wishlistProducts = products.filter((product) => wishlist.includes(product.id));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900">Wishlist</h1>
      {wishlistProducts.length === 0 ? (
        <p className="mt-4 text-stone-500">No saved products yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wishlistProducts.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} onAddToCart={(productId) => void addToCart(productId)} />
              <button
                className={`mt-2 ${dangerButton}`}
                type="button"
                onClick={() => void toggleWishlist(product.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

const CheckoutPage = () => {
  const { siteName = "" } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [city, setCity] = useState("Cairo");
  const [area, setArea] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [notes, setNotes] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const { user, cart, hydrateProductCart, updateCartQty } = useStorefrontSession();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const list = await storefrontApi.listProducts(siteName);
      if (mounted) {
        setProducts(list);
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [siteName]);

  useEffect(() => {
    if (user?.name) {
      setCustomerName(user.name);
    }
  }, [user]);

  if (!user) {
    return <Navigate to={signedOutRedirect(siteName)} replace />;
  }

  const items = hydrateProductCart(products);
  const subtotal = items.reduce((sum, item) => {
    const variant = item.product.variants?.find((current) => current.id === item.variantId);
    return sum + Number(variant?.price ?? item.product.price ?? 0) * item.quantity;
  }, 0);

  const shippingFee = subtotal > 0 ? 75 : 0;
  const total = subtotal + shippingFee;

  const placeOrder = async () => {
    if (placingOrder) {
      return;
    }

    setPlacingOrder(true);
    try {
      const order = await storefrontApi.createOrder(siteName, {
        customerEmail: user.email,
        customerName,
        customerPhone,
        shippingAddress: {
          id: `addr-${Date.now()}`,
          label: "Home",
          fullName: customerName,
          phone: customerPhone,
          city,
          area,
          street,
          building,
          floor: "",
          notes,
          isDefault: true,
        },
        items: items.map((item) => {
          const variant = item.product.variants?.find((current) => current.id === item.variantId);
          const variantIndex = item.product.variants?.findIndex((current) => current.id === item.variantId) ?? -1;
          return {
            productId: item.product.id,
            productName: item.product.name || "Product",
            variantId: item.variantId,
            variantName: variant ? getVariantLabel(variant, item.product, Math.max(0, variantIndex)) : "Default",
            quantity: item.quantity,
            price: Number(variant?.price ?? item.product.price ?? 0),
          };
        }),
        subtotal,
        shippingFee,
        total,
        notes,
      });

      await Promise.all(cart.map((item) => updateCartQty(item.productId, item.variantId, 0)));
      navigate(`/${siteName}/checkout/confirmation/${order.orderId}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900">Checkout</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-stone-900">Shipping details</h2>
          <div className="mt-4 space-y-3">
            <input className={`${fieldClass} h-10 w-full`} value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Full name" />
            <input className={`${fieldClass} h-10 w-full`} value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Phone" />
            <input className={`${fieldClass} h-10 w-full`} value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" />
            <input className={`${fieldClass} h-10 w-full`} value={area} onChange={(event) => setArea(event.target.value)} placeholder="Area" />
            <input className={`${fieldClass} h-10 w-full`} value={street} onChange={(event) => setStreet(event.target.value)} placeholder="Street" />
            <input className={`${fieldClass} h-10 w-full`} value={building} onChange={(event) => setBuilding(event.target.value)} placeholder="Building" />
            <textarea className={`${fieldClass} min-h-20 w-full py-2`} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes" />
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-stone-900">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm text-stone-600">
            {items.map((item) => {
              const variant = item.product.variants?.find((current) => current.id === item.variantId);
              const variantIndex = item.product.variants?.findIndex((current) => current.id === item.variantId) ?? -1;
              const unitPrice = Number(variant?.price ?? item.product.price ?? 0);

              return (
                <li key={`${item.product.id}-${item.variantId || ""}`} className="flex justify-between gap-3">
                  <span>
                    {item.product.name}
                    {variant && (
                      <span className="block text-xs text-stone-500">
                        {getVariantLabel(variant, item.product, Math.max(0, variantIndex))}
                      </span>
                    )}
                    <span className="block text-xs text-stone-500">Qty {item.quantity}</span>
                  </span>
                  <span>
                    EGP {(unitPrice * item.quantity).toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 border-t border-stone-200 pt-3 text-sm text-stone-700">
            <p>Subtotal: EGP {subtotal.toFixed(2)}</p>
            <p>Shipping: EGP {shippingFee.toFixed(2)}</p>
            <p className="mt-1 text-base font-semibold">Total: EGP {total.toFixed(2)}</p>
          </div>
          <button
            type="button"
            className={`mt-4 w-full ${primaryButton}`}
            disabled={placingOrder || !items.length}
            onClick={() => void placeOrder()}
          >
            {placingOrder ? "Placing order..." : "Place COD order"}
          </button>
        </section>
      </div>
    </main>
  );
};

const OrderConfirmationPage = () => {
  const { siteName = "", orderId = "" } = useParams();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-stone-900">Order placed</h1>
      <p className="mt-2 text-stone-600">Your order number is {orderId}</p>
      <Link to={`/${siteName}/products`} className={`mt-6 inline-block ${primaryButton}`}>
        Continue shopping
      </Link>
    </main>
  );
};

const LoginPage = () => {
  const { siteName = "" } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useStorefrontSession();

  const submit = async () => {
    if (submitting) {
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(`/${siteName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-900">Login</h1>
      <div className="mt-5 space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
        <input className={`${fieldClass} h-10 w-full`} placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className={`${fieldClass} h-10 w-full`} placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          className={`w-full ${primaryButton}`}
          disabled={submitting}
          onClick={() => void submit()}
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
        <p className="text-sm text-stone-600">
          No account? <Link to={`/${siteName}/signup`} className={inlineLink}>Sign up</Link>
        </p>
      </div>
    </main>
  );
};

const SignupPage = () => {
  const { siteName = "" } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useStorefrontSession();

  const submit = async () => {
    if (submitting) {
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await signup(email, name, password);
      navigate(`/${siteName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to signup");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-900">Create account</h1>
      <div className="mt-5 space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
        <input className={`${fieldClass} h-10 w-full`} placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <input className={`${fieldClass} h-10 w-full`} placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className={`${fieldClass} h-10 w-full`} placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          className={`w-full ${primaryButton}`}
          disabled={submitting}
          onClick={() => void submit()}
        >
          {submitting ? "Creating account..." : "Sign up"}
        </button>
      </div>
    </main>
  );
};

const OrderHistoryPage = () => {
  const { siteName = "" } = useParams();
  const { user } = useStorefrontSession();
  const [orders, setOrders] = useState<SiteOrder[]>([]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!user) {
        return;
      }

      const data = await storefrontApi.listOrders(siteName, user.email);
      if (mounted) {
        setOrders(data);
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [siteName, user]);

  if (!user) {
    return <Navigate to={signedOutRedirect(siteName)} replace />;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900">Order history</h1>
      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>#{order.orderId}</strong>
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs uppercase text-amber-800">{order.status}</span>
            </div>
            <p className="mt-1 text-sm text-stone-600">Total: EGP {Number(order.total || 0).toFixed(2)}</p>
          </article>
        ))}
      </div>
    </main>
  );
};

const AccountPage = () => {
  const { siteName = "" } = useParams();
  const { user, saveAddresses } = useStorefrontSession();
  const [savingAddress, setSavingAddress] = useState(false);
  const [address, setAddress] = useState<SiteAddress>({
    id: `addr-${Date.now()}`,
    label: "Home",
    fullName: "",
    phone: "",
    city: "",
    area: "",
    street: "",
    building: "",
    floor: "",
    notes: "",
    isDefault: true,
  });

  if (!user) {
    return <Navigate to={signedOutRedirect(siteName)} replace />;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900">Account</h1>
      <p className="mt-2 text-stone-600">{user.name} - {user.email}</p>

      <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-900">Saved addresses</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input className={`${fieldClass} h-10`} value={address.fullName} placeholder="Full name" onChange={(event) => setAddress({ ...address, fullName: event.target.value })} />
          <input className={`${fieldClass} h-10`} value={address.phone} placeholder="Phone" onChange={(event) => setAddress({ ...address, phone: event.target.value })} />
          <input className={`${fieldClass} h-10`} value={address.city} placeholder="City" onChange={(event) => setAddress({ ...address, city: event.target.value })} />
          <input className={`${fieldClass} h-10`} value={address.area} placeholder="Area" onChange={(event) => setAddress({ ...address, area: event.target.value })} />
          <input className={`${fieldClass} h-10`} value={address.street} placeholder="Street" onChange={(event) => setAddress({ ...address, street: event.target.value })} />
          <input className={`${fieldClass} h-10`} value={address.building} placeholder="Building" onChange={(event) => setAddress({ ...address, building: event.target.value })} />
        </div>
        <button
          type="button"
          className={`mt-4 ${primaryButton}`}
          disabled={savingAddress}
          onClick={async () => {
            setSavingAddress(true);
            try {
              await saveAddresses([address]);
            } finally {
              setSavingAddress(false);
            }
          }}
        >
          {savingAddress ? "Saving..." : "Save address"}
        </button>
      </section>

      <Link to={`/${siteName}/account/orders`} className={`mt-4 inline-block text-sm ${inlineLink}`}>
        View order history
      </Link>
    </main>
  );
};

const StorefrontShell = () => {
  return (
    <>
      <StorefrontNavbar />
      <Routes>
        <Route index element={<DynamicPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="checkout/confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="account/orders" element={<OrderHistoryPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="*" element={<PageBySlug />} />
      </Routes>
    </>
  );
};

const PageBySlug = () => {
  const { "*": pageSlug = "" } = useParams();
  return <DynamicPage slug={pageSlug} />;
};

export const StorefrontRouter = () => {
  const { siteName = "" } = useParams();
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const settings = await storefrontApi.getSiteSettings(siteName);
        if (mounted) {
          setSiteSettings(settings);
        }
      } catch {
        if (mounted) {
          setSiteSettings(null);
        }
      }
    };

    if (siteName) {
      void run();
    }

    return () => {
      mounted = false;
    };
  }, [siteName]);

  if (!siteName) {
    return <div className="p-6">Missing site</div>;
  }

  const storeName = siteSettings?.store?.name || siteName;

  return (
    <StorefrontSessionProvider siteName={siteName}>
      <div className="min-h-screen bg-stone-50 text-stone-900">
        <StorefrontShell />
        <StorefrontAiAssistant
          siteName={siteName}
          storeName={storeName}
          settings={siteSettings?.store?.aiAssistant}
        />
      </div>
    </StorefrontSessionProvider>
  );
};

