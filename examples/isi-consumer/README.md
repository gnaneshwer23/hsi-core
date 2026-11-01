# ISI consumer reference (hsi-core demo only)

Minimal TypeScript client that proves the HSI → ISI **consume contract** against local fixtures under `site/public/discovery/`.

**Not an immunecity edit.** Copy patterns into immunecity in a separate repo session.

## Run

```bash
cd ~/Projects/hsi-core
bun test test/isiConsumerWiring.test.ts
bun run examples/isi-consumer/demo.ts
```

Optional fixture root:

```bash
HSI_DISCOVERY_DIR=site/public/discovery bun run examples/isi-consumer/demo.ts
```

## What it does

1. Loads `hsi-isi-wiring-spec.json` (docs) + `hsi-isi-consume-contract.json` (discovery).
2. Asserts honesty flags (`notCds`, `autoApproveIntoKg=false`, `partnerSigned=false`).
3. Loads Discovery core files in contract load-order priority.
4. Prints grade bands + Gate C pending invariant.
5. Exits non-zero on contract violations.

See [`docs/ISI_IMMUNICITY_WIRING_PLAYBOOK.md`](../../docs/ISI_IMMUNICITY_WIRING_PLAYBOOK.md).
