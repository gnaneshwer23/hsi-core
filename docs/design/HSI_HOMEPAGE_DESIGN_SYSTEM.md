# HSI Homepage Design System

**Status:** Skeleton (PR1) — tokens and section map; visual implementation follows in PR2–PR4.  
**Production:** https://www.humansuperintelligence.tech/  
**Governing vision:** [`../strategy/HSI_VISION.md`](../strategy/HSI_VISION.md)  
**Companion:** [`HSI_HOMEPAGE_COMPONENT_MAP.md`](./HSI_HOMEPAGE_COMPONENT_MAP.md) · Public IA: [`HSI_PUBLIC_SITE_IA_AND_PAGE_SYSTEM.md`](./HSI_PUBLIC_SITE_IA_AND_PAGE_SYSTEM.md)

## Principle

Premium biomedical research instrument — warm ivory surfaces, restrained burgundy selection, Host Grotesk Variable. Not purple-glow AI cliché, not newspaper broadsheet, not fabricated metrics.

## Palette

| Role | Token | Hex |
|------|-------|-----|
| Ivory page | `--hsi-ivory` / `--hsi-page` | `#FAF8F5` |
| Soft cream | `--hsi-cream` | `#FAECDD` |
| Light lavender | `--hsi-lavender` | `#E8D8E8` |
| Biomedical burgundy | `--hsi-burgundy-deep` | `#5E0808` |
| Scientific red | `--hsi-burgundy` | `#BD1C1D` |
| Deep ink | `--hsi-ink` | `#162331` |
| White surface | `--hsi-surface` | `#FFFFFF` |

Burgundy/red: primary actions, selected domains, active connections — never alone for error or clinical risk. Evidence status colours remain a separate semantic system.

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
- Sign In chrome only when auth is product-ready; Request Research Access always real (`/contact`).  
- Preserve Vercel, Neon red-wave, research services, existing routes.

## Inspiration (not copies)

Nuclara / Regenetix / biotech Dribbble shots — atmosphere and craft only.
