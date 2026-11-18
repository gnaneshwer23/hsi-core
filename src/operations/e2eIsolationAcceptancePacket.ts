/**
 * PR-E2E-02 — staging isolation acceptance packet soft-land.
 *
 * Catalogues the owner-run worksheet and CI-safe suite modes. Never invents
 * security signers, staging URLs, sessions, or signed acceptance. Never lifts
 * migration holds or enables production writes.
 */

export const E2E_ISOLATION_PACKET_SCHEMA = "hsi-e2e-02-isolation-acceptance-1" as const;

export type E2eIsolationSuiteMode = "check" | "fixture" | "live";

export type E2eIsolationScopeId =
  | "interrogative_workspace"
  | "scientific_records"
  | "contradiction_ledger"
  | "live_evidence"
  | "graph_workspace";

export type E2eIsolationScopeRow = {
  scope: E2eIsolationScopeId;
  /** Separate packet required per scope (Next-B). */
  separatePacketRequired: true;
  /** Soft-land never marks accepted. */
  acceptedForScope: false;
  signedPacketRef: null;
  notes: string;
};

export type E2eIsolationPacket = {
  schemaVersion: typeof E2E_ISOLATION_PACKET_SCHEMA;
  purpose: "pr_e2e_02_isolation_acceptance_soft_land";
  backlogId: "PR-E2E-02";
  scientificApproval: false;
  liveExecutionAuthorized: false;
  productionActivationApproved: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  migrationHoldsChanged: false;
  communityWrites: "DEFERRED";
  ciSafeModes: readonly E2eIsolationSuiteMode[];
  ownerGatedModes: readonly E2eIsolationSuiteMode[];
  cli: {
    check: "bun run staging:isolation:check";
    fixture: "bun run staging:isolation:fixture";
    live: "bun run staging:isolation:live -- --scope <scope>";
  };
  runbookPath: "docs/engineering/DB_ISOLATION_SUITE_RUNBOOK.md";
  pendingWorksheetPath: "operations/staging/e2e-02-isolation-acceptance.pending.json";
  nextBPendingPath: "operations/staging/next-b-acceptance.pending.json";
  scopes: readonly E2eIsolationScopeRow[];
  ownerPreconditions: readonly string[];
  honesty: {
    noInventedSigner: true;
    noInventedStagingUrl: true;
    noInventedSessions: true;
    noHoldRemoval: true;
    fixtureIsNotLiveEvidence: true;
  };
};

export type E2eIsolationAssessment = {
  schemaVersion: "hsi-e2e-02-assessment-1";
  suiteMode: E2eIsolationSuiteMode;
  mayClaimAcceptance: false;
  mayClaimLiveEvidence: boolean;
  ciSafe: boolean;
  reasons: string[];
  scientificApproval: false;
  signedPacketClaimed: false;
};

const SCOPES: readonly E2eIsolationScopeRow[] = [
  {
    scope: "interrogative_workspace",
    separatePacketRequired: true,
    acceptedForScope: false,
    signedPacketRef: null,
    notes: "Owned investigation / workspace routes; HTTP observations only with owner sessions.",
  },
  {
    scope: "scientific_records",
    separatePacketRequired: true,
    acceptedForScope: false,
    signedPacketRef: null,
    notes: "Scientific record read/write denial across tenants; non-HTTP privilege evidence required.",
  },
  {
    scope: "contradiction_ledger",
    separatePacketRequired: true,
    acceptedForScope: false,
    signedPacketRef: null,
    notes: "Ledger migrations remain held; observations must not treat hold as acceptance.",
  },
  {
    scope: "live_evidence",
    separatePacketRequired: true,
    acceptedForScope: false,
    signedPacketRef: null,
    notes: "Must not apply forgeable hsi.live_owner_id policies (ADR-013 / liveEvidencePolicyGate).",
  },
  {
    scope: "graph_workspace",
    separatePacketRequired: true,
    acceptedForScope: false,
    signedPacketRef: null,
    notes: "Graph-workspace store stays behind fail-closed flag; soft-land does not enable it.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Create an expiring disposable child of the HSI production branch pin (placeholder ids only in git).",
  "Confirm assertDisposableRehearsalTarget would pass (parent production, not default/primary, expires ≤24h).",
  "Supply sessions via private env only (researcher A/B, reviewer, optional revoked).",
  "Set both HSI_ISOLATION_ORIGIN and HSI_ISOLATION_APPROVED_ORIGIN to the same reviewed staging HTTPS origin.",
  "Set disposable pin env and 64-hex route/runtime binding digests.",
  "Enable HSI_ISOLATION_SUITE_ENABLED=1 and HSI_ISOLATION_LIVE_AUTHORIZED=1 only for that run.",
  "Tear down the disposable branch; confirm production branch untouched.",
  "Independent security signer reviews protected evidence offline — never invented in this soft-land.",
];

export function e2eIsolationAcceptancePacket(): E2eIsolationPacket {
  return {
    schemaVersion: E2E_ISOLATION_PACKET_SCHEMA,
    purpose: "pr_e2e_02_isolation_acceptance_soft_land",
    backlogId: "PR-E2E-02",
    scientificApproval: false,
    liveExecutionAuthorized: false,
    productionActivationApproved: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    migrationHoldsChanged: false,
    communityWrites: "DEFERRED",
    ciSafeModes: ["check", "fixture"],
    ownerGatedModes: ["live"],
    cli: {
      check: "bun run staging:isolation:check",
      fixture: "bun run staging:isolation:fixture",
      live: "bun run staging:isolation:live -- --scope <scope>",
    },
    runbookPath: "docs/engineering/DB_ISOLATION_SUITE_RUNBOOK.md",
    pendingWorksheetPath: "operations/staging/e2e-02-isolation-acceptance.pending.json",
    nextBPendingPath: "operations/staging/next-b-acceptance.pending.json",
    scopes: SCOPES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    honesty: {
      noInventedSigner: true,
      noInventedStagingUrl: true,
      noInventedSessions: true,
      noHoldRemoval: true,
      fixtureIsNotLiveEvidence: true,
    },
  };
}

export function e2eIsolationScopeById(scope: E2eIsolationScopeId): E2eIsolationScopeRow {
  switch (scope) {
    case "interrogative_workspace":
    case "scientific_records":
    case "contradiction_ledger":
    case "live_evidence":
    case "graph_workspace": {
      const row = SCOPES.find((s) => s.scope === scope);
      if (!row) throw new Error(`Missing isolation scope row: ${scope}`);
      return row;
    }
    default: {
      const _exhaustive: never = scope;
      throw new Error(`Unknown isolation scope: ${String(_exhaustive)}`);
    }
  }
}

export function assessE2eIsolationMode(mode: E2eIsolationSuiteMode): E2eIsolationAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-e2e-02-assessment-1",
        suiteMode: mode,
        mayClaimAcceptance: false,
        mayClaimLiveEvidence: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog and hold invariants only",
          "acceptance requires an independently signed offline packet",
        ],
        scientificApproval: false,
        signedPacketClaimed: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-e2e-02-assessment-1",
        suiteMode: mode,
        mayClaimAcceptance: false,
        mayClaimLiveEvidence: false,
        ciSafe: true,
        reasons: [
          "fixture HTTP uses synthetic transport",
          "fixture evidence is not live isolation acceptance",
        ],
        scientificApproval: false,
        signedPacketClaimed: false,
      };
    case "live":
      return {
        schemaVersion: "hsi-e2e-02-assessment-1",
        suiteMode: mode,
        mayClaimAcceptance: false,
        mayClaimLiveEvidence: false,
        ciSafe: false,
        reasons: [
          "live mode is owner-gated and still never signs acceptance",
          "observations require protected evidence plus an independent signer offline",
          "soft-land leaves liveExecutionAuthorized false until owner sets private env",
        ],
        scientificApproval: false,
        signedPacketClaimed: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown isolation suite mode: ${String(_exhaustive)}`);
    }
  }
}

export function assertE2eIsolationPacketSoftLand(packet: E2eIsolationPacket): {
  scopeCount: number;
  acceptedForScope: false;
  signedPacketClaimed: false;
  liveExecutionAuthorized: false;
} {
  if (packet.schemaVersion !== E2E_ISOLATION_PACKET_SCHEMA) {
    throw new Error("unexpected e2e isolation packet schema");
  }
  if (packet.acceptedForScope !== false) throw new Error("soft-land must keep acceptedForScope false");
  if (packet.signedPacketClaimed !== false) throw new Error("soft-land must not claim signed packet");
  if (packet.liveExecutionAuthorized !== false) throw new Error("soft-land must not authorize live");
  if (packet.productionActivationApproved !== false) {
    throw new Error("soft-land must not approve production activation");
  }
  if (packet.migrationHoldsChanged !== false) throw new Error("soft-land must not change holds");
  if (packet.scientificApproval !== false) throw new Error("soft-land must not claim scientific approval");
  if (packet.scopes.length !== 5) throw new Error("expected five isolation scopes");
  for (const scope of packet.scopes) {
    if (scope.acceptedForScope !== false) throw new Error(`scope ${scope.scope} must stay unaccepted`);
    if (scope.signedPacketRef !== null) throw new Error(`scope ${scope.scope} must not invent signer ref`);
  }
  return {
    scopeCount: packet.scopes.length,
    acceptedForScope: false,
    signedPacketClaimed: false,
    liveExecutionAuthorized: false,
  };
}
