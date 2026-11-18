# HSI public site — IA and page system

**Status:** **HISTORICAL / SUPERSEDED for production route mapping** (18 Nov 2026).  
**Authoritative Stage 1 IA + live route map:** [`HSI_PREMIUM_BRAND_IDENTITY_REDESIGN_2026-11-18.md`](./HSI_PREMIUM_BRAND_IDENTITY_REDESIGN_2026-11-18.md).  
**Vision freeze:** [`../strategy/HSI_DEFINITIVE_PRODUCT_VISION.md`](../strategy/HSI_DEFINITIVE_PRODUCT_VISION.md).  
**Do not** treat tables below that mark `/platform`, `/modules`, `/research`, or `/science` as “Marketing live” as current production truth — those paths redirect or are retired in `App.tsx`.  
**Production:** https://www.humansuperintelligence.tech/  
**Visual system (Stage 1):** [`hsi-brand-tokens.v1.json`](./hsi-brand-tokens.v1.json) — not ivory/burgundy.  
**CTAs:** `site/src/lib/ctaPolicy.ts` · Nav: `site/src/lib/primaryNav.ts`

## Principle

One coherent journey. Honesty labels and real destinations only. Do not invent capabilities, metrics, certs, Gate C auto-approve, live CDS, or PHI surfaces.

## Primary journey (header)

| Order | Path | Purpose | Primary CTA | Status |
|-------|------|---------|-------------|--------|
| 0 | `/` | Premium scientific homepage | Explore platform → `/platform`; Request access → `/contact` | Live premium |
| 1 | `/platform` | Shared research technology & ecosystem map | Request access → `/contact`; Modules → `/modules` | Marketing live |
| 2 | `/research` | Research investigation narrative | Request access → `/contact`; How it works → `/how-it-works` | Marketing live |
| 3 | `/modules` | Four-product ecosystem overview | Product deep-links; Platform → `/platform` | Marketing live |
| 4 | `/science` | Educational biology entry | Body explorer → `/science/body`; Research → `/research` | Marketing live |
| 5 | `/how-it-works` | Investigation workflow explanation | Request access → `/contact`; Research → `/research` | Marketing live |

## Secondary journey (More + footer Information)

| Path | Purpose | Primary CTA | Inbound | Outbound |
|------|---------|-------------|---------|----------|
| `/solutions` | Audience perspectives | Links into research / evidence / platform / Aksh | Nav More, homepage applications | `/research`, `/evidence-safety`, `/platform`, `/modules/aksh-health` |
| `/technology` | Architecture & NEXUS narrative | Platform / science / modules | Nav More, footer | `/platform`, `/science`, `/modules/*`, `#sources` |
| `/evidence-safety` | Evidence states & research boundary | How it works / contact | Nav, integrity section, footer | `/how-it-works`, `/contact`, `/research` |
| `/pricing` | Access options (not commercial tiers) | Science explore / contact / platform | Nav More | `/science`, `/contact`, `/platform` |
| `/contact` | Research access entry | Sign up / sign in (when ready); account check | Primary CTA everywhere | `/sign-up`, `/sign-in`, `/research/account`, `/evidence-safety` |

## Module pages

| Path | Purpose | Primary CTA | Notes |
|------|---------|-------------|-------|
| `/modules/aksh-health` | Aksh Health product story | External Aksh URL; Modules | Separate product DB; no PHI into HSI |
| `/modules/clinical` | HSI Clinical (in development) | Modules / platform | Illustrative; no live hospital |
| `/modules/isi` | ISI Research | External ISI; Research | Separate product; HSI consume only |
| `/modules/trials` | HSI Trials (planned) | Modules / evidence | No live matching / enrolment |

Redirects preserved: `/products` → `/modules`, `/for-*` → `/modules/*`, `/akeno` → `/modules/clinical`.

## Supporting public destinations

| Path | Role in journey | Chrome priority |
|------|-----------------|-----------------|
| `/demo` | Illustrative multi-step walkthrough | Link as “Illustrative walkthrough”; avoid “demo/synthetic” wording on marketing bodies |
| `/status` | Honesty / maturity source of truth | Secondary; not primary nav |
| `/community` | Local discussion rehearsal | Explicit “not published” |
| Science/research tools (`/science/*`, `/research/*`) | Governed or educational tools | ResearchNavigation where already wired; preserve query context |

## Shared page chrome (implementation)

Components: `site/src/components/marketing/MarketingPage.tsx`

| Primitive | Role |
|-----------|------|
| `MarketingPage` | Page root (`mp-page` + optional `xp-page` bridge) |
| `MarketingHero` | Eyebrow, title, lead, actions, optional artwork |
| `MarketingSection` | Numbered chapter rhythm matching homepage chapters |
| `MarketingCTA` | Closing band → contact / platform / how-it-works |
| `MarketingJourney` | Related-page strip (inbound/outbound links) |

Shell: public marketing paths use the same premium token shell as the homepage (`home-shell` / ivory–burgundy–scientific). Account paths keep light chrome without inventing Sign In when not product-ready.

## Cross-link map (must stay real)

```
Home ⇄ Platform ⇄ Technology
Home → How it works → Research → Evidence & safety → Contact
Home → Science → Body / Graph → Research
Home → Modules → Aksh / Clinical / ISI / Trials → Platform
Platform → Modules / Science / How it works / Contact
Any marketing page → Contact (Research access: browser draft, then an administrator grant)
```

Research context query keys (`scenario`, `panel`, `domain`, `investigation`, `next`) stay preserved where already used (`researchContext.ts`).

## Explicit non-goals

- Rebuilding research backends, Neon wiring, or Gate C behaviour  
- Fabricated study counts, certifications, or MoUs  
- Live CDS / PHI / EHR write-back on this site  
- Promoting internal engineering routes (`/gateway`, `/curator`, `/systems`, …) from primary marketing chrome  
- Sign In in primary chrome unless auth session is product-ready (Account when signed in)

## Acceptance checklist

- [ ] Every primary/secondary nav destination has a coherent hero + section rhythm + closing CTA  
- [ ] Related-page strip present on key marketing pages  
- [ ] Homepage CTAs land on restructured pages with params preserved where applicable  
- [ ] Honesty tests + focused site tsc / unit tests pass  
- [ ] No purple-glow / newspaper / card-cliché redesign; extend homepage tokens only  
