import type { Category } from "@/lib/categories";

/**
 * The full taxonomy move-type vocabulary from
 * "Anatomy of a Sugya" §1–§8. This lives alongside the coarser `Category`
 * (which drives visual color-coding) and captures the specific dialectical
 * move a segment performs.
 */
export type MoveType =
  | "memra"
  | "mishnah_baraita"
  | "maaseh"
  | "probe"          // mai / mai ta'ama / mena hanei milei / peshita / lama li
  | "kushya"         // objection
  | "baaya"          // open dilemma (ibaya lehu)
  | "teiku"          // unresolved dilemma
  | "hava_amina"     // provisional wrong-thought
  | "terutz"         // resolution
  | "dchiya"         // deflection of a proof
  | "reaya"          // proof (tannaitic support, derasha, sevara)
  | "ela_pivot"      // structural pivot — discards prior line
  | "kashya"         // difficulty left standing (non-fatal)
  | "teyuvta"        // decisive refutation (fatal)
  | "chiddush"       // ka mashma lan — the novel point
  | "maskana"        // settled conclusion
  | "diyuk";         // inference drawn from wording

/** How the move acts on the "standing position" (see §0 / §9). */
export type StandingEffect =
  | "introduces"
  | "probes"
  | "challenges"
  | "defends"
  | "supports"
  | "deflects"
  | "replaces"
  | "refutes"
  | "settles"
  | "inquires";

/** Sub-mechanism for terutz / kushya, per §4 and §3. */
export type Mechanism =
  | "okimta"          // narrow the case
  | "tannai_hi"       // attribute to different tannaim
  | "chisurei_mechsera" // emend the text
  | "distinction"     // la kashya — split the cases
  | "reinterpretation"
  | "dchiya"          // deflect a proof
  | "reductio"        // i hachi
  | "redundancy"      // lama li / peshita
  | "sevara"
  | "derasha"
  | "tannaitic_support" // tanya kevatei
  | "chiddush";       // ka mashma lan

export interface RawSegment {
  /** index into Sefaria segment array */
  index: number;
  hebrew: string;
  english: string;
}

export interface MarkerHit {
  marker: string;
  category: Category;
  weight: number;
  /** 0..1 confidence contributed */
  confidence: number;
  mechanism?: Mechanism;
}

export interface AnalyzedSegment extends RawSegment {
  id: string;
  category: Category;
  markers: MarkerHit[];
  ruleConfidence: number;
  grammarConfidence: number;
  combinedConfidence: number;
  reasoning: string;
  parentId: string | null;
  /** child segment ids */
  children: string[];
  /** for flow-map layout */
  level: number;
  /** Specific dialectical move — finer-grained than `category`. */
  moveType?: MoveType;
  /** Sub-mechanism for terutz/kushya (okimta, tannai_hi, etc.). */
  mechanism?: Mechanism;
  /** Effect of this move on the running standing position. */
  standingEffect?: StandingEffect;
  /**
   * True iff this claim belongs to the hava-amina lineage — i.e. it is only
   * provisionally true and will be retired by a later אלא or תיובתא. Follows
   * the §6 "hypothesis → conclusion" arc.
   */
  provisional?: boolean;
  /** For kashya vs teyuvta — did the sugya explicitly abandon the position? */
  severity?: "soft" | "fatal";
  /** For a ba'aya that ended in teiku. */
  unresolved?: boolean;
  /**
   * When the source is English translation and the underlying Aramaic could
   * be one of several distinct moves, flag it so the reader knows the label
   * is a best-effort inference rather than a certain classification.
   */
  ambiguous?: boolean;
  /** Alternative candidate move-types when `ambiguous` is true. */
  ambiguousBetween?: MoveType[];
}

export interface SugyaTree {
  ref: string;
  segments: AnalyzedSegment[];
  /** id -> segment for O(1) lookup */
  byId: Record<string, AnalyzedSegment>;
  /** segment ids in display order */
  order: string[];
  /**
   * The running standing position — one entry per segment, describing what
   * is currently held to be true after that move. Populated by the pipeline
   * (or overwritten by AI verification) per §9 step 3.
   */
  standingPositions?: string[];
}