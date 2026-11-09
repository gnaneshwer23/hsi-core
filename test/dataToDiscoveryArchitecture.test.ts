import {describe, expect, it} from "bun:test";
import {readFileSync} from "node:fs";
import {
  DATA_TO_DISCOVERY_LAYERS,
  DATA_TO_DISCOVERY_NODES,
  DATA_TO_DISCOVERY_STATUS,
  DATA_TO_DISCOVERY_STATUS_LABEL,
  WORKBENCH_PUBLIC_LINKS,
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

  it("uses public-safe status labels and public workbench routes without auth-only hashes", () => {
    expect(DATA_TO_DISCOVERY_STATUS_LABEL.fixture_only).toBe("Seed-pack only");
    expect(DATA_TO_DISCOVERY_STATUS_LABEL.fixture_only.toLowerCase()).not.toMatch(/\bfixtures?\b/);
    expect(workbenchHref()).toBe("/research/decision-workbench");
    expect(WORKBENCH_PUBLIC_LINKS.map((link) => link.id)).toEqual(
      INVESTIGATION_SECTIONS.map((section) => section.id),
    );
    for (const link of WORKBENCH_PUBLIC_LINKS) {
      expect(link.href).not.toContain("#inv-");
      expect(link.href.startsWith("/")).toBe(true);
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
  const lib = read("../site/src/lib/dataToDiscoveryArchitecture.ts");

  it("mounts the interactive architecture after TechnologyFlow", () => {
    expect(page).toContain('import { DataToDiscoveryArchitecture }');
    expect(page.indexOf("<TechnologyFlow />")).toBeLessThan(
      page.indexOf("<DataToDiscoveryArchitecture />"),
    );
    expect(page).toContain('id="data-to-discovery-status"');
  });

  it("avoids banned promo wording and auth-only inv anchors on the public surface", () => {
    expect(component.toLowerCase()).not.toMatch(/\b(synthetic|demo|fixtures?|simulation)\b/);
    expect(lib).toContain('fixture_only: "Seed-pack only"');
    expect(component).toContain("seed-pack only");
    expect(component).not.toMatch(/to=\{[^}]*#inv-/);
    expect(component).toContain("WORKBENCH_PUBLIC_LINKS");
  });

  it("uses selects instead of exploding main button counts, with accessible contrast tokens", () => {
    expect(component).toContain('className="d2d-select"');
    expect(component).not.toContain('role="tablist"');
    expect(component).not.toContain('role="button"');
    expect(css).toContain("--d2d-coral-text");
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
