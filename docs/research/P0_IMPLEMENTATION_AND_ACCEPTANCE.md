# P0 implementation and acceptance handoff

Base revision: `6b965a26da627407ffc939cd8e9a7fc7b5ef89e2` (#275). This increment repairs the audited evaluation/egress boundaries. It does not complete P0 scientific or operational acceptance.

## Engineering delivered

1. Whole-batch structural validation and snapshot before any external action; default-deny authority gate; no egress for an initially invalid or uncleared batch.
2. Failed grounding cannot become supported through model agreement; whitespace-only spans cannot support a claim. Explicit internal per-attempt execution IDs are returned without claims of provider IDs or model independence.
3. Versioned metrics with explicit denominators and separate technical abstention/evidence insufficiency.
4. Exact provider/endpoint allowlist, immutable config, explicit redirect denial/abort contract, enforced invocation/body deadline, streaming byte caps and HTTP/JSON rejection. No retries are introduced.
5. Independent source receipt verification: pinned Ed25519 public keys; source/version/passage digest binding; action-specific permission; identity/rights/retraction status; attribution/licence basis identifier; bounded validity; bounded fail-closed revocation checks. Tests use temporary, synthetic authority keys only.

## Required before source/provider staging activation

| Dependency | Evidence required | Current status |
|---|---|---|
| Approved source policy and authority | Named accountable owner, actual rights/retraction integrations, permitted storage/display/model/export actions, freshness/revocation policy, public-key distribution and rotation | Not provisioned; no authority or clearance is invented |
| Provider integration | Server-held credentials, provider-specific request/response codecs, actual provider request IDs, approved deployments/data handling, network DNS/egress restrictions and token/cost quotas | Not provisioned; allowlisting an endpoint does not approve the provider or deploy a service |
| Durable evaluation | Run/receipt persistence and protected benchmark source/label manifest; resumable worker; replay/failure handling | Internal execution IDs returned only; no durable run service enabled |
| Scientific protocol | Adopted v1.1 crosswalk; one canonical 120-case case model; eight rubric dimensions; independent reviewers; frozen held-out corpus; preregistered risk/subgroup thresholds | Pending scientific owner; existing draft slots and this PR are not benchmark acceptance |

The receipt signature establishes that a configured authority issued an assertion. It cannot prove that the authority's rights, identifier or retraction determination is correct. Authority acceptance and auditing are therefore essential. Legacy boolean flags and the old `assessSourceClearance` helper are descriptive and must not be used as egress authorization.

## Required before staging persistence acceptance

An authorized operator must first identify the HSI-only database and read the actual migration ledger/runtime roles. Do not infer live state from committed SQL. Keep migrations 022–030 held until their individual security dependencies are reviewed. Do not apply them as a batch or point them at another product's database.

Use the existing contradiction activation gate and actual pooled HTTP journey to prove: verified server identity; own-record and cross-tenant isolation; forged settings/session claims denied; no self-review; scope/current reviewer authority and revocation; append-only integrity; runtime non-owner/non-superuser/non-BYPASSRLS roles; concurrent idempotent writes; staging end-to-end operation; rollback and restore. Use two real researchers in distinct isolation scopes and an independent reviewer. Commit only redacted evidence references; never tokens, passwords or private host pins.

## Read-only database evidence collected during P0

The HSI project was subsequently located using its registered project identifier/name, rather than the unsuccessful `hsi` name-only search in the original audit. Only metadata/ledger SELECT queries were executed; no rows, grants, roles, schema, branch settings or migrations were changed. Private project/branch/host pins are deliberately omitted here.

- Production `hsi_schema_migrations` contains 18 rows ending at `017_hsi_experiment_ledger`, including the legacy `012_isi_research_review` ledger entry. No 018–030 entries were returned. Do not confuse the 18-row count with migration 018 being applied.
- Production catalog confirms `hsi_scientific_investigation_records` and `hsi_live_investigations` are absent.
- `hsi_interrogative_investigations`, `hsi_investigation_graph_contexts`, `hsi_investigation_revision_links` and `hsi_research_investigation_runs` are owned by `neondb_owner`; both RLS enabled/forced flags are false on those four inspected tables.
- The preview branch associated with this PR has no roles named `hsi_live_runtime`, `hsi_contradiction_runtime` or `hsi_evidence_runtime` in the inspected catalog. The evidence-pool adapter's expected role is configured separately; absence of that candidate name alone is not proof that every possible restricted role is absent.
- The metadata inspection used the owner connection exposed by the connector. It does not establish the application's configured runtime identity, test permissions as a restricted runtime role, or prove an active cross-user leak. Existing application-level own-record checks still need actual HTTP and pooled-session acceptance.

These findings supersede the original audit's database-discovery limitation. They are concrete blockers to accepting persistence activation, not authorization to apply held migrations or enable production writes. Remaining live acceptance still requires the two-researcher/independent-reviewer staging tests above.

## Release boundary

`releaseEligible:false`, human scientific approval and no silent graph promotion remain mandatory. No production writes, migrations, grants, release switches or merges are part of this increment. P1's comparator alignment defect and complete three-role live investigation remain separate work. Source-policy, security and scientific owners must accept the external dependencies above before production activation is considered.
