import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  AKSH_AGENT_CATALOG_SCHEMA,
  AKSH_AGENT_DIRECTORY,
  AKSH_AGENT_PROVENANCE,
  AKSH_AGENT_REGISTER,
  buildAkshAgentCatalog,
  canonicalAkshAgentId,
  listAkshDirectoryNames,
  listAkshRegisterIds,
  listAllAkshAgentNames,
} from "../src/akshAgents";

describe("Aksh agent catalog", () => {
  it("keeps directory at exactly 12 peers and register at 14", () => {
    expect(AKSH_AGENT_DIRECTORY.length).toBe(12);
    expect(AKSH_AGENT_REGISTER.length).toBe(14);
    expect(listAkshDirectoryNames()).toEqual([
      "CANVAS",
      "SYNTHESIS",
      "BRIDGE",
      "NEXUS",
      "GUARDIAN",
      "PRISM",
      "HORIZON",
      "PATHWAY",
      "COMPASS",
      "ATLAS",
      "SHIELD",
      "CONDUCTOR",
    ]);
    expect(listAkshRegisterIds()).toContain("VOICE");
    expect(listAkshRegisterIds()).toContain("DrASSIST");
    expect(listAkshRegisterIds()).toContain("CONDUCTOR");
  });

  it("resolves legacy aliases to canonical ids", () => {
    expect(canonicalAkshAgentId("ORACLE")).toBe("HORIZON");
    expect(canonicalAkshAgentId("EQUITY")).toBe("COMPASS");
    expect(canonicalAkshAgentId("REFERRAL")).toBe("PATHWAY");
    expect(canonicalAkshAgentId("DR_ASSIST")).toBe("DrASSIST");
  });

  it("is fail-closed inventory (not CDS)", () => {
    const catalog = buildAkshAgentCatalog();
    expect(catalog.schemaVersion).toBe(AKSH_AGENT_CATALOG_SCHEMA);
    expect(catalog.notCds).toBe(true);
    expect(catalog.clinicalActive).toBe(false);
    expect(catalog.autoApprove).toBe(false);
    expect(catalog.hsiRelation.akenoConsumerPath).toBe("/akeno");
    expect(catalog.provenance.commit).toBe(AKSH_AGENT_PROVENANCE.commit);
    expect(listAllAkshAgentNames().length).toBeGreaterThanOrEqual(20);
  });

  it("matches durable aksh/agent-catalog.json on counts and names", () => {
    const raw = readFileSync(
      join(import.meta.dir, "../aksh/agent-catalog.json"),
      "utf8",
    );
    const json = JSON.parse(raw) as {
      directory: { name: string }[];
      register: { id: string }[];
      provenance: { commit: string };
      notCds: boolean;
    };
    expect(json.notCds).toBe(true);
    expect(json.provenance.commit).toBe(AKSH_AGENT_PROVENANCE.commit);
    expect(json.directory.map((d) => d.name)).toEqual(listAkshDirectoryNames());
    expect(json.register.map((r) => r.id)).toEqual(listAkshRegisterIds());
  });
});
