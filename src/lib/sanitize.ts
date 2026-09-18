/**
 * Tiny allowlist HTML sanitizer for Sefaria translation snippets.
 * Preserves emphasis tags (notably <b>, which Sefaria uses to mark words that
 * are direct translations of the Hebrew/Aramaic, vs. unbolded words the
 * translator added for readability). Strips everything else, including any
 * attributes, scripts, and unknown tags.
 */
const ALLOWED = new Set(["b", "strong", "i", "em", "sup", "sub", "br", "small", "u"]);

export function sanitizeSefariaHtml(input: string): string {
  if (!input) return "";
  // Drop script/style blocks entirely.
  let s = input.replace(/<\/?(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  // Replace any tag: keep if allowlisted (stripping attributes), else remove.
  s = s.replace(/<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/g, (_m, tag: string) => {
    const t = tag.toLowerCase();
    if (!ALLOWED.has(t)) return "";
    const isClose = _m.startsWith("</");
    if (t === "br") return "<br>";
    return isClose ? `</${t}>` : `<${t}>`;
  });
  return s;
}