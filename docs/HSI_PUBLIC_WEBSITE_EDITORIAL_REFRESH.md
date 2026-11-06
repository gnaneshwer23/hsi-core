# HSI public website editorial refresh

6 November 2026. Scope: public landing pages, copy, visuals and navigation.

## Intent

Apply the founder's anatomical/biotech website references while replacing the previous presentation-like sequence of repeated card grids, numbered capability panels and data previews. The result uses a continuous research narrative: the problem, the investigation workflow, the research hand-off and the relevant product entry point.

The public website describes actual research capabilities and product scope. It does not present generated profiles as real patients, invent scientific findings, imply clinical deployment, copy the references' customer/diagnostic claims or promise unavailable submission services.

## Design

- White/mist surfaces, teal accents, larger sans-serif typography and open editorial sections.
- An original generated anatomical brand image used as artwork, not patient imagery or a measured anatomical model. The portrait was generated with the image-generation tool for this project, then encoded as a 233 KB WebP without creative changes. The original PNG remains in the generation workspace; the deployed asset is `site/public/images/hsi-anatomy.webp` (1024×1536).
- A bespoke homepage with an anatomy-led hero, research-perspective strip, problem explanation, accessible capability tabs, research-brief narrative and product rows.
- Shared artwork and flatter layouts on platform, products, technology, research, solutions, science and product-introduction pages. Existing platform/product interactive controls remain operational.
- Reduced borders/shadows, fewer boxed grids, consistent linked rows, calm scope copy and responsive layouts. Artwork has explicit dimensions, alt text and appropriate loading priority.
- Public navigation is Platform / Research / Products / Science / How it works. Solutions, Technology, Evidence & safety and Access are secondary. Local discussion rehearsal and the engineering roadmap are not promoted in public navigation/footer.

## Public-content changes

Removed from landing pages:

- Generated-patient and dataset previews, fixture counts, trial simulations and validation-lab entry points.
- Local discussion rehearsal as a public marketing destination.
- The contact-page local preparation/download form, which did not submit an inquiry. The access page now leads directly to actual account registration, verification and permission checks.
- Repeated demo-like caveats/status presentations where no actual scientific result is being displayed. Evidence definitions, independent review responsibilities and product maturity remain clear.

Research access points to the account process. Sources, scientific claims and reviewer authority still require their existing permissions and gates. HSI Trials remains explicitly planned, with no live matching or enrolment offered. Care remains with the appropriate separately governed products.

Internal validation workspaces, record labels, source lineage, integrity checks, scientific-claim restrictions, review independence and trial-eligibility refusals remain in place. Test fixtures have not been relabelled as real data or deleted to improve marketing appearance. The protected/public-fixture data boundaries remain the same.

## Implementation

- `site/src/components/editorial/Editorial.tsx`: artwork, research-process figure, accessible capability tabs and shared CTA.
- `site/src/styles/editorial-site.css`: public-only design layer, applied through the `editorial-site` shell class. Research/dashboard/graph tool styling is not replaced by this presentation layer.
- Existing public routes retained; SEO prerender, canonical metadata, sitemap and noindex tool policy continue to work. Access/trials descriptions were updated to match the actual public content.
- Existing detailed platform/product controls remain, with scope-preserving copy changes.
- Public source domains are labelled Authorised care systems / Aksh / ISI / research sources; no live hospital connector is claimed.

## QA

New browser checks visit all 14 public canonical pages, verify one H1, reject public synthetic/demo/fixture/simulation messaging, reject public validation-lab links and confirm that no validation-fixture assets are fetched by those pages. They also verify the anatomy image, responsive widths and keyboard capability tabs. Existing public access/navigation, product selectors, SEO hydration and private validation/print tests were updated to follow the correct journeys rather than requiring marketing previews to remain present.

Desktop and mobile homepage renders were visually inspected. All controls preserve visible focus and reduced-motion behavior. Existing scientific, auth, data-integrity and role-boundary checks remain part of the regression suite.

Verification result: **775 core tests and all 121 browser tests passed**. Repository build, site TypeScript, public client build and the SEO prerender stage passed. The existing frontend chunk-size warning remains. Live Vercel deployment and search indexing have not been verified by these local checks.

This increment changes public presentation and routing entry points; it does not deploy a clinical service, provision research roles, apply database migrations, claim source clearance or claim measured clinical outcomes.
