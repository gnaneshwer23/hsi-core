# U41 — Scientific Companion (text-first on KG/evidence) (21 November 2026)

**Phase:** Vision Phase 2 · next milestone after engine hardening  
**Owner approval:** Text-first companion engineering authorized (21 November 2026).  
**Not claimed:** Voice, avatar/Nuance, networking/matching, unfenced LLM free-text, scientific approval, Gate C, PHI, production writes, or GA.

## Change

1. Owner approval envelope `hsiScientificCompanionAuthorization`.  
2. Runtime `runHsiScientificCompanionTurn` — modes `discuss` / `critique` / `experiment_planning` composing interrogative planning + falsification.  
3. Soft-land catalog `hsiScientificCompanionSoftLand` (Phase 2 ready; Phase 3+ gated).  
4. UI shell `/research/companion` in the research app chrome.  
5. Docs + readiness phase row.

## Honesty

| Claim | Soft-land |
|---|---|
| Text-first companion turns on KG/interrogative services | **Yes** |
| Same authorised scientific services as workbench (planning path) | **Yes** |
| Voice / avatar / Nuance | **No** (Phase 3) |
| Networking / matching | **No** (Phase 4–5) |
| Scientific approval / Gate C / PHI / production writes | **No** |
| Unfenced free-text LLM answers | **No** |

## Acceptance

- `bun test test/hsiScientificCompanionRuntime.test.ts`  
- Open `/research/companion` and run Discuss / Critique / Plan experiments  
