# Client-bundle secret scan soft-land (PROD-QA-003)

**Status:** Engineering soft-land. Defensive high-confidence scan of `site/dist`.  
**Not claimed:** Independent AppSec acceptance, full-history coverage, or scientific approval.

Script: [`scripts/scan-client-bundle-secrets.ts`](../../scripts/scan-client-bundle-secrets.ts).  
Typed catalog: [`src/operations/clientBundleSecretScanSoftLand.ts`](../../src/operations/clientBundleSecretScanSoftLand.ts).  
Pending: [`operations/staging/client-bundle-secret-scan.pending.json`](../../operations/staging/client-bundle-secret-scan.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Missing `site/dist` | Skip (exit 0) — **not a pass** |
| Clean high-confidence scan | Useful signal only |
| AppSec accepted | Always `false` |
| Full-history Gitleaks | Still required in CI |

## Command

```bash
cd site && bun run build
bun run scan:client-bundle
```

## Owner next steps

1. Run after public builds before L0 GO.  
2. Assign AppSec reviewer for PROD-QA-003 close-out.  
3. Keep Gitleaks full-history CI as the repository gate.

**Never invent** AppSec acceptance from a clean local scan.
