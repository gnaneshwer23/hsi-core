# HSI Homepage Component Map

**Status:** Skeleton (PR1). Updated as sections land in PR2–PR4.

| Section | Planned component | Reuses | Route / CTA targets | Notes |
|---------|-------------------|--------|---------------------|-------|
| 1 Hero | `HomeHero` (new in PR2) | `homepageAssets`, `PUBLIC_*_CTA` | `/platform`, `/contact` | Brand-first; responsive picture |
| 2 Biology network | `HomeBiologyNetwork` | `HOME_DOMAINS`, `researchContext` | domain `.to` + demo href | 8-domain taxonomy + deeper ontology labels; no fabricated edges |
| 3 Data→intelligence | `HomeIntelligenceFlow` | `DataToDiscoveryArchitecture` / `dataToDiscoveryArchitecture` | `/technology`, workbench links | Honesty statuses from registry |
| 4 Research workspace | `HomeWorkspacePreview` | `HomeProductDemo`, curated fixtures | `/demo`, `/research/*` | Public illustrative only |
| 5 Domain cards | `HomeDomainCards` | domain registry | science/research routes | Imagery optional; no fake coverage |
| 6 Investigation workflow | `HomeInvestigationWorkflow` | existing STEPS + `how-it-works` | `#product-demo`, `/how-it-works` | Context-preserving links |
| 7 Integrity | `HomeIntegrity` | honesty copy from brief | `/evidence-safety` | No invented certifications |
| 8 Applications | `HomeApplications` | `CROSS_DOMAIN_JOURNEY_ENTRIES` | explore/evidence/access | Cross-domain; SSc not sole focus |
| 9 Ecosystem | `HomeEcosystemProducts` | `ECOSYSTEM_PRODUCTS` | `/modules/*` | Maturity chips truthful |
| 10 Access | `HomeAccess` | `AccessIntentPanel` patterns | `/contact`, `/how-it-works` | Working enquiry path |

## Existing inventory (pre-redesign)

| Path | Role |
|------|------|
| `site/src/pages/Home.tsx` | Current colour-chapter homepage |
| `site/src/styles/clinical-landing.css` | Home shell + chapters |
| `site/src/components/editorial/homeDomains.ts` | Eight-domain registry |
| `site/src/components/editorial/HomeEcosystem.tsx` | Domain explorer (URL `?domain=`) |
| `site/src/components/editorial/HomeProductDemo.tsx` | Illustrative workbench |
| `site/src/components/DataToDiscoveryArchitecture.tsx` | Technology storytelling |
| `site/src/lib/ctaPolicy.ts` | Public CTAs |
| `site/src/lib/productMaturity.ts` | Four-product chips |
| `site/src/lib/researchContext.ts` | Context-preserving nav |
| `site/src/components/Nav.tsx` | Chrome; Account only when session |

## Auth / Sign In rule

Guest **Sign In** link stays hidden until auth is product-ready (`available_and_verified`). Current registry: research access = `research_preview`; workspace = `not_currently_available`. Nav shows Account only after session.
