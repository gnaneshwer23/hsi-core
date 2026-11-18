import { describe, expect, it } from "bun:test";
import { classifyDashboardAccess } from "../site/src/lib/dashboardAccessState";

const release = { id: "rel-1", version: "1.0.0", manifestHash: "a".repeat(64) };
const emptyWs = {
  items: [] as never[],
  releases: [release],
  nextCursor: null,
  writesEnabled: true,
  canCreate: true,
};

describe("classifyDashboardAccess", () => {
  it("keeps loading, unsigned, denied and generic errors distinct", () => {
    expect(classifyDashboardAccess({ loading: true, error: "", httpStatus: null, workspace: null, itemCount: 0 }).kind).toBe(
      "loading",
    );
    expect(
      classifyDashboardAccess({ loading: false, error: "x", httpStatus: 401, workspace: null, itemCount: 0 }).kind,
    ).toBe("unsigned");
    expect(
      classifyDashboardAccess({ loading: false, error: "x", httpStatus: 403, workspace: null, itemCount: 0 }).kind,
    ).toBe("denied");
    expect(
      classifyDashboardAccess({ loading: false, error: "timeout", httpStatus: null, workspace: null, itemCount: 0 }).kind,
    ).toBe("unavailable");
  });

  it("separates writes-off, no-create grant, empty authorised list and connected", () => {
    expect(
      classifyDashboardAccess({
        loading: false,
        error: "",
        httpStatus: 200,
        workspace: { ...emptyWs, writesEnabled: false, canCreate: false },
        itemCount: 0,
      }).kind,
    ).toBe("connected_writes_off");
    expect(
      classifyDashboardAccess({
        loading: false,
        error: "",
        httpStatus: 200,
        workspace: { ...emptyWs, writesEnabled: true, canCreate: false },
        itemCount: 0,
      }).kind,
    ).toBe("connected_no_create");
    expect(
      classifyDashboardAccess({
        loading: false,
        error: "",
        httpStatus: 200,
        workspace: emptyWs,
        itemCount: 0,
      }).kind,
    ).toBe("connected_empty");
    expect(
      classifyDashboardAccess({
        loading: false,
        error: "",
        httpStatus: 200,
        workspace: emptyWs,
        itemCount: 2,
      }).kind,
    ).toBe("connected");
  });

  it("never treats denied as a zero count", () => {
    const denied = classifyDashboardAccess({
      loading: false,
      error: "denied",
      httpStatus: 403,
      workspace: null,
      itemCount: 0,
    });
    expect(denied.countsAvailable).toBe(false);
    expect(denied.showOnline).toBe(false);
  });
});
