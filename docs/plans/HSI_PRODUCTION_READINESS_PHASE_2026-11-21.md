---
title: HSI Production Readiness and Launch Hardening
date: 2026-11-21
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-plan
execution: code
base_commit: 321ae53fb4233835db0ac22f07f1bc4aa6bb3a7a
governing_vision: docs/strategy/HSI_VISION.md
related_audit: docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md
---

# HSI Production Readiness and Launch Hardening

## Goal Capsule

**Objective.** Move HSI from “features on main” to staged, evidenced production use: public site launch → restricted research preview → general scientific availability — without changing the scientific vision or removing existing capabilities.

**Means.** A hardening sprint only: production QA, reliability, security, scientific honesty, and owner-gated acceptance packets. Prefer small independently testable PRs over new feature families.

**Authority hierarchy.**

1. `docs/strategy/HSI_VISION.md` + CDS/PHI / Neon isolation boundaries  
2. HSI 1.0 acceptance matrix + owner-gates worksheet (engineering ≠ owner verified)  
3. This plan  
4. Internal business pre-mortem — **strategy only**, never a technical release gate

**Stop conditions.**

- Do not enable held migrations 022–033, production research writes, Gate C auto-approve, or unapproved deploys  
- Do not invent MoU, clearance signatures, SME gold, staging hosts, or pilot invites  
- Do not rebuild landings / Demo Universe / continuous trail already on `main` at `321ae53f`  
- Do not treat CI green or merged PRs as scientific or production acceptance

---

## Product Contract

### Requirements

| ID | Requirement | Launch stage |
| --- | --- | --- |
| R1 | Public routes, nav, mobile, a11y, SEO, honesty labels remain coherent on production | Public launch |
| R2 | Synthetic demos and candidate findings stay explicitly labelled | Public launch |
| R3 | Authenticated restricted preview can complete a continuous investigation with fail-closed writes | Restricted preview |
| R4 | Live evidence shows provenance; clearance stays unverified until Human #2 signs | Restricted preview → GA |
| R5 | Two-user isolation and durable staging persistence independently evidenced | GA prerequisites |
| R6 | Expert-adjudicated scientific evaluation exists before unrestricted scientific claims | GA |
| R7 | Ops: monitoring, rollback, incident path documented for each stage | All stages |
| R8 | Business pre-mortem may inform prioritisation internally but must not block release checklists | All stages |

### Actors

- Public visitor / prospective researcher  
- Invited research-preview user  
- Curator / SME / isolation signer / source-clearance authority (humans)  
- Platform operator / security owner  

### Staged flows

1. **Public launch** — browse landings, how-it-works, graph snapshot, Demo Universe; no production writes.  
2. **Restricted preview** — authenticated Ask→evidence→passport→compare→brief→device-local or approved staging save under grants.  
3. **GA** — cleared sources, signed isolation, durable persistence, SME-adjudicated reliability, controlled pilot then broader access.

### Acceptance examples

- Production homepage shows investigation flow + research-preview honesty; axe/mobile e2e green after rebuild.  
- `/demo/universe` shows `DEMONSTRATION DATA` and `production write: false`.  
- `/research/workspace` continuous Playwright journey green; staging grant packet filled by owner before checklist #1 verified.  
- `sourceClearanceVerified` remains `false` in code until Human #2 evidence exists.  
- Owner gates pending JSON still reports `acceptedForScope: false` until signed packets land.

### Product scope

**In:** Hardening and acceptance evidence for systems already on `main`.  
**Out:** New agent personalities, new dashboard families, clinical/PHI plane, premortem-as-gate, speculative greenfield platforms.

---

## Planning Contract

### Key technical decisions (settled)

| Decision | Choice | Why |
| --- | --- | --- |
| KTD1 | Three launch stages, not one “GO” | Audit: public/demo mature; live science / persistence / isolation not accepted |
| KTD2 | Premortem excluded from release blockers | Explicit owner instruction 21 Nov 2026 |
| KTD3 | Reuse HSI 1.0 checklist #1–#8 + owner-gates worksheet | Avoid parallel acceptance taxonomies |
| KTD4 | Register/STATUS refresh before more features | STATUS asOf 2026-11-13 is stale vs 20 Nov merges |
| KTD5 | Close conflicting older website/dashboard PRs | #371/#511/#513/#514 superseded or conflicting |
| KTD6 | Fail-closed writes remain default | Binding honesty; Human #5 before durable path |

### Assumptions

- Production origin remains `https://www.humansuperintelligence.tech`  
- Research foundation + production probe stay required on every hardening PR  
- Owner humans (#2/#3/#4/#5/#8) remain the only path to “verified” acceptance cells  

### Sequencing

```text
U1 Register reconcile
 → U2 Public launch QA packet
 → U3 Open-PR hygiene
 → U4 Restricted-preview auth + journey evidence soft-land
 → U5 API/ops reliability hardening (as defects found)
 → U6 Owner packets Human #2/#5/#3 (parallel human work)
 → U7 Scientific evaluation / SME gold (Human #4)
 → U8 Pilot readiness (Human #8 / NEXT-F) then checklist #8
```

U6–U8 are **owner-gated**; agents prepare packets and runners only.

### Production-readiness matrix (current)

| System | Readiness | P0 before relevant release | P1 for GA | Evidence now |
| --- | --- | --- | --- | --- |
| Public website | Near public-ready | Visual/a11y/SEO acceptance on deploy; honesty labels | Craft polish | Prod 200; e2e after rebuild; audit screenshots |
| Demo Research Universe | Public-ready as synthetic | Keep synthetic / write-false labels | Role-adapter polish | `/demo/universe` live; integrity tests |
| Research Workbench | Preview-partial | Staging continuous-journey packet; auth grant path | Durable save | Continuous e2e green; writes false |
| Knowledge Graph | Candidate-only | Review-status honesty; snapshot integrity | Reviewed edge volume | Published snapshot; candidates |
| Evidence Intelligence | Preview-partial | Provenance UI honesty; clearance false | Human #2 clearance | Reliability honesty modules |
| Scientific verification | Not GA | No overclaim in UI | SME gold / dual-provider | Harness; 0 adjudicated gold |
| AI runtime | Preview-partial | Timeouts/retries/cost caps on live path | Durable worker soak | Soft-lands; providers optional |
| Auth & database | Fail-closed | Isolation soft evidence; no held-migration lift | Signed isolation + restore | Holds 022–033; probe green |
| Collaboration | Later | Block org share claims | Permissions + durable share | Steps 12–13 blocked honesty |

---

## Implementation Units

### U1. Post-merge register and acceptance reconcile

**Outcome.** STATUS / capability register / HSI 1.0 status docs reflect Nov 20–21 merges without claiming acceptance.

**Touch.** `operations/capability-register/` · `docs/STATUS.md` (generated) · `docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md` · optional ten-systems map note.

**Acceptance.** `bun run status:write` (or repo equivalent) · verified count still **0 / 8** · honesty flags unchanged · Stack A/B marked merged.

**Priority.** P0 (truthfulness) · Stage: all.

### U2. Public launch QA packet

**Outcome.** Repeatable frontend production QA for public routes with evidence folder.

**Touch.** `site/e2e/*` only if stale vs #584 · `docs/qa/` evidence index · no redesign.

**Acceptance.** landing-pages + stage2 + approved-website + seo e2e green on fresh build · production screenshot set dated · axe WCAG tags pass · no horizontal overflow at 390px.

**Priority.** P0 for public launch · Stage: public.

### U3. Open PR hygiene against main

**Outcome.** Close or supersede conflicting / obsolete PRs with compare notes.

**Targets.** Close/defer #371, #511, #513, #514 · reconcile #512 soft-land catalog vs passport already on workspace · review #579 as strategy (non-gate) · reconcile draft #578 with `HSI_VISION` without forking architecture.

**Acceptance.** Open PR list no longer proposes superseded website/dashboard stacks · #579 labelled strategy-not-gate if merged.

**Priority.** P2 hygiene / P0 if someone merges conflicting stacks · Stage: all.

### U4. Restricted-preview journey evidence soft-land

**Outcome.** CI-safe packet templates for checklist #1 (continuous journey) and #5 (save/reopen) without inventing hosts or enabling writes.

**Touch.** `operations/staging/` · `src/operations/hsi10OwnerGatesWorksheet.ts` refs · docs under `docs/engineering/` · reuse e2e-05 / continuous journey.

**Acceptance.** Worksheet refs move from NOT_STARTED only when owner supplies real evidence · soft-land tests keep `acceptedForScope: false` · Playwright continuous journey remains green.

**Priority.** P0 for restricted preview · Stage: preview.

### U5. Backend / API reliability hardening

**Outcome.** Fix only evidenced defects in authz, validation, rate limits, error envelopes, monitoring hooks on existing research APIs.

**Touch.** `site/api/**` · `src/server/**` · ops alert catalog — minimal diffs from probe/log findings.

**Acceptance.** Focused unit tests · production probe still green · no write-path enablement.

**Priority.** P0 if probe/auth defects · else P1 · Stage: preview.

### U6. Owner packets — clearance, isolation, staging persistence

**Outcome.** Humans close #2 / #3 / #5 with protected evidence; agents only scaffold runners and refuse invented signers.

**Touch.** Existing NEXT-A/B / e2e-02 / e2e-05 soft-lands · private evidence stores (not invented URLs in git).

**Acceptance.** Owner-gates pending JSON updated only with real refs · migrations stay held until signed scope · isolation HTTP evidence retained.

**Priority.** P0 for GA · Stage: GA prerequisites.

### U7. Scientific reliability and SME gold

**Outcome.** Progress Human #4 vault / independent evaluation without inventing gold labels.

**Touch.** `evaluation/` · gold soft-lands · UI honesty only.

**Acceptance.** Adjudicated case count > 0 only with real vault evidence · UI never claims scientific approval.

**Priority.** P0 for unrestricted scientific platform · Stage: GA.

### U8. Pilot readiness then researcher validation

**Outcome.** After Human #8 / NEXT-F operational acceptance, invite 3–5 researchers for checklist #8.

**Touch.** Usefulness panel already present · ops soak evidence · invite process outside repo secrets.

**Acceptance.** Checklist #8 verified only with pilot feedback artifacts · no auto-promotion of graph edges.

**Priority.** P1 after U6–U7 · Stage: post-preview.

---

## Verification Contract

| Gate | Command / evidence |
| --- | --- |
| Unit / honesty | `bun test` for touched modules · owner-gates · reliability honesty |
| Site build / budgets | `cd site && bun run build` |
| Public e2e | `cd site && bun run test:e2e -- e2e/landing-pages.spec.ts e2e/stage2-integrated-qa.spec.ts e2e/seo.spec.ts` |
| Journey e2e | `cd site && bun run test:e2e -- e2e/workspace-continuous-journey.spec.ts e2e/live-investigation.spec.ts` |
| Demo integrity | `bun test test/demoUniverseIntegrity.test.ts` |
| CI | Research foundation + Production probe green on PR head |
| Owner verified | HSI 1.0 matrix cells only with staging/SME/security packets — never CI alone |

---

## Definition of Done

### Global

- [ ] Premortem not listed as a release blocker in launch checklists  
- [ ] No held migrations released without explicit owner approval  
- [ ] `productionWritesEnabled` / `writesEnabled` remain false unless separately authorised  
- [ ] Public stage has dated QA evidence  
- [ ] Preview stage has auth + continuous-journey evidence packet (owner-filled)  
- [ ] GA stage has Human #2/#3/#4/#5 closed before unrestricted claims  
- [ ] Capability register asOf refreshed after hardening wave  

### Per unit

Each U* PR ships with: user outcome · files · tests · honesty impact · rollback · “does not enable writes/migrations” statement.

---

## Appendix

### Baseline audit (21 Nov 2026)

- Main tip audited: `321ae53f`  
- Canvas: post-merge acceptance audit (companion)  
- Continuous journey e2e: pass (local, fresh build)  
- Landing/demo e2e: pass after rebuild (stale `dist` caused false failures)  
- Acceptance verified: **0 / 8**  
- Register: 17 implemented / 27 partial / 2 stub (asOf 2026-11-13 — stale)  

### Explicit non-goals

Additional feature families, premortem landing copy, PHI/CDS, Gate C auto-approve, inventing staging infrastructure in git, merging superseded website PRs.
