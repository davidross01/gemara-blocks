import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-paper-soft/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-ink-soft sm:px-6">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif">Gemara Blocks — see the Gemara, don't just read it.</p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/legal/terms" className="hover:text-ink hover:underline">Terms of Use</Link>
            <Link to="/legal/copyright" className="hover:text-ink hover:underline">Copyright Policy</Link>
            <Link to="/legal/privacy" className="hover:text-ink hover:underline">Privacy Policy</Link>
          </nav>
        </div>
        <div className="space-y-3 border-t border-rule pt-4">
          <p className="text-xs">© 2026 Gemara Blocks. All Rights Reserved.</p>
          <p className="text-xs leading-relaxed text-ink-soft/80 max-w-4xl">
            Gemara Blocks owns the software, interface, AI tools, and original educational technology
            used in this application. Gemara texts, translations, commentaries, and scanned daf images
            remain the property of their respective copyright holders, including HebrewBooks and
            Sefaria. Gemara Blocks claims no ownership over third-party Torah content.
          </p>
          <p className="text-xs">
            Hebrew & translation © <a href="https://www.sefaria.org" className="underline hover:text-ink" target="_blank" rel="noreferrer">Sefaria</a> (William Davidson Edition, CC-BY-NC).
          </p>
        </div>
      </div>
    </footer>
  );
}