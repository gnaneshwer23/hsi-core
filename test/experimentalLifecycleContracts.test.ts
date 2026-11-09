/**
 * Milestone 10 PR1 — experimental lifecycle contract honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  bindProposalToProtocol,
  buildExperimentalLifecyclePack,
  createMemoryExperimentalLifecycleStore,
  draftExperimentExecution,
  draftExperimentProposal,
  draftExperimentProtocolVersion,
  draftExperimentalResult,
  fingerprintExperimentProposal,
  projectExperimentalLifecyclePersistenceLines,
  transitionExperimentProposal,
  validateExperimentProposal,
  type ExperimentProposal,
  type ExperimentProtocolVersion,
} from "../src/experimentalLifecycleContracts";

const asOf = "2026-11-09T14:00:00.000Z";

function seedProposal(
  overrides?: Partial<Parameters<typeof draftExperimentProposal>[0]>,
): ExperimentProposal {
  return draftExperimentProposal({
    id: "hsi-exp-prop-ssc-il6-assay",
    title: "IL-6 pathway discrimination assay (fixture)",
    rationale:
      "Discriminate IL-6 signalling hypothesis from competing TGF-β framing using a fixture protocol only.",
    falsifier:
      "If authorised IL-6 readout remains null after protocol freeze, IL-6-dominant claim is not supported.",
    proposedByPrincipalId: "agent-hsi-designer-1",
    proposedByActorKind: "ai_agent",
    createdAt: asOf,
    hypothesisIds: ["hyp-ssc-il6-001"],
    investigationId: "inv-ssc-mech-001",
    n7ExperimentRecordIds: ["EXP-N7-001"],
    evidenceLedgerRecordIds: ["N2-R-002"],
    ...overrides,
  });
}

function seedProtocol(
  overrides?: Partial<Parameters<typeof draftExperimentProtocolVersion>[0]>,
): ExperimentProtocolVersion {
  return draftExperimentProtocolVersion({
    protocolId: "hsi-exp-prot-il6-v1",
    protocolVersion: 1,
    title: "Fixture IL-6 discrimination protocol",
    objective: "Record fixture procedure steps without inventing wet-lab outcomes.",
    procedureSteps: [
      "Freeze prediction content hash before any outcome attach (N7).",
      "Declare missing dose/tissue fields explicitly.",
      "Do not attach fabricated observations.",
    ],
    controls: ["vehicle_fixture", "isotype_fixture"],
    materials: ["fixture_panel_A"],
    safetyNotes: ["Engineering fixture only — not a lab SOP."],
    n7ProtocolId: "n7-prot-fixture-il6",
    lifecycle: "active",
    createdAt: asOf,
    createdByPrincipalId: "principal-researcher-alice",
    ...overrides,
  });
}

function approveAndBind(
  proposal = seedProposal(),
  protocol = seedProtocol(),
): {proposal: ExperimentProposal; protocol: ExperimentProtocolVersion} {
  const submitted = transitionExperimentProposal({
    proposal,
    to: "submitted_for_review",
    updatedAt: asOf,
    actor: {principalId: "agent-hsi-designer-1", actorKind: "ai_agent"},
  });
  const approved = transitionExperimentProposal({
    proposal: submitted,
    to: "researcher_approved",
    updatedAt: asOf,
    actor: {principalId: "principal-researcher-alice", actorKind: "human"},
  });
  const bound = bindProposalToProtocol({
    proposal: approved,
    protocol,
    updatedAt: asOf,
    actor: {principalId: "principal-researcher-alice", actorKind: "human"},
  });
  return {proposal: bound, protocol};
}

describe("experimental lifecycle contracts (M10 PR1)", () => {
  test("drafts proposal with honesty gates and M3/M6/N7 links", () => {
    const proposal = seedProposal();
    expect(proposal.lifecycle).toBe("draft");
    expect(proposal.approvedBy).toBeNull();
    expect(proposal.honesty.agentsProposeResearchersApprove).toBe(true);
    expect(proposal.honesty.aiCannotSelfApproveExperiments).toBe(true);
    expect(proposal.honesty.fabricatedObservations).toBe(false);
    expect(proposal.honesty.closedLoopDiscoveryComplete).toBe(false);
    expect(proposal.honesty.labInstrumentControl).toBe(false);
    expect(proposal.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(proposal.links.hypothesisIds).toEqual(["hyp-ssc-il6-001"]);
    expect(proposal.links.investigationId).toBe("inv-ssc-mech-001");
    expect(proposal.links.n7ExperimentRecordIds).toEqual(["EXP-N7-001"]);
    expect(fingerprintExperimentProposal(proposal)).toMatch(/^[a-f0-9]{64}$/);
  });

  test("rejects AI self-approval of experiments", () => {
    const submitted = transitionExperimentProposal({
      proposal: seedProposal(),
      to: "submitted_for_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-designer-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionExperimentProposal({
        proposal: submitted,
        to: "researcher_approved",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-designer-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers may approve/);
  });

  test("rejects approval when AI principal matches proposer", () => {
    const submitted = transitionExperimentProposal({
      proposal: seedProposal({
        proposedByPrincipalId: "shared-principal",
        proposedByActorKind: "ai_agent",
      }),
      to: "submitted_for_review",
      updatedAt: asOf,
      actor: {principalId: "shared-principal", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionExperimentProposal({
        proposal: submitted,
        to: "researcher_approved",
        updatedAt: asOf,
        // Even if somehow marked human with same principal as AI proposer —
        // transition requires human; self-approve guard still applies when
        // proposer was non-human with matching principal.
        actor: {principalId: "shared-principal", actorKind: "human"},
      }),
    ).toThrow(/AI cannot self-approve/);
  });

  test("binds versioned protocol only after researcher approval", () => {
    const protocol = seedProtocol();
    expect(() =>
      bindProposalToProtocol({
        proposal: seedProposal(),
        protocol,
        updatedAt: asOf,
        actor: {principalId: "principal-researcher-alice", actorKind: "human"},
      }),
    ).toThrow(/researcher_approved/);

    const {proposal} = approveAndBind(seedProposal(), protocol);
    expect(proposal.lifecycle).toBe("protocol_bound");
    expect(proposal.boundProtocolId).toBe("hsi-exp-prot-il6-v1");
    expect(proposal.boundProtocolVersion).toBe(1);
    expect(proposal.approvedBy?.actorKind).toBe("human");
  });

  test("versioned protocols preserve parent lineage", () => {
    const v1 = seedProtocol();
    const v2 = draftExperimentProtocolVersion({
      protocolId: "hsi-exp-prot-il6-v1",
      protocolVersion: 2,
      parentProtocolVersion: 1,
      title: v1.title,
      objective: v1.objective,
      procedureSteps: [...v1.procedureSteps, "Record deviation log entry."],
      deviations: ["timing window extended in fixture only"],
      lifecycle: "draft",
      createdAt: asOf,
      createdByPrincipalId: "principal-researcher-alice",
    });
    expect(v2.parentProtocolVersion).toBe(1);
    expect(v2.protocolVersion).toBe(2);
    expect(() =>
      draftExperimentProtocolVersion({
        protocolId: "hsi-exp-prot-il6-v1",
        protocolVersion: 2,
        parentProtocolVersion: null,
        title: "bad",
        objective: "bad objective text",
        procedureSteps: ["step"],
        createdAt: asOf,
        createdByPrincipalId: "principal-researcher-alice",
      }),
    ).toThrow(/parentProtocolVersion/);
  });

  test("execution records stay non-lab and refuse invented authorised runs", () => {
    const {proposal, protocol} = approveAndBind();
    const planned = draftExperimentExecution({
      id: "hsi-exp-exec-il6-001",
      proposal,
      protocol,
      createdAt: asOf,
      lifecycle: "planned",
    });
    expect(planned.observationsAttached).toBe(false);
    expect(planned.realLabRunClaimed).toBe(false);

    const blocked = draftExperimentExecution({
      id: "hsi-exp-exec-il6-blocked",
      proposal,
      protocol,
      createdAt: asOf,
      lifecycle: "blocked_awaiting_authorisation",
      blockedReason: "Partner lab agreement not supplied; real observation BLOCKED",
    });
    expect(blocked.lifecycle).toBe("blocked_awaiting_authorisation");

    expect(() =>
      draftExperimentExecution({
        id: "hsi-exp-exec-il6-live",
        proposal,
        protocol,
        createdAt: asOf,
        lifecycle: "completed_authorised",
      }),
    ).toThrow(/verified lab connectors/);
  });

  test("results separate raw observation, derived result, and interpretation", () => {
    const {proposal, protocol} = approveAndBind();
    const execution = draftExperimentExecution({
      id: "hsi-exp-exec-il6-fixture",
      proposal,
      protocol,
      createdAt: asOf,
      lifecycle: "completed_fixture",
      dataBasis: "fixture_engineering",
    });

    const raw = draftExperimentalResult({
      id: "hsi-exp-res-raw-001",
      execution,
      layer: "raw_observation",
      summary: "Fixture raw panel pointer only — not a live measurement claim.",
      artifactPointers: ["fixture://panel/il6-raw-001"],
      createdAt: asOf,
      createdByPrincipalId: "principal-researcher-alice",
    });
    expect(raw.layer).toBe("raw_observation");
    expect(raw.fabricated).toBe(false);
    expect(raw.graphPromotable).toBe(false);

    const derived = draftExperimentalResult({
      id: "hsi-exp-res-der-001",
      execution,
      layer: "derived_result",
      summary: "Fixture-derived summary from declared raw pointer.",
      dependsOnResultIds: [raw.id],
      createdAt: asOf,
      createdByPrincipalId: "principal-researcher-alice",
    });
    expect(derived.layer).toBe("derived_result");

    const interpretation = draftExperimentalResult({
      id: "hsi-exp-res-int-001",
      execution,
      layer: "interpretation",
      summary: "Interpretation remains review-gated; not graph-promotable.",
      dependsOnResultIds: [derived.id],
      createdAt: asOf,
      createdByPrincipalId: "principal-researcher-alice",
    });
    expect(interpretation.layer).toBe("interpretation");
    expect(interpretation.scientificApproval).toBe(false);

    expect(() =>
      draftExperimentalResult({
        id: "hsi-exp-res-der-bad",
        execution,
        layer: "derived_result",
        summary: "Missing dependency should fail.",
        createdAt: asOf,
        createdByPrincipalId: "principal-researcher-alice",
      }),
    ).toThrow(/dependsOnResultIds/);
  });

  test("memory store round-trips and pack honesty stays closed", () => {
    const store = createMemoryExperimentalLifecycleStore();
    const {proposal, protocol} = approveAndBind();
    const execution = draftExperimentExecution({
      id: "hsi-exp-exec-store-1",
      proposal,
      protocol,
      createdAt: asOf,
      lifecycle: "planned",
    });
    store.upsertProposal(proposal);
    store.upsertProtocol(protocol);
    store.upsertExecution(execution);

    expect(store.getProposal(proposal.id)?.lifecycle).toBe("protocol_bound");
    expect(store.getProtocol(protocol.protocolId, 1)?.protocolVersion).toBe(1);
    expect(store.listExecutions()).toHaveLength(1);

    const pack = buildExperimentalLifecyclePack({
      proposals: [proposal],
      protocols: [protocol],
      executions: [execution],
      results: [],
      asOf,
    });
    expect(pack.proposalCount).toBe(1);
    expect(pack.honesty.closedLoopDiscoveryComplete).toBe(false);
    expect(pack.honesty.computationalPipelineExecuted).toBe(false);

    const lines = projectExperimentalLifecyclePersistenceLines({
      proposal,
      protocol,
      execution,
    });
    expect(lines).toContain("migration=deferred");
    expect(lines).toContain("closedLoop=false");
    expect(validateExperimentProposal(proposal).honesty.gateCAutoApprove).toBe(
      false,
    );
  });

  test("illegal proposal transitions fail closed", () => {
    expect(() =>
      transitionExperimentProposal({
        proposal: seedProposal(),
        to: "protocol_bound",
        updatedAt: asOf,
        actor: {principalId: "principal-researcher-alice", actorKind: "human"},
      }),
    ).toThrow(/Use bindProposalToProtocol|Illegal proposal transition/);
  });
});
