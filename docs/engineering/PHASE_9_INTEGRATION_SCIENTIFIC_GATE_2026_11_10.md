# Phase 9 — Integration and scientific truth gate

Status: **OPEN / NOT RELEASE READY**. This checklist is not a claim of scientific validation.

## Dependency graph

- PR #183 Reactome pathway adapter: based on main, independently pending.
- PR #184 UniProt metadata adapter: based on main, independently pending.
- PR #185 protein–pathway candidate: stacked on #184.
- PR #186 contextual comparison: stacked on #185.
- PR #187 experiment proposal: stacked on #186.
- PR #188 headless workbench: stacked on #187.
- PR #189 context and provenance integrity: stacked on #188.
- This Phase 9 gate branch: stacked on #189.

**Important**: Reactome PR #183 is not in the #184–#189 ancestry. Integrate it explicitly; the Step 7 workbench currently accepts a caller-supplied pathway draft. Never mistake that for a live Reactome integration.

## Verification record — 2026-11-10

GitHub Actions workflow `Research foundation`:
- Step 2 commit c2da6258: success.
- Step 3 commit c7831226: success.
- Step 4 commit ae75c37e: success.
- Step 5 commit 51ad8516: success.
- Step 6 commit b7d0779e: in progress at audit.
- Step 7 commit 1e1d3b9b: success.
- Step 8 commit 29c0779a: in progress at audit.

A successful workflow does not prove external provider correctness, scientific truth, or human usability.

## Required engineering release gates

- [ ] All PR CI runs completed successfully on final heads.
- [ ] Inspect typecheck and all test results on consolidated branch.
- [ ] Integrate Reactome #183 with the Step 7/8 workbench; add live-adapter contract tests.
- [ ] Verify UniProt/Reactome real API schemas, timeouts, rate limits and failure paths.
- [ ] Validate graph schema contracts and draft/non-promotable boundaries.
- [ ] Validate source reference identity and cross-stage biological context.
- [ ] Wire workflow into existing authenticated researcher interface, not a duplicate page.
- [ ] Confirm no unreviewed claim enters approved/public graph.
- [ ] Test error, cancellation and retry behavior and audit trails.
- [ ] Confirm security, licensing and deployment configuration.
- [ ] Merge reviewed PRs in dependency order; update stacked bases and resolve conflicts.

## Required scientific acceptance

- [ ] Build expert-curated benchmark questions spanning autoimmunity, cancer immunology and infection.
- [ ] Verify real primary source provenance; never infer evidence from UniProt/Reactome metadata alone.
- [ ] Distinguish context mismatch, genuine conflicting evidence, unknown context and unsupported claims.
- [ ] Use blinded human review of candidate mechanisms and experimental proposals.
- [ ] Record reproducible evaluation metrics, reviewer disagreements and limitations.
- [ ] Include SSc Tfh–IL-21–B-cell as one benchmark, not a product-specific constraint.

## Release decision

**NO-GO** until the integration and scientific gates above are verified. Do not present draft proposals as validated discoveries, and do not auto-merge solely because CI is green.
