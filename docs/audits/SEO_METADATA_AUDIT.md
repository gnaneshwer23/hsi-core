# SEO metadata audit

**Brief:** [`../strategy/HSI_PUBLIC_WEBSITE_IMPROVEMENT_BRIEF.md`](../strategy/HSI_PUBLIC_WEBSITE_IMPROVEMENT_BRIEF.md)  
**Source:** `site/src/lib/seo/siteSeo.ts` · live origin `https://www.humansuperintelligence.tech`

| Route | Component | Current behaviour | Backend dependency | Live or illustrative | Evidence | Issue | Required change | Acceptance test | Owner |
|-------|-----------|-------------------|--------------------|----------------------|----------|-------|-----------------|-----------------|-------|
| `/` | SEO prerender | title + canonical + index robots | none | live | Live HTML 2026-11-09 | Keep unique title | No brand prefix duplication | Unique title + canonical | hsi-site |
| `/research/dashboard` | shell | noindex | none | live | Live HTML | Expected noindex | Keep noindex | robots=noindex,follow | hsi-site |
| *(add every SEO_PAGES + required IA routes)* | | | | | | | | | |
