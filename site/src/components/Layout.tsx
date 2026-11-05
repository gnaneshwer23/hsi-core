import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Nav } from "./Nav";
import { ResearchNavigation } from "./ResearchNavigation";
import {EXPERIENCE_PAGE_META} from "../features/experience/content";
import { Footer } from "./Footer";
import { isPublicMarketingPath, isAccountPath } from "../lib/primaryNav";

export function Layout() {
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);
  const isPublicPage = isPublicMarketingPath(pathname);
  const isAccountPage = isAccountPath(pathname);
  const isHome = pathname === "/";

  useEffect(() => {
    window.scrollTo(0, 0);
    const meta=EXPERIENCE_PAGE_META[pathname];
    if(meta){document.title=meta.title;document.querySelector('meta[name="description"]')?.setAttribute("content",meta.description)}else{document.title="Human Super Intelligence — Research & evidence";document.querySelector('meta[name="description"]')?.setAttribute("content","Explore research context, scientific evidence and accountable review in Human Super Intelligence.")}
    if(previousPathname.current!==pathname)document.getElementById("main-content")?.focus({preventScroll:true});
    previousPathname.current=pathname;
  }, [pathname]);

  const shellClass = [
    "site-shell experience-shell",
    isHome ? "home-shell" : "",
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
      <Nav />
      <main className="site-main" id="main-content" tabIndex={-1}>
        {(["/research/dashboard","/research/governance","/research/scientific-workbench","/research/decision-workbench","/research/scientific-review","/research/evidence-readiness","/science/graph","/science/clinical-trials"].includes(pathname))&&<ResearchNavigation/>}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
