# P0.4 — Trusted scientific integration: release and deployment gates

## Implemented on main
- `src/adapters/isiPinnedRelease.ts`: commit-pinned, SHA-256-verified, bounded-size source artifact intake; exact `immunecity` repository and `src/data/kg.json` v0.3 contract.
- `test/isiPinnedRelease.test.ts`: tampering, mutable refs, invalid relationships and no automatic publication tests.
- Existing P0.3 research workbench and evidence review queue are read-only; prior CI succeeded.

## Required before P0.4 can be called complete
1. **ISI publisher:** Produce and sign an immutable release manifest in `immunecity` from an actual commit. HSI must pin an independently trusted manifest or allowlisted digest; never accept both bytes and their claimed hash from the same untrusted requester as proof of trust.
2. **Authenticated release endpoint:** Server-side route must verify a provider-backed researcher session, research grant, canonical origin, pinned manifest and HSI DB allowlist before serving governed graph data. Never expose PHI or direct database credentials.
3. **Ontology decision persistence:** Migration for mapping proposals, immutable reviewer identity/authority, source and target identifiers, relation type, review reason, decision time, evidence and audit events. Enforce no self-approval and no silent overwrite.
4. **Claim verification:** Bring ISI proposition/passage verifier into HSI as candidate-only support/contradict/insufficient classifications; require exact source passages and independent review, with abstention for metadata-only evidence.
5. **Workbench wiring:** Replace static graph intake with authenticated, versioned server response. Show release pin, mapping queue, evidence dossiers, unresolved conflicts and reviewer decisions. Preserve existing protected investigation submission route.
6. **Validation:** Apply migrations to approved staging only, run tests and permission-denial E2E, verify published deployment and rollback. Scientific release remains separately gated.

## Safety invariants
- Source `ESTABLISHED` is not a human HSI approval.
- Reviewer decisions require verified server-side authority, not client roles.
- No graph auto-promotion, no cross-tenant access, no clinical decision support, no patient data in research exports.
- ISI and HSI retain separate governed stores and versioned contracts.

## Next after P0.4
P1: scientific contradiction intelligence, evidence gaps and hypothesis workbench. Prioritise SSc Tfh–IL-21–B-cell comparison; RA is a later comparison.
