import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link, SiteLink } from "../../router";
import { footerColumns, mainLinks, platformMenu } from "../../lib/site-data";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid size-8 place-items-center rounded-md border border-primary/40 bg-primary/10 font-display text-xs font-bold text-primary">HSI</span>
      <span className="font-display text-[15px] font-semibold tracking-tight">Human Super Intelligence</span>
    </Link>
  );
}

const linkClass = "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground";

function PlatformMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-controls="platform-menu" onClick={() => setOpen((v) => !v)} className={`${linkClass} flex items-center gap-1`}>
        Platform <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div id="platform-menu" className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-card p-2 shadow-xl">
          {platformMenu.map((i) => (
            <Link key={i.to} to={i.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 hover:bg-accent">
              <span className="block text-sm font-medium">{i.label}</span>
              <span className="block text-xs text-muted-foreground">{i.desc}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <PlatformMenu />
          {mainLinks.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <SiteLink to="/sign-in" className={`${linkClass} whitespace-nowrap`}>
            Sign in
          </SiteLink>
          <Link to="/contact" className="whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Request access
          </Link>
        </div>
        <button type="button" className="inline-flex h-11 w-11 items-center justify-center lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background px-5 pb-8 lg:hidden">
          <p className="pt-4 text-xs font-medium text-muted-foreground">Platform</p>
          {platformMenu.map((i) => (
            <Link key={i.to} to={i.to} onClick={() => setOpen(false)} className="block py-2 text-base">
              {i.label}
            </Link>
          ))}
          <div className="mt-3 border-t border-border/60 pt-2">
            {mainLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-base">
                {l.label}
              </Link>
            ))}
            <SiteLink to="/sign-in" onClick={() => setOpen(false)} className="block py-2 text-base">
              Sign in
            </SiteLink>
          </div>
          <Link to="/contact" onClick={() => setOpen(false)} className="mt-5 block rounded-md bg-primary px-4 py-3 text-center font-medium text-primary-foreground">
            Request access
          </Link>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-14 md:px-8 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            A research tool in development. It does not give clinical advice and does not process patient data.
          </p>
        </div>
        {footerColumns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-sm font-medium">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-muted-foreground hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">© 2026 Human Super Intelligence</div>
    </footer>
  );
}
