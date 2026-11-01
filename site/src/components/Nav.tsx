import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const links = [
  { to: "/systems", label: "Systems" },
  { to: "/evidence", label: "Evidence" },
  { to: "/discovery", label: "Discovery" },
  { to: "/akeno", label: "Akeno" },
  { to: "/aksh-agents", label: "Aksh Agents" },
  { to: "/for-isi", label: "For ISI" },
  { to: "/for-aksh", label: "For Aksh" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/alignment", label: "Alignment" },
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
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/docs" className="btn nav-cta">
          How to use <span className="arrow">↗</span>
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
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}>
            {l.label}
          </NavLink>
        ))}
        <NavLink to="/docs" onClick={() => setOpen(false)}>
          How to use
        </NavLink>
      </div>
    </header>
  );
}
