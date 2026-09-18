import type { Category } from "@/lib/categories";
import type { Mechanism } from "./types";

export interface MarkerDef {
  marker: string;
  category: Category;
  /** 0..1 — how strongly this marker signals the category */
  weight: number;
  /**
   * Sub-mechanism carried by this specific marker — e.g. "הכא במאי עסקינן"
   * signals a terutz-by-okimta, "חסורי מחסרא" signals emendation, etc.
   * See taxonomy §4 ("Terutz mechanisms") and §3 ("Kushya mechanisms").
   */
  mechanism?: Mechanism;
}

/**
 * Gemara marker dictionary. Ordered roughly by specificity — longer
 * phrases are matched first so that "תא שמע" wins over "שמע".
 *
 * The taxonomy in "Anatomy of a Sugya" distinguishes several move-types
 * that English translation collapses. In particular:
 *   - קשיא   → non-fatal DIFFICULTY (position stays on the board)
 *   - תיובתא → fatal REFUTATION (position is removed)
 *   - בעיא   → open INQUIRY (not an objection)
 *   - אלא    → structural PIVOT (retires the prior line)
 * Markers below encode these distinctions at the Aramaic layer, which is
 * more reliable than the flattened English rendering.
 */
const RAW_MARKERS: MarkerDef[] = [
  // Questions / challenges (kushya family — §3)
  { marker: "מתיב", category: "QUESTION", weight: 0.9 },
  { marker: "מיתיבי", category: "QUESTION", weight: 0.92 },
  { marker: "איתיביה", category: "QUESTION", weight: 0.92 },
  { marker: "ורמינהו", category: "QUESTION", weight: 0.95 },
  { marker: "רמי", category: "QUESTION", weight: 0.6 },
  { marker: "איני", category: "QUESTION", weight: 0.85 },
  // Probing (§2)
  { marker: "מאי טעמא", category: "QUESTION", weight: 0.75 },
  { marker: "מנא הני מילי", category: "QUESTION", weight: 0.9 },
  { marker: "מנלן", category: "QUESTION", weight: 0.85 },
  { marker: "במאי קמיפלגי", category: "QUESTION", weight: 0.85 },
  { marker: "פשיטא", category: "QUESTION", weight: 0.75, mechanism: "redundancy" },
  { marker: "למה לי", category: "QUESTION", weight: 0.75, mechanism: "redundancy" },
  { marker: "למאי הלכתא", category: "QUESTION", weight: 0.75, mechanism: "redundancy" },
  { marker: "אי הכי", category: "QUESTION", weight: 0.75, mechanism: "reductio" },
  // Dchiya — deflecting a proof rather than answering an objection (§5)
  { marker: "מי דמי", category: "QUESTION", weight: 0.8, mechanism: "dchiya" },
  { marker: "דילמא", category: "QUESTION", weight: 0.6, mechanism: "dchiya" },
  { marker: "דלמא", category: "QUESTION", weight: 0.6, mechanism: "dchiya" },

  // Open inquiry (ba'aya) — NOT an objection. §7
  { marker: "איבעיא להו", category: "INQUIRY", weight: 0.98 },
  { marker: "בעי רב", category: "INQUIRY", weight: 0.85 },
  { marker: "בעי רבי", category: "INQUIRY", weight: 0.85 },
  { marker: "בעא מיניה", category: "INQUIRY", weight: 0.9 },
  { marker: "תיקו", category: "INQUIRY", weight: 0.98 },
  { marker: "תיבעי", category: "INQUIRY", weight: 0.8 },

  // Proofs / supports (raya — §5)
  { marker: "תא שמע", category: "PROOF", weight: 0.95 },
  { marker: "ת״ש", category: "PROOF", weight: 0.95 },
  { marker: 'ת"ש', category: "PROOF", weight: 0.95 },
  { marker: "דתניא", category: "PROOF", weight: 0.85 },
  { marker: "דתנן", category: "PROOF", weight: 0.85 },
  { marker: "תניא", category: "PROOF", weight: 0.8 },
  { marker: "תנן", category: "PROOF", weight: 0.8 },
  { marker: "תניא כוותיה", category: "PROOF", weight: 0.95, mechanism: "tannaitic_support" },
  { marker: "תנו רבנן", category: "PROOF", weight: 0.85 },
  { marker: "ת״ר", category: "PROOF", weight: 0.85 },
  { marker: 'ת"ר', category: "PROOF", weight: 0.85 },
  { marker: "מנא ליה", category: "PROOF", weight: 0.7 },

  // Answers / resolutions (terutz — §4). Each is tagged with the specific
  // mechanism it invokes: okimta, tannai_hi, chisurei_mechsera, distinction,
  // reinterpretation. These are exactly the distinctions the taxonomy asks
  // us to preserve rather than flattening to a generic "answer".
  { marker: "לא קשיא", category: "ANSWER", weight: 0.95, mechanism: "distinction" },
  { marker: "הא ר", category: "ANSWER", weight: 0.6, mechanism: "tannai_hi" },
  { marker: "הא מני", category: "ANSWER", weight: 0.9, mechanism: "tannai_hi" },
  { marker: "תנאי היא", category: "ANSWER", weight: 0.95, mechanism: "tannai_hi" },
  { marker: "הכא במאי עסקינן", category: "ANSWER", weight: 0.95, mechanism: "okimta" },
  { marker: "כי תניא ההיא", category: "ANSWER", weight: 0.85, mechanism: "okimta" },
  { marker: "חסורי מחסרא והכי קתני", category: "ANSWER", weight: 0.98, mechanism: "chisurei_mechsera" },
  { marker: "חסורי מחסרא", category: "ANSWER", weight: 0.95, mechanism: "chisurei_mechsera" },
  { marker: "כי קאמר", category: "ANSWER", weight: 0.8, mechanism: "reinterpretation" },
  { marker: "הכי קאמר", category: "ANSWER", weight: 0.85, mechanism: "reinterpretation" },
  { marker: "אמר לך", category: "ANSWER", weight: 0.7 },

  // Structural pivot (§6). אלא retires the prior attempted line and installs
  // a new one. It is NOT a mere "answer" — treating it as such loses the
  // hava-amina → maskana arc.
  { marker: "אלא אמר", category: "PIVOT", weight: 0.95 },
  { marker: "אלא", category: "PIVOT", weight: 0.7 },

  // Fatal refutation (teyuvta — §3.5). Removes the position from the board.
  { marker: "תיובתא דר", category: "REFUTATION", weight: 0.99 },
  { marker: "תיובתא", category: "REFUTATION", weight: 0.98 },

  // Non-fatal difficulty (kashya — §3.5). Position stays on the board,
  // weakened but not overturned. Explicitly separated from teyuvta.
  { marker: "קשיא", category: "DIFFICULTY", weight: 0.9 },

  // Conclusion / chiddush (maskana — §8)
  { marker: "קא משמע לן", category: "CONCLUSION", weight: 0.9, mechanism: "chiddush" },
  { marker: "קמ״ל", category: "CONCLUSION", weight: 0.9, mechanism: "chiddush" },
  { marker: 'קמ"ל', category: "CONCLUSION", weight: 0.9, mechanism: "chiddush" },
  { marker: "שמע מינה", category: "CONCLUSION", weight: 0.85 },
  { marker: "ש״מ", category: "CONCLUSION", weight: 0.85 },
  { marker: 'ש"מ', category: "CONCLUSION", weight: 0.85 },
  { marker: "אלמא", category: "CONCLUSION", weight: 0.75 },

  // Story
  { marker: "מעשה", category: "STORY", weight: 0.9 },
  { marker: "פעם אחת", category: "STORY", weight: 0.85 },

  // Assumption (hava amina — §6). Marks provisional claims staged to be
  // retired later. Segments tagged from these markers get `provisional: true`.
  { marker: "סלקא דעתך", category: "ASSUMPTION", weight: 0.9 },
  { marker: "ס״ד", category: "ASSUMPTION", weight: 0.85 },
  { marker: "מהו דתימא", category: "ASSUMPTION", weight: 0.9 },
  { marker: "הוה אמינא", category: "ASSUMPTION", weight: 0.95 },
  { marker: "אמינא", category: "ASSUMPTION", weight: 0.55 },

  // Statements (memra — §1)
  { marker: "אמר רב", category: "STATEMENT", weight: 0.75 },
  { marker: "אמר רבי", category: "STATEMENT", weight: 0.75 },
  { marker: "אמר רבא", category: "STATEMENT", weight: 0.8 },
  { marker: "אמר אביי", category: "STATEMENT", weight: 0.8 },
  { marker: "אמר ליה", category: "STATEMENT", weight: 0.6 },
  { marker: "אמר מר", category: "STATEMENT", weight: 0.7 },
];

export const MARKERS: MarkerDef[] = RAW_MARKERS.sort(
  (a, b) => b.marker.length - a.marker.length,
);

/**
 * English marker dictionary — uses the William Davidson translation's
 * stock connector phrases (often italicized in Sefaria) as a second
 * signal layer when Hebrew/Aramaic markers are ambiguous or missing.
 */
const RAW_EN_MARKERS: MarkerDef[] = [
  // Questions / challenges (kushya)
  { marker: "the gemara raises an objection", category: "QUESTION", weight: 0.95 },
  { marker: "raised an objection", category: "QUESTION", weight: 0.9 },
  { marker: "raises a contradiction", category: "QUESTION", weight: 0.92 },
  { marker: "the gemara asks", category: "QUESTION", weight: 0.9 },
  { marker: "the gemara challenges", category: "QUESTION", weight: 0.9 },
  { marker: "what is the reason", category: "QUESTION", weight: 0.8 },
  { marker: "from where do we", category: "QUESTION", weight: 0.8 },
  { marker: "from where is this matter derived", category: "QUESTION", weight: 0.9 },
  { marker: "isn't it obvious", category: "QUESTION", weight: 0.8, mechanism: "redundancy" },
  { marker: "why do i need", category: "QUESTION", weight: 0.75, mechanism: "redundancy" },
  { marker: "if that is so", category: "QUESTION", weight: 0.75, mechanism: "reductio" },
  { marker: "is it comparable", category: "QUESTION", weight: 0.8, mechanism: "dchiya" },
  { marker: "perhaps", category: "QUESTION", weight: 0.4, mechanism: "dchiya" },
  { marker: "with regard to what do they disagree", category: "QUESTION", weight: 0.85 },
  { marker: "is that so", category: "QUESTION", weight: 0.7 },

  // Open inquiry (ba'aya) — genuine dilemma, NOT an objection
  { marker: "a dilemma was raised before", category: "INQUIRY", weight: 0.98 },
  { marker: "raised a dilemma", category: "INQUIRY", weight: 0.92 },
  { marker: "dilemma was raised", category: "INQUIRY", weight: 0.9 },
  { marker: "the dilemma shall stand unresolved", category: "INQUIRY", weight: 0.98 },
  { marker: "let it stand unresolved", category: "INQUIRY", weight: 0.95 },
  { marker: "the question shall stand", category: "INQUIRY", weight: 0.9 },

  // Proofs / supports
  { marker: "come and hear", category: "PROOF", weight: 0.95 },
  { marker: "as it is taught in a baraita", category: "PROOF", weight: 0.9 },
  { marker: "as we learned in a mishna", category: "PROOF", weight: 0.9 },
  { marker: "a baraita is taught in accordance", category: "PROOF", weight: 0.95, mechanism: "tannaitic_support" },
  { marker: "as it is taught", category: "PROOF", weight: 0.8 },
  { marker: "as it is written", category: "PROOF", weight: 0.75 },
  { marker: "as it is stated", category: "PROOF", weight: 0.75 },
  { marker: "the sages taught", category: "PROOF", weight: 0.85 },
  { marker: "we learned in a mishna", category: "PROOF", weight: 0.85 },

  // Answers / resolutions (terutz — tagged by mechanism where possible)
  { marker: "the gemara answers", category: "ANSWER", weight: 0.95 },
  { marker: "the gemara responds", category: "ANSWER", weight: 0.9 },
  { marker: "this is not difficult", category: "ANSWER", weight: 0.95, mechanism: "distinction" },
  { marker: "with what are we dealing here", category: "ANSWER", weight: 0.95, mechanism: "okimta" },
  { marker: "here we are dealing with", category: "ANSWER", weight: 0.9, mechanism: "okimta" },
  { marker: "this is missing and this is what it is teaching", category: "ANSWER", weight: 0.98, mechanism: "chisurei_mechsera" },
  { marker: "the mishna is incomplete and this is what it is teaching", category: "ANSWER", weight: 0.98, mechanism: "chisurei_mechsera" },
  { marker: "in accordance with the opinion of", category: "ANSWER", weight: 0.6, mechanism: "tannai_hi" },
  { marker: "this is a dispute between tanna'im", category: "ANSWER", weight: 0.95, mechanism: "tannai_hi" },
  { marker: "could have said to you", category: "ANSWER", weight: 0.75 },
  { marker: "this is what he is saying", category: "ANSWER", weight: 0.8, mechanism: "reinterpretation" },
  { marker: "when he said", category: "ANSWER", weight: 0.65 },

  // Structural pivot (אלא). English "rather" is the near-universal rendering.
  { marker: "rather", category: "PIVOT", weight: 0.7 },

  // Fatal refutation (teyuvta). English collapses this into "difficulty"
  // phrasing, so we lean on the explicit "conclusive refutation" tag from
  // the Davidson translation and let the pipeline's severity heuristic
  // reclassify bare "difficulty" phrases against surrounding structure.
  { marker: "the refutation", category: "REFUTATION", weight: 0.98 },
  { marker: "is indeed a conclusive refutation", category: "REFUTATION", weight: 0.98 },
  { marker: "conclusive refutation", category: "REFUTATION", weight: 0.95 },

  // Non-fatal difficulty (kashya). Kept distinct from REFUTATION per §3.5.
  { marker: "this poses a difficulty", category: "DIFFICULTY", weight: 0.85 },
  { marker: "this is difficult", category: "DIFFICULTY", weight: 0.8 },
  { marker: "it is difficult", category: "DIFFICULTY", weight: 0.75 },

  // Conclusion
  { marker: "conclude from", category: "CONCLUSION", weight: 0.9 },
  { marker: "learn from", category: "CONCLUSION", weight: 0.75 },
  { marker: "apparently", category: "CONCLUSION", weight: 0.7 },
  { marker: "this teaches us", category: "CONCLUSION", weight: 0.85, mechanism: "chiddush" },

  // Story
  { marker: "there was an incident", category: "STORY", weight: 0.92 },
  { marker: "on one occasion", category: "STORY", weight: 0.85 },

  // Assumption (hava amina) — provisional claims to be retired
  { marker: "it could enter your mind", category: "ASSUMPTION", weight: 0.92 },
  { marker: "might enter your mind", category: "ASSUMPTION", weight: 0.9 },
  { marker: "one might have thought", category: "ASSUMPTION", weight: 0.9 },
  { marker: "i might have thought", category: "ASSUMPTION", weight: 0.9 },
  { marker: "lest you say", category: "ASSUMPTION", weight: 0.9 },

  // Statements (attribution leads)
  { marker: "rava said", category: "STATEMENT", weight: 0.78 },
  { marker: "abaye said", category: "STATEMENT", weight: 0.78 },
  { marker: "rav said", category: "STATEMENT", weight: 0.7 },
  { marker: "rabbi", category: "STATEMENT", weight: 0.45 },
  { marker: "he said to him", category: "STATEMENT", weight: 0.6 },
];

export const EN_MARKERS: MarkerDef[] = RAW_EN_MARKERS.sort(
  (a, b) => b.marker.length - a.marker.length,
);

/** Lowercase + strip HTML/italic markup + collapse whitespace. */
export function normalizeEnglish(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Strip HTML/nikud noise that interferes with marker matching. */
export function normalizeHebrew(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u0591-\u05C7]/g, "") // nikud + cantillation
    .replace(/\s+/g, " ")
    .trim();
}