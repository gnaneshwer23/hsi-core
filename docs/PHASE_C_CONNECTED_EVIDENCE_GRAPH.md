# Delivery Phase C — connected investigation evidence graph

**Implemented:** 5 November 2026. **Status:** implementation and local checks delivered; staging migration, trusted source clearance and live database acceptance pending. No migration, grant, credential update, production write or evidence publication was performed.

## Connected user journey

Open a saved record from `/research/scientific-workbench`. Its decision workbench now includes **Evidence graph and mechanism dossier**.

1. Read an existing evidence context, or, when authorized, choose **Capture release-bound evidence view**.
2. Select a concept to narrow its connected relationships, then inspect a relationship's graph, reviewed source assertion, species, experimental system, assay, timepoint and interpretation limits.
3. Expand the source to inspect its citation, original-source link, exact passage, source version and passage hash.
4. Inspect an optional, independently verified RA comparison alongside SSc, preserving separate releases, source evidence and model context. Shared graph patterns remain comparison candidates; they do not establish equivalent biology or causal/treatment conclusions.
5. Follow a bibliographic-context link to the exact archived Phase B catalogue version. The catalogue remains unreviewed, even if another claim from the same publication was approved independently.
6. Leave and reopen the investigation: the evidence-context hash and pinned source/release references remain the same. Newer graph data or catalogue versions are not silently substituted.

The separate exploratory graph on the scientific workspace still queries the current governed graph. It is explicitly distinguished from the saved release-bound view.

## Reuse and contracts

- `buildImmuneMechanismDossier` now projects the verified context for both the primary release and any RA comparison release.
- `compareSscRaEvidence` now participates in the authenticated investigation flow. Its logical-graph checks reject clinical nodes, and ambiguous mixed-disease context is excluded rather than counted in both disease groups.
- `loadHsiPublishedRelease` remains the authoritative release loader. Manifest identity, current claim approval, reviewer authority, rights/correction status and source versions must verify before a context is built.
- `src/investigationGraphContext.ts` supplies a bounded browser-safe context contract, source/passage integrity verification, graph projection and dossier/comparison projection. These functions do not establish authority by themselves.
- A separate immutable context record attaches to the investigation; the existing investigation payload and scientific-review history are not overwritten. Capturing a view does not automatically bind claims to candidate branches or change the investigation's conclusion.

## Source and permission gates

The release adapter requires an explicit, unambiguous disease `biological_context.studyContext`. It preserves available cohort/population, tissue, stage and limitation text. Unknown species, assay or timing are not inferred.

Supporting passages must join the correct source and claim; every supporting source must have an inspectable passage. Text hashes must match. The human review must explicitly cover the supporting source PMIDs. Source metadata must contain:

- `dataClass: "public_biomedical"`;
- `licenceIdentifier`: the actual HTTPS licence/evidence URI;
- `version` or `recordHash`: the same source version verified by the authoritative release.

The source must have `licence_status='passage_permitted'` and `retraction_status='none_reported'`. Passage rights-verifier identity/time must resolve to an active, verified, non-banned research administrator whose grant existed at attestation time. Future attestation times are refused. Scientific-reviewer authority is checked independently for the relevant disease. These are required trusted records, not defaults or values supplied by this delivery.

Only the investigation owner with active researcher/admin access may capture, while the investigation is a draft and existing staging write guards permit it. Authorized independent reviewers may read a submitted investigation's saved context using the existing scoped loader; they cannot capture on the owner's behalf.

Every saved-context read rechecks investigation access and reloads the exact release evidence. Changed source versions/content, revoked authority/permissions, withdrawn releases or changed material context cause the view to fail closed. The immutable historical record is retained; it is not automatically rebased or shown as currently valid.

## API and persistence

| Endpoint | Behavior |
| --- | --- |
| `GET /api/research/interrogative/<id>/graph-context` | Returns the verified saved context, or an explicit not-captured state and backend-derived capture capability. |
| `POST /api/research/interrogative/<id>/graph-context` | Accepts **only `{}`** under exact-origin, JSON, cookie-session and staging-write checks. Loads all evidence server-side and captures once. Client identities, release substitutions, graph payloads and query overrides are refused. |

An explicit Vercel nested-route file is included. Failures redact source/DB internals. Snapshot writes lock the owning draft; retries return the existing capture without overwriting it. A hash is an integrity check, not a signature or scientific approval.

Migration [`014_hsi_investigation_graph_context.sql`](../db/migrations/014_hsi_investigation_graph_context.sql) adds the append-once context table and update/delete-denying trigger, and revokes public table access. It also changes reviewer-authority keys to `(principal_id, scope)` and permits a separately provisioned `ra` scope alongside `ssc`. It creates **no grants**. Existing SSc checks default to SSc; SSc authority does not become RA authority. Reviewer identities must remain verified and non-banned.

**The migration has not been applied.** Keep the existing paused database task paused. An authorized operator must review and apply it only to the approved HSI staging branch before live acceptance. Grant only the trusted backend role the minimum necessary access; never grant browser/agent roles direct table writes.

## Catalogue version pinning

`evidence:build` now also emits a small server-side working-evidence index and a content-addressed archive at `research/evidence-corpus/versions/<hash>.json`, mirrored under the public research assets. Existing versions are retained when a new current version is generated; do not delete versions referenced by saved contexts.

`evidence:check` verifies the current archive and generated index along with the existing corpus/readiness/packet outputs. The saved context records its working-corpus version and only exact publication **and disease** matches. `/research/evidence-readiness?version=<hash>&claim=<id>` verifies that specific corpus and selects the linked claim's publication. Missing/mismatched archived data fail closed. A current review packet is never substituted for a historical pinned version.

## Optional RA comparison configuration

`HSI_RA_COMPARISON_RELEASE_ID` is server-only and empty by default. If set, it must identify a separately published **HSI** RA release, with independently verified RA reviewer authority and cleared supporting passages. The exact resolved ID/version/manifest is captured. No ISI/Aksh database is queried, no patient database is shared, and no role is copied across products.

With no configured comparison, SSc remains usable and the UI explains that no verified RA comparison was captured. A configured but invalid/unavailable comparison blocks capture rather than silently substituting another dataset. Later configuration changes do not alter an existing snapshot; use a new investigation for a new evidence context.

## Verification and live acceptance

Local tests cover immutable capture/retry, owner and reviewer boundaries, staging-write denial, source changes/revocation, release mismatches, passage tampering, species separation, ambiguous disease context, API origin/body guards, pinned catalogue navigation and mobile rendering. Database adapters and the new SQL migration have not been verified against a live Neon branch in this session; service-port tests and browser HTTP fixtures do not establish live scientific or database acceptance.

**Local verification:** 638 core tests and 66 browser checks passed. Core/site/API builds, frontend type checking and evidence artifact checks pass. The existing large frontend-bundle warning remains; it is not a scientific or deployment acceptance result.

Before live acceptance, resolve the paused Auth/database alignment, review/apply the staging migration, provision separate appropriate authorities, and supply an actually cleared published source release. Demonstrate owner capture/reopen, independent authorized reviewer reads, other-user denial, duplicate capture behavior, missing/uncleared passage denial and revocation/version-change denial. Phase B currently has zero release-eligible candidates; this delivery does not remove those human gates.

Phase D can bind reproducible exports and independent investigation review to this context hash. It must not imply that capture itself approved the investigation.
