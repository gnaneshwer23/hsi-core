# ISI Product Technical Blueprint ↔ hsi-core alignment

**Source (external):** *Immune Super Intelligence — Product and Technical Blueprint* (1 November 2026), local file `~/Downloads/ISI_Product_Technical_Blueprint.docx`.  
**Repo anchors:** [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md), [`ISI_TARGET_STATE_PRD_ALIGNMENT.md`](./ISI_TARGET_STATE_PRD_ALIGNMENT.md), [`ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md`](./ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md), [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md) (gut / neuroimmune / patient-plane / P3 adapters — expanded vision without Stage 1 pivot), [`PRD_IMPLEMENTATION_AUDIT.md`](./PRD_IMPLEMENTATION_AUDIT.md), [`OUTPUTS.md`](./OUTPUTS.md), [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md), [`AKSH_AGENTS_IN_HSI.md`](./AKSH_AGENTS_IN_HSI.md), [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md), [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md).

**Edit target:** hsi-core only. Do **not** edit immunecity. Neon: HSI = **`red-wave` only**.

**Status vocabulary:** `DONE` · `PARTIAL` · `NOT STARTED` · `OUT OF SCOPE`

---

## Blueprint in one paragraph

Build **ISI** as an immune-science discovery product on **HSI Core** (shared evidence objects, provenance, grades, versioning, agent-run audit). Reuse **Aksh** agent *engineering* patterns (context assembly, grounded retrieval, bounded outputs, independent safety gate, eval) with research roles and separate permissions — not clinical prompts or patient context. First authorised vertical (per blueprint): a source-traceable **systemic sclerosis (SSc) CD4/Tfh → B-cell/IL-21** pathway explorer, with EBV as a separate uncertainty branch. Explicit non-starts: identifiable patient records, disease prediction, autonomous trial matching. Future **Akeno** clinical intelligence stays gated.

---

## Verdict vs hsi-core today

| Topic | Blueprint | hsi-core now | Verdict |
|-------|-----------|--------------|---------|
| Product hierarchy | HSI = infrastructure; ISI = immune research product; Aksh = separate care app; Akeno = later clinical | Matches [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md) | **Aligned** |
| Evidence backbone | Versioned claim/evidence ledger; graph is projection | Phases 0–8 substrate + `bun run outputs` | **DONE** (HSI job) |
| First vertical | **SSc** Tfh/CD4–B-cell–IL-21 (+ EBV uncertain) | **RA / anti-TNF** scope lock (`scopeLocked=true`) | **Conflict** — see §Conflicts |
| Clinical / PHI | Public/licensed research only first; DPIA later | `notCds`, no PHI, Akeno HITL scaffolding only | **Aligned** |
| Neon / DB | “PostgreSQL/Neon + graph queries”; discovery sprint on immunecity + HSI | **Separate** HSI `red-wave` vs ISI `autumn-snow`; no shared evidence DB | **Isolation must win** — see §Conflicts |
| Agents | 12 research specialists + orchestrator + governance reviewer | Aksh **catalog** only; no executable ISI agent runtime | Catalog **DONE**; runtime **OUT OF SCOPE** Stage 1 |
| ISI product UI | immunecity as starting point | Consumer only; hsi-core `/discovery` pack surface | **Aligned** (do not edit immunecity from here) |

**Bottom line:** The blueprint reinforces the same NOW/NEXT/LATER story as the Pilot + Target PRDs and the implementation audit. hsi-core already owns the evidence-backbone job for Stage 1 / R0–R1. Do **not** start a large new phase (SSc corpus, ImmPort/GEO connectors, 12-agent runtime, shared Neon) from this document alone. Resolve the **SSc vs RA** first-vertical conflict as a product decision before any seed pivot.

---

## Ownership map (who builds what)

| Layer (blueprint §1 / §9) | Owner | hsi-core role |
|---------------------------|-------|---------------|
| HSI Core evidence service | **HSI** (`hsi-core`) | Sole edit target for claims, grades, provenance, Gate C checklist artifacts, versioned exports |
| Knowledge-graph projection / explorer UX | **ISI** (immunecity) consumes HSI exports; HSI may ship pack/site demos | No second canonical graph in ISI Neon |
| Source & rights registry / ImmPort·GEO·HCA connectors | Mostly **ISI** + curator process; HSI may hold seed pointers later | Not Stage 1 code in hsi-core |
| Agent orchestration (12 research roles) | Shared primitives conceptually; **ISI** product runtime; Aksh remains care product | Catalog / mapping docs only in hsi-core today |
| Partner TRE / cohort feasibility | Partner + **Akeno**/ISI clinical path | **OUT OF SCOPE** until gates |
| Prospective CDS / trial options | **Akeno** after regulatory | `/akeno` HITL consumer only — [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md) |

---

## Section → status (with file evidence)

### §1 Executive recommendation

| Ask | Owner | Status | Evidence |
|-----|-------|--------|----------|
| HSI as shared evidence / provenance / versioning | HSI | **DONE** | `src/schema.ts`, `src/grades.ts`, `db/migrations/001_hsi_substrate.sql`, [`OUTPUTS.md`](./OUTPUTS.md) |
| ISI as research workspace (no diagnosis/treatment in first release) | ISI product | **PARTIAL** (HSI packs + `/discovery`) | `site/src/pages/DiscoveryCentre.tsx`; product CRUD/RBAC = immunecity |
| Reuse Aksh patterns, not clinical permissions | HSI docs + catalog | **PARTIAL** | [`AKSH_AGENTS_IN_HSI.md`](./AKSH_AGENTS_IN_HSI.md), `aksh/agent-catalog.json` — inventory, not GraphRAG runtime |
| Akeno later, gated | HSI scaffolding / Akeno product | **PARTIAL** / live **OUT OF SCOPE** | `src/translationHandoff.ts`, `src/akenoConsumer.ts`, `/akeno` |

### §2 Scientific model (SSc example)

| Ask | Owner | Status | Evidence |
|-----|-------|--------|----------|
| Context-qualified claims (subset, tissue, assay, disease) | HSI model + ISI UX | **PARTIAL** | Graded edges + pack context; no full Cell Ontology / MONDO binding yet |
| Separate EBV vs Tfh→B-cell paths; no hard-coded causal merge | HSI seeds / ISI | **NOT STARTED** (SSc) | No SSc/EBV seeds in repo (grep clean); current vertical = RA/TNF |
| “Coverage insufficient” ≠ “no research exists” | HSI + ISI | **PARTIAL** | Gap report + pack missing labels; full search-coverage schema deferred |
| Side-by-side disease comparison | ISI UX; HSI pack | **PARTIAL** | Illustrative SLE/PsO/IBD stubs; RA locked; SSc absent |

### §3 Knowledge graph and evidence model

| Ask | Owner | Status | Evidence |
|-----|-------|--------|----------|
| Claim as first-class record (S-P-O + context + provenance + epistemic status) | HSI | **DONE** / depth **PARTIAL** | Seeds + ISI export + Gate C; epistemic labels ≈ `hsiGrade` + `teachingStatus` + `curationReview` |
| Ontology alignment (CL, MONDO, UBERON, HGNC, UniProt, …) | HSI later / ISI | **NOT STARTED** | LOINC on markers only (`src/markers.ts`) |
| Immune spine as navigation lens | ISI / Discovery Centre | **PARTIAL** | Discovery Loop ASK→MAP→REVIEW (+ VALIDATE/TRANSLATE); spine labels reference-only in concept HTML |
| Participant data plane separate | All | **DONE** (policy) | [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md); no PHI in seeds |

### §4 Twelve-agent research workbench

| # | Blueprint role | Owner | Status | Evidence |
|---|----------------|-------|--------|----------|
| 1 | Research orchestrator | ISI (+ shared patterns) | **OUT OF SCOPE** Stage 1 | No orchestrator runtime in hsi-core |
| 2–5 | Disease / cell / mechanism / pathogen analysts | ISI | **OUT OF SCOPE** | Catalog names exist for Aksh peers — different domain |
| 6 | Literature/evidence analyst | ISI | **OUT OF SCOPE** | Pack brief shell is human/curated, not agent |
| 7–8 | Omics/lab + biomarker/assay | Stage 2+ | **OUT OF SCOPE** | Target PRD ISI-07 deferred |
| 9–10 | Molecule/target + therapeutic/company | Stage 2+ | **OUT OF SCOPE** | — |
| 11 | Trial/cohort analyst | Stage 2–3 | **OUT OF SCOPE** | Unless partner asks (pilot P1) |
| 12 | Evidence and governance reviewer | HSI Gate C + ISI approve | **PARTIAL** | `src/gateCChecklist.ts`; approve in ISI Neon only |
| — | Aksh agent name inventory | HSI | **DONE** | `src/akshAgents.ts`, `/aksh-agents` |
| — | Do not claim 12 agents live in care | Docs | **DONE** | Blueprint reality check matches Aksh synthetic_demo posture |

### §5 User groups and access boundaries

| Ask | Owner | Status | Evidence |
|-----|-------|--------|----------|
| Role-separated experiences / licences / export controls | ISI product | **NOT STARTED** (hsi-core) | AC-08 documented limitation in pilot alignment |
| Researcher + lab first; no identifiable patients | Policy | **DONE** | Pilot non-goals; pack `notCds` |

### §6 Patient data, prediction, trial matching

| Ask | Owner | Status | Evidence |
|-----|-------|--------|----------|
| No identifiable records / prediction / auto eligibility in first release | All | **DONE** (invariants) | MANIFEST flags; [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md) |
| Public trial landscape later | ISI | **OUT OF SCOPE** Stage 1 | Target ISI-09 |
| Governed cohort feasibility / individual trial options | Akeno / partners | **OUT OF SCOPE** | Blueprint gates 5–6; R4–R5 |

### §7 Data sources

| Source | Blueprint role | Status in hsi-core |
|--------|----------------|-------------------|
| HSI Core + existing ISI curated graph | Backbone | **DONE** (HSI) / ISI consumes |
| ImmPort, GEO, CELLxGENE/HCA, Reactome | Pathway enrich after audit | **NOT STARTED** / Stage 2+ |
| ClinicalTrials.gov | Read-only landscape | **OUT OF SCOPE** Stage 1 |
| TDC, AF3, Boltz, ESM, RDKit, OpenMM, REINVENT4 | Specialist plugins | **OUT OF SCOPE** (P3 deferred) — catalogued in [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md) + regenerable `FUTURE_TECH_ADAPTER_STUBS` / `hsi-systems-vision.json` ([`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md)) |
| ClinVar / awesome-TCGA | Optional genetics / IO | **OUT OF SCOPE** now |

### §8 Repository assessment

| Guidance | Status | Note |
|----------|--------|------|
| immunecity = ISI product starting point; audit live vs fixture | **OUT OF SCOPE** for hsi-core edits | Do not build a second graph here |
| hsi-core / hsi-sources as SoT after local schema review | **DONE** locally | Blueprint could not see private repos; this alignment is the local truth map |
| Reuse Aksh primitives after module review; keep clinical separate | **PARTIAL** | Catalog landed; no wholesale care-agent port |
| Two-week discovery sprint (immunecity + HSI) then one pathway vertical | Process | **PARTIAL** — HSI side largely audited ([`PRD_IMPLEMENTATION_AUDIT.md`](./PRD_IMPLEMENTATION_AUDIT.md)); immunecity audit is ISI-team work |

### §9 Recommended architecture

| Layer | Status | Evidence / rule |
|-------|--------|-----------------|
| Source/rights registry | **NOT STARTED** | Needed after `partnerSigned` |
| Normalization / ontology | **PARTIAL** | LOINC; broader IDs later |
| HSI evidence service | **DONE** | This repo |
| KG projection on Neon | **PARTIAL** | HSI stub on **`red-wave` only**; ISI product DB stays **`autumn-snow`** — **no merge** |
| Analysis workspaces / TRE | **OUT OF SCOPE** | — |
| Agent orchestration | **OUT OF SCOPE** Stage 1 | — |
| Experience / API | **PARTIAL** | Exports **DONE**; full explorer = ISI; `/discovery` demo **DONE** |
| Evaluation / ops | **PARTIAL** | Rubric + acceptance exports; numeric thresholds TBD |

### §10 Roadmap gates ↔ HSI stages

| Blueprint gate | Maps to | hsi-core status |
|----------------|---------|-----------------|
| **0** Baseline and design | Stage 1 prep / R0 | **PARTIAL** — substrate + audit docs done; partnerSigned / rights register / SSc-vs-RA decision open |
| **1** Traceable pathway explorer | Stage 1 / R1 | **PARTIAL** — **RA/TNF** packs + `/discovery` done; blueprint’s **SSc** vertical **NOT STARTED** |
| **2** Cross-disease + datasets | Stage 2 / R2 | **PARTIAL** — R2 validation cards done; ImmPort/scRNA **NOT STARTED**; blueprint wants RA *after* SSc (inverted) |
| **3** Supervised agent workbench | Stage 2 | **NOT STARTED** / **OUT OF SCOPE** until Gate 1 proven |
| **4** Lab / industry | Stage 2–3 | **OUT OF SCOPE** |
| **5** Cohort feasibility | Stage 3 | **OUT OF SCOPE** |
| **6** Prospective clinical | Stage 3+ / Akeno | **OUT OF SCOPE** (HITL scaffolding ≠ this gate) |

### §11–§12 Evaluation and risks

| Ask | Status | Evidence |
|-----|--------|----------|
| Evidence integrity / citation correctness KPIs | **PARTIAL** | Rubric + acceptance; thresholds TBD with partner |
| No unsupported causal language on edges | **PARTIAL** | Grades + competing explanations; curator diligence |
| Coverage-scoped gaps | **PARTIAL** | Gap report |
| Risk controls (no PHI plane mix, no premature CDS) | **DONE** (policy + flags) | Neon map + Akeno consumer fail-closed |

### §13 Decisions + first build to authorise

| Blueprint decision | hsi-core posture |
|--------------------|------------------|
| Name hierarchy HSI / ISI / Aksh | **DONE** in vision docs |
| First vertical = **SSc** pathway | **Conflicts** with Phase 2 **RA/TNF** lock — do not silently pivot seeds |
| Audiences: immunologists/lab first | **Aligned** |
| Public/licensed data only first | **Aligned** |
| Repo truth audit before substantial coding | HSI side **DONE** (this doc + PRD audit); ISI product audit elsewhere |
| Authorise SSc CD4/Tfh–B-cell–IL-21 explorer | **NOT STARTED** — requires explicit product decision vs keep RA Stage 1 |

---

## Conflicts (isolation + Stage 1 vs target-state)

### 1. Neon / shared DB (binding)

Blueprint §9 casually places “PostgreSQL/Neon” under KG projection and §8 pushes a joint immunecity + HSI discovery sprint. **Current binding rule is stricter:**

- HSI substrate / migrations / Gate C *local placeholders* → **`red-wave-06625195` / `ep-restless-dew…` only**
- Gate C *approve* (if any) → ISI product Neon **`autumn-snow` / `ep-blue-salad…`** only
- **No shared evidence DB** between HSI and immunecity
- Never Akeno / DeliverX Neon from this workspace

See [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md), `src/db/neonGuard.ts`.  
**Resolution:** Keep export-based consumption. Joint “discovery sprint” = docs + contract mapping, not schema merge.

### 2. First vertical: SSc (blueprint + Whole-Immune-Cell PRD) vs RA/TNF (Stage 1 lock)

| Source | First pathway |
|--------|----------------|
| This blueprint §2 / §10 Gate 1 / §13 | **SSc** Tfh/CD4–B-cell–IL-21; EBV separate; RA as Gate 2 comparison |
| Whole-Immune-Cell PRD §12 / Gates 3–4 | **SSc** MVP vertical; **RA** Release 2 comparison — [`ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md`](./ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md) |
| Pilot PRD + `hsi-partner-lock.json` | **RA / anti-TNF response heterogeneity** (`scopeLocked=true`, `partnerSigned=false`) |
| Target-state PRD | One disease + question with partner; do not expand surface early |
| Spine stubs | `DISEASE_VERTICAL_STUBS`: RA = `stage1_scope_locked`; SSc = `prd_mvp_target` (`deepSeedsPresent=false`) |

**Resolution rule:** Do **not** replace the RA lock with SSc seeds unless outreach / founder explicitly re-scopes Stage 1. Prefer **dual-track**: keep RA packs; mark SSc as PRD/blueprint target; reuse RA seeds as R2 comparison when SSc curation is authorised. Full option table in the Whole-Immune-Cell alignment doc.

### 3. Stage 1 vs target-state breadth

Blueprint gates 3–6 (12-agent workbench, LIMS, cohort feasibility, prospective clinical) match Target R2–R5 / business-proposal Stages 2–3. [`ISI_TARGET_STATE_PRD_ALIGNMENT.md`](./ISI_TARGET_STATE_PRD_ALIGNMENT.md) and [`PRD_IMPLEMENTATION_AUDIT.md`](./PRD_IMPLEMENTATION_AUDIT.md) already say: **do not pull into Stage 1**. This blueprint agrees in prose (“prediction and trial matching should not determine the first milestone”) — hold that line in build asks.

### 4. Private-repo blind spot

Blueprint [R1]/R16] could not inspect hsi-core / hsi-sources (404/private). Local reality: substrate + Phases 0–8 + Akeno HITL + Aksh catalog **exist**. Prefer this alignment + PRD audit over the blueprint’s “unverifiable” caveat when planning HSI work.

### 5. immunecity edits

Blueprint: use immunecity as ISI product starting point. Vision: immunecity is **consumer** — **do not edit** from the HSI workspace. Aligns if ISI team owns product audit; hsi-core only stabilises exports.

---

## Recommended next asks (hsi-core)

Prefer **docs + partner process**. No large new implementation phase from this blueprint alone.

1. **Decide first vertical** — keep RA/TNF Stage 1 lock **or** explicitly re-scope to SSc (founder/partner). Until then, do not add SSc seed depth.
2. **Partner outreach** — flip `partnerSigned` / licensing / numeric rubric thresholds (unchanged from PRD audit).
3. **ISI consume checklist** — which `dist/outputs/` files power which immunecity screens (ISI team; no hsi-core UI invent).
4. **Optional tiny doc follow-up** — map blueprint’s 12 research roles → Aksh catalog names as “pattern reuse only” inside [`AKSH_AGENTS_IN_HSI.md`](./AKSH_AGENTS_IN_HSI.md) (no runtime).
5. **Hold the line** — no ImmPort/GEO/HCA connectors, no 12-agent runtime, no Neon merge, no Akeno live CDS, no immunecity edits from this repo.

**Not recommended now:** implementing the blueprint’s “FIRST BUILD TO AUTHORIZE” SSc explorer as a new hsi-core phase while RA remains scope-locked.

---

## Cross-links

- Systems vision (multi-axis; no forced SSc/RA pivot): [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md)  
- Pilot PRD: [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md)  
- Target-state: [`ISI_TARGET_STATE_PRD_ALIGNMENT.md`](./ISI_TARGET_STATE_PRD_ALIGNMENT.md)  
- Whole-immune-cell PRD: [`ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md`](./ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md)  
- Implementation audit: [`PRD_IMPLEMENTATION_AUDIT.md`](./PRD_IMPLEMENTATION_AUDIT.md)  
- Outputs: [`OUTPUTS.md`](./OUTPUTS.md)  
- Neon: [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md)  
- Vision: [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md)  
- Akeno / Aksh: [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md), [`AKSH_AGENTS_IN_HSI.md`](./AKSH_AGENTS_IN_HSI.md)
