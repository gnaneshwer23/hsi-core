# ARCH-002 Phase 3.9 — Integration Hardening and Evidence-Backed Acceptance
Date: 2026-11-04
Status: Increment 1 committed; CI pending. NOT production-ready.

## Increment 1: Authenticated read-only research workbench
- src/hsiResearchWorkbenchIntegration.ts composes the Phase 3.4 scoped query interface with the Phase 3.8 workbench projection and Phase 3.3 evidence dossier contract.
- Requires authenticated researcher, research administrator or scientific reviewer from trusted server-side session context.
- Requests governed_research scope only; rejects clinical/public scope leakage, missing focus, unexpected/duplicate dossier IDs and invalid limits.
- Drafts remain drafts; missing evidence remains explicitly visible; no publication or mutation occurs.
- Automated tests cover allowed research access, denial of unauthorised users, scope isolation, missing focus and limits.

## Integration limitations
- HsiGraphReadRepository and HsiWorkbenchDossierReader remain injected interfaces. No Neon adapter, RLS or real evidence dossier store is connected.
- This coordinator is NOT an HTTP endpoint, does not verify session tokens and does not confer production authentication.
- Current query scope is governed_research only. Public approved graph and private clinical graphs must use separate authenticated policies.
- The workbench is a backend projection, not a live interactive UI. No scientific dataset ingestion or human reviewer verification was performed.

## Evidence-backed acceptance gates
1. CI: full Bun tests and TypeScript checks green at latest main SHA.
2. Data: canonical IDs/versioning, no dangling edges, ontology mappings reviewed and reproducible scientific fixtures.
3. Provenance: source rights, retractions, supporting/contradicting evidence and temporal context verified from authoritative sources.
4. Security: trusted session, least-privilege repository, row-level policies, revocation and negative cross-scope tests.
5. Clinical: patient access remains disabled until verified direct-care authorisation, DPIA, DCB0129/0160 and audit.
6. UX: existing ISI research workbench connected to authenticated graph, evidence drawer, uncertainty and review state; accessibility/performance acceptance.
7. Operations: user-led disposable Neon branch verification for Phase 3.4; no production migrations or deployments without explicit approval.
8. Sign-off: engineering/QA, scientific reviewer, privacy/security and product owner record evidence and residual risks.

## Decision
Increment 1 is a meaningful composition of existing components but does not complete Phase 3.9 or satisfy production readiness. The next increments should connect a trusted read repository, evidence store and real ISI data, then verify the user-facing workbench.
