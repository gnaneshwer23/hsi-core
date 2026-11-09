import {describe, expect, it} from "bun:test";
import {readFileSync} from "node:fs";
import {
  DATA_TO_DISCOVERY_LAYERS,
  DATA_TO_DISCOVERY_NODES,
  DATA_TO_DISCOVERY_STATUS,
  DATA_TO_DISCOVERY_STATUS_LABEL,
  countByStatus,
  nodesForLayer,
  workbenchHref,
} from "../site/src/lib/dataToDiscoveryArchitecture";
import {INVESTIGATION_SECTIONS} from "../site/src/lib/investigationSections";

const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

describe("Data-to-Discovery architecture status registry", () => {
  it("covers the nine architecture layers from the brief", () => {
    expect(DATA_TO_DISCOVERY_LAYERS.map((layer) => layer.id)).toEqual([
      "sources",
      "ingestion",
      "storage",
      "graph",
      "agents",
      "governance",
      "outcomes",
      "frontend",
      "continuous",
    ]);
  });

  it("labels newly asked biology sources as not connected", () => {
    const missingLabels = DATA_TO_DISCOVERY_NODES.filter((node) => node.status === "missing").map(
      (node) => node.label,
    );
    for (const label of [
      "UniProt",
      "Reactome",
      "Gene Ontology",
      "ChEMBL",
      "HGNC",
      "HCA / CELLxGENE",
      "Omics interfaces",
    ]) {
      expect(missingLabels).toContain(label);
    }
  });

  it("keeps literature and registry libraries as partially implemented, not live-complete", () => {
    for (const id of ["epmc", "ot", "ctgov", "dynamic-retrieve"]) {
      const node = DATA_TO_DISCOVERY_NODES.find((item) => item.id === id);
      expect(node?.status).toBe("partially_implemented");
    }
  });

  it("records human-gated blockers without inventing clearance", () => {
    const blocked = DATA_TO_DISCOVERY_NODES.filter((node) => node.status === "blocked");
    expect(blocked.some((node) => node.id === "rights")).toBe(true);
    expect(blocked.some((node) => node.id === "n5-refresh")).toBe(true);
    expect(DATA_TO_DISCOVERY_STATUS_LABEL.blocked).toBe("Blocked");
  });

  it("links workbench sections 01–06 through shared investigation anchors", () => {
    for (const section of INVESTIGATION_SECTIONS) {
      expect(workbenchHref(section.id)).toBe(`/research/decision-workbench#${section.anchor}`);
    }
    expect(nodesForLayer("outcomes").some((node) => node.workbenchSectionId === "01")).toBe(true);
  });

  it("counts every declared status bucket", () => {
    const counts = countByStatus();
    const total = DATA_TO_DISCOVERY_STATUS.reduce((sum, status) => sum + counts[status], 0);
    expect(total).toBe(DATA_TO_DISCOVERY_NODES.length);
    expect(counts.missing).toBeGreaterThanOrEqual(7);
  });
});

describe("Technology page Data-to-Discovery visualisation", () => {
  const page = read("../site/src/pages/Technology.tsx");
  const component = read("../site/src/components/DataToDiscoveryArchitecture.tsx");
  const css = read("../site/src/components/DataToDiscoveryArchitecture.css");

  it("mounts the interactive architecture after TechnologyFlow", () => {
    expect(page).toContain('import { DataToDiscoveryArchitecture }');
    expect(page.indexOf("<TechnologyFlow />")).toBeLessThan(
      page.indexOf("<DataToDiscoveryArchitecture />"),
    );
    expect(page).toContain('id="data-to-discovery-status"');
  });

  it("exposes honest status chrome, workbench links and reduced-motion support", () => {
    expect(component).toContain("DATA_TO_DISCOVERY_STATUS_LABEL");
    expect(component).toContain("not connected");
    expect(DATA_TO_DISCOVERY_STATUS_LABEL.missing).toBe("Not connected");
    expect(component).toContain("RESEARCH WORKBENCH · SECTIONS 01–06");
    expect(component).toContain("workbenchHref");
    expect(component).toContain("Human queue #2");
    expect(css).toContain("--d2d-navy");
    expect(css).toContain("--d2d-cyan");
    expect(css).toContain("--d2d-violet");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("focus-visible");
  });

  it("keeps the diagram palette scoped inside .d2d", () => {
    expect(css).toContain(".d2d {");
    expect(css).toContain("Contained Data-to-Discovery diagram");
    expect(component).toContain('className="d2d"');
  });
});
