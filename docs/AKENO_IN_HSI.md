# Akeno in hsi-core — status

**Status:** In-repo HITL consumer of Phase 8 translation handoff (not live CDS).

## What landed

| Path | Role |
|------|------|
| `akeno/` | Provenance, README, non-HSI `AKENO_*` env example |
| `src/akenoConsumer.ts` | Typed consumer + fail-closed HITL decision stubs |
| `site/src/pages/AkenoConsumer.tsx` | `/akeno` review UI |
| Discovery **TRANSLATE** | Deep-link to `/akeno` |

Consumes regenerable `hsi-translation-handoff.json` (`aksh:` clinic ids, LOINC, HITL-required candidates).

## Provenance

See [`akeno/PROVENANCE.md`](../akeno/PROVENANCE.md).

- **akenohealth** `@620a0f0…` — governance / guardrail action shapes adapted
- **akeno-health-ai** `@898dddf…` — Lovable marketing reference only (not vendored)

## Neon isolation (binding)

| DB | Use from hsi-core |
|----|-------------------|
| HSI `hsi-neon-project` | Sole substrate / migrations / Gate C local placeholders |
| Akeno `akeno-neon-project` | **Never** — optional `AKENO_*` docs only; unused by consumer |
| ISI `autumn-snow` / DeliverX | **Never** for HSI |

Hard gates on every candidate: `clinicalActive=false` · `clinicalUse=not_for_clinical_use` · `hitlRequired=true` · `autoApprove=false` · `cdsSurfacable=false`.

## How to run

```bash
bun test
bun run outputs
bun run site:dev   # → http://localhost:5173/akeno
```

## Still outside / gated

Partner cohorts, HCP evaluation, regulatory CDS (R3–R5), full akenohealth Neon dashboard / PHI services, EHR write-back.
