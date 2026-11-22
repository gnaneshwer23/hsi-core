# Literature brief (22 November 2026)

The brief is the step after retrieval in the investigation workflow: it turns the retrieval step's candidate set into a reviewable, exportable record that keeps its provenance. Code: `src/literatureBrief.ts`. Tests: `test/literatureBrief.test.ts` (18 tests, 23 mutations killed).

## What it asserts, and what it refuses to

- Every source is `retrieved` and `unreviewed`. A search hit is not evidence.
- Claims come only from a separate extraction step (none exists yet). The builder will carry a claim as `extracted`, `candidate` or `model_assessed`, never higher. `independently_reviewed` and `approved` are not creatable here: they belong to the existing human review and delivery path (`investigationDelivery.ts`). A `model_assessed` claim must name its assessment record and is always `independentlyVerified: false`. A claim must link to a source in the set.
- Fixed flags the verifier checks: `scope: research_only`, `clinicalUse: none`, `publicationEligible: false`, `graphPromotion: none`.
- Possible personal health information in the question, terms, titles or claims refuses the brief.

## Provenance

The brief embeds the candidate set's hash and reference and one receipt per provider. With the gateway's audit records supplied, the chain is verified and each receipt must match its record (tool, investigation, task, provider, request and response hashes, outcome). Any mismatch refuses the brief. Without them the brief says it is unverified against the audit.

## Integrity, export and reopen

`contentHash` covers the brief. `verifyLiteratureBrief` re-derives it and re-checks every invariant, so a promoted or re-labelled brief is refused even when its hash is recomputed. Exports are `brief.json`, `brief.md` and `manifest.json` (SHA-256 of each); `verifyLiteratureBriefExport` checks the manifest, the brief, and that the Markdown is exactly what that brief renders. `createFileBriefStore` saves content-addressed and re-verifies on load.

Markdown is inert: imported strings are escaped and URL schemes and `www.` are defanged, because GitHub-flavoured renderers auto-link bare URLs even inside escaped text. The JSON keeps the original strings. Only validated source links appear as links, in code spans.

## Not provided

- **Authentication of the brief.** The hash detects accidental and naive edits; someone who edits descriptive text and recomputes it passes verification (a test documents this). Signing, a principal, tenant and ownership, and save-and-reopen under ownership belong to the persistence layer, which is held.
- **Extraction.** Without it a real brief has sources and no claims. Claim context (species, tissue, cell type, method) is free text, not ontology-normalised.
- **Any route, UI or live data.** Nothing calls this from a route. The retrieval in the tests used injected fetchers.
- **Scientific assessment.** Nothing here judges relevance or quality, and nothing is reviewed or approved.
