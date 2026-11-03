import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ENGINEERING_LINKS } from "../lib/productMaturity";

/**
 * Primary destinations — product/marketing landings only.
 * Matches footer Platform + Products + Progress; engineering stays drawer-secondary.
 */
const primaryLinks = [
  { to: "/platform", label: "Platform" },
  { to: "/products", label: "Products" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/explore", label: "Explore" },
  { to: "/discovery", label: "Discovery" },
  { to: "/for-aksh", label: "For Aksh" },
  { to: "/for-trials", label: "For Trials" },
  { to: "/for-isi", label: "For ISI" },
  { to: "/status", label: "Status" },
  { to: "/roadmap", label: "Roadmap" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="nav-inner">
        <Link to="/" className="brand" aria-label="HSI home">
          <span className="brand-mark">H</span>
          <span>HSI</span>
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

        <Link to="/status" className="btn nav-cta">
          What&apos;s available <span className="arrow">↗</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`nav-drawer${open ? " open" : ""}`}>
        {primaryLinks.map((l) => (
          <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}>
            {l.label}
          </NavLink>
        ))}
        <p className="nav-drawer-eng-label">Engineering (secondary)</p>
        {ENGINEERING_LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="nav-drawer-eng">
            {l.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
