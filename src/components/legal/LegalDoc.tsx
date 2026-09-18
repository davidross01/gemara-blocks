import type { ReactNode } from "react";

export function LegalDoc({
  title,
  effective,
  children,
}: {
  title: string;
  effective?: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-rule bg-paper-soft/40 p-6 sm:p-10">
      <header className="mb-8 border-b border-rule pb-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {effective && (
          <p className="mt-2 text-sm text-ink-soft">{effective}</p>
        )}
      </header>
      <div className="space-y-8">{children}</div>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl font-semibold text-ink sm:text-2xl">
        {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft [&_a]:text-ink [&_a]:underline [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}