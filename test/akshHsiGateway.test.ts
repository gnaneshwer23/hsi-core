import { describe, expect, it } from "bun:test";
import {
  decideGatewayRequest,
  gatewayAuditEvent,
  gatewayContract,
  type GatewayRequestStub,
} from "../src/akshHsiGateway";

describe("Aksh↔HSI gateway", () => {
  it("publishes contract with research DB deny list and CDS/PHI invariants", () => {
    const c = gatewayContract();
    expect(c.schemaVersion).toBe("hsi-aksh-gateway-contract-1");
    expect(c.invariants.containsPhi).toBe(false);
    expect(c.invariants.liveEmis).toBe(false);
    expect(c.researchDbTargets).toContain("isi_neon_autumn_snow");
    expect(c.researchDbTargets).toContain("hsi_neon_red_wave_research_packs");
  });

  it("denies PHI to research planes", () => {
    const req: GatewayRequestStub = {
      requestId: "r1",
      purpose: "research_concept_xref",
      fromPlane: "aksh_clinic",
      toPlane: "hsi_research",
      payloadKeys: ["mrn"],
      syntheticOnly: false,
      containsPhi: true,
    };
    const d = decideGatewayRequest(req);
    expect(d.allow).toBe(false);
    if (!d.allow) expect(d.reason).toBe("phi_to_research_db");
  });

  it("allows synthetic concept xref and timeline / trials stubs", () => {
    expect(
      decideGatewayRequest({
        requestId: "r2",
        purpose: "research_concept_xref",
        fromPlane: "aksh_clinic",
        toPlane: "hsi_research",
        payloadKeys: ["claimId"],
        syntheticOnly: true,
        containsPhi: false,
      }).allow,
    ).toBe(true);

    expect(
      decideGatewayRequest({
        requestId: "r3",
        purpose: "synthetic_timeline_handoff",
        fromPlane: "aksh_clinic",
        toPlane: "hsi_clinical_synthetic",
        payloadKeys: ["fixtureId"],
        syntheticOnly: true,
        containsPhi: false,
      }).allow,
    ).toBe(true);

    expect(
      decideGatewayRequest({
        requestId: "r4",
        purpose: "trials_criterion_stub",
        fromPlane: "hsi_clinical_synthetic",
        toPlane: "hsi_trials_stub",
        payloadKeys: ["criterionId"],
        syntheticOnly: true,
        containsPhi: false,
      }).allow,
    ).toBe(true);
  });

  it("audit events never claim research DB writes", () => {
    const req: GatewayRequestStub = {
      requestId: "r5",
      purpose: "hitl_map_pointer",
      fromPlane: "hsi_research",
      toPlane: "aksh_clinic",
      payloadKeys: ["claimId"],
      syntheticOnly: true,
      containsPhi: false,
    };
    const d = decideGatewayRequest(req);
    const audit = gatewayAuditEvent(req, d, new Date("2026-11-02T12:00:00.000Z"));
    expect(audit.researchDbWrite).toBe(false);
    expect(audit.allow).toBe(true);
  });
});
