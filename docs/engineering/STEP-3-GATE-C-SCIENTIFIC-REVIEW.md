# ARCH-002 Step 3 — Scientific Review and Gate C

**Code status:** Review validation, HSI database transaction service and additive append-only migration committed. **Not deployed, not authenticated end-to-end, not yet scientifically approved.**

## Implemented

- `src/scientificReview.ts` validates a server-issued `VerifiedReviewer` principal with `scientific_reviewer` role, source IDs, substantial rationale and explicit conflict-of-interest declaration.
- `src/db/scientificReviewStore.ts` records a decision in the canonical guarded HSI Neon database inside a transaction. It locks a QC-ready claim, checks source linkage, and requires rights-classified non-retracted supporting evidence for an approval decision.
- `db/migrations/003_hsi_scientific_review_guardrails.sql` adds evidence references and conflict-of-interest fields, and an UPDATE/DELETE blocking trigger for review decisions.
- An approval decision is **not** graph publication. Claim status remains `under_review`; no agent, CLI or public endpoint is permitted to self-approve or publish.
- Existing `hsi_gate_c_reviews` legacy rows and ISI's separate Gate C are untouched.

## Security limitations and mandatory integration

**There is deliberately no public review API yet.** `VerifiedReviewer` is a TypeScript contract, not authentication by itself. Never construct it from a request body, user-submitted email, header or CLI flag. A future endpoint must verify an identity-provider session server-side, resolve the scientific reviewer role from a trusted role store, enforce CSRF protection for browser actions, rate limits, audit/alerting and least-privilege DB access. The DB currently does **not** independently verify that `reviewer_principal` is a real authenticated scientist. The transaction is not a substitute for reviewer authentication or scientific validation.

Before production: enforce DB privileges/RLS and a trusted server-side principal; prevent direct inserts by non-reviewer roles; ensure reviewer cannot approve their own AI-generated claims where policy forbids it; handle conflicting and revocation decisions; prevent stale source status; ensure passage/source matching; verify conflict-of-interest policies and legal rights. Migration 003 adds CHECK constraints that may require remediation of pre-existing review rows; inspect staging data first.

## Review workflow

1. HSI ingests authorised publication metadata (Step 1).
2. Evidence candidate is created with source-linked context and QC (Step 2); claim must reach `qc_passed` or `under_review` by a separate controlled QC process.
3. Authenticated scientist examines source material, methods, contradictions, model type, uncertainty, source rights and retraction/correction status.
4. Reviewer records approve/reject/defer with rationale and source references.
5. Append-only review record persists, **but no curated graph publication occurs**.
6. Step 4 release service independently checks current evidence, latest review state, reviewer authorization and release manifest before graph publication.

## Verification commands

`bun test test/scientificReview.test.ts`

`bun run build`

`bun run db:migrate` — **only** after checking migration 003 in a dedicated HSI staging database. No migration was applied by this commit.

## Definition of done still outstanding

- [ ] Identity-provider session integration with trusted reviewer-role resolution.
- [ ] Qualified scientific reviewer assigned and conflict-of-interest policy established.
- [ ] Draft claim import, source linkage and QC transition implemented.
- [ ] Staging migration tested with existing review data.
- [ ] Database role permissions, immutable audit and integration tests passed.
- [ ] A real scientist reviewed SSc claims and signed off.
- [ ] Published graph release independently gated (Step 4).

**This is a security-conscious foundation, not a completed authenticated reviewer workbench or approved scientific corpus.**
