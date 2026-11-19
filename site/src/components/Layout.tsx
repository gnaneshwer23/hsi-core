import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, Suspense } from "react";
import { Nav } from "./Nav";
import { ResearchNavigation } from "./ResearchNavigation";
import {applySeo} from "../lib/seo/applySeo";
import { Footer } from "./Footer";
import { isPublicMarketingPath, isAccountPath } from "../lib/primaryNav";

export function Layout() {
  const { pathname, hash } = useLocation();
  const previousPathname = useRef(pathname);
  const isPublicPage = isPublicMarketingPath(pathname);
  const isAccountPage = isAccountPath(pathname);
  const isHome = pathname === "/";
  // The researcher home is an app shell with its own header and navigation.
  const isApp = pathname === "/research/home" || pathname === "/research/workspace" || pathname === "/research/gaps" || pathname === "/research/ledger" || pathname === "/research/cohort" || pathname === "/research/targets" || pathname === "/research/prescreen" || pathname === "/research/journey" || pathname === "/research/evaluation" || pathname === "/research/methods" || pathname === "/welcome" || pathname === "/research/knowledge-graph" || pathname === "/academic" || pathname === "/enterprise" || pathname === "/enterprise/professor" || pathname === "/enterprise/student" || pathname === "/enterprise/biotech" || pathname === "/enterprise/clinical" || pathname === "/enterprise/lab" || pathname === "/enterprise/community" || pathname === "/workspaces" || pathname.startsWith("/workspaces/");

  useEffect(() => {
    // React Router does not scroll cross-page fragment links by itself.
    if(hash){
      let id:string;try{id=decodeURIComponent(hash.slice(1))}catch{id=hash.slice(1)}
      document.getElementById(id)?.scrollIntoView({block:"start"});
    }else window.scrollTo(0, 0);
  }, [pathname, hash]);

  useEffect(() => {
    applySeo(pathname);
    if(previousPathname.current!==pathname)document.getElementById("main-content")?.focus({preventScroll:true});
    previousPathname.current=pathname;
  }, [pathname]);

  // Premium homepage tokens (home-shell) extend across public marketing pages for one journey.
  const shellClass = [
    "site-shell experience-shell",isApp?"app-shell-page":"",
    isPublicPage ? "editorial-site" : "",
    isPublicPage || isHome ? "home-shell" : "",
    isPublicPage && !isHome ? "platform-shell" : "",
    isPublicPage || isAccountPage ? "public-site-v2" : "",
    isAccountPage ? "account-shell" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClass}>
      <a className="home-skip" href="#main-content">
        Skip to content
      </a>
      {!isApp&&<Nav />}
      <main className="site-main" id="main-content" tabIndex={-1}>
        {(["/research/capabilities","/research/governance","/research/scientific-workbench","/research/mechanism-workflow","/research/decision-workbench","/research/scientific-review","/research/evidence-readiness","/research/context-completion","/research/d01-edge-review","/research/ontology-review","/science/graph","/science/clinical-trials"].includes(pathname))&&<ResearchNavigation/>}
        <Suspense fallback={<p role="status" style={{padding:"3rem 1.5rem"}}>Loading research tools…</p>}><Outlet /></Suspense>
      </main>
      {!isApp&&<Footer />}
    </div>
  );
}
