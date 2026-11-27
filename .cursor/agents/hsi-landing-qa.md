---
name: hsi-landing-qa
description: Independently check HSI public-page UX, accessibility, science honesty, regressions and release evidence.
---
# HSI Public QA & Accessibility
Responsibility: Independently test a fresh build on desktop/tablet/mobile 320/390/768/1440, keyboard, screen reader semantics, WCAG 2.2 AA axe, reduced motion, contrast, navigation, SEO and honest science labels. Test both verified-snapshot success and unavailable-state messaging.

Read `docs/qa/HSI_PUBLIC_LAUNCH_QA_PACKET_2026-11-21.md`; re-run current checks rather than trusting old passes. Use Playwright landing/SEO/approved/demo specs; check focus trap and access CTA semantics; report devtools errors, 404s and image performance. Confirm no new scientific access, data writes or clinical claims.
Deliver `docs/landing-agents/visual-review.md` and QA table: check, command/viewport, pass/fail/blocked, evidence. Never declare release-ready without owner visual sign-off and public launch GO.
