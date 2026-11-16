---
title: "04. Scientific Data Ingestion and Evidence Pipeline"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **Four separate checks, never merged:** source identity (is this the paper we think it is), reuse rights (may we store its text), retraction status, and claim support (does the passage say what the edge says). Passing one never implies another.
- **Open access first.** Europe PMC open-access full text with a reuse-permitting licence is the only text we store in v1. Everything else is metadata-only, clearly labelled.
- **Sections, not abstracts.** Move from first-abstract-paragraph extraction to methods and results sections, because that is where species, tissue and population live.
- **Every fetch is recorded:** provider, query, identifiers, timestamp, response digest, licence and outcome, including failures.
- **All provider calls go through the server.** Browser-side calls to Europe PMC and Reactome are removed.

# 2. Vision

Any claim in HSI can be traced back to the exact sentence in the exact version of the source that supports it, with proof that we were allowed to store that sentence and that the paper has not been retracted. New papers, corrections and retractions flow in on a schedule and trigger re-review of anything they affect.

# 3. Where we are

| Item | Status | Location |
| --- | --- | --- |
| Europe PMC search | Built | `src/evidence/liveSources.ts`, `src/evidence/europePmcSscDiscovery.ts` |
| OpenAlex search | Built | `src/evidence/liveSources.ts` |
| Open Targets, UniProt, Reactome (incl. protein → pathway) | Built | `src/researchV2/sourceAdapters.ts`, `src/evidence/openTargetsLookup.ts` |
| ClinicalTrials.gov registry import | Partial | `src/evidence/n5RegistryLiveRefresh.ts`; bounded public JSON import |
| Source registry | Built | `src/cli/source-registry.ts`, `docs/SOURCE_REGISTRY.md` |
| Evidence ledger, passages, identity links | Partial | Migration 016 (`hsi_evidence_ledger_records`, `hsi_evidence_passages`, `hsi_evidence_identity_links`) |
| Open-access abstract retrieval | Built | `src/researchV2/openAccessSections.ts` |
| Open-access section extraction (methods, results) | Not started | Backlog item HSI-P2-02 |
| Rights and clearance (AEGIS) | Partial | `src/researchV2/clearancePolicy.ts`, `sourceIntegrityService.ts`; no approved policy, no clearance authority |
| Retraction checks | Partial | Provider retraction flags read in the live run; not checked against a dedicated retraction source |
| Re-verification after corrections | Partial | `src/expansion/sourceRereview.ts`; tested on staging coordinator only |
| Browser-side provider calls | Must remove | `ScienceLiterature.tsx` (Europe PMC), `BiomedicalMetadataPanel.tsx` (Reactome) |
| Current corpus state | Partial | 75 graph sources; 73 rights unverified; 12 bibliographic candidates awaiting verification (N1) |

# 4. Pipeline design

```text
discover -> resolve identity -> check retraction -> decide rights
   -> retrieve (permitted text or metadata only) -> parse sections
   -> locate passages -> extract candidates (doc 05) -> verify (doc 06)
   -> record provenance at every step
```

| Stage | Input | Output | Fails closed when |
| --- | --- | --- | --- |
| Discover | Entities and context terms | Candidate source list with provider and query | Provider error: recorded as `search_failed`, never as zero results |
| Resolve identity | DOI, PMID, PMCID, title | One canonical source record; study-family grouping (preprint ↔ publication) | DOI, PMID and title disagree |
| Check retraction | Canonical IDs | `retracted`, `corrected`, `expression_of_concern`, `none`, `unknown` | Unknown is allowed but shown |
| Decide rights | Licence from provider | `store_text` (for example CC BY, CC0) or `metadata_only` | Licence missing or non-commercial when our use is commercial |
| Retrieve | Permitted source | Versioned full text with checksum | Size limit, unsafe XML, timeout |
| Parse | Full text (JATS XML) | Sections: abstract, methods, results, discussion, figure legends | Unknown structure: keep abstract only, flag it |
| Locate passages | Sections and entity terms | Exact passages with character offsets | Never paraphrase into a passage |

## Provenance record (every stage)

`provider`, `endpoint`, `query`, `requested_ids`, `returned_ids`, `retrieved_at`, `response_sha256`, `licence`, `rights_decision`, `retraction_status`, `adapter_version`, `outcome`, `error_code`.

# 5. What to build next

| ID | Work | Acceptance criteria |
| --- | --- | --- |
| ING-01 | Remove browser-side provider calls (HSI-P0-02b) | No request from the browser to any third-party science API; network test proves it |
| ING-02 | N1 source verification queue | All 12 pending candidates have an explicit outcome; mismatched DOI/PMID/title combinations rejected; failures kept as queue outcomes |
| ING-03 | Rights policy v1 | Written licence allow-list signed by the owner; enforced in code; every one of the 75 sources has a rights decision |
| ING-04 | Open-access section extraction (HSI-P2-02) | Methods and results parsed from Europe PMC JATS XML; fuzz tests for malformed XML and size limits |
| ING-05 | Retraction source | Daily check against Crossref's retraction data (which now includes the Retraction Watch database); retracted sources excluded from runs |
| ING-06 | Study-family grouping | Preprint and published versions linked; multiple papers from one cohort flagged so they are not counted as independent replication |
| ING-07 | Scheduled refresh | Weekly refresh for sources in reviewed edges; changes open re-review tasks |
| ING-08 | Provider quotas and polite access | Per-provider rate limits; contact email set for OpenAlex and Europe PMC; backoff on 429 |
| ING-09 | First-slice corpus | Every source behind the first cross-domain slice is identity-verified, rights-decided and retraction-checked |

# 6. Future options

- Publisher text-and-data-mining agreements for non-open-access full text (Causaly has done this with Sage).
- bioRxiv and medRxiv preprints with a clear "not peer reviewed" state.
- Supplementary tables and figure legends, where species and assay details often hide.
- Dataset sources (GEO, ImmPort, the AMP RA/SLE single-cell data) as evidence of a different kind, with their own licences.

# 7. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-30 | Commercial use and CC BY-NC text | Treat NC-licensed text as metadata-only until legal advice says otherwise |
| D-31 | Named source-policy owner | The owner for now; record it in the capability register |
| D-32 | Providers' terms review | Read and record terms for Europe PMC, OpenAlex, Open Targets, UniProt, Reactome, ClinicalTrials.gov and Crossref before production use |
