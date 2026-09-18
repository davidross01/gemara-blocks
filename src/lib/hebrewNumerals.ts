/**
 * Convert a positive integer (1-999) to its standard Hebrew numeral
 * representation, using the conventional substitutions for 15 (טו) and
 * 16 (טז) and a geresh-free format suitable for daf labels (e.g. ל, טו, ק).
 */
export function toHebrewNumeral(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  const hundreds = ["", "ק", "ר", "ש", "ת", "תק", "תר", "תש", "תת", "תתק"];
  const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
  const ones = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
  let num = Math.floor(n);
  let out = "";
  if (num >= 1000) {
    // Rare for daf numbers; fall back to digits for safety.
    return String(n);
  }
  const h = Math.floor(num / 100);
  out += hundreds[h];
  num -= h * 100;
  if (num === 15) return out + "טו";
  if (num === 16) return out + "טז";
  const t = Math.floor(num / 10);
  out += tens[t];
  out += ones[num - t * 10];
  return out;
}

export const HEBREW_AMUD: Record<string, string> = { a: "א", b: "ב" };