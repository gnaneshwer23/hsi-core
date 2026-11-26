import { LandingV2Layout } from "./Layout";
import { Link } from "./router";
import { PageHero } from "./components/site/ui";

/** The site's 404, in the landing design. The marker attribute is read by applySeo to set the noindex title. */
export default function LandingV2NotFound() {
  return (
    <LandingV2Layout>
      <div data-not-found="true">
        <PageHero eyebrow="Error 404" title="Page not found" intro="That address does not match a page on this site. It may have moved, or the link may be mistyped.">
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/" className="bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Go to the homepage</Link>
            <Link to="/knowledge-graph" className="border border-border px-5 py-3 text-sm font-medium hover:border-primary">Explore the knowledge graph</Link>
            <Link to="/how-it-works" className="border border-border px-5 py-3 text-sm font-medium hover:border-primary">How it works</Link>
          </div>
        </PageHero>
      </div>
    </LandingV2Layout>
  );
}
