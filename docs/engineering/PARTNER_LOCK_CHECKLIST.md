# Partner lock — founder checklist (empty MoU slots)

**Audit Phase #8.** Engineering harness CLEARED; **founder acceptance BLOCKED** until a human obtains real written partner confirm. Never invent MoU / `legalBinding` / named orgs from chat.

Honesty: fixture `partnerSigned=true` under `hypothetical_test_only` is **path-testing only** · `legalBinding=false` → `lockedPilot=false` · prior Apolo path **revoked 2026-11-02** · no Gate C auto-approve · no live CDS/PHI · HSI Neon = red-wave only.

## Binding pointers

| Item | Value |
|------|--------|
| Active fixture | `test:hypothetical-isi-pilot-partner` |
| Swap module | [`src/hypotheticalPartnerFixture.ts`](../../src/hypotheticalPartnerFixture.ts) |
| Lock builder | [`src/partnerLock.ts`](../../src/partnerLock.ts) |
| Shortlist | [`docs/ISI_PILOT_PARTNER_SHORTLIST.md`](../ISI_PILOT_PARTNER_SHORTLIST.md) |
| Prep packet | `operations/partner/partner-lock-prep.v1.json` |

## A. What engineering already automated

- [x] Stage 1 `scopeLocked=true` for RA / anti-TNF working question
- [x] Hypothetical fixture active (`agreementKind=hypothetical_test_only`)
- [x] `legalBinding=false` → `lockedPilot=false` (even when fixture `partnerSigned=true`)
- [x] Empty MoU / named-partner slots reserved (all null / false)
- [x] `REAL_PARTNER_REPLACEMENT` template with REPLACE_* placeholders
- [x] Shortlist documents fixture + outreach categories (no signed MoU)
- [x] Loud fixture banners in packs / Discovery
- [x] `bun run partner:lock-prep` / `partner:lock-prep:check`

## B. Founder must decide (not inventable by code)

### B1 — Outreach (categories first)

- [ ] Approach institution / disease-foundation **categories** from the shortlist (no invented personal emails)
- [ ] Lead with research-intelligence non-goals (not CDS, not recruitment, not patient prediction)
- [ ] Record interest privately; do not invent named PIs into git

### B2 — Written confirm (empty MoU slots)

- [ ] Named org confirms disease + research question in writing (or rewrites → re-lock scope)
- [ ] Fill `PARTNER-MOU-ORG` / `PARTNER-MOU-WRITTEN` / `PARTNER-MOU-SCOPE` only with real values
- [ ] Optional: legal MoU/MoA artifact URI in `PARTNER-MOU-LEGAL` (keep body private — do not paste into git)
- [ ] Agree licensing + Stage 1 rubric thresholds (`PARTNER-MOU-RUBRIC`)
- [ ] Founder attests `legalBinding` only after written confirm (`PARTNER-MOU-FOUNDER`)

**Empty MoU attestation worksheet (eng):** `operations/partner/mou-attestation-worksheet.v1.json` — all org/URI fields null; `legalBinding=false`. `bun run human-queue:check` refuses invented org names or `legalBinding=true`.

### B3 — Code swap (after B2)

- [ ] Set `USE_HYPOTHETICAL_PARTNER_FIXTURE=false`
- [ ] Fill `REAL_PARTNER_REPLACEMENT` (id, label, `type=named_partner`, region, channel, notes)
- [ ] Set `agreementKind=written_confirm|legal_mou`, `legalBinding=true`, `isHypothetical=false`, `replaceWithRealPartner=false`
- [ ] Update shortlist row to `confirmed` (still no invented emails)
- [ ] Re-run `bun run outputs` — `lockedPilot` becomes true only when `scopeLocked && partnerSigned && legalBinding`

### B4 — Explicit refusals

- [ ] Do **not** re-lock Apolo Pharma without new written confirm (revoked 2026-11-02)
- [ ] Do **not** treat chat “operator assert” as a MoU
- [ ] Do **not** claim Gate C clearance, production writes, or CDS from partner lock

## C. Explicit non-goals

- Inventing MoU text, org names, emails, or `legalBinding=true` in git
- Claiming `lockedPilot=true` under the hypothetical fixture
- Gate C auto-approve / live CDS-PHI
- Pointing HSI at autumn-snow

## Verify (offline)

```sh
bun run partner:lock-prep
bun run partner:lock-prep:check
bun --no-env-file test test/partnerLockPrep.test.ts
```

Expected: `engineeringScaffold=CLEARED`, `founderAcceptance=BLOCKED`, `lockedPilot=false`, `legalBinding=false`, `mouSlotsFilled=0`.
