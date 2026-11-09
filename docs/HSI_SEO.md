# SEO — Human Super Intelligence (`.tech`)

Canonical site: **https://www.humansuperintelligence.tech/**

Deploy repo: **`hsi-core`** → Vercel project `hsi-core` (`www.humansuperintelligence.tech` primary; apex `humansuperintelligence.tech` **308 → www**).

Do **not** diagnose HSI Google discovery against Immune Super Intelligence (`immune-super-intelligence.co.uk` / `immunecity`). That is a separate product surface.

Companion implementation notes: [`HSI_SEO_IMPLEMENTATION.md`](./HSI_SEO_IMPLEMENTATION.md). Public-site access audit: [`engineering/PUBLIC_SITE_AUDIT_AND_PLAN_2026-11-08.md`](./engineering/PUBLIC_SITE_AUDIT_AND_PLAN_2026-11-08.md).

## What ships in the repo

| Asset | Purpose |
|--------|---------|
| `/robots.txt` | Allows marketing crawl; Disallow `/api/` + `/_pages/`; explicit AI crawler Allow blocks; Sitemap line |
| `/sitemap.xml` | 14 public canonical URLs from `SEO_PAGES` |
| Prerendered public HTML | Same React trees as the app, with title/description/`index,follow`/canonical/OG/Twitter/JSON-LD |
| Tool/account shells | `noindex, follow` — not in sitemap |
| `/llms.txt` | AI-facing public page summary + honesty boundaries |
| IndexNow key | `site/public/indexnow-key.txt` + `site/public/{key}.txt` (Bing/partners; **not** Google) |
| Optional `GOOGLE_SITE_VERIFICATION` | Build-time HTML meta only when set in Vercel; prefer DNS TXT |

## Verified diagnosis (2026-11-09) — why Google may not “find” HSI

Live checks (do **not** claim indexed until `site:` or Search Console proves it):

| Check | Result |
|--------|--------|
| `https://www.humansuperintelligence.tech/` | **200**; prerendered title/description/`index,follow`/canonical/JSON-LD |
| Apex `https://humansuperintelligence.tech/` | **308 → www** (correct); TLS valid on apex and www |
| `/robots.txt` + `/sitemap.xml` | Reachable; sitemap lists 14 public hubs; robots points at sitemap |
| Google-style `site:humansuperintelligence.tech` / `site:www…` | **No indexed results observed** in this audit |
| Ubersuggest (UK) | **noData** / no organic keyword sample for the domain |
| Search Console verification meta | **Absent** on live HTML (owner action still required) |
| Vercel domains | `www` + apex verified on project `hsi-core`; SSO `all_except_custom_domains`; password protection off |
| IndexNow key (pre-fix) | **Missing** — added in this discovery pass for Bing/partners |

**Bottom line:** www technical SEO is largely already in place (prerender, robots, sitemap, canonical www, apex redirect). Discovery is blocked by (1) **no Search Console property + sitemap submit**, (2) **brand-new domain with zero observed Google index**, (3) **near-zero external authority signals**. IndexNow does **not** push Google.

Unlike ISI’s `.co.uk` apex issue, HSI apex DNS/TLS and www redirect are **healthy**.

## Owner steps (Google Search Console — required)

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add a **Domain** property for `humansuperintelligence.tech` (covers apex + www) **or** URL-prefix `https://www.humansuperintelligence.tech/`.
3. Verify ownership:
   - Prefer **DNS TXT** at the registrar / Vercel DNS, **or**
   - HTML tag: set Vercel env `GOOGLE_SITE_VERIFICATION` to the token GSC shows, redeploy (token is injected only into generated HTML; never invent one).
4. Submit sitemap: `https://www.humansuperintelligence.tech/sitemap.xml`
5. **URL Inspection** → Request indexing for `/`, `/platform`, `/research`, `/science`, `/products`.
6. Re-check `site:www.humansuperintelligence.tech` after days–weeks (new domains are not instantly searchable).

## Bing / IndexNow (optional; not Google)

After production deploy of the IndexNow key files:

```bash
bun run seo:indexnow
```

Submits the 14 public `SEO_PAGES` hubs only. Expect HTTP **200/202**. Also add the site in [Bing Webmaster Tools](https://www.bing.com/webmasters) and submit the same sitemap.

## Sanity checks

```bash
curl -sI https://www.humansuperintelligence.tech/
curl -s https://www.humansuperintelligence.tech/robots.txt
curl -sI https://www.humansuperintelligence.tech/sitemap.xml
curl -sI https://humansuperintelligence.tech/   # must 308 → www
curl -sI https://www.humansuperintelligence.tech/social/hsi-research.png
```

## OpenSEO skills (agent)

Personal skills from [every-app/open-seo](https://github.com/every-app/open-seo) under `~/.cursor/skills/` — load on demand via [`AGENT_SKILLS.md`](./AGENT_SKILLS.md) (`seo-audit`, `keyword-research`, …). Do not `alwaysApply` the pack. Hosted OpenSEO MCP is optional and separate from Ubersuggest.
