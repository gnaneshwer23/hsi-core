# Delivery Phase F — product-owned research artifact acceptance

5 November 2026. Human Super Intelligence supplies shared research technology. Aksh Health and Immune Super Intelligence retain their own interfaces, identities, roles and databases.

## Scope and honest status

The current transferable RA corpus contains **two rights-verified publication sources, eight passages and zero approved claims**. Its scientific review remains **unreviewed**. This phase adds common artifact verification and product-runtime consumption checks; it does not turn that corpus into a scientifically approved artifact or transfer a Phase D review decision. **Approved-artifact/live acceptance is still pending** cleared, independently reviewed evidence and the paused operational prerequisites.

Historical product checkouts were 10 commits behind their GitHub main branches. They were fast-forwarded before auditing. Starting tips: ISI `d5f4a75`, Aksh `576ffa1`, HSI `9c7e8d6`. Existing runtime loaders already used the same rights-verified source release, but did not enforce a product-owned distribution pin when consuming it.

## Common contract

`src/researchArtifactAcceptance.ts` is the shared Node-only verifier. A `hsi-research-corpus-artifact-1` contains:

- Exact HSI producer repository, clean-source commit, sequence and research/source schema versions.
- The fixed RA release plus its original, claim-free graph anchors. Source/passages/receipts remain unchanged; no copied patient stores or product credentials.
- A SHA-256 over canonical content, bound separately by a **product-owned** `hsi-research-artifact-trust-1` policy.
- Source-only research scope, `scientificReview=unreviewed`, and hard false PHI/clinical/KG-write flags.
- Optional detached Ed25519 signature over the lowercase artifact-hash UTF-8 bytes.

The policy lives with each product's trusted deployment code, not in the incoming artifact. It pins artifact hash, producer commit, minimum sequence and product. The incoming payload cannot supply roles, approval flags, policy overrides or a trusted signing key.

Two explicit trust modes exist. `pinned_digest` requires a separately installed digest/commit pin and makes **no signature claim**. `ed25519_required` additionally requires a separately installed trusted public key and a valid matching signature; unsigned, unknown-key and altered signatures fail closed. No production signing key or signature is invented. Changing policies requires the product's code-review/deployment process; hashes alone do not establish scientific or legal authority.

Staleness means an artifact no longer matches the installed pin/minimum sequence, is older than installed state, or conflicts at the same sequence. There is **no implied wall-clock expiry or automatic revocation service**. Product-owned revocation hashes can be supplied to the verifier; operators must deploy those decisions. A valid source receipt is not current licence advice or clinical fitness.

Both products must interpret sources, passages, graph context, release version and uncertainty identically. Acceptance explicitly reports `rolesTransferred=false`, `scientificApprovalTransferred=false` and `graphPublicationApproved=false`. Domain model/graph approval and product-local authorization remain distinct from artifact transport.

## Product-local replacement

`src/researchArtifactStore.ts` provides an optional single-file local importer. It validates before replacement, holds an exclusive writer lock, writes and fsyncs an exclusive temporary file, atomically renames it, then fsyncs the parent directory. Repeat imports are idempotent; rollback/same-sequence conflicts, malformed/oversized/symlink inputs, invalid installed metadata and lock contention fail closed. Rejected imports preserve installed bytes. It makes no database connection, provisioning call, EHR write or source promotion.

Directory permissions and trusted deployment code remain part of the security boundary. This is a filesystem adapter, not a distributed database transaction or an arbitrary upload API. On an uncertain post-rename acknowledgement, retry the same artifact and pin; do not create a new sequence just to retry. Do not remove another operator's lock automatically.

## Preparing reproducible handoffs

After committing the canonical inputs:

```bash
bun --no-env-file run consumers:prepare --out-dir /tmp/hsi-f-handoff --sequence 1
```

The output directory must be new. The script checks that selected source/payload inputs are committed, validates the entire source artifact, then writes exact TypeScript snapshots/provenance, a single transfer JSON, per-product trust-policy proposals, and a handoff manifest with file hashes. It does not install anything into another repository, activate a product schema, grant a role or create a signature. Review these policies as trusted deployment changes. Never mint a policy from an arbitrary incoming upload at runtime.

Install the selected artifact and reviewed policy inside each product, then wire the product's server-only RA loader to `acceptResearchCorpusArtifact`. Preserve the older source/annotation files for their existing annotation views; do not relabel those as new approvals. A verification failure should make that corpus unavailable while unrelated product-local corpora remain usable.

For an upgrade, increase the sequence and install a separately reviewed policy bound to the new hash/commit. Future signed mode requires an operator-controlled signing/release process and trusted public-key rollout. Do not embed private keys in source, artifact JSON or chat.

## Acceptance and operations

Run `bun --no-env-file run consumers:verify` from HSI with sibling product checkouts, or supply `--isi-root DIRECTORY --aksh-root DIRECTORY`. The runner verifies exact source/provenance against the recorded HSI commit, executes both actual loaders and isolated denial checks, and compares their complete bundle hashes. It is read-only and does not run product migrations or builds.

Run each product's real corpus loader and focused consumer tests against the same installed transfer artifact. Compare the complete bundle digest, source/passages/relationship IDs, versions, zero claims and no-promotion flags. Exercise hash drift, wrong schema/product/producer, rollback/conflict, missing trust and signature-required refusal. Run each product build. Record exact revisions and failures instead of calling a historical smoke report current evidence.

Live writes require **each product's own** approved schema and roles: ISI `0029`, Aksh `056`, plus its existing trusted auth/RLS adapters. This phase must not run HSI migrations on either product database, reuse HSI accounts as product grants, or infer activation from static configuration. No database migrations or grants are performed here. HSI's own migrations `014`/`015` and authentication/database alignment remain pending independently.

Independent source-rights/scientific reviewers must supply a genuinely approved B–D artifact before the approved-research-artifact gate can pass. This source-only contract refuses approved-claim assertions; a reviewed-brief exchange needs its own audience/data-rights/decision-scope contract, including treatment of researcher/reviewer identifiers. Do not send a private HSI brief to products by simply copying JSON or treating a hash as permission.

## Verification record

[Machine-readable actual-loader receipt](PHASE_F_ACCEPTANCE_RECEIPT.json), produced by `bun --no-env-file run consumers:verify` against clean, committed product trees:

| Check | Result |
| --- | --- |
| HSI core tests | **684 passed**, including **14** artifact/signature/atomic-import/rollback checks |
| HSI core and site/API builds | Passed; evidence-corpus integrity check also passed |
| ISI focused consumer suite | **13 passed** across shared technology/contracts/service, corpus and RA scenario checks |
| Aksh focused consumer checks | **7 suites passed**: research contract/import, shared technology, investigation contract/service, RA evidence and working-set corpora |
| ISI type check and production build | Passed |
| Aksh type check and Next production build | Passed |
| Actual-loader artifact and complete bundle parity | Passed in both products; two sources / eight passages / zero claims |
| Unsafe mutations | **7 refused per product**, using the actual installed trust policy |
| Isolated tampered runtime | Both mark the corpus unavailable, deny its load and preserve their separate local corpus |
| Product CI | Added acceptance and isolated denial checks to the existing consumer workflows; remote CI not yet observed |

Pinned artifact sequence: **1**. Artifact SHA-256: `bfa69bf56689bd00c6df1a5f329b207bf573ad67234082cce8ec2842b59ed72b`. Complete bundle SHA-256: `f8a18a05bdf768679a462d57b9e74f7cf84d7508f312ee1b749d7c1ff583f13b`. Source/module producer revision: `7d1e7aedf0b70f8858d52479f9efd12f91898d36`.

Committed consumers: ISI `efba003`, Aksh `1a237cc`. Existing large-chunk warnings remain in HSI/ISI; Aksh retains its pre-existing typedRoutes configuration warning. No public homepage or product visual redesign was performed.

No production deployment, live account login, product database activation or scientific acceptance is implied by local checks. No migrations, role grants, production signing keys or human scientific decisions were created. **Delivery Phase F's engineering source-consumption path is implemented; approved-artifact and live operational acceptance are pending.**
