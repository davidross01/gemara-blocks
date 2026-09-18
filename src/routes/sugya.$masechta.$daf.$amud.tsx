import { createFileRoute, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Legend } from "@/components/viewer/Legend";
import { VilnaDafScan } from "@/components/daf/VilnaDafScan";
import { DafPdfViewer } from "@/components/daf/DafPdfViewer";
import { getDafPdf } from "@/data/dafPdfs";
import { SegmentPanel } from "@/components/viewer/SegmentPanel";
import { NotesPanel } from "@/components/viewer/NotesPanel";
import { FlowMap } from "@/components/viewer/FlowMap";
import { DafPager } from "@/components/viewer/DafPager";
import { ViewControls } from "@/components/viewer/ViewControls";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getMasechta, nextDaf, prevDaf } from "@/data/masechtos";
import { toHebrewNumeral } from "@/lib/hebrewNumerals";
import { fetchSefariaDaf } from "@/lib/sefaria.functions";
import { fetchDafScan } from "@/lib/scan.functions";
import { buildSugyaTree } from "@/lib/segmentation/pipeline";
import type { SugyaTree } from "@/lib/segmentation/types";
import { useViewerStore } from "@/stores/viewerStore";

export const Route = createFileRoute("/sugya/$masechta/$daf/$amud")({
  head: ({ params }) => {
    const m = getMasechta(params.masechta);
    const title = m ? `${m.english} ${params.daf}${params.amud} — Gemara Blocks` : "Gemara Blocks";
    return {
      meta: [
        { title },
        { name: "description", content: `Learn ${m?.english ?? "this daf"} ${params.daf}${params.amud} visually — color-coded sugya structure and a beginner-friendly explanation.` },
      ],
    };
  },
  loader: ({ params }) => {
    if (!getMasechta(params.masechta)) throw notFound();
    const amud = params.amud.toLowerCase();
    if (amud !== "a" && amud !== "b") throw notFound();
  },
  component: SugyaViewer,
});

function SugyaViewer() {
  const { masechta, daf, amud } = Route.useParams();
  const meta = getMasechta(masechta)!;
  const ref = `${meta.ref}.${daf}${amud}`;

  const fetchDaf = useServerFn(fetchSefariaDaf);
  const fetchScan = useServerFn(fetchDafScan);

  const dafQ = useQuery({
    queryKey: ["sefaria", ref],
    queryFn: () => fetchDaf({ data: { ref } }),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const scanQ = useQuery({
    queryKey: ["scan", ref],
    queryFn: () => fetchScan({ data: { ref } }),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const setActive = useViewerStore((s) => s.setActive);
  const activeId = useViewerStore((s) => s.activeBlockId);
  const tab = useViewerStore((s) => s.tab);
  const setTab = useViewerStore((s) => s.setTab);

  // Reset selection when ref changes
  useEffect(() => {
    setActive(null);
  }, [ref, setActive]);

  // Build the tree from rule + grammar pipeline (synchronous).
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

  // Auto-select the first logical segment once the tree is ready so the
  // interface is fully synchronized without requiring a click.
  useEffect(() => {
    if (!tree || tree.order.length === 0) return;
    if (activeId && tree.byId[activeId]) return;
    setActive(tree.order[0]);
  }, [tree, activeId, setActive]);

  const nxt = nextDaf(masechta, daf, amud);
  const prv = prevDaf(masechta, daf, amud);

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader masechta={masechta} daf={daf} amud={amud} />

      <div className="border-b border-rule bg-paper-soft/40">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center gap-2 px-4 py-3 text-center sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-soft">{meta.english} · Daf {daf}{amud}</div>
            <h1 className="font-serif text-xl text-ink">
              <span className="font-hebrew">
                דף {toHebrewNumeral(Number(daf))} עמוד {amud === "a" ? "א" : "ב"}
              </span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-start gap-3">
            <Legend compact />
          </div>
        </div>
      </div>

      <div className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-[1500px] items-center justify-center px-4 py-2 sm:px-6">
          <ViewControls mode="daf" masechta={masechta} daf={daf} amud={amud} />
        </div>
      </div>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        {dafQ.isLoading && (
          <div className="flex items-center justify-center py-24 text-ink-soft">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading daf from Sefaria…
          </div>
        )}
        {dafQ.isError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
            Couldn't load this daf from Sefaria: {(dafQ.error as Error).message}
          </div>
        )}
        {tree && (
          <>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <section>
                {(() => {
                  const pdf = getDafPdf(ref);
                  if (pdf) {
                    return (
                      <DafPdfViewer
                        pdf={pdf}
                        segments={tree.segments}
                        dafLabel={`${meta.english} ${daf}${amud}`}
                      />
                    );
                  }
                  return (
                    <VilnaDafScan
                      segments={tree.segments}
                      imageUrl={scanQ.data?.imageUrl ?? null}
                      manuscriptTitle={scanQ.data?.manuscriptTitle}
                      dafLabel={`${meta.english} ${daf}${amud}`}
                    />
                  );
                })()}
                <DafPager prev={prv} next={nxt} route="/sugya/$masechta/$daf/$amud" />
              </section>
              <aside className="lg:sticky lg:top-[120px] lg:h-[calc(100vh-140px)]">
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