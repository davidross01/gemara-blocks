import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Bookmark, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { AnalyzedSegment, SugyaTree } from "@/lib/segmentation/types";
import { CATEGORIES } from "@/lib/categories";
import {
  MOVE_TYPE_LABELS,
  MECHANISM_LABELS,
  STANDING_EFFECT_LABELS,
} from "@/lib/segmentation/labels";
import { CategoryBadge } from "./CategoryBadge";
import { BlockIllustration } from "./BlockIllustration";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useViewerStore } from "@/stores/viewerStore";
import { useStudyStore, studyKey } from "@/stores/studyStore";
import { fetchCommentary, type CommentaryComment } from "@/lib/commentary.functions";

export function SegmentPanel({
  segment,
  tree,
}: {
  segment: AnalyzedSegment | null;
  tree: SugyaTree;
}) {
  const setActive = useViewerStore((s) => s.setActive);
  const toggleBookmark = useStudyStore((s) => s.toggleBookmark);
  const bookmarks = useStudyStore((s) => s.bookmarks);

  const order = tree.order;
  const curIdx = segment ? order.indexOf(segment.id) : -1;
  const prevId = curIdx > 0 ? order[curIdx - 1] : null;
  const nextId = curIdx >= 0 && curIdx < order.length - 1 ? order[curIdx + 1] : null;

  const Nav = (
    <div className="flex items-center justify-between gap-2 border-t border-rule bg-card px-3 py-2">
      <button
        type="button"
        aria-label="Next segment"
        disabled={!nextId}
        onClick={() => nextId && setActive(nextId)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-soft transition-all hover:bg-paper-soft hover:text-ink active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <span className="text-[11px] uppercase tracking-wider text-ink-soft">
        {curIdx >= 0 ? `Segment ${curIdx + 1} / ${order.length}` : `${order.length} segments`}
      </span>
      <button
        type="button"
        aria-label="Previous segment"
        disabled={!prevId}
        onClick={() => prevId && setActive(prevId)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-soft transition-all hover:bg-paper-soft hover:text-ink active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );

  if (!segment) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-rule bg-card">
        <div className="flex flex-1 flex-col items-center justify-center p-10 text-center text-ink-soft">
          <Sparkles className="mb-2 h-5 w-5" />
          <p className="font-serif text-lg">Click a phrase in the daf</p>
          <p className="mt-1 max-w-xs text-sm">
            The translation, structure, and a beginner-friendly explanation will appear here. Use the arrows below to step through the sugya.
          </p>
        </div>
        {Nav}
      </div>
    );
  }

  const meta = CATEGORIES[segment.category];
  const parent = segment.parentId ? tree.byId[segment.parentId] : null;
  const childSegs = segment.children.map((id) => tree.byId[id]).filter(Boolean);
  const key = studyKey(tree.ref, segment.id);
  const isBookmarked = Boolean(bookmarks[key]);
  const standing =
    tree.standingPositions && curIdx >= 0 ? tree.standingPositions[curIdx] : null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={segment.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
        data-cat={segment.category}
        className="segment-card flex h-full flex-col overflow-hidden rounded-2xl border bg-card"
        style={{ borderColor: `color-mix(in oklab, ${meta.hex} 30%, var(--rule))` }}
      >
        <BlockIllustration category={segment.category} className="h-20 w-full" />
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center justify-between">
            <CategoryBadge category={segment.category} confidence={segment.combinedConfidence} size="md" />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Bookmark"
              onClick={() => toggleBookmark(key)}
            >
              <Bookmark className={isBookmarked ? "h-4 w-4 fill-current" : "h-4 w-4"} />
            </Button>
          </div>

          <section className="mt-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Original</h4>
            <p className="font-hebrew mt-1 text-lg text-ink">{segment.hebrew}</p>
          </section>

          <DialecticalMove segment={segment} standing={standing} />

          <section className="mt-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Breakdown</h4>
            <TranslationTabs segment={segment} dafRef={tree.ref} />
          </section>

          <section
            data-cat={segment.category}
            className="stage-tint mt-4 rounded-lg p-3"
            style={{ backgroundColor: `color-mix(in oklab, ${meta.hex} 10%, transparent)` }}
          >
            <h4 className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: meta.hex }}>
              <span className="cb-label">What's happening</span>
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              <span className="cb-label">{beginnerExplanation(segment, parent)}</span>
            </p>
          </section>

          <section className="mt-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Confidence</h4>
            <ConfidenceBar segment={segment} />
            <p className="mt-1 text-xs text-ink-soft">{segment.reasoning}</p>
          </section>

          {(parent || childSegs.length > 0) && (
            <section className="mt-4 space-y-1.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Sugya context</h4>
              {parent && (
                <button
                  onClick={() => setActive(parent.id)}
                  className="flex w-full items-center gap-2 rounded-md border border-rule px-2.5 py-1.5 text-left text-xs hover:bg-paper-soft"
                >
                  <ArrowUp className="h-3 w-3 text-ink-soft" />
                  <span className="text-ink-soft">Parent · {CATEGORIES[parent.category].label}</span>
                  <span className="ml-auto truncate font-hebrew text-ink" dir="rtl">
                    {parent.hebrew.slice(0, 30)}…
                  </span>
                </button>
              )}
              {childSegs.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className="flex w-full items-center gap-2 rounded-md border border-rule px-2.5 py-1.5 text-left text-xs hover:bg-paper-soft"
                >
                  <ArrowDown className="h-3 w-3 text-ink-soft" />
                  <span className="text-ink-soft">Leads to · {CATEGORIES[c.category].label}</span>
                  <span className="ml-auto truncate font-hebrew text-ink" dir="rtl">
                    {c.hebrew.slice(0, 30)}…
                  </span>
                </button>
              ))}
            </section>
          )}
        </div>
        {Nav}
      </motion.div>
    </AnimatePresence>
  );
}

function TranslationTabs({ segment, dafRef }: { segment: AnalyzedSegment; dafRef: string }) {
  const tab = useViewerStore((s) => s.translationTab);
  const setTab = useViewerStore((s) => s.setTranslationTab);
  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-1">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="gemara">Gemara</TabsTrigger>
        <TabsTrigger value="rashi">Rashi</TabsTrigger>
        <TabsTrigger value="tosafot">Tosafot</TabsTrigger>
      </TabsList>
      <AnimatePresence mode="wait">
        <TabsContent key="gemara" value="gemara" className="mt-3">
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {segment.english ? (
              <p
                className="sefaria-translation text-sm leading-relaxed text-ink"
                dangerouslySetInnerHTML={{ __html: segment.english }}
              />
            ) : (
              <p className="text-sm leading-relaxed text-ink">
                <em className="text-ink-soft">No English translation in Sefaria for this segment.</em>
              </p>
            )}
          </motion.div>
        </TabsContent>
        <TabsContent key="rashi" value="rashi" className="mt-3">
          <CommentaryTab kind="Rashi" dafRef={dafRef} segmentIndex={segment.index} />
        </TabsContent>
        <TabsContent key="tosafot" value="tosafot" className="mt-3">
          <CommentaryTab kind="Tosafot" dafRef={dafRef} segmentIndex={segment.index} />
        </TabsContent>
      </AnimatePresence>
    </Tabs>
  );
}

function CommentaryTab({
  kind,
  dafRef,
  segmentIndex,
}: {
  kind: "Rashi" | "Tosafot";
  dafRef: string;
  segmentIndex: number;
}) {
  const fn = useServerFn(fetchCommentary);
  const activeCommentaryId = useViewerStore((s) => s.activeCommentaryId);
  const q = useQuery({
    queryKey: ["commentary", kind, dafRef],
    queryFn: () => fn({ data: { kind, ref: dafRef } }),
    staleTime: 1000 * 60 * 60 * 24,
  });
  const english = kind === "Rashi" ? "Rashi" : "Tosafot";
  const matches: CommentaryComment[] = (q.data?.comments ?? []).filter(
    (c) => c.segmentIndex === segmentIndex,
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      {q.isLoading && (
        <p className="text-sm text-ink-soft">Loading {english}…</p>
      )}
      {q.isError && (
        <p className="text-sm text-destructive">Couldn't load {english}.</p>
      )}
      {q.data && matches.length === 0 && (
        <p className="text-sm">
          <em className="text-ink-soft">No {english} on this segment.</em>
        </p>
      )}
      {matches.length > 0 && (
        <div className="space-y-3">
          {matches.map((c) => (
            <div
              key={c.id}
              data-active={activeCommentaryId === c.id}
              className="rounded-md border border-rule bg-paper-soft/40 px-3 py-2 transition-colors data-[active=true]:border-ink/40 data-[active=true]:bg-paper-soft data-[active=true]:ring-1 data-[active=true]:ring-ink/20"
            >
              {c.english ? (
                <p
                  className="sefaria-translation text-sm leading-relaxed text-ink"
                  dangerouslySetInnerHTML={{ __html: c.english }}
                />
              ) : (
                <>
                  <p className="font-hebrew text-sm text-ink" dir="rtl">
                    <strong>{c.dh}</strong>
                    {c.body ? " – " : ""}
                    <span dangerouslySetInnerHTML={{ __html: c.body }} />
                  </p>
                  <p className="mt-1.5 text-xs italic text-ink-soft">
                    No English translation is currently available for this {english}.
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ConfidenceBar({ segment }: { segment: AnalyzedSegment }) {
  const pct = Math.round(segment.combinedConfidence * 100);
  const tier = pct >= 75 ? "high" : pct >= 55 ? "med" : "low";
  const barColor = tier === "high" ? "var(--c-answer)" : tier === "med" ? "var(--c-assumption)" : "var(--c-refutation)";
  const label = tier === "high" ? "Confident" : tier === "med" ? "Tentative" : "Uncertain";
  return (
    <div className="mt-1">
      <div className="flex items-center justify-between text-[11px] text-ink-soft">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-paper-soft">
        <div
          className="h-full"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-ink-soft">
        <span>Rule {Math.round(segment.ruleConfidence * 100)}%</span>
        <span>Grammar {Math.round(segment.grammarConfidence * 100)}%</span>
      </div>
      {segment.ambiguous && (
        <p className="mt-1 text-[10px] italic text-ink-soft">
          Label inferred from surrounding structure — English translation is ambiguous.
        </p>
      )}
    </div>
  );
}

function beginnerExplanation(s: AnalyzedSegment, parent: AnalyzedSegment | null): string {
  const cat = CATEGORIES[s.category];
  const ctx =
    s.category === "QUESTION" ? "The Gemara raises an objection (kushya) against the standing position."
    : s.category === "ANSWER" ? (
        s.mechanism === "okimta" ? "The Gemara defends by narrowing the case (okimta)."
        : s.mechanism === "tannai_hi" ? "The Gemara defends by splitting the sources between different tannaim."
        : s.mechanism === "chisurei_mechsera" ? "The Gemara defends by emending the text (chisurei mechsera)."
        : s.mechanism === "distinction" ? "The Gemara distinguishes the two cases (lo kashya)."
        : s.mechanism === "reinterpretation" ? "The Gemara re-reads the earlier words to defuse the difficulty."
        : "The Gemara resolves the difficulty (terutz).")
    : s.category === "PROOF" ? "A source is brought to support the claim."
    : s.category === "REFUTATION" ? "Fatal refutation (teyuvta) — the position is removed from the board."
    : s.category === "DIFFICULTY" ? "A difficulty (kashya) — the position is weakened but stays on the board."
    : s.category === "INQUIRY" ? "An open dilemma (ba'aya) is raised — not an objection, but a question seeking a ruling."
    : s.category === "PIVOT" ? "אלא — the Gemara discards the prior line and installs a new one."
    : s.category === "STORY" ? "A narrative is brought, often to derive a law."
    : s.category === "ASSUMPTION" ? "A hava-amina — provisional assumption staged to be overturned."
    : s.category === "CONCLUSION" ? (
        s.mechanism === "chiddush" ? "The chiddush (קא משמע לן) — the specific novelty being taught."
        : "The Gemara settles the matter (maskana).")
    : "A teaching is stated.";
  const link = parent
    ? ` It builds on the prior ${CATEGORIES[parent.category].english.toLowerCase()}.`
    : "";
  return `${cat.description} ${ctx}${link}`;
}

/**
 * Surfaces the full "Anatomy of a Sugya" metadata (move type, mechanism,
 * standing-position effect, provisional/severity/ambiguous flags, and the
 * running standing position after this move — per §0/§9).
 */
function DialecticalMove({
  segment,
  standing,
}: {
  segment: AnalyzedSegment;
  standing: string | null;
}) {
  const chips: { label: string; tone?: "warn" | "info" | "danger" | "neutral" }[] = [];
  if (segment.moveType) chips.push({ label: MOVE_TYPE_LABELS[segment.moveType], tone: "info" });
  if (segment.mechanism) chips.push({ label: `via ${MECHANISM_LABELS[segment.mechanism]}` });
  if (segment.standingEffect)
    chips.push({ label: STANDING_EFFECT_LABELS[segment.standingEffect] });
  if (segment.provisional) chips.push({ label: "provisional", tone: "warn" });
  if (segment.severity === "fatal") chips.push({ label: "fatal", tone: "danger" });
  if (segment.severity === "soft") chips.push({ label: "non-fatal", tone: "warn" });
  if (segment.unresolved) chips.push({ label: "teiku — unresolved", tone: "warn" });
  if (segment.ambiguous) chips.push({ label: "ambiguous", tone: "warn" });

  if (chips.length === 0 && !standing) return null;

  return (
    <section className="mt-4">
      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        Dialectical move
      </h4>
      {chips.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {chips.map((c, i) => (
            <span
              key={i}
              className={
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium " +
                (c.tone === "danger"
                  ? "border-[color:var(--c-refutation)]/40 bg-[color-mix(in_oklab,var(--c-refutation)_10%,transparent)] text-[color:var(--c-refutation)]"
                  : c.tone === "warn"
                    ? "border-[color:var(--c-difficulty)]/40 bg-[color-mix(in_oklab,var(--c-difficulty)_10%,transparent)] text-[color:var(--c-difficulty)]"
                    : c.tone === "info"
                      ? "border-[color:var(--c-statement)]/30 bg-[color-mix(in_oklab,var(--c-statement)_10%,transparent)] text-[color:var(--c-statement)]"
                      : "border-rule bg-paper-soft text-ink-soft")
              }
            >
              {c.label}
            </span>
          ))}
        </div>
      )}
      {segment.ambiguous && segment.ambiguousBetween && (
        <p className="mt-1.5 text-[11px] italic text-ink-soft">
          English is ambiguous between{" "}
          {segment.ambiguousBetween
            .map((m) => MOVE_TYPE_LABELS[m] ?? m)
            .join(" / ")}
          .
        </p>
      )}
      {standing && (
        <p className="mt-2 rounded-md border border-dashed border-rule bg-paper-soft/50 px-2.5 py-1.5 text-[11px] text-ink-soft">
          <span className="font-semibold text-ink">Standing position:</span>{" "}
          {standing}
        </p>
      )}
    </section>
  );
}