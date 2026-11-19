import { describe, expect, test } from "bun:test";
import {
  assertProfileWorkspaceHandoffHonesty,
  buildProfileWorkspaceHandoff,
  markHandoffOnWorkspace,
  PROFILE_WORKSPACE_HANDOFF_HONESTY,
  PROFILE_WORKSPACE_HANDOFF_SCHEMA,
} from "../src/investigation/profileWorkspaceHandoff";

describe("profile → workspace handoff", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertProfileWorkspaceHandoffHonesty(PROFILE_WORKSPACE_HANDOFF_HONESTY);
    expect(honesty.serverProfileDurableClaimed).toBe(false);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.deviceLocalProfile).toBe(true);
    expect(honesty.inventsInterests).toBe(false);
    expect(honesty.usp).toBe("C");
  });

  test("stays not ready before onboarding", () => {
    const h = buildProfileWorkspaceHandoff({
      onboarded: false,
      question: "Why IL-21?",
      interests: ["IL-21"],
      role: null,
      cadence: "off",
      matchedScenarioId: null,
    });
    expect(h.schemaVersion).toBe(PROFILE_WORKSPACE_HANDOFF_SCHEMA);
    expect(h.ready).toBe(false);
    expect(h.activationStep).toBe("welcome");
  });

  test("hands off onboarded interests and question without inventing a live match", () => {
    const h = buildProfileWorkspaceHandoff({
      onboarded: true,
      question: "How do microbial metabolites influence immune signalling?",
      interests: ["IL-21", "immunology"],
      role: "Research scientist",
      cadence: "weekly",
      matchedScenarioId: null,
    });
    expect(h.ready).toBe(true);
    expect(h.activationStep).toBe("home");
    expect(h.liveRunAvailable).toBe(false);
    expect(h.workspaceHref).toContain("from=profile");
    expect(h.interestLabels).toEqual(["IL-21", "immunology"]);
  });

  test("marks curated scenario availability without auto-run", () => {
    const h = buildProfileWorkspaceHandoff({
      onboarded: true,
      question:
        "Why might IL-21 signalling have different biological consequences across autoimmune disease contexts?",
      interests: ["IL-21"],
      role: "Research scientist",
      cadence: "weekly",
      matchedScenarioId: "il21-autoimmune",
    });
    expect(h.liveRunAvailable).toBe(true);
    expect(h.matchedScenarioId).toBe("il21-autoimmune");
    expect(h.note).toMatch(/Nothing starts until you press Run/);
    expect(markHandoffOnWorkspace(h).activationStep).toBe("workspace");
  });
});
