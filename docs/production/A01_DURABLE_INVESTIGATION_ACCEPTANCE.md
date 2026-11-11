# A-01 — Live evidence persistence acceptance and HSI Neon staging verification

Date: 2026-11-11. **Verification report, not production sign-off.**

## Verified from connected systems
- GitHub PR #249 merged; PR #250 was open when inspected.
- Neon project **human super intelligence**: `red-wave-06625195`, region eu-west-2.
- Isolated Vercel preview branch for PR #250: `br-dark-mouse-za2nqxma`; production branch `br-quiet-silence-zab1zvji` was **not modified**.
- Read-only SQL against the preview branch confirmed migration ledger through `017_hsi_experiment_ledger`.
- Read-only `information_schema.tables` check found `public.hsi_interrogative_investigations` but **not** `public.hsi_scientific_investigation_records`, `public.hsi_investigations`, `public.hsi_investigation_audit` or `public.hsi_investigation_limits`.
- `src/db/migrate.ts` explicitly holds migrations 022–029. **No held migration was applied.**
- `src/investigationBackend.ts` provides revisioned CAS, owner-filtered list/get, rate limits and stale-run recovery; its expected tables are absent in inspected preview branch. Its current release-based start command does **not** accept a live literature bundle.
- `src/db/investigationWorkspaceStore.ts` exposes authenticated owner-scoped saved interrogative investigations but requires a configured published release (currently an SSc-scoped deployment binding).
- `src/liveInvestigationTrace.ts` normalizes live PubMed bibliography into a `ResearchBundle` but explicitly declares `persistence: "not_persisted"`. No passage rights or scientific claims are inferred.

## A-01 target contract: live public evidence (proposed, not implemented)

`startLiveInvestigation({question,requestId})` should be authenticated; server determines owner, source permissions, id, provenance, data class and storage partition. The request **must not** accept arbitrary client-provided sources, roles, data classes or review decisions.

1. Verify HSI provider session and email status, origin, write feature gate, owner and tenant scope.
2. Validate a 5–400 character research question and UUID idempotency key.
3. Retrieve PubMed/Europe PMC through controlled server adapters; source records carry PMID/DOI, URL, retrieval timestamp, rights, version and source hash. Only store abstract passages where rights permit.
4. Normalize into existing `ResearchBundle` and append validated `ResearchRunEvent` records; do not synthesize claims or grant review status.
5. Atomically create owner-scoped investigation, provenance, run and audit entries; duplicate requestId returns same investigation for the same owner.
6. Expose owner-scoped list/get/export, revisioned resume and operator recovery; reject cross-owner IDs, stale revisions, double starts and unverified sessions.
7. On retry, preserve original source snapshots, append new retrieval events with explicit version, never silently replace scientific evidence.
8. Maintain a separate scientific review gate; no automatic graph promotion.

## Required staging verification matrix

| Test | Required outcome | Status |
|---|---|---|
| HSI-only branch and migration ledger | Explicit branch ID and schema recorded | **Partial**: preview branch verified; new tables absent |
| Live arbitrary question → persisted bundle | Read after restart matches provenance and hash | Not tested |
| Duplicate request ID | Exactly one investigation created | Not tested |
| Concurrent revision updates | Exactly one CAS winner; loser 409 | Not tested |
| Cross-owner get/list/export | 403/404 with no leaked content | Not tested |
| Anonymous/expired session | 401; no database writes | Not tested |
| Owner vs independent reviewer | Creator cannot self-approve | Not tested |
| Interrupted worker and resume | Idempotent recovery and auditable events | Not tested |
| No results, timeout, malformed source | Explicit failure/no-results state; no fake evidence | Not tested |
| Rights unknown or restricted | Metadata-only storage; no text reuse | Not tested |
| Backup/restore and rollback | Restored records, provenance and access rules match | Not tested |

## Blockers and safe next steps
- Do **not** remove held migration IDs or apply SQL without security review, approved rollback and branch-specific sign-off.
- Decide whether to extend the existing `hsi_interrogative_investigations` owner-scoped store or implement the separately drafted `InvestigationStore` schema. **Avoid parallel persistence systems**; designate one canonical run identity and adapter.
- Define database RLS policies, least-privilege application role, audit immutability, idempotency uniqueness and revision CAS in the same migration review.
- Use only the isolated HSI preview branch for the first write test; never run it on the production branch or ISI/Akeno/DeliverX projects.
- CI and mocked tests do not establish database-backed acceptance. All unverified cases remain release blockers.

**Decision:** A-01 durable evidence persistence is **not yet accepted**. The present code supports live read-only retrieval and a distinct release-backed saved workspace, but not a single persisted arbitrary-question investigation.
