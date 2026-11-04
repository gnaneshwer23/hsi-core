import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { PRODUCT_NAME } from "../lib/brand";
import { PRIMARY_NAV_CTA, PRIMARY_NAV_LINKS, isPublicMarketingPath } from "../lib/primaryNav";

const ctaArrow = (
  <svg className="nav-link-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const creamMasthead = isPublicMarketingPath(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        document.querySelector<HTMLButtonElement>(".nav-toggle")?.focus();
      }
    };
    if (open) document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className={`nav${isHome ? " home-nav" : ""}${scrolled ? " scrolled" : ""}`}>
      <div className="nav-inner">
        <Link
          to="/"
          className={`brand${creamMasthead ? " brand-expanded" : ""}`}
          aria-label={`${PRODUCT_NAME} home`}
        >
          <span className="brand-mark" aria-hidden="true">
            H
          </span>
          <span className="brand-wordmark">
            <span className="brand-name">{PRODUCT_NAME}</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {PRIMARY_NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/sign-in" className="nav-sign-in">Sign in</Link>

        <Link to={PRIMARY_NAV_CTA.to} className="nav-cta">
          <span className="nav-cta-label">
            <span>Explore</span>
            <span>products</span>
          </span>
          {ctaArrow}
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-controls="primary-menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div id="primary-menu" className={`nav-drawer${open ? " open" : ""}`}>
        <NavLink to="/" onClick={() => setOpen(false)}>
          Home
        </NavLink>
        {PRIMARY_NAV_LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}>
            {l.label}
          </NavLink>
        ))}
        <NavLink to="/sign-in" className="nav-drawer-sign-in" onClick={() => setOpen(false)}>Sign in</NavLink>
        <Link
          to={PRIMARY_NAV_CTA.to}
          className="nav-cta nav-drawer-cta"
          onClick={() => setOpen(false)}
        >
          <span className="nav-cta-label">
            <span>Explore</span>
            <span>products</span>
          </span>
          {ctaArrow}
        </Link>
      </div>
    </header>
  );
}
