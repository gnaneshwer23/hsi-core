# HSI Homepage Component Map

**Status:** Implemented across PR2–PR4; QA in PR5.  
**Shell:** `site/src/pages/Home.tsx` + `clinical-landing.css` / `home-instrument.css`

| Section | Component | Reuses | Route / CTA targets | Notes |
|---------|-----------|--------|---------------------|-------|
| 1 Hero | `HomeHero` | `homepageAssets`, `PRODUCT_TAGLINE`, `PUBLIC_*_CTA` | `/platform`, `/contact` | Brand-first; desktop panorama / mobile portrait |
| 2 Biology network | `HomeBiologyNetwork` | `HOME_DOMAINS`, `researchContext` | domain `.to` + `#product-demo` | 8-domain taxonomy + deeper ontology labels; no fabricated edges |
| 3 Data→intelligence | `HomeIntelligenceFlow` | status vocabulary from `dataToDiscoveryArchitecture` | `/technology`, `/research` | Honest partially_implemented labels |
| 4 Research workspace | `HomeWorkspacePreview` → `HomeProductDemo` | curated scenarios | `#product-demo`, `/how-it-works`, graph CTA | Illustrative; `live_backend=false` |
| 5 Domain cards | `HomeDisciplineCards` + `disciplineCardRegistry` | `withResearchContext` | science/research/module routes | Central registry |
| 6 Investigation workflow | `#investigation-workflow` in `Home.tsx` | step buttons | `/how-it-works`, `#product-demo` | Nine illustrative steps |
| 7 Integrity | `HomeIntegrity` | honesty pillars | `/evidence-safety`, `/research/governance` | No invented certifications |
| Differentiation | inline in `Home.tsx` | prior “What makes HSI different” | — | Retained for honesty/e2e |
| 8 Applications | `HomeApplications` | `CROSS_DOMAIN_JOURNEY_ENTRIES` | demo / explore / evidence / access | Cross-domain; SSc validation case |
| 9 Ecosystem | `HomeEcosystemProducts` | `ECOSYSTEM_PRODUCTS` | `/modules/*` | Maturity chips truthful |
| Limits | inline in `Home.tsx` | brief “does not” list | — | Required trust copy |
| 10 Access | `HomeAccess` | `PUBLIC_PRIMARY_CTA` | `/contact`, `/how-it-works` | Working enquiry path |

## Auth / Sign In rule

Guest **Sign In** link stays hidden until auth is product-ready (`available_and_verified`). Current registry: research access = `research_preview`; workspace = `not_currently_available`. Nav shows Account only after session.
