# Synthetic clinical plane (Phase 2 slice)

**Status:** runnable on synthetic data only. Lives in `src/clinicalPlane/` so it can be lifted into a separate private repo without edits. It does not change `AGENTS.md`, the PHI/CDS boundary or any migration hold. Real data is refused in code (`real_data_not_enabled`) until the two-plane ADR is approved and a data source exists.

## What it demonstrates
Run `bun scripts/clinical-plane-demo.ts`.

1. A **phenotype definition** (public, flows down from the scientific plane; here linked by reference to a graph gap) is validated.
2. It is **evaluated inside the plane** against the repository's 200 synthetic profiles. Each criterion is met, not met or **unknown**; patients who might still qualify are reported as *indeterminate*, never silently excluded.
3. Only an **aggregate** leaves the evaluator. Matched ids stay inside.
4. The **release gate** is the only way up. It refuses: row-level or identifying keys/values (including inside object keys), PHI markers, non-synthetic data, a missing or rejected approval, the requester approving their own release, and unauthorised roles.
5. It applies **small-cell suppression (k = 10) with complementary suppression**, so suppressed cells cannot be recovered by subtraction from a disclosed total; if fewer than k are evaluated nothing is released.
6. Every outcome, including every refusal, is written to an **append-only hash-chained audit log** that detects edits, deletions and reordering.

## Pieces
| File | Role |
|---|---|
| `phenotype.ts` | Definition schema, validation, tri-state evaluation, aggregate |
| `releaseGate.ts` | Identifier scan, suppression, four-eyes approval, release |
| `auditChain.ts` | Append-only chain and verification |
| `syntheticSource.ts` | Loader for the synthetic shards; a real source would implement the same `PlanePatient` output inside the private plane |
| `definitions.ts` | Two illustrative, unvalidated definitions |

## Not done, deliberately
- No UI yet; no server endpoint; nothing persisted beyond a process.
- Approval roles are checked as strings; real identity, MFA and RBAC belong to the private plane's deployment.
- Identifier scan is pattern-based, not a de-identification engine. Real data needs a proper de-identification process and DPIA first.
- Not a medical device: aggregate research use only, no patient-level outputs, no clinical advice.
- Definitions are illustrative. A clinician must author and review any definition before it means anything.
