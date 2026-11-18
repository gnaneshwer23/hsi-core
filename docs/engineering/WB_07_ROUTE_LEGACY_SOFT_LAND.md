# WB-07 / UX-05 — Route legacy catalog soft-land

**Status:** Engineering soft-land. Typed inventory + honesty flags + one-hop redirect alignment.  
**Not claimed:** Route-count halved, D-60 owner decisions closed, Labs nav shell, or WB-07 acceptance.

Pack: [`07_Scientific_Discovery_Workbench.md`](../engineering-pack/v1.1/markdown/07_Scientific_Discovery_Workbench.md) WB-07 / D-60.  
Catalog: [`site/src/lib/siteRouteCatalog.ts`](../../site/src/lib/siteRouteCatalog.ts).

## Honesty

| Claim | Soft-land |
| --- | --- |
| `routeCountHalved` | Always `false` |
| `wb07Accepted` / `d60Decided` | Always `false` until owner sign-off |
| Invented destinations | Forbidden — redirects only to existing paths |
| Reviewer tools | Protected: ontology-review, scientific-review, validation, context-conflict-audit, curator |

## Buckets

| Bucket | Meaning |
| --- | --- |
| `public_marketing` | Six indexed public pages |
| `investigation_loop` | Core research journey surfaces |
| `reviewer_tool` | Curator / reviewer tools (keep) |
| `labs_synthetic` | Synthetic / demo labs |
| `auth_account` | Sign-in / account |
| `engineering_chrome` | Status, docs, systems |
| `client_redirect` | Already `Navigate` / host redirects |
| `legacy_debt` | Still mounted; `proposedAction: owner_D60` only |

## This PR

- Catalog + offline parser parity with `App.tsx`
- Shared `RETIRED_MARKETING_REDIRECTS` for Playwright
- One-hop client redirects: `/modules*`, `/products`, `/akeno`, `/aksh-agents`, `/for-*` → `/how-it-works` (same final destination as before; drops hop through `/connected-intelligence`)

## Not in this soft-land

- Deleting pages or lazy imports
- Halving route count
- Labs grouping UI
- Redirecting reviewer tools or inventing new product landings
