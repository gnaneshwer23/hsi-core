# HSI Homepage Design System

**Status:** **SUPERSEDED for Stage 1 marketing comps** (18 Nov 2026).  
**Use instead:** [`HSI_PREMIUM_BRAND_IDENTITY_REDESIGN_2026-11-18.md`](./HSI_PREMIUM_BRAND_IDENTITY_REDESIGN_2026-11-18.md) + [`hsi-brand-tokens.v1.json`](./hsi-brand-tokens.v1.json) (Midnight `#0B1720`, Deep teal `#15343B`, Signal mint `#58C6B6`, Cloud `#F5F8F7`, Coral `#E47B72`).  
**Production interim:** Live site may still show Host Grotesk + older skins until Stage 3 cutover — do **not** design new Lovable comps from the ivory/burgundy table below.  
**Governing vision:** [`../strategy/HSI_DEFINITIVE_PRODUCT_VISION.md`](../strategy/HSI_DEFINITIVE_PRODUCT_VISION.md) · [`../strategy/HSI_VISION.md`](../strategy/HSI_VISION.md)  
**Companion:** [`HSI_HOMEPAGE_COMPONENT_MAP.md`](./HSI_HOMEPAGE_COMPONENT_MAP.md) · Public IA (historical): [`HSI_PUBLIC_SITE_IA_AND_PAGE_SYSTEM.md`](./HSI_PUBLIC_SITE_IA_AND_PAGE_SYSTEM.md)

## Principle

Premium biomedical research instrument — precise, calm, evidence-first. Not purple-glow AI cliché, not newspaper broadsheet, not fabricated metrics.

## Palette (archived — do not use for Stage 1 comps)

| Role | Token | Hex | Note |
|------|-------|-----|------|
| Ivory page | `--hsi-ivory` / `--hsi-page` | `#FAF8F5` | Archived |
| Soft cream | `--hsi-cream` | `#FAECDD` | Archived |
| Light lavender | `--hsi-lavender` | `#E8D8E8` | Archived |
| Biomedical burgundy | `--hsi-burgundy-deep` | `#5E0808` | Archived |
| Scientific red | `--hsi-burgundy` | `#BD1C1D` | Archived |
| Deep ink | `--hsi-ink` | `#162331` | Archived |
| White surface | `--hsi-surface` | `#FFFFFF` | Archived |

**Stage 1 chrome:** Midnight / Deep teal surfaces, Cloud reading panels, Signal mint actions, Coral for conflict/uncertainty only — see brand tokens JSON.

## Typography

- Face: Host Grotesk Variable (e2e-locked).
- Hero brand: largest signal on first viewport.
- Headline: editorial, balanced wrap; one job.
- Body: readable scientific prose; honesty labels at supporting size.

## Imagery

| Use | Asset path prefix | Notes |
|-----|-------------------|-------|
| Mobile hero | `/images/homepage/hero-mobile-portrait-*` | Vertical portrait; stack under copy |
| Desktop hero | `/images/homepage/hero-desktop-panorama-*` | Copy left, visual right |
| Biology network | `/images/homepage/biology-network-*` | Section 2 backdrop / figure |

Sources: `site/src/lib/homepageAssets.ts` (`<picture>` webp+jpeg). Alt text is scientific; compositions are illustrative.

## Motion

- Entrance rise on hero copy/visual (`prefers-reduced-motion: reduce` → none).
- Domain selection highlight (opacity/color only — no layout thrash).
- Workflow step press states.
- Avoid heavy scroll-jacking and horizontal page scroll.

## Section narrative (10)

1. Premium scientific hero  
2. Interconnected human biology network  
3. From scientific information to intelligence  
4. Inside the HSI Research Workspace  
5. Scientific research domains  
6. How HSI investigates a scientific question  
7. Scientific integrity and trust  
8. Research applications and outcomes  
9. Connected HSI ecosystem  
10. Research access and collaboration  

## Hard constraints

- No live CDS/PHI; fail-closed writes.  
- No fabricated evidence, certs, study counts, or MoU.  
- Sign In chrome only when auth is product-ready; Research access (`/contact`) is a browser draft plus an administrator grant, not a submitted request.  
- Preserve Vercel, Neon red-wave, research services, existing routes.

## Inspiration (not copies)

Nuclara / Regenetix / biotech Dribbble shots — atmosphere and craft only.
