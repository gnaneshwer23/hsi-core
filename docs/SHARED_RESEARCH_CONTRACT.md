# Shared research contract, version 1

Canonical implementation: `src/researchContracts.ts`, exported as
`hsi-core/research-contracts`. It is dependency-free and runs in a product backend
or browser. Aksh and ISI receive identical, provenance-pinned source snapshots
through `scripts/sync-shared-technology.ts`; neither needs a sibling checkout to
build. This version adds structures and validation, not a service or database.

## Records and ownership

| Record | Purpose |
| --- | --- |
| Context | Research question, existing concept IDs, data classification and originating dataset/version |
| Source / passage | Source identity, declared passage rights, exact passage locator and source version |
| Entity / relationship | Product-owned graph IDs, endpoints, species, experimental system, tissue, assay and timepoint |
| Claim | Relationship and exact passage references, support assessment, assessor kind and separate human curation |
| Run / artifact / event | Versioned outputs and ordered execution declarations, including provider/version and failure reasons |

The contract carries a bounded view of an existing graph; it creates no second
KG. Product interfaces, authentication, authorisation, tenancy and storage remain
product-owned. No patient transport, clinical engine or clinical advice is added.
The envelope requires `containsPhi`, `clinicalAdvice` and `kgWrite` to be false.

## Boundary use

```ts
import { parseResearchBundle, researchRunState } from "hsi-core/research-contracts";
const bundle = parseResearchBundle(untrustedJson);
const state = bundle.runs[0] ? researchRunState(bundle.runs[0]) : "pending";
```

`parseResearchBundle` accepts an object or JSON string, rejects unknown fields,
checks references and limits the UTF-8 payload to 1 MB. IDs remain unchanged.
`parseResearchContext` and `parseResearchRun` validate standalone structures;
cross-record joins and data classification propagation require the bundle parser.
All fields in the TypeScript interfaces are required; absent values use explicit
`null` where permitted. Errors reject the payload rather than silently deleting
unknown fields or converting unsupported versions.

Synthetic records use `SYN-` or `SYN:` IDs and cannot mix with real records, claim
real publication locators or acquire approved scientific support. Licensed inputs
cannot become public claims or relationships by changing the output label. The
fixture in `test/fixtures/research-contract.json` is deliberately abstract and
contains no biomedical findings, patients or fabricated publication identifiers.

Approval requires a human assessment, reviewer metadata, supporting passages and
an exact relationship reference. Model drafts and counterevidence remain distinct
from approved support. Parsing does not write any approval into a product graph.

## Run lifecycle

Stages are context → retrieval → graph → contradictions → hypothesis → review →
dossier. Each stage starts before completing or failing. Completion references a
declared artifact of the appropriate kind. Inputs must already exist; outputs
cannot overwrite inputs. Provider/version, model and actor remain stable within
a stage. Human review cannot complete as a model or deterministic execution.

Skipped stages require a reason and produce no outputs. Failed stages require a
reason, produce no outputs and terminate the run. Empty retrieval results should
be a completed retrieval artifact with an empty result set, not a failed event.
Any skipped stage makes a finished run `partial`. A review waiting on a human is
`awaiting_human_review`. Seven completed stages give `completed`, which describes
workflow execution only and does not approve a claim. Version 1 has no retry
events; create a new run for another attempt.

`appendResearchRunEvent` returns a validated new run without changing the input
arrays. It does not call a provider, persist an audit log or execute any stage.

## Backend responsibilities

The structures validate declarations. Product backends must authenticate reviewers
and enforce their actual roles; a supplied `reviewerRef` is not authorisation.
They must remove PHI before constructing a context: false flags and text schemas
are not deidentification or a PHI detector. They must independently verify source
identity, rights to use passages and scientific support. HTTPS/PMID/DOI syntax
does not prove a source exists or supports the claim. URL fields are not fetched.

SHA-256 fields validate digest syntax only; the producer/consumer must compute and
verify content digests. Events are execution declarations, not signed proof or a
durable append-only audit store. Backends must record actual execution and guard
against caller mutation after validation. Apply transport body limits before
parsing, and revalidate before persistence or dispatch across a trust boundary.

## Next implementation

Build the authenticated investigation service and product storage adapters against
this contract, then test the RA/anti-TNF vertical. No live retrieval provider,
model execution, product API route, database migration or public page is added by
this milestone.
