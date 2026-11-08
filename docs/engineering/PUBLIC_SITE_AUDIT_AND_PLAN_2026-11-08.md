# Public site audit + implementation plan — 2026-11-08

Scope: live marketing surface `https://www.humansuperintelligence.tech` (www canonical) vs GitHub `hsi-core` (`site/`). Screenshots: [`docs/agent-artifacts/public-site-audit-2026-11-08/`](../agent-artifacts/public-site-audit-2026-11-08/). Human queue remains parked. No MoU / Gate C auto-approve / live CDS / PHI claims invented.

Companion access + SEO hardening shipped in the same PR as this doc (branch `eng/public-site-seo-access-audit`).

---

## 0. Access diagnosis (AI crawlers / ChatGPT / Perplexity)

### What we measured (2026-11-08)

| Check | Result |
| --- | --- |
| `GET` www + ChatGPT-User / GPTBot / OAI-SearchBot / PerplexityBot UAs | **HTTP 200**, full prerendered HTML, `robots: index, follow` |
| Apex `humansuperintelligence.tech` | **308 → www** (correct) |
| `/robots.txt` (pre-fix) | `Allow: /`, Disallow `/api/` + `/_pages/`, Sitemap present — **no GPTBot ban** |
| `/sitemap.xml` | 14 public canonical URLs |
| Meta robots / X-Robots-Tag on marketing HTML | Indexable; APIs/tools correctly noindex |
| Cloudflare / WAF | **None** — Vercel DNS (`ns1/ns2.vercel-dns.com`) |
| Vercel password protection | **Off** |
| Vercel SSO / Deployment Protection | **`all_except_custom_domains`** — custom `www` public; `.vercel.app` may be team-gated |
| Attack Challenge Mode | Confirmed **disabled** via Vercel API this pass |
| Firewall config | No active project firewall config found |
| UA / bot middleware in repo | **None** |
| `llms.txt` (pre-fix) | **404** |

### Likely root causes of “ChatGPT / Perplexity could not access”

No hard eng block is present on www today. Probable explanations (ordered):

1. **Earlier Deployment Protection / Attack Challenge / SSO-on-all** during a previous deploy — now cleared for custom domains; Attack Challenge explicitly off.
2. **Answer-engine soft failure** (medical-content caution, empty JS-only fetch, or citing a protected `.vercel.app` preview URL) rather than an HTTP deny from www.
3. **Missing AI-facing discovery files** (`llms.txt`, explicit GPTBot/PerplexityBot Allow) — some tools treat silence as unfriendly even when `User-agent: *` allows.

### What we changed (eng-safe)

1. Explicit `Allow` blocks in generated `robots.txt` for GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended, Applebot-Extended (still Disallow `/api/` + `/_pages/`).
2. Added static [`site/public/llms.txt`](../../site/public/llms.txt) summarising public pages + honesty boundaries.
3. Confirmed Attack Challenge Mode off; left SSO as `all_except_custom_domains` so marketing stays public while previews can stay gated.
4. SEO title/description/JSON-LD polish on public pages (no false clinical readiness).

Research APIs and auth routes remain noindex / permission-gated — marketing HTML is public; tools are not.

---

## 1. Four audit questions (verdict)

Screenshots compared to `site/src/pages/*` + shared shell. Live HTML is prerendered from the same React trees (see `docs/HSI_SEO_IMPLEMENTATION.md`).

### Q1 — Does the homepage communicate the full HSI vision?

**Partial — research vision yes; ecosystem vision incomplete above the fold.**

| Signal | Live / code |
| --- | --- |
| Evidence + biology + human review | Strong hero + workflow sections (`Home.tsx` / editorial) |
| Domains (immuno / gut / metabolism / neuro) | Domain strip present |
| Full product ecosystem | Mid-page “ONE FOUNDATION…” shows **Aksh, ISI, HSI platform only** — **omits HSI Clinical + HSI Trials** |
| Clinical / CDS / MoU | Correctly absent / research disclaimer in footer |

**Gap:** Homepage sells “research journey” well but does not state the full four-product operating model until (or unless) the visitor reaches Products/Platform.

### Q2 — Can visitors understand Aksh / HSI Clinical / ISI / HSI Trials?

**Yes on Platform + Products; weak on Home / Science / Research / Solutions heroes.**

| Page | Ecosystem clarity |
| --- | --- |
| `/products` | **Best** — four products, maturity labels, hub diagram “HSI (Shared methods)” |
| `/platform` | Strong — product picker with Available / In development / Planned |
| `/technology` | Mentions Aksh / ISI / care / trials as data domains; denser, more future-architecture |
| `/` | Only three entry cards (Aksh, ISI, HSI) |
| `/science`, `/research`, `/solutions`, `/evidence-safety` | HSI-centric; ecosystem mostly footer links |

### Q3 — Clear available vs planned?

**Strong on Products + Platform; mixed elsewhere.**

- Products explicitly: Aksh/ISI **Available**, Clinical **In development**, Trials **Planned**, with glossary of status meanings.
- Platform radios mirror the same maturity language.
- Technology uses “illustrative / future-facing / concept” disclaimers — good honesty, but visitors may still over-read “NEXUS” / EHR lists as shipped.
- Home / Research / Science rarely use maturity vocabulary in the first viewport.

### Q4 — One professional biomedical platform vs disconnected sites?

**Visually one platform; narratively incomplete on Home.**

- Shared chrome, tokens, typography, concept illustrations → coherent biomedical brand.
- External product deep-links (`/for-aksh`, `/for-isi`) correctly say separate interfaces/data.
- Risk: Home’s three-card strip + external Visit CTAs can feel like three sites unless Platform/Products are visited first.

---

## 2. Page-by-page notes (live vs implementation)

Artifacts: `01-home.png` … `08-evidence-safety.png`.

| Page | Live match to GitHub | Primary gap for design later |
| --- | --- | --- |
| Home | Matches `Home.tsx` editorial | Expand ecosystem strip to four products + maturity chips |
| Platform | Matches `Platform.tsx` | Keep; optionally surface maturity in hero subcopy |
| Technology | Matches `Technology.tsx` | Separate “shipped research substrate” vs “illustrative NEXUS/EHR” more visually |
| Science | Matches science landing | Optional one-line “educational / draft” chip in hero |
| Research | Matches research landing | Clarify public overview vs authorised workbench in hero |
| Products | Matches `Products.tsx` | Reference pattern for other pages |
| Solutions | Matches solutions experience | Tabs bury Aksh; add small ecosystem map |
| Evidence & safety | Matches evidence landing | Already honest; keep CDS/PHI non-claims |

---

## 3. Cursor implementation plan (ordered)

Do **not** invent Gate C auto-approve, MoU, live CDS, or Neon cross-wiring. Prefer PR on `eng/*` branches.

### P0 — Access + technical SEO (this PR)

- [x] Explicit AI crawler Allows in `site/scripts/build-seo.ts` → `robots.txt`
- [x] Add `site/public/llms.txt`
- [x] Confirm Attack Challenge Mode off; document SSO custom-domain exception
- [x] Refresh public title/description/OG/Twitter registry in `site/src/lib/seo/siteSeo.ts` (honest copy)
- [x] Extend Organization JSON-LD with `alternateName` + research-only description
- [x] E2E asserts for GPTBot/PerplexityBot + `/llms.txt`
- [ ] After merge: Search Console sitemap resubmit (owner); re-test ChatGPT browse / Perplexity fetch on www

### P1 — Narrative clarity (design-safe, next PR)

1. **Home ecosystem strip** (`site/src/pages/Home.tsx`): four products with maturity labels matching Products (Available / In development / Planned); link Clinical via Platform not a fake live app.
2. **Home hero note**: one sentence — “Shared research technology across separately governed products.”
3. **Research hero**: distinguish marketing overview vs sign-in workbench.
4. **Technology section 01**: visual split “Available research methods” vs “Illustrative future architecture” so EHR/FHIR lists cannot be misread as live integrations.
5. **Footer products**: add HSI Clinical (in development) alongside Trials for symmetry.

### P2 — IA / discoverability

1. Consider promoting Products (or a compact ecosystem map) in primary nav weight equal to Platform.
2. Solutions “Personal health” tab → ensure Aksh maturity language matches Products.
3. Optional FAQ / “What HSI is / is not” block reused on Home + Evidence & safety (research-only, no CDS).

### P3 — Measurement (owner)

1. Google Search Console: property verify + sitemap submit (not done in-agent).
2. Spot-check ChatGPT “browse” and Perplexity “fetch” after deploy of this PR.
3. Baseline branded queries; no ranking guarantees.

### Explicit non-goals

- No design system rewrite in this pass
- No Gate C automation, MoU language, live CDS, PHI, or shared Neon with immunecity
- No DeliverX / Akeno clinic engine wiring

---

## 4. Remaining blockers

| Blocker | Owner |
| --- | --- |
| Re-validate ChatGPT/Perplexity after production deploy of this PR | Founder / eng |
| Search Console ownership + sitemap submission | Founder |
| Home/Technology narrative P1 copy (design) | Next eng/design PR |
| Any residual AI soft-blocks from medical safety policies | Outside eng control |

---

## 5. PR #65 merge note

Squash-merged onto `main` before this work: **`bc703a410ab7a69cc706e9abcdcb0b0144864fa6`** — *Add Roadmap R3 connected research workbench eng deepen (#65)*.
