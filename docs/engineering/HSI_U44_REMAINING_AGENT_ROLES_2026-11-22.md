# U44 — Remaining checkpointed research-agent roles (22 November 2026)

**Phase:** Production readiness · ARCH-009 · close U39 entity/graph/interrogator gap  
**Owner approval:** Research-agent engineering runtime remains authorized (U35, 21 November 2026); owner directed “Build next step” after U43 merge (22 November 2026).  
**Scope:** Checkpoint `entity_resolver`, `graph_reasoner`, and `interrogator` under `pipeline: "full_ssc"`.  
**Not claimed:** LLM execution, Gate C auto-approve, PHI/clinical data, held Neon migrations, live multi-process staging E2E, scientific approval, or graph publication.

## Change

1. ARCH-003 adapters: entity resolver, graph reasoner, interrogator (deterministic draft-derived artifacts).  
2. `runHsiAuthorizedResearchAgentRuntime` accepts `pipeline: "full_ssc"`.  
3. Full path: `question_planner` → `entity_resolver` → (`evidence_retriever`) → `graph_reasoner` → `interrogator` → `contradiction_analyst` → `claim_verifier` → `hypothesis_generator` → `safety_policy_gate`.  
4. Soft-land catalog + readiness / ARCH-009 honesty updates.

## Roles

| Role | Status |
|---|---|
| question_planner … safety_policy_gate (U35/U39) | Unchanged |
| entity_resolver | **U44** checkpointed |
| graph_reasoner | **U44** checkpointed |
| interrogator | **U44** checkpointed |

## Honesty

| Claim | Soft-land |
|---|---|
| All ARCH-003 catalogue roles can run behind checkpoints on `full_ssc` | **Yes** |
| Deterministic adapters only (no LLM) | **Yes** |
| Scientific approval / Gate C / PHI / Neon live E2E | **No** |

## Acceptance

- `bun test test/hsiResearchAgentRuntime.test.ts test/hsiArch003AgentAdapters.test.ts test/hsiRemainingAgentRolesSoftLand.test.ts`  
