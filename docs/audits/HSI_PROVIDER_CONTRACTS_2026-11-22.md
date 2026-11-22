# Governed provider tools: contract verification

Date: 22 November 2026. Code: `src/governedProviderTools.ts`, behind `src/governedToolGateway.ts`.

All tools are **metadata only** (`passageAccess: "metadata_only"`). None returns full text or asserts a licence. None has been called against a live provider by the test suite: tests use fixtures. Registering a tool is not source-policy approval: the source-policy owner still has to approve each host, its terms and a quota before any real run (see the SCOUT row in `docs/STATUS.md`).

## What was verified, and how

Documentation was read, and one small read-only GET per API (no user data in any request) was made on 22 Nov 2026 through a web-scraping service to confirm response shapes. Fixtures in `test/governedProviderTools.test.ts` are reduced copies of those responses.

| Provider (tool id) | Request used | Verified | Not verified |
| --- | --- | --- | --- |
| OpenAlex (`literature.search`) | `GET api.openalex.org/works?search&per_page&select` | Keyless use is allowed; a key is sent as `api_key` or a bearer header (header used here); response `results[]` with `id`, `doi`, `title`, `publication_year`, `ids.pmid`, `type` | Current pricing and free budget beyond what the API itself reported; terms of use |
| Crossref (`literature.search`) | `GET api.crossref.org/works?query.bibliographic&rows&select[&mailto]` | Documented polite pool via `mailto`; response `message.items[]` with `DOI`, `title[]`, `issued.date-parts`, `type`, `container-title[]` | Current numeric rate limits; terms |
| ClinicalTrials.gov (`trial.search`) | `GET clinicaltrials.gov/api/v2/studies?query.cond&pageSize&fields&format=json` | Response `studies[].protocolSection` identification, status and conditions modules; `nextPageToken` | Rate limits and usage terms (the docs page is script-rendered and did not yield them); pagination is not used |
| Open Targets (`evidence.get`) | `POST api.platform.opentargets.org/api/v4/graphql` via the existing `openTargetsAdapter` | Endpoint, in the official documentation | The `disease(efoId)` / `associatedTargets` query already in the repo was **not** re-verified against the documentation or a live call in this session |
| Europe PMC (`literature.search`) | Existing adapter, unchanged | Not re-verified in this session | Everything |

Not built: PubMed / NCBI E-utilities, approved ontologies (`ontology.lookup`), omics datasets.

## Findings worth acting on

1. **OpenAlex keyless is close to unusable for real runs.** A keyless response reported a shared daily budget of $0.10 across all users on the same network address, against $1 a day for a free key. The key is a credential and a human decision: it is read only from `HSI_OPENALEX_API_KEY`, never defaulted, never placed in a URL. This work did not create a key.
2. **A live OpenAlex response contained a `meta.notice` that addresses AI agents** and tells them how to create an API key by sending an email address. This is a real instance of agent-directed text in provider output. The gateway copies only allowlisted fields, so the notice never reaches an agent, and a test asserts it. Nobody should follow such instructions automatically: doing so would send a person's email address to a third party.
3. **The existing `src/evidence/openAlexRelatedWorks.ts` uses the older `mailto` identification** and is not behind the gateway. It may hit the small keyless budget. Not changed here.
4. **Crossref contact address.** The polite pool needs a contact address. It is read only from `HSI_CROSSREF_CONTACT` and must be a project mailbox. With none set, the tool uses the public pool.

## Configuration

`.env.example` documents `HSI_OPENALEX_API_KEY` and `HSI_CROSSREF_CONTACT` (both optional, both unset by default). Invalid values are ignored and never echoed.
