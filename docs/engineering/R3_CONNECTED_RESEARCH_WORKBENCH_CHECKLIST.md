# R3 — Connected Research Workbench (eng deepen)

**Roadmap phase R3** from *HSI End-to-End Architecture and Roadmap*: Ask → retrieve → investigate → verify → review → export — exit: **researcher can complete journey on authenticated APIs**.

**Verdict:** Engineering scaffold **CLEARED** · Scientific acceptance **BLOCKED** · Rights acceptance **BLOCKED**.

Honesty: synthetic fixture ≠ scientific gold · `researcherJourneyCompleteClaimed=false` · `productionReadyClaimed=false` · `writesEnabledClaimed=false` · no hard-coded scientific output · inspectable passages from backend only · `scientificAcceptance=BLOCKED` · no Gate C auto-approve · no MoU invent · no live CDS/PHI · HSI Neon = red-wave only · **human #2/#3/#4/#5/#8 explicitly parked**.

## Binding pointers

| Item | Value |
|------|--------|
| Mechanism workflow (PR #62) | `src/researchMechanismWorkflow.ts` · `/research/mechanism-workflow` |
| Investigation APIs | `/api/research/interrogative/*` · `/api/research/graph/ssc` |
| Synthetic fixture | `hsi-interrogative-test-fixture-ws-001` · honesty banner preserved |
| R3 journey manifest | `research/connected-workbench/r3/workbench-journey.v1.json` |
| Harness | `bun run r3:prepare` · `bun run r3:check` |
| Target exit | Authenticated researcher completes Ask→export (not claimed here) |

## A. What engineering already automated

- [x] Versioned R3 journey manifest (`hsi-r3-connected-research-workbench-1`)
- [x] Six stages Ask→retrieve→investigate→verify→review→export bound to real `/api/research/*` paths
- [x] PR #62 mechanism workflow steps fully covered by stage mapping
- [x] Synthetic fixture honesty banner preserved; recorded pilot decision unchanged
- [x] Inspectable passage source hints for retrieve / verify / export (backend-sourced only)
- [x] UI deepen on `/research/mechanism-workflow` probes APIs and surfaces passage previews from responses
- [x] `bun run r3:prepare` / `r3:check` + unit tests
- [x] `researcherJourneyCompleteClaimed=false` · `scientificAcceptance=BLOCKED`

## B. Humans must supply (parked — not inventable by code)

### B1 — #5 authenticated journey (PARKED)

- [ ] Verified researcher session walks Ask→export on live APIs
- [ ] Keep `writesEnabledClaimed=false` / production writes disabled until ops clear
- [ ] Do **not** claim `researcherJourneyCompleteClaimed=true` from eng probes alone

### B2 — Science / partner (PARKED #4/#8/#2)

- [ ] Scientific acceptance of mechanism answers (SME / partner)
- [ ] External usefulness / pilot findings
- [ ] Rights-cleared passage corpus expansion
- [ ] Do **not** claim `scientificAcceptance=CLEARED` from this scaffold

### B3 — Explicit refusals

- [ ] Do **not** invent passage text or hard-coded scientific output
- [ ] Do **not** invent SME gold, MoU, or Gate C auto-approve
- [ ] Do **not** claim production-ready or flip production `writesEnabled`
- [ ] Do **not** use autumn-snow for HSI

## C. Residual parked (user constraint)

| Residual | Status |
|----------|--------|
| #2 N1 rights | **PARKED** |
| #3 cite HITL | Parked |
| #4 SMEs | **PARKED** |
| #5 staging | **PARKED** — auth session required for live exit |
| #8 MoU | Parked — never invent |

## Verify (offline)

```sh
bun run r3:prepare
bun run r3:check
bun run gold:check
bun --no-env-file test test/r3ConnectedResearchWorkbench.test.ts
```

Expected: `engineeringScaffold=CLEARED`, `scientificAcceptance=BLOCKED`, `researcherJourneyCompleteClaimed=false`, `hardCodedDemoContent=0`, `apiBoundStages=6`.
