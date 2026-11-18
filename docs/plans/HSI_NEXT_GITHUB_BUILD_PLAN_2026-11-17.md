# HSI next GitHub build plan

**Date:** 17 November 2026 (Europe/London)  
**Status:** operating plan for continuous PR delivery  
**Governs against:** `docs/strategy/HSI_VISION.md`, Engineering Pack v1.1 (`docs/engineering-pack/`), `docs/STATUS.md`, `docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md`  
**Does not authorise:** Gate C auto-approve, production write enablement, applying held migrations without independent DB review, live CDS/PHI, or claiming scientific accuracy before adjudicated cases exist.

## CI note (17 Nov 2026)

`bun audit` fails on transitive `picomatch@4.0.7` (GHSA-fc5q-39xc-vjpf / CVE-2026-112366) with no published patched version. `scripts/ci-bun-audit.ts` temporarily allows that single advisory so Track A PRs can merge; remove the allow-list when npm ships a fixed picomatch and bump the lockfile.

## Goal

Keep shipping small, mergeable PRs to `main` that finish and prove what already exists — not restart the stack, not equal-depth six domains, not a new agent fleet.

**First proof point (unchanged):** one reviewed cross-domain slice (gut microbial metabolites → immune signalling → insulin resistance / T2D, with T1D comparison and anti-TNF RA vs MS), plus a publishable benchmark tranche.

## Rules for every PR

1. One concern per PR; CI green (`bun run check` scope as required by the change).
2. Update the capability register + `bun run status:write` when behaviour changes.
3. No public copy that overclaims STATUS.
4. Migrations stay held until an independent DB review packet exists; rehearsal PRs use disposable Neon branches only.
5. Prefer productizing existing modules (context fields, conflict classifier, liveRun adapters) over new subsystems.

---

## Track 0 — Land what is already open (this week)

| Order | PR | Action | Exit |
| --- | --- | --- | --- |
| 0.1 | [#440](https://github.com/gnaneshwer23/hsi-core/pull/440) KG-03 slice 2 | Merge when checks green | Study-system rule + graph version on `main` |
| 0.2 | [#430](https://github.com/gnaneshwer23/hsi-core/pull/430) sticky-header a11y | Merge when checks green | WCAG focus guard on research shell |
| 0.3 | [#442](https://github.com/gnaneshwer23/hsi-core/pull/442) source clearance draft | Owner decision only — do not “implement around” it | Signed policy or explicit defer note |
| 0.4 | [#371](https://github.com/gnaneshwer23/hsi-core/pull/371) editorial redesign | Leave draft until owner screenshot review | No merge without explicit OK |

---

## Track A — Agent-shippable engineering PRs (continuous)

These can land without waiting for SMEs. Sequence matters where noted.

### Wave A1 — Trustworthy live surface (Pack Phase 0)

| PR id | Branch suggestion | Scope | Depends on | Done when |
| --- | --- | --- | --- | --- |
| **A1.1** | `cursor/sec-rate-limit-ask-2f71` | Shared rate limiter for Ask / research routes (SEC-01) | — | Routes share limits; tests for burst + cross-route |
| **A1.2** | `cursor/sec-kill-switch-caps-2f71` | Kill switch + recorded provider spend caps (SEC-02) | Owner sets numeric caps | Config + fail-closed when tripped — soft-land: `docs/engineering/A1_2_SEC02_KILL_SWITCH_SOFT_LAND.md` + `src/operations/sec02KillSwitchCatalog.ts` (no invented numeric caps) |
| **A1.3** | `cursor/ops-error-alerts-2f71` | Error tracking + four alerts (OPS-01/02) | A1.2 optional | Alerts documented; dry-run in staging notes — soft-land: `docs/engineering/A1_3_OPS_ERROR_ALERTS_SOFT_LAND.md` + `src/operations/opsAlertCatalog.ts` (no invented on-call) |
| **A1.4** | `cursor/ing-no-browser-providers-2f71` | Remove browser-side provider calls (ING-01) | — | No client keys; server-only |
| **A1.5** | `cursor/ux-access-request-2f71` | Working access request (UX-02 / API-06) | — | Owner receives request; page does not claim undelivered mail |

### Wave A2 — Context productization (no rebuild)

| PR id | Branch suggestion | Scope | Depends on | Done when |
| --- | --- | --- | --- | --- |
| **A2.1** | `cursor/kg-context-passport-ui-2f71` | “Evidence Context Passport” UI over existing passage-linked / edge context fields | #440 preferred | One inspectable passport per claim/edge; missing fields explicit |
| **A2.2** | `cursor/kg-conflict-labels-copy-2f71` | Plain-language conflict labels everywhere Evidence-by-context shows | A2.1 or parallel | Same / across / unknown — never “resolved” |
| **A2.3** | `cursor/kg-slice-entity-audit-2f71` | Audit D-01 slice entities vs published graph; add missing candidate nodes only | — | Checklist + PR adding only agreed nodes |
| **A2.4** | `cursor/kg-context-completion-sheet-2f71` | Curator CSV/JSON sheet for tissue/population/design on D-01 candidates | A2.3 | Importable sheet; no auto-promotion |

### Wave A3 — Persistence prep (code only; apply later)

| PR id | Branch suggestion | Scope | Depends on | Done when |
| --- | --- | --- | --- | --- |
| **A3.1** | `cursor/arch-adr-011-014-2f71` | Draft ADR-011–014 (jobs, investigation store, identity binding, scope registry; isolation + promotion constraints recorded) | Owner sign-off to merge | ADRs merged as accepted or proposed — drafts in `docs/architecture/ADR-011`…`014` |
| **A3.2** | `cursor/db-isolation-suite-2f71` | Two-account isolation test harness against disposable branch | A3.1 | Catalog + `staging:isolation:*` CLI; fixture/`--check` CI-safe; live owner-gated; holds unchanged |
| **A3.3** | `cursor/db-graph-workspace-adapter-wire-2f71` | Wire graph-workspace store behind feature flag (fail-closed default) | A3.2 | Flag off = localStorage path; flag on = server path in staging only |

### Wave A4 — Verification & benchmark scaffolding

| PR id | Branch suggestion | Scope | Depends on | Done when |
| --- | --- | --- | --- | --- |
| **A4.1** | `cursor/ver-label-vault-layout-2f71` | Gitignored label vault layout + authoring CLI stubs (VER-05) | — | Structure exists; no gold in git — `evaluation/label-vault/` + `label-vault:*` CLI |
| **A4.2** | `cursor/bench-conflict-expert-runner-2f71` | Expert-path for `conflict:bench` (private vault only) | #444 already on main | Fixture path unchanged; `conflict:bench:expert` + vault guards documented |
| **A4.3** | `cursor/bench-immuno-dev-set-tooling-2f71` | Tooling to author founder development set without publishing floors | Owner drafts cases offline | Import validates schema; scoring blocked until floors |

### Wave A5 — Competitor-inspired UX (only after A2 started)

| PR id | Branch suggestion | Scope | Depends on | Done when |
| --- | --- | --- | --- | --- |
| **A5.1** | `cursor/ux-related-papers-2f71` | Seed-paper → related works via OpenAlex (Connected Papers–style, rights-safe) | A1.4 | Metadata-only; no invented abstracts — `/api/research/related-works` + literature dossier / radar panel |
| **A5.2** | `cursor/ux-evidence-table-2f71` | Structured evidence table in investigation brief (Elicit-style columns) | A2.1 | Columns = context passport fields — Research outcomes panel + Markdown brief |
| **A5.3** | `cursor/ux-how-produced-trace-2f71` | “How this was produced” panel from real run record | Live run path | No fake progress; links `/status` — Ask / workspace / radar / related-works |

---

## Track B — Owner / human-gated (parallel, not agent-invented)

| Gate | Owner action | Unblocks |
| --- | --- | --- |
| **B1** | Sign source clearance policy (#442) | Live passages, NEXT-A composition |
| **B2** | Name independent DB reviewer | Applying consolidation / held migrations |
| **B3** | Recruit reviewers: immunology, metabolism, gut microbiome | First reviewed slice + calibration |
| **B4** | Approve benchmark floors before scoring | Public `/benchmark` numbers |
| **B5** | Set provider spend caps + model deployment choices | A1.2 / live verifier |

Without B1–B3, keep shipping Track A; do not claim pilot readiness.

---

## Track C — First reviewed slice (science + product)

Ship as a series of PRs once A2.4 sheet is filling:

| PR id | Scope |
| --- | --- |
| **C1** | Import completed context for D-01 candidates (still `unreviewed`) |
| **C2** | Reviewer queue MVP (accept / reject / revise / insufficient) — API + UI, fail-closed — soft-land: `/research/d01-edge-review` + `src/knowledgeGraph/d01EdgeReview.ts` (device-local; no graph write) |
| **C3** | Dual-reviewer decisions for 40–60 edges; immutable records |
| **C4** | Graph release: reviewed vs candidate styling + version bump |
| **C5** | Homepage worked conflict from a **reviewed** disagreement — soft-land: sealed candidate pair (`DIAB-003`/`DIAB-015`) with unreviewed honesty until C3 |
| **C6** | Brief v2 export (Markdown / JSON / print) with graph version + review states — soft-land: `src/knowledgeGraph/briefV2.ts` + advanced graph export / print (0 reviewed; no saved-record claim) |

---

## Suggested weekly shipping rhythm

| Week | Merge focus | Parallel owner work |
| --- | --- | --- |
| **W1** | Track 0 + A1.1–A1.3 | Caps, #442 decision |
| **W2** | A1.4–A1.5 + A2.1–A2.2 | Recruit reviewers |
| **W3** | A2.3–A2.4 + A3.1 | DB reviewer named |
| **W4** | A3.2 + A4.1–A4.2 | Start context sheet fill |
| **W5+** | A5.* as capacity; begin C2 when reviewers ready | Calibration / gold authoring |

Target: **≥3 merged engineering PRs per week** on Track A while Track B is in flight.

---

## Explicitly out of the next shipping queue

- Six domains at equal reviewed depth  
- Community feed / email digests / payments  
- New named agent products in the UI  
- Clinical plane with real data  
- Merging #371 without owner visual approval  
- Removing migration holds in a batch  
- Accuracy or partnership claims on the site  

---

## How agents should pick the next PR

1. If an open Track 0 PR is green and approved → merge.  
2. Else take the lowest unfinished **A\*** id whose dependencies are met.  
3. If blocked only on Track B → continue the next parallel **A\*** item; record the blocker in the PR body.  
4. Never open a PR that invents reviewer identities, MoUs, or production Neon application.

## Related docs

- Backlog IDs: `docs/engineering-pack/v1.1/markdown/15_Implementation_Roadmap_and_Engineering_Backlog.md`  
- Acceptance truth: `docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md`  
- Slice decision D-01: `docs/engineering-pack/v1.1/markdown/01_Master_Product_Requirements_Document.md`  
- Status: `docs/STATUS.md`
