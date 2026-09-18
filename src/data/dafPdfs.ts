/**
 * Registry mapping a Sefaria `ref` (e.g. "Berakhot.2a") to a HebrewBooks-style
 * PDF asset and the page number inside that PDF that contains the daf.
 *
 * To add a daf:
 *   1. Upload the masechta PDF via `lovable-assets create --file <pdf>`.
 *   2. Write the resulting `.asset.json` under `src/assets/pdfs/`.
 *   3. Import it here and add an entry to MASECHTA_PDFS with the correct
 *      offset (offset = pdfPageOfDaf2a - 4).
 *
 * Any ref not in the registry falls back to the Sefaria Vilna scan viewer, so
 * the site keeps working while PDFs are being uploaded masechta-by-masechta.
 */

export interface DafPdf {
  /** Absolute URL (or asset URL) to the PDF file. */
  url: string;
  /** 1-indexed page number inside the PDF. */
  page: number;
  /** Optional label shown in the viewer chrome. */
  source?: string;
}

import berakhotPdf from "@/assets/pdfs/berakhot.pdf.asset.json";
import bavaBatraPdf from "@/assets/pdfs/bava_batra.pdf.asset.json";
import bavaKamaPdf from "@/assets/pdfs/bava_kama.pdf.asset.json";
import bavaMetziaPdf from "@/assets/pdfs/bava_metzia.pdf.asset.json";
import gitinPdf from "@/assets/pdfs/gitin.pdf.asset.json";
import kiddushinPdf from "@/assets/pdfs/kiddushin.pdf.asset.json";
import kesubosPdf from "@/assets/pdfs/kesubos.pdf.asset.json";
import megillahPdf from "@/assets/pdfs/megillah.pdf.asset.json";
import moedKatanPdf from "@/assets/pdfs/moed_katan.pdf.asset.json";
import sotahPdf from "@/assets/pdfs/sotah.pdf.asset.json";
import sukkahPdf from "@/assets/pdfs/sukkah.pdf.asset.json";

const SOURCE = "HebrewBooks — Vilna Shas";

// Each PDF has fixed front matter (title, TOCs, haskamos, mesorat hashas
// indices) before daf 2a. Once daf 2a is located visually, the mapping is
// deterministic:
//   page = offset + daf * 2 + (amud === "b" ? 1 : 0)
// where offset = pdfPageOfDaf2a - 4. Offsets below were verified against
// the daf 2a opening panel and the Hebrew folio letters (ב, ג, ד…) in the
// header of each uploaded PDF.
interface MasechtaPdfEntry {
  ref: string;
  url: string;
  offset: number;
  lastDaf: number;
  /** Whether the last daf has an amud ב page. Vilna sometimes ends on amud א. */
  lastAmudB?: boolean;
}

const MASECHTA_PDFS: MasechtaPdfEntry[] = [
  { ref: "Berakhot", url: berakhotPdf.url, offset: 14, lastDaf: 64, lastAmudB: false },
  { ref: "Sukkah", url: sukkahPdf.url, offset: -1, lastDaf: 56 },
  { ref: "Megillah", url: megillahPdf.url, offset: -1, lastDaf: 32 },
  { ref: "Moed Katan", url: moedKatanPdf.url, offset: -1, lastDaf: 29 },
  { ref: "Ketubot", url: kesubosPdf.url, offset: 10, lastDaf: 112 },
  { ref: "Sotah", url: sotahPdf.url, offset: -1, lastDaf: 49 },
  { ref: "Gittin", url: gitinPdf.url, offset: 10, lastDaf: 90 },
  { ref: "Kiddushin", url: kiddushinPdf.url, offset: 10, lastDaf: 82 },
  { ref: "Bava Kamma", url: bavaKamaPdf.url, offset: 10, lastDaf: 119 },
  { ref: "Bava Metzia", url: bavaMetziaPdf.url, offset: 10, lastDaf: 119 },
  { ref: "Bava Batra", url: bavaBatraPdf.url, offset: 10, lastDaf: 176 },
];

const REGISTRY: Record<string, DafPdf> = {};

for (const m of MASECHTA_PDFS) {
  for (let d = 2; d <= m.lastDaf; d++) {
    REGISTRY[`${m.ref}.${d}a`] = {
      url: m.url,
      page: m.offset + d * 2,
      source: SOURCE,
    };
    const includeB = d < m.lastDaf || m.lastAmudB !== false;
    if (includeB) {
      REGISTRY[`${m.ref}.${d}b`] = {
        url: m.url,
        page: m.offset + d * 2 + 1,
        source: SOURCE,
      };
    }
  }
}

export function getDafPdf(ref: string): DafPdf | null {
  return REGISTRY[ref] ?? null;
}
