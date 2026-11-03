# Shared investigation service

`src/investigationService.ts` implements `hsi-investigation-1`, exported as
`hsi-core/investigation-service`. This is a server-side library: callers supply
an authorisation function, a store and retrieval providers. It is not a public
HTTP endpoint. Aksh and ISI retain their own authentication, tenancy and databases.
The source snapshot distributed to both products is the same executable service.

## Executed workflow

1. Validate and detach the supplied research bundle; create a new run. The input
   has no previous runs. Existing graph/source/claim IDs remain unchanged.
2. Save the context snapshot. Retrieve at most 40 passages from the provided corpus
   using the reference lexical/explicit-concept provider, or an injected provider.
3. Traverse the existing graph using HSI's shared bounded traversal: depth 1 and a
   combined cap of 120 relationships. Report truncation explicitly.
4. Index existing supporting, opposing, partial and unassessed claim assessments
   on retrieved passages and exact relationships. Keep both sides and original
   biological context; never vote away disagreement or infer worldwide absence.
5. Produce up to 10 unvalidated research questions. The reference implementation
   uses deterministic templates, not a model or a biological discovery engine.
   An optional model provider must declare its model/version and return the same
   validated shape. Every cited passage must be retrieved and linked to the
   exact relationship by an existing claim. Citation validity alone does not
   verify scientific support or the free-text question.
6. Pause in `awaiting_human_review`. An authenticated reviewer/admin submits an
   explicit decision and rationale. The reviewer identity comes from the trusted
   authorisation adapter, not a request body. There is no automatic approval.
7. Generate a versioned dossier retaining the human decision, both evidence sides,
   passages, source versions, scope, truncation and limitations. Export structured
   JSON plus Markdown. `request_revision` remains visible even when dossier
   generation completes. No source claim is edited or promoted into the KG.

A finished workflow is not scientific validation or permission to launch a
clinical product. The reference retrieval searches only the supplied corpus;
it does not call PubMed, a live database or an LLM. The service can consume
licensed/public research bundles after the owning backend verifies their rights.
The abstract fixture has no biomedical findings or invented publications.

## Product integration API

```ts
const service = createInvestigationService({
  store: productInvestigationStore, // atomic compare-and-swap, isolated copies
  authorize: authenticateAndAuthorizeResearchKey,
  providers: { retrieval: createCorpusRetrievalProvider() },
});
const pending = await service.start(key, validatedResearchBundle, sessionCredential);
// A separate authenticated human action:
const reviewed = await service.review(
  key, pending.revision, "request_revision", "Additional evidence needed", reviewerCredential,
);
const dossier = await service.exportDossier(key, sessionCredential);
```

The `authorize(credential, action, key)` adapter must verify the actual login and
product/tenant ownership on **every** action: start/read/resume/review/export/recover.
An actor object or role supplied directly by a client is not authentication.
The service additionally checks reviewer/admin roles and requires admin for
interruption recovery. There is no permissive default authorizer.

The store must atomically create only when `expectedRevision=null`, or update
only when the revision matches. This prevents duplicate starts and concurrent
review overwrites. Checkpoint before execution, then save output content,
SHA-256 digest and completion together. Failed persistence propagates to the
caller; it is never reported as a completed stage. Revalidate snapshots on load.
Digests detect content changes, not malicious rewrites with recomputed hashes;
use backend access controls and a durable audit store for production.

## Failure and recovery

Provider errors, malformed outputs and timeouts produce failed events with safe
reason codes. Arbitrary provider error messages are not persisted. Empty retrieval
is a completed result with no passages; it is distinct from a failed search.
Timeouts signal cancellation and discard late results. Injected providers must
honour the abort signal: the runner cannot forcibly stop an external process or
undo remote side effects. Research providers should be read-only.

`resume(key, revision, credential)` continues only stages that have not started;
it never repeats completed retrieval, human review or dossier generation. It can
resume at a stage boundary after a process/storage interruption. An outstanding
`started` event cannot be automatically replayed: an operator must first establish
that its worker has stopped, then an admin can call `recoverInterrupted` to record
failure with the operator reference. Version 1 requires a new run/key after failure.
CAS prevents the old worker from subsequently publishing stale output.

The service verifies provided passage hashes against UTF-8 passage text and hashes
all generated payloads using UTF-8 JSON with recursively sorted object keys
(array order is preserved), so JSONB key reordering does not break integrity. It rejects unknown/broken references and applies bounded
output sizes. It is not a PHI detector, source-rights verifier, prompt injection
filter or scientific adjudicator. Product backends must perform those checks and
apply request limits before parsing. Markdown exports contain source text; UI
renderers must sanitise HTML and restrict links.

## Local functional scenario

The local file adapter is for engineering, without product credentials or DBs.
It uses restrictive file modes, exclusive write locks, atomic replacement and
revision checks. It assumes a trusted local filesystem. It is not a distributed
job store; crash-left lock files require operator inspection after workers stop.
Keep generated snapshots outside the repository (for example in `/tmp`).

```sh
bun run investigation:demo start /tmp/hsi-investigation-demo
bun run investigation:demo status /tmp/hsi-investigation-demo
# The local operator explicitly supplies a review decision and rationale:
bun run investigation:demo review /tmp/hsi-investigation-demo request_revision "Engineering fixture; obtain verified scientific evidence before acceptance"
bun run investigation:demo export /tmp/hsi-investigation-demo
```

`start` stops for review. Separate CLI invocations reopen the saved run. This
fixture-only CLI recognises the local operator, not a product login; do not expose
it through a web route. JSON and Markdown exports preserve the synthetic label.
The ephemeral memory store is for tests/local use only.

## Remaining work

Step 3 is the authenticated Aksh/ISI backend adapters, tenant-scoped database
persistence, API limits and internal UI actions. No public route, database
migration, live literature/model provider or deployment verification is included
in this step. RA/anti-TNF scientific validation follows those integrations.
