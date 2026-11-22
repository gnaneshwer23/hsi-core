# U43 — U12 evidence fill-apply from U40 proposals (22 November 2026)

**Phase:** Production readiness · applies U40 fill proposals into U12 / continuous-journey worksheets  
**Owner approval:** Fill-apply engineering authorized (22 November 2026).  
**Not claimed:** Restricted-preview GO, checklist #1 verified, invented hosts/grants, production writes, Gate C, PHI, or GA.

## Change

1. Owner approval `hsiU12EvidenceFillApplyAuthorization`.  
2. Pure apply `applyHsiU12EvidenceFillProposal` (dry-run default).  
3. Soft-land catalog.  
4. CLI `bun run staging:preview-evidence:apply-proposal -- --proposal <file>` (+ optional `--write` with dual env flags).  
5. Docs + readiness phase row.

## Honesty

| Claim | Soft-land |
|---|---|
| Apply non-placeholder U40 proposal refs into pending worksheets | **Yes** (dry-run default) |
| Write pending files | **Only** with `HSI_U12_FILL_APPLY_ENABLED=1` + `HSI_U12_FILL_APPLY_WRITE_AUTHORIZED=1` |
| `restrictedPreviewClaimed` / checklist #1 verified after apply | **No** |
| Invent staging hosts or grants | **No** |

## Acceptance

- `bun test test/hsiU12EvidenceFillApply.test.ts`  
- Dry-run: `bun run staging:preview-evidence:apply-proposal -- --proposal /path/to/proposal.json`  
