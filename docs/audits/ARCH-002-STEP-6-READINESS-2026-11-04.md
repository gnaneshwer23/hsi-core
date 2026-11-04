# HSI ARCH-002 — Step 6 engineering and scientific readiness audit

Date: 2026-11-04. Scope: HSI-owned systemic sclerosis (SSc) evidence ingestion → curation → scientific review → graph publication → research investigation.

## Executive finding: NOT END-TO-END READY

Steps 1–5 provide repository code and test fixtures, **not** a proven connected live scientific pipeline. A successful CI run proves only its covered build/tests, not source validity, human scientific approval, HSI database deployment, authenticated reviewer workflows or graph publication.

## Verified from repository

- Step 1: Europe PMC metadata-only fetcher and guarded HSI SQL importer exist; no verified live ingestion evidence.
- Step 2: SSc candidate manifest and schema validator exist; `reviewedByHuman=false` and `graphPromotable=false`.
- Step 3: reviewer input validator and transactional DB write service exist; `VerifiedReviewer` is an interface, not a verified identity provider. Migration 003 has not been confirmed applied.
- Step 4: release assessment and in-memory snapshot query exist; there is no authoritative database publication/retrieval service. Current manifest hash does not cover claim/evidence payloads.
- Step 5: deterministic research analysis module exists; the website still uses its local editorial typed graph. There is no durable research-run store or autonomous evidence investigator.
- Legacy HSI Gate C and the new evidence review tables are not yet consolidated. No patient-level functionality is claimed.

## P0 defects / risks

1. **Publication authority gap:** No trusted DB-backed publication path, no immutable canonical evidence snapshot, no release-manager role, no reliable live release revocation.
2. **Authentication gap:** No server-verified identity-provider session/role integration for Gate C. Caller-supplied TypeScript principal is not proof of identity.
3. **Scientific provenance gap:** SSc corpus is abstract-grounded and unreviewed; source corrections/retractions and full-paper context are not independently validated.
4. **Migration deployment gap:** Migration 003 includes new CHECK constraints that may reject pre-existing rows. Test against HSI staging data before applying.
5. **Source licensing gap:** `metadata_only` is not licence to store article passages and does not establish claim-level scientific validity.
6. **Retrieval authority gap:** `queryPublishedGraph` accepts caller-supplied snapshots; must not be exposed as an authoritative public endpoint.
7. **Ingestion audit gap:** No durable job ledger, retry/backoff policy or source revision history; status monitoring incomplete.
8. **Scientific conflict gap:** Current contradiction rules are heuristic and context-sensitive; no adjudicated multi-study synthesis.

## Step 6 repository audit implementation

- `src/step6Readiness.ts`: explicit 11-gate evidence checklist and repository-only SSc manifest check. Default is blocked, not assumed passed.
- `src/cli/step6-readiness.ts`: emits machine-readable readiness JSON; `--require-production-ready` fails when blocked.
- `test/step6Readiness.test.ts`: validates unreviewed status and conservative readiness.
- Existing GitHub Actions `research-foundation.yml` executes unit checks, build and site E2E; this is **not** a live scientific validation suite.

## Required next engineering sequence

1. **Staging integration:** Validate SQL migrations 001–003, fix any migration conflicts, add rights/source consistency constraints and role grants.
2. **Secure Gate C:** Implement trusted OIDC/session verification, server-side role resolution, separation of duties and audit/revocation.
3. **Scientific corpus:** Ingest actual source metadata, curate contextual evidence, have independent qualified scientists assess SSc claims.
4. **Release authority:** Build transactional HSI DB publication with canonical evidence payload digest, signed/trusted release attestation, revocation and immutable history.
5. **Retrieval and workbench:** Implement authenticated DB-backed graph retrieval and connect the site research workbench.
6. **Integration tests:** Source correction, retraction, failed rights checks, invalid reviewer, revocation, concurrent approvals, rollback, data isolation and Aksh/ISI outage.
7. **Operational evaluation:** Review performance, threat model, provenance completeness, independent scientific assessment and go/no-go.

**No live DB writes or migrations were performed by this audit. No SSc claims were approved or published.**
