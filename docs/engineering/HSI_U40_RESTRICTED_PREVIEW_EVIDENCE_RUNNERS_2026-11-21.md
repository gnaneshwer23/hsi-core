# U40 — Restricted-preview auth + continuous-journey evidence runners (21 November 2026)

**Phase:** Production readiness · fills U12 / continuous-journey soft-lands once staging is approved  
**Owner approval:** Engineering runners authorized (21 November 2026).  
**Not claimed:** Restricted-preview GO, checklist #1 verified, invented staging hosts/grants, production writes, Gate C, PHI, or scientific approval.

## Change

1. Owner approval envelope `hsiRestrictedPreviewEvidenceAuthorization` for engineering runners only.  
2. Suite + runner: check / fixture / live modes with U12 worksheet fill proposal helper.  
3. CLI: `bun run staging:preview-evidence:check|fixture|live`.  
4. Pending worksheet: `operations/staging/hsi-restricted-preview-evidence-u40.pending.json`.

## Modes

| Mode | Command | Network | Staging | U12 fill |
| --- | --- | --- | --- | --- |
| check | `staging:preview-evidence:check` | none | no | no |
| fixture | `staging:preview-evidence:fixture` | none | no | no |
| live | `staging:preview-evidence:live` | owner HTTPS origin | **yes** | proposal only with real refs |

## Live preconditions (owner)

1. Approve a reviewed staging HTTPS origin privately — never invent hosts in git.  
2. Provision a real research-preview grant (verified neon_auth user id) privately.  
3. Set privately (never commit):  
   - `HSI_PREVIEW_EVIDENCE_ENABLED=1`  
   - `HSI_PREVIEW_EVIDENCE_LIVE_AUTHORIZED=1`  
   - `HSI_PREVIEW_EVIDENCE_ORIGIN`  
   - `HSI_PREVIEW_EVIDENCE_APPROVED_ORIGIN` (must match origin)  
4. Optional fill args: `--staging-target-ref` · `--preview-grant-ref` · `--staging-grant-run-ref` (non-placeholder).  
5. Keep `writesEnabled=false` on the probed origin.  
6. Apply proposed digests to U12 / continuous-journey pending worksheets only with real evidence.

## Honesty

| Claim | Soft-land |
|---|---|
| Auth grant fail-closed + session-expiry honesty probes | **Yes** (check/fixture) |
| Continuous journey catalog bound to U12 soft-lands | **Yes** |
| Staging origin health probe | **Only with owner live env** |
| U12 worksheet fill proposal | **Only with non-placeholder owner refs** |
| `restrictedPreviewClaimed` / checklist #1 verified | **Always false** here |
| Scientific approval / Gate C / production writes | **No** |

## Acceptance

- `bun test test/hsiRestrictedPreviewEvidenceSuite.test.ts`  
- `bun run staging:preview-evidence:check`  
- `bun run staging:preview-evidence:fixture`  
