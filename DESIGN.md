# HSI design system: diagram-first scientific platform

Applies to the indexed public landings (`/`, `/how-it-works`, `/knowledge-graph`, audience pages, `/trust`, `/about`, `/contact`), onboarding (`/welcome`) and shared public chrome. PRODUCT.md owns product truth; this file owns the visual decisions. Raises the Causaly / Benchling / Alta craft bar with an owner-pinned diagram-first spine (20 November 2026).

## Idea
A cool light scientific platform site where the **numbered investigation spine** is the hero instrument — not card grids, not prose walls, not layered chrome. Causaly/Benchling material language + Alta densify, executed as process infographics. Craft references: [Causaly Platform](https://www.causaly.com/ai-platform/platform), [Benchling](https://www.benchling.com/), [Alta](https://www.altahq.com/b).

## Tokens
| Role | Value |
|---|---|
| Ground (public) | `#F4F5F8` with soft indigo / cool atmospheric washes in hero corners |
| Ink / body / muted | `#101F33` / `#2B3A50` / `#556B84` (muted ≥ 4.5:1 on white/ground) |
| Accent | `#3C1FFA` (ink `#2A14C9`) |
| Line | `#D4DFE4` |
| Flow markers | white discs, 2px indigo ring, hairline spine; emphasis fills indigo |
| Close / open bands | solid navy `#101F33` (no purple gradient) |
| Radius | 8px CTAs; 10px controls; circular flow markers; avoid pill-everything |
| Type | Host Grotesk Variable only. Brand line 550 / claim 650, tracking −0.03 to −0.038em. Body ~16–18px, 1.55–1.6 |
| Shadow | offset + soft blur, navy-tinted; primary CTA soft indigo lift; flow emphasis disc soft indigo lift |

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
- 44px touch targets, visible focus (3px indigo), readable at 320px.

## Alta craft disciplines (borrowed, not branded)
- Denser first viewport; product proof follows the spine immediately.
- Sharper type hierarchy: lighter brand signal, heavier claim line.
- Stronger CTA geometry: 8px radius, fuller horizontal padding, soft lift on primary.
- Spacing rhythm: tight groups, generous section separation.
- Soft indigo corner wash only — no decorative grid fields, spheres or smileys.
