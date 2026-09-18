import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sanitizeSefariaHtml } from "./sanitize";

const Input = z.object({
  kind: z.enum(["Rashi", "Tosafot"]),
  ref: z.string().min(1), // e.g. "Berakhot.2a"
});

export interface CommentaryComment {
  id: string;
  /** index into the gemara segment array this comment is anchored to */
  segmentIndex: number;
  subIndex: number;
  /** full sanitized HTML (DH + body) */
  hebrew: string;
  /** Dibur HaMatchil (lead phrase) */
  dh: string;
  /** body text after the DH dash */
  body: string;
  /** Sefaria English translation, sanitized HTML. May be empty. */
  english: string;
}

export interface DafCommentary {
  ref: string;
  kind: "Rashi" | "Tosafot";
  comments: CommentaryComment[];
}

/** Split a Rashi/Tosafot comment into Dibur HaMatchil + body. Sefaria's
 * Vilna edition uses " – " (en-dash, space-separated) between the DH and the
 * commentary body. Fall back to first ~3 words if no dash is found. */
function splitDH(text: string): { dh: string; body: string } {
  const stripped = text.replace(/<[^>]+>/g, "");
  const m = stripped.match(/^([\s\S]*?)\s[–—-]\s([\s\S]*)$/);
  if (m && m[1].length < 200) {
    return { dh: m[1].trim(), body: m[2].trim() };
  }
  const words = stripped.split(/\s+/);
  return { dh: words.slice(0, 3).join(" "), body: words.slice(3).join(" ") };
}

/** Fetch every Rashi or Tosafot comment on a given daf and split each one
 * into Dibur HaMatchil + body for display. */
export const fetchCommentary = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<DafCommentary> => {
    const fullRef = `${data.kind} on ${data.ref}`;
    const url = `https://www.sefaria.org/api/v3/texts/${encodeURIComponent(fullRef)}?version=hebrew&version=english`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return { ref: data.ref, kind: data.kind, comments: [] };
    const json = (await res.json()) as {
      versions?: { language?: string; text?: unknown }[];
    };
    const versions = json.versions ?? [];
    const heVer = versions.find((v) => v.language === "he" || v.language === "hebrew") ?? versions[0];
    const enVer = versions.find((v) => v.language === "en" || v.language === "english");
    const text = (heVer?.text ?? []) as unknown;
    const enText = (enVer?.text ?? []) as unknown;
    const getEnglish = (i: number, j: number): string => {
      if (!Array.isArray(enText)) return "";
      const row = enText[i];
      if (!Array.isArray(row)) return "";
      const raw = row[j];
      if (typeof raw !== "string") return "";
      return sanitizeSefariaHtml(raw.replace(/\s+/g, " ").trim());
    };
    const comments: CommentaryComment[] = [];
    if (Array.isArray(text)) {
      text.forEach((seg, i) => {
        if (!Array.isArray(seg)) return;
        seg.forEach((raw, j) => {
          if (typeof raw !== "string") return;
          const cleaned = sanitizeSefariaHtml(raw.replace(/\s+/g, " ").trim());
          if (!cleaned) return;
          const { dh, body } = splitDH(cleaned);
          comments.push({
            id: `${data.kind.toLowerCase()}-${i}-${j}`,
            segmentIndex: i,
            subIndex: j,
            hebrew: cleaned,
            dh,
            body,
            english: getEnglish(i, j),
          });
        });
      });
    }
    return { ref: data.ref, kind: data.kind, comments };
  });