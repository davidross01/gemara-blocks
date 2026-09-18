import { createFileRoute, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Legend } from "@/components/viewer/Legend";
import { SegmentPanel } from "@/components/viewer/SegmentPanel";
import { DafPager } from "@/components/viewer/DafPager";
import { ViewControls } from "@/components/viewer/ViewControls";
import { CommentaryPanel } from "@/components/viewer/CommentaryPanel";
import { GemaraReaderPanel } from "@/components/viewer/GemaraReaderPanel";
import { NotesPanel } from "@/components/viewer/NotesPanel";
import { FlowMap } from "@/components/viewer/FlowMap";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { getMasechta, nextDaf, prevDaf } from "@/data/masechtos";
import { toHebrewNumeral } from "@/lib/hebrewNumerals";
import { fetchSefariaDaf } from "@/lib/sefaria.functions";
import { buildSugyaTree } from "@/lib/segmentation/pipeline";
import type { SugyaTree } from "@/lib/segmentation/types";
import { fetchCommentary, type CommentaryComment } from "@/lib/commentary.functions";
import { useViewerStore } from "@/stores/viewerStore";

type PanelKey = "rashi" | "gemara" | "tosafot";

export const Route = createFileRoute("/text/$masechta/$daf/$amud")({
  head: ({ params }) => {
    const m = getMasechta(params.masechta);
    const title = m ? `${m.english} ${params.daf}${params.amud} — Text View` : "Text View";
    return { meta: [{ title }] };
  },
  loader: ({ params }) => {
    if (!getMasechta(params.masechta)) throw notFound();
    const amud = params.amud.toLowerCase();
    if (amud !== "a" && amud !== "b") throw notFound();
  },
  component: TextOnlyView,
});

function TextOnlyView() {
  const { masechta, daf, amud } = Route.useParams();
  const meta = getMasechta(masechta)!;
  const ref = `${meta.ref}.${daf}${amud}`;

  const fetchDaf = useServerFn(fetchSefariaDaf);

  const dafQ = useQuery({
    queryKey: ["sefaria", ref],
    queryFn: () => fetchDaf({ data: { ref } }),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const setActive = useViewerStore((s) => s.setActive);
  const activeId = useViewerStore((s) => s.activeBlockId);
  const setTranslationTab = useViewerStore((s) => s.setTranslationTab);
  const setActiveCommentaryId = useViewerStore((s) => s.setActiveCommentaryId);
  useEffect(() => {
    setActive(null);
    setActiveCommentaryId(null);
  }, [ref, setActive, setActiveCommentaryId]);

  const baseTree: SugyaTree | null = useMemo(() => {
    if (!dafQ.data) return null;
    const raw = dafQ.data.hebrew.map((he, i) => ({
      index: i,
      hebrew: he,
      english: dafQ.data!.english[i] ?? "",
    }));
    return buildSugyaTree(ref, raw);
  }, [dafQ.data, ref]);

  const tree = baseTree;
  const activeSeg = tree && activeId ? tree.byId[activeId] ?? null : null;

  // Auto-select the first logical segment once the tree is ready.
  useEffect(() => {
    if (!tree || tree.order.length === 0) return;
    if (activeId && tree.byId[activeId]) return;
    setActive(tree.order[0]);
    setTranslationTab("gemara");
  }, [tree, activeId, setActive, setTranslationTab]);

  const nxt = nextDaf(masechta, daf, amud);
  const prv = prevDaf(masechta, daf, amud);

  // Multi-panel state — Gemara visible by default; Rashi/Tosafot toggled by toolbar.
  const [visible, setVisible] = useState<Record<PanelKey, boolean>>({
    rashi: false,
    gemara: true,
    tosafot: false,
  });
  const [solo, setSolo] = useState<PanelKey | null>(null);
  const [activeRashiId, setActiveRashiId] = useState<string | null>(null);
  const [activeTosafotId, setActiveTosafotId] = useState<string | null>(null);
  const [tab, setTab] = useState<"translation" | "flow" | "notes">("translation");

  // Reset cross-panel highlights when navigating dapim
  useEffect(() => {
    setActiveRashiId(null);
    setActiveTosafotId(null);
  }, [ref]);

  // Prefetch commentary so the panels feel instant when toggled on
  const qc = useQueryClient();
  const cmtFn = useServerFn(fetchCommentary);
  useEffect(() => {
    qc.prefetchQuery({
      queryKey: ["commentary", "Rashi", ref],
      queryFn: () => cmtFn({ data: { kind: "Rashi", ref } }),
      staleTime: 1000 * 60 * 60 * 24,
    });
    qc.prefetchQuery({
      queryKey: ["commentary", "Tosafot", ref],
      queryFn: () => cmtFn({ data: { kind: "Tosafot", ref } }),
      staleTime: 1000 * 60 * 60 * 24,
    });
  }, [ref, qc, cmtFn]);

  // Vilna layout: Rashi on inner margin, Tosafot on outer.
  // Amud Aleph reads left→right facing the spine: Rashi | Gemara | Tosafot
  // Amud Bet flips: Tosafot | Gemara | Rashi
  const panelOrder: PanelKey[] =
    amud.toLowerCase() === "a"
      ? ["tosafot", "gemara", "rashi"]
      : ["rashi", "gemara", "tosafot"];

  const visibleOrdered = panelOrder.filter((k) => visible[k] && (solo === null || solo === k));

  function togglePanel(k: PanelKey) {
    setVisible((v) => {
      const next = { ...v, [k]: !v[k] };
      // never let all three vanish — re-enable Gemara if user closes everything
      if (!next.rashi && !next.gemara && !next.tosafot) next.gemara = true;
      return next;
    });
    if (solo && solo !== k) setSolo(null);
  }

  function closePanel(k: PanelKey) {
    setVisible((v) => {
      const next = { ...v, [k]: false };
      if (!next.rashi && !next.gemara && !next.tosafot) next.gemara = true;
      return next;
    });
    if (solo === k) setSolo(null);
  }

  function toggleSolo(k: PanelKey) {
    setSolo((s) => (s === k ? null : k));
  }

  // --- Cross-panel synchronization ---

  function findCommentForSegmentIndex(
    kind: "Rashi" | "Tosafot",
    segIdx: number,
  ): CommentaryComment | null {
    const data = qc.getQueryData<{ comments: CommentaryComment[] }>([
      "commentary",
      kind,
      ref,
    ]);
    if (!data) return null;
    return data.comments.find((c) => c.segmentIndex === segIdx) ?? null;
  }

  function handleGemaraClick(segId: string) {
    setActive(segId);
    setTranslationTab("gemara");
    setActiveCommentaryId(null);
    if (!tree) return;
    const seg = tree.byId[segId];
    if (!seg) return;
    if (visible.rashi) {
      const r = findCommentForSegmentIndex("Rashi", seg.index);
      setActiveRashiId(r?.id ?? null);
    }
    if (visible.tosafot) {
      const t = findCommentForSegmentIndex("Tosafot", seg.index);
      setActiveTosafotId(t?.id ?? null);
    }
  }

  function handleCommentClick(kind: "Rashi" | "Tosafot", c: CommentaryComment) {
    if (kind === "Rashi") setActiveRashiId(c.id);
    else setActiveTosafotId(c.id);
    setTranslationTab(kind === "Rashi" ? "rashi" : "tosafot");
    setActiveCommentaryId(c.id);
    if (!tree) return;
    // First try matching by Sefaria's anchor index
    const byIndex = tree.segments.find((s) => s.index === c.segmentIndex);
    if (byIndex) {
      setActive(byIndex.id);
      return;
    }
    // Fallback: match DH substring against segment hebrew
    const probe = c.dh.replace(/[״׳]/g, "").trim().slice(0, 12);
    if (probe.length >= 3) {
      const match = tree.segments.find((s) => s.hebrew.includes(probe));
      if (match) setActive(match.id);
    }
  }

  function renderPanel(k: PanelKey) {
    if (k === "gemara" && tree) {
      return (
        <GemaraReaderPanel
          tree={tree}
          activeId={activeId}
          onSegmentClick={handleGemaraClick}
          onClose={() => closePanel("gemara")}
          onToggleSolo={() => toggleSolo("gemara")}
          isSolo={solo === "gemara"}
        />
      );
    }
    if (k === "rashi") {
      return (
        <CommentaryPanel
          kind="Rashi"
          refId={ref}
          activeCommentId={activeRashiId}
          onCommentClick={(c) => handleCommentClick("Rashi", c)}
          onClose={() => closePanel("rashi")}
          onToggleSolo={() => toggleSolo("rashi")}
          isSolo={solo === "rashi"}
        />
      );
    }
    if (k === "tosafot") {
      return (
        <CommentaryPanel
          kind="Tosafot"
          refId={ref}
          activeCommentId={activeTosafotId}
          onCommentClick={(c) => handleCommentClick("Tosafot", c)}
          onClose={() => closePanel("tosafot")}
          onToggleSolo={() => toggleSolo("tosafot")}
          isSolo={solo === "tosafot"}
        />
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader masechta={masechta} daf={daf} amud={amud} />

      <div className="border-b border-rule bg-paper-soft/40">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-soft">Text View · {meta.english} {daf}{amud}</div>
            <h1 className="font-serif text-xl text-ink">
              <span className="font-hebrew">
                דף {toHebrewNumeral(Number(daf))} עמוד {amud === "a" ? "א" : "ב"}
              </span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Legend compact />
          </div>
        </div>
      </div>

      <div className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-[1500px] items-center justify-center px-4 py-2 sm:px-6">
          <ViewControls mode="text" masechta={masechta} daf={daf} amud={amud} />
        </div>
      </div>

      {/* Text selection toolbar — order mirrors the printed Vilna daf */}
      <div className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-[1500px] items-center gap-2 px-4 py-2 sm:px-6">
          <span className="mr-1 text-[11px] uppercase tracking-wide text-ink-soft">Texts</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {panelOrder.map((k) => (
              <Toggle
                key={k}
                size="sm"
                variant="outline"
                pressed={visible[k]}
                onPressedChange={() => togglePanel(k)}
                aria-label={`Toggle ${k}`}
                className="h-8 px-3 text-xs capitalize"
              >
                {k === "gemara" ? "Gemara" : k === "rashi" ? "Rashi" : "Tosafot"}
              </Toggle>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        {dafQ.isLoading && (
          <div className="flex items-center justify-center py-24 text-ink-soft">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading text from Sefaria…
          </div>
        )}
        {dafQ.isError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
            Couldn't load this daf: {(dafQ.error as Error).message}
          </div>
        )}
        {tree && (
          <>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
            <div className="flex flex-col gap-5">
            <section className="h-[calc(100vh-140px)] min-h-[560px] lg:h-[calc(100vh-100px)]">
              {visibleOrdered.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-rule text-sm text-ink-soft">
                  Toggle a text above to start reading.
                </div>
              ) : visibleOrdered.length === 1 ? (
                <div className="h-full">{renderPanel(visibleOrdered[0])}</div>
              ) : (
                <ResizablePanelGroup
                  // re-mount when the visible set changes so default sizes reset cleanly
                  key={visibleOrdered.join("|")}
                  orientation="horizontal"
                  className="h-full"
                >
                  {visibleOrdered.map((k, i) => {
                    const isGemara = k === "gemara";
                    const defaultSize = isGemara
                      ? Math.max(40, 100 - (visibleOrdered.length - 1) * 28)
                      : (100 - (visibleOrdered.includes("gemara") ? 44 : 0)) /
                        Math.max(1, visibleOrdered.length - (visibleOrdered.includes("gemara") ? 1 : 0));
                    return (
                      <Fragment key={k}>
                        {i > 0 && <ResizableHandle withHandle className="mx-1" />}
                        <ResizablePanel defaultSize={defaultSize} minSize={15} className="overflow-hidden">
                          <div className="h-full">{renderPanel(k)}</div>
                        </ResizablePanel>
                      </Fragment>
                    );
                  })}
                </ResizablePanelGroup>
              )}
            </section>
            <DafPager prev={prv} next={nxt} route="/text/$masechta/$daf/$amud" flow="rtl" />
            </div>
            <aside className="lg:sticky lg:top-[100px] lg:h-[calc(100vh-100px)]">
              <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex h-full flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="translation">Translation</TabsTrigger>
                  <TabsTrigger value="flow">Sugya Flow</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="translation" className="mt-3 flex-1 min-h-[500px]">
                  <SegmentPanel segment={activeSeg} tree={tree} />
                </TabsContent>
                <TabsContent value="flow" className="mt-3 flex-1 min-h-[500px]">
                  <div className="h-full min-h-[500px] overflow-hidden rounded-2xl border border-rule bg-card">
                    <FlowMap tree={tree} />
                  </div>
                </TabsContent>
                <TabsContent value="notes" className="mt-3 flex-1 min-h-[500px]">
                  <NotesPanel segment={activeSeg} ref={ref} />
                </TabsContent>
              </Tabs>
            </aside>
          </div>
          </>
        )}
      </main>
    </div>
  );
}