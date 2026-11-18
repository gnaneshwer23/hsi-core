# A1.3 — Error tracking + four alerts (OPS-01 / OPS-02) soft-land

**Status:** Engineering soft-land. Alerts are **documented**; staging dry-run notes are ready.  
**Not claimed:** live Sentry (or equivalent) project, log drain account, Slack/PagerDuty/email delivery, or named on-call.

Binding plan row: [`docs/plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md`](../plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md) — A1.3.  
Pack source: [`docs/engineering-pack/v1.1/markdown/13_Infrastructure_DevOps_and_Deployment.md`](../engineering-pack/v1.1/markdown/13_Infrastructure_DevOps_and_Deployment.md) §5–6.  
Typed catalog: [`src/operations/opsAlertCatalog.ts`](../../src/operations/opsAlertCatalog.ts).  
Staging worksheet: [`operations/staging/ops-alerts-dry-run.pending.json`](../../operations/staging/ops-alerts-dry-run.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Error tracking vendor (D-120) | Documented recommendation only (Sentry free/team, EU region). No DSN in git. |
| Log drain | Vercel → owner log store; not provisioned by this PR. |
| Four Pack §5 alerts | Named with thresholds, signals, force-test steps, first response. |
| On-call delivery (D-122) | **Not invented.** Destination fields stay null until the owner sets them. |
| A1.2 spend caps (B5) | Optional dependency. Spend alert dry-run stays blocked until owner caps exist. |
| PHI / CDS | Scrubbing required when D-120 lands; no patient data in research ops logs. |

## OPS-01 — Error tracking and log drain (approach)

| Piece | Current | Soft-land next step (owner) |
| --- | --- | --- |
| Structured HTTP events | `hsi-research-http-event-1` in `src/server/researchRequestControls.ts`; gated by `HSI_OPERATIONAL_LOGGING` | Keep PII-free; drain to a log store |
| Console emit | `researchOperationalLogger` (5xx / admission by default) | Same schema into drain |
| Front-end / API errors | None wired | Provision Sentry (or equivalent) with release tags + PII scrubbing |
| Test error ≤1 minute | Not live | After D-120: staging test event; record receipt privately |

## OPS-02 — Four alerts

| Kind | Threshold (Pack §5) | Primary existing signal |
| --- | --- | --- |
| `error_spike` | Elevated 5xx / uncaught errors | Future tracker + operational HTTP events |
| `run_failure_rate` | Failure rate > 20% over 1 hour | Live investigation / research HTTP outcomes |
| `model_spend_cap` | Spend > 80% of daily cap | Provider consoles + `HSI_LIVE_MODEL_*` kill switch / ceiling |
| `probe_failure` | Probe fails | `.github/workflows/production-probe.yml` + `scripts/probe-deploy.ts` |

First response for spend: set `HSI_LIVE_MODEL_STEP_ENABLED=false` and redeploy (runbook).  
First response for probe after a bad deploy: Vercel instant rollback to the previous production deployment.

Pilot SQLite alert ledgers under `src/operations/pilot*` are **not** OPS-02 acceptance — they mock delivery and must not be treated as on-call.

## Staging dry-run checklist

Complete privately; leave git worksheet fields null until true.

### D0 — Preconditions

- [ ] Staging origin and Neon staging pins confirmed (no production write enablement from this checklist)
- [ ] `HSI_OPERATIONAL_LOGGING` behaviour understood (false = 5xx/admission only; true = all requests)
- [ ] No PHI / live CDS in any forced error payload

### D1 — Error spike (OPS-01 path)

- [ ] Owner provisions D-120 **or** records “deferred” with date
- [ ] Staging: force a non-PHI test error; note visibility time
- [ ] Confirm scrubbing rules reject identifiers before any production enablement

### D2 — Run failure rate

- [ ] Staging: produce a controlled failure burst (disabled provider / fixture)
- [ ] Compute 1-hour failure rate from logs; note whether >20% would fire
- [ ] Destination acknowledgement stays null unless a real channel exists

### D3 — Model spend near cap

- [ ] Confirm B5 numeric caps in provider consoles (or mark blocked)
- [ ] Staging-only ceiling exercise toward 80%; practice kill switch
- [ ] Do not invent shared spend telemetry that does not exist

### D4 — Probe failure

- [ ] Confirm production-probe workflow is green on `main`
- [ ] Staging dry-run: fail a private probe deliberately; record Actions visibility
- [ ] Do not invent PagerDuty/Slack until D-122 names on-call

### D5 — Close-out

- [ ] Fill private receipt (no secrets); update `ops-alerts-dry-run.pending.json` only with real timestamps/refs
- [ ] Keep `onCallDeliveryClaimed: false` until delivery is real

## Explicit non-goals

- Adding `@sentry/*` or OpenTelemetry packages in this soft-land
- Committing DSNs, webhook URLs, or alert destination secrets
- Claiming OPS-01 “test error in 1 minute” or OPS-02 “forced in production destination”
- Treating pilot `deliverPilotAlerts` mock as product on-call
- Gate C auto-approve, MoU invention, shared Neon with immunecity, live CDS/PHI

## Verify (offline)

```bash
bun test test/opsAlertCatalog.test.ts
```
