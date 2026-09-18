import type { Category } from "@/lib/categories";

/**
 * Valid logical transitions in a typical sugya. A high overlap between the
 * rule-based category and the grammar-allowed set yields a high
 * grammar confidence.
 */
const ALLOWED_NEXT: Record<Category, Category[]> = {
  // A memra can be probed, supported, doubted, or narrated around.
  STATEMENT: ["QUESTION", "DIFFICULTY", "INQUIRY", "PROOF", "STATEMENT", "ASSUMPTION", "STORY", "PIVOT"],
  // A kushya expects a terutz, but may also be answered by pivoting or
  // deflected, or — if it goes unanswered — hardens into a kashya/teyuvta.
  QUESTION: ["ANSWER", "PROOF", "ASSUMPTION", "REFUTATION", "DIFFICULTY", "PIVOT", "QUESTION"],
  ANSWER: ["QUESTION", "DIFFICULTY", "PROOF", "CONCLUSION", "STATEMENT", "PIVOT"],
  PROOF: ["REFUTATION", "DIFFICULTY", "ANSWER", "CONCLUSION", "QUESTION"],
  // Teyuvta is terminal for the refuted line; typically followed by a
  // replacement statement or a settled conclusion.
  REFUTATION: ["STATEMENT", "CONCLUSION", "PIVOT"],
  // Kashya is non-fatal: the sugya may keep going, try again, or move on.
  DIFFICULTY: ["ANSWER", "STATEMENT", "PIVOT", "CONCLUSION", "QUESTION"],
  // A ba'aya invites answers, proofs, or (if exhausted) teiku ≈ INQUIRY again.
  INQUIRY: ["ANSWER", "PROOF", "INQUIRY", "CONCLUSION", "STATEMENT"],
  // Ela discards the prior line and installs a new statement/answer.
  PIVOT: ["STATEMENT", "ANSWER", "QUESTION", "PROOF"],
  STORY: ["STATEMENT", "QUESTION", "CONCLUSION"],
  // Hava amina is provisional; it invites a challenge that will retire it.
  ASSUMPTION: ["QUESTION", "REFUTATION", "DIFFICULTY", "ANSWER", "PIVOT"],
  CONCLUSION: ["STATEMENT", "QUESTION", "INQUIRY"],
};

/**
 * Score how well a sequence of category labels obeys the Gemara flow grammar.
 * Returns per-segment confidence in [0..1].
 */
export function grammarValidate(cats: Category[]): number[] {
  return cats.map((cat, i) => {
    if (i === 0) {
      // No prior context — neutral prior. A first segment that already
      // opens with a strong marker (mishnah, memra, dilemma) will get
      // its confidence from the rule pass; the grammar pass has nothing
      // to add or subtract.
      return 0.75;
    }
    const prev = cats[i - 1];
    const allowed = ALLOWED_NEXT[prev] ?? [];
    if (allowed.includes(cat)) return 0.9;
    // Soft fallbacks — some transitions are unusual but not
    // *incoherent*. A fresh STATEMENT can follow almost anything (the
    // sugya turns to a new memra), a PROOF can be adduced at almost
    // any point, and a CONCLUSION can wrap up an unexpected thread.
    if (cat === "STATEMENT" || cat === "PROOF" || cat === "CONCLUSION") return 0.7;
    // Same-category continuation (e.g. two ANSWERs in a row expanding
    // the terutz) is common and shouldn't be treated as a violation.
    if (cat === prev) return 0.75;
    // Truly unexpected transition — but not impossible.
    return 0.5;
  });
}

/**
 * Suggest a parent for each segment based on simple flow:
 * - QUESTION attaches to nearest preceding STATEMENT/PROOF
 * - ANSWER / REFUTATION attaches to nearest preceding QUESTION
 * - PROOF attaches to nearest preceding STATEMENT or QUESTION
 * - CONCLUSION attaches to nearest preceding QUESTION/ANSWER
 * - default: previous segment
 */
export function inferParents(cats: Category[]): (number | null)[] {
  const parents: (number | null)[] = [];
  for (let i = 0; i < cats.length; i++) {
    if (i === 0) {
      parents.push(null);
      continue;
    }
    const cat = cats[i];
    const wants: Category[] =
      cat === "QUESTION" || cat === "DIFFICULTY" || cat === "ASSUMPTION"
        ? ["STATEMENT", "PROOF", "ANSWER", "PIVOT"] :
      cat === "ANSWER" || cat === "REFUTATION"
        ? ["QUESTION", "DIFFICULTY", "ASSUMPTION", "INQUIRY"] :
      cat === "PIVOT"
        // Ela retires the immediately-preceding attempted line.
        ? ["ANSWER", "STATEMENT", "ASSUMPTION"] :
      cat === "INQUIRY"
        ? ["STATEMENT", "PROOF"] :
      cat === "PROOF"
        ? ["STATEMENT", "QUESTION", "ANSWER", "DIFFICULTY"] :
      cat === "CONCLUSION"
        ? ["QUESTION", "DIFFICULTY", "ANSWER", "PROOF", "INQUIRY", "REFUTATION"] :
      [];

    let p: number | null = i - 1;
    if (wants.length > 0) {
      for (let j = i - 1; j >= 0; j--) {
        if (wants.includes(cats[j])) { p = j; break; }
      }
    }
    parents.push(p);
  }
  return parents;
}