# HSI next GitHub build plan

**Date:** 17 November 2026 (Europe/London)  
**Updated:** 17 November 2026 22:10 Europe/London — Wave A progress + next queue  
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

## Landed on `main` (17 Nov 2026)

| Id | PR | Notes |
| --- | --- | --- |
| Track 0.1 | [#440](https://github.com/gnaneshwer23/hsi-core/pull/440) | KG-03 slice 2 |
| Track 0.2 | [#430](https://github.com/gnaneshwer23/hsi-core/pull/430) | Sticky-header a11y |
| Conflict bench harness | [#444](https://github.com/gnaneshwer23/hsi-core/pull/444) | Fixture path |
| **A1.1** | [#446](https://github.com/gnaneshwer23/hsi-core/pull/446) | Shared Ask / live-investigation rate limiter |
| **A1.4** | [#447](https://github.com/gnaneshwer23/hsi-core/pull/447) | No browser-side providers (ING-01) |
| **A1.5** | [#448](https://github.com/gnaneshwer23/hsi-core/pull/448) | Access request with honest delivery |
| **A2.1** | [#449](https://github.com/gnaneshwer23/hsi-core/pull/449) | Evidence Context Passport UI |
| **A2.2** | [#450](https://github.com/gnaneshwer23/hsi-core/pull/450) | Same / Across / Unknown conflict labels |
| **A2.3** | [#451](https://github.com/gnaneshwer23/hsi-core/pull/451) | D-01 slice entity audit |
| **A2.4** | [#452](https://github.com/gnaneshwer23/hsi-core/pull/452) | Curator context completion sheet |
| **A4.1** | [#454](https://github.com/gnaneshwer23/hsi-core/pull/454) | Label vault layout + CLI |
| **A4.2** | [#456](https://github.com/gnaneshwer23/hsi-core/pull/456) | `conflict:bench:expert` vault path |
| **A5.2** | [#455](https://github.com/gnaneshwer23/hsi-core/pull/455) | Passport-column evidence table |

**In flight (merge when CI green):** [#457](https://github.com/gnaneshwer23/hsi-core/pull/457) A5.1 related papers; [#453](https://github.com/gnaneshwer23/hsi-core/pull/453) A3.1 ADR-011–014 as **Proposed** (not Accepted).

**Still owner-only open:** [#442](https://github.com/gnaneshwer23/hsi-core/pull/442) source clearance; [#371](https://github.com/gnaneshwer23/hsi-core/pull/371) editorial redesign.

---

## Next builds (ordered)

Agent-shippable next, once A5.1 + A3.1 are on `main`:

| Order | Id | Branch | Scope | Depends on | Done when |
| --- | --- | --- | --- | --- | --- |
| 1 | **A5.3** | `cursor/ux-how-produced-trace-2f71` | “How this was produced” panel from real run / radar / related-works records | Live run + A5.1/A5.2 on main | No fake progress; links STATUS maturity; fail-closed when no run |
| 2 | **A3.2** | `cursor/db-isolation-suite-2f71` | Two-account isolation harness on disposable Neon branch | A3.1 Proposed on main | Suite green on rehearsal; production untouched; no hold lifts |
| 3 | **A3.3** | `cursor/db-graph-workspace-adapter-wire-2f71` | Graph-workspace store behind feature flag (default off) | A3.2 | Flag off = localStorage; flag on = staging server path only |
| 4 | **A4.3** | `cursor/bench-immuno-dev-set-tooling-2f71` | Import/validate founder immuno development set into vault | Owner drafts cases offline | Schema validates; scoring blocked until B4 floors |
| 5 | **A1.3** | `cursor/ops-error-alerts-2f71` | Error tracking + four alerts docs / dry-run notes | A1.2 optional | Documented; no invented on-call delivery |

**Blocked on Track B (do not invent):**

| Id | Blocker | Unblocks |
| --- | --- | --- |
| **A1.2** | B5 numeric spend caps + model deployment choices | Kill switch + recorded caps |
| **C1–C6** | B3 reviewers + filled A2.4 sheet | First reviewed slice |
| Production writes / held migrations | B1 + B2 | Live passages; Neon apply |

### Why this order

- **A5.3** finishes Wave A5 honesty UX while the live surfaces are hot (radar, related works, evidence table).
- **A3.2 → A3.3** continues persistence prep without applying held SQL.
- **A4.3** only after founder has offline cases; otherwise skip.
- **A1.2** waits for owner caps; **A1.3** can soft-land docs-only if needed.

---

## Track 0 — remaining open

| Order | PR | Action | Exit |
| --- | --- | --- | --- |
| 0.3 | [#442](https://github.com/gnaneshwer23/hsi-core/pull/442) source clearance draft | Owner decision only — do not “implement around” it | Signed policy or explicit defer note |
| 0.4 | [#371](https://github.com/gnaneshwer23/hsi-core/pull/371) editorial redesign | Leave draft until owner screenshot review | No merge without explicit OK |

---

## Track A — full map (status)

### Wave A1 — Trustworthy live surface (Pack Phase 0)

| PR id | Branch suggestion | Scope | Status |
| --- | --- | --- | --- |
| **A1.1** | `cursor/sec-rate-limit-ask-2f71` | Shared rate limiter (SEC-01) | Landed #446 |
| **A1.2** | `cursor/sec-kill-switch-caps-2f71` | Kill switch + spend caps (SEC-02) | Blocked on B5 |
| **A1.3** | `cursor/ops-error-alerts-2f71` | Error tracking + four alerts (OPS-01/02) | Next (soft) |
| **A1.4** | `cursor/ing-no-browser-providers-2f71` | No browser-side providers (ING-01) | Landed #447 |
| **A1.5** | `cursor/ux-access-request-2f71` | Working access request (UX-02 / API-06) | Landed #448 |

### Wave A2 — Context productization

| PR id | Status |
| --- | --- |
| **A2.1–A2.4** | Landed #449–#452 |

### Wave A3 — Persistence prep (code only; apply later)

| PR id | Branch suggestion | Status |
| --- | --- | --- |
| **A3.1** | `cursor/arch-adr-011-014-2f71` | #453 Proposed ADRs — merge as Proposed; Accepted needs owner |
| **A3.2** | `cursor/db-isolation-suite-2f71` | Next after A3.1 |
| **A3.3** | `cursor/db-graph-workspace-adapter-wire-2f71` | After A3.2 |

### Wave A4 — Verification & benchmark scaffolding

| PR id | Status |
| --- | --- |
| **A4.1** | Landed #454 |
| **A4.2** | Landed #456 |
| **A4.3** | Queued; needs owner offline cases |

### Wave A5 — Competitor-inspired UX

| PR id | Status |
| --- | --- |
| **A5.1** | #457 related papers — merge when CI green after rebase |
| **A5.2** | Landed #455 |
| **A5.3** | **Next agent build** after A5.1 |

---

## Track B — Owner / human-gated (parallel, not agent-invented)

| Gate | Owner action | Unblocks |
| --- | --- | --- |
| **B1** | Sign source clearance policy (#442) | Live passages, NEXT-A composition |
| **B2** | Name independent DB reviewer | Applying consolidation / held migrations |
| **B3** | Recruit reviewers: immunology, metabolism, gut microbiome | First reviewed slice + calibration |
| **B4** | Approve benchmark floors before scoring | Public `/benchmark` numbers |
| **B5** | Set provider spend caps + model deployment choices | A1.2 / live verifier |

Without B1–B3, keep shipping Track A; do not claim pilot readiness. Production remains **LIMITED GO** (public site + fail-closed shell), not full scientific platform GO.

---

## Track C — First reviewed slice (science + product)

Ship once A2.4 sheet is filling and B3 reviewers exist:

| PR id | Scope |
| --- | --- |
| **C1** | Import completed context for D-01 candidates (still `unreviewed`) |
| **C2** | Reviewer queue MVP (accept / reject / revise / insufficient) — API + UI, fail-closed |
| **C3** | Dual-reviewer decisions for 40–60 edges; immutable records |
| **C4** | Graph release: reviewed vs candidate styling + version bump |
| **C5** | Homepage worked conflict from a **reviewed** disagreement |
| **C6** | Brief v2 export (Markdown / JSON / print) with graph version + review states |

---

## Suggested weekly shipping rhythm

| Week | Merge focus | Parallel owner work |
| --- | --- | --- |
| **W1** (done) | Track 0 + A1.1 / A1.4–A1.5 + A2.* + A4.1–A4.2 + A5.1–A5.2 | Caps, #442 decision |
| **W2** (now) | A5.3 + A3.1–A3.2 | Recruit reviewers; fill context sheet |
| **W3** | A3.3 + A4.3 (if cases) + A1.3 | DB reviewer named; B5 caps |
| **W4+** | Begin C2 when reviewers ready | Calibration / gold authoring |

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

1. If an open in-flight PR is green → merge.  
2. Else take the lowest unfinished **Next builds** row whose dependencies are met.  
3. If blocked only on Track B → continue the next parallel **A\*** item; record the blocker in the PR body.  
4. Never open a PR that invents reviewer identities, MoUs, or production Neon application.

## Related docs

- Backlog IDs: `docs/engineering-pack/v1.1/markdown/15_Implementation_Roadmap_and_Engineering_Backlog.md`  
- Acceptance truth: `docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md`  
- Slice decision D-01: `docs/engineering-pack/v1.1/markdown/01_Master_Product_Requirements_Document.md`  
- Status: `docs/STATUS.md`
