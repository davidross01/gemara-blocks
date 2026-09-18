import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Gemara Blocks" },
      {
        name: "description",
        content:
          "The terms and conditions governing your use of Gemara Blocks.",
      },
      { property: "og:title", content: "Terms of Use — Gemara Blocks" },
      {
        property: "og:description",
        content: "The terms and conditions governing your use of Gemara Blocks.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
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

          <LegalDoc title="Terms of Use" effective="Effective January 1, 2026">
            <LegalSection title="1. Purpose">
              <p>
                Gemara Blocks is a visual learning platform designed to help
                bochurim, beginner learners, and any student of Torah understand
                the logical structure of a sugya through color-coded blocks,
                flow diagrams, and educational visualizations. By accessing or
                using Gemara Blocks (the "Service"), you agree to be bound by
                these Terms of Use.
              </p>
            </LegalSection>

            <LegalSection title="2. Intellectual Property">
              <p>
                All software, source code, user interface, visual design, Sugya
                Flow diagrams, segmentation logic, taxonomy, AI systems, and
                original educational technology in Gemara Blocks are the
                exclusive property of Gemara Blocks and are protected by
                copyright and other intellectual property laws.
              </p>
              <p>
                You may not copy, modify, distribute, sell, or reverse-engineer
                any part of the Service without prior written permission.
              </p>
            </LegalSection>

            <LegalSection title="3. Third-Party Content">
              <p>
                Gemara Blocks displays Torah source material, including Talmudic
                text, translations, Rashi, Tosafot, and scanned daf images.
                These materials are the property of their respective copyright
                holders, including but not limited to{" "}
                <a
                  href="https://www.hebrewbooks.org"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-ink"
                >
                  HebrewBooks.org
                </a>{" "}
                and{" "}
                <a
                  href="https://www.sefaria.org"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-ink"
                >
                  Sefaria
                </a>
                . Gemara Blocks claims no ownership over any third-party Torah
                content and provides attribution to the original sources.
              </p>
            </LegalSection>

            <LegalSection title="4. AI Content Disclaimer">
              <p>
                Gemara Blocks uses artificial intelligence and rule-based
                algorithms to produce segmentation, categorization, and
                explanatory content. AI-generated interpretations are provided
                for learning purposes only and may contain errors, omissions,
                or oversimplifications.
              </p>
              <p>
                Gemara Blocks is <strong>not a substitute for a Rebbi or
                halachic authority</strong>. Users should always consult a
                qualified Torah scholar for authoritative learning and psak.
              </p>
            </LegalSection>

            <LegalSection title="5. Acceptable Use">
              <p>
                You agree to use Gemara Blocks in a manner consistent with its
                educational purpose and with respect for the sanctity of Torah
                learning. You may not use the Service to:
              </p>
              <ul>
                <li>Violate any applicable law or regulation.</li>
                <li>
                  Attempt to breach, disrupt, or interfere with the Service's
                  systems or security.
                </li>
                <li>
                  Scrape, harvest, or bulk-download content in ways that
                  infringe the rights of third-party copyright holders.
                </li>
                <li>Misrepresent AI-generated content as authoritative psak.</li>
              </ul>
            </LegalSection>

            <LegalSection title="6. Disclaimer of Warranty">
              <p>
                The Service is provided on an "as is" and "as available" basis
                without warranties of any kind, either express or implied,
                including but not limited to warranties of merchantability,
                fitness for a particular purpose, accuracy, or non-infringement.
              </p>
            </LegalSection>

            <LegalSection title="7. Limitation of Liability">
              <p>
                To the fullest extent permitted by law, Gemara Blocks and its
                creators shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages arising out of or
                in connection with your use of the Service, including reliance
                on AI-generated interpretations of Torah content.
              </p>
            </LegalSection>

            <LegalSection title="8. Changes to Terms">
              <p>
                Gemara Blocks may update these Terms of Use from time to time.
                Continued use of the Service after changes are posted
                constitutes your acceptance of the revised Terms.
              </p>
            </LegalSection>

            <LegalSection title="9. Contact Information">
              <p>
                Questions about these Terms of Use can be directed to the
                Gemara Blocks team through the contact channels provided on the
                Service.
              </p>
            </LegalSection>
          </LegalDoc>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}