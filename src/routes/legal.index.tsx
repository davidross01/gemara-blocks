import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Copyright, Lock, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/legal/")({
  head: () => ({
    meta: [
      { title: "Legal Information — Gemara Blocks" },
      {
        name: "description",
        content:
          "Terms, policies, and copyright information for Gemara Blocks.",
      },
      { property: "og:title", content: "Legal Information — Gemara Blocks" },
      {
        property: "og:description",
        content: "Terms, policies, and copyright information for Gemara Blocks.",
      },
    ],
  }),
  component: LegalIndex,
});

function LegalIndex() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
          <header className="mb-10 text-center">
            <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Legal Information
            </h1>
            <p className="mt-3 text-base text-ink-soft sm:text-lg">
              Terms, policies, and copyright information for Gemara Blocks.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-soft/80">
              Learn about the terms governing the use of Gemara Blocks and our
              intellectual property policies.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <LegalCard
              icon={<FileText className="h-5 w-5" />}
              title="Terms of Use"
              description="The rules and conditions that govern your use of Gemara Blocks."
              to="/legal/terms"
              cta="View Terms"
            />
            <LegalCard
              icon={<Copyright className="h-5 w-5" />}
              title="Copyright Policy"
              description="How we handle our intellectual property and third-party Torah content."
              to="/legal/copyright"
              cta="View Copyright Policy"
            />
            <LegalCard
              icon={<Lock className="h-5 w-5" />}
              title="Privacy Policy"
              description="How we handle your data and privacy on Gemara Blocks."
              to="/legal/privacy"
              cta="Coming Soon"
              comingSoon
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function LegalCard({
  icon,
  title,
  description,
  to,
  cta,
  comingSoon,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  cta: string;
  comingSoon?: boolean;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-rule bg-paper-soft/50 p-6 transition hover:border-ink/30 hover:bg-paper-soft"
    >
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-ink/5 text-ink">
        {icon}
      </div>
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      <p className="mt-2 flex-1 text-sm text-ink-soft">{description}</p>
      <div
        className={`mt-5 inline-flex items-center gap-1.5 text-sm font-medium ${
          comingSoon ? "text-ink-soft" : "text-ink group-hover:gap-2"
        } transition-all`}
      >
        {cta}
        {!comingSoon && <ArrowRight className="h-4 w-4" />}
      </div>
    </Link>
  );
}