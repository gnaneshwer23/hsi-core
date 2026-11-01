# How to source-license review (PMID corpus)

**Purpose:** Keep `hsi-source-licensing-stub.*` honest for RA / SSc / gut / neuro pack PMIDs.  
**Not a MoU.** Does not set `legalBinding` or invent licensed corpora.

## Current state (curator pass 2026-11-01)

| Artifact | Role |
|----------|------|
| `hsi-source-licensing-stub.json` / `.md` | Regenerable PMID inventory + **reviewed** `licenseStatus` |
| `reviewDate` / `reviewMethod` | Recorded on the bundle (`Europe PMC core` + Crossref license URLs; conservative) |
| Flip-readiness `licensing` | Still **`pending`** until a **named partner** agrees corpus attribution (OA ≠ partner clearance) |

Regenerate: `bun run outputs` (source: `src/sourceLicensingStub.ts` → `PMID_REVIEW` table).

### Status vocabulary

| Status | Meaning |
|--------|---------|
| `ok_cite` | Citation-only use cleared; no full-text / figure republication claim |
| `ok_oa` | Creative Commons (or equivalent clear reuse) on full text — still respect NC/SA |
| `restricted` | Paywall / all-rights — **cite metadata / PMID locator only** |
| `unknown` | Free or OA-ish signal without a clear CC (e.g. PMC green, Elsevier userlicense) — **do not invent CC-BY** |

Bibliographic citation of a PMID as a Discovery locator is standard scholarly practice for every row; status governs **reuse / redistribution** claims.

## Steps for a follow-up pass

1. **Open the stub** — `site/public/discovery/hsi-source-licensing-stub.json` (or `dist/outputs/latest/` after publish).
2. **For each PMID** — Europe PMC (`europePmcUrl`) + publisher DOI landing + Crossref `license` URLs.
3. **Update `PMID_REVIEW` in `src/sourceLicensingStub.ts`** — prefer `unknown` / `restricted` when unsure; never invent CC-BY.
4. **Re-run** `bun test && bun run outputs`.
5. **Partner corpus lock** — only after written partner agree: document attribution; `partnerClearedCount` / flip-readiness `licensing` can move off pending. Fixture `partnerSigned` does **not** clear this.

## Honesty rules

- `ok_oa` counts are inventory of CC-licensed locators, not commercial pilot clearance.  
- Do **not** paste paywalled full text into this repo.  
- Never point HSI Neon `red-wave` or ISI `autumn-snow` at a shared “evidence dump” that mixes licensed + public without a rights gate.  
- See [`ISI_IMMUNICITY_WIRING_PLAYBOOK.md`](./ISI_IMMUNICITY_WIRING_PLAYBOOK.md) and [`OUTPUTS.md`](./OUTPUTS.md).
