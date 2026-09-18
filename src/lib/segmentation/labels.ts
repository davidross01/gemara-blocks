import type { Mechanism, MoveType, StandingEffect } from "./types";

/**
 * Human-readable labels for the taxonomy vocabulary from "Anatomy of a
 * Sugya". Kept as string tables (rather than baked into components) so the
 * SegmentPanel, FlowMap, and future AI-verification UI all label moves
 * identically.
 */
export const MOVE_TYPE_LABELS: Record<MoveType, string> = {
  memra: "Memra",
  mishnah_baraita: "Mishnah / Baraita",
  maaseh: "Ma'aseh",
  probe: "Probe",
  kushya: "Kushya",
  baaya: "Ba'aya",
  teiku: "Teiku",
  hava_amina: "Hava Amina",
  terutz: "Terutz",
  dchiya: "Dchiya",
  reaya: "Ra'aya",
  ela_pivot: "Ela (Pivot)",
  kashya: "Kashya",
  teyuvta: "Teyuvta",
  chiddush: "Chiddush",
  maskana: "Maskana",
  diyuk: "Diyuk",
};

export const MECHANISM_LABELS: Record<Mechanism, string> = {
  okimta: "okimta",
  tannai_hi: "tannai hi",
  chisurei_mechsera: "chisurei mechsera",
  distinction: "distinction",
  reinterpretation: "reinterpretation",
  dchiya: "dchiya",
  reductio: "reductio",
  redundancy: "redundancy",
  sevara: "sevara",
  derasha: "derasha",
  tannaitic_support: "tannaitic support",
  chiddush: "chiddush",
};

export const STANDING_EFFECT_LABELS: Record<StandingEffect, string> = {
  introduces: "introduces claim",
  probes: "probes claim",
  challenges: "challenges claim",
  defends: "defends claim",
  supports: "supports claim",
  deflects: "deflects proof",
  replaces: "replaces line",
  refutes: "refutes claim",
  settles: "settles claim",
  inquires: "opens inquiry",
};