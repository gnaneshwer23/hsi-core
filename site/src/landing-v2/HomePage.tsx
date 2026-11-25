import { useEffect } from "react";
import { applySeo } from "../lib/seo/applySeo";
import { LandingV2Layout } from "./Layout";
import Home from "./pages/index";

/** The site homepage. Prerendered into the build, then hydrated; indexable, unlike the other landing v2 pages. */
export default function HomePage() {
  useEffect(() => {
    applySeo("/");
    document.documentElement.dataset.hydrated = "home"; // lets tests and monitors know the page is interactive
  }, []);
  return (
    <LandingV2Layout>
      <Home />
    </LandingV2Layout>
  );
}
