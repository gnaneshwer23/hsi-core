import { lazy, useEffect, type ComponentType } from "react";
import { LandingV2Layout } from "./Layout";

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

const PAGES = {
  science: Science,
  solutions: Solutions,
  "data-sources": DataSources,
  trust: Trust,
  "early-access": EarlyAccess,
  "platform/memory": Memory,
  "platform/agents": Agents,
  "platform/contradiction-analysis": Contradiction,
  "platform/workbench": Workbench,
  "platform/knowledge-graph": KnowledgeGraph,
  "platform/discovery-engine": Discovery,
  "platform/companion": Companion,
} as const;
export type LandingV2Page = keyof typeof PAGES;

/** Lazily loaded by App.tsx, one explicit route per page (so every rewrite in vercel.json has a matching route, and unknown paths keep the site's real 404). */
export default function LandingV2App({ page }: { page: LandingV2Page }) {
  const Page = PAGES[page];
  return (
    <LandingV2Layout>
      <Page />
    </LandingV2Layout>
  );
}
