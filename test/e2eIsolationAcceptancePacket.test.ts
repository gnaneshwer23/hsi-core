import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessE2eIsolationMode,
  assertE2eIsolationPacketSoftLand,
  e2eIsolationAcceptancePacket,
  e2eIsolationScopeById,
  type E2eIsolationScopeId,
  type E2eIsolationSuiteMode,
} from "../src/operations/e2eIsolationAcceptancePacket";

describe("PR-E2E-02 isolation acceptance packet soft-land", () => {
  test("documents five scopes without inventing acceptance or signers", () => {
    const packet = e2eIsolationAcceptancePacket();
    const summary = assertE2eIsolationPacketSoftLand(packet);
    expect(summary.scopeCount).toBe(5);
    expect(summary.acceptedForScope).toBe(false);
    expect(summary.signedPacketClaimed).toBe(false);
    expect(summary.liveExecutionAuthorized).toBe(false);
    expect(packet.backlogId).toBe("PR-E2E-02");
    expect(packet.scientificApproval).toBe(false);
    expect(packet.honesty.noInventedSigner).toBe(true);
    expect(packet.honesty.fixtureIsNotLiveEvidence).toBe(true);
  });

  test("each scope stays unaccepted with a null signed packet ref", () => {
    const scopes: E2eIsolationScopeId[] = [
      "interrogative_workspace",
      "scientific_records",
      "contradiction_ledger",
      "live_evidence",
      "graph_workspace",
    ];
    for (const scope of scopes) {
      const row = e2eIsolationScopeById(scope);
      expect(row.scope).toBe(scope);
      expect(row.separatePacketRequired).toBe(true);
      expect(row.acceptedForScope).toBe(false);
      expect(row.signedPacketRef).toBeNull();
      expect(row.notes.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows acceptance claims", () => {
    const modes: E2eIsolationSuiteMode[] = ["check", "fixture", "live"];
    for (const mode of modes) {
      const assessment = assessE2eIsolationMode(mode);
      expect(assessment.mayClaimAcceptance).toBe(false);
      expect(assessment.mayClaimLiveEvidence).toBe(false);
      expect(assessment.signedPacketClaimed).toBe(false);
      expect(assessment.scientificApproval).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
    expect(assessE2eIsolationMode("check").ciSafe).toBe(true);
    expect(assessE2eIsolationMode("fixture").ciSafe).toBe(true);
    expect(assessE2eIsolationMode("live").ciSafe).toBe(false);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(join(root, "operations/staging/e2e-02-isolation-acceptance.pending.json"), "utf8"),
    ) as {
      opsAcceptance: string;
      acceptedForScope: boolean;
      signedPacketClaimed: boolean;
      liveExecutionAuthorized: boolean;
      references: { security_signer_ref: string; staging_target_ref: string };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.acceptedForScope).toBe(false);
    expect(pending.signedPacketClaimed).toBe(false);
    expect(pending.liveExecutionAuthorized).toBe(false);
    expect(pending.references.security_signer_ref).toBe("UNASSIGNED");
    expect(pending.references.staging_target_ref).toBe("NOT_APPROVED");

    const doc = readFileSync(
      join(root, "docs/engineering/E2E_02_ISOLATION_ACCEPTANCE_PACKET_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("PR-E2E-02");
    expect(doc).toContain("acceptedForScope");
  });
});
