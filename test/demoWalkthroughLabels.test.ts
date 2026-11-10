import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { reviewEventLabel } from "../site/src/lib/reviewEventLabel";

describe("demo walkthrough labels", () => {
  test("maps raw review events to plain English", () => {
    expect(reviewEventLabel("job.awaiting_send_approval")).toBe("Waiting for approval to send");
    expect(reviewEventLabel("job.draft")).toBe("Draft created");
    expect(reviewEventLabel("unknown.event")).toBe("Review update");
    const page = readFileSync(resolve("site/src/pages/DemoWalkthrough.tsx"), "utf8");
    expect(page).toContain("reviewEventLabel(event.name)");
    expect(page).toContain("Demo environment");
    expect(page).not.toContain("Illustrative environment");
    expect(page).toContain("reviewEventLabel(event.name)");
  });

  test("gives /demo its own prerender title", () => {
    const seo = readFileSync(resolve("site/src/lib/seo/siteSeo.ts"), "utf8");
    expect(seo).toContain("'/demo':{name:'Illustrative walkthrough',title:'Illustrative Research Walkthrough | Human Super Intelligence'");
    expect(seo).not.toMatch(/\/demo'[\s\S]{0,80}Research Tools & Account Access/);
  });
});
