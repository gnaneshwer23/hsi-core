import { HsiIdentity } from "./HsiIdentity";
import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { authBaseUrl, hsiAuth } from "../lib/hsiAuth";
import {
  PRIMARY_NAV_LINKS,
  PRIMARY_NAV_CTA,
  AUDIENCE_NAV_LINKS,
  isPublicMarketingPath,
  isAccountPath,
  isAudienceNavActive,
} from "../lib/primaryNav";

export function Nav() {
  const [open, setOpen] = useState(false),
    [scrolled, setScrolled] = useState(false),
    [signedIn, setSignedIn] = useState(false),
    [audienceOpen, setAudienceOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null),
    drawer = useRef<HTMLDivElement>(null),
    audienceBtn = useRef<HTMLButtonElement>(null),
    audiencePanel = useRef<HTMLDivElement>(null);
  const audienceMenuId = useId();
  const { pathname } = useLocation();
  const workspace = !isPublicMarketingPath(pathname) && !isAccountPath(pathname);
  const audienceActive = isAudienceNavActive(pathname);

  useEffect(() => {
    setOpen(false);
    setAudienceOpen(false);
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

  useEffect(() => {
    if (!audienceOpen) return;
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (audiencePanel.current?.contains(t) || audienceBtn.current?.contains(t)) return;
      setAudienceOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAudienceOpen(false);
        audienceBtn.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [audienceOpen]);

  const beforeAudience = PRIMARY_NAV_LINKS.filter((l) => l.to === "/" || l.to === "/how-it-works");
  const afterAudience = PRIMARY_NAV_LINKS.filter((l) => l.to !== "/" && l.to !== "/how-it-works");

  return (
    <header className={`hsi-nav${scrolled ? " is-scrolled" : ""}${workspace ? " hsi-nav-workspace" : ""}`}>
      <div className="hsi-nav-inner">
        <Link to="/" className="hsi-wordmark" aria-label="Human Super Intelligence home">
          <HsiIdentity />
        </Link>
        <nav aria-label="Primary" className="hsi-desktop-nav">
          {beforeAudience.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
          <div className="hsi-audience-menu">
            <button
              type="button"
              ref={audienceBtn}
              className={audienceActive ? "active" : undefined}
              aria-expanded={audienceOpen}
              aria-controls={audienceMenuId}
              onClick={() => setAudienceOpen((v) => !v)}
            >
              Audiences
            </button>
            <div
              id={audienceMenuId}
              ref={audiencePanel}
              hidden={!audienceOpen}
              role="menu"
              aria-label="Audience pages"
            >
              <div id="audience-pages" hidden={!audienceOpen}>
                {AUDIENCE_NAV_LINKS.map((l) => (
                  <NavLink key={l.to} to={l.to} role="menuitem" onClick={() => setAudienceOpen(false)}>
                    {l.label}
                    <small>{l.note}</small>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
          {afterAudience.map((l) => (
            <NavLink key={l.to} to={l.to}>
              {l.label}
            </NavLink>
          ))}
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
            {beforeAudience.map((l) => (
              <NavLink key={l.to} to={l.to}>
                {l.label}
              </NavLink>
            ))}
            <div className="hsi-mobile-audience">
              <span>Audiences</span>
              {AUDIENCE_NAV_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to}>
                  {l.label}
                </NavLink>
              ))}
            </div>
            {afterAudience.map((l) => (
              <NavLink key={l.to} to={l.to}>
                {l.label}
              </NavLink>
            ))}
            <NavLink to={signedIn ? "/research/account" : "/sign-in"}>
              {signedIn ? "Account" : "Sign in"}
            </NavLink>
            <Link to={PRIMARY_NAV_CTA.to}>{PRIMARY_NAV_CTA.label}</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
