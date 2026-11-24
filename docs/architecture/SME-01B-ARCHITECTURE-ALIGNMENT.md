# SME-01B — Scientific Memory architecture alignment
Status: proposed, preparation only. Depends on #657 and PR #658 security acceptance. No runtime, migration, provider or deployment changes authorised.
Baseline inspected: 1f6ee3841c0dd6c052b60694fb4e9067e111c213.
## Existing contracts and blockers
- ADR-012 proposed: one investigation aggregate, events and outputs. researchInvestigationStore.ts currently writes hsi_research_investigation_runs with trusted actor and published release validation. Memory must reference canonical investigation IDs after consolidation; no seventh investigation store.
- ADR-013 proposed: database-verified session principal, RLS, restricted procedures; never trust app-set owner settings or caller-provided actor objects as sole proof.
- ADR-014 proposed: registry and revocable memberships. reviewerAuthority.ts currently restricts authority to ssc/ra. Preserve current restrictions until registry migration and independent review; no implicit authority expansion.
- migrationHolds.ts holds 022–033 inclusive; preserve holds. No assertion about remote ledger.
- hsiAgentOrchestrator.ts has bounded tasks, governed tool gateway and authoriseCall callback. Add memory through an explicitly authorised gateway contract later, not raw database access by agents.
- hsiNeonCheckpointStore.ts uses investigation/task CAS and input hash; adapter does not itself establish end-user identity. Reuse only behind authorised service; never expose raw checkpoint reads to clients.
- correctionProvenance.ts separates frozen evaluation, gated training and unreviewed working set. Memory cannot write graph, training or evaluation automatically.
## Logical architecture
Verified session -> principal and membership resolution -> memory policy service -> authorised repository -> scoped retrieval -> governed orchestrator -> evidence verification -> separate scientific decision and graph release.
Personal, project, department and institution visibility are explicit grants, not implicit hierarchy inheritance. Tenant boundary is mandatory. Institution admin does not automatically read private notes. External collaborators require revocable scoped grants. Hierarchical registry extension requires owner ADR approval.
## Proposed storage contracts (not SQL)
Memory record: opaque id, tenant, scope, owner, kind, visibility, data class, version, lifecycle, retention policy, source references, created timestamp. Version payload separate from metadata; immutable revision lineage subject to deletion policy. Memory event: actor, operation, record/version, timestamp, request id, non-content audit metadata. Grant: record/scope, grantee, permission, expiry, revoked timestamp. Index: tenant/scope/record/version, embedding model version, source status; derived index never authority.
Kinds: note, preference, hypothesis, evidence reference, investigation reference. No patient identifiers or raw clinical records; public biomedical and synthetic data initially, licensed data only after rights approval. Clinical product connections remain separate governed interfaces.
## API and agent contracts
Create/revise/search/read/revoke/delete/export/propose-correction. Resolve identity server-side and in database; deny default; authorise before retrieval and recheck before response. Search result includes source/version, evidence status, context and limitations. Use bounded results and no cross-tenant caches; invalidate on revocation, deletion or retraction. Idempotency keyed by tenant/principal/operation/request; optimistic concurrency expectedVersion. No raw payloads in logs. Retrieved content is untrusted data, never instructions. No agent self-grants, silent promotion or tool execution from retrieved text.
## Product mapping
Researcher/student: personal notes, investigation continuity, cited wiki. PI: explicitly shared project memory and research gaps. Department/institution: permissioned aggregate views with disclosure controls. Agents: retrieve scoped context, propose corrections; verifier adjudicates scientific evidence independently. Voice/avatar: consented capture later, no default external egress. Clinical data excluded from general memory.
## SME-02 implementation sequence after approval
1. Confirm ADR owner decisions, tenant hierarchy, canonical investigation identifiers and preview database role.
2. Implement pure contracts and policy tests; feature flag off by default.
3. Add isolated preview schema and restricted procedures after independent migration review; no production apply.
4. Implement authorised CRUD and versioned search; initially lexical, then embeddings only after provider/rights approval.
5. Integrate gateway read/proposal tools with scoped authorisation and audit receipts.
6. Execute two-tenant matrix including forged settings, revoked membership, cache/index leakage, concurrency, deletion, export, injection, retraction, recovery and audit minimisation.
7. Evaluate retrieval/provenance/abstention across Immunology & Inflammation; Neuroscience; Microbiome & Metabolism; Genomics & Multi-omics; Organ & Tissue Biology; Disease Mechanisms. Disease examples are optional.
## Exit gates
SME-01A reference-only decision and evidence reviewed; no upstream imports approved. ADR-012/013/014 owner decisions recorded; independent security review of proposed access and storage model; preview test plan agreed. SME-02 runtime implementation remains blocked until these gates. CI passing alone does not confer scientific or production acceptance.
