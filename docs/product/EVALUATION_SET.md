# Evaluation set for HSI's gap output

**Status:** tooling built 15 November 2026. **No ratings exist.** Nothing here shows HSI is better than anything.

## What it tests
Whether the gaps HSI lists are useful to researchers who know the area, on four dimensions kept separate: relevance, specificity and testability, novelty, and accuracy of what it says is missing (rubric `hsi-gap-rubric-1`, anchored 1 to 5, `src/evaluation/rubric.ts`). There is no overall score, because a gap can be relevant but already well known, or novel but untestable.

## Protocol the tooling enforces
1. **Fix an item set** (`/research/evaluation`, Prepare). Items start from the published graph's gaps and, optionally, scientific gaps from the evaluation lead's own saved investigation. HSI outputs only. A comparison output exists only if the lead adds one (another tool's answer, or a list an expert wrote by hand); none is invented. Export the item set; every rater uses the same file (its digest is checked).
2. **Rate blind.** Raters see "Output 1" and "Output 2" in an order that differs per rater and never see the condition. Each output is scored on all four dimensions.
3. **Independence.** Each rater states whether they took part in building, funding or commissioning HSI or have a financial interest in it. Ratings from non-independent raters, including the owner and anyone on the team, are listed and excluded from every result.
4. **Gate before any number.** At least 2 independent raters and 10 outputs rated by two or more of them. Below that, only counts and reasons are shown.
5. **Report honestly.** Per dimension: mean with a 95% bootstrap interval (seeded, so repeatable), pairwise quadratic-weighted kappa and agreement within one point. HSI versus a comparison is called a difference only if the paired interval excludes zero; otherwise "no difference established". Every result is stated as being about these items and these raters.

## Not covered, and needed before any claim
- **Raters.** No independent raters have been recruited. Ten or fewer raters from one network would still be a small, convenient sample.
- **Item set size.** The built-in set has 9 graph gaps; the 10-output gate means a result needs more items (add gaps from investigations, or import a larger set).
- **Baselines.** Which comparison counts as fair (a competitor workflow, a postdoc's hand search, a plain literature search) is a decision for the evaluation lead, and the comparison must be run the same way for every question.
- **Pre-registration.** The dimensions, thresholds, comparison and analysis should be written down and dated before ratings are collected. The tooling does not enforce this.
- **Other claims in the strategy** are not measured here: claim-to-source accuracy, context extraction, hypothesis plausibility, trial pre-screening accuracy against labelled data, researcher time saved. Each needs its own labelled data and protocol.
- **Server collection.** Ratings are exchanged as exported files. Nothing is uploaded.

## Owner note
The owner's own ratings cannot support a claim: the packet's independence rule applies to evaluation as well as to security review.
