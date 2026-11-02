# ISI / HSI Core: Product and Website Brief

**Status:** Binding product + site narrative (2026-11-02).  
**Edit target:** `hsi-core` · site under `site/` · Discovery/Evidence/Curator routes preserved.

## Product in one sentence

**Immune Super Intelligence (ISI)** is a research workspace for exploring how immune cells, their states, tissues, molecular mechanisms, diseases and research evidence relate to one another.

**HSI Core** is the evidence and provenance backbone that supports this exploration. It stores and publishes context-rich, evidence-linked claims for ISI to consume.

The goal is to help researchers move from a question about an immune cell or disease to a traceable map of relevant mechanisms, evidence, conflicts, uncertainties and research gaps.

## Product roles

| Role | Meaning |
|------|---------|
| **ISI** | Researcher-facing discovery experience |
| **HSI Core** | Evidence model, provenance, review rules, validation, versioned exports |
| **Aksh Health** | Separate clinical product — not the user or purpose of ISI discovery |
| **Akeno / patient workflows** | Later possibilities only — separate data rights, governance, clinical eval, HITL |

Do **not** present ISI as clinical decision support. Do **not** imply patient records, automated disease prediction or trial eligibility are part of the current product.

## Website homepage order (implemented in `site/src/pages/Home.tsx`)

1. Product purpose + route into Discovery / ISI  
2. Visual: research question → evidence map  
3. Worked example (scope-locked RA / anti-TNF slice from published packs)  
4. Evidence, provenance, uncertainty, Gate C  
5. What HSI provides to ISI; Aksh brief + gated  
6. Compact maturity / development-status note  
7. Footer → Development status, docs, repository  

Roadmap P0–P3 detail stays on `/roadmap` and in [`BUILD_STATUS_AND_NEXT.md`](./BUILD_STATUS_AND_NEXT.md) — not the homepage hero.

## Honesty

- Distinguish **implemented**, **planned**, and **future concept**.  
- Never invent partnerships, trial results, performance metrics or scientific findings.  
- Research intelligence ≠ clinical intelligence.
