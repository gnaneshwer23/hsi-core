import { lazy, Suspense, useEffect, type ComponentType } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/newsreader";
import "@fontsource-variable/newsreader/wght-italic.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./landing-v2.css";
import { Header, Footer } from "./components/site/Header";
import { Link } from "./router";

type PageMeta = { meta: { title?: string; name?: string; content?: string; property?: string }[] };
type PageModule = { default: ComponentType; pageMeta: PageMeta };

/** Sets the title and description for the page and keeps it out of search indexes while it is a preview. Restores the previous values on unmount. */
function DocMeta({ meta }: { meta: PageMeta }) {
  useEffect(() => {
    const prevTitle = document.title;
    const title = meta.meta.find((m) => m.title)?.title;
    const description = meta.meta.find((m) => m.name === "description")?.content;
    const made: HTMLMetaElement[] = [];
    const set = (name: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      const had = el?.content;
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
        made.push(el);
      }
      el.content = content;
      return () => {
        if (made.includes(el!)) el!.remove();
        else if (had !== undefined) el!.content = had;
      };
    };
    if (title) document.title = title;
    const undo = [set("robots", "noindex, nofollow"), ...(description ? [set("description", description)] : [])];
    return () => {
      document.title = prevTitle;
      undo.forEach((u) => u());
    };
  }, [meta]);
  return null;
}

function lazyPage(load: () => Promise<PageModule>) {
  return lazy(async () => {
    const m = await load();
    const Page = m.default;
    return {
      default: () => (
        <>
          <DocMeta meta={m.pageMeta} />
          <Page />
        </>
      ),
    };
  });
}

const Home = lazyPage(() => import("./pages/index"));
const Science = lazyPage(() => import("./pages/science"));
const Solutions = lazyPage(() => import("./pages/solutions"));
const DataSources = lazyPage(() => import("./pages/data-sources"));
const Trust = lazyPage(() => import("./pages/trust"));
const EarlyAccess = lazyPage(() => import("./pages/early-access"));
const Memory = lazyPage(() => import("./pages/platform/memory"));
const Agents = lazyPage(() => import("./pages/platform/agents"));
const Contradiction = lazyPage(() => import("./pages/platform/contradiction-analysis"));
const Workbench = lazyPage(() => import("./pages/platform/workbench"));
const KnowledgeGraph = lazyPage(() => import("./pages/platform/knowledge-graph"));
const Discovery = lazyPage(() => import("./pages/platform/discovery-engine"));
const Companion = lazyPage(() => import("./pages/platform/companion"));

function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Go home
        </Link>
      </div>
    </div>
  );
}

function LandingV2Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="lv2">
      <Header />
      <main>
        <Suspense fallback={<p role="status" className="px-6 py-24 text-sm text-muted-foreground">Loading…</p>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

/** Mounted by App.tsx as the lazy splat route `landing-v2/*`, outside the site's own Layout (this section has its own header and footer). */
export default function LandingV2App() {
  return (
    <Routes>
      <Route element={<LandingV2Layout />}>
        <Route index element={<Home />} />
        <Route path="science" element={<Science />} />
        <Route path="solutions" element={<Solutions />} />
        <Route path="data-sources" element={<DataSources />} />
        <Route path="trust" element={<Trust />} />
        <Route path="early-access" element={<EarlyAccess />} />
        <Route path="platform/memory" element={<Memory />} />
        <Route path="platform/agents" element={<Agents />} />
        <Route path="platform/contradiction-analysis" element={<Contradiction />} />
        <Route path="platform/workbench" element={<Workbench />} />
        <Route path="platform/knowledge-graph" element={<KnowledgeGraph />} />
        <Route path="platform/discovery-engine" element={<Discovery />} />
        <Route path="platform/companion" element={<Companion />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
