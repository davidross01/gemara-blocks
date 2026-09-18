import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { normalizeHebrew } from "./segmentation/markers";
import { sanitizeSefariaHtml } from "./sanitize";

const Input = z.object({
  ref: z.string().min(1), // e.g. "Berakhot.2a"
});

export interface SefariaDaf {
  ref: string;
  heRef: string;
  hebrew: string[];
  english: string[];
}

/**
 * Fetch a single Talmud daf from Sefaria's v3 API. Returns segment-aligned
 * Hebrew and English arrays.
 */
export const fetchSefariaDaf = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<SefariaDaf> => {
    const url = `https://www.sefaria.org/api/v3/texts/${encodeURIComponent(
      data.ref,
    )}?version=hebrew&version=english`;

    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) {
      throw new Error(`Sefaria request failed: ${res.status}`);
    }
    const json = (await res.json()) as {
      ref: string;
      heRef?: string;
      versions?: { language: string; text: unknown }[];
    };

    const flatten = (t: unknown): string[] => {
      if (typeof t === "string") return [t];
      if (Array.isArray(t)) return t.flatMap(flatten);
      return [];
    };

    let hebrew: string[] = [];
    let english: string[] = [];
    for (const v of json.versions ?? []) {
      const arr = flatten(v.text).map((s) => s.trim()).filter(Boolean);
      if (v.language === "he" || v.language === "hebrew") hebrew = arr;
      else if (v.language === "en" || v.language === "english") english = arr;
    }

    // Align lengths so segments stay paired
    const n = Math.max(hebrew.length, english.length);
    while (hebrew.length < n) hebrew.push("");
    while (english.length < n) english.push("");

    return {
      ref: json.ref ?? data.ref,
      heRef: json.heRef ?? data.ref,
      hebrew: hebrew.map(normalizeHebrew),
      // Preserve Sefaria's bold/italic emphasis (e.g. <b> marks direct
      // translation of the Aramaic vs. translator-added connective text).
      english: english.map((e) => sanitizeSefariaHtml(e.replace(/\s+/g, " ").trim())),
    };
  });