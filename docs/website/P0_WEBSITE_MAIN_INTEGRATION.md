# P0 — website integration and release verification

Prepared 13 November 2026. This packet closes the missing integration-to-main handoff for website PRs #291–#295. It is not a production release authorization or live scientific acceptance.

## Integration scope

Base: `a9bef5e` (main including documentation PR #296). Integrated website candidate: `f9abfbf736b7de45db67b53ededd70d4533569e1`. The integration preserves the newly published audits and brings the complete homepage, original hero assets, all ten canonical pages, research teaching interactions, brief downloads and QA into one PR whose base is **main**.

The application/workflow/assets are identical to the previously tested website candidate. The only additional content is the main-branch audit documentation and this release packet. Fresh CI is required on the integration PR; previous checks are supporting history, not a substitute.

Backend source, migrations, research data, source/provider approvals, environment switches and authentication roles are outside this website integration. The graph correction audit remains outstanding product work. The public demonstrations remain synthetic and do not activate backend scientific services.

## Before merge

- Confirm this PR targets `main`, not a website feature branch.
- Confirm all required checks pass on the current integration revision and GitHub's current merge candidate. If main changes, reconcile and reverify.
- Retain root checks, site/API build, private-artifact scan, browser/axe results and exact-revision screenshots. Review the preview content and design separately from automated test success.
- Record the accepted head SHA, workflow run and preview deployment together in the PR. A green build is not a production deployment.

## After an authorized merge/release

Do not substitute the feature preview for the public domain. Obtain Vercel's production deployment and custom-domain alias metadata, and bind the actual production commit to the accepted integration/merge ancestry. A new main merge SHA can differ from the PR head; prove inclusion and its checks rather than assuming SHA equality.

Verify the actual public domain at each canonical route. HTTP 200 alone is insufficient: the foundation placeholders also returned 200.

| Route | Expected primary heading in integrated content |
|---|---|
| `/` | See why the evidence conflicts. |
| `/platform` | The intelligence behind connected biomedical research. |
| `/context-conflict-audit` | Different findings. Deeper understanding. |
| `/evidence-intelligence` | Evidence without context is only part of the story. |
| `/research` | One workspace for deeper scientific investigation. |
| `/research-briefs` | Research decisions deserve an evidence trail. |
| `/science` | Explore the biological context behind disease mechanisms. |
| `/applications` | One research foundation. Three connected applications. |
| `/trust` | No silent promotion. |
| `/about` | Building a more connected understanding of human health. |

The heading assertions in `site/e2e/approved-website.spec.ts` are the authoritative implementation list; check this table against them before release. Also verify:

- New responsive biological hero loads; correct new assets and canonical metadata are served.
- Audit, Evidence Intelligence and Trust render their dedicated pages, not the reused EvidenceSafety placeholder.
- Mobile navigation, existing sign-in routes and browser-only contact drafting remain functional and honest.
- Audit interactions remain local teaching examples, missing evidence remains visible, and actual brief JSON/Markdown downloads retain no-approval status.
- Retained graph/tool routes and protected research APIs preserve their boundaries.

Only mark **public website deployed** after these checks. Backend live acceptance, source rights, provider operation, researcher isolation, graph redesign, benchmark science and production writes require their own evidence. Neither a website merge nor its deployment changes those statuses.

## Current release status

Integration prepared; fresh checks and preview verification are recorded in the integration PR. Production merge/promotion and post-release custom-domain checks remain pending until separately authorized and observed. The dated 12 November audits are historical observations, not automatic monitors or claims that their old deployment SHA stays current.
