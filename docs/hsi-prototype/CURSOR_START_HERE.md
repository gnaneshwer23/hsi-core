# Cursor — HSI Master Audit and Prototype Delivery Instruction

You are working in the EXISTING hsi-core repository. Read README.md, MASTER_SPEC.md and ARCHITECTURE.md in this directory first, then inspect the actual codebase. These documents are proposed requirements, NOT proof that any feature is implemented.

## Hard rules
- Preserve existing vision, six domains, products, scientific workflows and architectural investments.
- Do not pivot to one disease, replace the platform, or add unnecessary new agents.
- Do not change production, deploy, migrate or expose private data without explicit review.
- Do not assume old PRs or claimed milestones are functional; verify source, tests and deployed behaviour.
- No real identifiable patient data in the prototype. Synthetic records must be visibly labelled.
- No cross-tenant sharing or model training on private data without specific authorisation.
- No claim of scientific discovery without independent validation.

## Task A — Truth audit FIRST
Inspect repository structure, dependencies, routes, UX, authentication, server-verified sessions, RBAC, Neon schema/migrations/branches, tenant isolation, API integrations, evidence provenance, retraction/licence checks, dual verification, graph, agents, job durability, saved investigations, role onboarding, dashboards, dataset ingestion, matching, tests, CI and deployments.

Produce `docs/hsi-prototype/CURRENT_STATE_AUDIT.md` with a table: capability | status (working/partial/mock/missing/broken) | files | tests | deployed evidence | blocker | reuse decision. Record CI failures and security gates. Distinguish planned vs demonstrated.

## Task B — Engineering design
Produce `IMPLEMENTATION_PLAN.md`, `DATA_DICTIONARY.md`, `API_CONTRACTS.md`, `SECURITY_AND_EVALS.md` and `DEMO_SCRIPT.md`. Include frontend sitemap, seven role dashboards, UX states, migration strategy, entity model, connector contracts, dataset provenance, access control, synthetic generation approach and reproducible end-to-end tests.

## Task C — Prototype after audit approval
Implement the smallest coherent, testable vertical slice:
onboarding → role dashboard → private project → authorised synthetic multi-omics dataset → real external scientific evidence → verified mechanism/graph/gap/hypothesis → saved research brief → public/opt-in collaborator matching → explicit share preview → invitation/accept/decline/revoke → monthly refresh design.

Do not build a disconnected showcase or simulate successful provider responses without visible demo-mode labelling. Prefer existing implementation over duplicate services. Do not silently promote generated hypotheses to graph facts.

## Task D — Verification
Run unit/integration/E2E tests, real connector smoke tests, source/licence checks, independent scientific review fixtures, adversarial prompt injection, two-tenant isolation, accessibility, performance and deployment validation. Report precise command, result, timestamp and unresolved blockers.

## First response expected
1. What the current HSI vision and architecture are according to repository files.
2. What is actually built, with file paths and test evidence.
3. What is partial, mocked, broken or absent.
4. What should be reused.
5. A dependency-ordered plan for the prototype, with security gates.
6. Questions requiring explicit approval.

**Stop after audit and plan; do not implement or merge until reviewed.**
