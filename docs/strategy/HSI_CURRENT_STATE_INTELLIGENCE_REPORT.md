# HSI Current-State Intelligence Report

**Board:** Multidisciplinary product & architecture review (Roles 1–11, coordinated)  
**Date:** 2 November 2026  
**Repos:** `hsi-core@fe69bc6`, `immunecity@dbacd47`, `aksh-health-redesign@c186893`  
**Evidence refresh:** `bun test` → **150 pass / 0 fail**; `bun run validate` → **88 edges**, **8 claim→LOINC links**  
**Constraint:** Audit, strategy, architecture only — **no implementation** in this assignment.  
**Authoritative target vision:** [`HSI_MASTER_VISION.md`](./HSI_MASTER_VISION.md) (definitive §2).  
**Companion pack:** [`docs/strategy/README.md`](./README.md)

**Legend for claims in this report**  
- **Fact** — observed in code, tests, or config  
- **Interpretation** — multidisciplinary reading of facts  
- **Recommendation** — proposed action pending founder approval  
- **Unresolved** — insufficient evidence or external dependency

---

## 1. Executive Assessment

### What HSI currently is (Fact)

Three separately governed products and one evidence substrate:

| System | What it actually is today |
|--------|---------------------------|
| **hsi-core** | Stage-1 **research-evidence backbone**: typed graded edges/claims, publish pipeline, Gate C checklists, ISI consume contracts, Discovery Centre SPA, CDS/PHI fail-closed invariants. **No** patient spine, **no** in-repo KG, **no** agent runtime. |
| **Immune Super Intelligence (immunecity)** | Researcher-facing **immune knowledge product**: curated `kg.json`, Atlas/Ask/journeys, Neon evidence/Gate C (autumn-snow), HSI Discovery consume. Educational patient rules only; Trial Intelligence flag-off by default. |
| **Aksh Health (platform-uk)** | UK **clinical proof monorepo** on Vercel marketing shell: 14 registered agents, CONDUCTOR + HITL, diabetes Phases 0–6 on synthetic data. **`LIVE_ORGANISATIONS = 0`**, `syntheticOnly`, `liveEmis:false`. |

### What HSI is intended to become (Vision)

**Health Super Intelligence**: one ecosystem connecting longitudinal clinical context, human biology (especially immune/systems), scientific evidence, and clinical-trial intelligence — with strict separation of observed fact / evidence / association / inference / hypothesis, and human oversight for consequential outputs.

### Gap in one sentence (Interpretation)

You have a **credible research-intelligence foundation** and a **strong synthetic clinical HITL platform**, but not yet a **connected Health Super Intelligence** that can reconstruct authorised longitudinal care, traverse a living multi-layer graph, or explain trial screening with clinical-grade honesty.

### Why choose HSI vs existing tools? (Product — Role 1)

| Buyer | Differentiator *if* vision is delivered | Today’s honest substitute |
|-------|------------------------------------------|---------------------------|
| Clinician | Cross-encounter context + mechanism-linked evidence, not another EHR | Aksh HITL drafts on synthetic cases; no multi-hospital reality |
| Researcher | Mechanism ↔ evidence ↔ gaps with provenance, not chat-over-PubMed | ISI Ask + KG + Gate C — closest to real value |
| Trial team | Explainable criterion states, not “AI eligible” | Melanoma pilot UI / flag-off |
| Patient | Continuity via Aksh, education-grade research links | Aksh companion + ISI teaching patient page |
| Institution | Governed interoperability + safety case | Not ready |

---

## 2. Vision Alignment

| Vision pillar | Current | Alignment |
|---------------|---------|-----------|
| Four products (Aksh / Clinical / ISI / Trials) | Aksh + ISI strong; Clinical & Trials **not** first-class products | **Misaligned naming; partial substance** |
| Living Health KG (Layers 1–6) | Packs (L4 thin) + ISI KG (L2/L4) + clinical stubs | **Logical gap** |
| Cross-domain reasoning with claim labels | Informal in Ask/exports | **Missing as system property** |
| Longitudinal patient intelligence | Aksh synthetic 360 / parallel journeys | **Not HSI Clinical** |
| Trial intelligence with 5 criterion states | Partial educational / melanoma flag | **Missing product** |
| Reuse Aksh agents | Catalog in hsi-core; runtime stays Aksh | **Correct boundary so far** |
| Preserve ISI KG | Intact, REL-* authority | **Aligned — protect** |
| No fake hospital access / MoU | Partner fixture honesty restored | **Aligned** |
| No live CDS/PHI in hsi-core | Enforced in code/tests | **Aligned** |

**Major differences (Interpretation):** Brand says *Health* / repos say *Human Systems* / product says *Immune*; public surfaces still risk reading as engineering portals; “agents” and “graph” language outrun operational planes.

---

## 3. Existing Assets (preserve)

| Asset | Location | Why preserve |
|-------|----------|--------------|
| Graded evidence model + validation | `hsi-core/src/schema.ts`, `grades.ts`, **88 edges** | Trust substrate for L4 |
| Gate C human-only + honesty | `gateCChecklist.ts`, `gateCDecisionsImport.ts`, ISI `gateCQueue.ts` | Clinical/scientific safety pattern |
| Publish / consume contract | `isiConsumeContract.ts`, ISI `discoveryConsume.ts`, `public/hsi-discovery/` | Cross-repo handoff without shared Neon |
| Neon isolation guards | `hsi-core/src/db/neonGuard.ts`, ISI `assertIsiNeonHostForGateC` | PHI/research plane firewall |
| CDS/PHI boundary | `hsi-core/src/cdsPhiBoundary.ts`, docs | Regulatory honesty |
| ISI KG + engine | `kg.json` (260+70 nodes), `engine.ts`, `REL-*` | Strategic scientific asset |
| Ask grounding | `askGrounding.ts` + tests | Single research gateway, fail-closed clinical personal |
| Journey IA | ISI `JOURNEY_NAV` | Coherent researcher UX |
| Aksh agent register + HITL | `register.ts`, review queue, SHIELD | Clinical orchestration reference — reuse, don’t clone |
| Diabetes synthetic vertical | Aksh Phases 0–6 / P002 | Fixture source for future Workflow B *after* governance |
| Test harnesses | hsi-core 150 tests; ISI HSI/Ask/graph tests; Aksh agent contracts | Spec-as-code |

---

## 4. Architecture Assessment

### Current-state (Fact)

```
Aksh (platform-uk / Neon clinical proof)     ISI (TanStack / kg.json / autumn-snow)
        │                                              │
        │  (no HSI consume path today)                 │ consume pinned JSON
        │                                              ▼
        │                                    hsi-core publish (red-wave optional)
        └──────── governance patterns lifted ─────────► CDS/PHI docs + catalog only
```

- **Storage mix today:** Postgres (Neon) × 2+; JSON packs; browser KG file; JSON-file clinical proof repo in Aksh.  
- **Not present:** unified event bus, shared graph DB, federated FHIR layer, Trials service.

### Target-state (Recommendation — Roles 2, 5, 8)

**Federated ecosystem, logical Living Health KG, hard data planes:**

| Plane | Contents | Stores |
|-------|----------|--------|
| P0 Public biomedical | Ontologies, public literature, ISI KG | ISI + caches |
| P1 Governed evidence | Graded edges, Gate C | hsi-core red-wave |
| P2 Identifiable clinical | Encounters, labs, meds | Aksh / future HSI Clinical |
| P3 Trial operations | Screening decisions | Future Trials service |

**Key architectural question (Role 2):** *One intelligence ecosystem without one fragile monolith* → shared contracts + claimTypes + honesty asserts; independent deployables; no shared PHI/research Neon.

### Service dependency map (near-term)

1. hsi-core publish → ISI consume → Gate C → approved cites → public pages  
2. ISI Ask → grounding → (optional LLM) → user  
3. Aksh CONDUCTOR → agents → HITL → SHIELD → (optional Medplum staging)  
4. *Future:* Clinical Context Service ↔ Terminology ↔ Evidence link-out (de-id)  
5. *Future:* Trials Eligibility Evaluator ↔ Registries ↔ human investigator  

### Technical risks (Role 2 / 11)

| Risk | Severity | Mitigation |
|------|----------|------------|
| Premature graph-DB rewrite | High | Defer until Layer 4 schema + query SLOs fail |
| Duplicate CONDUCTOR in hsi-core | High | D4 = API only |
| Plane leakage (PHI → research) | Critical | Keep guards; red-team Phase 5 |
| Naming collisions (Discovery, Atlas) | Medium | D7/D8 |
| Stub adapters mistaken for live science | Medium | Keep `forceStub` honesty |

ADRs proposed: see §11 and [`HSI_TARGET_ARCHITECTURE.md`](./HSI_TARGET_ARCHITECTURE.md).

---

## 5. Knowledge Graph Assessment

### What exists (Fact — Roles 4, 5)

| Graph | Representation | Evidence quality |
|-------|----------------|------------------|
| **hsi-core packs** | Typed edges/claims in TS → published JSON; grades; PMID/DOI policy | Strong for Stage-1 RA/TNF + thin gut/neuro/SSc packs; **Verified** by validate/tests |
| **ISI `kg.json`** | Nodes, `relation_semantics`, REL-* edges, draft `extensions.ts` | Curated immune spine; evidence often Neon `claim_support` / queue — **Partial** PMID coverage |
| **Discovery MAP** | Graph UI over pack rows | Not authoritative KG |
| **Aksh clinical** | FHIR-shaped / patient-360 proof | Not a biomedical KG |

### Multi-hop capability (Interpretation)

- ISI engine supports paths/neighbours for research UX — **usable for Workflow A**.  
- Cannot yet answer “patient labs → immune pathway → trial” as one governed traversal (needs L1 + L5 + access views).

### Proposed HSI extension (Recommendation)

Preserve ISI KG as **Layer 2/4 seed**. Extend via:

1. Layer taxonomy + `claimType` / provenance norms (Phase 1).  
2. Import Approved hsi-core edges as L4.  
3. Structured L6 gap/hypothesis nodes (draft).  
4. L3 gut–immune via reviewed packs (no individual causality).  
5. L5 trials criteria graph for Workflow C.  
6. L1 stays out-of-band clinical stores; link only with ethics/de-id.

**Scientific standard (Role 4):** Every relationship must state method class: established mechanism / association / experimental / clinical evidence / hypothesis — never collapse.

**Benchmark queries (proposed):** See Phase 1 acceptance in [`HSI_KNOWLEDGE_GRAPH_MASTER_PLAN.md`](./HSI_KNOWLEDGE_GRAPH_MASTER_PLAN.md).

---

## 6. AI Agent Assessment

### Inventory (Fact — Role 7)

**Aksh (runtime, simulation):** CONDUCTOR orchestrates CANVAS, SYNTHESIS, DrASSIST, GUARDIAN, HORIZON, NEXUS, PATHWAY, BRIDGE, SHIELD, COMPASS; VOICE partial; **PRISM/ATLAS scaffolds**. Status: `in_validation`. Diabetes agent-intel path is **parallel**, not CONDUCTOR-unified.

**ISI:** Ask grounding + Discovery scaffolding — **not** a multi-agent swarm. “Discovery Intel / cross-examine” = bounded tools.

**hsi-core:** Aksh catalog + ISI research-agent **proposal stubs** (P3 adapters) → Gate C pending. **No orchestration runtime.**

### Verified useful work vs convincing text (Interpretation)

| Capability | Verdict |
|------------|---------|
| Ask grounding / query class fail-closed | Verifiable (tests) |
| Gate C checklist / refuse auto-approve | Verifiable |
| Cite identifier Check | Verifiable; supports still human |
| Aksh HITL accept/reject loop | Verifiable on synthetic |
| LLM clinical drafts | Useful only with HITL; not validated CDS |
| Named “investigator agents” in vision | **Not built** as measurable workers |

### Recommendation

- **Clinical agents:** stay in Aksh; gateway later.  
- **Research:** tool pipelines behind Ask/briefs first; promote named investigators only after eval bars.  
- **Trials:** rules engine for criterion states before LLM narrative.  
- **Never** one LLM agent per marketing noun.

---

## 7. Data Integration Assessment

| Source class | Connected? | Class | Dependency |
|--------------|------------|-------|------------|
| hsi-core → ISI JSON | Yes (pin/sync) | Verified / Partial ops | Continue |
| PubMed / Europe PMC (curation/Ask) | Partial | Partial | Rate limits, human Gate C |
| ClinicalTrials.gov | Educational / melanoma pilot | Partial / Mock default-off | Workflow C |
| FHIR / Medplum / EMIS | Staging / simulated | Rehearsal | Partner + DPIA |
| Hospital EHR live | No | Missing | Institutional agreements |
| Open Targets / HCA / Reactome | Manual/ad hoc | Missing as pipelines | Phase 1–2 |
| SNOMED / LOINC / HPO | LOINC links in hsi-core (8); SNOMED in Aksh drafts | Partial | Licence (SNOMED) |
| Patient-generated (Aksh) | Product plane | Must not enter red-wave/autumn-snow raw | Phase 5 gateway |
| Omics pipelines | Stubs/proposals | Mock / Planned absent | Long-term |

**Role 8 key question:** Combining sources without losing meaning → **canonical contracts + terminology maps + retrieval dates + plane firewalls** before more connectors.

---

## 8. User Experience Assessment

### Current journeys (Fact — Role 9)

| Audience | Exists today | Quality |
|----------|--------------|---------|
| Public / researcher (ISI) | Explore→Research→Academy→Community→Ask | Strong IA; dual Discovery needs copy clarity |
| HSI Discovery loop | `/hsi/discovery`, `/hsi-consume` | Real but curator/operator-facing |
| hsi-core site | Vision + Discovery Centre on static packs | Improved research narrative; not four-product ecosystem |
| Clinician (Aksh) | GP/nurse/pharmacist dashboards, review queue | Deep demo; parallel tracks confuse “one patient journey” |
| Patient (Aksh) | Companion / self-serve | Partial; denied clinical queue (correct) |
| Patient (ISI) | Teaching `/patient` | Educational only |
| Trial team | No dedicated product journey | Missing |

### Problems

- Engineering altitude / agent directories as product story.  
- Unnecessary agent-selection mental model for end users.  
- Risk of impressive graphs without inspectable evidence.

### Target experiences (Recommendation)

- **Clinician:** Search → Identity → Timeline → Context → Evidence → optional Trial screening.  
- **Researcher:** Question → Graph → Mechanism → Compare → Gaps → Brief.  
- **Trial team:** Criteria → Screen → Missing → Review → Recruit.  
- **Patient:** Via Aksh; research links education-grade only.

Users must always inspect: why, which evidence, what’s missing, what’s uncertain, what needs human review.

---

## 9. Scientific and Clinical Safety Assessment

### Risks (Role 10)

| Hazard | Present risk | Control today | Before clinical eval |
|--------|--------------|---------------|----------------------|
| Wrong patient match | Low in HSI (no live match) | N/A | Identity policy + thresholds |
| PHI in research DBs/LLM | Medium if rushed Phase 5 | Plane isolation + consume PHI asserts | DPIA + red-team |
| Unsupported clinical advice | Contained | Ask blocks clinical personal; Aksh HITL; `validatedCds:false` | Safety case / DCB if device |
| Automation bias on scores | Medium in demos | Simulation labels | UX + training |
| False trial “eligible” | Medium if marketed | Flag-off; must keep 5 states | Copy + eval set |
| Partner MoU overclaim | Reduced | Fixture honesty | Real contracts only |
| Scientific overclaim on thin packs | Medium | Grades + Gate C | Curator capacity |

### Regulatory posture (Fact / Unresolved)

- hsi-core: **explicit non-CDS / no PHI**.  
- Aksh: simulation / in_validation — **not** MHRA-cleared.  
- DCB0129/0160, DSPT, SaMD class: **required before** live clinical intelligence claims — **Unresolved** schedule.

### AI governance needs

Model versioning, unsupported-claim metrics, HITL reject analytics, change control, incident path — partially present as patterns; not a unified HSI framework yet.

---

## 10. Prioritised Recommendations

### Preserve immediately

1. ISI KG + engine + REL-* scheme.  
2. hsi-core grades, publish, Gate C honesty, neon guards, CDS/PHI module.  
3. ISI HSI consume + host assertion + Ask grounding.  
4. Aksh register/HITL/SHIELD patterns (as reference + future gateway).  
5. Partner fixture honesty (`lockedPilot=false`).

### Enhance (near-term, after approval)

1. Shared Layer taxonomy + claimType schema (Phase 1).  
2. Workflow A research brief reproducibility (Phase 2).  
3. Complete human cite/supports path on Gate C rows (no inventing supports).  
4. Public ecosystem narrative after D1 (not engineering roadmap as primary nav).  
5. Discovery/Atlas naming disambiguation (D7/D8).

### Build (phased)

| Priority | Capability | Class |
|----------|------------|-------|
| Foundational | Logical graph layers + provenance | Phase 1 |
| MVP | Workflow A end-to-end brief | Phase 2 |
| Essential later | Synthetic multi-provider Timeline (Workflow B) | Phase 3 |
| Essential later | Trial criterion state machine (Workflow C) | Phase 4 |
| Integration | Aksh↔HSI gateway | Phase 5 |
| Advanced | Named research investigators with evals | After A |
| Experimental | Omics ingest, live EHR, microbiome causality | Defer |
| Infrastructure | Graph DB rip-replace, universal hospital access | Defer |

### Defer

- Live EMIS/EHR write-back.  
- MHRA clinical claims.  
- Replacing ISI KG.  
- Rebuilding Aksh agents in hsi-core.  
- DeliverX / unrelated brands.

### Retire / avoid

- Marketing “operator MoU” without contracts.  
- Presenting stubs (P3 adapters, PRISM/ATLAS, systems vision patient stubs) as live capabilities.  
- Collapsing Research Radar and HSI Discovery into one dishonest UX.

---

## 11. Critical Decisions (founder approval)

Architecture Review Board recommendations (Roles 1–11). Full write-up: [`HSI_GAP_ANALYSIS_AND_DECISIONS.md`](./HSI_GAP_ANALYSIS_AND_DECISIONS.md).

| ID | Problem | Options | Board recommendation | Approval |
|----|---------|---------|----------------------|----------|
| **D1** | Brand hierarchy Health/Human/Immune/Aksh | a umbrella Health; b Human for substrate; c Immune-first | **(a)** Health Super Intelligence umbrella; ISI + Aksh sub-brands | Founder |
| **D2** | Stage-1 sequence | Research-first / Clinical parallel / Trials-first | **Research-first (Phases 1–2)** — matches assets & lower clinical risk | Founder |
| **D3** | ISI KG fate | Preserve / freeze+rebuild / migrate DB now | **Preserve as L2/L4 seed** | Founder |
| **D4** | Aksh integration | API gateway / monorepo merge / reimplement | **API gateway**; reject reimplement | Founder |
| **D5** | First E2E workflow | A / B / C | **A Biomedical Discovery** | Founder |
| **D6** | hsi-core scope | Substrate / orchestration hub / marketing mono | **Substrate near-term** | Founder |
| D7 | “Discovery” naming | Rename surfaces | Clarify Radar vs HSI pack vs site SPA | Founder/product |
| D8 | “Atlas” naming | Rename Aksh or ISI | Disambiguate in UX copy | Founder/product |
| D9 | Partner | Fixture vs real MoU | Fixture until signed | Founder |
| D10 | Clinical claims | When to claim device/safety | Not before Phase 6 artifacts | Founder |

**External validation required (not board agreement):** clinical safety case, scientific SME review of graph edges, partner legal, SNOMED licensing, MHRA classification if clinical claims pursued.

### Mandatory decision framework sample — First Milestone (Workflow A)

| Dimension | Analysis |
|-----------|----------|
| User problem | Researchers lack reproducible, provenance-linked mechanism briefs |
| User value | Faster, inspectable literature+graph synthesis with uncertainty |
| Existing | ISI Ask/KG + hsi-core packs/Gate C |
| Data | Public + governed P1; no PHI |
| Scientific validity | Grades + human Gate C for publish |
| Clinical risk | Low if research-mode only |
| Feasibility | High |
| Integration | Existing consume path |
| UX | Question → brief with evidence fold |
| Evaluation | Golden questions; citation precision; unsupported-claim rate |
| Cost | Moderate LLM + curator time |
| Priority | **MVP** |

---

## 12. Recommended First Milestone

### Milestone M1 — Biomedical Discovery Brief (Workflow A)

**Objective:** An authorised researcher submits a scientific question; HSI returns a **reproducible research brief** that traverses ISI graph context, attaches graded/hsi evidence where available, labels claim types, lists gaps/contradictions explicitly, and never invents supports.

**Why this first (Roles 1, 4, 7, 9, 11):** Highest alignment with existing verified assets; lowest clinical risk; demonstrates the *connected intelligence* differentiator without inventing hospital access.

**In scope**

- Brief artifact schema (question, entities, paths, evidence, claimTypes, gaps, retrieval dates).  
- Reuse `askGrounding.ts` + KG + optional hsi-core export pins.  
- Golden-question eval harness (automated + curator spot check).  
- Continue Gate C cite human path (Check already verified for identifiers).

**Out of scope**

- PHI, FHIR, live trial eligibility confirmation, new agent fleet, KG replacement, site redesign beyond honesty copy if needed for the brief UI.

**Acceptance criteria**

1. ≥ N golden questions produce briefs with provenance and explicit unknown/gap sections.  
2. Zero PHI fields in brief pipeline tests.  
3. No auto-approve into KG.  
4. Unsupported-claim rate measured and below agreed threshold on eval set.  
5. Curator can trace each established claim to source URI/PMID or Gate C status.

**Dependencies:** Founder **D2, D3, D5** (and ideally D1 for naming). Phase 1 layer/claimType norms can land as thin schema alongside M1.

**Stop:** After M1 design approval — implementation begins only on **explicit founder go-ahead**.

---

## Cross-functional worked examples (board consensus)

### A — Patient enters hospital (future)

Value = longitudinal clarity. Requires identity (Clinical Informatics) + FHIR access (Interop) + timeline UX (Design) + missing-data warnings (AI tools) + matching hazard controls (Safety). **Not M1.** Synthetic Workflow B is the first *safe* rehearsal.

### B — Researcher investigates immune disease (M1)

Immunologist frames question → Graph supplies cells/pathways → Evidence packs/cites → Ask/brief labels uncertainty → UX shows inspectable brief → Engineering measures reproducibility.

### C — Trial matching (later)

Trials schema + patient profile fields + mechanism links + five criterion states + investigator final. **Depends on** clearer disease context from A and (for real patients) Clinical plane governance.

---

## Delivery posture (Role 11)

| Question | Answer |
|----------|--------|
| Incremental without rewrite? | **Yes** — extend contracts and Workflow A on ISI+hsi-core |
| Preserve working code? | **Yes** — no deletes/replacements without ADR |
| First valuable integrated workflow? | **M1 Biomedical Discovery Brief** |
| Ready to implement now? | **No** — wait for D1–D6 (minimum D2/D3/D5) |

---

## Document control

| Field | Value |
|-------|-------|
| Status | Complete for Phase 0 review |
| Implementation | **Frozen** pending founder approval |
| Related | Vision, Audit, Architecture, KG, Agents, Data, Journeys, Safety, Roadmap, Gap/Decisions |

**Observed facts** above are tied to repository evidence and the 2026-11-02 test run. **Recommendations** are board proposals, not shipping authority.
