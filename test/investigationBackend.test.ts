import { test, expect } from "bun:test";
import { parseInvestigationCommand, readInvestigationRequest, investigationError, InvestigationRequestError, createOwnedInvestigationBackend } from "../src/investigationBackend";
import { InvestigationAccessError, InvestigationConflictError } from "../src/investigationService";
const request = (body: string, headers: Record<string,string> = {}) => new Request("https://research.example/api", { method: "POST", headers: { origin: "https://research.example", "content-type": "application/json", ...headers }, body });
test("HTTP rejects oversized declared and streaming bodies before parsing research commands", async () => {
  for (const req of [request("{}", { "content-length": "9000" }), request('"'+"x".repeat(9000)+'"')]) await expect(readInvestigationRequest(req)).rejects.toMatchObject({ status: 413 });
});
test("same-origin JSON actions reject cross-site forgery and malformed or clinical uploads", async () => {
  await expect(readInvestigationRequest(request('{"action":"list","cursor":null}', { origin: "https://attacker.example" }))).rejects.toMatchObject({ status: 403 });
  await expect(readInvestigationRequest(request("{}", { "content-type": "text/plain" }))).rejects.toMatchObject({ status: 415 });
  for (const body of ['{}','{not-json','{"action":"start","releaseId":"valid-release","conceptId":null,"patient":{"id":"not-accepted"}}','{"action":"review","key":"INV-00000000-0000-0000-0000-000000000000","revision":1,"decision":"accept_for_research","rationale":"test","role":"admin"}']) await expect(readInvestigationRequest(request(body))).rejects.toMatchObject({ status: 400 });
  expect(await readInvestigationRequest(request('{"action":"list","cursor":null}'))).toEqual({ action: "list", cursor: null });
});
test("command boundary rejects arbitrary bundles, roles, scope selectors and invalid revisions", () => {
  for (const value of [ { action: "start", releaseId: "release", conceptId: null, bundle: {} }, { action: "list", cursor: null, ownerId: "victim" }, { action: "resume", key: "../victim", revision: 1 }, { action: "recover", key: "INV-00000000-0000-0000-0000-000000000000", revision: 0 } ]) expect(() => parseInvestigationCommand(value)).toThrow();
});
test("HTTP errors keep provider/storage details private and disable caching", () => {
  for (const [error, status] of [[new Error("secret-db-url"),503],[new InvestigationRequestError(429,"investigation_start_limit"),429],[new InvestigationAccessError(),403],[new InvestigationConflictError(),409]] as const) {
    const response = investigationError(error); expect(response.status).toBe(status); expect(response.headers.get("cache-control")).toBe("private, no-store");
  }
});
test("invalid SQL namespaces or actors cannot instantiate a product backend", () => {
  const options = { database: { query: async () => [], transaction: async () => undefined }, schema: "aksh;DROP TABLE users", principal: { ownerId: "owner", actor: { id: "actor", role: "admin" } }, releases: [], loadRelease: async () => ({}) };
  expect(() => createOwnedInvestigationBackend(options as never)).toThrow();
});
test("same-origin validation uses request Host when Next reconstructs an internal URL", async () => {
  const make = (origin: string) => new Request("http://localhost:3109/api", { method: "POST", headers: { host: "127.0.0.1:3109", origin, "content-type": "application/json", "x-forwarded-host": "attacker.example" }, body: '{"action":"list","cursor":null}' });
  expect(await readInvestigationRequest(make("http://127.0.0.1:3109"))).toEqual({ action: "list", cursor: null });
  await expect(readInvestigationRequest(make("http://attacker.example"))).rejects.toMatchObject({ status: 403 });
});
