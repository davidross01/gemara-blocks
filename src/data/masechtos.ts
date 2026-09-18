/**
 * Masechta metadata. `ref` is the Sefaria reference name used in API calls.
 * `lastDaf` is inclusive; first daf is always 2 (no amud aleph 1 in shas).
 */
export interface MasechtaMeta {
  slug: string;
  ref: string;
  english: string;
  hebrew: string;
  seder: string;
  lastDaf: number;
}

export const MASECHTOS: MasechtaMeta[] = [
  { slug: "berakhot", ref: "Berakhot", english: "Berachos", hebrew: "ברכות", seder: "Zeraim", lastDaf: 64 },
  { slug: "shabbat", ref: "Shabbat", english: "Shabbos", hebrew: "שבת", seder: "Moed", lastDaf: 157 },
  { slug: "eruvin", ref: "Eruvin", english: "Eruvin", hebrew: "עירובין", seder: "Moed", lastDaf: 105 },
  { slug: "pesachim", ref: "Pesachim", english: "Pesachim", hebrew: "פסחים", seder: "Moed", lastDaf: 121 },
  { slug: "yoma", ref: "Yoma", english: "Yoma", hebrew: "יומא", seder: "Moed", lastDaf: 88 },
  { slug: "sukkah", ref: "Sukkah", english: "Sukkah", hebrew: "סוכה", seder: "Moed", lastDaf: 56 },
  { slug: "beitzah", ref: "Beitzah", english: "Beitzah", hebrew: "ביצה", seder: "Moed", lastDaf: 40 },
  { slug: "rosh-hashanah", ref: "Rosh Hashanah", english: "Rosh Hashanah", hebrew: "ראש השנה", seder: "Moed", lastDaf: 35 },
  { slug: "taanit", ref: "Taanit", english: "Taanis", hebrew: "תענית", seder: "Moed", lastDaf: 31 },
  { slug: "megillah", ref: "Megillah", english: "Megillah", hebrew: "מגילה", seder: "Moed", lastDaf: 32 },
  { slug: "moed-katan", ref: "Moed Katan", english: "Moed Katan", hebrew: "מועד קטן", seder: "Moed", lastDaf: 29 },
  { slug: "chagigah", ref: "Chagigah", english: "Chagigah", hebrew: "חגיגה", seder: "Moed", lastDaf: 27 },
  { slug: "yevamot", ref: "Yevamot", english: "Yevamos", hebrew: "יבמות", seder: "Nashim", lastDaf: 122 },
  { slug: "ketubot", ref: "Ketubot", english: "Kesubos", hebrew: "כתובות", seder: "Nashim", lastDaf: 112 },
  { slug: "nedarim", ref: "Nedarim", english: "Nedarim", hebrew: "נדרים", seder: "Nashim", lastDaf: 91 },
  { slug: "nazir", ref: "Nazir", english: "Nazir", hebrew: "נזיר", seder: "Nashim", lastDaf: 66 },
  { slug: "sotah", ref: "Sotah", english: "Sotah", hebrew: "סוטה", seder: "Nashim", lastDaf: 49 },
  { slug: "gittin", ref: "Gittin", english: "Gittin", hebrew: "גיטין", seder: "Nashim", lastDaf: 90 },
  { slug: "kiddushin", ref: "Kiddushin", english: "Kiddushin", hebrew: "קידושין", seder: "Nashim", lastDaf: 82 },
  { slug: "bava-kamma", ref: "Bava Kamma", english: "Bava Kamma", hebrew: "בבא קמא", seder: "Nezikin", lastDaf: 119 },
  { slug: "bava-metzia", ref: "Bava Metzia", english: "Bava Metzia", hebrew: "בבא מציעא", seder: "Nezikin", lastDaf: 119 },
  { slug: "bava-batra", ref: "Bava Batra", english: "Bava Basra", hebrew: "בבא בתרא", seder: "Nezikin", lastDaf: 176 },
  { slug: "sanhedrin", ref: "Sanhedrin", english: "Sanhedrin", hebrew: "סנהדרין", seder: "Nezikin", lastDaf: 113 },
  { slug: "makkot", ref: "Makkot", english: "Makkos", hebrew: "מכות", seder: "Nezikin", lastDaf: 24 },
  { slug: "shevuot", ref: "Shevuot", english: "Shevuos", hebrew: "שבועות", seder: "Nezikin", lastDaf: 49 },
  { slug: "avodah-zarah", ref: "Avodah Zarah", english: "Avodah Zarah", hebrew: "עבודה זרה", seder: "Nezikin", lastDaf: 76 },
  { slug: "horayot", ref: "Horayot", english: "Horayos", hebrew: "הוריות", seder: "Nezikin", lastDaf: 14 },
  { slug: "zevachim", ref: "Zevachim", english: "Zevachim", hebrew: "זבחים", seder: "Kodashim", lastDaf: 120 },
  { slug: "menachot", ref: "Menachot", english: "Menachos", hebrew: "מנחות", seder: "Kodashim", lastDaf: 110 },
  { slug: "chullin", ref: "Chullin", english: "Chullin", hebrew: "חולין", seder: "Kodashim", lastDaf: 142 },
  { slug: "bekhorot", ref: "Bekhorot", english: "Bechoros", hebrew: "בכורות", seder: "Kodashim", lastDaf: 61 },
  { slug: "arakhin", ref: "Arakhin", english: "Arachin", hebrew: "ערכין", seder: "Kodashim", lastDaf: 34 },
  { slug: "temurah", ref: "Temurah", english: "Temurah", hebrew: "תמורה", seder: "Kodashim", lastDaf: 34 },
  { slug: "keritot", ref: "Keritot", english: "Kerisos", hebrew: "כריתות", seder: "Kodashim", lastDaf: 28 },
  { slug: "meilah", ref: "Meilah", english: "Meilah", hebrew: "מעילה", seder: "Kodashim", lastDaf: 22 },
  { slug: "niddah", ref: "Niddah", english: "Niddah", hebrew: "נדה", seder: "Tahoros", lastDaf: 73 },
];

export function getMasechta(slug: string): MasechtaMeta | undefined {
  return MASECHTOS.find((m) => m.slug === slug);
}

export function dafList(m: MasechtaMeta): number[] {
  const out: number[] = [];
  for (let i = 2; i <= m.lastDaf; i++) out.push(i);
  return out;
}

/**
 * Compute the next daf/amud within a masechta. Returns null when the user
 * is already on the last amud of the masechta.
 */
export function nextDaf(
  slug: string,
  daf: string | number,
  amud: string,
): { masechta: string; daf: string; amud: string; label: string } | null {
  const m = getMasechta(slug);
  if (!m) return null;
  const dafNum = typeof daf === "string" ? parseInt(daf, 10) : daf;
  if (!Number.isFinite(dafNum)) return null;
  const a = amud.toLowerCase();
  let nextDafNum = dafNum;
  let nextAmud: "a" | "b";
  if (a === "a") {
    nextAmud = "b";
  } else {
    nextDafNum = dafNum + 1;
    nextAmud = "a";
  }
  if (nextDafNum > m.lastDaf) return null;
  return {
    masechta: m.slug,
    daf: String(nextDafNum),
    amud: nextAmud,
    label: `${m.english} ${nextDafNum}${nextAmud}`,
  };
}

/**
 * Compute the previous daf/amud within a masechta. Returns null when the user
 * is on the first amud (2a) of the masechta.
 */
export function prevDaf(
  slug: string,
  daf: string | number,
  amud: string,
): { masechta: string; daf: string; amud: string; label: string } | null {
  const m = getMasechta(slug);
  if (!m) return null;
  const dafNum = typeof daf === "string" ? parseInt(daf, 10) : daf;
  if (!Number.isFinite(dafNum)) return null;
  const a = amud.toLowerCase();
  let prevDafNum = dafNum;
  let prevAmud: "a" | "b";
  if (a === "b") {
    prevAmud = "a";
  } else {
    prevDafNum = dafNum - 1;
    prevAmud = "b";
  }
  if (prevDafNum < 2) return null;
  return {
    masechta: m.slug,
    daf: String(prevDafNum),
    amud: prevAmud,
    label: `${m.english} ${prevDafNum}${prevAmud}`,
  };
}