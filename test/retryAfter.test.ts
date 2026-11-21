import {describe,expect,test} from "bun:test";
import {
  formatRetryAfterHint,
  parseRetryAfterSeconds,
  rateLimitedMessage,
} from "../site/src/lib/retryAfter";

describe("retryAfter helpers", () => {
  test("parses positive whole-second Retry-After values only", () => {
    expect(parseRetryAfterSeconds(new Response(null, {headers: {"Retry-After": "600"}}))).toBe(600);
    expect(parseRetryAfterSeconds(new Response(null, {headers: {"Retry-After": "3600"}}))).toBe(3600);
    expect(parseRetryAfterSeconds(new Response(null, {headers: {"Retry-After": "0"}}))).toBeUndefined();
    expect(parseRetryAfterSeconds(new Response(null, {headers: {"Retry-After": "Wed, 21 Oct 2015 07:28:00 GMT"}}))).toBeUndefined();
    expect(parseRetryAfterSeconds(new Response())).toBeUndefined();
  });

  test("formats second and minute hints", () => {
    expect(formatRetryAfterHint(undefined)).toBe("Try again later.");
    expect(formatRetryAfterHint(1)).toBe("Try again in about 1 second.");
    expect(formatRetryAfterHint(45)).toBe("Try again in about 45 seconds.");
    expect(formatRetryAfterHint(60)).toBe("Try again in about 1 minute.");
    expect(formatRetryAfterHint(3600)).toBe("Try again in about 60 minutes.");
  });

  test("rateLimitedMessage appends a hint on 429 responses with Retry-After", () => {
    const res = new Response(JSON.stringify({error: "Rate limit reached. Try again later."}), {
      status: 429,
      headers: {"Retry-After": "600", "content-type": "application/json"},
    });
    expect(rateLimitedMessage(res, "Rate limit reached. Try again later.", "fallback")).toBe(
      "Rate limit reached. Try again later. Try again in about 10 minutes.",
    );
    expect(rateLimitedMessage(new Response(null, {status: 429}), undefined, "fallback")).toBe("fallback");
  });
});
