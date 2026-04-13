import { Link, useParams } from "react-router-dom";
import type { Product } from "../types";

export const ProductCard = ({
  product,
  showPrice = true,
  onAddToCart,
}: {
  product: Product;
  showPrice?: boolean;
  onAddToCart?: (productId: string) => void;
}) => {
  const { siteName = "" } = useParams();

  return (
    <article className="group rounded-2xl border border-amber-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/${siteName}/products/${product.id}`} className="block">
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
          className="mt-3 w-full rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700"
          onClick={() => onAddToCart(product.id)}
          type="button"
        >
          Add to cart
        </button>
      )}
    </article>
  );
};
