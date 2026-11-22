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
