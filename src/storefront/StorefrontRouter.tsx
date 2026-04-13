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
import { StorefrontSessionProvider, useStorefrontSession } from "./context/StorefrontSessionContext";
import { puckConfig } from "./puckConfig";
import type { Product, SiteAddress, SiteOrder, SitePage } from "./types";

const defaultPageData = { content: [], root: { props: {} } };

const StorefrontNavbar = () => {
  const { siteName = "" } = useParams();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const { cart, user, logout } = useStorefrontSession();

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
    <header className="sticky top-0 z-30 border-b border-amber-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to={`/${siteName}`} className="font-black uppercase tracking-wide text-stone-900">
          {siteName}
        </Link>
        <nav className="flex items-center gap-3 text-sm text-stone-600">
          <Link to={`/${siteName}/products`}>Products</Link>
          <Link to={`/${siteName}/wishlist`}>Wishlist</Link>
          <Link to={`/${siteName}/cart`}>Cart ({cart.length})</Link>
          <Link to={`/${siteName}/account`}>Account</Link>
        </nav>

        <div className="relative ml-auto min-w-[220px] flex-1 sm:max-w-sm">
          <input
            className="h-10 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400"
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
          <button type="button" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900" onClick={logout}>
            Logout
          </button>
        ) : (
          <Link to={`/${siteName}/login`} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900">
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
          className="h-10 min-w-[220px] rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400"
        />
        <select
          value={category}
          onChange={(event) => setSearchParams({ search, category: event.target.value, sort })}
          className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900"
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
          className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price low to high</option>
          <option value="price_desc">Price high to low</option>
          <option value="name">Name</option>
        </select>
        <button
          type="button"
          className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900"
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
        setVariantId(item.variants?.[0]?.id);
        setRelated(list.filter((next) => next.id !== item.id).slice(0, 4));
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [productId, siteName]);

  if (!product) {
    return <main className="p-6">Loading product...</main>;
  }

  const selectedVariant = product.variants?.find((variant) => variant.id === variantId);
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
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setVariantId(variant.id)}
                    className={`rounded-lg border px-3 py-1 text-sm ${variant.id === variantId ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-900"}`}
                  >
                    {variant.name || variant.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              className="h-10 w-10 rounded-lg border border-stone-300 bg-white text-stone-900"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              -
            </button>
            <div className="min-w-12 text-center text-sm">{quantity}</div>
            <button
              type="button"
              className="h-10 w-10 rounded-lg border border-stone-300 bg-white text-stone-900"
              onClick={() => setQuantity((current) => current + 1)}
            >
              +
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => void addToCart(product.id, variantId, quantity)}
            >
              Add to cart
            </button>
            <button
              type="button"
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900"
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
  const { hydrateProductCart, updateCartQty, removeFromCart } = useStorefrontSession();

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
          Cart is empty. <Link to={`/${siteName}/products`}>Continue shopping</Link>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {items.map(({ product, variantId, quantity }) => (
              <article key={`${product.id}-${variantId || ""}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
                <img
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=60"}
                  alt={product.name || "Product"}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div className="min-w-[160px] flex-1">
                  <h3 className="font-semibold text-stone-900">{product.name}</h3>
                  <p className="text-sm text-stone-500">Variant: {variantId || "Default"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="h-8 w-8 rounded border bg-white text-stone-900" onClick={() => void updateCartQty(product.id, variantId, quantity - 1)}>
                    -
                  </button>
                  <span className="text-sm">{quantity}</span>
                  <button type="button" className="h-8 w-8 rounded border bg-white text-stone-900" onClick={() => void updateCartQty(product.id, variantId, quantity + 1)}>
                    +
                  </button>
                </div>
                <button type="button" className="text-sm text-red-600" onClick={() => void removeFromCart(product.id, variantId)}>
                  Remove
                </button>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-600">Subtotal: EGP {subtotal.toFixed(2)}</p>
            <p className="text-sm text-stone-600">Shipping: EGP {shipping.toFixed(2)}</p>
            <p className="mt-1 text-lg font-semibold text-stone-900">Total: EGP {total.toFixed(2)}</p>
            <Link to={`/${siteName}/checkout`} className="mt-4 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
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
    return <Navigate to={`/${siteName}/login`} replace />;
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
                className="mt-2 text-sm text-red-600"
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
    return <Navigate to={`/${siteName}/login`} replace />;
  }

  const items = hydrateProductCart(products);
  const subtotal = items.reduce((sum, item) => {
    const variant = item.product.variants?.find((current) => current.id === item.variantId);
    return sum + Number(variant?.price ?? item.product.price ?? 0) * item.quantity;
  }, 0);

  const shippingFee = subtotal > 0 ? 75 : 0;
  const total = subtotal + shippingFee;

  const placeOrder = async () => {
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
        return {
          productId: item.product.id,
          productName: item.product.name || "Product",
          variantId: item.variantId,
          variantName: variant?.name || item.variantId || "Default",
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
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900">Checkout</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-stone-900">Shipping details</h2>
          <div className="mt-4 space-y-3">
            <input className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Full name" />
            <input className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Phone" />
            <input className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" />
            <input className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" value={area} onChange={(event) => setArea(event.target.value)} placeholder="Area" />
            <input className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" value={street} onChange={(event) => setStreet(event.target.value)} placeholder="Street" />
            <input className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" value={building} onChange={(event) => setBuilding(event.target.value)} placeholder="Building" />
            <textarea className="min-h-20 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes" />
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-stone-900">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm text-stone-600">
            {items.map((item) => (
              <li key={`${item.product.id}-${item.variantId || ""}`} className="flex justify-between">
                <span>{item.product.name} x{item.quantity}</span>
                <span>
                  EGP {(Number(item.product.price || 0) * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-stone-200 pt-3 text-sm text-stone-700">
            <p>Subtotal: EGP {subtotal.toFixed(2)}</p>
            <p>Shipping: EGP {shippingFee.toFixed(2)}</p>
            <p className="mt-1 text-base font-semibold">Total: EGP {total.toFixed(2)}</p>
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => void placeOrder()}
          >
            Place COD order
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
      <Link to={`/${siteName}/products`} className="mt-6 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
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
  const { login } = useStorefrontSession();

  const submit = async () => {
    setError("");
    try {
      await login(email, password);
      navigate(`/${siteName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-900">Login</h1>
      <div className="mt-5 space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
        <input className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="button" className="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white" onClick={() => void submit()}>
          Login
        </button>
        <p className="text-sm text-stone-600">
          No account? <Link to={`/${siteName}/signup`}>Sign up</Link>
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
  const { signup } = useStorefrontSession();

  const submit = async () => {
    setError("");
    try {
      await signup(email, name, password);
      navigate(`/${siteName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to signup");
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-900">Create account</h1>
      <div className="mt-5 space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
        <input className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <input className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="button" className="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white" onClick={() => void submit()}>
          Sign up
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
    return <Navigate to={`/${siteName}/login`} replace />;
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
    return <Navigate to={`/${siteName}/login`} replace />;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900">Account</h1>
      <p className="mt-2 text-stone-600">{user.name} - {user.email}</p>

      <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-900">Saved addresses</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" value={address.fullName} placeholder="Full name" onChange={(event) => setAddress({ ...address, fullName: event.target.value })} />
          <input className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" value={address.phone} placeholder="Phone" onChange={(event) => setAddress({ ...address, phone: event.target.value })} />
          <input className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" value={address.city} placeholder="City" onChange={(event) => setAddress({ ...address, city: event.target.value })} />
          <input className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" value={address.area} placeholder="Area" onChange={(event) => setAddress({ ...address, area: event.target.value })} />
          <input className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" value={address.street} placeholder="Street" onChange={(event) => setAddress({ ...address, street: event.target.value })} />
          <input className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 placeholder:text-stone-400" value={address.building} placeholder="Building" onChange={(event) => setAddress({ ...address, building: event.target.value })} />
        </div>
        <button
          type="button"
          className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => void saveAddresses([address])}
        >
          Save address
        </button>
      </section>

      <Link to={`/${siteName}/account/orders`} className="mt-4 inline-block text-sm text-amber-700">
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
        <Route path=":pageSlug" element={<PageBySlug />} />
      </Routes>
    </>
  );
};

const PageBySlug = () => {
  const { pageSlug = "" } = useParams();
  return <DynamicPage slug={pageSlug} />;
};

export const StorefrontRouter = () => {
  const { siteName = "" } = useParams();

  if (!siteName) {
    return <div className="p-6">Missing site</div>;
  }

  return (
    <StorefrontSessionProvider siteName={siteName}>
      <div className="min-h-screen bg-stone-50 text-stone-900">
        <StorefrontShell />
      </div>
    </StorefrontSessionProvider>
  );
};

