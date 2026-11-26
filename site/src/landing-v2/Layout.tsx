import { useEffect, Suspense, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header, Footer } from "./components/site/Header";

/** Header, main landmark and footer shared by the homepage and the landing v2 pages. */
export function LandingV2Layout({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return (
    <div className="lv2">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Suspense fallback={<p role="status" className="px-6 py-24 text-sm text-muted-foreground">Loading…</p>}>{children}</Suspense>
      </main>
      <Footer />
    </div>
  );
}
