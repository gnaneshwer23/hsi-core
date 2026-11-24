# HSI-BENCH-CONFLICT v1.0

The benchmark for HSI's central claim: telling a **true contradiction** from a **difference in biological context** and from a disagreement whose **context is not reported**.

HSI's context-conflict classifier (`src/knowledgeGraph/contextConflict.ts`) labels each case. The same cases are run by hand through other tools (Scite, Elicit, a general chatbot), and every system is scored against blind expert labels.

## Status

**Blocked until expert cases exist.** The public repository holds the protocol, the harness and synthetic fixtures only. Expert cases and their labels live in the private vault (`.hsi-private-benchmark/conflict/`, git-ignored) and never enter this repository, because this repository is public. Initialise the vault layout with `bun run label-vault:init` (VER-05 / [`../label-vault/README.md`](../label-vault/README.md)).

## Two paths (do not mix)

| Command | Path | Purpose |
| --- | --- | --- |
| `bun run conflict:bench:check` / `:fixture` | `evaluation/conflict-benchmark/fixtures/` | Harness only — CI; never a scientific result |
| `bun run conflict:bench:report` | `fixtures/example-cases.v1.json` | Local Example listing. `harness_only`. Does not state an accuracy figure |
| `bun run conflict:bench:expert` (alias `conflict:bench`) | `.hsi-private-benchmark/conflict/` | Expert-curated cases only; reports stay in the vault |

Expert mode refuses synthetic fixture files and refuses `synthetic_fixture` provenance. Fixture paths are unchanged by A4.2.

`example-cases.v1.json` adds Example rows for species, tissue, endpoint or method, dose, population, a true contradiction, an apparent conflict, and a same-direction pair. Every row is `synthetic_fixture`, says `EXAMPLE` and `harness_only`, and carries two agreeing expected labels. `bun run conflict:bench:report` writes that listing under `evaluation/conflict-benchmark/reports/example/` (gitignored). It does not publish a score.

## Labels

| Label | Use when | HSI classifier class |
| --- | --- | --- |
| `true_contradiction` | Studies in a comparable context (same species or system, tissue, population and design) report opposite directions | `same_context_disagreement` |
| `context_dependent` | Directions differ, and the studies differ in a stated context (for example human versus mouse, or different tissue) that plausibly explains it | `context_separated_disagreement` |
| `insufficient_context` | Directions differ, but at least one study does not report enough context to tell the two cases above apart | `disagreement_context_unknown` |
| `no_disagreement` | All studies report the same direction, or there is only one | `no_disagreement` |

Raters label from the papers themselves, not from the case's context fields. The fields record what the papers report so HSI can be run; if a rater finds a field wrong, they flag the case for correction before scoring.

## Case format

One JSON array of cases in `.hsi-private-benchmark/conflict/cases.json`:

```json
{
  "id": "CB-001",
  "question": "Does butyrate increase regulatory T-cell frequency in the colon?",
  "provenance": "expert_curated",
  "records": [
    {"sourceId": "PMID:...", "citation": "Author et al., Journal, Year", "model": "mouse",
     "tissue": "colonic lamina propria", "population": "germ-free mice", "design": "animal model", "negated": false}
  ],
  "labels": [{"raterId": "R1", "label": "context_dependent"}, {"raterId": "R2", "label": "context_dependent"}],
  "adjudicated": null
}
```

`model` is one of `human_in_vivo`, `human_ex_vivo`, `human_cell_line`, `mouse`, `rodent`, `mixed`, `unspecified`. `tissue`, `population` and `design` are text or `null` when the paper does not report them. `negated` is `true` when the paper reports no effect or the opposite effect.

## Workflow

1. **Collect cases** from real researcher questions and interviews: pairs or small sets of studies that appear to conflict. Target 50 with a reference label. Spread them across the cross-domain slice (immune, gut, metabolic) and include known failed translations such as anti-TNF in RA versus MS.
2. **Fill the context fields** from each paper (methods section).
3. **Two raters label each case blind**, independently, without seeing HSI output or each other's labels.
4. **Adjudicate** disagreements: a third expert sets `adjudicated`.
5. **Run comparators by hand.** Give each tool the same question and papers; record its answer as one of the four labels, or `no_answer`. Save one file per tool:

```json
{"system": "Scite", "method": "Smart Citations for both papers, read 16 Nov 2026",
 "predictions": [{"caseId": "CB-001", "label": "no_answer"}]}
```

6. **Score (expert path):** put comparator JSON under `.hsi-private-benchmark/conflict/predictions/` **or** pass explicit files:

```bash
bun run conflict:bench:expert -- --predictions .hsi-private-benchmark/conflict/predictions/scite.json
```

Without `--predictions`, every `*.json` in `predictions/` is loaded automatically.

## Reading the report

| Status | Meaning |
| --- | --- |
| `harness_only` | Synthetic fixtures. Tests the code; says nothing about science |
| `insufficient_reference_cases` | Fewer than 50 cases with a reference label. Do not publish |
| `rater_agreement_too_low` | Cohen's kappa below 0.6. Fix the labelling guidelines before scoring |
| `ready` | Enough cases and agreement. Publishable once the owner approves the floors |

Proposed floors (owner approval required before the first scored run, and fixed afterwards): accuracy ≥ 80%, true-contradiction recall ≥ 70%, insufficient-context recall ≥ 90%.

## What this benchmark does not measure

HSI is scored on the recorded context fields, so this measures the classification logic, not extraction from papers. A second track, where HSI extracts the context itself from full text, comes after the extraction pipeline is built (engineering pack, AG-03). Report both separately; never mix them.
