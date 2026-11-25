# Landing v2 port (Lovable site) — 25 November 2026

**What this is.** The marketing site built in Lovable (`gnaneshwer23/living-evidence-atlas`) ported into `site/src/landing-v2`, mounted at `/landing-v2/*` as a noindex preview with its own header and footer. It is not linked from the existing site, it is not in the sitemap, and `/` is unchanged. Replacing `/` is a separate decision.

**How it was ported.** Same components, copy and layout. The stack was converted: TanStack Router to React Router (a `Link` wrapper adds the `/landing-v2` prefix), Tailwind v4 utilities compiled into one stylesheet scoped under `.lv2` (no global preflight), Google Fonts replaced with self-hosted `@fontsource` packages (the site CSP blocks third-party fonts), unused shadcn components and the query client dropped. The three.js hero loads lazily and keeps its static SVG fallback for mobile, reduced motion and no WebGL.

**Changes from the original, all to keep claims honest or meet accessibility.**
- Hero paragraph and home meta description: "is being built to connect…" instead of present-tense capability.
- Trust page: "Ten design commitments", four items reworded to "designed to", and a line saying none of the safeguards is running in a deployed service yet.
- Agents page: verification described as "designed to".
- Solutions page and early-access form: no-patient-data and not-clinical-decision-support boundary stated; the form says not to enter patient or unpublished research data.
- Homepage Companion exchange: tagged Illustrative as well as Prototype.
- Accessibility: darker teal for text on the paper sections (contrast was 2.0:1), lighter helix for small chips (4.46:1), and the header logo link no longer overrides its visible name.

**Not changed, still open.**
- Invented demo numbers (1,284 → 212 records, 14 vs 3 studies, 19 vs 4, confidence 28%, 14 Oct investigation) remain, tagged Illustrative. Quoted out of context they read as results.
- The memory timeline (Day 1/14/30/60/90) and "agents" copy describe designed behaviour; the memory engine is not enabled for researchers.
- Hypotheses are presented as something the system proposes; in `hsi-core` predictions are investigator-authored.
- The 3D hero adds about 242 KB gzipped (lazy). Budgets were raised with reasons in `site/bundle-budget.json`; the follow-up is a smaller scene.
- Cross-browser rendering and the 3D scene on low-end devices are not checked.
