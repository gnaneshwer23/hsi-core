# HSI design system: "quiet laboratory"

Applies to the six public pages, onboarding (`/welcome`) and the researcher app (`/research/*`). PRODUCT.md owns product truth; this file owns the visual decisions. Replaces the earlier "Figure 1" homepage direction.

## Idea
A calm instrument for scientists, not a marketing site. Pale cool paper, deep ink, one indigo accent, and soft pastel tints that carry meaning (mint, lavender, peach, sky). The knowledge graph is the hero object: it is drawn live from the published snapshot, never mocked. References studied: Causaly and Benchling (confident type, one accent), Owkin and Oxford BioTherapeutics (quiet ground, numbered approach lists), and the supplied school and project dashboards (glass sidebar, white active pill, pastel metric cards, calendar).

## Tokens
| Role | Value |
|---|---|
| Ground (public) | `#f3f5f9`; app ground is a soft lavender and mint wash over `#eef1f7` |
| Ink / body / muted | `#0f1b2d` / `#38455a` / `#566377` (all ≥ 4.5:1 on ground and white) |
| Accent | `#5240bd` (ink `#3d2f93`) |
| Tints (fill / ink) | mint `#e0f3ea` / `#0d6b50` · lavender `#ebe7fb` / `#43378f` · peach `#fde9da` / `#9a4a13` · sky `#e0edf9` / `#1f568f` |
| Navy band | `linear-gradient(135deg,#101c33,#2a2468)` |
| Radius | 24 to 40 on panels, 999 on buttons and chips, 14 to 16 on controls |
| Type | Host Grotesk Variable only. Display 650, tracking −0.03 to −0.035em, balanced wrapping, max 68px. Body 17 to 19px, 1.65 |
| Shadow | offset plus soft blur, tinted violet (`0 30px 70px rgba(53,45,110,.1)`) |

Files: `site/src/styles/premium-public.css` (`.pg-*`), `premium-hsi.css` (shared Trust/About components), `premium-app.css` (researcher app, `.pm-*`).

## Rules
- Tints mean something. Mint is evidence present, peach is a gap or caveat, lavender is the product itself, sky is the user's own work.
- Pastel tiles show numbers read from the published graph or this browser. Bars and the calendar are drawn only from real records; nothing is simulated, and the numbers are always stated in text beside them.
- No eyebrows, no gradient text, no side-stripe borders, no decorative glass. Glass is used once: the app sidebar over the tinted ground.
- Numbered lists only where order carries meaning (the research loop, the setup steps).
- One authored motion: the hero graph edges draw in once. Everything respects `prefers-reduced-motion`.
- Honesty labels stay on every surface: Research preview, candidate-only, unreviewed, synthetic, no clinical advice. Agents are not named.
- 44px touch targets, visible focus (3px accent), readable at 320px.
