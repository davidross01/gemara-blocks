import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";

export const Route = createFileRoute("/legal/copyright")({
  head: () => ({
    meta: [
      { title: "Copyright Policy — Gemara Blocks" },
      {
        name: "description",
        content:
          "How Gemara Blocks handles its intellectual property and third-party Torah content.",
      },
      { property: "og:title", content: "Copyright Policy — Gemara Blocks" },
      {
        property: "og:description",
        content:
          "How Gemara Blocks handles its intellectual property and third-party Torah content.",
      },
    ],
  }),
  component: CopyrightPage,
});

function CopyrightPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            to="/legal"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Legal Information
          </Link>

          <LegalDoc title="Copyright Policy" effective="Effective January 1, 2026">
            <LegalSection title="1. Copyright Notice">
              <p>
                © 2026 Gemara Blocks. All Rights Reserved. This Copyright
                Policy explains what content Gemara Blocks owns, what content
                belongs to third parties, and how to report copyright concerns.
              </p>
            </LegalSection>

            <LegalSection title="2. Gemara Blocks Intellectual Property">
              <p>
                Gemara Blocks owns all rights, title, and interest in the
                following original works:
              </p>
              <ul>
                <li>The Gemara Blocks software and source code</li>
                <li>The user interface, visual design, and design system</li>
                <li>The Sugya Flow diagram engine and node visualizations</li>
                <li>
                  The AI systems, prompts, and rule-based segmentation logic
                </li>
                <li>
                  The dialectical taxonomy, category color system, and
                  colorblind-accessible visual language
                </li>
                <li>
                  All original educational visualizations and illustrations
                </li>
              </ul>
            </LegalSection>

            <LegalSection title="3. Third-Party Materials">
              <p>
                Gemara Blocks displays Torah source material that is not owned
                by Gemara Blocks. This content includes, but is not limited to:
              </p>
              <ul>
                <li>HebrewBooks PDF scans of the Vilna Shas</li>
                <li>Sefaria Hebrew and Aramaic Talmud text</li>
                <li>English translations of the Talmud</li>
                <li>Rashi commentary</li>
                <li>Tosafot commentary</li>
                <li>Other Torah source material and mefarshim</li>
              </ul>
              <p>
                All Torah source material remains the property of its
                respective copyright holders. Gemara Blocks claims no
                ownership over any third-party Torah content.
              </p>
            </LegalSection>

            <LegalSection title="4. HebrewBooks Attribution">
              <p>
                Scanned daf images displayed in the Daf View are sourced from{" "}
                <a
                  href="https://www.hebrewbooks.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  HebrewBooks.org
                </a>
                . These scans of the Vilna Shas are made available through
                HebrewBooks and remain subject to their terms and rights.
              </p>
            </LegalSection>

            <LegalSection title="5. Sefaria Attribution">
              <p>
                Hebrew and Aramaic Talmud text, English translations, Rashi,
                and Tosafot are provided by{" "}
                <a
                  href="https://www.sefaria.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  Sefaria
                </a>
                . The William Davidson Talmud translation is licensed under
                Creative Commons Attribution-NonCommercial (CC BY-NC 4.0).
              </p>
            </LegalSection>

            <LegalSection title="6. Copyright Infringement Process">
              <p>
                Gemara Blocks respects the intellectual property rights of
                others. If you believe that content displayed on Gemara Blocks
                infringes your copyright, please contact us with the following
                information:
              </p>
              <ul>
                <li>A description of the copyrighted work at issue</li>
                <li>The specific URL or location of the infringing content</li>
                <li>Your contact information</li>
                <li>
                  A statement, under penalty of perjury, that you are the
                  copyright owner or authorized to act on their behalf
                </li>
              </ul>
              <p>
                Upon receiving a valid notice, Gemara Blocks will review the
                claim and take appropriate action, which may include removal of
                the disputed content.
              </p>
            </LegalSection>

            <LegalSection title="7. Contact Information">
              <p>
                Copyright inquiries can be directed to the Gemara Blocks team
                through the contact channels provided on the Service.
              </p>
            </LegalSection>
          </LegalDoc>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}