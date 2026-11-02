# Gate C decisions import examples (P1.7)

Honest tooling for the partner Apolo Gate C review session → `bun run curator-ux --decisions …` path.

| File | Kind | Use |
|------|------|-----|
| `awaiting.empty.json` | `awaiting_empty` | Empty template — partner session not run yet |
| `hypothetical.schema-fixture.json` | `hypothetical_schema_fixture` | Schema dry-run only — **not** production-approved |

## Commands

```bash
# Validate without writing curator artifacts
bun run curator-ux --dry-run --decisions examples/gate-c-decisions/awaiting.empty.json
bun run curator-ux --dry-run --decisions examples/gate-c-decisions/hypothetical.schema-fixture.json

# Regenerate templates
bun run curator-ux --export-template
bun run curator-ux --write-hypothetical-fixture

# After a *live* autumn-snow export (operator-supplied — never invent):
# bun run curator-ux --decisions path/to/real-apolo-export.json
```

## Honesty

- `productionApproved` is always `false` in HSI-authored envelopes (HSI never self-certifies live Apolo outcomes).
- Hypothetical fixtures use `reviewedBy: hypothetical-fixture-not-a-partner-signature` and status `hypothetical_fixture_imported`.
- `autoApprove` / `hsiGradeFlipped` / `productionApproved=true` are refused.
- Real decisions stay on ISI Neon **autumn-snow** (immunecity `/hsi/discovery` REVIEW). HSI **red-wave** holds substrate + pending only.
