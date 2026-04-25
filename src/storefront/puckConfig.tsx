import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Config } from "@puckeditor/core";
import { storefrontApi } from "./api";
import { ProductCard } from "./components/ProductCard";
import type { Product } from "./types";

const useSiteProducts = (category?: string, maxItems?: number) => {
  const { siteName = "" } = useParams();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!siteName) {
        return;
      }

      const data = await storefrontApi.listProducts(siteName, {
        category: category || undefined,
      });

      if (!mounted) {
        return;
      }

      setProducts(
        typeof maxItems === "number" ? data.slice(0, maxItems) : data,
      );
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [category, maxItems, siteName]);

  return products;
};

const NavbarBlock = ({
  logo,
  links,
  bgColor,
  textColor,
  sticky,
}: Record<string, unknown>) => {
  const { siteName = "" } = useParams();
  const parsedLinks = String(links || "Home:/|Products:/products").split("|");

  return (
    <header
      className={`${sticky ? "sticky top-0 z-40" : ""} border-b border-black/5`}
      style={{
        backgroundColor: String(bgColor || "#ffffff"),
        color: String(textColor || "#1a1a1a"),
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <strong>{String(logo || "Nexus Store")}</strong>
        <nav className="flex items-center gap-5 text-sm">
          {parsedLinks.map((entry) => {
            const [label, href] = entry.split(":");
            const path = href?.startsWith("/") ? href : `/${href || ""}`;

            return (
              <Link key={`${label}-${href}`} to={`/${siteName}${path}`}>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

const HeroBlock = ({
  heading,
  subtext,
  ctaText,
  ctaLink,
  bgImage,
  bgColor,
}: Record<string, unknown>) => {
  const { siteName = "" } = useParams();

  return (
    <section
      className="relative overflow-hidden px-4 py-20"
      style={{
        backgroundColor: String(bgColor || "#efe6db"),
        backgroundImage: bgImage
          ? `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.2)),url(${String(bgImage)})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-4xl text-center text-stone-900">
        <h1 className="text-4xl font-bold md:text-6xl">
          {String(heading || "Build your dream storefront")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg">
          {String(subtext || "Launch quickly with drag and drop sections")}
        </p>
        <Link
          to={`/${siteName}${String(ctaLink || "/products")}`}
          className="mt-8 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white"
        >
          {String(ctaText || "Start shopping")}
        </Link>
      </div>
    </section>
  );
};

const ProductCarouselBlock = ({
  category,
  maxItems,
  showPrice,
}: Record<string, unknown>) => {
  const products = useSiteProducts(
    String(category || ""),
    Number(maxItems || 8),
  );
  const finalShowPrice = Boolean(showPrice ?? true);
  console.log(products);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="mb-4 text-2xl font-bold text-stone-900">
        Featured products
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <div key={product.id} className="min-w-[260px] max-w-[260px]">
            <ProductCard product={product} showPrice={finalShowPrice} />
          </div>
        ))}
      </div>
    </section>
  );
};

const ProductGridBlock = ({
  category,
  columns,
  showPrice,
  showCartButton,
  gap,
}: Record<string, unknown>) => {
  const products = useSiteProducts(String(category || ""));
  const finalColumns = Math.max(1, Math.min(6, Number(columns || 3)));
  const gridClass =
    finalColumns <= 1
      ? "grid-cols-1"
      : finalColumns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : finalColumns === 3
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : finalColumns === 4
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-5";

  const cardGap = Math.max(0, Math.min(64, Number(gap || 16)));

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="mb-4 text-2xl font-bold text-stone-900">
        Shop collection
      </h2>
      <div className={`grid ${gridClass}`} style={{ gap: `${cardGap}px` }}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showPrice={Boolean(showPrice ?? true)}
            onAddToCart={Boolean(showCartButton) ? () => undefined : undefined}
          />
        ))}
      </div>
    </section>
  );
};

const FeaturedProductBlock = ({
  productId,
  layout,
  showDescription,
}: Record<string, unknown>) => {
  const { siteName = "" } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const id = String(productId || "").trim();
      if (!siteName || !id) {
        return;
      }

      const data = await storefrontApi.getProduct(siteName, id);
      if (mounted) {
        setProduct(data);
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [productId, siteName]);

  if (!product) {
    return null;
  }

  const horizontal = String(layout || "vertical") === "horizontal";

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div
        className={`rounded-2xl border border-amber-100 bg-white p-6 ${horizontal ? "grid items-center gap-6 md:grid-cols-2" : ""}`}
      >
        <img
          src={
            product.images?.[0] ||
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=60"
          }
          alt={product.name || "Product"}
          className="aspect-[4/3] w-full rounded-xl object-cover"
        />
        <div>
          <h3 className="text-3xl font-bold text-stone-900">{product.name}</h3>
          {Boolean(showDescription ?? true) && (
            <p className="mt-3 text-stone-600">{product.description}</p>
          )}
          <p className="mt-4 text-xl font-semibold text-amber-700">
            EGP {Number(product.price || 0).toFixed(2)}
          </p>
          <Link
            to={`/${siteName}/products/${product.id}`}
            className="mt-4 inline-block rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white"
          >
            View product
          </Link>
        </div>
      </div>
    </section>
  );
};

const TextBlock = ({
  content,
  fontSize,
  weight,
  color,
  align,
}: Record<string, unknown>) => (
  <section
    className="mx-auto max-w-4xl px-4 py-8"
    style={{
      textAlign: String(align || "left") as "left" | "center" | "right",
    }}
  >
    <p
      style={{
        fontSize: `${Number(fontSize || 20)}px`,
        fontWeight: Number(weight || 500),
        color: String(color || "#1f2937"),
      }}
    >
      {String(content || "Text block")}
    </p>
  </section>
);

const ImageBlock = ({
  url,
  alt,
  width,
  borderRadius,
}: Record<string, unknown>) => (
  <section className="mx-auto max-w-5xl px-4 py-6">
    <img
      src={String(
        url ||
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60",
      )}
      alt={String(alt || "Image")}
      style={{
        width: `${Number(width || 100)}%`,
        borderRadius: `${Number(borderRadius || 16)}px`,
      }}
      className="mx-auto object-cover"
    />
  </section>
);

const ImageGalleryBlock = ({ images, columns }: Record<string, unknown>) => {
  const list = String(images || "")
    .split("\n")
    .filter(Boolean);
  const finalColumns = Math.max(1, Math.min(4, Number(columns || 3)));
  const className =
    finalColumns === 1
      ? "grid-cols-1"
      : finalColumns === 2
        ? "grid-cols-2"
        : finalColumns === 3
          ? "grid-cols-1 md:grid-cols-3"
          : "grid-cols-1 md:grid-cols-4";

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className={`grid gap-3 ${className}`}>
        {list.map((url) => (
          <img
            key={url}
            src={url}
            alt="Gallery"
            className="aspect-square w-full rounded-xl object-cover"
          />
        ))}
      </div>
    </section>
  );
};

const SpacerBlock = ({ height }: Record<string, unknown>) => (
  <div style={{ height: `${Number(height || 32)}px` }} />
);

const DividerBlock = ({ color, thickness, width }: Record<string, unknown>) => (
  <div className="mx-auto px-4 py-4">
    <hr
      style={{
        borderColor: String(color || "#d6d3d1"),
        borderTopWidth: `${Number(thickness || 1)}px`,
        width: `${Number(width || 100)}%`,
      }}
      className="mx-auto"
    />
  </div>
);

const FooterBlock = ({
  text,
  links,
  bgColor,
  textColor,
}: Record<string, unknown>) => {
  const { siteName = "" } = useParams();
  const parsedLinks = String(
    links || "Privacy:/privacy|Contact:/contact",
  ).split("|");

  return (
    <footer
      className="px-4 py-10"
      style={{
        backgroundColor: String(bgColor || "#111827"),
        color: String(textColor || "#ffffff"),
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm">
        <p>{String(text || "Copyright Nexus")}</p>
        <div className="flex gap-4">
          {parsedLinks.map((entry) => {
            const [label, href] = entry.split(":");
            return (
              <Link key={`${label}-${href}`} to={`/${siteName}${href || ""}`}>
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
};

const VideoBlock = ({ url, aspectRatio }: Record<string, unknown>) => {
  const ratio = String(aspectRatio || "16/9");
  const finalUrl = String(url || "https://www.youtube.com/embed/dQw4w9WgXcQ");

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div
        className="overflow-hidden rounded-2xl"
        style={{ aspectRatio: ratio }}
      >
        <iframe
          src={finalUrl}
          title="Video"
          className="h-full w-full"
          allowFullScreen
        />
      </div>
    </section>
  );
};

const TestimonialsBlock = ({ reviews, columns }: Record<string, unknown>) => {
  const list = String(
    reviews || "Amazing quality|Fast shipping|Great support",
  ).split("|");
  const finalColumns = Math.max(1, Math.min(3, Number(columns || 3)));
  const className =
    finalColumns === 1
      ? "grid-cols-1"
      : finalColumns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-3";

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="mb-4 text-2xl font-bold text-stone-900">
        What customers say
      </h2>
      <div className={`grid gap-4 ${className}`}>
        {list.map((review) => (
          <blockquote
            key={review}
            className="rounded-2xl border border-amber-100 bg-white p-4 text-stone-700"
          >
            "{review}"
          </blockquote>
        ))}
      </div>
    </section>
  );
};

const NewsletterBlock = ({
  heading,
  placeholder,
  buttonText,
}: Record<string, unknown>) => (
  <section className="mx-auto max-w-4xl px-4 py-10">
    <div className="rounded-2xl bg-amber-100/70 p-6">
      <h2 className="text-2xl font-bold text-stone-900">
        {String(heading || "Join our newsletter")}
      </h2>
      <div className="mt-4 flex gap-2">
        <input
          placeholder={String(placeholder || "Email address")}
          className="h-11 flex-1 rounded-lg border border-stone-300 px-3"
        />
        <button
          type="button"
          className="rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white"
        >
          {String(buttonText || "Subscribe")}
        </button>
      </div>
    </div>
  </section>
);

const CountdownBlock = ({
  targetDate,
  label,
  colorScheme,
}: Record<string, unknown>) => {
  const [remaining, setRemaining] = useState("00d 00h 00m 00s");

  useEffect(() => {
    const tick = () => {
      const target = new Date(String(targetDate || "2030-01-01")).getTime();
      const diff = Math.max(0, target - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setRemaining(
        `${String(days).padStart(2, "0")}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`,
      );
    };

    tick();
    const id = setInterval(tick, 1000);

    return () => clearInterval(id);
  }, [targetDate]);

  const classes = useMemo(
    () =>
      String(colorScheme || "amber") === "dark"
        ? "bg-stone-900 text-white"
        : "bg-amber-200 text-stone-900",
    [colorScheme],
  );

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className={`rounded-2xl p-6 text-center ${classes}`}>
        <h2 className="text-2xl font-bold">
          {String(label || "Sale ends in")}
        </h2>
        <p className="mt-2 text-xl font-semibold">{remaining}</p>
      </div>
    </section>
  );
};

const ContainerBlock = ({
  bgColor,
  padding,
  border,
  maxWidth,
  content,
}: Record<string, unknown>) => (
  <section
    className="mx-auto px-4"
    style={{
      backgroundColor: String(bgColor || "transparent"),
      padding: `${Number(padding || 24)}px`,
      border: border ? `1px solid ${String(border)}` : undefined,
      maxWidth: `${Number(maxWidth || 1200)}px`,
    }}
  >
    <p className="text-stone-600">{String(content || "Container section")}</p>
  </section>
);

export const puckConfig: Config = {
  components: {
    Navbar: {
      fields: {
        logo: { type: "text" },
        links: { type: "textarea" },
        bgColor: { type: "text" },
        textColor: { type: "text" },
        sticky: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      defaultProps: {
        logo: "Nexus Store",
        links: "Home:/|Products:/products|About:/about",
        bgColor: "#ffffff",
        textColor: "#111827",
        sticky: true,
      },
      render: (props: Record<string, unknown>) => <NavbarBlock {...props} />,
    },
    Hero: {
      fields: {
        heading: { type: "text" },
        subtext: { type: "textarea" },
        ctaText: { type: "text" },
        ctaLink: { type: "text" },
        bgImage: { type: "text" },
        bgColor: { type: "text" },
      },
      defaultProps: {
        heading: "Season launch",
        subtext: "New arrivals curated for your brand",
        ctaText: "Shop now",
        ctaLink: "/products",
        bgImage: "",
        bgColor: "#efe6db",
      },
      render: (props: Record<string, unknown>) => <HeroBlock {...props} />,
    },
    ProductCarousel: {
      fields: {
        category: { type: "text" },
        maxItems: { type: "number", min: 1, max: 20 },
        showPrice: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      defaultProps: { category: "", maxItems: 8, showPrice: true },
      render: (props: Record<string, unknown>) => (
        <ProductCarouselBlock {...props} />
      ),
    },
    ProductGrid: {
      fields: {
        category: { type: "text" },
        columns: { type: "number", min: 1, max: 6 },
        showPrice: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        showCartButton: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        gap: { type: "number", min: 0, max: 64 },
      },
      defaultProps: {
        category: "",
        columns: 3,
        showPrice: true,
        showCartButton: true,
        gap: 16,
      },
      render: (props: Record<string, unknown>) => (
        <ProductGridBlock {...props} />
      ),
    },
    FeaturedProduct: {
      fields: {
        productId: { type: "text" },
        layout: {
          type: "radio",
          options: [
            { label: "Vertical", value: "vertical" },
            { label: "Horizontal", value: "horizontal" },
          ],
        },
        showDescription: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      defaultProps: {
        productId: "",
        layout: "vertical",
        showDescription: true,
      },
      render: (props: Record<string, unknown>) => (
        <FeaturedProductBlock {...props} />
      ),
    },
    Text: {
      fields: {
        content: { type: "textarea" },
        fontSize: { type: "number" },
        weight: { type: "number" },
        color: { type: "text" },
        align: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: {
        content: "Text block",
        fontSize: 20,
        weight: 500,
        color: "#1f2937",
        align: "left",
      },
      render: (props: Record<string, unknown>) => <TextBlock {...props} />,
    },
    Image: {
      fields: {
        url: { type: "text" },
        alt: { type: "text" },
        width: { type: "number" },
        borderRadius: { type: "number" },
      },
      defaultProps: { url: "", alt: "Image", width: 100, borderRadius: 16 },
      render: (props: Record<string, unknown>) => <ImageBlock {...props} />,
    },
    ImageGallery: {
      fields: {
        images: { type: "textarea" },
        columns: { type: "number", min: 1, max: 4 },
      },
      defaultProps: { images: "", columns: 3 },
      render: (props: Record<string, unknown>) => (
        <ImageGalleryBlock {...props} />
      ),
    },
    Spacer: {
      fields: { height: { type: "number", min: 0, max: 500 } },
      defaultProps: { height: 32 },
      render: (props: Record<string, unknown>) => <SpacerBlock {...props} />,
    },
    Divider: {
      fields: {
        color: { type: "text" },
        thickness: { type: "number" },
        width: { type: "number" },
      },
      defaultProps: { color: "#d6d3d1", thickness: 1, width: 100 },
      render: (props: Record<string, unknown>) => <DividerBlock {...props} />,
    },
    Footer: {
      fields: {
        text: { type: "text" },
        links: { type: "textarea" },
        bgColor: { type: "text" },
        textColor: { type: "text" },
      },
      defaultProps: {
        text: "Copyright 2026",
        links: "Privacy:/privacy|Contact:/contact",
        bgColor: "#111827",
        textColor: "#ffffff",
      },
      render: (props: Record<string, unknown>) => <FooterBlock {...props} />,
    },
    Video: {
      fields: { url: { type: "text" }, aspectRatio: { type: "text" } },
      defaultProps: {
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        aspectRatio: "16/9",
      },
      render: (props: Record<string, unknown>) => <VideoBlock {...props} />,
    },
    Testimonials: {
      fields: {
        reviews: { type: "textarea" },
        columns: { type: "number", min: 1, max: 3 },
      },
      defaultProps: {
        reviews: "Amazing quality|Fast shipping|Great support",
        columns: 3,
      },
      render: (props: Record<string, unknown>) => (
        <TestimonialsBlock {...props} />
      ),
    },
    Newsletter: {
      fields: {
        heading: { type: "text" },
        placeholder: { type: "text" },
        buttonText: { type: "text" },
      },
      defaultProps: {
        heading: "Join our newsletter",
        placeholder: "Email address",
        buttonText: "Subscribe",
      },
      render: (props: Record<string, unknown>) => (
        <NewsletterBlock {...props} />
      ),
    },
    Countdown: {
      fields: {
        targetDate: { type: "text" },
        label: { type: "text" },
        colorScheme: {
          type: "radio",
          options: [
            { label: "Amber", value: "amber" },
            { label: "Dark", value: "dark" },
          ],
        },
      },
      defaultProps: {
        targetDate: "2030-01-01",
        label: "Sale ends in",
        colorScheme: "amber",
      },
      render: (props: Record<string, unknown>) => <CountdownBlock {...props} />,
    },
    Container: {
      fields: {
        bgColor: { type: "text" },
        padding: { type: "number" },
        border: { type: "text" },
        maxWidth: { type: "number" },
        content: { type: "textarea" },
      },
      defaultProps: {
        bgColor: "transparent",
        padding: 24,
        border: "",
        maxWidth: 1200,
        content: "Container section",
      },
      render: (props: Record<string, unknown>) => <ContainerBlock {...props} />,
    },
  },
};
