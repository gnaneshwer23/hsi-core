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

## 0b. Rehearsal (offline, throwaway keys)

```bash
bun scripts/rehearse-live.ts
```

Runs the real loader and the guarded `--execute` path end to end with throwaway keys, a fake KMS client, a synthetic network and synthetic provider responses. It proves the wiring interlocks (signed policy and approvals on disk, receipts signed and verified, provider operations, durable job, credential handling). It proves nothing about science. Run it after any change to the live path.

## 1. Preflight (offline: no network, no model, nothing written)

```bash
bun scripts/run-investigation.ts --mode live --config live.json --integrity-config integrity.json --preflight
```

Exit 0 means every configured piece exists and verifies. Exit 3 lists what is open and who holds it. A pass does not start a run. Deployments' `sourcePolicyRef` must equal the signed policy's `<policyId>:v<version>`; the preflight checks it, because a mismatch makes provider operations refuse every source.

## 2. Retrieval-only dry run (no model)

```bash
bun scripts/retrieval-dry-run.ts --question "..." --terms-ref <signed terms ref> --articles 3
```

Read the cue coverage. If few passages carry every cue, expect most pairs to abstain. Decide the comparability policy with a scientist before spending model budget.

## 3. The run

```bash
bun scripts/run-investigation.ts --mode live --config live.json --integrity-config integrity.json \
  --execute --question "..." --scope gut-immune-metabolic --reviewer user:<your-name> --out out/live
```

`--execute` refuses unless: a named human reviewer (`user:<name>`) is given; the scope is valid; the offline preflight passes; `maxModelCallsPerRun` is 40 or less and `maxArticlesPerIntent` is 3 or less; and a human types `EXECUTE <job id>` at an interactive terminal (no terminal, no run). The run is a durable job (one at a time, never re-run once complete) and re-checks both readiness gates, the kill switch and the daily cap. Integrity config needs `signer.keyVersionName` (an exact Cloud KMS key version) and `signer.publicKeyEnv`. Approvals are read from `approvals/<deploymentId>.json` next to the operation store.

Keep the kill switch variable (named in `limits.killSwitchEnv`) ready to set. Install `@google-cloud/kms` (exact version) where this runs.

## 4. After the run

Read the brief and the review packet. Every output is unapproved and non-promotable. A human decides.
