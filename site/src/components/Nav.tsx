import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { PRODUCT_NAME, PRODUCT_SHORT } from "../lib/brand";
import { ENGINEERING_LINKS } from "../lib/productMaturity";

/**
 * Primary destinations — product/marketing landings only.
 * Status / Roadmap stay footer-only. Engineering surfaces stay drawer-secondary.
 */
const primaryLinks = [
  { to: "/platform", label: "Platform" },
  { to: "/products", label: "Products" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/explore", label: "Explore" },
  { to: "/discovery", label: "Discovery" },
  { to: "/for-aksh", label: "For Aksh" },
  { to: "/for-trials", label: "For Trials" },
  { to: "/for-isi", label: "For researchers" },
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
    setOpen(false);
  }, [pathname]);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
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

        <Link to="/discovery" className="btn btn-primary nav-cta">
          Open Discovery <span className="arrow">↗</span>
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
        <Link to="/discovery" className="btn btn-primary nav-drawer-cta" onClick={() => setOpen(false)}>
          Open Discovery <span className="arrow">↗</span>
        </Link>
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
