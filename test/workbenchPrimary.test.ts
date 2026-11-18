import { describe, expect, it } from "bun:test";
import {
  AUTHORISED_INVESTIGATION_PATH,
  LIVE_INVESTIGATION_PATH,
  RESEARCH_HOME_PATH,
  authorisedInvestigationHref,
  liveInvestigationHref,
} from "../site/src/lib/workbenchPrimary";

describe("workbenchPrimary", () => {
  it("keeps the live investigation path as the primary workspace", () => {
    expect(LIVE_INVESTIGATION_PATH).toBe("/research/workspace");
    expect(RESEARCH_HOME_PATH).toBe("/research/home");
    expect(liveInvestigationHref()).toBe("/research/workspace");
    expect(liveInvestigationHref({ reopen: true })).toBe("/research/workspace?reopen=1");
  });

  it("builds authorised investigation deep links without inventing ids", () => {
    expect(AUTHORISED_INVESTIGATION_PATH).toBe("/research/decision-workbench");
    expect(authorisedInvestigationHref("hsi-interrogative-abc")).toBe(
      "/research/decision-workbench?investigation=hsi-interrogative-abc",
    );
  });
});
