# PRD → hsi-core implementation audit

**Audit date:** 1 November 2026  
**Scope:** ISI Pilot PRD + ISI Target-State PRD vs hsi-core phases **0–8** + **Akeno-in-HSI**  
**Edit target:** hsi-core only (no immunecity edits; no Neon mutations in this audit)  
**Sources (external):**  
- `~/Downloads/ISI_Immune_Discovery_Pilot_PRD.docx` (v1.0, 1 Nov 2026)  
- `~/Downloads/ISI_Target_State_End_to_End_PRD.docx` / `.pdf` (v1.0, 1 Nov 2026)  
**Repo anchors:** [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md), [`ISI_TARGET_STATE_PRD_ALIGNMENT.md`](./ISI_TARGET_STATE_PRD_ALIGNMENT.md), [`ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md`](./ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md), [`ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md`](./ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md), [`ISI_BUSINESS_PROPOSAL_ALIGNMENT.md`](./ISI_BUSINESS_PROPOSAL_ALIGNMENT.md), [`ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md`](./ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md), [`ISI_PILOT_BRIEF.md`](./ISI_PILOT_BRIEF.md), [`OUTPUTS.md`](./OUTPUTS.md), [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md), [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md)

**Status vocabulary:** `DONE` · `PARTIAL` · `NOT STARTED` · `OUT OF SCOPE` (deferred / gated)

---

## Executive verdict (green / yellow / red by stage)

| Stage | Traffic light | One-line verdict |
|-------|---------------|------------------|
| **R0 foundation (HSI)** | **GREEN** | Substrate, grades, provenance, Neon isolation, Gate C checklist, versioned publish — shipped. |
| **R1 research intelligence (HSI substrate + `/discovery`)** | **GREEN w/ YELLOW** | Four outputs + Discovery Centre ASK→MAP→REVIEW on real packs **done** in hsi-core. **Yellow:** named `partnerSigned` / licensing / numeric thresholds / ISI product RBAC still open — blocks full Pilot DoD, not substrate completeness. |
| **R2 discovery workbench (HSI)** | **GREEN w/ YELLOW** | Hypothesis cards + ranked gaps + VALIDATE tab **done**. Molecular adapters / live experiment planning **OUT OF SCOPE**. |
| **R3 translational (HSI scaffolding)** | **YELLOW** | Translation handoff + TRANSLATE tab exist as **research → HITL candidates only**. Cohort / longitudinal / trial landscape product work **NOT STARTED** (correctly gated). |
| **R4–R5 / live Akeno CDS** | **RED (correctly not built)** | Live clinical pathway, site PHI, prospective CDS **NOT STARTED / OUT OF SCOPE**. In-repo `/akeno` HITL is scaffolding only (`clinicalActive=false`). |
| **Partner pilot readiness (M3)** | **YELLOW** | Walkthrough + acceptance pack ready; **cannot** claim signed pilot until outreach flips `partnerSigned`. |

**Bottom line:** hsi-core has completed the **evidence-backbone job** for Stage 1 / R0–R1 and honest R2–R3 *scaffolding*. Gaps that **block a real partner pilot** are outreach + rights + ISI product consumption — not missing four-output substrate. Gaps that are **target-state only** must not be pulled into Stage 1 build pressure.

---

## Phase ↔ commit evidence (hsi-core)

| Phase | What landed | Commit (short) |
|-------|-------------|----------------|
| 0 | Shared evidence substrate | `27a6177` |
| Neon isolation | red-wave only; ban ISI/Akeno/DeliverX | `53e2aee`, `edad4b4` |
| Pilot PRD pack | Evidence pack + PRD alignment | `b4776bc` |
| 1b → 2 | Provisional → scope lock RA/TNF | `3cc80af`, `5c2dc15` |
| 3 | RA/anti-TNF evidence depth | `e2612dc` |
| 4 | HSI Neon migrations + guards | `e8c1c9d` |
| 5 | Acceptance + walkthrough | `7cd08a8` |
| 6 | Discovery Centre `/discovery` | `3c1106b` |
| 7 | R2 validation | `60877d2` |
| 8 | Translation handoff | `f3d43a3` |
| Akeno-in-HSI | `/akeno` HITL consumer | `84d8496` |

Reproduce: `bun test && bun run outputs && bun run site:dev` → `/discovery`, `/akeno`.

---

## 1. Stage 1 pilot acceptance (Pilot PRD)

### 1.1 Four workflow outputs

| Requirement | Status | Evidence |
|-------------|--------|----------|
| **1. Evidence map** (sources + grades) | **DONE** | `src/pilotEvidencePack.ts` → `hsi-pilot-evidence-pack.*`; ISI export `hsi-isi-export.json`; grades in `src/grades.ts`; site MAP tab |
| **2. Entity slice** (cells, pathways, biomarkers, treatments, studies) | **DONE** | Pack `entitySlice` / `partnerScopedEntitySlice`; LOINC on markers (`src/markers.ts`) |
| **3. Competing explanations + uncertainties** | **DONE** | Pack competing frames (TNF-centric vs IL-6 / ACPA); `uncertain` grades preserved |
| **4. Expert shortlist** (gaps / hypotheses; no auto-approve) | **DONE** | Pack `expertShortlist` + gap report + Gate C pending; `autoApproved=false` enforced in `src/pilotAcceptance.ts` |
| Research brief shell (citations + caveats) | **DONE** (machine + md) | `hsi-pilot-evidence-pack.md`; claim-ID citations |
| PDF/DOCX brief export (FR-10 P1) | **OUT OF SCOPE** | Deferred to ISI product; JSON/MD + `MANIFEST.json` only |

### 1.2 Partner lock + grades + Gate C

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Disease + question selected (engineering) | **DONE** | `src/partnerLock.ts` → `site/public/discovery/hsi-partner-lock.json`: RA + anti-TNF heterogeneity; `scopeLocked=true` |
| Named partner confirms disease/question (Pilot §11 / M0 exit) | **NOT STARTED** (outreach) | `partnerSigned=false`, `lockedPilot=false`, `partner.type=outreach_category` |
| Evidence grades established / uncertain / unexplored | **DONE** | `src/grades.ts`; DB check constraint in `db/migrations/001_hsi_substrate.sql`; dual axes `hsiGrade` / `curationReview` / `teachingStatus` |
| Gate C checklist (pending; human approve) | **DONE** (HSI artifact) | `src/gateCChecklist.ts` → `gate-c-checklist.*`; `autoApproveIntoKg=false`; approve path = ISI Neon `autumn-snow` only (not HSI) |
| Gate C local placeholders on HSI Neon | **DONE** (guarded) | `bun run db:gate-c-local`; `src/db/neonGuard.ts` refuses non–red-wave |
| Phase 5 acceptance honesty | **DONE** | `src/pilotAcceptance.ts`; sample `overallStage1Acceptance: green_with_pending`; four outputs green; partnerSigned pending |

### 1.3 Pilot FR / AC coverage (hsi-core vs ISI product)

| ID | PRD ask | hsi-core | ISI product (immunecity) |
|----|---------|----------|---------------------------|
| FR-01/02 | Question workspace + scope | **PARTIAL** — pack `questionProject` + partner lock | **NOT STARTED** here (out of edit scope) |
| FR-03/04 | Search + claim detail | **PARTIAL** — graded edges + provenance in exports; `/discovery` inspect | Full-text search / filters deferred |
| FR-05 | Graph exploration | **PARTIAL** — edges + REL map; no interactive graph product | Deferred |
| FR-06 | Evidence grade UI | **DONE** substrate; **PARTIAL** product help | Grade defs in pack + site |
| FR-07 | Reviewer workflow UX | **PARTIAL** — Gate C checklist + REVIEW tab; no in-product annotate/RBAC | ISI Neon approve |
| FR-08/09 | Brief + safe synthesis | **DONE** pack shell; no ungrounded clinical LLM | LLM brief in ISI app deferred |
| FR-10 | PDF/DOCX + manifest | **PARTIAL** — manifest **DONE**; PDF/DOCX **OUT OF SCOPE** | P1 |
| FR-11 | Audit history | **PARTIAL** — provenance + Gate C + `generatedAt` | Full change-log deferred |
| FR-12/13/14 | Sources / feedback / trials | **OUT OF SCOPE** / P1 | Product |
| AC-01…07 | Scope reopen, claim→source, filters, missing labels, brief citations, versioning | **PARTIAL→DONE** on substrate/exports; UI ACs need ISI deploy | Product AC demo |
| AC-08 | Role separation | **PARTIAL** — documented limitation; no RBAC in hsi-core | Required for deployed pilot |
| AC-09 | No patient fields | **DONE** | `notCds`, `cdsSurfacable=false`, pack flags |
| AC-10 | Feedback flag | **OUT OF SCOPE** | P1 |

### 1.4 Milestones M0–M4

| Milestone | Status in hsi-core | Notes |
|-----------|--------------------|-------|
| **M0** discovery | **PARTIAL** | Contract + scope lock + shortlist done; signed brief / named partner / data-rights **pending** |
| **M1** evidence explorer | **PARTIAL** | `/discovery` ASK/MAP/REVIEW on packs; not full ISI app |
| **M2** brief + export | **PARTIAL** | Versioned md/json + MANIFEST; no PDF/DOCX |
| **M3** partner pilot run | **NOT STARTED** | Blocked on `partnerSigned` + evaluation thresholds |
| **M4** clinical pathway | **OUT OF SCOPE** | Explicit non-goal; Phase 8 scaffolding ≠ M4 |

---

## 2. Discovery Centre (Target R1)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Question → evidence → review surface | **DONE** (HSI) | `site/src/pages/DiscoveryCentre.tsx` — ASK → MAP → REVIEW → VALIDATE → TRANSLATE |
| Loads real regenerable packs | **DONE** | `site/public/discovery/*.json` refreshed by `bun run outputs` (`src/publishOutputs.ts`) |
| Not diagnostic / not CDS banners | **DONE** | Hard copy: `notCds`, `clinicalActive=false` |
| Concept HTML (ChatGPT/Unkapped) as product | **OUT OF SCOPE** | Reference-only — [`ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md`](./ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md); do not vendor |
| Full ISI Discovery Centre (immunecity pages) | **OUT OF SCOPE** for hsi-core edits | Consume exports only |
| Interactive disease switcher as validated multi-TA | **NOT STARTED** (correct) | SLE/PsO/IBD remain **illustrative** in seeds/meta |

---

## 3. R2 validation (Target R2)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Hypothesis tracking / disagreement / gaps | **DONE** (HSI) | `src/r2Validation.ts` → `hsi-r2-validation.*`; VALIDATE tab |
| Literature / testability framing | **DONE** | Ranked gaps + literature tests; research-only |
| Selected molecular / omics adapters (ISI-07) | **OUT OF SCOPE** | Stage 2+ after use-case + license |
| Reproducible validation workflow demo | **PARTIAL** | Regenerable JSON/MD + site tab; partner-agreed numeric thresholds still **pending** |

---

## 4. R3–R5 / Akeno translation vs PRD claims

| PRD claim | What PRD actually requires | hsi-core status | Honesty check |
|-----------|----------------------------|-----------------|---------------|
| R3 translational research | Cohorts, longitudinal, subgroups, trial landscape | **PARTIAL** scaffolding only | `hsi-translation-handoff.*` = candidates for HITL, **not** cohort analytics |
| R4 Akeno site workflow | Feasibility + HCP-reviewed screening | **OUT OF SCOPE** | Gates: partner data, HCP eval, regulatory — unmet |
| R5 prospective CDS | Narrow CDS if justified | **OUT OF SCOPE** | Must not be claimed from packs |
| “Akeno in HSI” | — | **DONE** as **HITL consumer** | [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md): `src/akenoConsumer.ts`, `/akeno`, `clinicalUse=not_for_clinical_use`, `hitlRequired=true`, `autoApprove=false`; **never** Akeno Neon |
| teachingStatus ≠ hsiGrade ≠ CDS | Integrity rule | **DONE** | Gate C `translationCandidates` + Discovery TRANSLATE tab |

**PRD vs implementation mismatch to avoid in decks:** Target PRD describes end-to-end clinical possibility. hsi-core Phase 8 delivers **translation scaffolding**, not R3–R5 product readiness. Messaging must keep NOW/NEXT/LATER.

---

## 5. Neon / evidence backbone ownership

| Concern | Status | Evidence |
|---------|--------|----------|
| HSI owns substrate Neon | **DONE** | `red-wave-06625195` / `ep-restless-dew…` — [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md) |
| HSI-owned schema stub | **DONE** | `db/migrations/001_hsi_substrate.sql`; `bun run db:migrate` |
| Refuse ISI / Akeno / DeliverX hosts | **DONE** | `src/db/neonGuard.ts` |
| No shared evidence DB with immunecity | **DONE** (policy + guards) | AGENTS.md + Neon map |
| Gate C **approve** writes | **OUT OF SCOPE** for HSI | Human-only in ISI product Neon `autumn-snow` / `ep-blue-salad…` |
| Akeno Neon from hsi-core | **OUT OF SCOPE** | Documented `AKENO_*` only; unused by consumer |
| Duplicate canonical graph in ISI | **OUT OF SCOPE** / forbidden | Target PRD §7: HSI = system of record; ISI consumes |

---

## 6. Safety: not CDS, HITL, messaging risks

| Control | Status | Evidence |
|---------|--------|----------|
| No individual risk / diagnosis / treatment / eligibility / outreach / EHR | **DONE** (invariants) | Pilot PRD §1 boundary; MANIFEST `notCds` / `autoSurfaceCds=false`; seeds `cdsSurfacable=false` |
| Expert shortlist never auto-enters KG | **DONE** | `autoApproveIntoKg=false`; Gate C pending |
| HITL required for translation candidates | **DONE** | Phase 8 handoff + `/akeno` fail-closed stubs |
| Separate research vs clinical surfaces | **DONE** (HSI) | `/discovery` research · `/akeno` HITL-gated · no live CDS |
| Messaging: scopeLocked ≠ MoU | **DONE** (docs + lock JSON) | Flip requirements in `hsi-partner-lock.json` |
| Messaging risks remaining | **PARTIAL** (process) | Vision breadth / disease list / “platform” language can over-read Stage 1 — see Discovery Centre alignment §Messaging risks |
| Pilot evaluation ≠ clinical performance claims | **DONE** (documented) | Pilot PRD §9; brief success metrics |

---

## 7. Gap triage

### 7.1 Blocks a real partner pilot (act now)

| Gap | Why it blocks | Recommended ask |
|-----|---------------|-----------------|
| Named `partnerSigned` / `lockedPilot` | M0 exit + Pilot §11 #1 unmet | Outreach: confirm org + disease + question wording in writing; then flip lock fields |
| Source licensing / attribution for agreed corpus | M0 data-rights gate | Partner lists permitted PMIDs/datasets + license notes |
| Numeric success thresholds | Evaluation plan incomplete | Agree rubric cut-offs before user testing |
| ISI product consumption path | Pilot DoD wants deployed UI AC demo | Explicit ask: which immunecity surfaces consume which `dist/outputs/` files (no hsi-core inventing UI) |
| Auth / workspace tenancy (AC-08) | Role separation for live pilot | ISI deploy decision — document manual review if RBAC slips |

### 7.2 Target-state only (do not start from this audit)

| Gap | Release | Rule |
|-----|---------|------|
| Molecular / omics adapters | R2+ | Need use-case + license |
| Cohort / longitudinal / PHI analytics | R3 | Partner datasets + governance |
| Trial matching / protocol-to-cohort | R3–R4 | Investigator override; no autonomous eligibility |
| Live Akeno CDS / EHR | R4–R5 | Separate clinical validation |
| PDF/DOCX renderer | Pilot P1 / ISI | Only if partner asks |
| Feedback tickets / trial landscape browser | P1 | Product backlog |
| Vendor ChatGPT Discovery HTML | Never | Reference-only |

---

## 8. Capability scorecard (Target ISI-01…15 for hsi-core)

| ID | Capability | Status |
|----|------------|--------|
| ISI-01 | Question orchestration | **PARTIAL** (template + lock) |
| ISI-02 | Unified search | **PARTIAL** (substrate provenance; no product search) |
| ISI-03 | Interactive KG | **PARTIAL** (export edges; limited site map) |
| ISI-04 | Evidence synthesis | **PARTIAL** (pack brief; no grounded LLM product) |
| ISI-05 | Hypothesis workspace | **DONE** (R2 cards) / depth still research-only |
| ISI-06 | Research planning | **PARTIAL** (gap shortlist; no assay plans) |
| ISI-07 | Molecular adapters | **OUT OF SCOPE** |
| ISI-08 | Cohort analytics | **OUT OF SCOPE** |
| ISI-09 | Trial landscape | **OUT OF SCOPE** (unless partner asks) |
| ISI-10 | Protocol-to-cohort | **OUT OF SCOPE** |
| ISI-11 | Akeno workflow | **PARTIAL** (HITL scaffolding) / live **OUT OF SCOPE** |
| ISI-12 | Evidence curation | **PARTIAL** (Gate C checklist; product UX elsewhere) |
| ISI-13 | Longitudinal learning | **PARTIAL** (versioned bundles only) |
| ISI-14 | Exports and APIs | **DONE** (`bun run outputs`) |
| ISI-15 | User feedback | **OUT OF SCOPE** (P1) |

---

## 9. Recommended next asks (ordered)

1. **SSc-vs-RA vertical decision** — Whole-Immune-Cell PRD wants SSc MVP / RA R2; Stage 1 lock is RA/TNF. Prefer dual-track (keep RA seeds; mark SSc as PRD target) — see [`ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md`](./ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md). Do not wipe RA.  
2. **Partner outreach** — flip `partnerSigned` with a real org; refresh shortlist row; never invent contacts.  
3. **Rights pack** — licensing table for the RA/TNF PMID set + any partner-supplied sources.  
4. **Evaluation contract** — numeric thresholds on the existing review rubric.  
5. **ISI consume checklist** — which export files power which product screens (immunecity team; hsi-core stays export-stable).  
6. **Hold the line** — no R3–R5 feature work, no Neon mutations for “demo CDS,” no immunecity edits from this workspace until vertical decision + outreach land.

---

## 10. Definition-of-done cross-check

| Pilot DoD item (PRD §13) | hsi-core today |
|--------------------------|----------------|
| P0 requirements in **deployed pilot environment** | **PARTIAL** — substrate + HSI site green; ISI partner deploy still open |
| Scientific reviewer examined claims/briefs | **PARTIAL** — walkthrough + rubric ready; partner reviewer session not run |
| Attribution, grades, review history, limitations visible | **DONE** in exports + `/discovery`; full UI audit trail partial |
| No patient-level prediction / eligibility | **DONE** |
| Partner evaluation readout + go/refine/stop | **NOT STARTED** |
| Clinical pathway only after separate gate | **DONE** (enforced by OUT OF SCOPE + Phase 8 flags) |

---

## Cross-links

- **Current status + next backlog:** [`BUILD_STATUS_AND_NEXT.md`](./BUILD_STATUS_AND_NEXT.md)  
- Pilot PRD map: [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md)  
- Target-state map: [`ISI_TARGET_STATE_PRD_ALIGNMENT.md`](./ISI_TARGET_STATE_PRD_ALIGNMENT.md)  
- Technical blueprint: [`ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md`](./ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md)  
- Whole-immune-cell PRD: [`ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md`](./ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md)  
- Outputs contract: [`OUTPUTS.md`](./OUTPUTS.md)  
- Akeno-in-HSI: [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md)  
- Neon isolation: [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md)
