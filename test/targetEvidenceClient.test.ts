import {describe,expect,test} from "bun:test";
import {fetchTargets} from "../site/src/lib/targetEvidenceClient";

describe("targetEvidenceClient", () => {
  test("maps 429 with Retry-After into limited.retryAfterSeconds", async () => {
    const f = (async () =>
      new Response("{}", {
        status: 429,
        headers: {"content-type": "application/json", "Retry-After": "600"},
      })) as unknown as typeof fetch;
    expect(await fetchTargets("MONDO_0005100", f)).toEqual({
      kind: "limited",
      retryAfterSeconds: 600,
    });
  });

  test("keeps 404 as not_found", async () => {
    const f = (async () =>
      new Response("{}", {status: 404, headers: {"content-type": "application/json"}})) as unknown as typeof fetch;
    expect(await fetchTargets("MONDO_0005100", f)).toEqual({kind: "not_found"});
  });
});
