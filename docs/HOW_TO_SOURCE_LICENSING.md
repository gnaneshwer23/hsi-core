# How to source-license review (PMID corpus)

**Purpose:** Keep `hsi-source-licensing-stub.*` honest for RA / SSc / gut / neuro pack PMIDs.  
**Not a MoU.** Does not set `legalBinding` or invent commercial publisher licenses.

## Current state (curator + Apolo clearance 2026-11-01)

| Artifact | Role |
|----------|------|
| `hsi-source-licensing-stub.json` / `.md` | Regenerable PMID inventory + **reviewed** `licenseStatus` + **partner clearance** |
| `reviewDate` / `reviewMethod` | Recorded on the bundle (`Europe PMC core` + Crossref license URLs; conservative) |
| Flip-readiness `licensing` | **`pass`** for Apolo Pharma Stage 1 when `partnerClearedCount > 0` |

Regenerate: `bun run outputs` (source: `src/sourceLicensingStub.ts` → `PMID_REVIEW` table).

### Status vocabulary (`licenseStatus`)

| Status | Meaning |
|--------|---------|
| `ok_cite` | Citation-only use cleared; no full-text / figure republication claim |
| `ok_oa` | Creative Commons (or equivalent clear reuse) on full text — still respect NC/SA |
| `restricted` | Paywall / all-rights — **cite metadata / PMID locator only** |
| `unknown` | Still ambiguous after recheck — **do not invent CC-BY**; leave `uncleared` until confirm |

Bibliographic citation of a PMID as a Discovery locator is standard scholarly practice for every row; status governs **reuse / redistribution** claims.

Pack corpus note (2026-11-01 second pass): former PMC-green / Elsevier-userlicense / CHORUS rows with **no CC** were promoted to `ok_cite` → `cite_metadata_pilot` (citation edges only). No invented CC licenses. Stage 1 pack `uncleared=0`.

### Partner clearance (`clearanceScope`) — Apolo Pharma Stage 1

Operator-asserted **2026-11-01** with `partner:apolo-pharma` (cite-only pilot for `restricted`/`ok_cite`; OA reuse under publisher terms for `ok_oa`):

| `licenseStatus` | `partnerCleared` | `clearanceScope` | Meaning |
|-----------------|------------------|------------------|---------|
| `ok_oa` | `true` | `oa_reuse` | Cite + OA full text as publisher CC/OA license permits (NC/SA respected) |
| `restricted` / `ok_cite` | `true` | `cite_metadata_pilot` | Cite-metadata-only pilot use — **not** FT redistribution |
| `unknown` | `false` | `uncleared` | Left uncleared with `needs_confirm` note (none remaining in Stage 1 pack set) |

`partnerClearedCount` = rows with `partnerCleared=true`. Stub `partnerSigned` stays `false` (not a publisher MoU).

## Steps for a follow-up pass

1. **Open the stub** — `site/public/discovery/hsi-source-licensing-stub.json` (or `dist/outputs/latest/` after publish).
2. **For each PMID** — Europe PMC (`europePmcUrl`) + publisher DOI landing + Crossref `license` URLs.
3. **Update `PMID_REVIEW` in `src/sourceLicensingStub.ts`** — prefer `ok_cite` / `restricted` when cite-only is enough; never invent CC-BY.
4. **Re-run** `bun test && bun run outputs`.
5. **New ambiguous PMIDs** — keep `unknown`/`uncleared` until confirm; never invent commercial FT rights.

## Honesty rules

- `oa_reuse` is inventory of CC/OA-licensed locators under publisher terms, not a blanket commercial corpus license.  
- `cite_metadata_pilot` does **not** grant full-text or figure republication.  
- Do **not** paste paywalled full text into this repo.  
- Never point HSI Neon `red-wave` or ISI `autumn-snow` at a shared “evidence dump” that mixes licensed + public without a rights gate.  
- See [`ISI_IMMUNICITY_WIRING_PLAYBOOK.md`](./ISI_IMMUNICITY_WIRING_PLAYBOOK.md) and [`OUTPUTS.md`](./OUTPUTS.md).
