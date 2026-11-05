# Git publication audit — 5 November 2026

Audit scope: all four checked-out HSI-related repositories; current working trees, fetched GitHub refs, HSI feature branches and the preserved historical stash. This is a Git audit, not a deployment, live database or scientific acceptance result.

## Current work

| Repository | Latest audited commit | Local state | GitHub main comparison |
| --- | --- | --- | --- |
| `gnaneshwer23/hsi-core` | `1053ec1` — connected public/research experience | Clean `main` before this report | Ahead 0 / behind 0 |
| `gnaneshwer23/aksh-health-redesign` | `1a237cc` — pinned HSI source verification | Clean `main` | Ahead 0 / behind 0 |
| `gnaneshwer23/immunecity` | `efba003` — pinned HSI source verification | Clean `main` | Ahead 0 / behind 0 |
| `gnaneshwer23/hsi-sources` | `6c8f826` — source snapshots | Clean local `work` | HEAD equals `origin/main`; no unpushed commits |

Remote refs were fetched successfully for all four repositories. HSI branches `codex/hsi-vision-foundation-20261102` (`bceff52`) and `work` (`143e821`) contain no commits outside `main`; their histories are already included. Current product-experience work was committed directly to `main`, so no additional merge is required.

Recent HSI milestones `39ec9ef` (readiness/lineage), `7e7e52e` (fixture byte preservation), `2e9c3b0` (validation integration), `bb94d22` (unified outcomes) and earlier phase commits are ancestors of `1053ec1` and are published on GitHub main.

Validation already recorded for the implementation: 770 core tests, 104 browser tests, final 13-test polish/accessibility subset, repository/site builds and type checks passed. This documentation-only audit does not rerun those checks or declare live production readiness.

## Historical work exception

One local stash remains: `Preserve unpublished design and research demo before login fix publication`, based on `749cbaa`. It contains an older neomorphic design/demo experiment and staging-auth draft material. Its old homepage/routes should not replace the current product experience. Current equivalents include the hash-verified 200-profile validation lab, new public pages, research dashboard, evidence/graph tools and newer authentication diagnostics. Some draft-specific files are absent from current main: these were not silently merged or described as shipped.

The same historical preview also has a local preservation directory at `/workspace/hsi-preview-unpublished-20261104`. That directory is not a separate Git repository. The stash and preservation copy remain intact.

An attempt to create/publish an explicitly superseded archive branch was rejected by automatic approval review before execution. The stated concern was uploading an entire unpublished stash, including drafts and credential-shaped test URL content, without specific approval for that historical payload. The inspected credential-shaped matches were negative URL-validation test cases; their actual userinfo is not reproduced here. No archive branch was created or pushed. Do not claim that every historical draft is on GitHub.

### Preserved stash inventory

- `docs/RESEARCH_EXPERIENCE_PREVIEW_PLAN.md`
- `docs/STAGING_AUTH_REVIEWER_CHECKLIST.md`
- `docs/patches/STAGING_AUTH_LATEST.patch`
- `scripts/check-hsi-staging.ts`
- `scripts/lib/hsiStagingPreflight.ts`
- `site/e2e/research-demo.spec.ts`
- `site/src/App.tsx`
- `site/src/components/Layout.tsx`
- `site/src/lib/hsiAuthClient.ts`
- `site/src/lib/useSourceRegistry.ts`
- `site/src/main.tsx`
- `site/src/pages/Home.tsx`
- `site/src/pages/ResearchDemo.tsx`
- `site/src/pages/Sources.tsx`
- `site/src/research-demo/EvidencePanel.tsx`
- `site/src/research-demo/LabExplorer.tsx`
- `site/src/research-demo/MechanismMap.tsx`
- `site/src/research-demo/PreviewBoundary.tsx`
- `site/src/research-demo/brief.ts`
- `site/src/research-demo/data.ts`
- `site/src/styles/neomorphic-preview.css`
- `site/src/styles/research-demo.css`
- `site/src/styles/research-entry.css`
- `site/vercel.json`
- `test/hsiAuthClient.test.ts`
- `test/hsiStagingPreflight.test.ts`
- `test/researchDemoPreview.test.ts`

## Excluded local files

Ignored dependency folders, compiled `dist` files, browser test results, Python caches and generated ignored exports are build/runtime artifacts, not missing source commits. Attachments, local environment/tool directories and credentials are not part of the requested application publication.

## Result

All current source changes and both old HSI feature-branch histories are committed and present on GitHub main. This audit report is committed separately. The sole identified unpublished source-work exception is the superseded local stash; publishing its historical contents needs explicit approval following the automatic review rejection. Vercel deployment success and live account/database readiness must be checked separately.
