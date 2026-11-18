import type { InvestigationWorkspace as Workspace } from "../../../src/interrogativeWorkspace";

/** Distinct dashboard access layers — do not collapse into a single “unavailable”. */
export type DashboardAccessKind =
  | "loading"
  | "unsigned"
  | "denied"
  | "unavailable"
  | "connected_writes_off"
  | "connected_no_create"
  | "connected_empty"
  | "connected";

export type DashboardAccessInput = {
  loading: boolean;
  error: string;
  httpStatus: number | null;
  workspace: Workspace | null;
  itemCount: number;
};

export type DashboardAccessView = {
  kind: DashboardAccessKind;
  statusLabel: string;
  emptyListMessage: string;
  showOnline: boolean;
  countsAvailable: boolean;
};

/**
 * Classify the authorised investigations list for dashboard honesty.
 * Signed-out ≠ grant denied ≠ writes off ≠ empty authorised list.
 */
export function classifyDashboardAccess(input: DashboardAccessInput): DashboardAccessView {
  if (input.loading && !input.workspace) {
    return {
      kind: "loading",
      statusLabel: "Checking research workspace…",
      emptyListMessage: "Checking research workspace…",
      showOnline: false,
      countsAvailable: false,
    };
  }
  if (!input.workspace) {
    if (input.httpStatus === 401) {
      return {
        kind: "unsigned",
        statusLabel: "Signed out — sign in does not grant research access by itself.",
        emptyListMessage:
          "Sign in with a verified research account to view saved investigations. No activity is assumed.",
        showOnline: false,
        countsAvailable: false,
      };
    }
    if (input.httpStatus === 403) {
      return {
        kind: "denied",
        statusLabel: "Account verified, research grant not confirmed.",
        emptyListMessage:
          "Research access has not been confirmed for this account. Check your research account or contact the research administrator. No investigations are listed.",
        showOnline: false,
        countsAvailable: false,
      };
    }
    return {
      kind: "unavailable",
      statusLabel: input.error || "Research workspace unavailable",
      emptyListMessage:
        "Saved investigations could not be loaded. Retry the workspace or check your research account. No activity is assumed.",
      showOnline: false,
      countsAvailable: false,
    };
  }

  if (!input.workspace.writesEnabled) {
    return {
      kind: "connected_writes_off",
      statusLabel:
        "Research workspace connected · new saves are not enabled on this deployment.",
      emptyListMessage:
        input.itemCount === 0
          ? "No saved investigations yet. New saves are not enabled on this deployment; you can still reopen existing records when present."
          : "",
      showOnline: true,
      countsAvailable: true,
    };
  }
  if (!input.workspace.canCreate) {
    return {
      kind: "connected_no_create",
      statusLabel:
        "Research workspace connected · creating investigations needs a researcher grant (reviewer alone is not enough).",
      emptyListMessage:
        input.itemCount === 0
          ? "No saved investigations yet. Creating a new one requires researcher access."
          : "",
      showOnline: true,
      countsAvailable: true,
    };
  }
  if (input.itemCount === 0) {
    return {
      kind: "connected_empty",
      statusLabel: "Research workspace connected · authorised list is empty.",
      emptyListMessage:
        "No saved investigations yet. Start a question using an available release below, or open the live investigation workspace.",
      showOnline: true,
      countsAvailable: true,
    };
  }
  return {
    kind: "connected",
    statusLabel: "Research workspace connected",
    emptyListMessage: "",
    showOnline: true,
    countsAvailable: true,
  };
}
