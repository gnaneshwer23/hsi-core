# Delivery Phase B — evidence and source readiness

**Implemented:** 5 November 2026. **Status:** versioned working corpus, inspection UI, validation and review preparation implemented; human source clearance and scientific acceptance are pending. No published evidence release was created or activated.

## Bounded evidence delivered

| Scope | Publications | Candidates | Imported text passages | Locator-only records |
| --- | --- | --- | --- | --- |
| RA / anti-TNF serology-response research | 2 | 2 | 8 | 0 |
| SSc / Tfh–IL-21–B-cell research | 3 | 5 | 0 | 5 |
| Total | 5 | 7 | 8 | 5 |

The RA sources are the existing real-publication import: PMID **18375541**, DOI `10.1136/ard.2007.084715`; and PMID **24586782**, DOI `10.1371/journal.pone.0089442`. Their existing import parser checks recorded provider identities, retrieval receipts, licence evidence, content versions and exact passage hashes. This build does not freshly retrieve those publications or independently certify the recorded receipts.

The two RA candidates quote their imported **Results paragraphs verbatim**, with linked Methods paragraphs and bounded study-context extraction. They are unreviewed candidates, not accepted graph claims or treatment recommendations. The cohort and meta-analysis keep different designs, populations, response measures, follow-up and limitations. Neither is mapped onto an anti-TNF efficacy edge as if that proved a serology-response finding.

SSc preserves existing candidates for PMIDs **30760472**, **29514998** and **33175976**, including the separation between human association, ex-vivo findings and mouse-model intervention. Its source identity is classified as repository metadata awaiting verification. Reuse licences, fresh retrieval times and source-content hashes are **not invented**. Existing abstract locators remain locator-only records: no full text or abstract passages are copied without the required evidence. Unextracted structured context stays null and appears in the review tasks.

The synthetic RA research working set is deliberately not an input to this real-publication catalogue.

## What is functional

- `/research/evidence-readiness` is linked from the scientific workspace. Filter by indication, search PMID/DOI/title/candidate text, select a publication, inspect passages, source versions, licence receipts, context and blockers, and download a review-preparation packet.
- `src/evidence/researchEvidenceCorpus.ts` supplies bounded, browser-safe contracts and source/passage/claim joins. Canonical PMID identities, normalized DOIs, duplicate detection and disease boundaries prevent accidental source/claim reassignment.
- The corpus version hashes canonical semantic input/body content. Each imported passage has a separate text hash and a source-content version. Metadata-file hashes are not represented as fetched article hashes.
- Browser verification checks both corpus and passage hashes before displaying data. A matching hash detects content consistency; it is not a signature, scientific approval, or proof of origin.
- Readiness reports list per-candidate source rights, correction/retraction, context, supporting-passage and scientific-review gaps. All seven remain excluded from release eligibility.
- Preparation packets bind tasks to the corpus version and source content versions. Principal assignments, human decisions and record IDs remain null; no reviewer is invented. Completing a file never grants authority or approves anything.

## Rebuild and check

From the repository root, with Bun installed:

```sh
bun run evidence:build
bun run evidence:check
```

The first command regenerates the working corpus, readiness report and review packet in `research/evidence-corpus/` and their public copies in `site/public/research/evidence-corpus/`. The second fails on stale or missing copies. Both run offline without database credentials, provider requests, migrations or publication. Re-running unchanged inputs yields identical artifacts.

Root `check` and the site deployment build run the artifact check. A site-only Vercel install can execute it using Bun and built-in modules; it must include the existing files outside `site` as already configured for HSI.

## Human gates still required

1. **Source rights:** an accountable human checks the actual licence evidence and permitted storage/display/research uses. RA's existing automated import receipts are preparation evidence, not a new human clearance. SSc requires source-level rights evidence before passage ingestion.
2. **Source integrity:** perform and record a current correction/retraction check against an authoritative source. An unknown status never means no retraction.
3. **Scientific evidence:** verify source identity, passage support, model/cohort/assay/tissue/outcome/timepoint context, and limitations. Separate human and animal findings, and adjudicate apparent disagreements in context.
4. **Trusted recording:** record human decisions through authenticated, independently authorized backend services, bound to the reviewed version. Existing scientific-review and reviewer-authority services are the relevant foundations. The preparation JSON is not an import path for self-attested approvals. Source-rights attestation persistence still needs a trusted workflow before human clearance can be claimed; no such record was fabricated here.
5. **Release acceptance:** only a separately verified publication process may issue a release after the current rights, source, scientific and Gate C requirements pass. This working corpus must **not** be used as `HSI_SSC_RESEARCH_RELEASE_ID` or a substitute for a published Neon release.

The paused Auth/database alignment and protected live acceptance are unchanged. This delivery does not alter Phase A permissions or enable writes.

## Validation

Ten new core tests cover the real-input adapters, canonical joins, context/version changes, text/corpus tampering, cross-disease transfer, fabricated approvals, unresolved rights and unassigned preparation records. The existing PHI-marker reject helper also runs on corpus text; it is a heuristic, not a de-identification guarantee. Five new browser tests cover filters, real passage provenance, verification failure/retry, packet version binding and mobile navigation.

**Final local verification:** 626 core tests passed; 61 browser checks passed; core TypeScript build, frontend type check, site/API build and artifact consistency checks passed. The existing large frontend-bundle warning remains. These checks do not establish live Neon access, human rights clearance, independent scientific validity or a published release.

## Next phase boundary

Phase C can connect a verified evidence catalogue and governed graph results to investigations, while preserving the draft/excluded status of unresolved sources. It must not convert this working set into approved evidence or imply that passage availability establishes scientific support.
