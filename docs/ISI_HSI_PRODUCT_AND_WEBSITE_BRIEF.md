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

Public IA (2026-11-03 simplification): **Home · Platform · Products · Science · How It Works**.  
Research / ISI entry via Products + contextual CTAs. Science = educational experience, not a clinical product.

1. Value prop + connected biology / evidence fabric (`PlatformEngine`)  
2. Four-product ecosystem once (`EcosystemGrid`)  
3. One research workflow demo (`DiscoveryWorkbench`) — Explore lab stays on `/explore`  
4. Evidence transparency + human oversight (FAQ; Science ≠ clinical; ISI ≠ CDS)  
5. Research collaboration CTA → `/for-isi`, `/discovery`, `/products`  
6. Footer → Roadmap, Status, Docs  

Roadmap P0–P3 detail stays on `/roadmap` and in [`BUILD_STATUS_AND_NEXT.md`](./BUILD_STATUS_AND_NEXT.md) — not the homepage hero.  
Audit + capability matrix: `site/docs/PUBLIC_SITE_AUDIT.md`, `site/docs/CAPABILITY_DATA_SOURCE_MATRIX.md`.

## Honesty

- Distinguish **implemented**, **planned**, and **future concept**.  
- Never invent partnerships, trial results, performance metrics or scientific findings.  
- Research intelligence ≠ clinical intelligence.
