# Enabling the live model step in production

**Status: not enabled.** Production has no model keys today, so the live workspace there runs retrieval only and says so. The homepage labels its workspace screen "model checks are switched on per deployment" for that reason. This runbook is for the owner; the application cannot set production environment variables or provider spend limits for you.

## What it costs, and what actually caps it
- One measured run (15 November 2026, two OpenAI models, 4 claims checked, hypotheses on) made 12 model calls and used about 3,700 input and 1,500 output tokens. Multiply by your plan's prices to estimate cost per run. Runs are bounded: at most 16 calls, 60,000 input characters and 1,800 output tokens per call.
- The endpoint is public and unauthenticated. Callers can only pick a curated scenario (no free text). Each IP gets 5 runs per 10 minutes per instance.
- **The real cap is the spend limit you set in the provider console.** The app-side ceiling `HSI_LIVE_MODEL_DAILY_RUNS` (default 50 model-checked runs per instance per UTC day) is a safety net: it is per instance, resets on a cold start and is not shared, so worst case spend is roughly instances x ceiling x cost per run. When it is reached, runs still return retrieval results and say the daily limit was hit.

## Steps (you do these)
1. **Provider:** in the OpenAI dashboard create a dedicated project for HSI production. Set a monthly budget and a hard limit on that project. Create a key restricted to that project; do not reuse a personal or development key.
2. **Pick two different, non-reasoning chat models** that the key can use (the `gpt-5` and `o` families reject two request parameters this runner sends). `bun run live:doctor` checks availability against your key.
3. **Vercel (Production environment only, never `VITE_` prefixed):** set `OPENAI_API_KEY`, `HSI_OPENAI_MODEL`, `HSI_OPENAI_MODEL_2`, `HSI_LIVE_MODEL_DAILY_RUNS` (choose a number you are comfortable with), and last `HSI_LIVE_MODEL_STEP_ENABLED=true`. Redeploy so the function picks them up. Optional: `HSI_OPENALEX_CONTACT` (a project mailbox).
4. **Verify without spending:** `curl https://www.humansuperintelligence.tech/api/research/live-investigation` should report `modelStep.enabled: true` and `openai.configured: true`. Then run one investigation from /research/workspace and confirm the Verify and Hypothesise stages are Done, the verdicts quote passages, and the Vercel function log shows one `live_investigation` line (counts only: calls, tokens, milliseconds; no key, question or IP).
5. **Watch the provider usage page** for the first day.

## Roll back
Set `HSI_LIVE_MODEL_STEP_ENABLED` to anything other than `true` (or delete it) and redeploy. Retrieval keeps working; the model stages report "disabled on this deployment". Rotate the key if it was ever exposed.

## Check configuration locally
`bun run live:doctor` prints PASS or FAIL for each setting and the model ids, never a key, and makes one free request (list models). Run it with the same values you plan to deploy.

## Known limits to keep in mind
- Both checks use one provider, so agreement is independent execution, not independent providers, and the pages say so.
- The 30-second function limit leaves little headroom: a run takes about 13 to 18 seconds. Hypotheses are skipped with a stated reason if the run is already slow.
- A public endpoint that spends money should eventually require sign-in. That needs account storage, which is blocked behind held migrations 022-033 and an independent review.
