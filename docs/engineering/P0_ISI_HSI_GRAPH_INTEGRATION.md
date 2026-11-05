# P0 ISI → HSI integration — implementation record

Source: `gnaneshwer23/immunecity` `src/data/kg.json` v0.3 (260 core concepts, 395 core relationships at audit). Target: `gnaneshwer23/hsi-core`.

## Implemented
- `src/adapters/isiGraphReleaseAdapter.ts`: pure, read-only version-pinned intake. Namespaces source IDs as `isi:<id>`; retains original source IDs, relationship context, source evidence status, source hash, and review-needed ontology queue.
- `test/isiGraphReleaseAdapter.test.ts`: version/inventory, duplicate/dangling, provenance and fail-closed review tests.
- No database writes, grants, production deployment configuration, or changes to the existing ISI product.

## P0 gates not yet met
1. **Versioned delivery:** create an immutable signed or checksummed ISI artifact/manifest in immunecity; verify its hash and allowed source before HSI intake. Do not fetch mutable `main` as a trusted release.
2. **Ontology review:** curator-approved mapping of source ISI IDs to HSI identifiers, retaining ambiguity and unmapped records in the queue. No name-based automatic merging.
3. **Claim-level evidence:** connect ISI `claimVerifier.ts` proposition/passage assessment to HSI SSc evidence snapshots. A DOI/PMID match alone is not scientific verification; title-only/keyword-only matches must abstain.
4. **Research workbench:** connect versioned staged graph and evidence assessments to the existing authenticated HSI SSc workbench, preserving independent scientific review.
5. **Validation:** run unit/integration/E2E, check actual source release hash, reviewer permissions, production read boundary and deployment. No claims of live Neon integration until independently tested.

## Scientific boundaries
- Source `ESTABLISHED` teaching status is **not** HSI review approval.
- `TO_BE_CURATED` is a placeholder, not a citation.
- Draft and placeholder edges never become graph-promotable.
- ISI scientific discovery and HSI clinical patient data remain separated by access control.
- Never auto-approve Gate C or write to ISI Neon, HSI production Neon or patient records.

## Sequencing
P0a source export + adapter → P0b ontology queue → P0c claim verifier → P0d authenticated workbench. P1 contradiction/hypothesis modules follow after verified P0 data.
