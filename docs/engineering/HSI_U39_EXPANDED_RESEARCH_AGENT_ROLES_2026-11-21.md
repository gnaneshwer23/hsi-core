# U39 — Expanded checkpointed research-agent roles (21 November 2026)

**Phase:** Production readiness · ARCH-009 · expand beyond U35 planner → contradiction  
**Owner approval:** Research-agent engineering runtime remains authorized (U35, 21 November 2026).  
**Scope:** Wire additional deterministic ARCH-003 / catalogue roles behind durable checkpoints under `pipeline: "expanded_ssc"`.  
**Not claimed:** LLM execution, Gate C auto-approve, PHI/clinical data, held Neon migrations, live multi-process staging E2E, scientific approval, or graph publication.

## Change

1. New ARCH-003 adapters: evidence retriever (optional curated release), hypothesis generator (draft-only), safety policy gate.  
2. `runHsiAuthorizedResearchAgentRuntime` accepts `pipeline: "planner_contradiction" | "expanded_ssc"`.  
3. Expanded path: `question_planner` → (`evidence_retriever`) → `contradiction_analyst` → `claim_verifier` → `hypothesis_generator` → `safety_policy_gate`.  
4. Default remains `planner_contradiction` for U35/U37 backward compatibility.  
5. Draft resolution: `claim_verifier` / `hypothesis_generator` depend on the draft-owning task (`plan` or `retrieve`) as well as prior roles — contradict emits a falsification ref, not a draft.

## Roles

| Role | Status |
|---|---|
| question_planner | U35 (unchanged) |
| contradiction_analyst | U35 (unchanged) |
| claim_verifier | **U39** gap verification |
| hypothesis_generator | **U39** draft-only registry proposals |
| safety_policy_gate | **U39** refuse clinical/PHI/Gate C |
| evidence_retriever | **U39** optional when curated snapshot supplied |
| entity_resolver / graph_reasoner / interrogator | Still not checkpointed hosts (partial assets only) |

## Honesty

| Claim | Soft-land |
|---|---|
| Expanded roles run behind checkpoints under owner approval | **Yes** |
| Hypotheses are proposed drafts only | **Yes** |
| Scientific approval / Gate C / PHI | **No** |
| Live multi-process / Neon durable deploy | **No** |

## Acceptance

- `bun test test/hsiResearchAgentRuntime.test.ts test/hsiArch003AgentAdapters.test.ts`  
