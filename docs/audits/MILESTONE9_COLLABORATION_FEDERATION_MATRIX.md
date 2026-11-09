# Milestone 9 — Scientific Collaboration, Federated Research & Discovery Networks

**Brief:** HSI Milestone 9 — extend existing auth, roles, Neon (red-wave), evidence/investigation contracts into **research organisations, tenant isolation, collaborative investigation contracts, and governed federation hooks**. Not a social network, not a separate app, not a new graph DB. Federation must **not** imply central ownership of institutional data.  
**Status:** Phase 0 gap audit + PR1 (Research Organisations and Tenant Security) — **not** collaboration complete, **not** federated discovery validated, **not** real institutional partnerships claimed.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `5ca518fcecbab365b02e7a3025914a38ab784b5b`  
**Tip commit:** `5ca518f Add M8 Phase 0 matrix and incremental evidence monitoring. (#98)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  

**Cross-links (do not contradict):**

- [`MILESTONE8_LIVING_SCIENTIFIC_INTELLIGENCE_MATRIX.md`](./MILESTONE8_LIVING_SCIENTIFIC_INTELLIGENCE_MATRIX.md) — M8 Phase 0 + PR1 on `main` (#98); change-detection open  
- [`MILESTONE7_SCIENTIFIC_EVALUATION_MATRIX.md`](./MILESTONE7_SCIENTIFIC_EVALUATION_MATRIX.md) — M7 Phase 0 + PR1 registry on `main` (#97); evaluators / dashboard open  
- [`MILESTONE6_INVESTIGATION_ORCHESTRATION_MATRIX.md`](./MILESTONE6_INVESTIGATION_ORCHESTRATION_MATRIX.md) — M6 Phase 0 + PR1 on `main` (#96); planner/router deepen open  
- [`MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md`](./MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md)  
- [`MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md`](./MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md)  
- [`MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md`](./MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md)  
- [`MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md`](./MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md)  
- [`BACKEND_INTEGRATION_MATRIX.md`](./BACKEND_INTEGRATION_MATRIX.md)  
- [`DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md`](./DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md)  
- [`../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md`](../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md)  
- [`../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md`](../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md)  
- [`../ARCH-003-AUTHENTICATED-API-INTEGRATION.md`](../ARCH-003-AUTHENTICATED-API-INTEGRATION.md)  
- [`../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md)  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  

**Out of PR1:** Collaborative investigation contracts (PR2), federated query gateway, discovery-network UI, unrestricted patient-level federated retrieval, claiming real external institutional partnerships, Gate C auto-approve, MoU invention, PHI/CDS, new graph DB / social product surface.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `operational` | Implemented and exercised on a current library/product path with honest gates |
| `partial` | Meaningful path exists; required depth, live wiring, or honesty gates incomplete |
| `missing` | No meaningful implementation for this M9 requirement |
| `blocked` | Cannot complete without human/config gate or unfinished prior milestone |
| `fixture-only` | Works only with static fixtures / seeded packs |
| `unverified` | Shape or stub exists; scientific / live correctness not verified |
| `in-flight` | Open PR not yet on `main` — document honestly |

Honesty freeze: no Gate C auto-approve · no invented MoU · no live CDS/PHI · fixtures ≠ live evidence · CI ≠ scientific validity · **federation ≠ central ownership of institutional data** · **AI cannot act as independent human reviewer** · tenant isolation fail-closed · no unrestricted patient-level federated retrieval · Neon red-wave only · do not claim real external institutional partnerships.

---

## Architecture principles (binding for M9)

| Principle | Implication for collaboration / federation |
|-----------|--------------------------------------------|
| **ARCH-001** Independent Intelligence, Connected Ecosystem | HSI remains independently operable; org federation is optional connection, not a monolith or social network |
| **ARCH-002** Living Health KG ownership | HSI owns governed KG contracts; institutional private data stays tenant-scoped; imports need provenance + review |
| **ARCH-003** Authenticated research API | Trusted session / grants only; never trust client-claimed roles or org membership |

---

## Phase 0 — M1–M8 dependency status (post-#98)

| Milestone | On audited `main` | Status | Collaboration / federation readiness |
|-----------|-------------------|--------|--------------------------------------|
| **M1** Biomedical evidence | Europe PMC + OT + UniProt metadata + dynamic persistence (`018`); living-evidence expand; CT.gov lookup | `partial` · live journey `blocked` (#5) · passages `blocked` (#2) | Shared public biomedical refs OK; institutional private corpora **not** started |
| **M2** Contextual / contradiction | Structured comparison (#90) + contradiction investigation (#92) | `partial` | Multi-party review of contradictions later; no cross-tenant private bleed |
| **M3** Hypothesis / experiment | Registry contracts (#91); multi-hypothesis eval `missing` | `partial` | Collaborative hypothesis ownership → PR2 contracts |
| **M4** Translational / failure | Contracts (#93) + failure taxonomy (#94) | `partial` | Programme sharing stays artifact-scoped |
| **M5** Precision translational | Precision contracts (#95); HCA/GEO `not_connected` | `partial` | No patient-level federated retrieval in M9 PR1–PR2 |
| **M6** Investigation orchestration | Capability registry + investigation contracts (#96); planner/router `missing` | `partial` | **Primary bind surface** for collaborative investigations (PR2) |
| **M7** Scientific evaluation | Phase 0 + benchmark registry (#97); scored evaluators `missing` | `partial` · science `blocked` | Independent reviewer role ≠ AI judge; SME gates remain human |
| **M8** Living / incremental monitoring | Phase 0 + incremental monitoring (#98); change-detection `missing` | `partial` | Org-scoped subscriptions later; monitoring ≠ partnership claim |
| Human #2 / #4 / #5 | PARKED | `blocked` | Blocks live multi-org E2E and scored gold claims |

**Verdict:** Eng substrate is sufficient for M9 **PR1 Research Organisations and Tenant Security** (org / team / membership / role contracts + fail-closed tenant isolation + privilege-escalation / cross-tenant denial tests). Do **not** mark scientific collaboration or federated discovery complete from CI green. M1–M8 remain **partial** (eng) / **not scientifically validated**.

**#98 merge:** Squash-merged to `main` at `5ca518fcecbab365b02e7a3025914a38ab784b5b` (CI green: verify + site-deployment + Vercel). Unrelated opens (e.g. #71) skipped.

---

## Security / architecture assessment (Phase 0)

| Area | Existing | Working status | M9 relevance |
|------|----------|----------------|--------------|
| Neon Auth session verify | `neonAuthResearchActor.ts` | `partial` (staging gated) | Trust only server-verified principal; never client JSON roles |
| Research grants | `006_hsi_research_access.sql` · `researcher` / `research_admin` | `partial` | Bridge to org membership; do not replace grants silently |
| Independent reviewer authority | `005_hsi_reviewer_authority.sql` · `scientific_reviewer` | `partial` | Maps toward org `independent_reviewer`; AI agents denied |
| Account contract | `researchAccount.ts` · `researchAccountStore.ts` | `partial` | Read-only account surface; org membership extends, does not invent admin |
| Investigation auth scope | `investigationOrchestrationContracts.ts` | `partial` (#96) | Add tenant / org ids in PR2 — not full gateway in PR1 |
| Evidence ledger / review | `016` · review stores | `partial` | Artifact-level permissions later; no auto-approve |
| Governed graph read | ARCH-002 stores / LHKG | `partial` | HSI KG ownership preserved under federation |
| Capability rehearsal | `capabilities/governance.ts` | `partial` | `live_patient` remains excluded |
| Research organisations / teams | — | `missing` → **PR1** | Contracts + thin store; no social graph |
| Tenant isolation helpers | Cross-principal checks in stores | `partial` → deepen **PR1** | Fail-closed cross-tenant denial |
| Org Neon tables | — | `missing` | **Deferred** — prefer contracts + memory store until product write path needs columns |
| Federated query gateway | — | `missing` | Later — not PR1 |
| Discovery network UI | — | `missing` | Later — not PR1 |
| Patient-level federated retrieval | — | `out_of_scope` (current) | Explicit non-start |

**Persistence decision (PR1):** Prefer **validated contracts + thin in-memory store** projecting onto existing `hsi_research_access` / `hsi_reviewer_authority` role vocabulary. No new Neon migration in PR1 — existing grants remain authoritative for live auth. A backwards-compatible org-table migration is deferred until a trusted write path needs durable org rows on red-wave.

---

## Milestone 9 capability matrix (phases)

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit + dependency + security matrix | This document | — | `operational` (audit) | Keep updated as PRs land | this file |
| **1** Research organisations + tenant security | Neon Auth · research access · reviewer authority · account contract | `partial` → **PR1 in-flight** (`eng/m9-research-org-tenant-security`) | Org / team / membership / roles · metadata · fail-closed isolation · escalation tests | `src/researchOrganisationTenantSecurity.ts` · `test/researchOrganisationTenantSecurity.test.ts` · `scripts/research-organisation-tenant-security.ts` · `evaluation/research-organisation-tenant/` |
| **2** Collaborative investigation contracts | M6 investigation contracts | `missing` | Shared investigation ownership / artifact ACL without cross-tenant bleed | future PR2 |
| **3** Federated query / discovery hooks | Public adapters only | `missing` | Bounded, consented, non-patient federation | later |
| **4** Discovery network UI | — | `missing` | Not a social product | later |
| **5+** Partnership ops / MoU | — | `blocked` (honest) | Human legal — never invent MoU | human-gated |

---

## PR1 deliverable (this increment)

**Research Organisations and Tenant Security**

- Research organisation / team / membership contracts.  
- Closed org roles: org admin, PI, contributor, independent reviewer, data steward, observer, platform admin.  
- Org metadata: id, name, type, verified-domain config placeholders, membership, governance contacts, data-sharing policy refs, approved integrations, audit settings, lifecycle.  
- Fail-closed tenant isolation helpers / permission checks (cross-tenant access denied).  
- Tests for privilege escalation and cross-tenant denial.  
- Bridge existing `researcher` / `scientific_reviewer` / `research_admin` grants without inventing live partnerships.  
- AI / agent actors cannot hold or exercise independent human reviewer authority.  
- Neon red-wave policy preserved; no new migration in PR1; no Gate C / MoU / PHI; fixtures ≠ live; no federated query gateway or discovery UI.

**Out of PR1:** PR2 collaborative investigation contracts, federated query gateway, discovery-network UI, patient-level federated retrieval, real partnership claims.

---

## Human blockers (unchanged)

| Item | Status | Blocks for M9 |
|------|--------|---------------|
| #2 Passage / abstract rights | PARKED | Passage-level shared corpora |
| #4 SME gold | PARKED | Scored acceptance of multi-org review quality |
| #5 Live Ask→export journey | PARKED | Live multi-tenant E2E success |
| Real institutional MoU / domain verification | Not invented | Production verified-domain and legal data-sharing |

---

## Anti-patterns (binding)

- Do not build a social network, separate collaboration app, or new graph DB.  
- Do not imply central ownership of institutional data via “federation”.  
- Do not allow cross-org private data access; deny by default.  
- Do not let AI agents act as independent human reviewers.  
- Do not start unrestricted patient-level federated retrieval.  
- Do not claim real external institutional partnerships from fixtures or CI green.  
- Do not auto-approve Gate C, invent MoU, or wire PHI/CDS.  
- Do not merge autumn-snow / Akeno / DeliverX Neon into HSI substrate.
