# HSI design system: scientific platform (Causaly / Benchling craft bar)

Applies to the indexed public landings (`/`, `/how-it-works`, `/knowledge-graph`, audience pages, `/trust`, `/about`, `/contact`), onboarding (`/welcome`) and shared public chrome. PRODUCT.md owns product truth; this file owns the visual decisions. Replaces the earlier “quiet laboratory” pastel direction (user reject, 20 November 2026).

## Idea
A Causaly/Benchling-class scientific platform site: cool near-white ground, deep navy ink, one electric indigo accent, typography-led first viewports, and the live product (published graph, investigation path) as proof. Not a pastel marketing site, not a burgundy Stage-2 theme, not dark-purple inset hero cards.

Craft bar references: [Causaly Platform](https://www.causaly.com/ai-platform/platform), [Benchling](https://www.benchling.com/).

## Tokens
| Role | Value |
|---|---|
| Ground (public) | `#F4F5F8` with soft indigo wash `#F6F5FC` / `#EEEBFF` in hero corners |
| Ink / body / muted | `#101F33` / `#2B3A50` / `#687E9B` (body ≥ 4.5:1 on ground) |
| Accent | `#3C1FFA` (ink `#2A14C9`) |
| Line | `#D4DFE4` |
| Product frame | white panels, 12–16px radius, soft navy shadow |
| Close / open bands | solid navy `#101F33` (no purple gradient) |
| Radius | 10px controls and CTAs; 16–20px product frames; avoid pill-everything |
| Type | Host Grotesk Variable only. Display 650, tracking −0.03 to −0.035em. Body ~17–18px, 1.65 |
| Shadow | offset + soft blur, navy-tinted (`0 24px 60px rgba(16,31,51,.1)`) |

Files: `site/src/styles/premium-public.css` (`.pg-*`), `premium-hsi.css` (Trust/About), `stage2-landing.css` (audience landings + nav CTA), `research-public.css` (chrome tokens).

## Rules
- Brand name is a hero-level signal on the homepage, not only nav text.
- First viewport: brand, one headline, one lead, one CTA group, one product object (live graph). No stat strips, pill clusters or eyebrow kickers.
- No eyebrows / section kickers. No gradient text. No side-stripe borders. No mint/peach/lavender meaning tiles as page structure.
- Numbered lists only where sequence carries meaning (investigation path, access steps).
- Maturity chips stay factual (Available / Restricted / Demonstration / Planned).
- Honesty labels stay on every surface. Agents are not named on landings.
- 44px touch targets, visible focus (3px indigo), readable at 320px; respect `prefers-reduced-motion`.
