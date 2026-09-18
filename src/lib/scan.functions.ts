import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ ref: z.string().min(1) });

export interface DafScan {
  ref: string;
  imageUrl: string | null;
  manuscriptTitle: string | null;
  source: string | null;
}

/**
 * Fetch a scanned daf image (Bomberg/Vilna-style pressing) from Sefaria's
 * manuscripts API. Prefers the Bomberg (Venice) 1523 pressing — the direct
 * typographic ancestor of the Vilna Shas tzuras hadaf.
 */
export const fetchDafScan = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<DafScan> => {
    const url = `https://www.sefaria.org/api/manuscripts/${encodeURIComponent(data.ref)}`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) {
      return { ref: data.ref, imageUrl: null, manuscriptTitle: null, source: null };
    }
    const json = (await res.json()) as Array<{
      image_url?: string;
      manuscript_slug?: string;
      manuscript?: { title?: string; source?: string };
    }>;
    if (!Array.isArray(json) || json.length === 0) {
      return { ref: data.ref, imageUrl: null, manuscriptTitle: null, source: null };
    }
    // Prefer the Romm Vilna pressing (1880-86 CE) — the canonical Vilna Shas
    // tzuras hadaf. Fall back to Bomberg (Venice 1523), then the first
    // available manuscript.
    const vilna = json.find((m) => (m.manuscript_slug || "").includes("vilna"));
    const bomberg = json.find((m) => (m.manuscript_slug || "").includes("bomberg"));
    const picked = vilna ?? bomberg ?? json[0];
    return {
      ref: data.ref,
      imageUrl: picked.image_url ?? null,
      manuscriptTitle: picked.manuscript?.title ?? null,
      source: picked.manuscript?.source ?? null,
    };
  });