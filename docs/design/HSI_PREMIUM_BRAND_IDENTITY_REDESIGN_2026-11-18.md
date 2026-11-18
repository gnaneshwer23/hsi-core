# HSI — Premium Brand Identity & Website Redesign

**Date:** 18 November 2026 (Europe/London)  
**Status:** Binding Stage-0 design doctrine for Stage 1–3 execution  
**Governing vision:** [`../strategy/HSI_VISION.md`](../strategy/HSI_VISION.md) (one scientific intelligence technology; not a marketed four-product portfolio)  
**Tokens (export):** [`hsi-brand-tokens.v1.json`](./hsi-brand-tokens.v1.json)  
**Honesty:** Ambition ≠ production-ready. No invented accuracy %, partnerships, clinical utility, Gate C auto-approve, PHI/CDS, or “Human Systems Intelligence” as a legal name.

---

## Brand direction

Scientific precision, connected biology, evidence-first intelligence.

Retain **HSI** as the master brand, preserve the scientific platform architecture, and modernise visual identity, messaging and UX.

| Element | Decision |
| --- | --- |
| Master brand | **HSI** |
| Existing formal name (retain) | **Human Super Intelligence** |
| Do **not** adopt yet | “Human Systems Intelligence” (legally unverified expansion) |
| Category | Scientific Intelligence Platform |
| Public descriptor | **Scientific Intelligence for Human Biology** |
| Brand promise | Understand the mechanism. Preserve the evidence. Explain the uncertainty. |
| Personality | Precise, intelligent, calm, credible, exploratory |
| Audiences | Biomedical researchers, academic institutions, biotech R&D, scientific teams |
| Architecture (marketing) | One platform, multiple connected research **capabilities** (presentation labels — not separate products) |

**Tagline set (Stage 1 marketing):**

- Wordmark: **HSI**
- Formal: **HUMAN SUPER INTELLIGENCE**
- Descriptor: **SCIENTIFIC INTELLIGENCE FOR HUMAN BIOLOGY**
- Line: *Biology is connected. Understanding should be too.*
- Support: Explore biological mechanisms, connect scientific evidence and investigate uncertainty across six domains of human biology.

**Feel:** sophisticated scientific technology company — not a futuristic AI assistant and not a conventional pharmaceutical brochure site.

---

## Visual identity system

| Role | Name | Hex | Use |
| --- | --- | --- | --- |
| Primary surface | Midnight | `#0B1720` | Dark heroes, chrome, research sidebar |
| Secondary surface | Deep teal | `#15343B` | Panels, depth, secondary bands |
| Action / nav | Signal mint | `#58C6B6` | Primary actions, key navigation accents |
| Page / reading | Cloud | `#F5F8F7` | Light editorial sections, workbench canvas |
| Conflict / caution | Coral | `#E47B72` | Disagreement, warnings, uncertainty — **sparingly** |

### Typography

| Context | Face | Notes |
| --- | --- | --- |
| Marketing headlines (selective) | Instrument Serif (or equivalent restrained editorial) | Major hero lines only |
| Interface / body | **Geist** preferred for new Stage 1 skins | Avoid Inter/Roboto/Arial as default stacks |
| Production interim | Host Grotesk Variable (currently e2e-locked) | Do not rip out until a font-migration ticket + e2e update |
| Data / citations / measurements | Clear sans or JetBrains Mono | Already in site mono stack |

### Logo

Custom **HSI** wordmark + restrained connected-node symbol.  
**Avoid:** DNA helices, brains, robots, generic glowing network spheres.

### Visual language

Source-to-claim relationships, mechanism diagrams, tissue/cellular networks, evidence context cards, scientific decision trails. Illustrative comps must be labelled; never show invented confidence percentages.

---

## Public website architecture (target IA)

Preserve product architecture; organise the **public** site around researcher value.

| Target path | Purpose | Primary CTA | Production mapping today |
| --- | --- | --- | --- |
| `/` | Vision + product value | Join Research Beta → `/welcome` | Live (`HomeLanding`) |
| `/platform` | Connected investigation workflow | Explore Platform | **Retired** → `/how-it-works` until a new page is approved |
| `/science` | Six biological domains | Explore Domains | Top-level retired → `/knowledge-graph`. Department URLs (e.g. `/departments/immunology`) **redirect** to `/research/knowledge-graph?department=…` filtered views — not standalone public department sites. Stage 1 comps may prototype domain cards; production standalone department pages are **out of scope** until approved |
| `/researchers` | Research use cases | Apply for Beta | **Missing** — Stage 1 prototype only until routed |
| `/biotech` | R&D evidence assessment | Discuss a Pilot | **Missing** — Stage 1 prototype only |
| `/validation` | Evidence quality / evaluation | View Methodology | **No production `/validation` route.** Interim destination for methodology/governance: live **`/trust`**. Do **not** use `/research/validation` (synthetic lab). Stage 1 may prototype `/validation` comps that map content from `/trust` |
| `/about` | Mission, principles, verified team | Contact | Live |
| `/contact` | Genuine enquiries | Submit Enquiry | Live public route (honesty: no invent undelivered mail) — **not** in primary header nav |

**Homepage pattern:** dark scientific hero → light editorial sections.  
**Authenticated workbench:** lighter, denser canvas; dark sidebar; clear scientific status indicators.

**Live primary header nav** ([`PRIMARY_NAV_LINKS`](../../site/src/lib/primaryNav.ts)): `/`, `/how-it-works`, `/knowledge-graph`, `/trust`, `/about`.  
**Also indexed public routes** ([`PUBLIC_MARKETING_PATHS`](../../site/src/lib/primaryNav.ts)): the above **plus** `/contact` (footer / CTA destinations, not a primary-nav item).

---

## Presentation labels for existing architecture

These rename **how we talk** about existing concepts — not rebuild services.

| Presentation label | Maps to (today) |
| --- | --- |
| HSI Platform — Connected Scientific Intelligence | Public product surface + research app shell |
| Research Workbench | Investigations, briefs, researcher home |
| Evidence Intelligence | Sources, claims, provenance, context passport |
| Mechanism Explorer | Knowledge graph / department explorer |
| Scientific Verification | Evidence assessment, uncertainty, review queues |
| Shared foundation | Knowledge graph · provenance · orchestration · scientific data · governance |

### Six domains (marketing taxonomy in this brief)

1. Immunology & Inflammation  
2. Neuroscience  
3. Microbiome & Metabolism  
4. Genomics & Multi-omics  
5. Organ & Tissue Biology  
6. Disease Mechanisms  

**Open decision (owner):** live graph departments today are Immunology, Neuroscience, Microbiome, Metabolism, Genomics & Multi-omics, Human Physiology ([`site/src/lib/departments.ts`](../../site/src/lib/departments.ts)). Stage 1 marketing may use the brief labels as **presentation copy**. Do **not** rename graph tags, department slugs or seed data until an explicit ADR + migration. Exploratory comps that split microbiome/metabolism differently or invent “Human Systems Intelligence” are non-binding.

---

## Three-stage implementation

### Stage 1 — Brand and marketing experience (Lovable + docs)

- Logo system, design tokens, homepage, eight public page comps, responsive components in **Lovable** (or equivalent prototype).  
- Realistic scientific examples; label illustrative vs verified.  
- **In-repo:** this doctrine + [`hsi-brand-tokens.v1.json`](./hsi-brand-tokens.v1.json). No production route explosion until comps are approved.

### Stage 2 — Product interface alignment

- Apply the same visual language to Research Workbench, Evidence Intelligence, Mechanism Explorer and Scientific Verification UIs.  
- Preserve APIs, schemas, permissions, verification rules and scientific workflows.

### Stage 3 — Quality and release

- A11y, mobile, navigation, terminology, factual claims, analytics, contact security.  
- Deploy to production only after prototype review and no functional regression.

---

## Non-negotiable constraints

- Do **not** rename repositories, migrate databases, replace authentication, modify scientific evaluation thresholds, or create new AI agents as part of the rebrand.  
- Do **not** reintroduce a four-product public portfolio.  
- Do **not** wire Lovable/Akeno marketing into product code ([`../VISION_REPO_ALIGNMENT.md`](../VISION_REPO_ALIGNMENT.md)).  
- Do **not** invent MoU, Gate C auto-approve, live CDS/PHI, or accuracy claims.  
- Objective: more credible, understandable, usable — not a parallel engineering programme.

---

## Next deliverable

Two coordinated designs in the Lovable prototype:

1. Premium public homepage (dark hero + light editorial)  
2. Authenticated scientific investigation workspace (dense light canvas + dark sidebar)

Evaluate brand fit across **marketing and product** before touching production skins beyond token adoption.

**Desired result:** HSI looks like a serious scientific intelligence company on the website and feels like a precise, trustworthy research instrument inside the product.

---

## Related docs

- [`../strategy/HSI_DEFINITIVE_PRODUCT_VISION.md`](../strategy/HSI_DEFINITIVE_PRODUCT_VISION.md) — frozen product north star (18 Nov 2026)  
- [`HSI_HOMEPAGE_DESIGN_SYSTEM.md`](./HSI_HOMEPAGE_DESIGN_SYSTEM.md) — **superseded for Stage 1 comps**; ivory/burgundy kept only as production interim until cutover  
- [`HSI_PUBLIC_SITE_IA_AND_PAGE_SYSTEM.md`](./HSI_PUBLIC_SITE_IA_AND_PAGE_SYSTEM.md) — **historical; production mappings superseded** by this brief’s route table until rewritten  
- [`../strategy/HSI_UNIFIED_DESIGN_SYSTEM.md`](../strategy/HSI_UNIFIED_DESIGN_SYSTEM.md) — exploration; defer to this brief for premium redesign  
- [`../strategy/HSI_YC_COMPETITIVE_LANDSCAPE_2026-11-18.md`](../strategy/HSI_YC_COMPETITIVE_LANDSCAPE_2026-11-18.md) — competitive sharpening for messaging
