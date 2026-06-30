import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { storefrontAuth } from "../../config/firbase";
import { storefrontApi } from "../api";
import type { Product, SiteAddress, SiteUser } from "../types";

interface StorefrontSessionContextValue {
  user: SiteUser | null;
  cart: Array<{ productId: string; variantId?: string; quantity: number }>;
  wishlist: string[];
  loadingUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateCartQty: (productId: string, variantId: string | undefined, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  saveAddresses: (addresses: SiteAddress[]) => Promise<void>;
  hydrateProductCart: (products: Product[]) => Array<{ product: Product; variantId?: string; quantity: number }>;
}

const StorefrontSessionContext = createContext<StorefrontSessionContextValue | null>(null);

const guestCartKey = (siteName: string) => `nexus_guest_cart_${siteName}`;
const guestWishlistKey = (siteName: string) => `nexus_guest_wishlist_${siteName}`;
const sessionKey = (siteName: string) => `nexus_session_${siteName}`;
const loggedOutKey = (siteName: string) => `nexus_storefront_logged_out_${siteName}`;
const toCartKey = (item: { productId: string; variantId?: string; quantity: number }) =>
  `${item.productId}::${item.variantId || ""}`;

const areCartListsEqual = (
  left: Array<{ productId: string; variantId?: string; quantity: number }>,
  right: Array<{ productId: string; variantId?: string; quantity: number }>,
) => {
  if (left.length !== right.length) {
    return false;
  }

  const leftMap = new Map(left.map((item) => [toCartKey(item), Number(item.quantity) || 0]));
  const rightMap = new Map(right.map((item) => [toCartKey(item), Number(item.quantity) || 0]));

  if (leftMap.size !== rightMap.size) {
    return false;
  }

  for (const [key, quantity] of leftMap.entries()) {
    if ((rightMap.get(key) || 0) !== quantity) {
      return false;
    }
  }

  return true;
};

const areWishlistEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  if (leftSet.size !== rightSet.size) {
    return false;
  }
  for (const item of leftSet.values()) {
    if (!rightSet.has(item)) {
      return false;
    }
  }
  return true;
};

export const StorefrontSessionProvider = ({
  siteName,
  children,
}: {
  siteName: string;
  children: ReactNode;
}) => {
  const [user, setUser] = useState<SiteUser | null>(null);
  const [cart, setCart] = useState<Array<{ productId: string; variantId?: string; quantity: number }>>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const cartRef = useRef(cart);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const persistGuestState = useCallback(
    (
      nextCart: Array<{ productId: string; variantId?: string; quantity: number }>,
      nextWishlist: string[],
    ) => {
      localStorage.setItem(guestCartKey(siteName), JSON.stringify(nextCart));
      localStorage.setItem(guestWishlistKey(siteName), JSON.stringify(nextWishlist));
    },
    [siteName],
  );

  const syncRemote = useCallback(
    async (
      userEmail: string,
      nextCart: Array<{ productId: string; variantId?: string; quantity: number }>,
      nextWishlist: string[],
    ) => {
      await Promise.all([
        storefrontApi.updateCart(
          siteName,
          userEmail,
          nextCart.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            addedAt: new Date().toISOString(),
          })),
        ),
        storefrontApi.updateWishlist(siteName, userEmail, nextWishlist),
      ]);
    },
    [siteName],
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      setLoadingUser(true);

      const storedSession = localStorage.getItem(sessionKey(siteName));
      const storedGuestCart = JSON.parse(localStorage.getItem(guestCartKey(siteName)) || "[]") as Array<{
        productId: string;
        variantId?: string;
        quantity: number;
      }>;
      const storedGuestWishlist = JSON.parse(
        localStorage.getItem(guestWishlistKey(siteName)) || "[]",
      ) as string[];

      if (!storedSession) {
        if (mounted) {
          setUser(null);
          setCart(storedGuestCart);
          setWishlist(storedGuestWishlist);
          setLoadingUser(false);
        }
        return;
      }

      const session = JSON.parse(storedSession) as { email: string };

      try {
        const remoteUser = await storefrontApi.getUser(siteName, session.email);

        if (!mounted) {
          return;
        }

        const mergedCartMap = new Map<string, { productId: string; variantId?: string; quantity: number }>();

        for (const item of [...(remoteUser.cart?.items || []), ...storedGuestCart]) {
          const key = `${item.productId}::${item.variantId || ""}`;
          const existing = mergedCartMap.get(key);
          mergedCartMap.set(key, {
            productId: item.productId,
            variantId: item.variantId,
            quantity: Math.max(1, (existing?.quantity || 0) + Number(item.quantity || 1)),
          });
        }

        const mergedCart = Array.from(mergedCartMap.values());
        const mergedWishlist = Array.from(new Set([...(remoteUser.wishlist || []), ...storedGuestWishlist]));

        setUser(remoteUser);
        setCart(mergedCart);
        setWishlist(mergedWishlist);
        localStorage.removeItem(guestCartKey(siteName));
        localStorage.removeItem(guestWishlistKey(siteName));

        const remoteCart = (remoteUser.cart?.items || []).map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: Math.max(1, Number(item.quantity || 1)),
        }));
        const remoteWishlist = remoteUser.wishlist || [];
        const needsRemoteSync =
          storedGuestCart.length > 0 ||
          storedGuestWishlist.length > 0 ||
          !areCartListsEqual(remoteCart, mergedCart) ||
          !areWishlistEqual(remoteWishlist, mergedWishlist);

        if (needsRemoteSync) {
          await syncRemote(session.email, mergedCart, mergedWishlist);
        }
      } catch {
        if (!mounted) {
          return;
        }

        localStorage.removeItem(sessionKey(siteName));
        setUser(null);
        setCart(storedGuestCart);
        setWishlist(storedGuestWishlist);
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [siteName, syncRemote]);

  useEffect(() => {
    const clearCachedSessionIfLoggedOut = () => {
      if (localStorage.getItem(sessionKey(siteName))) {
        return;
      }

      const storedGuestCart = JSON.parse(localStorage.getItem(guestCartKey(siteName)) || "[]") as Array<{
        productId: string;
        variantId?: string;
        quantity: number;
      }>;
      const storedGuestWishlist = JSON.parse(localStorage.getItem(guestWishlistKey(siteName)) || "[]") as string[];

      setUser(null);
      setCart(storedGuestCart);
      setWishlist(storedGuestWishlist);
    };

    window.addEventListener("pageshow", clearCachedSessionIfLoggedOut);
    window.addEventListener("focus", clearCachedSessionIfLoggedOut);

    return () => {
      window.removeEventListener("pageshow", clearCachedSessionIfLoggedOut);
      window.removeEventListener("focus", clearCachedSessionIfLoggedOut);
    };
  }, [siteName]);

  const login = useCallback(
    async (email: string, password: string) => {
      const credential = await signInWithEmailAndPassword(storefrontAuth, email.trim(), password);
      const idToken = await credential.user.getIdToken();
      const loggedInUser = await storefrontApi.login(siteName, idToken);
      setUser(loggedInUser);
      localStorage.setItem(sessionKey(siteName), JSON.stringify({ email: loggedInUser.email }));
      sessionStorage.removeItem(loggedOutKey(siteName));
    },
    [siteName],
  );

  const signup = useCallback(
    async (email: string, name: string, password: string) => {
      const credential = await createUserWithEmailAndPassword(storefrontAuth, email.trim(), password);

      if (name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }

      const idToken = await credential.user.getIdToken(true);
      const created = await storefrontApi.signup(siteName, idToken, name.trim());
      setUser(created);
      localStorage.setItem(sessionKey(siteName), JSON.stringify({ email: created.email }));
      sessionStorage.removeItem(loggedOutKey(siteName));
    },
    [siteName],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(sessionKey(siteName));
    sessionStorage.setItem(loggedOutKey(siteName), "1");
    setUser(null);
    setCart([]);
    setWishlist([]);
    void signOut(storefrontAuth).catch((error) => {
      console.warn("Firebase sign out failed after clearing storefront session:", error);
    });
  }, [siteName]);

  const addToCart = useCallback(
    async (productId: string, variantId?: string, quantity = 1) => {
      const key = `${productId}::${variantId || ""}`;
      const next = [...cart];
      const index = next.findIndex((item) => `${item.productId}::${item.variantId || ""}` === key);

      if (index >= 0) {
        next[index] = {
          ...next[index],
          quantity: next[index].quantity + quantity,
        };
      } else {
        next.push({ productId, variantId, quantity });
      }

      setCart(next);
      if (!user) {
        persistGuestState(next, wishlist);
        return;
      }
      await storefrontApi.updateCart(
        siteName,
        user.email,
        next.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          addedAt: new Date().toISOString(),
        })),
      );
    },
    [cart, persistGuestState, siteName, user, wishlist],
  );

  const updateCartQty = useCallback(
    async (productId: string, variantId: string | undefined, quantity: number) => {
      const next = cart
        .map((item) => {
          const same = item.productId === productId && (item.variantId || "") === (variantId || "");
          if (!same) {
            return item;
          }

          return {
            ...item,
            quantity,
          };
        })
        .filter((item) => item.quantity > 0);

      setCart(next);
      if (!user) {
        persistGuestState(next, wishlist);
        return;
      }
      await storefrontApi.updateCart(
        siteName,
        user.email,
        next.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          addedAt: new Date().toISOString(),
        })),
      );
    },
    [cart, persistGuestState, siteName, user, wishlist],
  );

  const removeFromCart = useCallback(
    async (productId: string, variantId?: string) => {
      const next = cartRef.current.filter(
        (item) => !(item.productId === productId && (item.variantId || "") === (variantId || "")),
      );

      cartRef.current = next;
      setCart(next);
      if (!user) {
        persistGuestState(next, wishlist);
        return;
      }
      await storefrontApi.updateCart(
        siteName,
        user.email,
        next.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          addedAt: new Date().toISOString(),
        })),
      );
    },
    [persistGuestState, siteName, user, wishlist],
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const next = wishlist.includes(productId)
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId];

      setWishlist(next);
      if (!user) {
        persistGuestState(cart, next);
        return;
      }
      await storefrontApi.updateWishlist(siteName, user.email, next);
    },
    [cart, persistGuestState, siteName, user, wishlist],
  );

  const saveAddresses = useCallback(
    async (addresses: SiteAddress[]) => {
      if (!user) {
        throw new Error("Please login first");
      }

      await storefrontApi.updateAddresses(
        siteName,
        user.email,
        addresses as unknown as Array<Record<string, unknown>>,
      );
      setUser({ ...user, savedAddresses: addresses });
    },
    [siteName, user],
  );

  const hydrateProductCart = useCallback(
    (products: Product[]) =>
      cart
        .map((item) => ({
          ...item,
          product: products.find((product) => product.id === item.productId),
        }))
        .filter((item): item is { product: Product; productId: string; variantId?: string; quantity: number } =>
          Boolean(item.product),
        )
        .map(({ product, variantId, quantity }) => ({ product, variantId, quantity })),
    [cart],
  );

  const value = useMemo(
    () => ({
      user,
      cart,
      wishlist,
      loadingUser,
      login,
      signup,
      logout,
      addToCart,
      updateCartQty,
      removeFromCart,
      toggleWishlist,
      saveAddresses,
      hydrateProductCart,
    }),
    [
      addToCart,
      cart,
      hydrateProductCart,
      loadingUser,
      login,
      logout,
      removeFromCart,
      saveAddresses,
      signup,
      toggleWishlist,
      updateCartQty,
      user,
      wishlist,
    ],
  );

  return <StorefrontSessionContext.Provider value={value}>{children}</StorefrontSessionContext.Provider>;
};

export const useStorefrontSession = () => {
  const context = useContext(StorefrontSessionContext);

  if (!context) {
    throw new Error("useStorefrontSession must be used within StorefrontSessionProvider");
  }

  return context;
};
