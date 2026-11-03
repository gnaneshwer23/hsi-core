# Phase 7 live smoke note (2026-11-03)

**Automated suite:** PASS. **SME labelling:** left for human feedback (not fabricated).

## Automated (all green)

| Check | Result |
| --- | --- |
| HSI `ra:verify-research-path` | PASS — evidence available + research working set |
| HSI unit tests (RA / annotation / scaffold) | 25 pass |
| Python importer tests | 12 pass |
| ISI corpus verify + unit tests | PASS (8 evidence / 2 research passages) |
| Aksh corpus verify + unit tests | PASS |
| ISI Phase 5 disposable DB smoke | PASS (`evidence_start_passages`, …) |
| Aksh Phase 5 disposable DB smoke | PASS (`evidence_start_passages`, …) |

## Live Aksh (`127.0.0.1:3000`, authenticated session)

Via product API while signed into `/internal-research`:

| Action | Result |
| --- | --- |
| `list` releases | `ra-anti-tnf-evidence` available=true, 8 passages, unreviewed |
| `start` `ra-anti-tnf-evidence` | 200; `public_real`; 8 passages; PMIDs 18375541 / 24586782; claims=0 |
| Research corpus | Still available beside evidence (2 synthetic passages) |

ISI production (`www.immune-super-intelligence.co.uk`) returned **DEPLOYMENT_PAUSED** — no live ISI browser pass this tip. Disposable DB smoke covers ISI API path.

## Human next (you)

1. Practice calibrate → Label A/B on `eval-packet-annotator-*.json`.
2. Adjudicate → freeze.
3. Feedback on UI / packet friction (no inventing labels in-repo).
