import {expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import workspaceExample from "../site/api/research/workspace/example";
import communityExample from "../site/api/research/community/example";
import graphWorkspaceStatus from "../site/api/research/graph-workspace/status";
import onboardingProfileStatus from "../site/api/research/onboarding-profile/status";
import {NESTED_RESEARCH_PROBE_PATHS, probeFailureReason, probes} from "../scripts/probe-deploy";

const ENTRIES = [
  {
    path: "/api/research/workspace/example",
    file: "site/api/research/workspace/example.ts",
    handler: workspaceExample,
    assert(body: Record<string, unknown>) {
      expect(body.persisted).toBe(false);
      expect(body.schemaApplied).toBe(false);
      expect(body.label).toBe("Example researcher");
    },
  },
  {
    path: "/api/research/community/example",
    file: "site/api/research/community/example.ts",
    handler: communityExample,
    assert(body: Record<string, unknown>) {
      expect(body.persisted).toBe(false);
      expect(body.schemaApplied).toBe(false);
      expect(Array.isArray(body.posts)).toBe(true);
    },
  },
  {
    path: "/api/research/graph-workspace/status",
    file: "site/api/research/graph-workspace/status.ts",
    handler: graphWorkspaceStatus,
    assert(body: Record<string, unknown>) {
      expect(body.service).toBe("hsi-graph-workspace");
      expect(body.path).toBe("localStorage");
      expect(body.acceptedForScope).toBe(false);
      expect(body.scientificApproval).toBe(false);
    },
  },
  {
    path: "/api/research/onboarding-profile/status",
    file: "site/api/research/onboarding-profile/status.ts",
    handler: onboardingProfileStatus,
    assert(body: Record<string, unknown>) {
      expect(body.path).toBe("localStorage");
      expect(body.schemaApplied).toBe(false);
      expect(body.acceptedForScope).toBe(false);
      expect(body.scientificApproval).toBe(false);
    },
  },
] as const;

test("the four nested research routes resolve through explicit site/api entrypoints", async () => {
  for (const entry of ENTRIES) {
    const source = readFileSync(join(import.meta.dir, "..", entry.file), "utf8");
    expect(source).toContain("handleVercelResearch");
    const response = await entry.handler.fetch(new Request("https://hsi.example" + entry.path));
    expect(response.headers.get("content-type")).toContain("application/json");
    const text = await response.text();
    expect(text).not.toContain("The page could not be found");
    expect(response.status).toBe(200);
    const body = JSON.parse(text) as Record<string, unknown>;
    expect(probeFailureReason(
      {name: entry.path, method: "GET", path: entry.path, status: [200], expectAppJson: true},
      response.status,
      text,
      response.headers.get("content-type"),
    )).toBeNull();
    entry.assert(body);
  }
});

test("the production probe requires app JSON for the four nested research routes", () => {
  expect([...NESTED_RESEARCH_PROBE_PATHS]).toEqual(ENTRIES.map((entry) => entry.path));
  for (const path of NESTED_RESEARCH_PROBE_PATHS) {
    const probe = probes.find((item) => item.path === path);
    expect(probe?.expectAppJson).toBe(true);
    expect(probe?.status).toEqual([200]);
    expect(probeFailureReason(probe!, 404, "The page could not be found", "text/plain; charset=utf-8")).toBe("status 404");
    expect(probeFailureReason(probe!, 200, "The page could not be found", "application/json")).toBe("Vercel plain-text NOT_FOUND");
    expect(probeFailureReason(probe!, 200, "{\"ok\":true}", "text/plain")).toBe("content-type text/plain");
  }
});
