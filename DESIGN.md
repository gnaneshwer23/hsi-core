# HSI design system: diagram-first scientific platform

Applies to the indexed public landings (`/`, `/how-it-works`, `/knowledge-graph`, audience pages, `/trust`, `/about`, `/contact`), onboarding (`/welcome`) and shared public chrome. PRODUCT.md owns product truth; this file owns the visual decisions. Raises the Causaly / Benchling / Alta craft bar with an owner-pinned diagram-first spine (20 November 2026).

## Idea
A cool light scientific platform site where the **numbered investigation spine** is the hero instrument — not card grids, not prose walls, not layered chrome. Causaly/Benchling material language + Alta densify, executed as process infographics. Craft references: [Causaly Platform](https://www.causaly.com/ai-platform/platform), [Benchling](https://www.benchling.com/), [Alta](https://www.altahq.com/b).

## Tokens
| Role | Value |
|---|---|
| Ground (public) | `#EBEBEA` with a rose wash `#D1AEAD` in hero corners |
| Ink / body / muted | `#190505` / `#190505` / `#5E0808` (muted ≥ 4.5:1 on the ground) |
| Accent | `#BD1C1D` (pressed `#5E0808`) |
| Scientific | `#106C92` focus rings; `#65CEE6` diagram wash, with `#190505` text on it |
| Rose | `#D1AEAD` lines and quiet bands |
| Flow markers | white discs, 2px burgundy ring, hairline spine; emphasis fills burgundy |
| Close / open bands | solid `#190505` |
| Radius | 8px CTAs; 10px controls; circular flow markers; avoid pill-everything |
| Type | Inter Variable for body. Red Hat Display Variable for headings. JetBrains Mono Variable for step numbers and maturity labels. |
| Shadow | offset + soft blur, ink-tinted; primary CTA uses burgundy |

Files: `site/src/styles/premium-public.css` (`.pg-*`, `.ld-flow`), `premium-hsi.css` (Trust/About), `stage2-landing.css` (audience landings + nav CTA), `research-public.css` (chrome tokens).

## Composition rules
- **First viewport (home):** brand + one claim + one lead + CTA pair + honesty microcopy + investigation flow diagram as the dominant visual. Live published graph is the **proof band immediately below**, not the hero object.
- **How it works:** full-bleed process spine under a quiet intro strip (hero style B).
- **Audience pages:** role-specific four-step flow sits in the hero as a flat figure — never inside product-chrome frames or card grids.
- No eyebrows / section kickers. No gradient text. No mint/peach/lavender meaning tiles as page structure.
- Numbered lists only where sequence carries meaning (investigation path, access steps, gates).
- Maturity chips stay factual (Available / Restricted / Demonstration / Planned); in flow footnotes they render as plain uppercase labels.
- Honesty labels stay on every surface. Agents are not named on landings. Business pre-mortem never becomes landing copy.
- Motion: spine draw + staggered node entrance; respect `prefers-reduced-motion`.
- 44px touch targets, visible focus (3px `#106C92`), readable at 320px.

## Alta craft disciplines (borrowed, not branded)
- Denser first viewport; product proof follows the spine immediately.
- Sharper type hierarchy: lighter brand signal, heavier claim line.
- Stronger CTA geometry: 8px radius, fuller horizontal padding, soft lift on primary.
- Spacing rhythm: tight groups, generous section separation.
- Soft rose corner wash only — no decorative grid fields, spheres or smileys.
