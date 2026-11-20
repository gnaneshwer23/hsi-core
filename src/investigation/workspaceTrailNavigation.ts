/**
 * Pure open-target map for the unified Stage 2 trail on `/research/workspace`.
 * Keeps scroll/fold/selection contracts testable without DOM.
 * Does not claim journey completion or enable production writes.
 */

import type { UnifiedJourneyStepId } from "./unifiedJourneyTrail";

export type WorkspaceTrailNavAction =
  | { kind: "scroll"; elementId: string }
  | { kind: "openDetails"; elementId: string }
  | { kind: "selectFirstClaim" }
  | { kind: "selectFirstComparison" }
  | { kind: "openBrief" };

/** Ordered actions for one unified trail step. Exhaustive over UnifiedJourneyStepId. */
export function workspaceTrailNavActions(
  id: UnifiedJourneyStepId,
): readonly WorkspaceTrailNavAction[] {
  switch (id) {
    case "ask":
      return [{ kind: "scroll", elementId: "ws-ask-strip" }];
    case "evidence":
      return [{ kind: "scroll", elementId: "ws-ev-h" }];
    case "passport":
      return [
        { kind: "selectFirstClaim" },
        { kind: "scroll", elementId: "ws-vf-h" },
      ];
    case "disagreement":
      return [
        { kind: "openDetails", elementId: "ws-usp-panels" },
        { kind: "selectFirstComparison" },
        { kind: "scroll", elementId: "ws-disagree-h" },
      ];
    case "crossDomain":
      return [
        { kind: "openDetails", elementId: "ws-usp-panels" },
        { kind: "scroll", elementId: "ws-cross-h" },
      ];
    case "gaps":
      return [
        { kind: "openDetails", elementId: "ws-gaps-testable" },
        { kind: "scroll", elementId: "ws-gp-h" },
      ];
    case "brief":
      return [
        { kind: "openBrief" },
        { kind: "scroll", elementId: "ws-brief-panel" },
      ];
    case "save":
      return [{ kind: "scroll", elementId: "ws-conn-h" }];
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}
