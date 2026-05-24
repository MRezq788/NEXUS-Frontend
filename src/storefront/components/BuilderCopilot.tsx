import { useState, useRef, useEffect, type FormEvent } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { storefrontApi } from "../api";
import type { SitePage } from "../types";

interface Props {
  siteName: string;
  pages: SitePage[];
  activePageId?: string;
  onUpdateAiPages: (pages: SitePage[] | null) => void;
}

export function BuilderCopilot({ siteName, pages, activePageId, onUpdateAiPages }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Tell me what you want to build or edit." },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const result = await storefrontApi.generateWithAi(siteName, text, pages, activePageId);
      onUpdateAiPages(result);
      setMessages((prev) => [...prev, { role: "assistant", content: "I updated the preview. Save when it looks right." }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate AI content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[500px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-stone-900 px-4 py-3 text-white">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Bot size={16} />
              Builder Copilot
            </h3>
            <button
              type="button"
              aria-label="Close builder copilot"
              title="Close"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-stone-300 hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-stone-50 p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-800"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="animate-pulse rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-500">
                  AI is building...
                </div>
              </div>
            )}
            {error && <div className="rounded-lg bg-red-50 p-2 text-xs text-red-600">{error}</div>}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-stone-200 bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Add a contact section..."
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-900 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send prompt"
                title="Send"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-white disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label="Open builder copilot"
        title="Builder Copilot"
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-white shadow-xl transition-transform hover:scale-105"
      >
        <Sparkles size={22} />
      </button>
    </div>
  );
}
