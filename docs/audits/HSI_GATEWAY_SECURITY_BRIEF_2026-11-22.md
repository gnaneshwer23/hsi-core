# Governed tool gateway: adversarial pass and brief for an independent security reviewer

Date: 22 November 2026. Scope: `src/governedToolGateway.ts`, `src/governedProviderTools.ts`, `src/gatewayLimitStore.ts`, `src/fileLock.ts`, and the call path `hsiAgentOrchestrator` to `ctx.callTool` (read only for the last).

**This is a self-review by the author's tooling. It is not an independent review and does not make the gateway security accepted (state S stays "no").** Nothing was deployed and no provider was called; every test uses an injected fetcher.

## Method

`test/gatewayAdversarial.test.ts` (54 tests) states each attack and the control expected to stop it. It was written before the fixes. 12 tests failed against the gateway as it stood on main (merged via #634 and #636), covering the 11 findings below, so each is a confirmed defect, not a guess. After the fixes all 54 pass. Six controls that already passed (hostname match, https only, port, userinfo, redirect mode, byte cap) were then mutated one at a time and each mutation made at least one test fail, so those tests are not vacuous.

## Findings fixed

| # | Finding | Effect before | Fix |
| --- | --- | --- | --- |
| 1 | Idempotent replay keyed only by invocation id | A caller who reused another investigation's invocation id with identical input was served that investigation's stored result | Stored record carries a scope (investigation + task); mismatch or missing scope is refused |
| 2 | Replay trusted the stored file | An edited result file would be replayed to an agent unsanitised | Replay re-hashes the stored data against its recorded `responseHash`; mismatch is refused with `internal_error` |
| 3 | Injection heuristic evaded by zero-width characters | `ig​nore all previous instructions` was not flagged | All Unicode format characters stripped; heuristic runs on an NFKC-normalised copy |
| 4 | Injection heuristic evaded by fullwidth forms | Same | NFKC normalisation |
| 5 | Object keys not sanitised | Injection text, control characters or 100 kB keys passed through | Keys cleaned, capped at 200, and checked |
| 6 | No depth limit on output | Deep nesting hit the JS stack | Depth capped at 32, fails closed as `invalid_output` |
| 7 | Rotating `taskId` minted fresh budgets | Unlimited calls for one investigation id | `investigationCeiling` (default 1000) across all tasks |
| 8 | Audit identifiers unbounded | A 100 kB `invocationId` was written to the log | Capped at 200 characters |
| 9 | Failing audit write made `call` throw | Callers saw an exception after the fetch and budget spend | `call` returns a refusal (`internal_error`, `auditSeq` 0); no data is returned unaudited |
| 10 | Tool or fetcher ignoring the abort signal outlived the timeout | A stalled body hung the call indefinitely | `execute` is raced against the abort signal; body reads cancel on abort |
| 11 | IP-literal hosts accepted at tool registration | A catalogue entry could allowlist `127.0.0.1` or `169.254.169.254` | Registration requires an alphabetic final label |

## Held under attack (no change needed)

Scheme, userinfo, port, suffix and prefix lookalikes, trailing dot, IPv4, IPv6 and decimal-IP literals, `file:` and `data:`, relative URLs: all `egress_blocked`, no fetch made. Redirect mode forced to `error`, credentials omitted. Content-length lies and chunked bodies cut at the cap. `__proto__` keys do not pollute. Hostile query terms stay inside one encoded parameter for all four search providers. Prototype-shaped, oversized and mistyped inputs are refused. 20 concurrent calls against a budget of 3 reach the provider exactly 3 times; the rate window holds under concurrency. Forged manifests (NaN, negative, huge, fractional, extra tools, wrong role, null) are refused before any limit is consumed. Provider ambiguity is refused, never guessed. Clearance fails closed when absent, false, truthy-but-not-true, or throwing. Secrets (an OpenAlex key) never appear in a URL, the audit log or a result. Errors never carry upstream text.

## Residual risks for the independent reviewer

1. **Caller identity is trusted.** The gateway validates a manifest's shape but cannot authenticate who built it or whether `investigationId` is the caller's. The ceiling bounds task-id rotation only. The authenticated session must supply these, and that path (orchestrator, API route) is out of this pass and does not exist in production yet.
2. **Hostname allowlist, no DNS pinning.** A compromised resolver or rebinding to a private address is not detected. `researchV2/pinnedProviderTransport.ts` has pinning for model providers and is not applied here. Recommended before any production wiring.
3. **The egress guard is cooperative.** It applies only to `ctx.fetch`. A catalogue tool that calls global `fetch` bypasses it. A source scan covers `governedProviderTools.ts` only; every new catalogue file needs the same scan, or a lint rule.
4. **Injection handling is a heuristic flag.** Homoglyphs (for example Cyrillic lookalikes) and multi-field splits are not detected. Flags do not block. The structural defences (strict schemas, field allowlists, `untrusted: true`, never concatenated into instructions) are the real control and depend on consumers honouring them.
5. **Audit log.** Dropping the final records is undetectable from the chain alone (tested and documented); the head hash needs anchoring outside the file. Single writer assumed; concurrent writers fork the chain and the next start refuses it, which is fail-closed but a denial of service. No `fsync` on append.
6. **File stores.** Directory and file permissions are whatever the process umask gives. The idempotency store holds tool output (public metadata today) and should be private. Case-insensitive file systems can alias two invocation ids; the scope and request-hash checks make that a refusal, not a leak.
7. **Rate limits are per tool and provider, not per tenant.** One investigation can exhaust a provider's window for everyone. Budgets are not refunded on failure, by design.
8. **`guardedFetch` with a `Request` object** uses only its URL and drops method, headers and body. No tool does this; it is a functional gap, not an observed bypass.
9. **Not reviewed here:** the URL construction inside `researchV2/sourceAdapters.ts` (Europe PMC, Open Targets) beyond the hostile-term test, TLS configuration, the runtime and platform, secret storage, and any model-facing prompt assembly.

## For the reviewer

Run `bun test ./test/gatewayAdversarial.test.ts`, then read the residual list above and decide which items block wiring. Acceptance, if given, should name the scope reviewed and the commit.

## Update: authenticated, tenant-scoped calls (residual risk 1)

Residual risk 1 above (the gateway trusts the caller's manifest and ids) is addressed in code by `src/gatewayCallerAuthority.ts` and an authenticated mode in the gateway. Still a self-review; S stays "no".

- **Issue conditions:** a session token verified by the injected server-side verifier; a researcher or research_admin role; the investigation exists server-side and is owned by that principal in that organisation (not found and not owned look identical); the manifest comes from the server's canonical registry (`canonicalHsiManifest`, which the research runtime now also uses).
- **Unforgeable:** an authorisation is a deeply frozen object registered in a module-private WeakMap. Literals, spreads, structured clones, JSON round trips and another authority's authorisations are refused. The session token never leaves the closure and is absent from authorisations, audit records and logs.
- **Re-verified on every call:** expiry, that the session still verifies as the same subject, organisation and session id, and that ownership still holds. Revocation, replacement, expiry, transfer and deletion take effect at the next call. Any dependency error fails closed.
- **In authenticated mode the gateway ignores the request's manifest, tenant and ids,** requires the request's investigation and task to match the authorisation, and uses the canonical call budget (a request claiming 100 calls gets 3).
- **Tenant scoping:** idempotency store keys are tenant-prefixed (two tenants cannot collide, read or block each other's invocation ids); budgets, the per-investigation ceiling and audit are tenant-keyed; each tenant is limited to a share (default 0.5) of any tool's per-minute window and to a tenant-wide call ceiling (default 5000). Audit records carry domain-separated hashes (`principalRef`, `tenantRef`), never raw ids.
- **Evidence:** `test/gatewayTenantAuthority.test.ts`, 22 tests. 13 single-point mutations (mismatch check, trusting the request manifest, session re-check, ownership re-check, expiry, accepting unissued objects, unscoped store key, tenant rate, tenant ceiling, owner check, organisation check, role check, tenant budget key) were each killed.

Remaining for this risk, none of which this change claims to solve:
1. **No real integration.** The tests use in-memory directories. Nothing connects the authority to the real session gateway, the investigation store or an API route, and no real account or database was involved. That is the staging gate (P0.6).
2. **Background jobs.** A job that outlives the user's session needs a server-side delegation grant (job id, subject, investigation, expiry, revocation). None exists, so such calls are refused after the session ends. Needed for authenticated durable execution.
3. **Licensed data.** Only `public_biomedical` is granted. Licensed-partner data needs an entitlement check.
4. **Unauthenticated mode remains** for fixtures and tests. Production wiring must construct the gateway with a `callerAuthority`; nothing enforces that yet beyond the `mode` flag. A release check should assert `mode==="authenticated"`.
5. **Cost.** Two dependency lookups per call, uncached by design.

## Update: delegation grants for background jobs (item 2 above)

`src/jobDelegationGrants.ts` and `delegate` / `authoriseDelegated` in `gatewayCallerAuthority.ts` close the "job outlives its session" gap. Still a self-review; S stays "no".

- **Creation needs a live, verified, owning session** (same checks as a session authorisation); every requested role must be one the server would issue. Nothing is created otherwise.
- **The grant is the only thing a worker holds:** a grant id and its job id. No session token is stored or queued. A grant id alone does nothing outside the authority.
- **Tamper-evident:** HMAC-SHA256 under a server-only key of at least 32 bytes; an edited, re-keyed, unsigned or swapped record makes reads throw and the call fail closed. Revocation is a separate signed marker; a grant cannot be un-revoked by rewriting its file, and a forged marker fails closed.
- **Bounded and scoped:** lifetime at most 24 h by default (hard maximum 7 d), a role list, one job id, one investigation. An issued authorisation never outlives its grant.
- **Re-checked on every use:** the grant, revocation, expiry, role scope, job id, the account's standing (a server-side lookup, so a disabled user or ended membership stops the job though the session is long gone) and investigation ownership.
- **Evidence:** `test/jobDelegation.test.ts`, 17 tests; 14 mutations killed (revocation, job id, role scope, expiry, standing, ownership, MAC, id/file mismatch, authorisation lifetime cap, lifetime cap, check-path, owner check, revocation record validation). A restart demonstration shows a fresh authority over the same grant and idempotency stores resumes authenticated with zero duplicate provider calls.

Residual, new and carried:
1. **Deleting a revocation marker is not detectable** by this store: an attacker with write access to the directory can un-revoke a grant by removing its marker (they cannot forge one without the key). Mitigations present: short lifetimes and the per-use account-standing and ownership checks. A database store with an append-only audit, or an externally anchored revocation log, is the proper fix.
2. **No key rotation;** losing or changing the key invalidates every grant (fail closed). The key's storage and access belong to the secrets owner.
3. **`resolveStanding` is an injected dependency with no real implementation wired.** Its quality is the account-level kill switch.
4. **File store only:** one host or a shared volume with the atomicity limits of `fileLock`; no listing or bulk revocation by subject.
5. **Nothing here is wired** to the NEXUS worker, a job-submission route or a real session gateway; no real account or database was involved.
