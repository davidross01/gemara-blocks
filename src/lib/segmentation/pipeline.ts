import type {
  AnalyzedSegment,
  MoveType,
  RawSegment,
  StandingEffect,
  SugyaTree,
} from "./types";
import { ruleClassify } from "./rules";
import { grammarValidate, inferParents } from "./grammar";
import { CATEGORIES, type Category } from "@/lib/categories";

/**
 * Run the rule + grammar pipeline over canonical Sefaria segments and produce
 * a SugyaTree. AI verification is applied separately and merged in later.
 */
export function buildSugyaTree(ref: string, raw: RawSegment[]): SugyaTree {
  const rule = raw.map(ruleClassify);
  const cats = rule.map((r) => r.category);
  const grammarConf = grammarValidate(cats);
  const parentIdx = inferParents(cats);

  const ids = raw.map((_, i) => `seg-${i}`);

  // Compute level by walking from parents
  const levels: number[] = [];
  for (let i = 0; i < raw.length; i++) {
    const p = parentIdx[i];
    levels.push(p === null ? 0 : (levels[p] ?? 0) + 1);
  }

  const segments: AnalyzedSegment[] = raw.map((r, i) => {
    const ruleConf = rule[i].confidence;
    const grammarC = grammarConf[i];
    let combined = ruleConf * 0.6 + grammarC * 0.4;
    // Very short segments carry very little evidence either way. Cap
    // their reported confidence so the UI signals uncertainty on
    // 2–3-word fragments (attribution tails, page breaks, headers).
    const words = (r.hebrew || "").split(/\s+/).filter(Boolean).length;
    if (words < 4) combined = Math.min(combined, 0.6);
    combined = Math.round(combined * 100) / 100;
    const markers = rule[i].markers;
    const reasonBits: string[] = [];
    if (markers.length > 0) {
      reasonBits.push(`Marker${markers.length > 1 ? "s" : ""}: ${markers.map((m) => `"${m.marker}"`).join(", ")}`);
    } else {
      reasonBits.push("No explicit marker found — defaulted by context.");
    }
    reasonBits.push(`Flow validity: ${(grammarC * 100).toFixed(0)}%.`);

    const category = rule[i].category;
    const mechanism = markers.find((m) => m.category === category && m.mechanism)?.mechanism;
    const moveType = deriveMoveType(category, mechanism);
    const standingEffect = deriveStandingEffect(category);

    return {
      ...r,
      id: ids[i],
      category,
      markers,
      ruleConfidence: ruleConf,
      grammarConfidence: grammarC,
      combinedConfidence: combined,
      reasoning: reasonBits.join(" "),
      parentId: parentIdx[i] === null ? null : ids[parentIdx[i] as number],
      children: [],
      level: levels[i],
      moveType,
      mechanism,
      standingEffect,
    };
  });

  // Fill children
  for (const s of segments) {
    if (s.parentId) {
      const parent = segments.find((p) => p.id === s.parentId);
      if (parent) parent.children.push(s.id);
    }
  }

  // -------------------------------------------------------------------------
  // Post-pass: hava-amina lineage, teyuvta vs kashya severity, and pivot
  // retirement — per §6 (HA→Maskana arc), §3.5 (kashya vs teyuvta), and §6
  // (אלא pivot). Because we are working from English translation, severity
  // is inferred structurally rather than lexically: a DIFFICULTY hardens to
  // fatal (REFUTATION) only if the sugya then pivots (אלא) or explicitly
  // replaces the position, and stays "soft" otherwise.
  // -------------------------------------------------------------------------
  markProvisionalLineage(segments);
  reclassifyDifficultySeverity(segments);
  applyPivotRetirement(segments);
  // Ambiguity flagged by the severity post-pass should show up in the
  // confidence bar, since the label itself is a structural guess.
  for (const s of segments) {
    if (s.ambiguous) {
      s.combinedConfidence = Math.round(Math.min(s.combinedConfidence, 0.7) * 100) / 100;
    }
  }
  const standingPositions = computeStandingPositions(segments);

  const byId: Record<string, AnalyzedSegment> = {};
  for (const s of segments) byId[s.id] = s;

  return { ref, segments, byId, order: ids, standingPositions };
}

// --------------------------- helpers ------------------------------

function deriveMoveType(category: Category, mechanism?: string): MoveType | undefined {
  switch (category) {
    case "STATEMENT": return "memra";
    case "STORY": return "maaseh";
    case "ASSUMPTION": return "hava_amina";
    case "INQUIRY": return "baaya";
    case "PIVOT": return "ela_pivot";
    case "PROOF": return "reaya";
    case "DIFFICULTY": return "kashya";
    case "REFUTATION": return "teyuvta";
    case "CONCLUSION": return mechanism === "chiddush" ? "chiddush" : "maskana";
    case "ANSWER": return "terutz";
    case "QUESTION":
      // A question with a probe/redundancy/reductio mechanism is still a
      // probing move (mai/lama li), not a full kushya.
      if (mechanism === "redundancy" || mechanism === "reductio") return "probe";
      if (mechanism === "dchiya") return "dchiya";
      return "kushya";
  }
}

function deriveStandingEffect(category: Category): StandingEffect | undefined {
  switch (category) {
    case "STATEMENT": return "introduces";
    case "STORY": return "introduces";
    case "ASSUMPTION": return "introduces";
    case "INQUIRY": return "inquires";
    case "QUESTION": return "challenges";
    case "DIFFICULTY": return "challenges";
    case "REFUTATION": return "refutes";
    case "PIVOT": return "replaces";
    case "ANSWER": return "defends";
    case "PROOF": return "supports";
    case "CONCLUSION": return "settles";
  }
}

/**
 * Walk forward through the sugya. Any statement/answer whose lineage begins
 * inside a hava-amina block (ASSUMPTION) or that is later retired by an
 * אלא pivot or a teyuvta gets `provisional: true`. This mirrors §6 of the
 * taxonomy: only maskana-level claims are non-provisional.
 */
function markProvisionalLineage(segments: AnalyzedSegment[]) {
  let inHavaAmina = false;
  for (const s of segments) {
    if (s.category === "ASSUMPTION") { inHavaAmina = true; s.provisional = true; continue; }
    // A conclusion / pivot / refutation closes an open hava-amina window.
    if (s.category === "CONCLUSION" || s.category === "PIVOT" || s.category === "REFUTATION") {
      inHavaAmina = false;
      continue;
    }
    if (inHavaAmina && (s.category === "STATEMENT" || s.category === "ANSWER" || s.category === "PROOF")) {
      s.provisional = true;
    }
  }
  // Second pass: anything that is later retired by a PIVOT is provisional.
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].category !== "PIVOT") continue;
    for (let j = i - 1; j >= 0; j--) {
      const prev = segments[j];
      if (prev.category === "STATEMENT" || prev.category === "ANSWER" || prev.category === "ASSUMPTION") {
        prev.provisional = true;
      }
      // Stop at the last kushya / difficulty — that's the trigger for the pivot.
      if (prev.category === "QUESTION" || prev.category === "DIFFICULTY") break;
    }
  }
}

/**
 * Kashya vs teyuvta severity.
 *
 * The Aramaic marker "תיובתא" already routes to REFUTATION with severity
 * "fatal". A bare "קשיא" routes to DIFFICULTY with severity "soft". The
 * ambiguous case is a DIFFICULTY segment that is immediately followed by a
 * PIVOT / replacement STATEMENT and the original position never returns —
 * per the taxonomy's structural test, that difficulty was effectively
 * fatal. We upgrade it to REFUTATION and flag it as ambiguous so the UI
 * can surface the inference.
 */
function reclassifyDifficultySeverity(segments: AnalyzedSegment[]) {
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (s.category === "REFUTATION") { s.severity = "fatal"; continue; }
    if (s.category !== "DIFFICULTY") continue;
    s.severity = "soft";
    const next = segments[i + 1];
    const next2 = segments[i + 2];
    const pivots = next?.category === "PIVOT" || next2?.category === "PIVOT";
    if (pivots) {
      s.severity = "fatal";
      s.ambiguous = true;
      s.ambiguousBetween = ["kashya", "teyuvta"];
      s.reasoning += " Reclassified as fatal because the sugya pivots (אלא) immediately after; the underlying Aramaic is likely תיובתא rather than קשיא.";
    }
  }
}

/**
 * A PIVOT (אלא) discards the immediately-preceding attempted line. We
 * record that structurally by pointing the pivot's parent at the retired
 * segment (already done by inferParents) and marking retired segments as
 * provisional (done above). This function is a hook for future logic.
 */
function applyPivotRetirement(_segments: AnalyzedSegment[]) { /* no-op today */ }

/**
 * Compute a very lightweight running standing-position string per segment,
 * per §9 step 3. This is intentionally coarse — a heuristic label — since
 * a faithful reconstruction requires deeper structural analysis.
 */
function computeStandingPositions(segments: AnalyzedSegment[]): string[] {
  const out: string[] = [];
  let current = "—";
  for (const s of segments) {
    switch (s.category) {
      case "STATEMENT": current = "memra on the table"; break;
      case "ASSUMPTION": current = "provisional hava-amina in play"; break;
      case "QUESTION": current = "position under kushya"; break;
      case "INQUIRY": current = "open ba'aya (no position yet)"; break;
      case "DIFFICULTY": current = "position weakened by kashya"; break;
      case "ANSWER": current = "position defended by terutz"; break;
      case "PROOF": current = "position supported by raya"; break;
      case "REFUTATION": current = "position refuted (teyuvta) — off the board"; break;
      case "PIVOT": current = "prior line retired (אלא) — new line proposed"; break;
      case "CONCLUSION": current = "settled maskana"; break;
      case "STORY": current = "ma'aseh brought as data"; break;
    }
    out.push(current);
  }
  return out;
}