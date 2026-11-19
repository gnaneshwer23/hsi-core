# USP C — Connected research intelligence (personal path)

**Date:** 19 November 2026  
**Surface:** `/research/workspace` + `/research/home` (+ `/welcome` handoff)  
**Doctrine:** Business vision execution audit — journey over org dashboard shells.

## User problem

Researchers need a **continuous personal path**: profile → investigation → save → reopen the same version → brief — without invented org sharing or live alert delivery.

## USP advanced

**USP C** — Connected research intelligence (**personal Stage 3 slice**; not research-group RBAC).

## Reused

- Researcher onboarding profile (`/welcome`, device-local; server path fail-closed)
- Research Home Ask + Continue researching
- Live investigation workspace + browser `LIVE_RUN_KEY`
- Decision brief exporters already on the workspace

## Implemented (this increment)

- Five-step USP C trail: Profile → Workspace → Save → Reopen → Brief continuity
- Browser investigation **library** (up to 8 runs) with body storage + index; legacy single-slot migrated
- Connected panel on `/research/workspace`: profile handoff, library list, save/reopen, blocked-sharing honesty
- Research Home Continue list shows browser library entries
- Pure helpers: `src/investigation/uspCConnectedTrail.ts`, `src/investigation/liveRunLibrary.ts`

## Explicitly not built

- Org membership / professor–student RBAC
- Circles, community posting, collaborator share links
- Live alert delivery (cadence remains a preference)
- Durable server profile (023 held) or production writes
- Expanding `/workspaces` or `/enterprise` shells

## Tests

- `bun test test/uspCConnectedTrail.test.ts`
- Playwright `site/e2e/live-investigation.spec.ts` (USP C trail + connected panel)

## Gates

No PHI · no Gate C auto-approve · production writes off · org sharing blocked · alerts ≠ live delivery · browser save only.

## Success outcome

A researcher can finish Welcome → Research Home → live workspace, save a run in the browser library, reopen the same briefHash version, and continue to the decision brief — with honest labels that server profile, org share and live alerts are not enabled.
