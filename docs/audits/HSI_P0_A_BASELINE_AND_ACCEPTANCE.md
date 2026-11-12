# P0-A baseline and evaluation acceptance — v1.1 crosswalk, revision 1

Recorded 12 November 2026. Baseline main: `ec00d58c5e35835646e1b634b654164efc3a8273` (merged #277). This is an implementation crosswalk and proposed acceptance packet, not adoption by a scientific authority or a completed production milestone. #278 separately corrects the history scanner; it is not a dependency of the evaluation changes.

## Authority and status separation

Binding doctrine remains `docs/strategy/HSI_VISION.md`; the supplied Master Vision v1.1 acceptance goals are mapped below without replacing that doctrine. Machine status remains `operations/capability-register/capability-register.v1.json`, rendered by `docs/STATUS.md`. The older engineering register is explicitly superseded. No capability status is upgraded by this packet.

| Vision / acceptance requirement | Implementation and evidence | Acceptance state |
|---|---|---|
| Evidence-grounded research, source provenance and rights | `sourceClearanceReceipt.ts`, `passageVerification.ts`, new `trustedEvaluationGrounding.ts`; signed source/version/passage/action/freshness/revocation checks plus recomputation from a trusted resolver | Offline boundaries testable; authoritative source resolver/rights/retraction service not provisioned |
| Reliable independent verification | `reliabilityEvaluationHarness.ts`, `dualModelChallenge.ts`, `scientificEntailment.ts`, `scientificReliabilityGate.ts` | Whole batch preflight; metrics denominators explicit; model independence and accuracy unverified |
| Reproducible execution evidence | Acknowledged start and terminal receipt adapter, distinct run IDs, model/verifier IDs, exact claim/input and prompt digests, terminal challenge digest | Adapter contract tested with synthetic storage. No production durable store configured. Provider request IDs remain null; these are harness receipts, not provider completion certificates |
| Cross-domain biology and context conflict | Existing `structuredEvidenceComparison.ts`; shared disease alone does not align different biological claims | Regression-tested engineering; immunology-wide scientific acceptance pending |
| Small high-quality agent team | Existing orchestrator + evidence/context investigation + scientific verifier; optional research planner only when justified | No new agent framework or agent proliferation; team quality depends on future accepted 120-case evaluation |
| Independent human governance, no automatic graph publication | Every result stays release-ineligible; receipt approval/promotion flags false; separate existing review services | No named scientific threshold/holdout approval supplied; acceptance remains pending |
| Operational and deployment truth | Required `verify` and `site-deployment` checks build/test local code; Vercel deployment evidence is separate | CI is not scientific, database or production acceptance |

## Changes in this increment

The harness previously accepted a caller-declared all-true grounding receipt alongside source clearance. It now additionally requires a trusted grounding verifier. The provided factory resolves an independently held source by source ID/version, binds the exact passage and claim, and recomputes hash/span/context checks. A browser or model must never supply the trusted resolver or authorization functions. All cases are checked before model dispatch; failures deny the complete batch. Clearance and grounding are checked again after receipt acknowledgements and before dispatch.

Previously execution records existed only in the returned object. A trusted server receipt adapter is now required. Both start records must be acknowledged before the case's two runners execute. Both terminal records must be acknowledged before scoring or assigning completed run IDs. Start failure prevents that case's dispatch; terminal failure yields `not_assessed` and leaves stored starts available for reconciliation. A partial append is not a transaction, and already-dispatched requests cannot be undone. Production storage must provide durable append/idempotency, bounded acknowledgements, immutable access controls and orphan reconciliation; this increment does not assert that an injected callback has those properties. Source text is not stored in these receipts. Digests still require protected access and retention policy.

## Original six probe observations

| Original observation | Regression evidence |
|---|---|
| Private IPv4 accepted (`172.16.0.1`) | `test/providerReliability.test.ts`: exact endpoint allowlist rejects before transport |
| Loopback IPv6 accepted (`::1`) | Same rejection test |
| Private IPv6 accepted (`fc00::1`) | Same rejection test |
| Failed receipt scored support after two calls | `test/reliabilityEvaluationHarnessB044.test.ts`: invalid grounding / mixed batch causes zero calls and no support |
| Invalid gold rejected after two calls | Same harness suite: malformed gold/reviewer/duplicate preflight causes zero calls |
| Different claims sharing disease classified conflict | `test/structuredEvidenceComparison.test.ts`: shared disease does not align different biological claims |

Additional tests cover missing trusted dependencies, recomputed source hash/span/content mismatch, stale signed clearance, source version mismatch, receipt start/terminal failure and revalidation before dispatch. Existing transport tests exercise deadlines (including ignored cancellation and stalled bodies), streamed byte caps, redirect rejection, status/schema errors and private IPv4/IPv6 URL forms.

## P0-A exit ledger

| Exit condition | Evidence or unmet dependency |
|---|---|
| All six original probes repaired | Named regression suites above; required full check must pass at candidate SHA |
| Malformed/duplicate/uncleared/stale/mismatched batch has zero provider calls | Offline injected-runner call counters; no live provider calls made |
| Failed grounding never counts as supported | Recomputed trusted source verifier plus safe adjudication; missing verifier denies |
| Approval and graph promotion remain false | Grounding, adjudication and execution receipt contracts retain false flags; releaseEligible always false |
| Deadlines, response bounds, private addresses, redirects | Existing offline provider boundary suite |
| DNS changes / rebinding protected at actual connection | **NOT ACCEPTED.** Exact hostname allowlisting does not pin resolved addresses. No live transport is integrated. Before enablement require all A/AAAA answers checked against private/link-local/loopback/reserved ranges, connection address pinning without a second DNS lookup, TLS hostname verification, no redirects/proxy bypass and controlled rebinding tests on the actual runtime. A mocked resolver alone cannot prove this |
| Persist actual provider execution evidence | **NOT ACCEPTED live.** Harness append contract added; durable adapter, actual provider request IDs, model deployment versions, dispatch/completion linkage and crash/reconciliation acceptance still required |
| Root/site checks at one SHA | Candidate/run IDs and results recorded in the final handoff; builds are not deployment |
| Named threshold approval before holdout | **PENDING.** Platform, security and scientific owners must be named by the organization. Scientific lead must sign thresholds, case strata, split/hash, leakage rules and analysis plan before holdout access. No threshold invented here |
| No production switch changes | No environment, credentials, migrations, grants or production activation included |

P0-A remains **engineering partially verified / production and scientific acceptance blocked** until the unmet conditions above have independent evidence. Live-provider execution remains unwired; no transport or credential path is added. Trusted callbacks are server dependencies, not request parameters. Empty/synthetic benchmark runs never establish the immunology-wide 120-case benchmark.

## Capability inventory snapshot

Register `hsi-capability-register-2026-11-08`, as-of `2026-11-10`, SHA-256 `69af67cd59fd40e71ea878338f1cab31bc1a46638511246c7b5f412f8b4d822a`. All 35 rows are retained below as registered engineering labels; none establishes live deployment or scientific acceptance. Evidence paths were checked for existence at this baseline, not individually certified as working production behavior.

| ID | Capability | Registered engineering status | Evidence paths present | Deployment / science |
|---|---|---|---|---|
| F-01 | Immune-cell spine and relationship vocabulary | implemented | 1/1 | Not accepted by this inventory |
| F-02 | Living graph and evidence/claim contracts | implemented, connected | 7/7 | Not accepted by this inventory |
| F-03 | Source provenance versions and review records | implemented, connected | 4/4 | Not accepted by this inventory |
| F-04 | RA and SSc evidence packages | implemented, blocked | 2/2 | Not accepted by this inventory |
| F-05 | Saved investigation and research outcome APIs | connected | 5/5 | Not accepted by this inventory |
| F-06 | Research dashboard and multiple workbenches | implemented, connected | 4/4 | Not accepted by this inventory |
| F-07 | Synthetic patient validation records | synthetic_only | 2/2 | Not accepted by this inventory |
| F-08 | Trial and therapeutic scaffolding | implemented, planned | 3/3 | Not accepted by this inventory |
| F-09 | Scientific evaluation harness | implemented, blocked | 3/3 | Not accepted by this inventory |
| F-10 | AI orchestration and agent contracts | implemented, connected | 4/4 | Not accepted by this inventory |
| O-01 | Scientific landscape | connected | 6/6 | Not accepted by this inventory |
| O-02 | Evidence comparison | connected | 3/3 | Not accepted by this inventory |
| O-03 | Gap intelligence | implemented, connected | 4/4 | Not accepted by this inventory |
| O-04 | Translational intelligence | planned | 2/2 | Not accepted by this inventory |
| O-05 | Research action plan | connected | 3/3 | Not accepted by this inventory |
| O-06 | Evidence package export | connected, blocked | 3/3 | Not accepted by this inventory |
| A-ORCH | Research Orchestrator | implemented | 2/2 | Not accepted by this inventory |
| A-EVID | Evidence Investigator | connected | 2/2 | Not accepted by this inventory |
| A-CELL | Immune Cell Investigator | implemented | 1/1 | Not accepted by this inventory |
| A-MECH | Mechanism Investigator | connected | 2/2 | Not accepted by this inventory |
| A-MICRO | Microbiome / Neuroimmune Investigator | implemented | 2/2 | Not accepted by this inventory |
| A-CLIN | Clinical Evidence Investigator | synthetic_only, blocked | 2/2 | Not accepted by this inventory |
| A-CONTRA | Contradiction Investigator | implemented | 2/2 | Not accepted by this inventory |
| A-GAP | Research Gap Investigator | implemented, blocked | 3/3 | Not accepted by this inventory |
| A-TRIAL | Therapeutic / Trial Investigator | planned | 2/2 | Not accepted by this inventory |
| A-PLAN | Research Planning Agent | connected | 2/2 | Not accepted by this inventory |
| A-VERIFY | Evidence Verifier | connected, blocked | 2/2 | Not accepted by this inventory |
| E-FWD | Forward evidence traceability | connected | 6/6 | Not accepted by this inventory |
| E-BWD | Backward evidence traceability | connected | 3/3 | Not accepted by this inventory |
| E-CONT | Continuous evidence re-verification | planned | 2/2 | Not accepted by this inventory |
| J-R3 | R3 Ask→export connected workbench | connected, blocked | 5/5 | Not accepted by this inventory |
| J-INV | Gut–immune–metabolic–neuroinflammation investigation | implemented, synthetic_only | 3/3 | Not accepted by this inventory |
| J-EVAL | Scientific accuracy evaluation harness | implemented, blocked | 3/3 | Not accepted by this inventory |
| J-WORK | Personal workspace, interests and in-app notifications | implemented, synthetic_only, blocked | 3/3 | Not accepted by this inventory |
| J-COMM | Opt-in research community | implemented, synthetic_only, blocked | 3/3 | Not accepted by this inventory |
