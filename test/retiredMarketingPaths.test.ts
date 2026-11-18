import { describe, expect, it } from "bun:test";
import {
  RETIRED_MARKETING_REDIRECTS,
  isRetiredMarketingPath,
  resolvePublicPath,
} from "../site/src/lib/retiredMarketingPaths";

describe("retiredMarketingPaths", () => {
  it("keeps Platform and Science as permanent redirects, not live landing pages", () => {
    expect(RETIRED_MARKETING_REDIRECTS["/platform"]).toBe("/how-it-works");
    expect(RETIRED_MARKETING_REDIRECTS["/science"]).toBe("/knowledge-graph");
    expect(isRetiredMarketingPath("/platform")).toBe(true);
    expect(isRetiredMarketingPath("/science")).toBe(true);
    expect(isRetiredMarketingPath("/how-it-works")).toBe(false);
    expect(isRetiredMarketingPath("/knowledge-graph")).toBe(false);
  });

  it("resolves retired slugs to honest destinations and leaves live paths alone", () => {
    expect(resolvePublicPath("/platform")).toBe("/how-it-works");
    expect(resolvePublicPath("/science")).toBe("/knowledge-graph");
    expect(resolvePublicPath("/how-it-works")).toBe("/how-it-works");
    expect(resolvePublicPath("/science/graph?node=pancreas")).toBe("/science/graph?node=pancreas");
  });
});
