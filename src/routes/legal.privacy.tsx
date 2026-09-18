import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Gemara Blocks" },
      {
        name: "description",
        content: "Privacy Policy for Gemara Blocks — coming soon.",
      },
      { property: "og:title", content: "Privacy Policy — Gemara Blocks" },
      {
        property: "og:description",
        content: "Privacy Policy for Gemara Blocks — coming soon.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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

          <div className="rounded-2xl border border-rule bg-paper-soft/40 p-10 text-center sm:p-16">
            <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-ink/5 text-ink">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-3 text-lg text-ink-soft">Coming Soon</p>
            <p className="mx-auto mt-4 max-w-md text-sm text-ink-soft/80">
              We're preparing a clear, plain-language Privacy Policy that
              explains how Gemara Blocks handles your data. Check back soon.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}