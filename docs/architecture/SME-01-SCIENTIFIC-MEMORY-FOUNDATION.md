# SME-01 — Scientific memory foundation
Status: preliminary audit; not approved for implementation or production. Tracks #657.

## Observed HSI baseline (main, 2026-11-24)
ADR-012 proposes one investigation aggregate (investigations, events, outputs); owner sign-off and preview isolation remain required. Do not create a seventh investigation store. Existing src/hsiAgentOrchestrator.ts, src/hsiAgentDurableCheckpoint.ts, src/db/hsiNeonCheckpointStore.ts and src/db/hsiCheckpointRecoveryService.ts are reuse candidates identified from tree inspection, not runtime-validated. U33 documentation explicitly does not claim live Neon writes or multi-process E2E. src/correctionProvenance.ts separates frozen evaluation, gated training and unreviewed working-set corrections; preserve those boundaries.

## Upstream screening
GitHub metadata confirms MIT for garrytan/gbrain (master), akitaonrails/ai-memory, huytieu/COG-second-brain, smixs/agent-second-brain, itechmeat/open-second-brain (main). HSI is Apache-2.0. MIT notices must be preserved if code is reused. Exact revisions, dependency licences, code audit and threat review remain pending. Karpathy wiki gist and Claude Second Brain exact source/licence unresolved; design inspiration only pending verification. No external dependency approved.
Prefer native implementations of shared retrieval (GBrain), developer-only handoff (AI Memory), independent verification (COG), optional consented voice capture (Agent Second Brain), correction proposals (Open Second Brain), versioned wiki and personal workspace.

## Proposed logical contracts (not migrations)
MemoryRecord: id, tenantId, scopeId, ownerId, kind (note, preference, hypothesis, evidence_reference, investigation_reference), sourceRefs, version, status, retentionUntil, createdAt, supersedesId. References to existing investigation IDs only after ADR-012 resolution. No patient identifiers or raw clinical records.
MemoryEvent: recordId, actorId, action, timestamp, version, audit reference; avoid raw sensitive payloads in logs.
MemoryAccess: derive identity and scope from verified server session, not request body; deny by default, explicit sharing, revoke access and invalidate caches.
Memory retrieval: authorize before ranking and recheck before returning; cite source and version; retrieved text is untrusted data, never executable instructions.
Correction proposal: separate preferences from scientific claims; no automatic policy or graph promotion; route scientific corrections through existing verification and feed separation.
Proposed API operations: create note, list/search authorized records, revise, revoke, delete/export, propose correction. Idempotency and optimistic concurrency required. No routes enabled in SME-01.

## Backlog
SME-01A pin upstream commits, inspect READMEs, licences, dependencies, source and security; resolve two missing sources; record reuse decision per project.
SME-01B inspect existing runtime and authorization implementations, reconcile ADR-012/013/014 and migration holds; obtain owner review.
SME-02 feature-flagged scoped memory persistence and retrieval on isolated preview, no production writes.
SME-03 versioned wiki with provenance; SME-04 checkpoint references and resume; SME-05 correction proposals; SME-06 optional voice/avatar capture; SME-07 institutional sharing; SME-08 independent acceptance.
## Acceptance
Before SME-02: complete upstream audit and owner architecture approval. Before activation: CI, two-tenant isolation including search and cache, revocation/deletion, restart recovery, prompt injection, retraction propagation, provenance, and retrieval evaluation across Immunology & Inflammation, Neuroscience, Microbiome & Metabolism, Genomics & Multi-omics, Organ & Tissue Biology, Disease Mechanisms. Synthetic preview data only. No scientific claim promotion from memory. No production migration or deployment in this PR.
