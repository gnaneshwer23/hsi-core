import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {AUTH_ERROR_MESSAGES} from "../src/authErrors";

describe("auth grant-gate and session-expiry honesty", () => {
  test("session-expiry copy stays distinct from auth-unavailable", () => {
    expect(AUTH_ERROR_MESSAGES.AUTH_SESSION_EXPIRED).toMatch(/expired/i);
    expect(AUTH_ERROR_MESSAGES.AUTH_SESSION_EXPIRED).toMatch(/Sign in again/i);
    expect(AUTH_ERROR_MESSAGES.AUTH_SESSION_EXPIRED).not.toMatch(/unavailable/i);
    expect(AUTH_ERROR_MESSAGES.AUTH_UNAVAILABLE).toMatch(/unavailable/i);
    expect(AUTH_ERROR_MESSAGES.AUTH_SESSION_EXPIRED).toMatch(/does not grant research access/i);
  });

  test("runbook states grant gate vs provider session", () => {
    const doc = readFileSync(
      join(import.meta.dir, "../docs/engineering/AUTH_GRANT_GATE_AND_SESSION_EXPIRY.md"),
      "utf8",
    );
    expect(doc).toContain("auth_session_expired");
    expect(doc).toContain("signed out ≠ grant denied ≠ session expired ≠ auth down");
    expect(doc).toContain("Neon Auth signup");
    expect(doc).toContain("Administrator research grant");
    expect(doc).toContain("Gate C auto-approve");
    expect(doc).toContain("Does not claim");
    expect(doc).toContain("open signup→write");
  });
});
