import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
const platform = readFileSync(new URL("../site/src/pages/Platform.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../site/src/styles/platform.css", import.meta.url), "utf8");
describe("Platform architecture experience", () => {
  it("retains four product-owned perspectives and explicit access boundaries", () => {
    for (const name of ["aksh:", "clinical:", "isi:", "trials:"]) expect(platform).toContain(name);
    expect(platform).toContain("Sharing technology does not grant access");
    expect(platform).toContain("No live matching, eligibility confirmation or enrolment");
  });
  it("keeps research methods separate from scientific approval", () => {
    for (const name of ["Frame the question", "Inspect the context", "Compare the evidence", "Prepare for review"]) expect(platform).toContain(name);
    expect(platform).toContain("Saving an investigation is not scientific approval");
    expect(platform).toContain("Human review remains explicit");
  });
  it("supports state-driven product, capability and method lens selection", () => {
    expect(platform).toContain("setProductId");
    expect(platform).toContain("setSelected");
    expect(platform).toContain("setLensIndex");
    expect(platform).toContain("moveRadioFocus");
  });
  it("preserves provenance, access and responsive visual system", () => {
    expect(platform).toContain("Provenance alongside evidence");
    expect(platform).toContain("Product-owned access");
    expect(css).toContain("@media");
  });
});
