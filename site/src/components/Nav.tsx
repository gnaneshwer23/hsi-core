import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {authBaseUrl,hsiAuth} from "../lib/hsiAuth";
import { PRODUCT_NAME } from "../lib/brand";
import { PRIMARY_NAV_CTA, PRIMARY_NAV_LINKS, SECONDARY_NAV_LINKS, isPublicMarketingPath, isAccountPath } from "../lib/primaryNav";

const ctaArrow = (
  <svg className="nav-link-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [moreOpen,setMoreOpen]=useState(false);
  const moreRef=useRef<HTMLDivElement>(null);
  const moreButtonRef=useRef<HTMLButtonElement>(null);
  const [signedIn,setSignedIn]=useState(false);
  const { pathname } = useLocation();
  useEffect(()=>{let active=true;if(!authBaseUrl){setSignedIn(false);return}hsiAuth.session().then(r=>{if(active)setSignedIn(!!r.data&&!r.error)}).catch(()=>{if(active)setSignedIn(false)});return()=>{active=false}},[pathname]);
  const isHome = pathname === "/";
  const creamMasthead = isPublicMarketingPath(pathname) || isAccountPath(pathname);

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
    setOpen(false);setMoreOpen(false);
  }, [pathname]);

  useEffect(()=>{if(!moreOpen)return;const outside=(e:PointerEvent)=>{if(!moreRef.current?.contains(e.target as Node))setMoreOpen(false)};const escape=(e:KeyboardEvent)=>{if(e.key==="Escape"){setMoreOpen(false);moreButtonRef.current?.focus()}};document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape)}},[moreOpen]);
  useEffect(()=>{const media=window.matchMedia("(min-width:1151px)");const reset=()=>{setOpen(false);setMoreOpen(false)};media.addEventListener("change",reset);return()=>media.removeEventListener("change",reset)},[]);

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
            <span className="brand-name">{PRODUCT_NAME}</span><span className="brand-short" aria-hidden="true">HSI</span>
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
          <div className="nav-more" ref={moreRef}><button ref={moreButtonRef} type="button" aria-expanded={moreOpen} aria-controls="secondary-pages" onClick={()=>setMoreOpen(v=>!v)}>More<svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5"/></svg></button><div id="secondary-pages" hidden={!moreOpen}>{SECONDARY_NAV_LINKS.map(l=><NavLink key={l.to} to={l.to} onClick={()=>setMoreOpen(false)}>{l.label}</NavLink>)}</div></div>
        </nav>

        {signedIn ? (
          <div className="nav-auth-actions">
            <Link to="/research/account" className="nav-sign-in">Account</Link>
          </div>
        ) : null}

        <Link to={PRIMARY_NAV_CTA.to} className="nav-cta">
          <span className="nav-cta-label">
            {PRIMARY_NAV_CTA.label}
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
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">{open?<path d="m6 6 12 12M6 18 18 6" stroke="currentColor" strokeWidth="1.7"/>:<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.7"/>}</svg>
        </button>
      </div>

      <nav aria-label="Mobile navigation" id="primary-menu" hidden={!open} className={`nav-drawer${open ? " open" : ""}`}>
        <NavLink to="/" onClick={() => setOpen(false)}>
          Home
        </NavLink>
        {PRIMARY_NAV_LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}>
            {l.label}
          </NavLink>
        ))}
        {SECONDARY_NAV_LINKS.map(l=><NavLink key={l.to} to={l.to} onClick={()=>setOpen(false)}>{l.label}</NavLink>)}
        {signedIn ? (
          <NavLink to="/research/account" className="nav-drawer-sign-in" onClick={() => setOpen(false)}>Account</NavLink>
        ) : null}
        <Link
          to={PRIMARY_NAV_CTA.to}
          className="nav-cta nav-drawer-cta"
          onClick={() => setOpen(false)}
        >
          <span className="nav-cta-label">
            {PRIMARY_NAV_CTA.label}
          </span>
          {ctaArrow}
        </Link>
      </nav>
    </header>
  );
}
