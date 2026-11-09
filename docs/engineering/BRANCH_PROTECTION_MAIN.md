# Branch protection — `main`

**Set:** 2026-11-09 via GitHub API (`PUT /repos/gnaneshwer23/hsi-core/branches/main/protection`).

## Settings

| Control | Value |
| --- | --- |
| Require a pull request before merging | Yes (`required_approving_review_count: 0`, dismiss stale reviews) |
| Required status checks | `verify`, `site-deployment` (Research foundation workflow) |
| Require branches to be up to date before merging | Yes (`strict: true`) |
| Allow force pushes | No |
| Allow deletions | No |
| Enforce for admins | No (solo/small-team emergency override remains possible) |
| Lock branch | No |

Check names were taken from successful Research foundation runs on `main` (e.g. merge of #153 / #154). Vercel deployment status is informative but not a required merge gate.

## Intent

Failing Research foundation checks cannot merge to `main`. Direct force-push and branch deletion on `main` are blocked.
