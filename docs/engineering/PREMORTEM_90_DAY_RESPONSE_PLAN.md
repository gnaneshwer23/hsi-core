# Pre-mortem 90-day response plan — engineering mapping

**Date:** 20 November 2026 (Europe/London)  
**Governing brief:** [`../strategy/HSI_BUSINESS_PREMORTEM_2026-11-20.md`](../strategy/HSI_BUSINESS_PREMORTEM_2026-11-20.md)  
**Companion audit:** [`../strategy/HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md`](../strategy/HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md)  
**Honesty:** Register counts and flags below are engineering classifications from [`../STATUS.md`](../STATUS.md). They are **not** scientific validation, pilot readiness, or commercial proof.

---

## Binding order of work

1. Prove **one** reproducible investigation workflow (pre-mortem Risks 01, 02, 12).  
2. Complete **security / isolation / fail-closed writes** before private institutional data (Risks 05, 09).  
3. Defer marketplace, org RBAC expansion, and “serve everyone” GTM until retention + paid demand evidence (Risks 03, 06, 07).  
4. Do **not** treat merged PRs, demo shells, or marketing landings as proven product value (Risk 01).

---

## Days 1–15 — Establish implementation truth

### Snapshot (as of register on `main`, not a readiness claim)

| Class | Count | Meaning |
| --- | --- | --- |
| Implemented | 17 | Working code, not only a contract |
| Partial | 27 | Real code with a blocker, fixture limit, or incomplete coverage |
| Stub | 2 | Types, fixtures or proposal-only adapters |

| Flag | Value |
| --- | --- |
| `scientificallyValidatedClaimed` | false |
| `writesEnabledClaimed` | false |
| Gate C auto-approve | false |
| PHI / live CDS in hsi-core | false |
| Merged PR = production acceptance | false |

### Inventory buckets agents must keep distinct

| Bucket | Examples in repo | Pre-mortem risk |
| --- | --- | --- |
| **Works in product centre** | Investigation workspace surfaces, Context Passport UI, context conflict audit, department projections, device-local save | 01 / 06 |
| **Simulated / fixture / soft-land** | Runner fixtures, synthetic patients, demo universe packs, enterprise/workspace shells, honesty catalogs | 01 / 04 |
| **Blocked / held** | Migrations 022–033 held; production graph writes fail-closed; source clearance authority unappointed; gold suite empty of adjudicated cases | 02 / 05 / 09 |
| **Unbuilt for commercial proof** | Paid checkout, institutional MoU, repeatable acquisition, SME ranking of gaps | 03 / 12 |

### Days 1–15 exit checklist

- [ ] One page inventory: works / simulated / broken / unbuilt (refresh this doc + STATUS cross-links).  
- [ ] Critical CI green on the Stage 2 / Demo stacks **or** explicit owner deferral.  
- [ ] Isolation / auth soft-land packets listed with what is still owner-gated (no invented pass).  
- [ ] Named **single** next build: continuous workspace trail (passport → comparison → brief → save/reopen fail-closed) — not another audience landing.

---

## Days 16–40 — Prove the scientific engine

| Deliverable | Repo truth to reuse | Must not claim |
| --- | --- | --- |
| One end-to-end investigation | `/research/workspace`, live brief/comparison libs, public literature providers where permitted | Scientific approval |
| Synthetic multi-omics **labelled** | Demo Universe fixtures / synthetic validation plane | Real patient / private institutional data |
| Independent evaluation protocol | `evaluation/independent-evaluation/immuno-v1/`, gold harness (empty of real adjudicated cases today) | Approved floors or 120-case completion |

**Risk focus:** 02, 04, 12.

---

## Days 41–65 — Prove researcher value

| Deliverable | Existing hooks | Must not invent |
| --- | --- | --- |
| 5–10 design-partner sessions | Design partner kit, usefulness / WTP milestones (device-local honesty) | Fake users, testimonials, conversion rates |
| Observe completion + limitation understanding | Journey acceptance docs, researcher usefulness feedback soft-lands | “Journey complete” flag |

**Risk focus:** 01, 06.

---

## Days 66–90 — Collaboration and willingness to pay

| Deliverable | Constraint |
| --- | --- |
| Opt-in matching pilot | Permission-based only; no marketplace liquidity claims (Risk 07) |
| Buyer interviews (biotech / translational hypothesis) | No invented MoU or Gate C (Risk 03 / 09) |
| Delivery cost snapshot | Stay within lean infra doctrine (Risk 11) |

---

## Risk → immediate engineering control

| # | Risk | Control in `hsi-core` now |
| --- | --- | --- |
| 01 | Build everything first | Prefer workspace trail PRs; Stage 2/Demo landings are acquisition chrome, not product proof |
| 02 | Untrustworthy science | Provenance + abstention + conflict classes; no silent approval; gold empty until SME |
| 03 | No paying customer | WTP milestone honesty only; commercial GTM hypothesis = biotech / translational |
| 04 | Misleading omics links | Demo Universe + synthetic labels required; no unlabelled cross-omics causality |
| 05 | Data access blocked | Fail-closed writes; held migrations; no private data onboarding |
| 06 | Workflow unchanged | Measure first useful investigation + reopen — not shell count |
| 07 | No network liquidity | Defer collaboration marketplace |
| 08 | Commoditised AI features | Compete on Connect→Verify→Reason→Collaborate workflow, not chat alone |
| 09 | Confidentiality incident | Isolation suites, rate limits, kill switches; no PHI |
| 10 | Complexity overload | One journey; reuse existing modules; no greenfield platforms |
| 11 | Bad economics | Cap model spend; prefer public metadata + fixtures |
| 12 | No impact evidence | Benchmarks + design-partner outcomes before P2 expansion |

---

## Hard stop rules (from pre-mortem §7)

- Weak scientific reliability → **stop feature expansion**; strengthen verification.  
- Persistent security failures → **do not** onboard confidential institutional or patient data.  
- Collaboration interest without scientific intelligence → **do not** pivot to networking.

---

## Next coding task (after owner accepts this mapping)

Unify the primary `/research/workspace` trail so Ask → permitted evidence → Context Passport → supporting/conflicting comparison → cross-domain candidates → gaps/hypotheses (labelled) → evidence-linked brief → save/reopen (fail-closed) is one continuous UI.

**Out of scope for that task:** `/workspaces` expansion, enterprise RBAC, lifting held migrations, production writes, PHI, inventing gold.
