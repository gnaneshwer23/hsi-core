# Capability → data-source matrix

**Date:** 2026-11-03  
**Rule:** No fake live APIs. Every interactive public/product feature must declare one of: **live service** | **versioned artifact** | **static fixture** | **planned**.

| Capability / UI | Route / component | Data source class | Concrete source | Notes |
|-----------------|-------------------|-------------------|-----------------|-------|
| Platform fabric (connected biology) | `/`, `/platform` · `PlatformEngine` | static fixture | In-component copy + SVG | Illustrative architecture narrative |
| Four-product ecosystem cards | `/`, `/products` · `EcosystemGrid` | static fixture | `productMaturity.ts` | Maturity chips are founder-signed labels, not telemetry |
| Research workflow demo (homepage) | `/` · `DiscoveryWorkbench` | static fixture | In-component staged copy | Marketing demo — not Discovery Centre packs |
| Evidence explorer lab | `/explore` · `EvidenceExplorer` | static fixture | In-component case nodes | Demo investigation UX |
| Science educational atlas | `/science` · `ScienceLanding` | static fixture | Educational biology copy | **Not** clinical product; not live KG |
| How It Works personas | `/how-it-works` | static fixture | Landing component | Persona explainer |
| ISI Research landing | `/for-isi` | planned / optional live link | `VITE_ISI_APP_URL` when set; else marketing | HTTPS or localhost only |
| Aksh Health landing | `/for-aksh` | planned / optional live link | `VITE_AKSH_APP_URL` when set | Demo panel is fictional preview |
| HSI Trials landing | `/for-trials` | static fixture | `TrialsLanding` scenarios | Never eligibility; product chip Planned |
| Discovery Centre | `/discovery` | **versioned artifact** | `public/discovery/*.json` from `bun run outputs` | Graded packs; honesty banners; not CDS |
| Research comparison | `/discovery` · `ResearchComparison` | versioned artifact | Pack / brief helpers | Static seed comparison |
| Sources registry UI | `/sources` | versioned artifact | `/research/source-registry.json` | Published registry snapshot |
| Evidence workspace | `/evidence` | versioned artifact | Pack-backed rows via site loaders | Research plane |
| Status / Roadmap maturity | `/status`, `/roadmap` | static fixture | `productMaturity.ts` | Human-updated ledger |
| Clinical timeline | `/clinical-timeline` | static fixture | `listSyntheticTimelineFixtures` | `syntheticOnly`; no live EMIS |
| Trials criteria demo | `/trials-criteria` | static fixture | Demo trial / patient stubs | `confirmedEligible=false` |
| Aksh↔HSI gateway | `/gateway` | static fixture | `decideGatewayRequest` stubs | PHI→research denied |
| Curator checklist | `/curator` | static fixture / local patterns | Gate C checklist patterns | Engineering |
| Systems / Alignment / Docs | `/systems`, `/alignment`, `/docs` | static fixture | Markdown-backed / in-app copy | Engineering / public docs index |
| Akeno consumer | `/akeno` | planned | Stub UI | Explicit ask + Stage 3 gates — not a public CTA |
| Live literature retrieval API | — | **planned** | — | Not shipped; do not imply |
| Live hospital / FHIR SoT | — | **planned** | — | Clinical timeline notes only |
| Live trial registry matcher | — | **planned** | — | Product remains Planned |
| Gate C production approve | — | **not offered** | Human-only | No auto-approve |
| PHI in research substrate | — | **not offered** | Boundary enforced | CDS/PHI non-goal |

## Honesty labels used on surfaces

- **Available** — usable today within stated limits  
- **In development** — fixture or partial wiring visible  
- **Planned** — marketing or roadmap only  

Update this matrix when a capability changes class. Prefer linking to `productMaturity.ts` over inventing new chip vocabulary.
