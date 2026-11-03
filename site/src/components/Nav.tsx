import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { PRODUCT_NAME, PRODUCT_SHORT } from "../lib/brand";

/**
 * Primary destinations — founder public IA.
 * Research / ISI entry via Products + contextual CTAs (not header clutter).
 * Status / Roadmap / Docs stay footer-only. Internal tools are not public navigation.
 */
const primaryLinks = [
  { to: "/platform", label: "Platform" },
  { to: "/products", label: "Products" },
  { to: "/science", label: "Science" },
  { to: "/how-it-works", label: "How It Works" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

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
          className={`brand${isHome ? " brand-expanded" : ""}`}
          aria-label={`${PRODUCT_NAME} home`}
        >
          <span className="brand-mark">H</span>
          <span className="brand-wordmark">
            <span className="brand-name">{isHome ? PRODUCT_NAME : PRODUCT_SHORT}</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {primaryLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/products" className="btn btn-primary nav-cta">
          Explore products <svg className="nav-link-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5"/></svg>
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
        {primaryLinks.map((l) => (
          <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}>
            {l.label}
          </NavLink>
        ))}
        <Link to="/products" className="btn btn-primary nav-drawer-cta" onClick={() => setOpen(false)}>
          Explore products <svg className="nav-link-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5"/></svg>
        </Link>
      </div>
    </header>
  );
}
