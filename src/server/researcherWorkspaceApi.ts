/** Fail-closed HTTP surface for the researcher workspace. No database writes. */
import { exampleCommunityPost, exampleResearcherWorkspace } from "../researcherWorkspace";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function handleResearcherWorkspaceApi(request: Request, options: { writesEnabled: boolean }): Response | null {
  const path = new URL(request.url).pathname;
  const workspace = path.startsWith("/api/research/workspace");
  const community = path.startsWith("/api/research/community");
  if (!workspace && !community) return null;
  if (request.method === "GET" && path === "/api/research/workspace/example") {
    return json({ ...exampleResearcherWorkspace(), persisted: false, schemaApplied: false });
  }
  if (request.method === "GET" && path === "/api/research/community/example") {
    return json({ posts: [exampleCommunityPost()], persisted: false, schemaApplied: false });
  }
  if (request.method === "POST" || request.method === "PUT" || request.method === "PATCH" || request.method === "DELETE") {
    return json(
      {
        ok: false,
        code: options.writesEnabled ? "SCHEMA_NOT_APPLIED" : "RESEARCH_WRITES_DISABLED",
        externalDelivery: "disabled",
        error: "Researcher workspace tables are not applied. Nothing was stored or sent.",
      },
      403,
    );
  }
  return json({ error: "Not found" }, 404);
}
