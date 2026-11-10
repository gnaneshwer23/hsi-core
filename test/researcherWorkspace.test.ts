import { describe, expect, test } from "bun:test";
import {
  exampleResearcherWorkspace,
  reportCommunityPost,
  setDigestCadence,
  shareInvestigation,
} from "../src/researcherWorkspace";
import { handleResearcherWorkspaceApi } from "../src/server/researcherWorkspaceApi";

describe("researcher workspace and community", () => {
  test("demo content is labelled example and never leaves the app", () => {
    const workspace = exampleResearcherWorkspace();
    expect(workspace.label).toBe("Example researcher");
    expect(workspace.posts.every((post) => post.title === "Example post" && post.authorLabel === "Example researcher")).toBe(true);
    expect(workspace.notifications.every((item) => item.externalDelivery === "disabled")).toBe(true);
    expect(workspace.digest.emailEnabled).toBe(false);
    expect(workspace.digest.smsEnabled).toBe(false);
    expect(setDigestCadence(workspace.digest, "daily").channel).toBe("in_app_only");
    expect(JSON.stringify(workspace)).not.toMatch(/University|testimonial|people are using/i);
  });

  test("sharing is opt-in, blocks private content, and does not persist while the schema is held", () => {
    expect(shareInvestigation({ optedIn: false, containsPatientData: false, containsClinicalRecord: false, body: "Example" }, { writesEnabled: true, schemaApplied: true })).toEqual({
      ok: false,
      code: "OPT_IN_REQUIRED",
    });
    expect(shareInvestigation({ optedIn: true, containsPatientData: true, containsClinicalRecord: false, body: "Example" }, { writesEnabled: true, schemaApplied: true }).code).toBe("PRIVATE_CONTENT_BLOCKED");
    expect(shareInvestigation({ optedIn: true, containsPatientData: false, containsClinicalRecord: false, body: "Example" }, { writesEnabled: false, schemaApplied: false }).code).toBe("RESEARCH_WRITES_DISABLED");
    expect(shareInvestigation({ optedIn: true, containsPatientData: false, containsClinicalRecord: false, body: "Example" }, { writesEnabled: true, schemaApplied: false }).code).toBe("SCHEMA_NOT_APPLIED");
    const reported = reportCommunityPost(exampleResearcherWorkspace().posts[0]!);
    expect(reported.moderationState).toBe("report_recorded_no_moderator");
    expect(reported.reviewStatus).toBe("not_independently_reviewed");
  });

  test("HTTP writes fail closed and the example feed does not persist", async () => {
    const example = await handleResearcherWorkspaceApi(new Request("https://hsi.test/api/research/community/example"), { writesEnabled: false });
    expect(example?.status).toBe(200);
    const body = await example!.json();
    expect(body.persisted).toBe(false);
    expect(body.posts[0].title).toBe("Example post");
    const write = await handleResearcherWorkspaceApi(new Request("https://hsi.test/api/research/community/posts", { method: "POST" }), { writesEnabled: true });
    expect(write?.status).toBe(403);
    expect((await write!.json()).code).toBe("SCHEMA_NOT_APPLIED");
    expect(handleResearcherWorkspaceApi(new Request("https://hsi.test/api/research/health"), { writesEnabled: false })).toBeNull();
  });
});
