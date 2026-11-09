import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  HsiIsiConsumerClient,
  assertHonestyFlags,
  defaultPaths,
} from "../examples/isi-consumer/client";

describe("ISI immunecity wiring package (out-of-repo handoff)", () => {
  const root = process.cwd();
  const paths = defaultPaths(root);
  const client = new HsiIsiConsumerClient(paths);

  test("playbook + wiring spec + discovery contract exist", () => {
    expect(existsSync(join(root, "docs/ISI_IMMUNICITY_WIRING_PLAYBOOK.md"))).toBe(
      true,
    );
    expect(existsSync(paths.wiringSpecPath)).toBe(true);
    expect(
      existsSync(join(paths.discoveryDir, "hsi-isi-consume-contract.json")),
    ).toBe(true);
    expect(
      existsSync(join(paths.discoveryDir, "hsi-isi-wiring-spec.json")),
    ).toBe(true);
  });

  test("wiring spec honesty + URL patterns + acceptance tests", () => {
    const spec = client.loadWiringSpec();
    expect(spec.schemaVersion).toBe("hsi-isi-wiring-spec-1");
    expect(spec.notCds).toBe(true);
    expect(spec.autoApproveIntoKg).toBe(false);
    expect(spec.partnerSigned).toBe(false);
    expect(spec.immunecityEditFromThisWorkspace).toBe(false);
    expect(spec.sharedEvidenceNeon).toBe(false);
    expect(spec.gateC.autoApprove).toBe(false);
    expect(spec.gateC.statusOnPublish).toBe("pending");
    expect(spec.gateC.approveTargetNeon).toContain("isi-neon-project");
    expect(spec.urlPatterns.githubRawDiscovery).toContain(
      "site/public/discovery/{fileName}",
    );
    expect(spec.fetch.discoveryFiles).toContain("hsi-isi-consume-contract.json");
    expect(spec.fetch.discoveryFiles).toContain("hsi-isi-wiring-spec.json");
    expect(spec.discoveryRouteMap.length).toBeGreaterThanOrEqual(5);
    expect(spec.acceptanceTests.some((t) => t.id === "AT-GATE-C-PENDING")).toBe(
      true,
    );
    expect(spec.consumerClientInterfaces?.referenceImplementation).toBe(
      "examples/isi-consumer/",
    );
    expect(
      Object.keys(spec.consumerClientInterfaces?.typescriptSketches ?? {}),
    ).toContain("HsiArtifactLoader");
  });

  test("demo client proves consume contract against discovery fixtures", () => {
    const proof = client.proveContract();
    expect(proof.gateCPending).toBe(true);
    expect(proof.askStaysRa).toBe(true);
    expect(proof.grades).toEqual(["established", "uncertain", "unexplored"]);
    expect(proof.loadedCount).toBeGreaterThan(10);
    // Full ISI export may be publish-only — that is OK for Discovery-static proof.
    expect(Array.isArray(proof.missingFromDiscovery)).toBe(true);

    const contract = client.loadConsumeContract();
    assertHonestyFlags(contract, "contract");
    for (const a of contract.artifacts) {
      expect(a.autoApproveIntoKg).toBe(false);
    }
  });

  test("Discovery route map files referenced by wiring spec are present when listed as discoveryFiles", () => {
    const spec = client.loadWiringSpec();
    const discoverySet = new Set(spec.fetch.discoveryFiles);
    for (const route of spec.discoveryRouteMap) {
      for (const file of route.files) {
        if (!discoverySet.has(file)) continue;
        expect(existsSync(join(paths.discoveryDir, file))).toBe(true);
      }
      expect(route.notCds).toBe(true);
    }
  });
});
