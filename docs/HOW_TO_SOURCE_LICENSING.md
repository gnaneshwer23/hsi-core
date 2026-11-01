# How to source-license review (PMID corpus)

**Purpose:** Practical steps to promote rows in `hsi-source-licensing-stub.*` beyond `needs_review` once a real partner engages.  
**Not a MoU.** Does not set `legalBinding` or invent licensed corpora.

## What exists today

| Artifact | Role |
|----------|------|
| `hsi-source-licensing-stub.json` / `.md` | Regenerable PMID inventory from RA / SSc / gut / neuro packs |
| Each row `licenseStatus` | Currently **`needs_review`** until a human clears it |
| Flip-readiness `licensing` | Stays **`pending`** until partner-cleared rows exist |

Regenerate: `bun run outputs` (source: `src/sourceLicensingStub.ts`).

## Steps on your machine

1. **Open the stub**  
   `site/public/discovery/hsi-source-licensing-stub.json` (or `dist/outputs/latest/` after publish).

2. **For each PMID (or partner-priority subset)**  
   - Open PubMed / Europe PMC (`europePmcUrl` on the row).  
   - Check publisher page for license (CC-BY, CC-BY-NC, all-rights-reserved, embargo, institutional subscription).  
   - Note whether HSI may **redistribute full text**, **abstract only**, or **cite PMID only**.

3. **Record the decision with the partner**  
   - Prefer a short rights table (PMID → license → allowed use → attribution text).  
   - Do **not** paste paywalled full text into this repo.  
   - Public PMIDs as locators are fine; claiming a “licensed corpus” requires written partner agree.

4. **Promote stub rows (in a follow-up change)**  
   - Only after written partner confirm: update `licenseStatus` (e.g. `partner_cleared` / `cite_only` / `blocked`) in the licensing module / export.  
   - Re-run `bun test && bun run outputs`.  
   - Flip-readiness `licensing` can then move off `pending`.

5. **If the partner adds licensed corpora**  
   - Keep those sources out of public Discovery JSON until rights are clear.  
   - Never point HSI Neon `red-wave` or ISI `autumn-snow` at a shared “evidence dump” that mixes licensed + public without a rights gate.

## Honesty rules

- Stub counts (`needsReviewCount`) are inventory, not clearance.  
- Fixture `partnerSigned` does **not** clear licensing.  
- See also [`ISI_IMMUNICITY_WIRING_PLAYBOOK.md`](./ISI_IMMUNICITY_WIRING_PLAYBOOK.md) and [`OUTPUTS.md`](./OUTPUTS.md).
