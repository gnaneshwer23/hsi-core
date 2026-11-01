# ISI Whole-Immune-Cell PRD ↔ hsi-core alignment

**Source (local only):** `~/Downloads/ISI_PRD_Whole_Immune_Cell_Platform.docx`  
**Extracted via:** `textutil -convert txt` (do **not** fetch or commit any S3 URLs from the download package — they may embed temporary AWS credentials).  
**Document:** Immune Super Intelligence (ISI) — Product Requirements Document — Whole-Immune-Cell Discovery Platform · Version 0.1 Draft · 1 November 2026 · Owner Dr Gnaneshwer Jadav · Status: For review and approval.

**Repo anchors:** [`ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md`](./ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md) (commit `357a8e9`), [`PRD_IMPLEMENTATION_AUDIT.md`](./PRD_IMPLEMENTATION_AUDIT.md), [`OUTPUTS.md`](./OUTPUTS.md), [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md) (expanded multi-axis target graph — does not force SSc/RA pivot), [`AKSH_AGENTS_IN_HSI.md`](./AKSH_AGENTS_IN_HSI.md), [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md), [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md), [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md).

**Edit target:** hsi-core only. Neon: HSI **`red-wave` only**. No immunecity edits. No secrets.

**Status vocabulary:** `DONE` · `PARTIAL` · `NOT STARTED` · `OUT OF SCOPE`

---

## PRD in one paragraph

ISI is a research-first **whole-immune-cell** discovery platform: major immune cell classes/lineages/subsets (CD4 is one lineage among CD8, B, NK, macrophage, DC, neutrophil, mast, ILCs, …) connected by **controlled relationship types** with mandatory context + evidence. MVP = immune-cell spine + **SSc** deep vertical (CD4/Tfh–B–IL-21; EBV as separate hypothesis). **RA** is Release 2 cross-disease comparison. Twelve bounded research agents under one orchestrator; evidence-first; strong clinical non-goals (no diagnosis/prognosis/treatment/patient risk/auto eligibility). HSI Core = shared infrastructure; ISI = immune product; Aksh = separate care app.

---

## Verdict vs hsi-core today

| Topic | This PRD | hsi-core now | Verdict |
|-------|----------|--------------|---------|
| Product hierarchy | HSI infrastructure; ISI immune product; Aksh care; Akeno later | Matches vision docs | **Aligned** |
| Whole-immune spine | Taxonomy + cell cards for major types | Spine **vocabulary stubs** landed (`src/immuneCellSpine.ts`); no full cell cards / ontology bind | **PARTIAL** |
| Controlled relations | 11 typed predicates + context+evidence | Phase 0 `HSI_EDGE_TYPES` + PRD vocab + map; seeds still use Phase 0 types | **PARTIAL** |
| First deep vertical | **SSc** Tfh–B–IL-21 | **RA / anti-TNF** `scopeLocked=true` | **Conflict** — see §Decision |
| RA | Release 2 comparison | Stage 1 locked seeds + packs | Dual-track possible — **do not wipe** |
| Evidence / Gate C / exports | Evidence cards, provenance, human review | Phases 0–8 + `/discovery` + Gate C | **DONE** (HSI job) |
| 12-agent workbench | Orchestrator + 11 specialists | Aksh **catalog** only; no ISI agent runtime | Catalog **DONE**; runtime **OUT OF SCOPE** Stage 1 |
| Clinical / PHI | Explicit non-goals | `notCds`, Akeno HITL scaffolding | **Aligned** |
| Neon | HSI as SoT after schema/licence review | Separate `red-wave` vs ISI `autumn-snow` | **Isolation must win** |

**Bottom line:** This PRD extends the Technical Blueprint (`357a8e9`) with a clearer whole-immune-cell spine and an explicit SSc-first / RA-R2 release split. hsi-core already owns the evidence backbone. Do **not** silently replace RA seeds with SSc. Resolve the vertical decision; then build spine depth + authorised SSc curation on HSI exports.

**Expanded systems vision (orthogonal):** User binding intent adds gut–immune, neuroimmune, disease/tissue/biomarker axes, patient-data plane rules, and P3 AI adapters as the **target connected graph** — see [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md) + `hsi-systems-vision.json`. That expansion does **not** override the RA Stage 1 lock or invent SSc deep seeds; “all” is multi-sprint, every edge still needs context+evidence.

---

## Ownership map

| Layer (PRD) | Owner | hsi-core role |
|-------------|-------|---------------|
| Immune-cell taxonomy / relationship vocabulary | **HSI** | Spine stubs + controlled-relation vocab (`immuneCellSpine.ts`); deepen with ontology IDs later |
| Graded claims, provenance, Gate C artifacts, versioned exports | **HSI** | Sole edit target — [`OUTPUTS.md`](./OUTPUTS.md) |
| Graph explorer / cell neighbourhood UX / compare mode | **ISI** (immunecity) | Consume exports; `/discovery` is HSI demo only |
| SSc / RA disease overlays (deep curation) | **HSI** seeds + **ISI** UX | Seeds only after vertical decision; RA lock intact today |
| 12-agent research workbench runtime | **ISI** product | Pattern reuse from Aksh catalog — no runtime in Stage 1 |
| ImmPort / HCA / GEO / Reactome / CT.gov connectors | Mostly **ISI** + curator | **OUT OF SCOPE** Stage 1 in hsi-core |
| Partner TRE / cohort feasibility / prospective CDS | Partner + **Akeno** | **OUT OF SCOPE** — [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md) |

---

## Section → status (with evidence)

### §1 Executive summary

| Ask | Owner | Status | Evidence |
|-----|-------|--------|----------|
| Whole-immune-cell discovery (not CD4-only) | HSI model + ISI UX | **PARTIAL** | Spine lineages in `src/immuneCellSpine.ts`; Discovery still RA-pack-centric |
| Versioned, evidence-linked KG | HSI | **DONE** | Exports + grades + Gate C |
| SSc first deep vertical; public/licensed only; no CDS | Product decision + policy | **PARTIAL** / non-goals **DONE** | SSc `prd_mvp_target` stub; `notCds` invariants |

### §2–§3 Problem / vision

| Ask | Owner | Status | Evidence |
|-----|-------|--------|----------|
| Context-qualified claims (subset, tissue, disease, assay) | HSI + ISI | **PARTIAL** | Pack context + grades; full context schema / ontology bind deferred |
| Distinguish established / emerging / conflicting / gaps | HSI | **PARTIAL** | `hsiGrade` + teaching + curation; PRD epistemic labels not 1:1 yet |
| “What should I test next?” | HSI R2 + ISI | **PARTIAL** | R2 hypothesis / gap cards; agent drafts **OUT OF SCOPE** |

### §4 Goals / non-goals

| Ask | Owner | Status | Evidence |
|-----|-------|--------|----------|
| Navigable immune-cell taxonomy | HSI | **PARTIAL** | Spine stubs; cell cards **NOT STARTED** |
| Controlled evidence-linked relations | HSI | **PARTIAL** | `ISI_CONTROLLED_RELATIONSHIP_TYPES` + map to Phase 0 edges |
| Start from any immune cell | ISI UX | **NOT STARTED** (product) | `/discovery` is question/pack flow, not cell-first explorer |
| Disease overlays SSc then RA | Product | **Conflict** | See §Decision |
| Supervised agent workbench | ISI | **OUT OF SCOPE** Stage 1 | Aksh catalog only |
| Non-goals: diagnosis, PHI, auto eligibility, uncontrolled graph | All | **DONE** (policy) | Pilot/target audits + Akeno fail-closed |

### §5 Users / JTBD

| Ask | Owner | Status | Evidence |
|-----|-------|--------|----------|
| Immunology researcher / lab / academic first | Policy | **DONE** | Pilot audiences |
| Biotech landscape / HCP / patient later | ISI / Akeno | **OUT OF SCOPE** Stage 1 | Matches PRD “later” |

### §6 Core principles

| Ask | Owner | Status | Evidence |
|-----|-------|--------|----------|
| Evidence first; context; uncertainty; human oversight; fail closed | HSI | **DONE** / depth **PARTIAL** | Grades, Gate C, provenance rules |
| Separation: HSI / ISI / Aksh | Docs | **DONE** | Vision + this PRD §6 |

### §7 Functional requirements

#### §7.1 Immune-cell explorer (FR-01…08)

| ID | Ask | Owner | Status | Evidence |
|----|-----|-------|--------|----------|
| FR-01 | Search/browse cells, tissues, molecules, pathways, diseases | ISI (+ HSI ids) | **NOT STARTED** / HSI ids **PARTIAL** | Spine ids only |
| FR-02 | Cell card (definition, ontology, markers, subsets, tissues, citations) | HSI data + ISI UI | **NOT STARTED** | Markers exist for LOINC slice, not cell cards |
| FR-03 | Class vs lineage vs subset/state | HSI | **PARTIAL** | `ImmuneCellLayer` in spine |
| FR-04 | Interactive neighbourhood graph | ISI | **OUT OF SCOPE** hsi-core | Export edges exist |
| FR-05 | Filters (disease, tissue, evidence, relation, hops) | ISI | **NOT STARTED** | — |
| FR-06 | Contradictory evidence / alternate routes | HSI packs | **PARTIAL** | RA competing frames; not cell-neighbourhood |
| FR-07 | “What this does not tell us” | ISI + pack | **PARTIAL** | Limitations in packs / walkthrough |
| FR-08 | Saved views / hypotheses / briefs | HSI R2 + ISI | **PARTIAL** | R2 cards; shareable product briefs deferred |

#### §7.2 Entity layers

| Layer | Status | Evidence |
|-------|--------|----------|
| Immune cell class / lineage / subset | **PARTIAL** | `IMMUNE_CELL_SPINE_NODES` |
| Tissue / mediator / pathway / disease / evidence | **PARTIAL** | Claims/edges/domains; not full entity catalog |

#### §7.3 Controlled relationship model

| Predicate | Status | Notes |
|-----------|--------|-------|
| differentiates_into, activates, suppresses, presents_antigen_to, kills, produces, responds_to, recruits, associates_with, measured_by, hypothesized_to | **PARTIAL** | Declared in `ISI_CONTROLLED_RELATIONSHIP_TYPES`; mapped to nearest `HSI_EDGE_TYPES` — not yet primary on seed edges |
| Context + evidence mandatory | **PARTIAL** | Provenance required on edges; full context object deferred |

#### §7.4 Evidence and provenance

| Ask | Owner | Status | Evidence |
|-----|-------|--------|----------|
| S-P-O + context + epistemic + limitations + audit | HSI | **DONE** / depth **PARTIAL** | Schema + Gate C S-P-O note; epistemic ≈ grade axes |
| Ontology IDs (CL, MONDO, UBERON, HGNC, …) | HSI later | **NOT STARTED** | LOINC on markers only |

#### §7.5 Disease-context comparison

| Ask | Owner | Status | Evidence |
|-----|-------|--------|----------|
| Side-by-side disease compare; no context collapse | ISI UX + HSI packs | **NOT STARTED** (product) / seeds **PARTIAL** | Illustrative SLE/PsO/IBD; RA locked; SSc absent |
| SSc deep + RA comparison; EBV as hypothesis only | Product | **PARTIAL** (SSc) | Dual-track thin slice + pack; deepen next; RA = R2 framing |

#### §7.6 Research brief and gap workflow

| Ask | Owner | Status | Evidence |
|-----|-------|--------|----------|
| Brief with evidence IDs; coverage-insufficient language; human review | HSI | **PARTIAL** | Pilot pack brief + gaps + Gate C; AI brief **OUT OF SCOPE** |

### §8 Agent workbench (12 roles)

| # | PRD role | Owner | Status | Evidence |
|---|----------|-------|--------|----------|
| 1 | Research orchestrator | ISI | **OUT OF SCOPE** Stage 1 | — |
| 2 | Disease-context analyst | ISI | **OUT OF SCOPE** | — |
| 3 | Immune-cell atlas analyst | ISI (+ HSI spine) | **OUT OF SCOPE** / spine **PARTIAL** | Catalog ≠ runtime |
| 4 | Mechanism/pathway analyst | ISI | **OUT OF SCOPE** | — |
| 5 | Exposure/pathogen analyst | ISI | **OUT OF SCOPE** | — |
| 6 | Literature/evidence analyst | ISI | **OUT OF SCOPE** | Pack brief is curated |
| 7 | Omics/lab analyst | Stage 2+ | **OUT OF SCOPE** | — |
| 8 | Biomarker/assay analyst | Stage 2+ | **OUT OF SCOPE** | LOINC markers exist |
| 9 | Molecule/target analyst | Stage 2+ | **OUT OF SCOPE** | — |
| 10 | Therapeutic/company analyst | Stage 2+ | **OUT OF SCOPE** | — |
| 11 | Trial/cohort analyst | Stage 2–3 | **OUT OF SCOPE** | — |
| 12 | Evidence and governance reviewer | HSI Gate C + ISI approve | **PARTIAL** | `gateCChecklist.ts`; approve in ISI Neon only |
| — | Aksh name inventory (pattern reuse) | HSI | **DONE** | [`AKSH_AGENTS_IN_HSI.md`](./AKSH_AGENTS_IN_HSI.md) |

### §9 Data requirements

| Source | Status in hsi-core |
|--------|-------------------|
| HSI Core / curated evidence | **DONE** |
| ImmPort, HCA/CELLxGENE, GEO, Reactome | **NOT STARTED** / Stage 2+ |
| ClinicalTrials.gov | **OUT OF SCOPE** Stage 1 |
| PubMed / licensed corpus | **PARTIAL** — curated PMIDs in seeds; rights register open |
| Data planes / no identifiable patients | **DONE** (policy) |

### §10–§11 User stories / experience

| Ask | Status | Note |
|-----|--------|------|
| Cell-first neighbourhood + evidence drawer + compare mode | **NOT STARTED** (ISI product) | HSI `/discovery` is ASK→MAP→REVIEW on packs |
| Research / education not CDS banner | **DONE** | Discovery + Akeno copy |

### §12 Release scope

| Release | PRD scope | hsi-core |
|---------|-----------|----------|
| **MVP** | Spine + SSc vertical + evidence + graph + brief | Spine vocab **PARTIAL**; SSc thin slice **DONE**; deepen next; evidence/exports **DONE**; graph UX = ISI |
| **R2** | RA comparison + datasets + agent workbench | RA seeds exist (Stage 1 lock); datasets/agents **OUT OF SCOPE** |
| **Later** | LIMS, cohort feasibility, clinical DS | **OUT OF SCOPE** |

### §13 Gates ↔ HSI

| Gate | PRD exit | hsi-core |
|------|----------|----------|
| **0** Baseline / design | Truth map, rights, no-patient rule | **PARTIAL** — audits done; rights / SSc-vs-RA decision open |
| **1** Immune-cell spine | Browse major cells with ids/defs/markers | **PARTIAL** — vocabulary stubs; cards **NOT STARTED** |
| **2** Connected mechanism graph | Traverse cell→context→mechanism→evidence | **PARTIAL** — edges exist; PRD predicates not primary |
| **3** SSc deep vertical | Every SSc edge provenanced | **PARTIAL** — first PMID slice landed; deepen neighbourhood |
| **4** RA comparison + datasets | Reproduce pinned datasets | RA arm **PARTIAL** (existing seeds); datasets **NOT STARTED** |
| **5** Agent workbench | Offline eval; no unsupervised publish | **OUT OF SCOPE** Stage 1 |
| **6–7** Partner / cohort | DPIA etc. | **OUT OF SCOPE** |

### §14–§17 Metrics, risks, open decisions, approval

| Ask | Status |
|-----|--------|
| Success metrics / numeric thresholds | **PARTIAL** — rubric exists; partner thresholds TBD |
| Risk mitigations (causality, LLM invent, PHI, premature CDS) | **DONE** (policy + flags) |
| Open decisions (taxonomy depth, MVP interactions, SSc-first, trials, agent roster, review policy, hosting) | **Open** — product owner |
| Approval table | External — not a repo artifact |

---

## Decision required: SSc MVP vs RA Stage 1 lock

| Source | First pathway |
|--------|----------------|
| This PRD §1 / §12.1 / Gate 3 | **SSc** CD4/Tfh–B–IL-21; EBV as `hypothesized_to` only |
| This PRD §12.2 / Gate 4 | **RA** as first cross-disease comparison |
| Technical Blueprint (`357a8e9`) | Same SSc-first story |
| Pilot PRD + `hsi-partner-lock.json` | **RA / anti-TNF** (`scopeLocked=true`, `partnerSigned=false`) |
| Implementation audit | RA packs + `/discovery` green; partnerSigned pending |

### Options (do **not** silently wipe RA seeds)

| Option | What happens | Pros | Cons |
|--------|--------------|------|------|
| **A. Dual-track (recommended default)** | Keep RA as Stage 1 working lock + packs. Mark SSc as `prd_mvp_target`. Add spine vocab now; authorise SSc seed depth as a **parallel** pathway pack without deleting RA. Use RA seeds as R2 comparison arm when SSc lands. | Preserves Phase 2–5 investment; matches PRD R2; honest labels | Two narratives until product picks a partner story |
| **B. Explicit pivot to SSc** | Founder/partner re-scopes Stage 1: new partnerLock disease=SSc, new seeds, RA demoted to illustrative or R2. **Requires written product decision.** | Matches PRD MVP literally | Throws away RA lock messaging; outreach materials need rewrite |
| **C. Hold RA-only until partnerSigned** | Ignore SSc build until RA pilot signed; treat PRD SSc as backlog | Least churn | Diverges from PRD/blueprint Gate 1–3 sequencing |

**Decision recorded (2026-11-01):** **Option A — Dual-track.**  
`verticalStrategy=dual_track` · `activeScope=ra-tnf` · `prdMvpTarget=ssc-tfh-b-il21` · RA comparison = Release 2 framing.  
Source: `src/verticalDecision.ts` → `hsi-vertical-decision.json` (also mirrored on `hsi-partner-lock.json` + `hsi-systems-vision.json`).

**Still binding:** RA `scopeLocked` remains authoritative for pilot packs, walkthrough, acceptance, and Discovery **ASK**. Never delete RA claim/edge ids. EBV only as hypothesized/uncertain branch.

Registry: `DISEASE_VERTICAL_STUBS` in `src/immuneCellSpine.ts` (`ssc.deepSeedsPresent=true` after first slice).

---

## Substrate change landed with this alignment

| Artifact | Purpose |
|----------|---------|
| `src/immuneCellSpine.ts` | Cell class/lineage/subset stubs; PRD relationship vocabulary; dual-track vertical registry |
| `src/verticalDecision.ts` | Written A dual-track decision |
| `src/seed/sscTfhBIl21.ts` + `src/sscPathwayPack.ts` | First SSc Tfh–B–IL-21 literature slice + `hsi-ssc-pathway-pack.*` |
| `test/immuneCellSpine.test.ts` / `test/verticalDualTrack.test.ts` | Asserts CD4-among-many, RA lock intact, SSc `prd_mvp_target` + deep seeds |
| Package exports via `src/index.ts` | Consumers can read vocabulary / SSc pack without implying Gate C claims |

**Not done:** full cell-card content, expanding `HSI_EDGE_TYPES` (map-through for now), ImmPort connectors, agent runtime, immunecity UI, deeper SSc neighbourhood.

---

## Recommended next asks (hsi-core)

1. ~~**Decide A / B / C**~~ — **A dual-track done.**  
2. **Next after A:** deepen SSc pack — cell-card / CL·MONDO hints on Tfh–B–IL-21; optional more public PMIDs; keep EBV hypothesized. RA packs regenerable.  
3. Promote selected `ISI_CONTROLLED_RELATIONSHIP_TYPES` onto `HSI_EDGE_TYPES` when SSc edges need them (additive; do not rewrite RA edgeTypes wholesale).  
4. Partner outreach / `partnerSigned` / rights pack (unchanged from implementation audit).  
5. **Hold the line:** no 12-agent runtime, no Neon merge, no immunecity edits, no Akeno live CDS, no S3 credential files in git.

---

## Cross-links

- Systems vision (multi-axis target graph): [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md)  
- Technical blueprint alignment: [`ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md`](./ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md) (`357a8e9`)  
- Implementation audit: [`PRD_IMPLEMENTATION_AUDIT.md`](./PRD_IMPLEMENTATION_AUDIT.md)  
- Outputs: [`OUTPUTS.md`](./OUTPUTS.md)  
- Pilot / target PRDs: [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md), [`ISI_TARGET_STATE_PRD_ALIGNMENT.md`](./ISI_TARGET_STATE_PRD_ALIGNMENT.md)  
- Aksh agents / Akeno HITL: [`AKSH_AGENTS_IN_HSI.md`](./AKSH_AGENTS_IN_HSI.md), [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md)  
- Neon: [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md)  
- README Pilot table links this doc
