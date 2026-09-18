import type { Category } from "@/lib/categories";
import type { MarkerHit, RawSegment } from "./types";
import { MARKERS, EN_MARKERS, normalizeHebrew, normalizeEnglish } from "./markers";

export interface RuleResult {
  category: Category;
  confidence: number;
  markers: MarkerHit[];
}

/**
 * Rule-based pass. Scan the segment for known Aramaic markers and produce a
 * dominant category + a list of all hits (for transparency).
 */
export function ruleClassify(segment: RawSegment): RuleResult {
  const text = normalizeHebrew(segment.hebrew);
  const en = normalizeEnglish(segment.english ?? "");
  const hits: MarkerHit[] = [];

  for (const def of MARKERS) {
    if (text.includes(def.marker)) {
      hits.push({
        marker: def.marker,
        category: def.category,
        weight: def.weight,
        confidence: def.weight,
        mechanism: def.mechanism,
      });
    }
  }

  if (en) {
    for (const def of EN_MARKERS) {
      if (en.includes(def.marker)) {
        // English (translation) markers are less reliable than the
        // underlying Aramaic — William Davidson often paraphrases and
        // collapses distinct moves into the same phrasing. Down-weight
        // English evidence to ~70% so a single Hebrew marker outranks a
        // single English marker for the same category.
        const w = def.weight * 0.7;
        hits.push({
          marker: `“${def.marker}” (EN)`,
          category: def.category,
          weight: w,
          confidence: w,
          mechanism: def.mechanism,
        });
      }
    }
  }

  if (hits.length === 0) {
    // No marker matched. A bare continuation is *usually* a memra
    // (STATEMENT) — that is the null hypothesis of a sugya. Emit a
    // moderate baseline rather than a punitive 0.3 so the confidence
    // bar reflects "no positive evidence" rather than "positive
    // evidence against". Very short fragments (attribution tails,
    // page breaks) get a lower floor.
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const base = wordCount < 4 ? 0.35 : 0.5;
    return { category: "STATEMENT", confidence: base, markers: [] };
  }

  // Aggregate evidence per category using probabilistic stacking:
  //   P(cat | markers) = 1 - Π_i (1 - w_i)
  // This rewards multiple agreeing markers without ever exceeding 1,
  // and lets two medium-strength markers (say 0.7 and 0.7 → 0.91)
  // outrank one strong marker (0.9) — which matches human intuition.
  const byCat: Record<string, number> = {};
  for (const h of hits) {
    const prev = byCat[h.category] ?? 0;
    byCat[h.category] = 1 - (1 - prev) * (1 - h.weight);
  }

  let bestCat: Category = "STATEMENT";
  let bestScore = 0;
  let runnerUp = 0;
  for (const [cat, score] of Object.entries(byCat)) {
    if (score > bestScore) {
      runnerUp = bestScore;
      bestScore = score;
      bestCat = cat as Category;
    } else if (score > runnerUp) {
      runnerUp = score;
    }
  }

  // Penalise the winner by the *margin* over the runner-up: if two
  // categories are almost tied (e.g. QUESTION 0.85 vs ANSWER 0.80),
  // the classification is genuinely ambiguous and confidence should
  // reflect that. Margin of 0 → 15% haircut; margin of 0.5+ → none.
  const margin = bestScore - runnerUp;
  const marginFactor = 0.85 + Math.min(0.15, margin * 0.3);
  const confidence = Math.min(0.98, bestScore * marginFactor);

  return { category: bestCat, confidence, markers: hits };
}