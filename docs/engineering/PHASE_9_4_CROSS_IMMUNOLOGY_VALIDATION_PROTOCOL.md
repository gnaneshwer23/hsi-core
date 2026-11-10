# Phase 9.4 — Cross-Immunology Scientific Validation Protocol

Status: **benchmark scaffolding only; no independent scientific evaluation completed**.

## Purpose
Test whether the same HSI research contracts support autoimmunity, cancer immunology and infection without disease-specific hardcoding. SSc is one case within autoimmunity, not the platform boundary.

## Required evaluation procedure
1. Freeze benchmark version, provider data snapshot, ontology mapping version and software commit.
2. Recruit at least two independent domain experts with relevant expertise; record conflicts of interest.
3. For each case, retrieve real source passages and record publication identifiers, exact claim locations, access dates and source versions. Metadata alone is not claim evidence.
4. Have experts independently annotate biological context, claim direction, methodological quality, contradictions, unknowns and plausible falsification experiments.
5. Run HSI on the same cases without exposing expert answers.
6. Compare machine outputs against expert adjudication; report unsupported-claim rate, provenance accuracy, context-mismatch classification, abstention behaviour, hypothesis falsifiability and reviewer agreement. Report denominators and confidence intervals.
7. Record disagreements, corrections, failure examples, data licenses and governance audit trails.
8. Do not approve claims, publish mechanistic conclusions or enable clinical use from benchmark scores.

## Exit criteria
- All three domain cases evaluated against real, versioned source material.
- At least two independent reviewers; adjudication and limitations recorded.
- No unreviewed hypothesis promoted to established evidence.
- Pre-registered metric thresholds met; thresholds must be defined before results are observed.
- Engineering CI, live-provider verification and authenticated workflow integration verified separately.

The TypeScript assessment contract in `src/evidence/crossImmunologyBenchmark.ts` is an engineering gate for recording evidence. It is **not** itself proof of scientific validation. Reviewer IDs/notes supplied to the function are not independently authenticated; a trusted review service and immutable audit records are required before production sign-off.
