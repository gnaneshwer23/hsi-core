import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { authBaseUrl, hsiAuth } from "../lib/hsiAuth";
import { PRIMARY_NAV_LINKS, PRIMARY_NAV_CTA, RESEARCH_NAV_LINKS } from "../lib/primaryNav";
export function Nav() {
  const [open, setOpen] = useState(false),
    [researchOpen, setResearchOpen] = useState(false),
    [scrolled, setScrolled] = useState(false),
    [signedIn, setSignedIn] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null),
    drawer = useRef<HTMLDivElement>(null),
    dropdown = useRef<HTMLDivElement>(null),
    researchButton = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
    setResearchOpen(false);
  }, [pathname]);
  useEffect(() => {
    let active = true;
    if (authBaseUrl)
      hsiAuth
        .session()
        .then((r) => {
          if (active) setSignedIn(!!r.data && !r.error);
        })
        .catch(() => {
          if (active) setSignedIn(false);
        });
    return () => {
      active = false;
    };
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!researchOpen) return;
    const close = (e: PointerEvent) => {
      if (!dropdown.current?.contains(e.target as Node)) setResearchOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setResearchOpen(false);
        researchButton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
    };
  }, [researchOpen]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const outside = [document.querySelector("main"), document.querySelector("footer.hsi-footer")].filter(
      Boolean,
    ) as HTMLElement[];
    const old = outside.map((el) => el.inert);
    outside.forEach((el) => {
      el.inert = true;
    });
    drawer.current?.querySelector<HTMLElement>("button,a")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        toggle.current?.focus();
      }
      if (e.key === "Tab") {
        const items = [...drawer.current!.querySelectorAll<HTMLElement>("button,a[href]")];
        const first = items[0],
          last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previous;
      outside.forEach((el, n) => {
        el.inert = old[n] ?? false;
      });
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  useEffect(() => {
    const media = window.matchMedia("(min-width:1151px)");
    const close = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);
  return (
    <header className={`hsi-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="hsi-nav-inner">
        <Link to="/" className="hsi-wordmark" aria-label="Human Super Intelligence home">
          <span aria-hidden="true" className="hsi-brand-symbol">
            H
          </span>
          <span>
            HSI<small>Human Super Intelligence</small>
          </span>
        </Link>
        <nav aria-label="Primary" className="hsi-desktop-nav">
          {PRIMARY_NAV_LINKS.map((l) =>
            l.to === "/research" ? (
              <div className="hsi-research-menu" ref={dropdown} key={l.to}>
                <button
                  ref={researchButton}
                  type="button"
                  aria-expanded={researchOpen}
                  aria-controls="research-pages"
                  className={RESEARCH_NAV_LINKS.some((r) => r.to === pathname) ? "active" : ""}
                  onClick={() => setResearchOpen((v) => !v)}
                >
                  Research <span aria-hidden="true">⌄</span>
                </button>
                <div id="research-pages" hidden={!researchOpen}>
                  {RESEARCH_NAV_LINKS.map((r) => (
                    <NavLink key={r.to} to={r.to} onClick={() => setResearchOpen(false)}>
                      {r.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink key={l.to} to={l.to}>
                {l.label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="hsi-header-actions">
          <Link className="hsi-signin" to={signedIn ? "/research/account" : "/sign-in"}>
            {signedIn ? "Account" : "Sign in"}
          </Link>
          <Link className="hsi-header-cta" to={PRIMARY_NAV_CTA.to}>
            {PRIMARY_NAV_CTA.label}
          </Link>
          <button
            className="hsi-menu-toggle"
            ref={toggle}
            aria-label="Open menu"
            aria-controls="public-menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div
          id="public-menu"
          className="hsi-mobile-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Public navigation"
          ref={drawer}
        >
          <div className="hsi-mobile-top">
            <span>Explore HSI</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => {
                setOpen(false);
                toggle.current?.focus();
              }}
            >
              Close ×
            </button>
          </div>
          <nav aria-label="Mobile navigation">
            <NavLink to="/">Home</NavLink>
            {PRIMARY_NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to}>
                {l.label}
              </NavLink>
            ))}
            <div className="hsi-mobile-research">
              <span>Research</span>
              {RESEARCH_NAV_LINKS.filter((l) => l.to !== "/research").map((l) => (
                <NavLink key={l.to} to={l.to}>
                  {l.label}
                </NavLink>
              ))}
            </div>
            <NavLink to={signedIn ? "/research/account" : "/sign-in"}>
              {signedIn ? "Account" : "Sign in"}
            </NavLink>
            <Link to="/contact">Request access</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
