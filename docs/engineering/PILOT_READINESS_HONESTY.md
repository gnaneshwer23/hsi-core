# Pilot readiness honesty (device-local)

**Date:** 19 November 2026  
**Surface:** `/research/home` → Local journey metrics fold  
**Doctrine:** Business vision execution audit — §I first researcher pilot prep without inventing readiness.

## User problem

After §H local milestones ship, owners and researchers need a clear view of **what this device has done** versus **what remains owner-gated** — without claiming the pilot is ready.

## USP advanced

Personal Stage 2–3 prep toward an invite-only pilot — honesty only.

## Reused

- Activation / first useful / repeat reopen / willingness milestone stores
- Research Home metrics fold
- Stage 2 completion checklist pattern (progress ≠ acceptance)

## Implemented (this increment)

- `src/investigation/pilotReadinessHonesty.ts` — local signals + fixed blocked gates
- `PilotReadinessHonestyCard` at the top of `#rh-metrics`
- Unit + Playwright

## Still mocked / partial / blocked

- Staging grants, write packet, source clearance, SME gold
- Steps 12–13 sharing / live re-review
- Production writes
- No invented pilot conversion

## Tests

- `bun test test/pilotReadinessHonesty.test.ts`
- Playwright `site/e2e/research-home.spec.ts`

## Gates

No PHI · invents pilot ready false · invents pilot conversion false · journey complete claimed false · production writes off · pilotReadyClaimed always false.

## Success outcome

Opening Local journey metrics shows a checklist of local pilot-prep signals and explicitly blocked owner gates — never “pilot ready”.
