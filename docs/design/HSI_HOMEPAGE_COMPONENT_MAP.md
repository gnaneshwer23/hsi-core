# HSI Homepage Component Map

**Status:** Slim homepage — tease + link; detail on destination routes.  
**Shell:** `site/src/pages/Home.tsx` + `clinical-landing.css` / `home-instrument.css`

| Section | Component | Reuses | Route / CTA targets | Notes |
|---------|-----------|--------|---------------------|-------|
| 1 Hero | `HomeHero` | `homepageAssets`, `PRODUCT_TAGLINE`, `PUBLIC_*_CTA` | `/platform`, `/contact` | Brand-first; domain chips; desktop panorama / mobile portrait |
| 2 Knowledge graph | `HomeKnowledgeGraph` | `SCIENCE_GRAPH`, `GraphVisual`, `graphExplorer` | `/science/graph`, `/science` | Interactive educational map; honesty labels; not SSc-only |
| 3 Data→intelligence | `HomeIntelligenceFlow` | status vocabulary from `dataToDiscoveryArchitecture` | `/platform`, `/science/graph`, `/evidence-safety`, `/research`, `/technology` | Four stage cards; honest `partially_implemented` labels |
| 4 Research workspace | `HomeWorkspacePreview` → `HomeProductDemo` | curated scenarios | `#product-demo`, `/how-it-works` | Illustrative; `live_backend=false` |
| 5 Investigation workflow | `#investigation-workflow` in `Home.tsx` | step buttons | `/how-it-works` | Nine illustrative steps; detail on How it works |
| 6 Differentiation | inline in `Home.tsx` | “What makes HSI different” | — | Four pillars |
| 7 Integrity | `HomeIntegrity` | honesty pillars | `/evidence-safety`, `/research/governance` | Compact tease; no invented certifications |
| 8 Ecosystem | `HomeEcosystemProducts` | `ECOSYSTEM_PRODUCTS` | `/modules/*` | Maturity chips truthful |
| 9 Limits | inline in `Home.tsx` | brief “does not” list | — | Required trust copy |
| 10 Access | `HomeAccess` | `PUBLIC_PRIMARY_CTA` | `/contact`, `/how-it-works` | Working enquiry path |

## Removed from homepage (still available on destination pages)

| Former section | Prefer instead |
|----------------|----------------|
| `HomeBiologyNetwork` | Hero domain chips + `/science` / `/science/graph` |
| `HomeDisciplineCards` | `/science`, `/research`, module routes |
| `HomeApplications` | `/solutions`, `/research`, journey entries elsewhere |

## Auth / Sign In rule

Guest **Sign In** link stays hidden until auth is product-ready (`available_and_verified`). Current registry: research access = `research_preview`; workspace = `not_currently_available`. Nav shows Account only after session.
