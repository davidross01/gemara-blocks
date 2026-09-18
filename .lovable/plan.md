## Gemara Blocks — UI & Navigation Refinement Plan

A major refactor across three axes: **(1) remove auth**, **(2) rebuild the viewer around a Vilna-Shas-style daf**, and **(3) add a hybrid (rules + grammar + AI) segmentation engine** driving a tree-based Sugya model. Sefaria becomes the source of truth at runtime for any masechta/daf the user picks.

---

### 1. Remove Authentication

- Delete `src/routes/auth.tsx` and the entire `src/routes/_authenticated/` folder gate; flatten routes to top-level (`/dashboard`, `/sugya/$masechta/$daf/$amud`, etc.).
- Drop `requireSupabaseAuth` middleware from any server function used by the viewer; keep `attachSupabaseAuth` registration intact so future auth still works.
- Replace per-user progress/bookmark/notes server functions with **localStorage-backed** stores (same Zustand shape, persisted). DB tables stay in place but unused.
- Remove `SiteHeader` profile/sign-out UI; replace with the new masechta/daf navigator.

### 2. Navigation Bar (Masechta / Daf / Amud)

- New `MasechtaNavigator` component in the header with three shadcn `Select`s:
  - **Masechta** — full list of all 37 masechtos from the spec.
  - **Daf** — generated per-masechta from a `MASECHTA_META` table (`{ slug, hebrewName, firstDaf: 2, lastDaf: N }`).
  - **Amud** — `a` / `b`.
- Selection triggers `navigate({ to: "/sugya/$masechta/$daf/$amud" })` — no reload.
- Route file: `src/routes/sugya.$masechta.$daf.$amud.tsx` replaces the old `sugya.$slug` route.

### 3. Sefaria-Driven Content Loader

- New `src/lib/sefaria.ts` with `fetchDaf(masechta, daf, amud)` calling `https://www.sefaria.org/api/v3/texts/{Ref}?version=hebrew&version=english`.
- Wrap in a `createServerFn` (`src/lib/sefaria.functions.ts`) for SSR + caching; results cached in TanStack Query for 24h.
- Returns `{ hebrewSegments: string[], englishSegments: string[], ref }`.
- Pre-curated sugyos in `src/data/sugyos/` are deprecated — kept only as fallback demo data; live Sefaria fetch is primary.

### 4. Hybrid Segmentation Engine

New module `src/lib/segmentation/`:

```text
segmentation/
  markers.ts      — dictionary of Aramaic markers → {type, weight}
  rules.ts        — rule-based pass: scan segments, emit candidates + confidence
  grammar.ts      — state-machine flow validator (Statement→Question→Answer…)
  verifier.ts     — createServerFn calling Lovable AI (gemini-3-flash) to verify/adjust
  pipeline.ts     — orchestrates rules → grammar → AI; returns SugyaTree
  types.ts        — SegmentType, Segment, SugyaTree, ConfidenceBreakdown
```

**Segment types** (8): `statement | question | answer | proof | refutation | story | assumption | conclusion`.

**Pipeline**:
1. **Rule pass** — tokenize Sefaria Hebrew, match markers from `markers.ts`, emit `Segment[]` each with `ruleConfidence`.
2. **Grammar pass** — walk segments through a finite-state grammar that knows valid transitions; infer boundaries between sparse markers, set `grammarConfidence`.
3. **AI verification** — batch segments to a server function that asks Gemini to classify + reason; sets `aiConfidence` + may reassign type. Cached by `(ref, segmentHash)`.
4. **Combined confidence** = weighted avg (40% rule / 30% grammar / 30% AI); segments < 70% get a visual "uncertain" flag.

**SugyaTree** — recursive `{ id, type, hebrewRange:[start,end], children: Segment[], parentId, confidence, reasoning }`. Used by both the daf overlay and the flow map.

### 5. Vilna Shas Daf Renderer (Left Panel, 60%)

New `src/components/daf/VilnaDaf.tsx` — preserves the printed-page feel:

```text
┌─────────────────────────────────────┐
│  Rashi  │     Gemara (center)     │  Tosafos │
│ (inner) │   justified, Frank      │  (outer) │
│ Rashi   │   Ruhl Libre, large,    │  Tosafos │
│ script  │   wraps around          │  script  │
└─────────────────────────────────────┘
```

- CSS Grid `[rashi 1fr] [gemara 2.2fr] [tosafos 1fr]` on desktop; stacked on mobile.
- Center column uses **Frank Ruhl Libre** (already loaded) with no segment boxes — text flows as one block.
- Each Sefaria segment is wrapped in a `<span data-segment-id>` with subtle hover underline.
- Active segment gets a **translucent overlay** (`background: color-mix(in oklab, var(--color-X) 14%, transparent)`) — never an opaque box.
- Rashi/Tosafos columns pull commentary from Sefaria links API; rendered in `Vrinda`-style smaller serif. If unavailable for that daf, columns gracefully collapse.

### 6. Color Overlay System

Update `src/lib/categories.ts` to the new spec mapping:
| Type | Color |
|---|---|
| Statement (Memra) | Blue |
| Question (Kushiya) | Red |
| Answer (Terutz) | Green |
| Proof (Raya) | Purple |
| Refutation (Baya) | Orange |
| Story | Violet |
| Assumption | Gray |
| Conclusion (Teyku/Maskana) | Gold |

Confidence indicator = a small dot next to each badge (filled = high, hollow = uncertain). Never color-only — every segment always carries an icon + label in the side panel.

### 7. Right Panel (40%) — Dynamic Detail

Refactor `ExplanationPanel.tsx` to receive a `Segment` from the tree:
- **Badge** (type + confidence dot)
- **English translation** (Sefaria segment match)
- **Beginner explanation** (AI-generated, cached per segment hash)
- **Conceptual illustration** (existing `BlockIllustration` keyed by type — pre-generated set lives in `src/assets/illustrations/`)
- **Sugya context** — "This challenges the previous statement" derived from tree parent/children
- **Parent / children navigator** (clickable chips → activates that segment)
- **Notes** (localStorage)

### 8. Sugya Flow Map (Below)

- Keep React Flow viz, but feed it from `SugyaTree` (not the hand-curated blocks).
- Layout becomes tree-style (top-down hierarchical) rather than linear.
- Bidirectional sync via existing `viewerStore` — clicking a node highlights the daf span and scrolls the right panel.

### 9. State Management

`viewerStore` extended:
```ts
{ activeSegmentId, segments, tree, confidenceFilter, setActive, setTree }
```
A second `studyStore` (Zustand + `persist` middleware) holds notes/bookmarks/completion in localStorage keyed by `ref + segmentId`.

### 10. Files Touched (high-level)

**Delete**: `src/routes/auth.tsx`, `src/routes/_authenticated/*`, `src/lib/progress.functions.ts` (or stub).
**Create**: `src/lib/sefaria.ts`, `src/lib/sefaria.functions.ts`, `src/lib/segmentation/*` (6 files), `src/data/masechtos.ts`, `src/components/daf/VilnaDaf.tsx`, `src/components/daf/SegmentOverlay.tsx`, `src/components/site/MasechtaNavigator.tsx`, `src/routes/sugya.$masechta.$daf.$amud.tsx`, `src/stores/studyStore.ts`.
**Edit**: `src/routes/__root.tsx` (nav), `src/routes/index.tsx` (open landing → "Start learning"), `src/components/viewer/ExplanationPanel.tsx`, `src/components/viewer/FlowMap.tsx`, `src/lib/categories.ts`, `src/stores/viewerStore.ts`, `src/styles.css` (new color tokens, daf typography).

---

### Out of Scope (this pass)

- Real Rashi/Tosafos text rendering on *every* daf — depends on Sefaria link coverage; we'll render when present, gracefully degrade otherwise.
- Training a custom ML model — AI layer is Gemini verification only.
- Authoring/editing the SugyaTree — read-only this pass.
- Teacher mode rewrite — kept as-is, just unwrapped from `_authenticated`.

### Open Questions

1. **AI cost** — verifier runs per-segment on first load of a daf (cached after). OK to use Lovable AI credits for this on every new daf, or should AI verification be opt-in (a "Run AI analysis" button)?
2. **Rashi/Tosafos** — render real Sefaria commentary text in the side columns, or stylized placeholder columns (visual feel only) for the MVP?
3. **Confidence threshold** — flag segments below 70% as "uncertain", or expose a slider so the user sets it?
