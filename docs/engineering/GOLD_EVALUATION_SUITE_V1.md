# HSI Gold Evaluation Suite v1

Extends `evaluation/research-readiness` and Phase E contracts. **Not** a separate framework and **not** scientific gold.

## Honesty

- Current 50-question bank = **draft**, not expert gold.
- SME annotation / adjudication slots stay empty (`independentlyLabelledCases=0`).
- No invented labels, licensed packets, frozen held-out gold, or model activation.
- Metrics remain null until rights-cleared packets + independent SME adjudication exist.

## Ten capability slots

1. Versioned licensed packets  
2. Claim-level spans  
3. Species / tissue / study context  
4. Supporting / opposing / null  
5. SME annotation + adjudication slots  
6. Study-grouped splits  
7. Citation + semantic-support eval  
8. Context-mismatch + abstention  
9. Baseline vs candidate  
10. Immutable manifests / reports  

## Baselines (evaluate before models)

Registered now, scores null:

- Deterministic extractive baseline (`scientificEvaluation` / Phase E)
- Lexical retrieval baseline (`hsi-lexical-retrieval-baseline-1`)

Candidate / hybrid / generative paths stay `not_configured` with `activationAllowed=false`.

## Commands

```sh
bun run gold:prepare
bun run gold:check
bun --no-env-file test test/goldEvaluationSuite.test.ts
```

Artifacts: `evaluation/gold-evaluation-suite/v1/`.
