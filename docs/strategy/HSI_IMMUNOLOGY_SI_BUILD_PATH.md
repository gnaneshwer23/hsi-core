# Immunology SI build path — cleaned founder plan

**Status:** Strategy digest (2026-11-02). Preserves the founder “immunology super-intelligence” plan; **stamps honesty** against shipped HSI/ISI.  
**Not:** a claim of current benchmark performance, MoU, Gate C auto-approve, or live CDS/PHI.  
**Related:** [HSI_Power_Blueprint](file:///Users/gnaneshwerjadav/Downloads/HSI_Power_Blueprint.md) (Downloads) · [HSI_COMPETITOR_ANALYSIS_2026-11.md](./HSI_COMPETITOR_ANALYSIS_2026-11.md) · [../BUILD_STATUS_AND_NEXT.md](../BUILD_STATUS_AND_NEXT.md) · [../CDS_PHI_BOUNDARY.md](../CDS_PHI_BOUNDARY.md)

---

## Honesty stamps (read first)

| Claim in raw plan | Stamp |
| ----------------- | ----- |
| Citation ≥98% / claim grounding ≥90% / contradiction ≥80% / usefulness ≥80% | **Engineering targets**, not measured current performance |
| “Build foundations 8–12 weeks before AI” | Partially obsolete — Stage 1 backbone + ISI KG/Ask/M1 already exist; **compress** learning into SME review of gaps, not greenfield study |
| Education / Academy as product | **Supporting layer only** — HSI Science chrome removed; not a portfolio pillar ([competitor analysis](./HSI_COMPETITOR_ANALYSIS_2026-11.md)) |
| Neo4j / LangGraph / ImmPort / HCA as day-1 stack | **Defer** — ISI uses browser KG + Neon evidence; hsi-core uses versioned packs + Postgres/`hsi_*`. Adopt new infra only when a ticket proves the gap |
| Months 1–2 “choose melanoma **or** RA **or** IBD” | **Already decided dual-track:** hsi-core `activeScope=ra-tnf`; ISI melanoma pilot is the **product surface** vertical. Do not reopen as exclusive OR |
| Gate C / clinical modes | Human-only; `autoApprove=false`; research ≠ clinician CDS ≠ patient dosing. No invent MoU / `legalBinding` |
| Live CDS / PHI in HSI substrate | **Forbidden** ([CDS_PHI_BOUNDARY](../CDS_PHI_BOUNDARY.md)) |

---

## Verdict (founder take)

The plan’s **north star is correct and already the company doctrine**: small evidence-grounded immunology reasoning first; differentiator = mechanism + evidence + disagreement + unknowns + testable next step — not a bigger chatbot. Five layers map cleanly onto what HSI/ISI already sketched (LHK-G + Gate C + M1 brief Caps 6/10/11 + eval harnesses).

**What’s excellent (adopt as-is):**

1. Evidence-before-agents sequencing (Stages 3→5→6 before giant orchestration).  
2. Claim/edge provenance shape (supports / contradicts / review status).  
3. Evaluation-before-scale (Stage 6) aligned with Ask-edu gold, M1 golden eval, Stage 1 rubric.  
4. Three-mode boundary (research / clinician / patient education) — matches CDS/PHI + competitor ISI-first.  
5. 30-day Melanoma Explorer success test — almost the existing Phase E path + brief question.

**What’s already shipped (do not rebuild):**

| Plan layer / stage | Shipped reality |
| ------------------ | --------------- |
| L1–L2 knowledge + graph | ISI `src/data/kg.json` + draft `extensions.ts`; Atlas / concepts; typed relations |
| L3 evidence + Gate C | Neon evidence + Gate C Check→supports→Approve; hsi-core grades + `gateCChecklist` + cite-ready after Gate C |
| L4 bounded workflow | Ask → investigation brief (`m1-2`) with Cap 6 / 10 / 11; Discovery consume; Hypothesis workbench scaffolding |
| L5 eval + oversight | Ask educational gold; M1 golden eval; melanoma validation matrix; SME workspace; curator UX |
| Stage 1 “foundations” | hsi-core Stage 1 RA/TNF packs, Discovery Centre, dual-track vertical |
| Melanoma Explorer seeds | PD-1 / pembro / nivo / ipi / KEYNOTE-006 / CheckMate-067 already in KG + `melanomaInvestigationPath` |

**Gaps (real work):**

- Melanoma edges still carry **DEFECT / TO_BE_CURATED / draft ESTABLISHED** rows — Explorer is **not** Gate-C-complete.  
- Trial Intelligence = educational Partial, **flag-off** ≠ HSI Trials product.  
- Passage-level citation validation and partner-agreed numeric KPIs are **targets**, not green.  
- ImmPort / IEDB / HCA / spatial / longitudinal / live CT.gov sync = **later** (plan Stage 7 / months 7–12).  
- hsi-core has **no melanoma pack**; RA remains substrate `activeScope` — ISI owns melanoma product depth.

**Compress / ignore:**

| Compress | Ignore / defer |
| -------- | -------------- |
| Months 1–2 “learn immunology + define 20 entity types” → SME gap review on existing graph | Greenfield Neo4j / AGE / LangGraph rewrite |
| Months 3–4 “ingest PubMed at scale” → harden passage links on **melanoma + RA** seed claims first | Bulk ImmPort / HCA / multi-omics as month-7 must-haves |
| Stage 1 tutorial curriculum as product | Standalone edtech / Science chrome |
| “Pick one vertical” debate | Replacing RA `activeScope` with melanoma in hsi-core |

**ISI-first vertical:** OK and recommended (Owkin/BenchSci lane). Melanoma Explorer is the **signature research demo**; RA/TNF remains HSI Stage 1 partner-scope honesty.

---

## Five layers (preserved)

```text
1. Immunology knowledge
2. Structured biological graph
3. Evidence and provenance
4. AI reasoning and agents
5. Evaluation, safety and human oversight
```

Differentiator (preserved): *mechanism, evidence, disagreement, unknowns, testable next experiment* — not chatbot fluency.

---

## Stages 1–8 → adopt / reshape / defer

| Stage | Plan intent | Decision | Mapping |
| ----- | ----------- | -------- | ------- |
| **1** Foundations / fluency | 8–12 weeks biology study | **Reshape** | Use as curator/SME onboarding checklist; engineering time goes to matrix defects + Gate C, not greenfield KG |
| **2** Versioned typed KG | Entity/rel tables + CL/Reactome | **Adopt** (already partial) | ISI KG authority; hsi-core packs + CL/MONDO binds; deepen melanoma predicates with provenance |
| **3** Evidence on every edge | Claim metadata block | **Adopt** | Enforce on melanoma matrix rows; Gate C human-only; never invent PMIDs |
| **4** Public data sources | PubMed, ImmPort, IEDB, HCA, Reactome, CT.gov | **Reshape** | PubMed/Europe PMC + CTG **Partial** first; ImmPort/IEDB/HCA **defer** until Explorer gold |
| **5** Bounded research workflow | Question → brief → human review | **Adopt** (shipped thin) | Deepen M1 brief + melanoma path; no autonomous agent fleet |
| **6** Evaluation before scale | 50–100 Q + metrics table | **Adopt** | Expand goldens; metrics stay **targets** until partner-agreed measurement |
| **7** Advanced caps | sc/spatial, multi-omics, trials product, hypothesis, longitudinal | **Defer** (ordered) | Hypothesis + trial structure before omics; Trials ≠ eligibility matcher; longitudinal only with consent |
| **8** Safety modes | Research / clinician / patient | **Adopt** | Binding; education supporting; no live CDS-PHI in HSI |

---

## 12-month plan (compressed against reality)

| Window | Raw plan | Honesty-compressed plan |
| ------ | -------- | ----------------------- |
| **M1–2** | Learn + small graph + pick vertical | Close melanoma matrix defects; Gate C cite path for KEYNOTE/CheckMate/PD-1 edges; keep RA scope locked in hsi-core |
| **M3–4** | Broad literature ingest + 50 Q | Passage-level links on pilot claims; grow Ask/M1 gold to ~50 **reviewed** Q; contradiction labels Cap 10 |
| **M5–6** | Research workbench + 3–5 experts | Pilot researchers on Melanoma Explorer + RA Discovery; hypothesis cards + review queue (no MoU invent) |
| **M7–9** | ImmPort/IEDB/HCA + trials + 100 Q | Selective source adds with license registry; Trial Intelligence honesty upgrade **without** “eligible”; expand eval |
| **M10–12** | Bounded agents + paid pilot + clinical governance prep | Agents only behind tool contracts + Gate C; governance docs before any clinician mode; still no CDS in substrate |

Technology stack recommendation in the raw plan is **aspirational**. Default stack remains: ISI React + `kg.json` + Neon evidence; hsi-core Bun packs + `red-wave` Neon; existing Ask/brief orchestration. Revisit Neo4j/LangGraph only via explicit ADR.

---

## Melanoma Immunotherapy Evidence Explorer (30-day) — concrete map

**Success test (preserved):** Researcher asks *“Why might a melanoma patient not respond to PD-1 blockade?”* and gets source-linked mechanisms, evidence quality, conflicts, biomarkers, trials, proposed experiments — **with honesty labels**, not clinical advice.

### Scope ↔ existing IDs

| Plan item | ISI / HSI artifact |
| --------- | ------------------ |
| Disease melanoma | `D012` in `immune-city/src/data/kg.json` |
| Pembrolizumab / nivolumab / ipilimumab | `I008` / `I009` / `I025` |
| PD-1 / PD-L1 / exhaustion / escape | `R011` / `R012` + related cells/pathways; teaching routes in `src/data/content.ts` |
| KEYNOTE-006 / CheckMate 067 | `TR003` / `TR020`; fixtures in `src/data/trialIntelligence.ts` |
| Mechanism path | `src/lib/immune/melanomaInvestigationPath.ts` (`MELANOMA_INVESTIGATION_SEEDS`) |
| Validation honesty | `docs/ISI_MELANOMA_PILOT_VALIDATION_MATRIX.md` · `src/data/melanomaPilotValidationMatrix.ts` · `MelanomaPilotChecklist.tsx` |
| Draft clinical edges | `src/data/extensions.ts` (`treats` / `has_clinical_context` — still draft) |
| Trial UI (educational, flag-off) | `src/components/immune/TrialIntelligence.tsx` · `VITE_TRIAL_INTELLIGENCE` |
| Discovery melanoma pilot | `src/routes/discovery.index.tsx` (`pilot: melanoma_a`) |
| Ask / M1 / Caps | `/ask` → `investigationBrief.ts` (schema `m1-2`) · Cap 6/10/11 modules · gold: `askEducationalGoldSet.ts` (`edu-mech-pd1-melanoma`) · `m1GoldenEval.ts` (`g-mech-pd1-melanoma`) |
| SME / curation | `SmeReviewWorkspace.tsx` · `/curation` · `docs/ISI_SME_WORKSPACE.md` |
| HSI side | Consume/playbook + Gate C human queue; `trialsCriteriaMvp.ts` melanoma **educational stub** only; **no** melanoma graded pack (RA/TNF packs remain Stage 1) |

### 30-day definition of done (honest)

- [ ] Matrix DEFECT / TO_BE_CURATED rows either Gate-C-fixed **or** downgraded honesty (no silent ESTABLISHED).  
- [ ] Non-response question returns brief with Cap 6 evidence, Cap 10 conflicts (or explicit none-found), Cap 11 gaps + search-scope note.  
- [ ] KEYNOTE / CheckMate comparison stays educational; no head-to-head superiority or eligibility claims.  
- [ ] Biomarker assay cut-offs remain empty stub.  
- [ ] Metrics table **not** published as achieved scores.

---

## What makes it “super-intelligent” (preserved, honesty-bound)

1. Ground every claim in inspectable sources.  
2. Reason molecule → cell → tissue → disease → trial.  
3. Handle context (species, tissue, stage, assay, dose, timing).  
4. Surface disagreement.  
5. Identify missing evidence without “absence of worldwide literature.”  
6. Generate falsifiable experiments.  
7. Learn via versioned expert review (Gate C).  
8. Respect research / clinician / patient boundaries.

---

## First 2-week ticket list

| ID | Repo | Ticket |
| -- | ---- | ------ |
| **MEL-01** | immune-city | Triage validation matrix: list Gate C–ready rows vs must-downgrade ESTABLISHED+TO_BE_CURATED (`ISI_MELANOMA_PILOT_VALIDATION_MATRIX.md`) |
| **MEL-02** | immune-city | Human KEYNOTE-006 rematch for `REL-I008-demonstrates_in-TR003` (correct PMID; no invent) |
| **MEL-03** | immune-city | Predicate/subject rewrite proposal for `REL-R011-drives_immune_exhaustion_in-D012` vs Dong 2002 Neon note — SME only |
| **MEL-04** | immune-city | Wire non-response Ask gold → brief: assert Cap 6/10/11 sections present; educational refuse on dosing |
| **MEL-05** | immune-city | Evidence table UX on melanoma path / Atlas: provenance + review status visible before “ESTABLISHED” prose |
| **MEL-06** | hsi-core | Document dual-track: RA `activeScope` vs ISI melanoma Explorer (this doc + BUILD_STATUS one-liner); no melanoma pack invent |
| **MEL-07** | both | Eval harness: 10 melanoma non-response / mechanism / trial-context questions marked `target_not_measured` until expert review |
| **MEL-08** | immune-city | Trial Intelligence: confirm prod flag off; comparability copy stays “educational only” |

---

## Binding non-goals

- Invented MoU / `lockedPilot=true` without real agreement  
- Gate C auto-approve / model flips of `hsiGrade`  
- Live CDS / PHI in hsi-core  
- Claiming metric targets as current performance  
- Rebuilding ISI KG in Neo4j “because the plan said so”  
- Treating Trial Intelligence or education chrome as the HSI Trials / Science product
