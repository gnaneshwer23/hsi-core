# HSI design system: scientific platform (Causaly / Benchling / Alta craft bar)

Applies to the indexed public landings (`/`, `/how-it-works`, `/knowledge-graph`, audience pages, `/trust`, `/about`, `/contact`), onboarding (`/welcome`) and shared public chrome. PRODUCT.md owns product truth; this file owns the visual decisions. Replaces the earlier “quiet laboratory” pastel direction (user reject, 20 November 2026).

## Idea
A Causaly/Benchling-class scientific platform site raised with Alta’s craft disciplines: cool near-white ground, deep navy ink, one electric indigo accent, typography-led first viewports, and a dense, chrome-framed product proof in the first screen. Not a pastel marketing site, not a burgundy Stage-2 theme, not dark-purple inset hero cards. Do not copy Alta’s GTM product claims, smileys, or branding.

Craft bar references: [Causaly Platform](https://www.causaly.com/ai-platform/platform), [Benchling](https://www.benchling.com/), [Alta](https://www.altahq.com/b).

## Tokens
| Role | Value |
|---|---|
| Ground (public) | `#F4F5F8` with soft indigo wash `#F6F5FC` / `#EEEBFF` in hero corners |
| Ink / body / muted | `#101F33` / `#2B3A50` / `#556B84` (muted ≥ 4.5:1 on white/ground) |
| Accent | `#3C1FFA` (ink `#2A14C9`) |
| Line | `#D4DFE4` |
| Product frame | white panels, 12–14px radius, layered hairline + soft navy shadow, chrome title bar |
| Close / open bands | solid navy `#101F33` (no purple gradient) |
| Radius | 8px CTAs; 10px controls; 14–16px product frames; avoid pill-everything |
| Type | Host Grotesk Variable only. Brand line 550 / claim 650, tracking −0.03 to −0.035em. Body ~17–18px, 1.6 |
| Shadow | offset + soft blur, navy-tinted (`0 20px 48px rgba(16,31,51,.12)`); primary CTA soft indigo lift |

Files: `site/src/styles/premium-public.css` (`.pg-*`), `premium-hsi.css` (Trust/About), `stage2-landing.css` (audience landings + nav CTA), `research-public.css` (chrome tokens).

## Alta craft disciplines (borrowed, not branded)
- Denser first viewport: tighter hero padding, product proof immediately under/beside copy.
- Committed product chrome: title bar, honesty badge, layered frame — not an empty rounded card.
- Sharper type hierarchy: lighter brand signal, heavier claim line.
- Stronger CTA geometry: 8px radius, fuller horizontal padding, soft lift on primary.
- Spacing rhythm: tight groups, generous section separation.
- Soft indigo corner wash only — no decorative grid fields, spheres or smileys.

## Rules
- Brand name is a hero-level signal on the homepage, not only nav text.
- First viewport: brand, one headline, one lead, one CTA group, one product object (live graph or investigation chrome). No stat strips, pill clusters or eyebrow kickers.
- No eyebrows / section kickers. No gradient text. No side-stripe borders. No mint/peach/lavender meaning tiles as page structure.
- Numbered lists only where sequence carries meaning (investigation path, access steps).
- Maturity chips stay factual (Available / Restricted / Demonstration / Planned).
- Honesty labels stay on every surface. Agents are not named on landings.
- 44px touch targets, visible focus (3px indigo), readable at 320px; respect `prefers-reduced-motion`.
