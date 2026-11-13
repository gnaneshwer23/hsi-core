# Agent and scientific policies

Requirements A03/A07/A08/A09/A11. Existing orchestration and scientific contracts govern; department navigation adds no model execution or review authority.

## Small runtime, complete responsibilities

Use an orchestrator (NEXUS), evidence/context investigator (SCOUT/AEGIS/PRISM/ATLAS/HELIX/PARALLAX responsibilities) and independent verifier (VERITAS), with deterministic tools for identity, lookup, traversal, permissions and integrity. ARBITER coordinates authorised human review; SENTINEL monitors refresh, CALIBER evaluates and WARDEN enforces operational limits. HORIZON/planner remains optional and gated by equal-budget independently reviewed ablation. Agent names are responsibilities, not thirteen separately deployed LLMs.

Current truth: [hsiAgentOrchestrator.ts](../../src/hsiAgentOrchestrator.ts) returns permission envelopes, not persisted external completion proof. [collectivePipeline.ts](../../src/collectivePipeline.ts) explicitly composes fixture execution. [liveRun.ts](../../src/liveRun.ts) requires injected approved dependencies/readiness. PR #327 separately composes live dependencies under mocks. The homepage only explores recorded evidence and drafts an inspection; it must not display synthetic running agents as real activity.

## Exact context and response contract

Before any live invocation the server must bind investigation ID, authorised department/disease scope, selected entity/relationship IDs, filters, source IDs/versions/clearance, experimental context, question and graph snapshot to an immutable task/run receipt. Validate complete batch and permissions before egress. UI department changes must not silently alter an already bound task; create a new task/version explicitly. Existing URL exports are view state, **not an agent authorisation token**.

Findings must separate supported source evidence, scientific interpretation, uncertainty, opposing observations, hypothesis and missing evidence. No source or passage fabrication. Retain species, tissue, assay, timing, dose/unit, population and estimand/missingness. Do not infer causality from topology, pool incomparable studies, treat model agreement as scientific proof or turn an empty search into consensus/novelty. Rights/withdrawal/retraction/expiry/revocation must gate new egress and flag dependent artifacts.

All public source candidates/gaps remain unreviewed and not calibrated. No scientific promotion by an agent; independent scoped scientific review plus separate publication gate required. Exports carry explicit false approval/promotion/live-execution flags. Independent scientific thresholds and expert gold must be agreed before holdout evaluation; no synthetic reviewer identities or self-authored gold presented as accepted.

Acceptance: [hsiAgentOrchestrator.test.ts](../../test/hsiAgentOrchestrator.test.ts), [liveRun.test.ts](../../test/liveRun.test.ts), [reliabilityEvaluationHarnessB044.test.ts](../../test/reliabilityEvaluationHarnessB044.test.ts), [scientificReliabilityGateB044.test.ts](../../test/scientificReliabilityGateB044.test.ts), [sourceClearanceReceipt.test.ts](../../test/sourceClearanceReceipt.test.ts), [comparabilityPolicy.test.ts](../../test/comparabilityPolicy.test.ts), [helixVantage.test.ts](../../test/helixVantage.test.ts), [reviewPacket.test.ts](../../test/reviewPacket.test.ts), [caliberHarness.test.ts](../../test/caliberHarness.test.ts), [atlasDepartments.test.ts](../../test/atlasDepartments.test.ts). Two real approved provider deployments and the 120-case independently adjudicated benchmark are separate unfulfilled acceptance gates, not implied by these tests.
