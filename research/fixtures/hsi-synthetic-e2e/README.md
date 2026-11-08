# HSI synthetic e2e — contract pin (vendored, not absorbed)

**Label:** `e2e-fixture` (not `hsi-synthetic-validation-0.1`)  
**Pack version:** `hsi-fixture-1.0.0` · **seed:** `20261106` · **namespace:** `SYNTHETIC/HSI/v1`

This directory vendors **small contract + sample payload files only**. The full pack (JSONL tables, SQLite, learning sets, Python CLI / `engine.py`) stays **external**.

| Role | Path |
| --- | --- |
| In-repo pin | `research/fixtures/hsi-synthetic-e2e/` (this tree) |
| Hash / seed authority | [`MANIFEST.json`](./MANIFEST.json) |
| Status receipt | [`STATUS.json`](./STATUS.json) · [`docs/engineering/SYNTHETIC_E2E_FIXTURE_STATUS.md`](../../../docs/engineering/SYNTHETIC_E2E_FIXTURE_STATUS.md) |
| External full pack (do not modify from here) | `/Users/gnaneshwerjadav/Downloads/hsi-synthetic-e2e/` |

## Verify hashes

```sh
bun run fixture:synthetic-e2e:check
# or: shasum -a 256 PACK_MANIFEST.json api_contract.json schema_contract.json outputs/sample_*.json
```

Compare digests to `MANIFEST.json` → `pin.*.sha256`.

## Honesty (contract pin)

Pinned samples must keep `synthetic: true`, permanent synthetic banner fields, `confidence.value: null`, and screening notices that are **not** confirmed live eligibility. No HTTP server is implied by this pin.

## Explicit non-goals

- Do not copy 48k-scale JSONL / SQLite / learning sets into git
- Do not treat `engine.py` as product authority
- Do not invent MoU, Gate C auto-approve, live CDS/PHI, or Neon writes
