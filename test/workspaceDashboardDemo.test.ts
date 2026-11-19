import { describe, expect, test } from "bun:test";
import {
  assessWorkspaceAccess,
  isWorkspaceId,
  listWorkspaceDefinitions,
  workspaceDemoPacket,
} from "../src/enterprise/workspaceDashboardDemo";

describe("multi-workspace dashboard demonstration catalog", () => {
  test("lists eight connected workspaces with fail-closed clinical and confidentiality flags", () => {
    const list = listWorkspaceDefinitions();
    expect(list).toHaveLength(8);
    expect(list.map((w) => w.id)).toEqual([
      "researcher",
      "professor",
      "student",
      "biotech",
      "clinical",
      "laboratory",
      "community",
      "enterprise",
    ]);
    for (const w of list) {
      expect(w.clinicalCohortsEnabled).toBe(false);
      expect(w.confidentialScienceAutoUnlock).toBe(false);
      expect(w.modules.length).toBeGreaterThanOrEqual(3);
    }
    expect(list.find((w) => w.id === "professor")?.stage4ShellPath).toBe(
      "/enterprise/professor",
    );
    expect(list.find((w) => w.id === "biotech")?.stage4ShellPath).toBe(
      "/enterprise/biotech",
    );
    expect(list.find((w) => w.id === "clinical")?.stage4ShellPath).toBe(
      "/enterprise/clinical",
    );
    expect(list.find((w) => w.id === "laboratory")?.stage4ShellPath).toBe(
      "/enterprise/lab",
    );
    expect(list.find((w) => w.id === "community")?.stage4ShellPath).toBe(
      "/enterprise/community",
    );
    expect(list.find((w) => w.id === "researcher")?.stage4ShellPath).toBeNull();
    expect(list.find((w) => w.id === "enterprise")?.stage4ShellPath).toBeNull();
  });

  test("each workspace packet keeps demonstration honesty and access controls", () => {
    for (const w of listWorkspaceDefinitions()) {
      expect(isWorkspaceId(w.id)).toBe(true);
      const packet = workspaceDemoPacket(w.id);
      expect(packet.honesty.liveEvidence).toBe(false);
      expect(packet.honesty.phiEnabled).toBe(false);
      expect(packet.honesty.scientificApproval).toBe(false);
      expect(packet.honesty.productionWritesEnabled).toBe(false);
      expect(packet.honesty.diseaseAgnosticPlatform).toBe(true);
      expect(packet.stats.length).toBe(4);
      expect(packet.aiCards.length).toBe(3);
      const access = assessWorkspaceAccess(w.id);
      expect(access.canViewDemoShell).toBe(true);
      expect(access.canEnableClinicalCohorts).toBe(false);
      expect(access.canAutoUnlockConfidentialScience).toBe(false);
      expect(access.canWriteProductionOrgData).toBe(false);
      expect(access.studentPrivateNotesVisibleToProfessor).toBe(false);
    }
  });

  test("clinical and enterprise packets surface governance copy", () => {
    const clinical = workspaceDemoPacket("clinical");
    expect(clinical.governanceNote.toLowerCase()).toContain("phi");
    expect(clinical.stats.some((s) => s.value === 0 && s.label.includes("PHI"))).toBe(
      true,
    );
    const enterprise = workspaceDemoPacket("enterprise");
    expect(enterprise.governanceNote.toLowerCase()).toContain("subscription");
    expect(
      enterprise.stats.some((s) => s.label.includes("Confidential") && s.value === 0),
    ).toBe(true);
  });

  test("laboratory packet matches omics-oriented demo stats", () => {
    const lab = workspaceDemoPacket("laboratory");
    expect(lab.stats.map((s) => s.label)).toEqual([
      "Example assays",
      "Omics datasets",
      "Context checks",
      "Analysis briefs",
    ]);
  });
});
