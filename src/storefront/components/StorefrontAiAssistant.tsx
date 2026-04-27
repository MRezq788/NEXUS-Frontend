import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { AiAssistantSettings } from "../types";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  products?: ProductMatch[];
}

interface ProductMatch {
  id?: string;
  product_id?: string;
  site_name?: string;
  similarity?: number;
  object?: {
    id?: string;
    product?: {
      name?: string;
      description?: string;
      category?: string;
      basePrice?: number;
      price?: number;
      images?: string[];
      [key: string]: unknown;
    };
    variants?: Array<Record<string, unknown>>;
    totalQuantity?: number;
    site?: {
      currency?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

interface ChatbotResponse {
  text?: string;
  answer?: string;
  objectsResult?: ProductMatch[];
  matches?: ProductMatch[];
}

interface Props {
  siteName: string;
  storeName: string;
  settings?: AiAssistantSettings;
}

const chatbotBaseUrl =
  import.meta.env.VITE_CHATBOT_API_URL || "https://nexus-chatbot-delta.vercel.app";

const defaultPrompt = (storeName: string) =>
  `You are the AI shopping assistant for ${storeName}. Help customers find products, compare variants, and answer using only this store's available inventory. Keep answers friendly and concise. Do not include links, raw IDs, or image URLs in the text because product cards are shown separately.`;

const buildVariantLabel = (variant: Record<string, unknown>) => {
  const attrs = Object.entries(variant)
    .filter(([key, value]) => {
      return (
        value !== undefined &&
        value !== null &&
        !["id", "price", "quantity", "createdAt", "updatedAt", "sourceOwnerId", "sourceProductId", "sourceVariantId", "sourceVariantRef"].includes(key)
      );
    })
    .map(([key, value]) => `${key}: ${String(value)}`);

  return attrs.length ? attrs.join(", ") : "Default";
};

const ProductResultCard = ({ match, siteName }: { match: ProductMatch; siteName: string }) => {
  const object = match.object || {};
  const product = object.product || {};
  const variants = Array.isArray(object.variants) ? object.variants : [];
  const firstVariant = variants[0];
  const productId = object.id || match.product_id;
  const currency = object.site?.currency || "EGP";
  const price = Number(firstVariant?.price ?? product.basePrice ?? product.price ?? 0);
  const image = product.images?.[0];
  const quantity = Number(object.totalQuantity ?? firstVariant?.quantity ?? 0);

  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex gap-3 p-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
          {image ? (
            <img src={image} alt={product.name || "Product"} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
              Product
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-stone-950">
            {product.name || productId || "Product"}
          </h4>
          <p className="mt-1 line-clamp-2 text-xs text-stone-500">{product.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
              {currency} {price.toFixed(2)}
            </span>
            <span className="rounded-full bg-stone-100 px-2 py-1 text-stone-600">
              Qty {Number.isFinite(quantity) ? quantity : 0}
            </span>
          </div>
        </div>
      </div>
      {!!variants.length && (
        <div className="flex gap-2 overflow-x-auto border-t border-stone-100 px-3 py-2">
          {variants.slice(0, 4).map((variant, index) => (
            <span key={String(variant.id || index)} className="shrink-0 rounded-full bg-stone-100 px-2 py-1 text-[11px] text-stone-600">
              {buildVariantLabel(variant)}
            </span>
          ))}
        </div>
      )}
      {productId && (
        <Link
          to={`/${siteName}/products/${productId}`}
          className="block border-t border-stone-100 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          View product
        </Link>
      )}
    </article>
  );
};

export function StorefrontAiAssistant({ siteName, storeName, settings }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi, I can help you find products in ${storeName}.`,
    },
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const systemPrompt = useMemo(
    () => settings?.systemPrompt?.trim() || defaultPrompt(storeName || siteName),
    [settings?.systemPrompt, siteName, storeName],
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  if (!settings?.enabled) {
    return null;
  }

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    const history = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${chatbotBaseUrl.replace(/\/$/, "")}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          siteName,
          limit: 5,
          history,
          systemPrompt,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Assistant could not answer right now");
      }

      const payload = (await response.json()) as ChatbotResponse;
      const products = payload.objectsResult || payload.matches || [];
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: payload.text || payload.answer || "I found these products.",
          products,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <div
        className={`mb-3 w-[calc(100vw-2rem)] max-w-[390px] origin-bottom-right overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl transition-all duration-300 ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div className="bg-stone-950 px-4 py-3 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Shopping Assistant</h3>
              <p className="text-xs text-stone-300">{storeName || siteName}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-full bg-white/10 text-lg leading-none transition hover:bg-white/20"
              aria-label="Close assistant"
            >
              x
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="max-h-[55vh] space-y-3 overflow-y-auto bg-stone-50 p-3">
          {messages.map((message) => (
            <div key={message.id} className={message.role === "user" ? "ml-8 text-right" : "mr-4"}>
              <div
                className={`inline-block rounded-2xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "border border-stone-200 bg-white text-stone-800"
                }`}
              >
                {message.content}
              </div>
              {!!message.products?.length && (
                <div className="mt-2 space-y-2 text-left">
                  {message.products.map((product, index) => (
                    <ProductResultCard
                      key={product.id || product.product_id || index}
                      match={product}
                      siteName={siteName}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="mr-10 rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-500">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:240ms]" />
              </span>
            </div>
          )}
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
        </div>

        <div className="border-t border-stone-200 bg-white p-3">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for products..."
              className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white shadow-xl shadow-emerald-900/20 transition hover:-translate-y-1 hover:bg-emerald-700"
        aria-label="Open AI assistant"
      >
        AI
      </button>
    </div>
  );
}
