# HSI Biomedical Data Strategy (§7.11–7.12)

**Document status:** Definitive biomedical / scientific data strategy (§7)  
**Adopted:** 2 November 2026  
**Priority:** **Phase 2 / Workflow B / M1** research-first — harden literature + graph + packs before clinical federation.  
**Related:** Catalogue §7.23 · LHK-G · Claim provenance schema

---

## 7.11 Literature and publication metadata

| Source | Role | Honesty | Maturity | Refresh |
|--------|------|---------|----------|---------|
| PubMed E-utilities | PMID resolve; Ask provisional; curator preview | **Verified** Check; **Partial** provisional | **L3–L4** | Continuous API; stamp `fetchedAt` |
| Europe PMC | Fallback / open full-text metadata | **Partial** | **L3** | Best-effort |
| Crossref | DOI metadata for curation / Research Library | **Verified** path | **L4** | On demand + library cache |
| Gate C + Cite Check | Human supports ≠ identifier resolve | **Verified** Check; supports **Partial** | **L3–L4** | Human SLA |

**Rules**

- Identifier verification ≠ claim approval ≠ public cite.  
- Provisional Ask hits stay **unreviewed** — never Gate C by default.  
- Live Discovery bulk (`DISCOVERY_LIVE_*`) stays **opt-in Prototype**; failed query ≠ zero evidence.  
- Persist only real PMIDs/DOIs; never invent identifiers.

---

## 7.12 Structured biomedical knowledge sources

| Source | Intended use | Honesty | Maturity | Phase 2 priority |
|--------|--------------|---------|----------|------------------|
| ISI `kg.json` + REL-* | Immune mechanism spine for M1 | **Verified** product KG | **L4** product; not full LHK-G | **P0** preserve |
| hsi-core graded packs | L4 evidence publish → X-G1 | **Verified** | **L4** | **P0** |
| ISI `xrefs.ts` | HGNC, UniProt, CL, GO, MONDO, MeSH, ChEMBL | **Verified** curated subset (2026-10-21) | **L3** thin coverage | **P0–P1** extend carefully |
| Open Targets | Disease–target edges | **Proposed** | **L0–L1** | P1 after M1 |
| UniProt / Reactome / GO dumps | Protein/pathway enrichment | **Partial**/manual | **L1–L3** | P1 snapshots |
| Human Cell Atlas / omics | Cell-state research | **Proposed** | **L0** | Later (P2) |
| hsi-core CL/MONDO hints | Spine / SSc cards | **Partial** (hint vs curator_confirmed) | **L2–L3** | Not Gate C |

---

## 1. Licence and refresh policy

| Principle | Practice |
|-----------|----------|
| Versioned snapshots | Prefer dated dumps/API pins over silent live mutation of production claims |
| Retrieval provenance | Store source, version/date, licence note, tool id |
| Attribution | PubMed/Crossref/ontology ToS and citation norms |
| No licence wash | Do not re-publish proprietary terminology or restricted datasets in public packs |
| Failure mode | If refresh fails → stale badge; do not invent updates |

---

## 2. ISI xrefs vs hsi-core packs

| Asset | Authority | Integration rule |
|-------|-----------|------------------|
| `kg.json` | ISI concept SoT for Atlas IDs | Do not replace with external DB without ADR |
| `xrefs.ts` | External sameAs/close maps | exact → sameAs; close → display only |
| hsi-core packs | Graded claim SoT for publish | Consume via Gate C; map grades → claimTypes |
| Overlap | LOINC on claims; CL/MONDO on cells | Extend pattern; no silent ID rewrite |

---

## 3. Phase 2 / M1 data plan (research-first)

**In scope for M1 Biomedical Discovery Brief**

1. ISI neighbourhood traversal + approved cites.  
2. hsi-core grade lookup where consumed.  
3. PubMed/Crossref verification for candidate identifiers.  
4. Existing xrefs for entity display.  
5. Honest uncertainty / competing frames.

**Out of scope for M1**

- Open Targets full graph load.  
- HCA/omics productisation.  
- Live hospital FHIR.  
- Auto-promotion of provisional literature.

---

## 4. Quality gates before claiming “integrated”

| Gate | Requirement |
|------|-------------|
| Honesty label | Verified/Partial/… accurate in UI and docs |
| Provenance | Source + retrievedAt on every used item |
| Plane | P0/P1 only for research briefs |
| Eval | Golden briefs: fabricated-cite rate = 0 |

**Stop.** No bulk ingest pipelines implemented in this pack.
