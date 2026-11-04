import { useEffect } from "react";
import { HowItWorks as HowItWorksLanding } from "../components/landing/HowItWorks";
import { PRODUCT_NAME } from "../lib/brand";

/** Page-specific head — SPA has no react-helmet; siblings still use the index.html default. */
const PAGE_TITLE = `How It Works — ${PRODUCT_NAME}`;
const PAGE_DESCRIPTION =
  "Illustrative journeys showing how Human Super Intelligence frames investigations — from question to context, evidence and human review. Not live sessions or clinical decision support.";

/** Public illustrative journeys with product-specific availability and boundaries. */
export function HowItWorks() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? null;

    document.title = PAGE_TITLE;
    meta?.setAttribute("content", PAGE_DESCRIPTION);

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== null) {
        meta.setAttribute("content", previousDescription);
      }
    };
  }, []);

  return <HowItWorksLanding />;
}
