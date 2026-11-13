# First live investigation: runbook

Scope: one question, a small hard budget, a human reading the output. Nothing in this runbook approves science or promotes anything.

## 0. What must exist first (human-held; code cannot close these)

| Item | Held by |
|---|---|
| Source clearance policy, signed by a named human, with an approval reference | Source-policy owner |
| Approver public key (PEM) in an environment variable named in the config | Security signer |
| Managed signing service for receipts, its Ed25519 public key pinned, no private key in the repo or process | Security signer |
| Europe PMC and Crossref terms signed off; a live check that retraction handling behaves as the policy expects | Source-policy owner |
| One extractor and at least two distinct verifier deployments, each approved, with credentials in environment variables | Model owner |
| A private (0700) directory for the operation store and audit files | Operator |
| A named reviewer authority for the scope (otherwise the review packet is unroutable) | Scientific lead |

## 1. Preflight (offline: no network, no model, nothing written)

```bash
bun scripts/run-investigation.ts --mode live --config live.json --integrity-config integrity.json --preflight
```

Exit 0 means every configured piece exists and verifies. Exit 3 lists what is open and who holds it. A pass does not start a run.

## 2. Retrieval-only dry run (no model)

```bash
bun scripts/retrieval-dry-run.ts --question "..." --terms-ref <signed terms ref> --articles 3
```

Read the cue coverage. If few passages carry every cue, expect most pairs to abstain. Decide the comparability policy with a scientist before spending model budget.

## 3. The run

Not yet wired in the CLI. `runLiveInvestigation` (src/liveRun.ts) refuses unless both readiness gates are ready, the kill switch is clear and the daily cap allows it, and spends one shared model-call budget. Execution needs explicit provider wiring supplied by the operator and is a separate, reviewed change.

Before it: arm the kill switch variable (named in `limits.killSwitchEnv`) and know how to set it. Keep `maxModelCallsPerRun` at or below 40 for the first run.

## 4. After the run

Read the brief and the review packet. Every output is unapproved and non-promotable. A human decides.
