# HSI public landing audit — 21 November 2026 (Europe/London)

**Revision audited (code):** `origin/main` at `3092f979` (U22 envelopes), plus this PR1 branch.  
**Agent-team docs:** draft PR #591 (`chore/cursor-landing-agent-team`, SHA `d5a1e9c4`) — definitions only; not executed until this audit.  
**Production probe:** `https://www.humansuperintelligence.tech/` (Vercel HIT, 21 Nov 2026 ~14:29 UTC / 14:29 Europe/London). Live HTML shows the same hero claim, honesty microcopy, Create account CTA and published-graph proof band as current `main`.  
**Local fresh capture:** Vite preview `127.0.0.1:4178` after `bun run build` on this branch. Screenshots under `/opt/cursor/artifacts/landing-audit-*.png`.

Prior 21 Nov QA packets are **dated records only** — this audit re-ran build + homepage screenshots; Playwright public suite results are recorded in the PR1 QA section / visual-review.

## What is working (preserve)

| Area | Evidence |
|---|---|
| Brand-first hero | `HomeLanding.tsx` — “Human Super Intelligence” + one claim + lead + CTA pair + honesty microcopy + investigation flow as dominant visual |
| Live graph proof | Digest-verified snapshot strip + `LiveGraphHero`; failed state shows no substitute figures |
| Demo honesty | `DemoLandingPreviewPanel` status: “Demonstration workspace · scenario data · not independently validated.” |
| Six domains | Six domain links present; primary nav Home / How it works / Knowledge graph |
| Design canon | Cool ground `#F4F5F8`, navy ink, indigo accent, Host Grotesk; matches `DESIGN.md` / `PRODUCT.md` |

## Findings

| ID | Severity | Finding | Source / evidence | Recommended change |
|---|---|---|---|---|
| A1 | **P0 Truth** | Product screenshot band on `/` and `/how-it-works` presents dashboard/explorer imagery **without** the required **illustrative** honesty label (PRODUCT.md brand commitments). Captions read as live product chrome. | `HomeLanding.tsx` figcaptions; `HowItWorksPage.tsx` figcaptions; `landing-audit-product-shots-1440.png` | Add “illustrative” to microcopy, alt text and figcaptions. **Selected for PR1.** |
| A2 | P1 Journey | Hero secondary CTA “Scientific workbench” → `/research/workspace` without stating access is provisioned / research preview. Destination is real but not generally available. | `HomeLanding.tsx` + `LIVE_INVESTIGATION_PATH`; PRODUCT operating context | Soften label or add microcopy that workspace access is provisioned — separate PR after copy-matrix owner review |
| A3 | P1 Consistency | “Disease mechanisms” domain → `/knowledge-graph` while five peers → `/research/knowledge-graph?netDepartment=…`. May be intentional (public KG) but looks inconsistent. | `HomeLanding.tsx` `DOMAINS` | Confirm with experience architect; document or align destinations |
| A4 | P2 Visual | At 390px, investigation flow stacks; verify no overflow (covered by existing axe/overflow e2e). Fresh mobile hero captured. | `landing-audit-hero-390.png` | Keep existing responsive tests; no CSS rewrite in PR1 |
| A5 | P2 Ops | Production SHA vs latest landing PRs must stay reconciled before another redesign. Agent team branch is docs-only. | Production HTML vs `main` | Orchestrator: no competing redesign PRs until owner visual GO on PR1 |

## Selected PR1

**A1 — Illustrative labels on public product preview shots** (`/` + `/how-it-works`).  
Why: highest honesty risk among presentation-only defects; narrow public-site diff; matches backlog P0 Truth / P2 Evidence; no backend/auth/science changes.

## Out of scope (this audit)

Scientific platform, APIs, Neon, Gate C, auth grants, named biomedical agents, portfolio marketing, competitor cloning.
