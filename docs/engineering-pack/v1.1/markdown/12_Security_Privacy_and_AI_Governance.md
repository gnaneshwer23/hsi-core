---
title: "12. Security, Privacy and AI Governance"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **The biggest risks today are mundane:** an unauthenticated or weakly limited model endpoint running up cost, no observability, per-instance rate limits, a report-only CSP and an unreviewed database role model.
- **The scientific risk is silent promotion.** No code path may turn a model output or an import into reviewed knowledge.
- **Privacy stance:** no patient data in this plane, minimal personal data about researchers (email, topics, saved work), UK GDPR applies to that.
- **An independent reviewer signs off** the database role model and the two-account isolation results before multi-researcher writes go live.

# 2. Where we are

| Control | Status | Detail |
| --- | --- | --- |
| Session verification | Built | Neon Auth sessions verified server-side (`neonAuthGateway.ts`); Ask requires a verified email |
| Origin check | Built | `HSI_PUBLIC_ORIGIN` enforced on Ask |
| Rate limiting | Partial | In-memory per instance (`researchRequestControls.ts`); Ask: 10 per user per hour per instance; shared admission optional |
| Model spend control | Partial | Daily run ceiling (`HSI_LIVE_MODEL_DAILY_RUNS`); provider console caps must be set |
| Security headers | Partial | HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy; **CSP report-only** with a report endpoint |
| Secret scanning | Built | gitleaks on full history in CI |
| Dependency audit | Built | `bun audit` in CI |
| RLS and `SECURITY DEFINER` functions | Partial | Present in migrations; held migrations unreviewed |
| PHI boundary | Built | `rejectPhiPayload` in the live path; pattern-based identifier refusal (not de-identification) |
| Audit trail | Partial | Hash-chained audit in clinical-plane synthetic code; not yet general |
| Observability and alerting | Not started | No error tracking, tracing or alerts |
| Independent review | Not started | No named reviewer |
| Repository visibility | Owner decision | Public repo contains strategy and partner-shortlist documents |

# 3. Threat model

| Threat | Example | Control | Requirement |
| --- | --- | --- | --- |
| Cost abuse | Scripted calls to Ask burn model budget | Auth, shared per-user and global limits, provider spend caps, kill switch | SEC-01, SEC-02 |
| Cross-tenant access | Researcher A reads B's investigation via an ID | RLS with verified principal; API ownership checks; isolation suite | SEC-03 |
| Identity spoofing | Client sends a `userId` | Principal only from verified session | SEC-03 |
| Prompt injection | A paper contains "ignore previous instructions" | No tools for models reading text; schema-constrained output; canary tests | AG-09 |
| Poisoned or retracted sources | Retracted paper supports an edge | Retraction checks; source integrity; review | ING-05 |
| Silent promotion | A bug marks candidates as reviewed | DB constraint: review state changes only via review decisions; tests | SEC-05 |
| Data exfiltration via models | Researcher data sent to a provider | Only public text and the question go to models; never account data or patient data | SEC-06 |
| Secret exposure | Keys in client bundle or logs | Server-only env vars; log redaction; gitleaks | SEC-07 |
| XSS | Untrusted source text rendered as HTML | Text rendered as text; CSP enforced | SEC-04 |
| Supply chain | Malicious dependency | Lockfile, `bun audit`, minimal dependencies | Existing |

# 4. AI governance rules

1. Models propose; humans decide. Review decisions are attributable, immutable and require reviewer authority in the scope.
2. No self-review. An extractor's operator or the claim's proposer cannot approve it.
3. Every model call records provider, model ID, prompt digest, input digest and output.
4. Model outputs are labelled as candidates or hypotheses everywhere they appear, including exports.
5. Two distinct providers for extraction and verification (ADR-016).
6. The public site and investor materials only claim what the capability register records.
7. Model changes (new model ID or prompt) require a benchmark re-run before release.

# 5. Privacy

| Data | Purpose | Retention | Lawful basis (UK GDPR) |
| --- | --- | --- | --- |
| Email, auth records | Account | Life of account + 30 days | Contract |
| Topics, investigations, hypotheses | Service | Life of account; export and delete on request | Contract |
| Access requests | Respond | 12 months | Legitimate interest |
| Operational logs | Security, reliability | 30 days, redacted | Legitimate interest |

Needed: privacy notice, cookie position (no tracking cookies today), data export and deletion endpoints, a record of processing, and processor terms with Vercel, Neon and model providers (no training on our data).

# 6. What to build next

| ID | Work | Acceptance criteria |
| --- | --- | --- |
| SEC-01 | Shared rate limiter | Limits hold across instances (for example Upstash Redis or a Postgres counter); load test proves it |
| SEC-02 | Kill switch and spend caps | One env flag disables model calls in under a minute; caps set in both provider consoles and recorded |
| SEC-03 | Two-account isolation suite and independent review (DB-02, DB-03) | All denial cases pass; signed review on file |
| SEC-04 | Enforce CSP | Report-only for two weeks with zero unexplained reports, then enforced |
| SEC-05 | Promotion constraint | Database rule: `review_state` changes only through `hsi_review_decisions`; test proves direct updates fail |
| SEC-06 | Model data policy in code | Allow-list of fields sent to providers; test fails if account data appears |
| SEC-07 | Log redaction | Tokens, emails and keys redacted; test with seeded secrets |
| SEC-08 | Privacy notice, export and deletion | Pages live; export returns all user data as JSON; deletion removes user-owned rows |
| SEC-09 | General audit log | Hash-chained `hsi_audit_events` for reviews, releases, role grants and admin actions |

# 7. Future options

- SOC 2 or ISO 27001 readiness when selling to biotech.
- Customer-managed keys for enterprise tenants.
- DTAC and DSPT for any NHS engagement (clinical plane only).

# 8. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-110 | Repository visibility | Make `hsi-core` private, or move strategy, competitor and partner documents to a private repo, before the pilot |
| D-111 | Shared limiter technology | A managed Redis with a small free tier, or a Postgres table; choose the one with the fewest new vendors |
| D-112 | Independent security reviewer | Contract a fixed-scope review (auth, RLS, API) before pilot writes go live |
