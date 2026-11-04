import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { isPublicMarketingPath, isAccountPath } from "../lib/primaryNav";

export function Layout() {
  const { pathname } = useLocation();
  const isPublicPage = isPublicMarketingPath(pathname);
  const isAccountPage = isAccountPath(pathname);
  const isHome = pathname === "/";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const shellClass = [
    "site-shell",
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
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
