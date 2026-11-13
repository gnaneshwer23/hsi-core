# Intelligence Collective — local design review

Local branch `design/collective-local`, based on PR #313 head `88223a3`. No push, merge or deployment is authorized by this review.

## Direction

A calm scientific capability guide: off-white `#FBFCFA`, ink `#183239`, forest `#185C50`, pale field `#EAF1EC`, quiet boundary `#D5DFD9`, and secondary text `#53696C`. Existing Host Grotesk typography remains. One evidence-handoff illustration carries the hero; a searchable directory replaces repeated promotional cards. Detail pages prioritize a plain-language responsibility, intended inputs/outputs, connected capabilities, authority and readiness. The thirteen names and maturity descriptions remain those of the source PR; this design does not activate thirteen model agents or resolve PR #312's separate naming decision.

## Local pages

- `http://127.0.0.1:4186/intelligence`
- All thirteen existing `/intelligence/:slug` routes
- `http://127.0.0.1:4186/design/identity` (development only)

The homepage collective section and local shared header/footer identity are restyled consistently. No backend/provider/permissions changes. Public metadata now exists for the collective and all thirteen detail pages; the source PR otherwise fell back to generic research-tool metadata.

## Original logo study

The evidence bridge is a new vector H-like mark: two rails connected through a central context point. Connected layers and evidence field are alternative studies, shown at small sizes and reversed on a dark surface. These are visual proposals, not an external brand approval. Export: `site/public/brand/hsi-evidence-bridge.svg`.

## Review evidence

- Site/API/SEO build passed; generated 36 public pages and 53 noindex shells.
- Site TypeScript passed.
- Working-browser DOM/layout sweep: landing + all thirteen details at 390/820/1440/1920 = 56 route/viewport checks; no horizontal overflow, missing H1, nested/duplicate main or broken local fragments observed.
- Working-browser interaction checks: layer filter returns four biological capabilities; no-match search and clear restore all thirteen; handoff selection updates connected names.
- Desktop/mobile screenshots captured locally for the landing, AEGIS and identity proposals.
- Separate Playwright/axe runner did not execute its tests: local Chrome launch failed under host restrictions. Do not report automated axe or browser-test success. Local-only test harness is outside the regular CI e2e directory.

Review URLs and screenshots are for design feedback. Production remains unchanged. Existing account/source/clinical/scientific gates remain separate. No claims of completed scientific validation, agent deployment or approved canonical knowledge are introduced.


## Expanded public-page review — 13 November 2026

Local Home, How it works, Research and Evidence intelligence routes now share a clean four-link header with sign in / sign up. Secondary and governance links remain in the footer. Home centres the shared Living Knowledge Graph target architecture, distinct claim / hypothesis / reviewed states, biological scope and an interactive simulated workspace. The evidence map is manually authored and explicitly illustrative; it is not an extracted or reviewed scientific graph. Publications are attributed and linked without copying abstracts or asserting source execution clearance. Literature motivates the design, not HSI validation.

The recommended mark is now an original asymmetric faceted evidence stone with the full name, replacing the acronym-led bridge. Vector: `site/public/brand/hsi-evidence-stone.svg`.

Four revised routes checked in the local browser at 390, 820 and 1440 pixels: no horizontal overflow; one H1 and one main per route. Workspace step selection and graph keyboard selection checked. This is local UI verification, not backend/provider/security/scientific acceptance. No push, merge, deployment, production changes or paused P0 work.


## Revision: adapt the built knowledge graph

Supersedes the manually authored homepage map described above. `HomeResearchGraph.tsx` loads the existing pinned domain graph through `loadDomainGraph`, retaining hash/shape verification and fail-closed errors. It reuses `networkProjection` and `GraphVisual`; no replacement graph records are invented. The supplied snapshot has 153 nodes, 131 candidate connections and 75 source records. The default connected view excludes 15 unconnected concepts.

The public adapter includes search, biological domain filters, local/global scope, shared zoom/pan/drag controls, node/edge inspection and source links. Full-explorer links preserve version, selection, edge, filters and scope. The optional embedded viewport on `GraphVisual` changes only the homepage framing; existing full graph defaults are unchanged. Source candidate, research gap and pending scientific review states remain explicit.

Visual revision uses the locally loaded Host Grotesk Variable font, a quieter violet/ink identity, larger graph, domain descriptions and a more detailed workspace preview. Checked four routes at three widths (390/820/1440), graph search and domain filters, keyboard edge inspection, and handoff to the existing investigation explorer. Typecheck, site build and whitespace checks passed. No complete automated browser suite is claimed. Still local only; no merge, push, deployment, DB or live provider change.


## Read-only backend connection

`loadDomainGraph` now calls `/api/research/graph-snapshot?version=<sha>` for the homepage and existing research explorers. The API serves published candidate snapshots only, with server-side content-hash/schema verification, a 2 MB file/response limit, strict query and method validation, no-store responses, and no substitute data on failure. The client independently verifies the same pinned identity. Local Vite middleware invokes the same handler; a Vercel API adapter and snapshot packaging rule are prepared but not deployed or deployment-verified.

This is a file-backed public snapshot API, **not a live Neon database connection**, persisted investigation, approved agent execution or graph publication. The existing authenticated SSc Neon service remains separate. No DB credentials are consumed by this route. No migrations, permissions, sessions or providers were enabled.

Validation: three backend tests with 25 assertions; actual local browser HTTP response contained 153 nodes, 131 edges, 75 source records, the expected SHA, scientificApproval=false and graphPromotable=false. Homepage loaded through the API. Site build/API typecheck passed. Private staging/Neon acceptance remains gated by the previously recorded missing authorisation and account references.


## Deployment adapter verification

The public snapshot is packaged as an explicit JSON import in the existing research catch-all function, avoiding an unverified serverless filesystem root. Only the bundled pinned version is served; unavailable historic versions fail closed. Local dev/preview uses the same validation handler with bounded file reads. Vercel routing metadata (`...path`) is validated as the fixed route name; preview protection metadata is ignored and never retained or reflected. The public route does not consume Neon credentials. The real API adapter has a regression test with no database configuration.

During release preparation, browser CI reported 242 passes and one remaining contrast issue shared by three scans. Its evidence-note badge foreground was darkened without relaxing the accessibility gate. Earlier navigation/tamper tests were updated to exercise the new homepage and API route. Deployment must still pass the exact final head checks and actual API smoke test before merge.
