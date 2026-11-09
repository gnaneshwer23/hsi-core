/**
 * Staging two-account Auth + research writes prep (production-readiness audit Phase #5).
 * Engineering harness + fail-closed write-gate honesty. Never invents neon_auth principals,
 * grants production research access, Gate C auto-approve, MoU, or live CDS/PHI.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";
import {
  FORBIDDEN_NEON_MARKERS,
  HSI_DISPOSABLE_BRANCH_ID,
  HSI_NEON_BRANCH_ID,
  HSI_NEON_HOST_PREFIX,
  HSI_NEON_PROJECT_ID,
  HSI_STAGING_BRANCH_ID,
  HSI_STAGING_HOST_PREFIX,
  assertHsiNeonDatabaseUrl,
  isForbiddenNeonTarget,
} from "../db/neonGuard";
import {readResearchDeploymentConfig} from "../server/vercelResearch";

export const STAGING_TWO_ACCOUNT_AUTH_PREP_SCHEMA =
  "hsi-staging-two-account-auth-prep-1" as const;

export type StagingPrepCheckStatus = "CLEARED" | "BLOCKED" | "PENDING_OPS";

export type StagingPrepCheckId =
  | "write_gate_fail_closed_documented"
  | "production_writes_cannot_enable"
  | "autumn_snow_refused"
  | "auth_db_prefix_alignment_rule"
  | "health_expected_shape_documented"
  | "account_roster_slots_reserved"
  | "operator_checklist_published"
  | "staging_vercel_env_aligned"
  | "two_verified_neon_auth_principals"
  | "research_grants_provisioned"
  | "staging_writes_flag_flipped"
  | "live_two_account_journey_recorded"
  | "production_writes_remain_disabled";

export type StagingPrepCheck = {
  id: StagingPrepCheckId;
  title: string;
  plane: "engineering" | "ops";
  status: StagingPrepCheckStatus;
  evidence: string;
};

export type StagingAccountSlotRole = "researcher" | "reviewer" | "grant_operator";

/** Anonymous role slots only — neonAuthUserId stays null until a real principal exists. */
export type StagingAccountSlot = {
  slotId: string;
  role: StagingAccountSlotRole;
  roleLabel: string;
  neonAuthUserId: null;
  email: null;
  emailVerified: false;
  researchAccessGranted: false;
  reviewerAuthorityGranted: false;
  notes: string;
};

export type WriteGateHonesty = {
  stagingBranchId: typeof HSI_STAGING_BRANCH_ID;
  stagingHostPrefix: typeof HSI_STAGING_HOST_PREFIX;
  productionHostPrefix: typeof HSI_NEON_HOST_PREFIX;
  productionBranchId: typeof HSI_NEON_BRANCH_ID;
  disposableBranchId: typeof HSI_DISPOSABLE_BRANCH_ID;
  neonProjectId: typeof HSI_NEON_PROJECT_ID;
  writesRequireExactTriple: [
    "HSI_RESEARCH_WRITES_ENABLED=true",
    `HSI_NEON_BRANCH_ID=${typeof HSI_STAGING_BRANCH_ID}`,
    `databaseEndpointPrefix=${typeof HSI_STAGING_HOST_PREFIX}`,
  ];
  productionWritesWithStagingFlags: false;
  defaultWritesEnabled: false;
  forbiddenMarkersSample: readonly string[];
};

export type StagingTwoAccountAuthPrep = {
  schemaVersion: typeof STAGING_TWO_ACCOUNT_AUTH_PREP_SCHEMA;
  phase: "staging_two_account_auth";
  remediationPhase: "production_readiness_audit_phase_5";
  generatedAt: string;
  engineeringScaffold: "CLEARED";
  opsAcceptance: "BLOCKED";
  liveAuthVerified: false;
  researchWritesLiveVerified: false;
  productionResearchAccessGranted: false;
  inventedNeonAuthPrincipalsPermitted: false;
  writeGate: WriteGateHonesty;
  honesty: {
    roleSlotsAreNotAccounts: true;
    healthValidatedIsNotLiveAcceptance: true;
    noProductionWritesWithoutVerifiedPrincipal: true;
    noInventedNeonAuthPrincipals: true;
    noAutumnSnowForHsi: true;
    noGateCAutoApprove: true;
    noLiveCdsPhi: true;
    noInventedMou: true;
    authSignupPolishDeferredForFounderGmail: true;
    redWaveOnlyForHsi: true;
  };
  accountRosterSlots: StagingAccountSlot[];
  founderMustFlip: string[];
  codeCanAutomate: string[];
  checks: StagingPrepCheck[];
  summary: {
    engineeringChecksCleared: number;
    engineeringChecksTotal: number;
    opsChecksPending: number;
    opsChecksTotal: number;
    accountSlotsReserved: number;
    accountSlotsFilled: 0;
  };
  residualOpsSteps: string[];
  prepHash: string;
};

export class StagingTwoAccountAuthPrepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StagingTwoAccountAuthPrepError";
  }
}

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function seal(body: Omit<StagingTwoAccountAuthPrep, "prepHash">): StagingTwoAccountAuthPrep {
  return {...body, prepHash: digest(body)};
}

function defaultAccountSlots(): StagingAccountSlot[] {
  return [
    {
      slotId: "STAGING-ACCT-RESEARCHER",
      role: "researcher",
      roleLabel: "Staging researcher",
      neonAuthUserId: null,
      email: null,
      emailVerified: false,
      researchAccessGranted: false,
      reviewerAuthorityGranted: false,
      notes:
        "Distinct neon_auth principal on red-wave staging Auth (ep-hsi-staging). Fill only after real signup + email verify.",
    },
    {
      slotId: "STAGING-ACCT-REVIEWER",
      role: "reviewer",
      roleLabel: "Staging independent reviewer",
      neonAuthUserId: null,
      email: null,
      emailVerified: false,
      researchAccessGranted: false,
      reviewerAuthorityGranted: false,
      notes:
        "Second distinct neon_auth principal. Must not be the investigation author. Grant reviewer authority only after verified user id.",
    },
    {
      slotId: "STAGING-ACCT-GRANT-OPS",
      role: "grant_operator",
      roleLabel: "Grant / identity operator",
      neonAuthUserId: null,
      email: null,
      emailVerified: false,
      researchAccessGranted: false,
      reviewerAuthorityGranted: false,
      notes:
        "Trusted operator who provisions hsi_research_access rows. Never invent user ids or flip emailVerified in SQL.",
    },
  ];
}

function writeGateHonesty(): WriteGateHonesty {
  return {
    stagingBranchId: HSI_STAGING_BRANCH_ID,
    stagingHostPrefix: HSI_STAGING_HOST_PREFIX,
    productionHostPrefix: HSI_NEON_HOST_PREFIX,
    productionBranchId: HSI_NEON_BRANCH_ID,
    disposableBranchId: HSI_DISPOSABLE_BRANCH_ID,
    neonProjectId: HSI_NEON_PROJECT_ID,
    writesRequireExactTriple: [
      "HSI_RESEARCH_WRITES_ENABLED=true",
      `HSI_NEON_BRANCH_ID=${HSI_STAGING_BRANCH_ID}`,
      `databaseEndpointPrefix=${HSI_STAGING_HOST_PREFIX}`,
    ],
    productionWritesWithStagingFlags: false,
    defaultWritesEnabled: false,
    forbiddenMarkersSample: FORBIDDEN_NEON_MARKERS.slice(0, 4),
  };
}

/** Pure write-gate honesty samples used by harness + tests (no network). */
export function assessWriteGateHonestySamples(): {
  stagingWritesEnabled: true;
  productionWritesEnabled: false;
  autumnSnowRefused: true;
  defaultWritesDisabled: true;
} {
  const base = {
    HSI_PUBLIC_ORIGIN: "https://staging.example.invalid",
    HSI_AUTH_BASE_URL: "https://ep-hsi-staging.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth",
    VITE_HSI_AUTH_BASE_URL:
      "https://ep-hsi-staging.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth",
    HSI_DATABASE_URL:
      "postgresql://test:never-used@ep-hsi-staging.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require",
    HSI_NEON_PROJECT_ID: HSI_NEON_PROJECT_ID,
  };
  const staging = readResearchDeploymentConfig({
    ...base,
    HSI_RESEARCH_WRITES_ENABLED: "true",
    HSI_NEON_BRANCH_ID: HSI_STAGING_BRANCH_ID,
  });
  const production = readResearchDeploymentConfig({
    ...base,
    HSI_DATABASE_URL:
      "postgresql://test:never-used@ep-hsi-production.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require",
    HSI_AUTH_BASE_URL:
      "https://ep-hsi-production.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth",
    VITE_HSI_AUTH_BASE_URL:
      "https://ep-hsi-production.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth",
    HSI_RESEARCH_WRITES_ENABLED: "true",
    HSI_NEON_BRANCH_ID: HSI_STAGING_BRANCH_ID,
  });
  const defaults = readResearchDeploymentConfig(base);
  const autumn = assertHsiNeonDatabaseUrl(
    "postgresql://x:y@ep-isi-product-example.eu-west-2.aws.neon.tech/neondb?sslmode=require",
    {neonProjectId: HSI_NEON_PROJECT_ID},
  );
  if (!staging.ok || !staging.writesEnabled) {
    throw new StagingTwoAccountAuthPrepError("Staging write-gate sample must enable writes");
  }
  if (!production.ok || production.writesEnabled) {
    throw new StagingTwoAccountAuthPrepError("Production host must refuse writes even with staging flags");
  }
  if (!defaults.ok || defaults.writesEnabled) {
    throw new StagingTwoAccountAuthPrepError("Default config must keep writesEnabled=false");
  }
  if (autumn.ok || !isForbiddenNeonTarget("isi-neon-project")) {
    throw new StagingTwoAccountAuthPrepError("autumn-snow / ep-isi-product must remain refused");
  }
  return {
    stagingWritesEnabled: true,
    productionWritesEnabled: false,
    autumnSnowRefused: true,
    defaultWritesDisabled: true,
  };
}

function buildChecks(): StagingPrepCheck[] {
  const samples = assessWriteGateHonestySamples();
  return [
    {
      id: "write_gate_fail_closed_documented",
      title: "Research write gate requires staging triple (flag + branch + host)",
      plane: "engineering",
      status: "CLEARED",
      evidence: `Triple enforced in readResearchDeploymentConfig; samples stagingWrites=${samples.stagingWritesEnabled}.`,
    },
    {
      id: "production_writes_cannot_enable",
      title: "Production endpoint cannot enable research writes with staging flags",
      plane: "engineering",
      status: samples.productionWritesEnabled === false ? "CLEARED" : "BLOCKED",
      evidence: `productionWritesEnabled=${samples.productionWritesEnabled}; host ${HSI_NEON_HOST_PREFIX}.`,
    },
    {
      id: "autumn_snow_refused",
      title: "ISI autumn-snow / ep-isi-product refused for HSI substrate",
      plane: "engineering",
      status: samples.autumnSnowRefused ? "CLEARED" : "BLOCKED",
      evidence: "neonGuard assertHsiNeonDatabaseUrl + FORBIDDEN_NEON_MARKERS.",
    },
    {
      id: "auth_db_prefix_alignment_rule",
      title: "Auth ↔ database endpoint-prefix alignment fails closed",
      plane: "engineering",
      status: "CLEARED",
      evidence: "endpointPrefixesMatch required; mixed staging/production Auth/DB → configuration_required.",
    },
    {
      id: "health_expected_shape_documented",
      title: "Health expected shape documented (writesEnabled default false)",
      plane: "engineering",
      status: samples.defaultWritesDisabled ? "CLEARED" : "BLOCKED",
      evidence:
        "GET /api/research/health → configuration_validated + writesEnabled:false until founder flips staging flags.",
    },
    {
      id: "account_roster_slots_reserved",
      title: "Anonymous researcher/reviewer/operator account slots reserved",
      plane: "engineering",
      status: "CLEARED",
      evidence: "Three slots with neonAuthUserId=null; principals not invented.",
    },
    {
      id: "operator_checklist_published",
      title: "Operator two-account staging checklist published",
      plane: "engineering",
      status: "CLEARED",
      evidence: "docs/engineering/STAGING_TWO_ACCOUNT_AUTH_CHECKLIST.md",
    },
    {
      id: "staging_vercel_env_aligned",
      title: "Vercel Preview env aligned to red-wave staging branch",
      plane: "ops",
      status: "PENDING_OPS",
      evidence:
        "Founder must set HSI_DATABASE_URL / HSI_AUTH_BASE_URL / VITE_HSI_AUTH_BASE_URL / HSI_PUBLIC_ORIGIN on Preview for br-rough-snow.",
    },
    {
      id: "two_verified_neon_auth_principals",
      title: "Two distinct email-verified neon_auth principals on staging Auth",
      plane: "ops",
      status: "PENDING_OPS",
      evidence: "accountSlotsFilled=0. Signup polish for founder Gmail still deferred — use real verified test accounts.",
    },
    {
      id: "research_grants_provisioned",
      title: "hsi_research_access grants for verified immutable user ids only",
      plane: "ops",
      status: "PENDING_OPS",
      evidence: "Do not grant without neon_auth user id; do not infer roles from email; no SQL emailVerified bypass.",
    },
    {
      id: "staging_writes_flag_flipped",
      title: "Staging-only HSI_RESEARCH_WRITES_ENABLED + HSI_NEON_BRANCH_ID flip",
      plane: "ops",
      status: "PENDING_OPS",
      evidence: `Only after two-account dry-run plan; branch ${HSI_STAGING_BRANCH_ID}; host ${HSI_STAGING_HOST_PREFIX}.`,
    },
    {
      id: "live_two_account_journey_recorded",
      title: "Live two-account journey recorded (create → submit → independent decide)",
      plane: "ops",
      status: "PENDING_OPS",
      evidence: "PRODUCTION_QA + Phase D acceptance still pending; fixture e2e ≠ live Auth/DB.",
    },
    {
      id: "production_writes_remain_disabled",
      title: "Production research writes remain disabled",
      plane: "ops",
      status: "PENDING_OPS",
      evidence: "www.humansuperintelligence.tech must keep writesEnabled=false; no production grant without verified principal.",
    },
  ];
}

/** Build fail-closed Phase #5 prep packet (offline; no live Auth or Neon writes). */
export function buildStagingTwoAccountAuthPrep(input: {
  generatedAt: string;
}): StagingTwoAccountAuthPrep {
  const accountRosterSlots = defaultAccountSlots();
  const checks = buildChecks();
  const eng = checks.filter((c) => c.plane === "engineering");
  const ops = checks.filter((c) => c.plane === "ops");
  const engCleared = eng.filter((c) => c.status === "CLEARED").length;
  const opsPending = ops.filter((c) => c.status === "PENDING_OPS" || c.status === "BLOCKED").length;
  if (engCleared !== eng.length) {
    throw new StagingTwoAccountAuthPrepError(
      "Engineering staging-auth checks must all CLEARED before writing artifact",
    );
  }
  if (opsPending !== ops.length) {
    throw new StagingTwoAccountAuthPrepError(
      "Ops staging-auth checks must remain PENDING_OPS until live acceptance",
    );
  }

  return seal({
    schemaVersion: STAGING_TWO_ACCOUNT_AUTH_PREP_SCHEMA,
    phase: "staging_two_account_auth",
    remediationPhase: "production_readiness_audit_phase_5",
    generatedAt: input.generatedAt,
    engineeringScaffold: "CLEARED",
    opsAcceptance: "BLOCKED",
    liveAuthVerified: false,
    researchWritesLiveVerified: false,
    productionResearchAccessGranted: false,
    inventedNeonAuthPrincipalsPermitted: false,
    writeGate: writeGateHonesty(),
    honesty: {
      roleSlotsAreNotAccounts: true,
      healthValidatedIsNotLiveAcceptance: true,
      noProductionWritesWithoutVerifiedPrincipal: true,
      noInventedNeonAuthPrincipals: true,
      noAutumnSnowForHsi: true,
      noGateCAutoApprove: true,
      noLiveCdsPhi: true,
      noInventedMou: true,
      authSignupPolishDeferredForFounderGmail: true,
      redWaveOnlyForHsi: true,
    },
    accountRosterSlots,
    founderMustFlip: [
      "Align Vercel Preview HSI_* + VITE_HSI_* to red-wave staging branch hsi-staging-branch / ep-hsi-staging (never autumn-snow).",
      "Set VITE_HSI_USE_AUTH_GATEWAY=true on that Preview deployment and redeploy.",
      "Create two distinct neon_auth accounts on staging Auth; complete email verification (no SQL emailVerified bypass). Auth signup polish for founder Gmail remains deferred.",
      "As grant operator, insert hsi_research_access only for verified immutable user ids (researcher vs independent reviewer).",
      "After dry-run plan: set HSI_RESEARCH_WRITES_ENABLED=true and HSI_NEON_BRANCH_ID=hsi-staging-branch on Preview only.",
      "Keep production (ep-hsi-production) writesEnabled=false; never grant production research access without a verified neon_auth principal on production Auth.",
      "Record private evidence of the live two-account journey (self-review denial, wrong-owner denial, revoke rehearsal) without tokens or PHI.",
    ],
    codeCanAutomate: [
      "Offline write-gate honesty samples (staging enable / production refuse / default false).",
      "neonGuard refusal of autumn-snow / forbidden markers.",
      "Health + session-diagnostics contract shape documentation and unit tests.",
      "Anonymous account roster slots + prepHash seal / parse.",
      "Operator checklist + Audit #5 receipt stamps (ENG CLEARED / OPS BLOCKED).",
      "Read-only check-hsi-staging preflight when NEON_API_KEY + HSI_STAGING_APP_URL are present (does not create accounts).",
    ],
    checks,
    summary: {
      engineeringChecksCleared: engCleared,
      engineeringChecksTotal: eng.length,
      opsChecksPending: opsPending,
      opsChecksTotal: ops.length,
      accountSlotsReserved: accountRosterSlots.length,
      accountSlotsFilled: 0,
    },
    residualOpsSteps: [
      "Confirm Preview deployment /api/research/health shows configuration_validated, authUrlsMatch, endpointPrefixesMatch, writesEnabled=false before flipping writes.",
      "Sign up + verify two staging accounts; confirm /research/account shows approval-required until grants exist.",
      "Provision researcher + independent reviewer grants from verified neon_auth user ids only.",
      "Flip staging write flags; exercise create → graph-context → brief → submit → independent decision → revision path.",
      "Repeat denials: anonymous, revoked, wrong-owner, self-review, writes-disabled.",
      "Leave production writes disabled; Auth signup polish for founder Gmail stays deferred.",
      "Re-run bun run staging:auth-prep:check; opsAcceptance stays BLOCKED until a human ops receipt replaces this scaffold.",
    ],
  });
}

export function parseStagingTwoAccountAuthPrep(value: unknown): StagingTwoAccountAuthPrep {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new StagingTwoAccountAuthPrepError("Invalid staging two-account Auth prep packet");
  }
  const prep = value as StagingTwoAccountAuthPrep;
  if (
    prep.schemaVersion !== STAGING_TWO_ACCOUNT_AUTH_PREP_SCHEMA ||
    prep.phase !== "staging_two_account_auth" ||
    prep.remediationPhase !== "production_readiness_audit_phase_5"
  ) {
    throw new StagingTwoAccountAuthPrepError("Unsupported staging Auth prep schema");
  }
  if (
    prep.opsAcceptance !== "BLOCKED" ||
    prep.liveAuthVerified !== false ||
    prep.researchWritesLiveVerified !== false ||
    prep.productionResearchAccessGranted !== false ||
    prep.inventedNeonAuthPrincipalsPermitted !== false ||
    prep.summary.accountSlotsFilled !== 0
  ) {
    throw new StagingTwoAccountAuthPrepError(
      "Staging Auth prep cannot claim live ops acceptance or filled account slots",
    );
  }
  if (!Array.isArray(prep.accountRosterSlots) || prep.accountRosterSlots.length < 2) {
    throw new StagingTwoAccountAuthPrepError("Staging Auth prep must reserve researcher + reviewer slots");
  }
  for (const slot of prep.accountRosterSlots) {
    if (
      slot.neonAuthUserId !== null ||
      slot.email !== null ||
      slot.emailVerified !== false ||
      slot.researchAccessGranted !== false ||
      slot.reviewerAuthorityGranted !== false
    ) {
      throw new StagingTwoAccountAuthPrepError(
        "Staging Auth prep cannot invent neon_auth principals, emails, or grants",
      );
    }
  }
  if (!Array.isArray(prep.checks) || prep.checks.length === 0) {
    throw new StagingTwoAccountAuthPrepError("Staging Auth prep checks missing");
  }
  for (const check of prep.checks) {
    if (check.plane === "ops" && check.status === "CLEARED") {
      throw new StagingTwoAccountAuthPrepError(`Ops check ${check.id} cannot be CLEARED in empty prep`);
    }
  }
  if (prep.writeGate.productionWritesWithStagingFlags !== false || prep.writeGate.defaultWritesEnabled !== false) {
    throw new StagingTwoAccountAuthPrepError("Write-gate honesty must keep production/default writes false");
  }
  if (
    prep.writeGate.stagingBranchId !== HSI_STAGING_BRANCH_ID ||
    prep.writeGate.stagingHostPrefix !== HSI_STAGING_HOST_PREFIX ||
    prep.writeGate.neonProjectId !== HSI_NEON_PROJECT_ID
  ) {
    throw new StagingTwoAccountAuthPrepError("Write-gate honesty must bind red-wave staging constants");
  }
  const {prepHash, ...body} = prep;
  const expected = digest(body);
  if (prepHash !== expected) {
    throw new StagingTwoAccountAuthPrepError("Staging Auth prep hash mismatch");
  }
  return prep;
}
