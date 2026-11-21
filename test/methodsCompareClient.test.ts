import {describe,expect,test} from "bun:test";
import {compareMethodsApi} from "../site/src/lib/methodsCompareClient";

describe("methodsCompareClient", () => {
  test("maps 429 with Retry-After into limited.retryAfterSeconds", async () => {
    const f = (async () =>
      new Response("{}", {
        status: 429,
        headers: {"content-type": "application/json", "Retry-After": "600"},
      })) as unknown as typeof fetch;
    expect(await compareMethodsApi("western blot", f)).toEqual({
      kind: "limited",
      retryAfterSeconds: 600,
    });
  });

  test("maps 429 without Retry-After into bare limited", async () => {
    const f = (async () =>
      new Response("{}", {status: 429, headers: {"content-type": "application/json"}})) as unknown as typeof fetch;
    expect(await compareMethodsApi("western blot", f)).toEqual({kind: "limited"});
  });
});
