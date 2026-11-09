# HSI cross-domain acceptance (landing ↔ research)

**Date opened:** 2026-11-09  
**Related:** [`HSI_CROSS_DOMAIN_RESEARCH_ACCEPTANCE.md`](./HSI_CROSS_DOMAIN_RESEARCH_ACCEPTANCE.md) (scenarios A–F), [`HSI_DOMAIN_INDEPENDENCE_AUDIT.md`](../engineering/HSI_DOMAIN_INDEPENDENCE_AUDIT.md)  
**Rule:** Do **not** mark **PASS** without execution evidence (logs, API traces, staging E2E). Homepage illustrative demos are **not** acceptance evidence.

**Statuses:** `NOT_EXECUTED` | `BLOCKED` | `FAIL` | `PASS` | `LIMITED`

---

## Shared checklist (per journey)

| # | Check | What counts as evidence |
|---|-------|-------------------------|
| 1 | Ontology / entity recognition | CURIE or registry hit / explicit miss in payload |
| 2 | Evidence retrieval | PMID/DOI/pack ids with provenance |
| 3 | Graph traversal | Path nodes/edges from governed or educational graph (label which) |
| 4 | Mechanism / analysis | Mechanism object or honest gap |
| 5 | Provenance | Epistemic type + source link |
| 6 | Persistence | Stored investigation / brief id + version hash |
| 7 | Output | Brief or review package with human-gated hypothesis |

Production baseline (executed 2026-11-09): `writesEnabled=false`; anon investigations **401** → persistence/output for live journeys **BLOCKED** on production.

---

## Journey 1 — Immunology (T-cell / inflammation)

| Field | Value |
|-------|-------|
| Intent | T-cell / inflammatory signalling investigation |
| Public entry | Homepage SSc fibrosis scenario (validation case) or `/science/graph` immune topics |
| Disease context | Optional; SSc pack is strongest validation asset — **not** product boundary |
| Ontology | **LIMITED** — SSc/immune packs richer; disease-null cytokine still schema-blocked for create |
| Evidence | **LIMITED** — curated packs / illustrative demo; live PubMed not claimed |
| Graph | **LIMITED** — educational graph available; governed `/api/research/graph/ssc` **401** anon |
| Analysis | **LIMITED** — demo mechanism path only publicly |
| Provenance | **LIMITED** — demo rows labelled curated; not release-bound public |
| Persistence | **BLOCKED** — production writes off; create path still `planSscInterrogation` focus |
| Output | **BLOCKED** on prod for live brief; illustrative `panel=brief` only |
| **Overall** | **NOT_EXECUTED** (full checklist) / public path **LIMITED** illustrative |

**Run log:** No staging researcher session exercised in this phase. Public demo id `demo_ssc_fibrosis_001` / scenario `ssc_fibrosis` verified present with `live_backend:false` via unit tests.

---

## Journey 2 — Gut–brain–immune

| Field | Value |
|-------|-------|
| Intent | Microbial metabolites → peripheral immune → neuroinflammation |
| Public entry | Homepage scenario `gut_neuro` (`demo_gut_neuroinflammation_001`) |
| Disease context | Optional / null preferred |
| Ontology | **BLOCKED** for live create — planner hardcodes SSc focus; ontology bridges incomplete (audit) |
| Evidence | **LIMITED** — illustrative rows only; gut–immune / neuroimmune packs exist as Discovery JSON, not staging E2E here |
| Graph | **LIMITED** — domain graph includes gut/neuroimmune educational coverage |
| Analysis | **LIMITED** — illustrative mechanism only |
| Provenance | illustrative |
| Persistence | **BLOCKED** — writes off + disease enum / planner |
| Output | **BLOCKED** live; illustrative brief panel **available** via `?scenario=gut_neuro&panel=brief` |
| **Overall** | **NOT_EXECUTED** / **BLOCKED** for connected research spine |

---

## Journey 3 — Metabolic immunology

| Field | Value |
|-------|-------|
| Intent | Metabolic inflammation ↔ insulin resistance context |
| Public entry | Homepage scenario `metabolic_inflammation` |
| Disease context | Optional (T2D may appear as condition label in fixtures — not required) |
| Ontology | **BLOCKED** for disease-null live create (same planner/enum) |
| Evidence | **LIMITED** — illustrative; synthetic validation profiles secondary only |
| Graph | **LIMITED** — educational |
| Analysis | **LIMITED** — illustrative |
| Provenance | illustrative |
| Persistence | **BLOCKED** |
| Output | **BLOCKED** live |
| **Overall** | **NOT_EXECUTED** / **BLOCKED** for connected spine |

---

## Honest unsupported / shallower domains

| Domain / question | Stance |
|-------------------|--------|
| Universal biology coverage | **Not claimed** |
| Oncology / tumour immune (homepage illustrative only) | Shallower curated depth; **NOT_EXECUTED** staging |
| Disease-independent cytokine cross-tissue | Demo exists; live create **BLOCKED** until `diseaseContext` optional |
| Live CDS / PHI / patient advice | **Forbidden** in hsi-core |
| Gate C auto-approve | **Forbidden** |
| HSI Trials live matching | **Not offered** (`/for-trials`) |
| Omics as equal-weight nav | `in_development` — no outbound CTA by design |

---

## Workspace feature verdict (production)

| Feature | Verdict |
|---------|---------|
| Programme | **BLOCKED** (missing) |
| Investigation | **BLOCKED** (writes off / planner narrow) |
| Evidence | **LIMITED** (catalogue/static) |
| Mechanism | **LIMITED** (public educational + parked probes) |
| Contradiction | **LIMITED** (public explorer) |
| Gap | **LIMITED** (embedded; no dedicated route) |
| Hypothesis | **LIMITED** (no unsupervised live generation claimed) |
| Brief | **BLOCKED** live / **LIMITED** illustrative |
| Save / resume | **BLOCKED** on production |

---

## Definition of Done blockers (remaining)

1. Staging research write harness with `writesEnabled=true` on staging host only.  
2. Generalise `planSscInterrogation` → optional `diseaseContext` + `scientificDomains[]`.  
3. Widen graph-context disease union / allow null.  
4. Credentialed E2E: create → graph-context → brief → review (human decision).  
5. Optional: public access-request persistence **or** keep honesty-only Contact (current).  
6. Do not promote production write enablement without human review.

Until items 1–4 execute with artifacts, all three journeys stay **NOT_EXECUTED** / **BLOCKED** for the connected product claim.
