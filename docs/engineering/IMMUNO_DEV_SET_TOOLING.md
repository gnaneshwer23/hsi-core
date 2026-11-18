# Immuno founder development-set tooling (A4.3)

**Status:** Authoring tooling only. Owner drafts cases offline. Import validates schema. Scoring and numeric floors stay blocked until an independent owner decision. No gold in git.

## What this is

Private vault tooling for the separately authored immunology **development** partition (VER-02 / HSI-P3-01). It is not the 120 holdout slots and must never set `slotId` to a public `IMMUNO-*` id.

| Command | Behaviour |
| --- | --- |
| `label-vault:scaffold-immuno-dev` | Writes a draft case (`gold: null`) under `.hsi-private-benchmark/immuno/dev-set/` |
| `label-vault:import-immuno-dev -- --from <file>` | Validates `hsi-immuno-dev-set-1` and copies into the vault |
| `label-vault:validate-immuno-dev` | Re-validates the vault document |
| `label-vault:score-immuno-dev` | **Always exits nonzero** until floors are owner-approved |

## Document contract

```json
{
  "schemaVersion": "hsi-immuno-dev-set-1",
  "purpose": "founder_development_set",
  "scientificApproval": false,
  "floorsOwnerApproved": false,
  "numericFloors": null,
  "scoringBlocked": true,
  "heldOutSlotsForbidden": true,
  "cases": []
}
```

Cases are either drafts (`hsi-immuno-dev-case-draft-1`, `gold: null`) or complete `ImmunoCase` rows with `partition: "development"` and `slotId: null`.

## Explicit non-goals

- Publishing or inventing numeric floors
- Enabling `createImmunoLockedEvaluator`
- Committing gold, questions with private labels, or reviewer identities
- Promoting development cases into the 120 holdout allocation
