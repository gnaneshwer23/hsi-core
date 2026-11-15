# Live investigation (P1)

`POST /api/research/live-investigation {"scenarioId":"il21-autoimmune"}` runs a bounded investigation over real public sources and returns a candidate-only brief. UI: "Live investigation" panel on `/research/investigate`. Curated examples on that page stay separate and labelled.

**What runs.** Europe PMC and OpenAlex searches per disease context, Open Targets disease associations, de-duplication by DOI/PMID, sentence-level candidates where two scenario entities co-occur, and an optional two-model challenge (`runModelEntailment`, strict output schema, exact-quote grounding). A failed provider is recorded as failed, never as "no results". Direction (supporting/opposing) is assigned only by the model challenge; without it, every candidate is "direction not assessed" and a keyword hint is shown as a hint only.

**What does not.** No persistence (the UI can save in this browser only), no full text or stored passages, no graph write, no scheduled runs, no mechanistic interpretation or hypotheses (not generated), no free-text questions (curated scenarios only, so callers cannot steer model spend). Migrations 022–033 are untouched.

**Model step.** Off unless `HSI_LIVE_MODEL_STEP_ENABLED=true` and either OpenAI with a different `HSI_OPENAI_MODEL_2` (independent execution, same provider) or both `OPENAI_API_KEY`+`HSI_OPENAI_MODEL` and `ANTHROPIC_API_KEY`+`HSI_ANTHROPIC_MODEL` are set. Per-run budget: 12 calls, 60,000 input characters, 400 output tokens each; USD is computed only if prices are supplied, otherwise reported unknown. Two providers give separate-provider execution; independence stays unverified and model agreement is not scientific proof. The per-instance rate limit (5 per 10 minutes per IP) is best-effort; set provider spend caps.

**Known limits.** Sentence candidates are keyword co-occurrence, not extraction of effect direction, species, tissue or cell state beyond simple cues. Open Targets ids are search inputs; the returned disease name is shown. Abstract coverage depends on provider data. Vercel functions here cap at 30 s, so at most four candidates are model-checked per request.
