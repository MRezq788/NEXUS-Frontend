import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { storefrontApi } from "./api";
import { puckConfig } from "./puckConfig";
import type { PuckData, SitePage } from "./types";
import { BuilderCopilot } from "./components/BuilderCopilot";

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

const applyPuckDataToPage = (page: SitePage, puckData: PuckData) => ({
  ...page,
  puckData,
});

const normalizePageList = (pageList: SitePage[]) =>
  pageList.map((page) => ({
    ...page,
    puckData: normalizePuckData(page.puckData).data,
  }));

export const BuilderPage = () => {
  const { siteName = "", pageId } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState<SitePage[]>([]);
  const [activePage, setActivePage] = useState<SitePage | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingPage, setDeletingPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiPageLists, setAiPageLists] = useState<SitePage[] | null>(null);
  const [aiPreviewVersion, setAiPreviewVersion] = useState(0);

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

      const normalizedPages = pageList.map((page) => {
        const normalized = normalizePuckData(page.puckData);

        if (normalized.changed) {
          void storefrontApi.updatePage(siteName, page.id, { puckData: normalized.data });
        }

        return { ...page, puckData: normalized.data };
      });

      setPages(normalizedPages);
      setActivePage((current) => current || normalizedPages.find((page) => page.isHomepage) || normalizedPages[0] || null);

      setLoading(false);
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [siteName]);

  useEffect(() => {
    if (!pages.length || aiPageLists) {
      return;
    }

    const selected = pageId
      ? pages.find((page) => page.id === pageId)
      : pages.find((page) => page.isHomepage) || pages[0];

    setActivePage(selected || pages.find((page) => page.isHomepage) || pages[0] || null);
  }, [aiPageLists, pageId, pages]);

  const activeVisiblePage = useMemo(() => {
    if (aiPageLists && activePage) {
      return aiPageLists.find((p) => p.id === activePage.id || p.pageSlug === activePage.pageSlug) || activePage;
    }
    return activePage;
  }, [activePage, aiPageLists]);

  const data = useMemo(() => activeVisiblePage?.puckData || emptyData, [activeVisiblePage]);

  const visiblePages = aiPageLists || pages;
  const isAiPreview = Boolean(aiPageLists);

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

  const deleteCurrentPage = async () => {
    if (!activeVisiblePage || activeVisiblePage.isHomepage) {
      return;
    }

    const confirmed = window.confirm(`Delete page "${activeVisiblePage.pageName}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingPage(true);

    try {
      if (aiPageLists) {
        const nextPages = aiPageLists.filter((page) => page.id !== activeVisiblePage.id);
        const nextActive = nextPages.find((page) => page.isHomepage) || nextPages[0] || null;

        setAiPageLists(nextPages.length ? nextPages : null);
        setActivePage(nextActive);
        setAiPreviewVersion((version) => version + 1);
        return;
      }

      await storefrontApi.deletePage(siteName, activeVisiblePage.id);
      const nextPages = pages.filter((page) => page.id !== activeVisiblePage.id);
      const nextActive = nextPages.find((page) => page.isHomepage) || nextPages[0] || null;

      setPages(nextPages);
      setActivePage(nextActive);

      if (nextActive) {
        navigate(`/builder/${siteName}/${nextActive.id}`);
      } else {
        navigate(`/builder/${siteName}`);
      }
    } finally {
      setDeletingPage(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2">
          <Link to="/dashboard" className="rounded-lg border border-stone-300 bg-white px-3 py-1 text-sm text-stone-900">
            Back
          </Link>
          <select
            value={activeVisiblePage?.id || activePage.id}
            className="h-9 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900"
            onChange={(event) => {
              const target = visiblePages.find((page) => page.id === event.target.value);
              if (!target) return;
              setActivePage(pages.find((page) => page.id === target.id) || target);
              if (!isAiPreview) {
                navigate(`/builder/${siteName}/${target.id}`);
              }
            }}
          >
            {visiblePages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.pageName}
              </option>
            ))}
          </select>
          <button className="rounded-lg border border-stone-300 bg-white px-3 py-1 text-sm text-stone-900" type="button" onClick={addPage}>
            New page
          </button>
          <button
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={deletingPage || Boolean(activeVisiblePage?.isHomepage)}
            onClick={() => void deleteCurrentPage()}
            title={activeVisiblePage?.isHomepage ? "Homepage cannot be deleted" : "Delete current page"}
          >
            {deletingPage ? "Deleting..." : "Delete page"}
          </button>
          {aiPageLists && (
            <button
              className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-sm text-amber-900"
              type="button"
              onClick={() => setAiPageLists(null)}
            >
              Exit Preview
            </button>
          )}
          <button
            className="rounded-lg bg-stone-900 px-3 py-1 text-sm text-white disabled:opacity-60"
            type="button"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                if (aiPageLists) {
                  const existingIds = new Set(pages.map((page) => page.id));
                  const savedPages = await Promise.all(
                    aiPageLists.map(async (page) => {
                      const payload = {
                        pageName: page.pageName,
                        pageSlug: page.pageSlug,
                        isHomepage: page.isHomepage,
                        puckData: page.puckData,
                      };

                      if (existingIds.has(page.id)) {
                        return storefrontApi.updatePage(siteName, page.id, payload);
                      }

                      const created = await storefrontApi.createPage(siteName, page.pageName, page.pageSlug);
                      return storefrontApi.updatePage(siteName, created.id, payload);
                    }),
                  );

                  setPages(savedPages);
                  setActivePage(
                    savedPages.find(
                      (page) => page.id === activeVisiblePage?.id || page.pageSlug === activeVisiblePage?.pageSlug,
                    ) ||
                      savedPages.find((page) => page.isHomepage) ||
                      savedPages[0] ||
                      null,
                  );
                  setAiPageLists(null);
                } else {
                  const savedPage = await storefrontApi.updatePage(siteName, activePage.id, { puckData: data as unknown as PuckData });
                  setPages((current) => current.map((page) => (page.id === savedPage.id ? savedPage : page)));
                  setActivePage(savedPage);
                }
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <Link
            to={`/${siteName}${activeVisiblePage?.isHomepage ? "" : `/${activeVisiblePage?.pageSlug || ""}`}`}
            target="_blank"
            className="rounded-lg border border-stone-300 bg-white px-3 py-1 text-sm text-stone-900"
          >
            Preview
          </Link>
        </div>
      </div>

      <Puck
        key={`${activeVisiblePage?.id || activePage.id}-${isAiPreview ? aiPreviewVersion : 0}`}
        config={puckConfig}
        data={data}
        onPublish={async (published) => {
          const normalized = normalizePuckData(published as unknown as PuckData).data;

          if (aiPageLists) {
            setAiPageLists((current) =>
              current?.map((page) =>
                page.id === activeVisiblePage?.id || page.pageSlug === activeVisiblePage?.pageSlug
                  ? applyPuckDataToPage(page, normalized)
                  : page,
              ) || current,
            );
            return;
          }

          await storefrontApi.updatePage(siteName, activePage.id, { puckData: normalized });
        }}
        onChange={(nextData) => {
          const normalized = normalizePuckData(nextData as unknown as PuckData).data;
          if (aiPageLists) {
            setAiPageLists((current) =>
              current?.map((page) =>
                page.id === activeVisiblePage?.id || page.pageSlug === activeVisiblePage?.pageSlug
                  ? applyPuckDataToPage(page, normalized)
                  : page,
              ) || current,
            );
            return;
          }

          setActivePage((current) =>
            current ? { ...current, puckData: normalized } : current,
          );
        }}
      />

      <BuilderCopilot
        siteName={siteName}
        pages={visiblePages}
        activePageId={activeVisiblePage?.id || activePage.id}
        onUpdateAiPages={(nextPages) => {
          if (!nextPages) {
            setAiPageLists(null);
            return;
          }

          const normalizedPages = normalizePageList(nextPages);
          const nextActive =
            normalizedPages.find((page) => page.id === activeVisiblePage?.id || page.pageSlug === activeVisiblePage?.pageSlug) ||
            normalizedPages.find((page) => page.isHomepage) ||
            normalizedPages[0] ||
            null;

          setAiPageLists(normalizedPages);
          setAiPreviewVersion((version) => version + 1);
          setActivePage(nextActive);
        }}
      />
    </div>
  );
};
