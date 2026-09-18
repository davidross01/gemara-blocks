import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Network, BookOpen, Compass } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Legend } from "@/components/viewer/Legend";
import { MASECHTOS } from "@/data/masechtos";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gemara Blocks — See the Gemara, don't just read it." },
      { name: "description", content: "An interactive Vilna Shas: color-coded sugya structure, beginner explanations, and a visual flow map of every shakla v'tarya." },
      { property: "og:title", content: "Gemara Blocks" },
      { property: "og:description", content: "The visual way to learn Gemara." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <BySeder />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_50%_-10%,color-mix(in_oklab,var(--c-statement)_12%,transparent),transparent)]" />
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper-soft/60 px-3 py-1 text-xs text-ink-soft">
            <Sparkles className="h-3 w-3" style={{ color: "var(--c-statement)" }} />
            Vilna Shas, with the structure made visible
          </span>
          <h1 className="mt-5 font-serif text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
            See the Gemara,<br />
            <span className="italic text-ink-soft">don't just read it.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-ink-soft sm:text-lg">
            A traditional daf — Gemara in the center, Rashi and Tosafos on the margins — with a rules + AI engine
            that maps every claim, question, proof, and conclusion in the sugya.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/sugya/$masechta/$daf/$amud"
              params={{ masechta: "berakhot", daf: "2", amud: "a" }}
            >
              <Button size="lg" className="bg-ink text-paper hover:bg-ink/90">
                Open Berachos 2a
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Link
              to="/sugya/$masechta/$daf/$amud"
              params={{ masechta: "bava-metzia", daf: "2", amud: "a" }}
            >
              <Button size="lg" variant="outline">Try Bava Metzia 2a</Button>
            </Link>
          </div>
          <div className="mt-10 flex justify-center"><Legend /></div>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: BookOpen, title: "A real Vilna daf", body: "Gemara in the center, Rashi and Tosafos in the margins — the page you already know, layered with quiet color and interactivity." },
    { icon: Network, title: "Hybrid sugya engine", body: "Rule-based markers + Gemara grammar + an AI verification pass identify statement, question, proof, refutation, and conclusion — each with a confidence score." },
    { icon: Compass, title: "Beginner-first guidance", body: "Plain-English explanations, a conceptual illustration for each segment, and a tree-style flow map you can click around to follow the shakla v'tarya." },
  ];
  return (
    <section className="border-t border-rule bg-paper-soft/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-3">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title}>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-paper">
              <Icon className="h-4 w-4" />
            </span>
            <h3 className="mt-4 font-serif text-xl text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BySeder() {
  const sedarim = ["Zeraim", "Moed", "Nashim", "Nezikin", "Kodashim", "Tahoros"];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <h2 className="font-serif text-3xl text-ink">Pick a masechta</h2>
      <p className="mt-1 text-ink-soft">All 37 masechtos of Shas, loaded live from Sefaria.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sedarim.map((seder) => (
          <div key={seder} className="rounded-2xl border border-rule bg-card p-5">
            <div className="text-xs uppercase tracking-wide text-ink-soft">Seder</div>
            <h3 className="mt-1 font-serif text-lg text-ink">{seder}</h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {MASECHTOS.filter((m) => m.seder === seder).map((m) => (
                <li key={m.slug}>
                  <Link
                    to="/sugya/$masechta/$daf/$amud"
                    params={{ masechta: m.slug, daf: "2", amud: "a" }}
                    className="rounded-full border border-rule bg-paper px-2.5 py-1 text-xs text-ink-soft transition hover:border-ink hover:text-ink"
                  >
                    {m.english}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
