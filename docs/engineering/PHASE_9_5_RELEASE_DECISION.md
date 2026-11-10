# Phase 9.5 — Release readiness decision

Status: **NO-GO**, pending consolidated CI and real scientific acceptance.

## CI blocker discovered
- PRs #192, #193 and #194 failed the `verify` job at `bun run check`.
- PR #194 job 130210152509 reported TS2741 in `test/liveProviderVerification.test.ts`: Bun's `typeof fetch` includes a `preconnect` property absent from test doubles.
- This branch changes the verification helper and test fixtures to the existing shared `FetchLike` type (`src/fetchLike.ts`).
- The fix must pass CI before it is considered resolved. Do not infer success from a committed patch.

## Controlled merge plan
1. Confirm this branch passes typecheck, unit tests and site build.
2. Verify PR #191 (Reactome consolidation) and ensure PR #183 is not separately merged with duplicate changes.
3. Review PR ancestry: #184 -> #185 -> #186 -> #187 -> #188 -> #189 -> #190 -> #191 -> #192 -> #193 -> #194 -> this branch; Reactome #183 is independently based on main.
4. Resolve stacked PR bases and consolidate on an integration branch; inspect the final combined diff.
5. Verify actual Reactome/UniProt API requests from a network-enabled environment; record immutable run evidence.
6. Test authenticated end-to-end researcher workflow, not only browser-side metadata exploration.
7. Complete independent cross-immunology evaluation with real sources, reviewer identities and predetermined acceptance thresholds.
8. Only then authorize merge and deployment. Keep all hypotheses draft and non-promotable until governed review.

## Scientific limitations
- Existing Phase 9.4 benchmark cases are prompts, not ground-truth data.
- The benchmark evaluator accepts caller-supplied reviewer fields and cannot authenticate reviewers.
- Site-deployment success does not imply scientific or engineering release readiness.
