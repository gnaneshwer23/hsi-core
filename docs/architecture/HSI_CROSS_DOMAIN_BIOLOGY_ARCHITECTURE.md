# HSI cross-domain biology architecture

**Audited tip:** `864710a` (docs authored 2026-11-09; implement via focused PRs)  
**Production:** https://www.humansuperintelligence.tech/  
**Governing vision:** [`../strategy/HSI_VISION.md`](../strategy/HSI_VISION.md) — cross-domain living intelligence; ambition ≠ production-ready.  
**Governing clarification:** Systemic sclerosis is a **validation case**, not the product boundary. HSI is a connected, cross-disease, multi-system biomedical research intelligence ecosystem.

---

## 1. Principles (binding)

1. Preserve independent HSI scientific intelligence (red-wave Neon ownership).  
2. HSI owns the Living Health Knowledge Graph substrate.  
3. Scientific review, evidence provenance, and auditability remain mandatory.  
4. Aksh / HSI Clinical / ISI / HSI Trials stay connected products with governed interfaces.  
5. Do **not** hardcode investigations to a single disease.  
6. Do **not** create per-domain backends.  
7. Reuse shared workbench, graph, evidence, and agent orchestration.  
8. Expand via ontology + connectors.  
9. Segregate patient-specific clinical data from public biomedical evidence (CDS/PHI out of hsi-core).  
10. Distinguish established evidence, associations, computational inference, and unvalidated hypotheses.

---

## 2. Current reality vs target

| Layer | Today | Target |
|-------|-------|--------|
| Public domain graph | 12 domains, 7 conditions, 4 investigation questions (gut/immune/metabolic/neuro) | Broader coverage + honest gaps |
| Homepage demo | Single SSc fibrosis illustrative path | Multiple illustrative scenarios; unequal coverage labelled |
| Interrogative create | `planSscInterrogation(…, focus:"systemic_sclerosis")` | Domain-independent planner; optional disease context |
| Graph context disease enum | `"systemic_sclerosis" \| "rheumatoid_arthritis"` only | Extensible disease **or** disease-independent biological scope |
| Discovery packs | RA ASK + SSc dual-track MVP + gut/neuro packs | Same pattern: packs as connectors, not product walls |
| Agent runtime | Durable schema; not public live | Shared agents + specialist adapters |

---

## 3. Domain-independent investigation contract (target)

Every investigation payload must support:

| Field | Required? | Notes |
|-------|-----------|-------|
| `question` | yes | Non-identifying biomedical question |
| `scientificDomains[]` | yes (≥1) | e.g. immune, gut, neuroimmune, metabolic, omics… |
| `biologicalEntities[]` | yes (≥0 curated) | Cells, genes, pathways, microbes… |
| `diseaseContext` | **optional** | Null allowed for pure biology / cross-tissue questions |
| `organOrTissueContext[]` | optional | Explicit tissue scope |
| `evidenceScope` | yes | public_biomedical / licensed_partner / … |
| `sourceIdentifiers[]` | as retrieved | PMID/DOI/system ids with provenance |
| `executionState` | yes | draft → … |
| `reviewState` | yes | unreviewed / awaiting / reviewed / rejected |
| `outputs` | evolving | brief, graph-context, hypotheses |
| `provenance` + version history | yes | content hashes, release ids |

**Rule:** A disease identifier must **not** be mandatory for a purely biological or cross-system question.

---

## 4. Shared platform (one backend)

```text
Research workspace
  ├── Investigation service (domain-agnostic)
  ├── Evidence connectors (pack / literature / licensed)
  ├── Graph services (educational + governed LHKG)
  ├── Mechanism / contradiction / gap analysis
  ├── Hypothesis governance (never auto-approve)
  ├── Brief delivery
  └── Scientific review queue
```

Specialist **adapters** only when a domain needs distinct datasets or eval harnesses (e.g. omics indexing, trial registry import). Adapters must not fork the investigation identity.

---

## 5. Product boundaries

| Product | Role relative to HSI |
|---------|----------------------|
| HSI core | Cross-domain research intelligence + LHKG ownership |
| ISI | Immune-science research surface; consume Discovery JSON |
| Aksh | Personal health context; PHI stays out of HSI |
| HSI Trials | Translational / trial context; matching not live |
| HSI Clinical | Clinical research context; no CDS in hsi-core |

---

## 6. Epistemic types (must remain explicit)

| Type | Meaning |
|------|---------|
| `established_evidence` | Human-reviewed, context-bound support |
| `association` | Observed association; not causality |
| `computational_inference` | Model output; not validated science |
| `unvalidated_hypothesis` | Candidate only |
| `research_gap` | Explicit missing evidence |

Graph promotion and clinical advice flags stay fail-closed (`graphPromotable:false`, `clinicalAdvice:false` until governance says otherwise).

---

## 7. Implementation order

1. **Docs + public multi-scenario demos** (this tranche) — no false coverage claims.  
2. **Widen `ReleasedEvidenceBundle.disease` / focus** to optional + multi-value domains (schema + validators + tests).  
3. **Rename/generalise `planSscInterrogation`** → domain-agnostic planner; keep SSc as a focus preset.  
4. **Programme model** (from 32-page IA) with domain tags.  
5. **Ontology mapping table** expansion + connector registry.  
6. **Staging E2E** for scenarios A–F (see QA doc) — pass only with execution evidence.  
7. **Coverage honesty UI** on public site (per-domain evidence depth).

---

## 8. What not to claim

- Universal human-biology coverage.  
- Equal validation depth across domains.  
- Live agent discovery for every specialty.  
- That SSc removal is required (preserve SSc capabilities).
