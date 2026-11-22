# Open PR hygiene vs main — 21 November 2026

**Purpose:** Production readiness phase **U3**. Compare remaining open PRs to main `321ae53f` after landing + Demo Universe merges.  
**Authority:** Recommendations only. Do not close PRs without explicit owner action.

| PR | Subject | vs main | Recommendation |
| --- | --- | --- | --- |
| [#579](https://github.com/gnaneshwer23/hsi-core/pull/579) | Business pre-mortem doctrine | Docs; MERGEABLE | Review/merge as **strategy** — label not a release gate |
| [#578](https://github.com/gnaneshwer23/hsi-core/pull/578) | Master vision + prototype handoff (draft) | `docs/hsi-prototype/**` | Reconcile with `HSI_VISION` + ten-systems; do not fork architecture |
| [#514](https://github.com/gnaneshwer23/hsi-core/pull/514) | Multi-workspace dashboards | CONFLICTING; hub already on main | **Defer / close** — do not merge over current landings |
| [#513](https://github.com/gnaneshwer23/hsi-core/pull/513) | Professor / student shells | CONFLICTING; pages on main | Keep as demo reference; **close** conflicting branch |
| [#512](https://github.com/gnaneshwer23/hsi-core/pull/512) | E2E-01 passport soft-land | Passport UI on workspace; soft-land files absent | Land honesty catalog only, or close as product-superseded |
| [#511](https://github.com/gnaneshwer23/hsi-core/pull/511) | E2E-09 premium public pages | Superseded by #581–#584 | **Close** after short compare note |
| [#371](https://github.com/gnaneshwer23/hsi-core/pull/371) | Editorial scientific website (draft) | CONFLICTING; superseded | **Close** — do not merge older editorial site |

## Acceptance for U3

- This note exists on main (or open hardening PR)  
- Owner has acted on close/defer decisions (agent does not close without instruction)
