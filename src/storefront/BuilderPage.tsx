import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { storefrontApi } from "./api";
import { puckConfig } from "./puckConfig";
import type { PuckData, SitePage } from "./types";

const emptyData = { content: [], root: { props: {} } };

type PuckNode = {
  type: string;
  props: Record<string, unknown> & { id?: string };
  content?: PuckNode[];
  [key: string]: unknown;
};

const createNodeId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizePuckData = (input: PuckData | undefined): { data: PuckData; changed: boolean } => {
  const source = (input || emptyData) as PuckData;
  let changed = false;

  const normalizeNode = (node: Record<string, unknown>): PuckNode => {
    const props: Record<string, unknown> & { id?: string } =
      node && typeof node.props === "object" && node.props
        ? ({ ...(node.props as Record<string, unknown>) } as Record<string, unknown> & { id?: string })
        : {};

    if (typeof props.id !== "string" || !props.id.trim()) {
      props.id = createNodeId();
      changed = true;
    }

    const next: PuckNode = {
      ...node,
      type: String(node.type || ""),
      props,
    };

    if (Array.isArray(node.content)) {
      next.content = (node.content as Record<string, unknown>[]).map(normalizeNode);
    }

    return next;
  };

  const content = Array.isArray(source.content)
    ? (source.content as Record<string, unknown>[])
        .filter((item) => item && typeof item === "object" && typeof item.type === "string")
        .map(normalizeNode)
    : [];

  const zones =
    source.zones && typeof source.zones === "object"
      ? Object.fromEntries(
          Object.entries(source.zones).map(([zoneKey, zoneItems]) => {
            const normalizedZone = Array.isArray(zoneItems)
              ? (zoneItems as Record<string, unknown>[])
                  .filter((item) => item && typeof item === "object" && typeof item.type === "string")
                  .map(normalizeNode)
              : [];
            return [zoneKey, normalizedZone];
          }),
        )
      : undefined;

  return {
    changed,
    data: {
      ...source,
      content,
      root: source.root?.props ? source.root : { props: {} },
      ...(zones ? { zones } : {}),
    },
  };
};

export const BuilderPage = () => {
  const { siteName = "", pageId } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState<SitePage[]>([]);
  const [activePage, setActivePage] = useState<SitePage | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      if (!siteName) {
        return;
      }

      setLoading(true);

      const pageList = await storefrontApi.listPages(siteName);
      if (!mounted) {
        return;
      }

      setPages(pageList);

      const selected = pageId
        ? pageList.find((page) => page.id === pageId)
        : pageList.find((page) => page.isHomepage) || pageList[0];

      if (!selected) {
        setActivePage(null);
        setLoading(false);
        return;
      }

      const normalized = normalizePuckData(selected.puckData);
      const safePage = { ...selected, puckData: normalized.data };
      setActivePage(safePage);

      if (normalized.changed) {
        void storefrontApi.updatePage(siteName, selected.id, { puckData: normalized.data });
      }

      setLoading(false);
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [pageId, siteName]);

  const data = useMemo(() => activePage?.puckData || emptyData, [activePage]);

  if (!siteName) {
    return <div className="p-6">Missing site name</div>;
  }

  if (loading || !activePage) {
    return <div className="p-6">Loading builder...</div>;
  }

  const addPage = async () => {
    const pageName = prompt("Page name", "About");
    if (!pageName) {
      return;
    }

    const pageSlug = prompt("Page slug", pageName.toLowerCase().replace(/\s+/g, "-"));
    if (pageSlug === null) {
      return;
    }

    const created = await storefrontApi.createPage(siteName, pageName, pageSlug);
    setPages((prev) => [...prev, created]);
    setActivePage(created);
    navigate(`/builder/${siteName}/${created.id}`);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2">
          <Link to="/dashboard" className="rounded-lg border border-stone-300 bg-white px-3 py-1 text-sm text-stone-900">
            Back
          </Link>
          <select
            value={activePage.id}
            className="h-9 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900"
            onChange={(event) => {
              const target = pages.find((page) => page.id === event.target.value);
              if (!target) return;
              setActivePage(target);
              navigate(`/builder/${siteName}/${target.id}`);
            }}
          >
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.pageName}
              </option>
            ))}
          </select>
          <button className="rounded-lg border border-stone-300 bg-white px-3 py-1 text-sm text-stone-900" type="button" onClick={addPage}>
            New page
          </button>
          <button
            className="rounded-lg bg-stone-900 px-3 py-1 text-sm text-white disabled:opacity-60"
            type="button"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await storefrontApi.updatePage(siteName, activePage.id, { puckData: data as unknown as PuckData });
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <Link
            to={`/${siteName}${activePage.isHomepage ? "" : `/${activePage.pageSlug}`}`}
            target="_blank"
            className="rounded-lg border border-stone-300 bg-white px-3 py-1 text-sm text-stone-900"
          >
            Preview
          </Link>
        </div>
      </div>

      <Puck
        config={puckConfig}
        data={data}
        onPublish={async (published) => {
          await storefrontApi.updatePage(siteName, activePage.id, { puckData: published as unknown as PuckData });
        }}
        onChange={(nextData) => {
          const normalized = normalizePuckData(nextData as unknown as PuckData).data;
          setActivePage((current) =>
            current ? { ...current, puckData: normalized } : current,
          );
        }}
      />
    </div>
  );
};
