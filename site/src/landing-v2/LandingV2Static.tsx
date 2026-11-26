import type { ComponentType } from "react";
import { LandingV2Layout } from "./Layout";
import { DocMeta, type PageMeta } from "./LandingV2";
import Memory, { pageMeta as memoryMeta } from "./pages/platform/memory";
import Agents, { pageMeta as agentsMeta } from "./pages/platform/agents";
import Contradiction, { pageMeta as contradictionMeta } from "./pages/platform/contradiction-analysis";
import Workbench, { pageMeta as workbenchMeta } from "./pages/platform/workbench";
import Discovery, { pageMeta as discoveryMeta } from "./pages/platform/discovery-engine";
import DataSources, { pageMeta as dataMeta } from "./pages/data-sources";
import Trust, { pageMeta as trustMeta } from "./pages/trust";
import HowItWorks, { pageMeta as howMeta } from "./pages/how-it-works";
import About, { pageMeta as aboutMeta } from "./pages/about";
import Contact, { pageMeta as contactMeta } from "./pages/contact";
import KnowledgeGraph, { pageMeta as kgMeta } from "./pages/knowledge-graph";
import Companion, { pageMeta as companionMeta } from "./pages/platform/companion";
import Solutions, { pageMeta as solutionsMeta } from "./pages/solutions";

/** The indexed landing v2 pages, imported directly so the build can render them to HTML (the browser bundle loads them lazily). */
const STATIC: Record<string, [ComponentType, PageMeta]> = {
  "platform/memory": [Memory, memoryMeta],
  "platform/agents": [Agents, agentsMeta],
  "platform/contradiction-analysis": [Contradiction, contradictionMeta],
  "platform/workbench": [Workbench, workbenchMeta],
  "platform/discovery-engine": [Discovery, discoveryMeta],
  "data-sources": [DataSources, dataMeta],
  trust: [Trust, trustMeta],
  "how-it-works": [HowItWorks, howMeta],
  about: [About, aboutMeta],
  contact: [Contact, contactMeta],
  solutions: [Solutions, solutionsMeta],
  "knowledge-graph": [KnowledgeGraph, kgMeta],
  "platform/companion": [Companion, companionMeta],
};

export default function LandingV2Static({ page }: { page: string }) {
  const entry = STATIC[page];
  if (!entry) return null;
  const [Page, meta] = entry;
  return (
    <LandingV2Layout>
      <DocMeta meta={meta} />
      <Page />
    </LandingV2Layout>
  );
}
