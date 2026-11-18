/**
 * A1.3 / OPS-01–02 — typed product alert catalog (soft-land).
 *
 * Documents the four Pack §5 alerts and their intended signals. Does not
 * deliver on-call notifications, open Sentry, or invent destinations.
 * Live wiring stays owner-gated (D-120 vendor; D-122 on-call).
 */

export const OPS_ALERT_CATALOG_SCHEMA = "hsi-ops-alert-catalog-1" as const;

export type OpsAlertKind =
  | "error_spike"
  | "run_failure_rate"
  | "model_spend_cap"
  | "probe_failure";

export type OpsAlertDeliveryStatus =
  | "documented_only"
  | "dry_run_pending"
  | "owner_destination_pending";

export type OpsAlertDefinition = {
  kind: OpsAlertKind;
  packRef: "OPS-01" | "OPS-02";
  title: string;
  /** Threshold wording from Pack §5 — not a calibrated scientific floor. */
  threshold: string;
  /** Existing or planned signal sources (no invented vendor accounts). */
  signalSources: readonly string[];
  /** Staging force-test steps; do not claim live delivery. */
  forceTestSteps: readonly string[];
  /** First response when the alert would fire (kill switch / rollback / investigate). */
  firstResponse: string;
  deliveryStatus: OpsAlertDeliveryStatus;
  onCallInvented: false;
};

export type OpsAlertCatalog = {
  schemaVersion: typeof OPS_ALERT_CATALOG_SCHEMA;
  purpose: "ops_error_alerts_soft_land";
  scientificApproval: false;
  onCallDeliveryClaimed: false;
  errorTrackingVendor: "pending_D-120";
  logDrain: "pending_owner";
  alerts: readonly OpsAlertDefinition[];
};

const ALERTS: readonly OpsAlertDefinition[] = [
  {
    kind: "error_spike",
    packRef: "OPS-02",
    title: "Error spike",
    threshold: "Elevated 5xx / uncaught error rate relative to recent baseline (configure after D-120).",
    signalSources: [
      "Future Sentry (or equivalent) with release tags + PII scrubbing (D-120)",
      "hsi-research-http-event-1 via HSI_OPERATIONAL_LOGGING (status>=500)",
      "Vercel function logs / log drain (owner-provisioned)",
    ],
    forceTestSteps: [
      "Staging only: emit a deliberate 500 from a non-PHI test route or inject a Sentry test event once D-120 is provisioned",
      "Confirm the event is visible in the chosen tracker within ~1 minute (OPS-01 acceptance)",
      "Confirm the spike rule would page the documented destination — do not invent Slack/PagerDuty here",
    ],
    firstResponse: "Check recent deploys; roll back if correlated; preserve request IDs; no PHI in tickets.",
    deliveryStatus: "documented_only",
    onCallInvented: false,
  },
  {
    kind: "run_failure_rate",
    packRef: "OPS-02",
    title: "Run failure rate",
    threshold: "Investigation / live-run failure rate > 20% over a 1-hour window.",
    signalSources: [
      "Live investigation outcomes (failed / not_configured / provider errors)",
      "hsi-research-http-event-1 admission and status fields",
      "Future run metrics tables (Pack §5) once persistence lands",
    ],
    forceTestSteps: [
      "Staging only: drive a controlled burst of failing live runs (fixture / disabled provider)",
      "Compute failure rate over a 1-hour window from logs or staging metrics",
      "Record whether the rule would fire; leave destination acknowledgement null until owner sets one",
    ],
    firstResponse: "Confirm provider status; abstain rather than invent findings; investigate model/config regressions.",
    deliveryStatus: "documented_only",
    onCallInvented: false,
  },
  {
    kind: "model_spend_cap",
    packRef: "OPS-02",
    title: "Model spend near daily cap",
    threshold: "Model spend > 80% of the owner-set daily cap (A1.2 / B5; provider console caps).",
    signalSources: [
      "Provider console spend dashboards (required; not inventable in git)",
      "HSI_LIVE_MODEL_DAILY_RUNS per-instance ceiling (safety net only)",
      "HSI_LIVE_MODEL_STEP_ENABLED kill switch",
    ],
    forceTestSteps: [
      "Confirm owner-set numeric caps exist in provider consoles (B5) before claiming this alert live",
      "Staging dry-run: lower a staging-only daily run ceiling and approach 80% with synthetic calls",
      "Verify first response uses kill switch HSI_LIVE_MODEL_STEP_ENABLED=false then redeploy",
    ],
    firstResponse: "Set HSI_LIVE_MODEL_STEP_ENABLED=false and redeploy; investigate abuse vs legitimate load.",
    deliveryStatus: "documented_only",
    onCallInvented: false,
  },
  {
    kind: "probe_failure",
    packRef: "OPS-02",
    title: "Production probe failure",
    threshold: "Scheduled production probe (or staging probe dry-run) fails health / research surface checks.",
    signalSources: [
      ".github/workflows/production-probe.yml (every 30 minutes + post-main push)",
      "scripts/probe-deploy.ts against the production origin",
      "GET /api/health and /api/research/live|/health",
    ],
    forceTestSteps: [
      "Staging dry-run: point a private probe at a staging URL and force a failing check (bad path or maintenance flag)",
      "Confirm GitHub Actions failure is visible; do not invent an external pager destination",
      "Production: rely on existing workflow failure notifications until D-122 on-call is named",
    ],
    firstResponse: "Inspect latest deploy and /api/health; roll back if probe fails after a code change.",
    deliveryStatus: "documented_only",
    onCallInvented: false,
  },
] as const;

export function opsAlertCatalog(): OpsAlertCatalog {
  return {
    schemaVersion: OPS_ALERT_CATALOG_SCHEMA,
    purpose: "ops_error_alerts_soft_land",
    scientificApproval: false,
    onCallDeliveryClaimed: false,
    errorTrackingVendor: "pending_D-120",
    logDrain: "pending_owner",
    alerts: ALERTS,
  };
}

export function opsAlertByKind(kind: OpsAlertKind): OpsAlertDefinition {
  switch (kind) {
    case "error_spike":
    case "run_failure_rate":
    case "model_spend_cap":
    case "probe_failure": {
      const found = ALERTS.find((a) => a.kind === kind);
      if (!found) throw Error(`Missing alert definition: ${kind}`);
      return found;
    }
    default: {
      const _exhaustive: never = kind;
      throw Error(`Unknown ops alert kind: ${String(_exhaustive)}`);
    }
  }
}

/** Soft-land acceptance: catalog is complete and never claims live delivery. */
export function assertOpsAlertCatalogSoftLand(catalog: OpsAlertCatalog = opsAlertCatalog()): {
  alertCount: 4;
  onCallDeliveryClaimed: false;
  kinds: OpsAlertKind[];
} {
  if (catalog.schemaVersion !== OPS_ALERT_CATALOG_SCHEMA) {
    throw Error("Unsupported ops alert catalog schema");
  }
  if (catalog.onCallDeliveryClaimed !== false) {
    throw Error("Ops alert catalog must not claim on-call delivery");
  }
  if (catalog.scientificApproval !== false) {
    throw Error("Ops alert catalog cannot claim scientific approval");
  }
  if (catalog.alerts.length !== 4) {
    throw Error("Pack §5 requires exactly four product alerts");
  }
  const kinds = catalog.alerts.map((a) => a.kind);
  const expected: OpsAlertKind[] = [
    "error_spike",
    "run_failure_rate",
    "model_spend_cap",
    "probe_failure",
  ];
  for (const kind of expected) {
    if (!kinds.includes(kind)) throw Error(`Missing required alert: ${kind}`);
  }
  for (const alert of catalog.alerts) {
    if (alert.onCallInvented !== false) {
      throw Error(`Alert ${alert.kind} invents on-call delivery`);
    }
    if (alert.deliveryStatus === "documented_only" || alert.deliveryStatus === "dry_run_pending" || alert.deliveryStatus === "owner_destination_pending") {
      /* allowed soft-land states */
    } else {
      const _exhaustive: never = alert.deliveryStatus;
      throw Error(`Unexpected delivery status: ${String(_exhaustive)}`);
    }
  }
  return {alertCount: 4, onCallDeliveryClaimed: false, kinds: expected};
}
