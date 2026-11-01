# Neural networks, AI, and future healthcare technology — HSI position

**Status:** Architecture / product position (falsifiable). Not a model shipping plan.  
**Scope:** `hsi-core` evidence backbone → ISI discovery → Akeno/Aksh HITL later.  
**Binding constraints:** RA Stage 1 lock · no live CDS · no raw PHI in HSI · Neon **`red-wave` only** · model output never auto-approves into the KG.  
**Code anchors:** `src/systemsAxes.ts` (`FUTURE_TECH_*`, AI capabilities / hard bans, model-proposal + embedding stubs) · regenerable `hsi-systems-vision.json` · map [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md).

---

## Executive thesis

Neural networks are **representation and proposal engines**, not authorities. In this stack they buy: embeddings over molecules/cells/omics/text/graphs; ranking and similarity; hypothesis drafts; in-silico screening scores. They must **not** replace provenance, invent graded edges, or issue clinical decisions. The graded knowledge graph is the **constraint layer**; NNs feed **Gate C** as proposers/scorers. Twelve research agents are **bounded tools** under an orchestrator with independent evidence/governance review; Aksh-named care agents stay **HITL** and off the HSI seed path. Future healthcare tech (multimodal FMs, digital twins, closed-loop sensing, federated learning, causal ML, structure/generative chem adapters) enters only behind **stage gates**, licenses, and explicit failure modes. Patient raw data never lands in HSI; Akeno may hold governed context later. Near-term hsi-core work is **schema and eval stubs**, not a giant ML stack.

**Falsifiers (examples):** (1) Any path that writes `hsiGrade` or Gate C approve from model output alone. (2) Live PHI or identifiable sequences in `red-wave` evidence tables. (3) Claiming clinical digital twins or closed-loop dosing from research packs. (4) Equating Aksh agent names with an executable ISI workbench.

---

## 1. What neural networks actually buy vs must not do

### Buy (research / discovery utility)

| Capability | Domain fit | Honest limit |
|------------|------------|--------------|
| **Representation learning** | Molecules (SMILES/graphs), proteins (sequences/structures), cells/omics (scRNA, CyTOF-like panels later), literature (claims, abstracts), **graphs** (neighbourhood embeddings over HSI edges) | Embeddings are **indexes and scorers**, not truth. Cosine similarity ≠ mechanism. |
| **Pattern discovery** | Cluster phenotypes, suggest missing edges, retrieve analogous pathways across disease verticals | Patterns are **hypotheses**. They require context + evidence + dual grade axes before KG membership. |
| **Ranking / retrieval** | Literature triage, biomarker candidate lists, “what to read next,” R2 gap cards | Does not close Gate C. Does not set `established`. |
| **In-silico scoring** | Docking/affinity proxies, ADMET-ish filters, generative design **sandbox** scores (P3 adapters) | Scores ≠ clinical efficacy; licenses and compute budgets bind adapters. |
| **Assistive drafting** | Pack briefs, competing-explanation shells, curator checklists | Human owns every promote; drafts carry `teachingStatus` honesty. |

### Must not do (hard bans)

1. **Replace provenance** — no edge without citable sources (PMID / dataset / assay pointer) when claiming support.  
2. **Invent graded edges** — no silent insert of `established` / `approved` from a model.  
3. **Auto clinical decisions** — no diagnosis, prognosis, treatment selection, dosing, or EHR write-back from HSI/ISI research surfaces.  
4. **Promote across planes** — generative chem / structure hypotheses never become Aksh CDS cards without Stage 3 product + governance gates.  
5. **Train on raw clinic PHI inside HSI** — no identifiable records or clinic sequences in seed/export/Neon evidence paths.  
6. **Collapse uncertainty** — models must not erase `uncertain` / `hypothesized` / `unexplored` into confident clinic language.

**Product rule:** If removing the model leaves no provenance trail, the artifact was never evidence.

---

## 2. Graph + NN hybrid (constraint vs proposer)

```text
                    ┌─────────────────────────────┐
   Multimodal /     │  NN layer (proposers)        │
   structure /      │  embed · score · draft ·     │
   agent tools  ──► │  retrieve · screen           │
                    └──────────────┬──────────────┘
                                   │ model-proposal artifacts
                                   │ (never auto-approve)
                                   ▼
                    ┌─────────────────────────────┐
                    │  Gate C (human)              │
                    │  checklist · dual grades ·   │
                    │  context + evidence          │
                    └──────────────┬──────────────┘
                                   │ approve / reject / defer
                                   ▼
                    ┌─────────────────────────────┐
                    │  HSI graded KG (constraint)  │
                    │  versioned exports · notCds  │
                    └─────────────────────────────┘
```

| Layer | Owns | Does not own |
|-------|------|--------------|
| **KG (HSI)** | Entity ids, predicates, context, evidence pointers, `hsiGrade` / `teachingStatus` / `curationReview`, export versioning | Model weights, training loops, clinic chart context |
| **NN / adapters** | Embeddings, scores, ranked candidates, structure/chem hypotheses as **proposals** | Authority to flip grades or write KG edges |
| **Gate C** | Human approve path (ISI Neon for product approve; HSI holds checklist shapes on `red-wave`) | Autonomous promotion |

**Invariant (exported):** `autoApproveIntoKg=false` · every adapter `mayFlipEvidenceGrade=false`.

Embeddings, when introduced, are **sidecar slots** (model id + dim + vector ref or hash + createdAt) attached to nodes/edges for retrieval — not a substitute for typed predicates. See stub `EDGE_EMBEDDING_SLOT_SCHEMA` in `systemsAxes.ts`.

---

## 3. AI agent workbench vs clinical agents

### Research workbench (ISI · Stage 2+)

Twelve **research** specialists + orchestrator + **independent** evidence/governance reviewer (blueprint §4). Engineering posture:

- Agents are **tools with bounded scopes** (role prompts, allowed sources, max claim drafts, no grade flip).  
- Orchestrator sequences; does not approve.  
- Governance reviewer is **separate** from the drafting agents — maps to Gate C checklist + human approve.  
- Runtime lives in **ISI product**, not Stage 1 hsi-core. HSI holds catalog patterns + proposal artifact schema only.

### Clinical agents (Aksh names · HITL)

Directory peers (CANVAS, SYNTHESIS, GUARDIAN, CONDUCTOR, …) are a **catalog** in hsi-core (`docs/AKSH_AGENTS_IN_HSI.md`). They:

- Draft under clinician oversight; **SHIELD / CONDUCTOR** posture.  
- Must not be conflated with the ISI 12-agent research roster.  
- Never receive generative-chem → clinic paths.  
- Do not unlock CDS until `isCdsSurfacable` + product gates.

| | Research agents | Care agents (Aksh) |
|--|-----------------|---------------------|
| Owner | ISI (+ HSI Gate C shapes) | Aksh / Akeno HITL |
| Patient context | Forbidden in first release | Stage 3+ TRE / partner only |
| Output | Hypothesis / brief / gap draft | Suggestion cards · clinician decides |
| Stage 1 in hsi-core | Catalog + schema stubs | Catalog + HITL maps · `cdsSurfacable=false` on seeds |

---

## 4. Future healthcare technology (gated)

Each item: **what it is**, **where it fits**, **stage gate**, **failure mode**.

### Multimodal foundation models

- **Fit:** Joint text + structure + omics retrieval; curator copilots; literature grounding.  
- **Gate:** Offline eval on public packs; citation required; no PHI prompts into HSI.  
- **Failure:** Hallucinated PMIDs / mechanisms presented as graded claims.

### Digital twins

- **Research twin:** In-silico cell/pathway/neighbourhood simulation for hypothesis stress-tests — ISI lab lane.  
- **Clinical twin:** Patient-specific models — **Stage 3+**, partner TRE, never HSI seed authority.  
- **Failure:** Marketing “twin” language that implies validated bedside prediction from research exports.

### Closed-loop sensing

- Wearables / continuous inflammation proxies / adaptive dosing — **outside** Stage 1–2 HSI.  
- **Failure:** Wiring sensor streams into `red-wave` evidence tables or auto actions.

### Federated learning

- Train across sites without centralizing PHI — Akeno/partner governance, not HSI Neon merge.  
- **Failure:** “Federated” as excuse to blur Neon isolation (`red-wave` vs `autumn-snow`).

### Causal ML

- Useful for **candidate** causal graphs and sensitivity analyses under assumptions.  
- **Limit:** Observational omics + literature ≠ identified causal effects for treatment. Do not auto-upgrade `associated_with` → mechanistic `established`.  
- **Failure:** Causal language on cards without stated identification strategy.

### In-silico screening (P3 adapters)

Catalogued in `FUTURE_TECH_ADAPTER_STUBS` / [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md):

| Adapter | Role | Gate |
|---------|------|------|
| TDC | Offline ML eval vs graded claims | Not seed authority |
| AF3 / Boltz | Structure hypotheses | License sign-off; discovery-only |
| ESM | Protein embeddings / similarity | No clinic PHI sequences |
| OpenMM | MD simulation | Not Gate C evidence |
| RDKit | Cheminformatics | No invented clinical edges |
| REINVENT4 | Generative design sandbox | Never clinic recommendation path |

### Brain–immune–gut as multi-scale systems

Target connected graph (spine + gut–immune + neuroimmune + disease/tissue/biomarker) is **multi-scale**: molecular ↔ cell ↔ tissue ↔ axis ↔ disease context. Modeling priority:

1. Typed entities + predicates with hypothesis-capable defaults.  
2. Thin public-evidence edges before multi-scale simulators.  
3. NN multi-scale models only as proposers against that vocabulary.

**Failure:** One end-to-end “systems AI” that skips grades and context.

---

## 5. Patient data plane

| Plane | May hold | Must not hold |
|-------|----------|---------------|
| **HSI (`red-wave`)** | De-id / fixture observation **shapes**; translation handoff candidates; HITL map snapshots with `cdsSurfacable=false`; policy flags | Raw PHI; identifiable EHR; live partner cohort dumps; clinic sequences for ESM; auto CDS |
| **ISI product** | Research UX over exports; Gate C approve in ISI Neon only | Identifiable patients in first release |
| **Akeno / Aksh HITL** | Governed chart context under partner TRE / DPIA (Stage 3+) | Invented `partnerSigned`; marketing CDS claims |

**Synthetic / de-identified research paths:** fixtures and aggregate stubs only until a written governance path exists. Synthetic ≠ license to invent LOINC or partner MoUs.

See `PATIENT_DATA_PLANE_RULES` and [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md).

---

## 6. Architecture sketch

```text
┌──────────────────────────────────────────────────────────────┐
│ hsi-core (sole edit target)                                  │
│  schema · seeds · grades · Gate C checklists · exports       │
│  systemsAxes · immuneCellSpine · partner lock                │
│  AI: adapter registry · proposal artifact schema ·           │
│      embedding slot schema · eval harness stub               │
│  Neon: red-wave only                                         │
└───────────────┬──────────────────────────────┬───────────────┘
                │ versioned JSON exports       │
                ▼                              ▼
┌───────────────────────────┐    ┌─────────────────────────────┐
│ ISI UX (immunecity)       │    │ Aksh / Akeno HITL           │
│ discovery · Ask · Radar   │    │ suggestion cards · /akeno   │
│ agent workbench (later)   │    │ clinician decides           │
│ Gate C approve (ISI Neon) │    │ no live CDS from seeds      │
└─────────────┬─────────────┘    └─────────────────────────────┘
              │
              ▼
┌───────────────────────────┐
│ Model adapters (P3)       │
│ AF3/Boltz/ESM/… · TDC     │
│ proposals → Gate C only   │
└───────────────────────────┘
```

### Where embeddings live

- **P2.2 landed:** typed edge sidecars (`EDGE_EMBEDDING_SLOT_SCHEMA` + `src/embeddingSidecar.ts` → `hsi-embedding-sidecars.json`) — `modelId`, `dim`, `vectorRef` and/or `contentHash`, `createdAt`, `doesNotSetHsiGrade=true`. Prefer hash/ref; optional tiny demo ≤16 dims only.  
- **Not:** embedding tables as a parallel truth store that bypasses grades; no multi-GB weights; no PHI.  
- **Versioning:** model id + weights hash + dim + createdAt; invalidate on model bump.  
- **Eval (P2.3 landed):** offline harness (`MODEL_EVAL_HARNESS_STUB` + `src/modelEvalHarness.ts` → `hsi-model-eval-harness.*`) scores proposals/sidecars against frozen RA/SSc/gut/neuro fixtures (cited edges exist; grade not flipped; required fields; fail-closed clinical/PHI; sidecar locators; pack authority). No training / PHI. TDC-style retrieval metrics still deferred to P3.
- **Genome pointers (P2.4 landed):** ClinVar / TCGA citation metadata (`EXTERNAL_GENOME_POINTER_SCHEMA` + `src/externalGenomePointers.ts` → `hsi-external-genome-pointers.json`) — accession, URL template, disease/gene context, optional `edgeIds`, `reviewRequired=true`, `doesNotSetHsiGrade=true`. No bulk genome dump / PHI.  
- **P3 adapters (P2.5 landed):** RFC + license matrix ([`P3_ADAPTER_RFC.md`](./P3_ADAPTER_RFC.md); `P3_ADAPTER_LICENSE_MATRIX_SCHEMA` + `src/p3AdapterLicenseMatrix.ts` → `hsi-p3-adapter-license-matrix.*`). Emit **ModelProposalArtifacts** only; license gate (`blockedUntilSignOff`) before run; honest `signOffStatus`; **never** vendor multi-GB weights; no commercial-signed claim without evidence.

### Human gates

Curator Gate C · ISI product approve · Aksh clinician action · partner governance for PHI. Models sit **below** all of them.

---

## 7. Near-term build vs deferred

### Build next in hsi-core (concrete, small)

| Slice | Why | Not |
|-------|-----|-----|
| **This position doc + systemsAxes AI capabilities / hard bans** | Aligns vision export with policy | Purple prose roadmap |
| **Model-proposal artifact schema stub** | Stable shape for ISI/adapters to emit drafts into Gate C queues | Agent runtime |
| **Edge embedding sidecars (P2.2)** | Hash/ref slots on sample edges; never grades | Vector DB / training / weight vendoring |
| **Eval harness stub (P2.3)** | Offline checks vs frozen packs + export | Full MLOps / training |
| **Cross-links** | SYSTEMS_VISION_MAP / OUTPUTS / README | Site redesign |

### Deferred (explicit)

- Vendoring AF3/Boltz/ESM/OpenMM/RDKit/REINVENT/TDC **weights** (RFC + matrix landed; runnable adapters still gated).  
- 12-agent research runtime.  
- Clinical digital twins, closed-loop sensing, federated training in HSI.  
- ImmPort/GEO/HCA connectors as model fuel.  
- Any path that auto-flips grades.  
- SSc deep seed pivot that wipes RA lock.

**P1.5 landed:** typed `ModelProposalArtifact` (`src/modelProposal.ts`) wires into Gate C checklist `modelProposals` (pending only; `autoApprove=false`; unit tests refuse forbidden `hsiGrade` / `mayFlipEvidenceGrade`). **P1.3 landed:** gut–immune SCFA ↔ mucosal Treg/Th17 pack. **P2.1 landed:** neuroimmune vagus / cholinergic anti-inflammatory reflex pack (human VNS–RA hypothesized only). **P2.2 landed:** embedding sidecars (`hsi-embedding-sidecars.json`; hash/ref; `doesNotSetHsiGrade`). **P2.3 landed:** offline eval harness (`hsi-model-eval-harness.*`; fail-closed clinical/PHI; packs remain authority). **P2.4 landed:** ClinVar/TCGA pointer metadata (`hsi-external-genome-pointers.json`; citation/ref; `reviewRequired`; no bulk dump / PHI). **P2.5 landed:** P3 adapter RFC + license matrix ([`P3_ADAPTER_RFC.md`](./P3_ADAPTER_RFC.md); `hsi-p3-adapter-license-matrix.*`). **Recommended next science slice:** P3.0 first unblocked thin adapter spike (proposal-only) per [`BUILD_STATUS_AND_NEXT.md`](./BUILD_STATUS_AND_NEXT.md).

---

## Cross-links

- Systems map: [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md)  
- P3 adapter RFC: [`P3_ADAPTER_RFC.md`](./P3_ADAPTER_RFC.md)  
- Bio-stack / P3 inventory: [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md)  
- Blueprint agents: [`ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md`](./ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md)  
- Whole-immune-cell PRD: [`ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md`](./ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md)  
- Aksh agent catalog: [`AKSH_AGENTS_IN_HSI.md`](./AKSH_AGENTS_IN_HSI.md)  
- Akeno HITL: [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md)  
- Outputs: [`OUTPUTS.md`](./OUTPUTS.md)  
- Neon: [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md)
