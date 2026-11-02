# HSI Integration Roadmap (§7.24)

**Document status:** Phased interoperability delivery plan (§7)  
**Adopted:** 2 November 2026  
**Maps to:** [`HSI_PRODUCT_ROADMAP.md`](./HSI_PRODUCT_ROADMAP.md) · §5 intel roadmap · research-first M1  
**Phase 0:** This §7 pack (audit + strategies) — **docs only**.

---

## 1. Phase map (§7.24 ↔ product / intel)

| §7 phase | Focus | Product roadmap | Intel (§5) | Status |
|----------|-------|-----------------|------------|--------|
| **0** | Existing integration audit + §7 pack | Phase 0 | Phase 0 | **Done** (docs) |
| **1** | Catalogue freeze + X-* / tool contracts for data | Phase 1 schema | Phase 1 tools | **Proposed** |
| **2** | Biomedical harden (lit metadata, xrefs, pack consume) for M1 | Phase 2 Workflow A/M1 | Phase 3 M1 | **Near-term** |
| **3** | Terminology mapping service thin slice (LOINC + xrefs extend) | Phase 1–2 | Phase 1–2 | **Proposed** |
| **4** | Synthetic FHIR multi-provider + Workflow B harness | Phase 3 | Phase 4 | **Later** |
| **5** | Trial registry cache + freshness (one indication) | Phase 4 | Phase 5 | **Later** |
| **6** | Aksh Exchange A gateway (no PHI to research DBs) | Phase 5 | Phase 6 | **Later** |
| **7** | Partner-authorised pilots + eval / safety case prep | Phase 6 | Phase 7 | **Later** — not L5 claimed |

---

## 2. Phase detail

### Phase 0 — Integration audit (this pack)

| | |
|--|--|
| **Objective** | Honest inventory; maturity L0–L5 defined; false claims listed |
| **Deliverable** | Twelve §7 docs + README index |
| **Acceptance** | Founder can see what exists vs ambition |
| **State** | **Complete** (docs) |

### Phase 1 — Contracts & catalogue discipline

| | |
|--|--|
| **Objective** | Every near-term source has catalogue row + contract sketch |
| **Reuse** | X-G1; Four-Product X-* table; tool contracts |
| **Must not** | Implement hospital connectors |
| **Acceptance** | Reviewed OpenAPI/YAML sketches for data tools; no raw DB agent path |

### Phase 2 — Biomedical path for M1 (research-first)

| | |
|--|--|
| **Objective** | Literature provenance + pack consume + xrefs support Workflow B/M1 |
| **Priority sources** | Packs, PubMed/Crossref, ISI KG/xrefs |
| **Acceptance** | Golden briefs; fabricated-cite = 0; honesty labels correct |
| **Out** | Open Targets bulk; HCA; live FHIR |

### Phase 3 — Terminology thin slice

| | |
|--|--|
| **Objective** | Extend LOINC links + curated xrefs; mapping record schema |
| **Gate** | SNOMED licence before embed |
| **Acceptance** | Ambiguous maps flagged; licenceOk enforced on publish |

### Phase 4 — Synthetic clinical FHIR

| | |
|--|--|
| **Objective** | Workflow B timeline on fixtures; missing-data warnings |
| **Reuse** | Aksh BRIDGE staging patterns |
| **Acceptance** | Demo on synthetic multi-provider patient; zero PHI in research DBs |
| **Maturity target** | **L2→L3** |

### Phase 5 — Trial registry pilot

| | |
|--|--|
| **Objective** | Versioned CTG cache + freshness for one indication |
| **Acceptance** | Screening packet timestamps; five states; no confirmed-eligible |
| **Keep** | TI production flag policy until SME sign-off |

### Phase 6 — Aksh gateway (Exchange A)

| | |
|--|--|
| **Objective** | X-A1/A2 design + contract tests; purpose limitation |
| **Acceptance** | Red-team: no PGHD in research logs/Neons |
| **Wearables** | Remain stubs until vendor+consent path |

### Phase 7 — Partner pilots & evaluation

| | |
|--|--|
| **Objective** | Authorised test environments; eval harnesses; safety artifacts prep |
| **Acceptance** | Still no universal hospital claim; L5 only with explicit org register evidence |
| **Depends** | Real partner lock (not fixture); clinical safety doc prerequisites |

---

## 3. Explicit non-goals for early phases

- Universal hospital FHIR federation.  
- Live EMIS / PDS.  
- Shared PHI+evidence mega-DB.  
- Auto trial enrolment.  
- Presenting Aksh synthetic diabetes journey as LIVE_ORGANISATIONS>0.

---

## 4. Stop conditions

1. Approve §7 pack (architecture, catalogue, FHIR/biomedical/trials/PGHD, terminology, provenance, security, testing, this roadmap).  
2. Do not start Phase 4 clinical connectors before M1 research path is useful.  
3. No implementation work claimed done by this document.

**Stop.** Roadmap docs only.
