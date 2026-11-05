# Delivery Phase D — reproducible briefs and independent review

**Implemented:** 5 November 2026. **Status:** implementation and local workflow verification delivered; staging migration and real two-account/database acceptance pending. No migration, grant, production write, scientific source approval or graph publication was performed.

## User journey

1. Open a saved investigation, capture its verified Phase C evidence context, then use **Evidence brief and independent review**.
2. Download a cited Markdown brief or evidence JSON. Each download is checked against its exact content hash and the package hash displayed in the UI.
3. The owner submits a fixed package. It appears in `/research/scientific-review` for an independently authorised SSc reviewer; the author's own submissions are excluded from their queue.
4. The reviewer inspects the pinned graph, source passages, versions and uncertainty; selects primary-release claims actually examined; records a substantive rationale, explicit limitations where accepting, and a conflict/independence declaration.
5. A revision request opens a response form for the owner. **Create linked revision** creates a separate draft; the parent package and decision stay immutable.
6. Capture the new draft's own evidence context and submit it for another independent review. The reviewer can inspect their prior decisions through their history without gaining access to the author's unsubmitted successor draft.

Acceptance concerns **the evidence brief only**. It does not establish candidate-mechanism truth, change the investigation's insufficient-evidence conclusion, approve working-catalogue candidates, authorise patient decisions or pass Gate C.

## Reproducibility

`hsi-review-package-1` binds the exact investigation snapshot/hash, saved evidence context/hash, primary and optional comparison releases, source/passage versions, method `hsi-evidence-brief-method-1`, uncertainty and revision lineage. Submission stores the awaiting-review snapshot; later decisions are appended separately rather than altering that package.

Exports include source identifiers, original-source URLs, exact passage text and hashes, species/model/assay/timepoint context, manifest hashes, declared method and limitations. RA remains source-separated from SSc. Unreviewed bibliographic matches remain context only.

JSON uses canonical key ordering; Markdown has a deterministic renderer with escaped imported text. Repeating an export for an unchanged package/decision yields identical bytes. A new decision changes the exported decision record and file hash while retaining the submitted package hash. Any future semantic change to the method/renderer must be versioned; do not silently reinterpret version 1 packages.

Responses are authenticated attachments with `Cache-Control: no-store`, `X-HSI-Content-SHA256` and `X-HSI-Package-SHA256`. The UI verifies bytes and binding before triggering a download. Package/export payloads are bounded to 2 MB; oversized data fail rather than being silently truncated. Hashes establish integrity, not signatures or scientific truth.

The Phase C source/release/permission rechecks remain mandatory on view/export/decision. Withdrawn permissions, changed material evidence or an unavailable pinned release block the operation. No unchecked cached source quotes are substituted.

## Independent decisions

Reviewer identity, decision ID and time come from the authenticated backend, not request JSON. The current SSc reviewer grant must be verified; the transaction locks the authority/user rows and submission so concurrent final decisions cannot overwrite one another. Authors are refused even when they also have a scientific-reviewer grant.

The request binds investigation ID, submission ID and package hash. Acceptance requires examined primary-release claims and explicit limitations; unknown claims, RA comparison claims and unreviewed catalogue candidates cannot be substituted. Rationale is substantive and bounded; COI/independence declaration is required. The PHI-marker reject helper applies to free-text review/revision input; it is a heuristic, not permission to process identifying data or a de-identification guarantee.

Exactly one final decision is recorded per submitted investigation version. Repeated identical requests acknowledge the existing record; changed content conflicts. Lost acknowledgements do not create duplicate decisions. Current source permissions and reviewer access must still pass when retrying.

## Revisions and older records

A revision is a new `hsi-interrogative-*` draft, with a link to the parent investigation, parent decision, root and revision number. Each parent has one successor. Requests are idempotent; changed content under an existing request conflicts. Subsequent revisions can be reviewed again without colliding with the first decision.

For compatibility with the existing investigation-state contract, a revision-requested parent returns to `draft` internally. Its delivery status is **revision requested**, its immutable submission remains closed, and resubmitting that same version is refused. The UI directs the owner to the linked successor.

New drafts retain the parent's release but inherit neither its saved context nor human acceptance. Their hypotheses remain unvalidated; context must be captured and reviewed anew. Changing/withdrawing a release requires a separate authorised investigation, not an automatic rebase. This delivery does not create automatic evidence-to-branch bindings.

Legacy v1 submissions/decisions are retained. Older awaiting/reviewed records without a bound package are labelled `legacy_unbound`; they do not acquire a new acceptance or context-bound export. The existing account history retains v1 metadata; the new reviewer queue/history handles v2 brief decisions. Production HTTP decisions now require the v2 request contract; legacy write helpers remain compatibility code and are not the production HTTP path.

## API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/research/interrogative/<id>/review-package` | Verified package, decision, lineage, successor and backend-derived capabilities. |
| `GET /api/research/interrogative/<id>/brief?format=json` (or `markdown`) | Deterministic, hash-labelled attachment. No identity/source/release query overrides. |
| `POST /api/research/interrogative/<id>/submit-review` | Empty `{}` only; owner submits the current captured evidence package. |
| `POST /api/research/interrogative/<id>/decision` | Strict `hsi-review-request-2`; server resolves reviewer/time/decision identity. |
| `POST /api/research/interrogative/<id>/revision` | UUID request ID, non-identifying question and revision response; creates a new linked draft. |
| `GET /api/research/scientific-review/queue` | Active reviewer-only pending queue and the current reviewer's decision history. Pending queue is cursor-paginated; history shows 25 recent decisions. |

Nested Vercel route files are included. Writes retain exact-origin, JSON, bounded-stream, session and approved-staging checks. No operation grants roles or writes to evidence claims, source approvals, published releases or knowledge-graph relationships.

## Migration and live acceptance

Migration [`015_hsi_review_delivery.sql`](../db/migrations/015_hsi_review_delivery.sql) adds immutable submissions, v2 decisions and revision links. Foreign keys bind decisions to their actual submission/investigation and successors to their parent decision. Unique constraints and append-only triggers preserve the lineage. Public table access is revoked; no roles are granted. Phase C migration `014` remains a prerequisite.

**Neither migration was applied in this delivery.** Keep the paused Auth/database task paused. An authorised operator must review/apply the required migrations only to approved HSI staging, provision two separate identities and their independently verified grants, and supply genuinely cleared published evidence before live acceptance. Default/production research writes remain disabled.

Staging acceptance must demonstrate the full two-account flow, self-review denial, other-user denial, stale-package/context rejection, role/source revocation, deterministic JSON/Markdown downloads, duplicate-request handling, revision creation, new context capture and resubmission, and preserved parent history. Repeat under disabled writes to confirm reads remain available while mutations are denied.

Local tests use service repositories and browser HTTP/role fixtures. They exercise real orchestration, parsing, rendering and hash logic but do not establish live Neon transactions, provider authentication or scientific validity. Phase B still has zero release-eligible candidates; this work does not remove those human source gates.

## Local validation

**654 core tests and 71 browser checks passed locally.** Core/site/API builds, frontend type checking, artifact consistency and documentation-link checks passed. The browser flow uses two fixture identities and real orchestration/hash/render logic; it does not certify real provider authentication or database transactions. The existing large frontend-bundle warning remains. Phase E can evaluate bounded AI against this versioned workflow; it must not become an automatic reviewer or publication authority.
