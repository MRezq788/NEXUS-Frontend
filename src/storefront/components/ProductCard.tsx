import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Product } from "../types";

export const ProductCard = ({
  product,
  showPrice = true,
  onAddToCart,
}: {
  product: Product;
  showPrice?: boolean;
  onAddToCart?: (productId: string) => void | Promise<void>;
}) => {
  const { siteName = "" } = useParams();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const addProduct = async () => {
    if (!onAddToCart || adding) {
      return;
    }

    setAdding(true);
    setAdded(false);
    try {
      await onAddToCart(product.id);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1200);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="group rounded-2xl border border-amber-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/${siteName}/products/${product.id}`} className="block rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-amber-50">
          <img
            src={product.images?.[0] || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=60"}
            alt={product.name || "Product"}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-stone-900">{product.name || "Untitled product"}</h3>
      </Link>

      {showPrice && <p className="mt-1 text-sm text-amber-700">EGP {Number(product.price || 0).toFixed(2)}</p>}

      {onAddToCart && (
        <button
          className="mt-3 w-full rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-stone-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          disabled={adding}
          onClick={() => void addProduct()}
          type="button"
        >
          {adding ? "Adding..." : added ? "Added" : "Add to cart"}
        </button>
      )}
    </article>
  );
};
