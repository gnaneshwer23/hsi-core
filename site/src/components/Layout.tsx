import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function Layout() {
  const { pathname } = useLocation();
  const isPublicPage = ["/", "/platform", "/products", "/science", "/how-it-works"].includes(pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={`site-shell${pathname === "/" ? " home-shell" : ["/platform", "/products", "/science", "/how-it-works"].includes(pathname) ? " platform-shell" : ""}${isPublicPage ? " public-site-v2" : ""}`}>
      <a className="home-skip" href="#main-content">Skip to content</a>
      <Nav />
      <main className="site-main" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
