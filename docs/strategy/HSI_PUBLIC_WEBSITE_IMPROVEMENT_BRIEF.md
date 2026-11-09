# HSI public website improvement brief (Codex-ready)

**Status:** Approved to implement with the additions in this document  
**Audience:** Engineering / Codex agents working in `gnaneshwer23/hsi-core`  
**Live origin:** https://www.humansuperintelligence.tech/  
**Companions:** [`HSI_PUBLIC_WEBSITE_SPECIFICATION.md`](./HSI_PUBLIC_WEBSITE_SPECIFICATION.md) · [`../HSI_PUBLIC_WEBSITE_EDITORIAL_REFRESH.md`](../HSI_PUBLIC_WEBSITE_EDITORIAL_REFRESH.md) · [`../engineering/HSI_LIVE_WEBSITE_AUDIT.md`](../engineering/HSI_LIVE_WEBSITE_AUDIT.md) · eng register [`../../operations/capability-register/capability-register.v1.json`](../../operations/capability-register/capability-register.v1.json)

---

## Binding instruction

> **Do not let a polished website create the impression of scientific capability that the backend does not yet provide.**

Never blur:

```text
A beautiful research vision
A working product demo
A live scientific investigation
Validated scientific knowledge
```

Do **not** rebuild the platform. Do **not** invent Gate C auto-approve, MoU, CDS/PHI, or Neon autumn-snow wiring. Do **not** treat fixture/demo data as live science.

---

## Primary acceptance test

A researcher can understand HSI’s scientific value within seconds, inspect a transparent research workflow, and distinguish real functionality from future capabilities.

Within the first viewport + one scroll, the site must make clear:

```text
Who HSI is for
What it does today
How the workflow works
Where evidence comes from
What remains uncertain
What is not yet available
```

---

## Non-negotiable claims ban

The site must **not** claim, imply, or visually suggest:

- Clinical effectiveness or treatment recommendations
- Autonomous discovery that replaces scientists
- Institutional partnerships without a real MoU
- Production scientific readiness without evidence
- Gate C / scientific auto-approve
- Patient-specific clinical advice
- Trial eligibility from association evidence
- That a rendered React surface equals a verified backend capability

---

## Phase 0 — Audits (required before homepage redesign)

Produce these files (fill every row; empty templates are not acceptance):

| Output | Path |
|--------|------|
| Capability | `docs/audits/WEBSITE_CAPABILITY_AUDIT.md` |
| SEO metadata | `docs/audits/SEO_METADATA_AUDIT.md` |
| Accessibility | `docs/audits/ACCESSIBILITY_AUDIT.md` |
| CTA / navigation | `docs/audits/CTA_AND_NAVIGATION_AUDIT.md` |
| Research demonstration | `docs/audits/RESEARCH_DEMONSTRATION_AUDIT.md` |

Each audit row must include:

```text
Route
Component
Current behaviour
Backend dependency
Live or illustrative status
Evidence
Issue
Required change
Acceptance test
Owner
```

Also capture **visual regression baselines** before changing the homepage:

| Viewport | Width |
|----------|-------|
| Desktop | 1440px, 1920px |
| Tablet | 820px |
| Mobile | 390px |

Store under `docs/audits/baselines/website-YYYY-MM-DD/`.

---

## Capability-status data source (binding)

**“Available and verified” must come from a machine-readable registry, not from whether a React component renders.**

### Source of truth

1. Engineering register (existing): `operations/capability-register/capability-register.v1.json`
2. **Public projection (required):** `docs/capability-status.json` (consumed by the site build; copy or import into `site/` as needed)

Public UI **must** render status from `docs/capability-status.json`. A frontend component must never imply availability merely by existing.

### Public status vocabulary

| Status | Meaning |
|--------|---------|
| `available_and_verified` | Public-facing path + backend verified by recorded method; **not** scientific gold |
| `research_preview` | Reachable for authorised research / exploration; limits and uncertainty labelled |
| `in_development` | Specified or partially built; not a public promise of usefulness |
| `not_currently_available` | Must not be CTA’d as usable |

### Required fields per capability

```text
capability_id
public_label
status
evidence
route_or_component
backend_dependency
data_dependency
human_review_dependency
last_verified_at
verification_method
owner
```

### Mapping from eng register → public status

| Eng status | Typical public status |
|------------|------------------------|
| `scientifically_validated` | Never auto-promote; founder + science owner only |
| `connected` + live probe pass | `research_preview` (default) or `available_and_verified` only with verification record |
| `implemented` only | `in_development` or `research_preview` if explicitly scoped |
| `synthetic_only` / `blocked` | `not_currently_available` for capability claims |
| `planned` | `in_development` |

Honesty flags from the eng register (`writesEnabledClaimed`, `scientificallyValidatedClaimed`, etc.) **override** optimistic UI.

---

## Research demonstration contract (binding)

If live retrieval, graph reasoning, or brief generation is unavailable, **do not** imply a live investigation.

Persistent labels (required when `live_backend=false`):

```text
Illustrative research demonstration
Not a live investigation
Uses curated example data
Evidence and workflow are illustrative
```

Allowed demonstration modes (exactly one):

```text
live_backend_execution
cached_demonstration
curated_example
synthetic_data
future_capability
```

Canonical example contract: [`../research-demonstrations/demo_ssc_fibrosis_001.json`](../research-demonstrations/demo_ssc_fibrosis_001.json)

The demo may show Question → biological context → evidence → contradictions → gaps → research brief, but each stage must declare its mode.

---

## “What HSI does not do” (required copy)

Must appear on the **homepage** and the **Science / Evidence & safety (trust)** surface.

```text
HSI does not:
- Diagnose disease
- Recommend treatment
- Replace scientific judgement
- Validate therapeutic targets
- Guarantee research outcomes
- Automatically approve scientific claims
- Provide patient-specific clinical advice
- Infer eligibility from association evidence
```

Aksh Health remains a **separately governed** care/product plane — never presented as HSI clinical CDS.

---

## CTA rule (automated from deployment state)

Derive primary CTA from capability status + auth/workspace probes (not hard-coded marketing preference):

```text
If authenticated workspace is available_and_verified or research_preview and useful:
    primary CTA = Explore the Platform  → real public platform route

If workspace requires approval / grant:
    primary CTA = Request Research Access → /contact (or equivalent working access path)

If neither is available:
    primary CTA = Request Updates / Join the Research Community
    → only if that destination is real and useful
```

**Never** show a CTA that leads to a broken, empty, or inaccessible destination. Nav “Request access” must match the same rule.

Current live default (until registry says otherwise): workspace requires approval → primary **Request Research Access** / **Research access**; secondary **Explore the platform**.

---

## Route-level verification

Do **not** accept “the homepage works” as verification.

### Canonical routes to verify (map proposed names → existing IA)

Prefer **existing** production routes. New paths only with explicit IA + `site/vercel.json` rewrites + SEO entries.

| Brief name (if used) | Existing / preferred route |
|----------------------|----------------------------|
| Home | `/` |
| How it works | `/how-it-works` |
| Platform | `/platform` |
| Research intelligence | `/research` |
| Explore biology | `/science` (+ `/explore` if retained) |
| Drug discovery | Do **not** invent; use `/solutions` or label `not_currently_available` |
| Research outcomes | `/research` workbench paths (noindex tools stay noindex) |
| Technology | `/technology` |
| Science / trust | `/science`, `/evidence-safety` |
| Applications | `/solutions` or `/products` |
| For Aksh | `/for-aksh` |
| About | Use `/platform` or add `/about` only with content owner |
| Collaborate / contact | `/contact` (+ `/pricing` for access options) |
| Privacy / terms | Add only with legal-approved copy; until then link honest placeholders without fake policies |

Also keep verifying today’s public SEO set in `site/src/lib/seo/siteSeo.ts` (`SEO_PAGES`).

### Per-route checks

```text
HTTP 200
Correct canonical URL
Unique title
Meta description
No duplicated brand prefix in <title>
No broken internal links
No console errors
Mobile layout (390 / 360 / 414 — no horizontal scroll)
Keyboard navigation
Focus visibility
Primary CTA destination is real
Analytics event where applicable (do not invent pixels)
```

---

## Performance (Phase 7)

Core Web Vitals — **Good** thresholds, 75th percentile, mobile and desktop separately:

```text
LCP ≤ 2.5 s
INP ≤ 200 ms
CLS ≤ 0.1
```

Also require:

```text
No layout shift when fonts, images, graphs, or third-party scripts load
No horizontal scroll at 360px, 390px, 414px
Primary CTA visible without excessive scrolling on mobile
Graph visualisation degrades gracefully on small screens
prefers-reduced-motion respected
```

---

## Pre-production gate (Phase 8)

Before promoting to production:

1. Vercel preview deployment inspected  
2. Correct commit SHA verified  
3. Preview routes tested  
4. Lighthouse / Core Web Vitals checked  
5. Accessibility checks passed  
6. SEO metadata checked  
7. Analytics events verified (if configured)  
8. Screenshots captured (vs baselines)  
9. Existing unit / e2e tests pass  
10. Production deployment verified after promotion  
11. Post-deployment error logs reviewed  

---

## Revised acceptance criteria

1. Every public capability displays a truthful status derived from `docs/capability-status.json`.  
2. No frontend component implies availability unless the backend capability is verified in that registry.  
3. The research demonstration is clearly labelled as live, cached, curated, synthetic, or illustrative.  
4. Every CTA leads to a real, useful destination.  
5. Every primary route has a unique title, meta description, and canonical URL.  
6. No duplicated brand prefix appears in rendered page titles.  
7. Keyboard navigation reaches every interactive element.  
8. Focus indicators are visible and not obscured.  
9. Core Web Vitals meet Good thresholds on key public routes.  
10. The deployed preview is verified before production.  
11. The production deployment is verified after release.  
12. The final report distinguishes: **marketing QA**, **engineering QA**, **scientific validation**, and **production readiness**.

---

## Implementation order (suggested)

| Phase | Work |
|-------|------|
| 0 | Audits + baselines + fill `docs/capability-status.json` from eng register + live probes |
| 1 | Homepage honesty: status chips, “does not do”, CTA rule wiring |
| 2 | Research demonstration bound to JSON contract + persistent labels |
| 3 | Science / Evidence & safety trust page alignment |
| 4 | Route SEO / a11y / link fixes from audits |
| 5 | Performance + visual regression |
| 6 | Preview verification |
| 7 | Production promotion + post-deploy checks |
| 8 | Final report: marketing vs eng vs science vs readiness |

---

## Out of scope

- Rebuilding research APIs, Neon schema, or agent orchestration  
- Claiming scientific validation or pilot GO  
- Enabling production `writesEnabled`  
- Merging Aksh/ISI product UIs into the marketing site  
- Inventing privacy/terms legal text without counsel  

---

## Success criterion (repeat)

**A researcher can understand HSI’s scientific value within seconds, inspect a transparent research workflow and distinguish real functionality from future capabilities.**
