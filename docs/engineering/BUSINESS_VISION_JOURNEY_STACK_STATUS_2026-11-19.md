# Business vision journey stack — built vs next

**Date:** 19 November 2026 (Europe/London)  
**Governing audit:** [`HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md`](../strategy/HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md) (merged via [#515](https://github.com/gnaneshwer23/hsi-core/pull/515))  
**Landed on `main`:** [#538](https://github.com/gnaneshwer23/hsi-core/pull/538) (USP A→Stage 2 exit fold)  
**Follow-on tip:** `cursor/home-metrics-subtitle-counts-2f71`  
**Honesty:** `journeyCompleteClaimed=false` · `writesEnabledClaimed=false` · `pilotReadyClaimed=false` · `scientificallyValidatedClaimed=false`

---

## Executive status

Agent-shippable **Stage 2 journey productization + §H device-local metrics + Home/Workspace fragmentation folds** are complete on the open stack (#516→tip), including Stage 2 exit fold. What remains is mostly **owner-gated** (staging grants, write packet, source clearance, SME gold, soft-land merges, real pilot invite) — not another dashboard shell.

---

## A. Built on the journey stack (open PRs, bottom → tip)

| PR | Increment | Stage / USP |
| --- | --- | --- |
| #516 | USP A disagreement trail | Stage 2 · A |
| #517 | USP B cross-domain trail | Stage 2 · B |
| #519 | USP C personal save/reopen library | Stage 2–3 · C |
| #520 | Brief passport columns + limitations always visible | Stage 2 · A |
| #521 | Curated disagreement demonstration pack | Stage 2 · A/B |
| #522 | Profile → Home → workspace handoff | Stage 3 · C |
| #523 | Unified Ask→…→Save journey trail | Stage 2 spine |
| #524 | Researcher usefulness (device-local) | §H usefulness |
| #525 | Testable next questions | Stage 2 step 9 |
| #526 | Alert preference honesty (no live delivery) | Stage 3 · §H alerts |
| #527 | Stage 2 completion checklist (not journey complete) | §H completion |
| #528 | Blocked steps 12–13 honesty | Stage 2 exit boundary |
| #529 | First useful investigation milestone | §H |
| #530 | Repeat usage (first reopen) milestone | §H |
| #531 | Willingness to pay milestone | §H / pilot signal |
| #532 | Activation milestone (first live run) | §H |
| #533 | Home: fold local journey metrics | UX cohesion |
| #534 | Pilot readiness honesty (local vs owner gates) | §I prep |
| #535 | Workspace: fold USP A/B/curated panels; USP C open | UX cohesion |
| #536 | Stack status audit + Gaps & testable fold | UX + audit |

**Also on tip (this PR):** fold Stage 2 checklist + blocked 12–13 under `#ws-stage2-exit`.

---

## B. §H / §I product metrics — coverage

| Metric | Status |
| --- | --- |
| Activation | **Shipped** (#532) |
| First useful investigation | **Shipped** (#529) |
| Investigation completion | **Shipped** checklist (#527) — never claims journey complete |
| Researcher-rated usefulness | **Shipped** (#524) |
| Repeat usage / saved·reopened | **Shipped** (#530) |
| Alert engagement (when enabled) | **Honesty only** (#526) — live delivery false; no invented open rates |
| Willingness to pay | **Shipped** (#531) |
| Authorised collaboration | **Blocked** (#528 step 12) |
| Pilot conversion | **Must not invent** — checklist claims false (#534) |

---

## C. Still blocked / owner-gated (do not fake)

| Gate | Blocks |
| --- | --- |
| Soft-land merge approval (#511/#512 paused) | Catalog merges |
| Human #2 source clearance | Live passage rights |
| Human #3 isolation / security signer | Staging write scopes |
| Human #4 SME gold | Scientific acceptance |
| Human #5 write-enable / journey packet | Durable save on staging |
| Human #8 ops / soak | Pilot release |
| Held migrations 022–033 | Org / durable stores |
| Production `writesEnabled=false` | Full prod E2E |
| Stage 4 org dashboards (#513/#514) | Deferred until usefulness proven |
| NEXT-A / NEXT-B soft-lands | Owner composition / isolation |

---

## D. Recommended next (prioritised)

### Agent-shippable now (no owner gate)

1. **This PR** — dynamic Home `#rh-metrics` subtitle counts (local milestones only; never invent conversion).  
2. **Stop building dashboards** — further agent increments should be honesty/docs/e2e hardening unless the owner names a new Stage 2 gap.

### Owner-gated next (do not code as “done”)

1. Resume soft-land merges under explicit approval.  
2. NEXT-A source/provider receipts + NEXT-B staging isolation HTTP.  
3. Staging grants for 3–5 researchers + write-scope packet.  
4. SME gold toward disagreement/cross-domain acceptance.  
5. Invite-only pilot (usefulness · reopen · WTP) — no invented conversion.

---

## E. Surfaces after this stack

| Surface | Role |
| --- | --- |
| `/research/workspace` | Unified trail primary; Stage 2 exit / USP A–B / gaps+testable folded; USP C save open |
| `/research/home` | Profile handoff + folded §H metrics + pilot readiness honesty |
| Enterprise / multi-workspace demos | Stage 4 preview only — not next build centre |

---

## Gates (binding)

No PHI · no Gate C auto-approve · no invented MoU · no production write enablement · no held-migration lifts · CI green ≠ production acceptance · no auto-merge while soft-land queue paused.
