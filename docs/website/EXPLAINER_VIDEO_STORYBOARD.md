# HSI explainer video: storyboard (draft for approval)

Status: proposal. Nothing is built. Purpose: say, in about 75 seconds, what HSI is for and what is different about it, using only the real product and claims it can back.

## Rules for the video
- Only our own UI, captured from the running product. No third-party footage, logos or screenshots.
- Every number on screen is read from the live published snapshot at capture time. At the last check it was 153 concepts, 95 candidate relationships, 9 recorded gaps, 0 scientifically reviewed; re-read before rendering.
- "Research preview", "candidate-only" and "synthetic patients" are visible in the frames where they apply.
- No invented customers, testimonials, statistics, speed or accuracy claims. No "AI-powered".
- Captions on by default. No autoplay with sound on the page. Respects reduced motion (the page offers a play button and a poster, not autoplay).

## Scenes (1920x1080, 30 fps, about 75 s)

| # | Time | Picture (captured from the product) | On-screen text / caption |
|---|---|---|---|
| 1 | 0-9 s | Dark panel, type only. Two statements animate in as plain text. | "Biomedical findings are scattered across papers, models and experimental contexts." / "Two results can disagree because the context differs, not the biology." |
| 2 | 9-23 s | Landing hero graph, live. A slow drag and zoom; a department filter is applied, then reset. | "HSI connects them in one graph." / "153 concepts, 95 candidate relationships. Every line is a candidate and unreviewed." |
| 3 | 23-38 s | Explorer: select IL-21, open one relationship. The inspector shows model, source with PMID, limits, "Unreviewed source candidate". | "Every claim keeps its source, the model it was studied in, its limits and its review status." / "Findings that did not hold stay in the graph." |
| 4 | 38-53 s | Gap card for "Does a reproducible change in human butyrate exposure mediate improved glycaemic outcomes?". Press Check Europe PMC; show counts. Three tier chips: Graph coverage gap, Evidence signal, Scientific knowledge gap: not assessed. | "A gap is first only a gap in the graph." / "HSI counts the literature for it. Only an expert decides whether it is a real gap in knowledge." |
| 5 | 53-65 s | Synthetic cohort and trial pre-screening screens, with the Synthetic banner and a "not enough information" result. | "Patient-level work runs in a separate governed plane." / "Here it is synthetic only. Nothing says someone is eligible." |
| 6 | 65-75 s | Limits band, then the Set up your research home button. | "Not yet: model checks are off, nothing is reviewed, saved work stays on your device." / "Set up your research home." |

The numbers in scene 4 must be captured live at render time. At the last check, Autoreactive CD8 T cells returned 234 records, Beta-cell injury 98, and 1 record mentioned both, which the product labels "too little literature to judge". Do not hard-code them.

## Production plan (minimal stack)
- Remotion for the timeline and text scenes (React, reuses our tokens and Host Grotesk). Lives in its own `video/` package so it never enters the site bundle.
- Playwright (already in the repo) records the real product states for scenes 2 to 5, with the same API proxy used for screenshots. Frames are captured at 1920x1080.
- FFmpeg (bundled with Remotion) for the final H.264 encode, target under 10 MB. A WebM alternative is optional.
- Captions are written by hand as WebVTT from the table above. No speech transcription.
- QA: a contact sheet of every scene, and a check that each on-screen number equals the live snapshot at render time.
- Page: a "Watch the 75-second overview" control on the landing, a `<video controls preload="none">` with poster and captions track, no autoplay.

Not used: Blender, Three.js, Tone.js and the audio and ML stack. They add size, licensing or credibility problems and nothing the product needs.

## Decisions needed before building
1. **Voice-over.** Captions only (recommended), a recorded narrator, or a synthetic voice (which must be disclosed on the page).
2. **Music.** None (recommended) or one quiet licensed track.
3. **Remotion licence.** Confirm HSI's size and the current licence terms before use.
4. **Hosting.** Static asset on the site, or an external host. The site entry budget is not affected either way.
5. **Final copy.** The captions above are the proposal; the legal and clinical wording should be reviewed with the owner items on the launch list.
