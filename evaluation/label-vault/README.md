# Label vault layout (VER-05 / A4.1)

Expert gold labels are **not** stored in this public repository. They live in a gitignored private tree that the application runtime must not read.

## Private root

```
.hsi-private-benchmark/          # gitignored (see .gitignore)
  README.md
  conflict/
    README.md
    cases.json                   # expert cases + labels (empty array until curated)
    predictions/                 # optional hand-run comparator JSON (A4.2)
    reports/                     # private conflict:bench:expert output
  immuno/
    README.md                    # holdout drafts; public slots stay in src/
    dev-set/
      README.md
      cases.json                 # founder development set (A4.3); slotId always null
  freezes/
    README.md
    conflict-<sha12>.json        # hashed freeze records (ids + digests only)
  manifests/
    README.md
    vault-manifest.v1.json       # inventory; no gold text
```

Machine-readable copy: [`LAYOUT.v1.json`](./LAYOUT.v1.json).

## Commands

```bash
bun run label-vault:init
bun run label-vault:status
bun run label-vault:validate
bun run label-vault:scaffold-conflict -- --id CB-001 --question "Does … ?"
bun run label-vault:scaffold-immuno-dev -- --id DEV-001 --layer core --domain innate_adaptive_cells --question "…"
bun run label-vault:import-immuno-dev -- --from /path/to/dev-set.json
bun run label-vault:validate-immuno-dev
bun run label-vault:score-immuno-dev   # always refused until floors
bun run label-vault:freeze -- --track conflict
```

`scaffold-conflict` writes an **unlabelled** case shell (`labels: []`, `adjudicated: null`). Curators fill labels privately. Freeze refuses until at least one case has labels or an adjudicated value.

`scaffold-immuno-dev` / `import-immuno-dev` author the founder **development** partition only (`slotId: null`). Scoring stays blocked (`numericFloors: null`, `floorsOwnerApproved: false`) — see [`docs/engineering/IMMUNO_DEV_SET_TOOLING.md`](../../docs/engineering/IMMUNO_DEV_SET_TOOLING.md).

## Boundaries

| Rule | Enforcement |
| --- | --- |
| No gold in git | `.hsi-private-benchmark/` is gitignored; committed files are layout docs only |
| Runtime cannot read vault | Layout flags `runtimeMayRead: false`; DB role restriction is ADR / ops follow-up |
| No auto scientific approval | Freeze records set `scientificApproval: false` and `floorsOwnerApproved: false` |
| Scoring vs fixtures | Public `conflict:bench:fixture` / `:check` stay on synthetic fixtures; `conflict:bench:expert` uses the vault only (A4.2) |

## Related

- Conflict protocol: [`../conflict-benchmark/README.md`](../conflict-benchmark/README.md)
- Engineering pack VER-05: label vault outside the runtime database role
