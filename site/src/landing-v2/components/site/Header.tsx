import { Link } from "../../router";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { nav } from "../../lib/site-data";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-md border border-primary/40 bg-primary/10 font-display text-sm font-bold text-primary">
        HSI
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block font-display text-sm font-semibold">Human Super Intelligence</span>
        <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Scientific Intelligence Platform
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:px-10">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((g) => (
            <div key={g.label} className="group relative">
              <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground group-focus-within:text-foreground">
                {g.label} <ChevronDown className="size-3.5" />
              </button>
              <div className="invisible absolute left-0 top-full w-80 pt-2 opacity-0 transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="glass rounded-xl p-2">
                  {g.items.map((i) => (
                    <Link
                      key={i.to}
                      to={i.to}
                      className="block rounded-lg px-3 py-2.5 hover:bg-accent"
                    >
                      <span className="block text-sm font-medium">{i.label}</span>
                      <span className="block text-xs text-muted-foreground">{i.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/platform/workbench"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Explore HSI
          </Link>
          <Link
            to="/early-access"
            className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Request Early Access
          </Link>
        </div>
        <button
          className="lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background px-5 pb-8 lg:hidden">
          {nav.map((g) => (
            <div key={g.label} className="border-b border-border/60 py-4">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {g.label}
              </p>
              {g.items.map((i) => (
                <Link
                  key={i.to}
                  to={i.to}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-base"
                >
                  {i.label}
                </Link>
              ))}
            </div>
          ))}
          <Link
            to="/early-access"
            onClick={() => setOpen(false)}
            className="mt-6 block rounded-md bg-primary px-4 py-3 text-center font-medium text-primary-foreground"
          >
            Request Early Access
          </Link>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-5 md:px-8">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Understand biology. Resolve uncertainty. Advance discovery.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-signal">
            Research platform in development · capabilities labelled by status
          </p>
        </div>
        {nav
          .slice(0, 3)
          .concat(nav.slice(3))
          .map((g) =>
            g.label === "Science" ? null : (
              <div key={g.label}>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {g.label}
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {g.items.map((i) => (
                    <li key={i.to}>
                      <Link to={i.to} className="text-foreground/80 hover:text-primary">
                        {i.label}
                      </Link>
                    </li>
                  ))}
                  {g.label === "Solutions" && (
                    <li>
                      <Link to="/science" className="text-foreground/80 hover:text-primary">
                        Scientific domains
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            ),
          )}
      </div>
      <div className="border-t border-border/60 py-6 text-center font-mono text-xs text-muted-foreground">
        © 2026 Human Super Intelligence · HSI supports scientific judgement, it does not replace it.
      </div>
    </footer>
  );
}
