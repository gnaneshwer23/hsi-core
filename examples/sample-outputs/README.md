# Sample outputs (committed)

Illustrative snippets of the publish bundle. **Not** a full dump — regenerate real artifacts with:

```bash
bun run outputs
```

Full layout and consumer rules: [`docs/OUTPUTS.md`](../../docs/OUTPUTS.md).

| Sample | Full artifact |
|--------|----------------|
| `MANIFEST.sample.json` | `dist/outputs/<bundle>/MANIFEST.json` |
| `gate-c-checklist.sample.md` | `gate-c-checklist.md` (pending REL rows) |
| `gap-report.sample.md` | `hsi-gap-report.md` |
| `pilot-evidence-pack.sample.md` | `hsi-pilot-evidence-pack.md` (pack-2; Phase 3 depth on scope-locked RA/TNF; partnerSigned=false; Discovery Loop metadata) |
| `pilot-acceptance.sample.md` | `hsi-pilot-acceptance.md` (Phase 5 Stage 1 pass/fail/pending; Phase 6 Discovery Centre surface = pass; partnerSigned pending) |
| `rdkit-adapter-proposals.sample.md` | `hsi-rdkit-adapter-proposals.md` (P3.0 RDKit spike; runtime stub; Gate C pending only) |

Phase 6–7 site copies (full JSON, refreshed by `bun run outputs`): [`site/public/discovery/`](../../site/public/discovery/) — includes `hsi-r2-validation.json` + `hsi-rdkit-adapter-proposals.json`.
