/**
 * Research Home `#rh-metrics` fold subtitle — local milestone counts only.
 * Never invents conversion rates, pilot ready, or journey complete.
 * Browser-safe (no Node-only imports).
 */

import {
  buildAlertPreferencePanel,
  loadAlertPreferenceEngagement,
  type AlertCadence,
  type Store as AlertStore,
} from "./alertPreferenceHonesty";
import { loadActivationStore, type Store as ActivationStore } from "./activationMilestone";
import { loadFirstUsefulStore } from "./firstUsefulInvestigation";
import {
  buildPilotReadinessChecklist,
  deriveFirstUsefulState,
  deriveWillingnessState,
  type PilotReadinessHonesty,
} from "./pilotReadinessHonesty";
import { loadRepeatUsageStore } from "./repeatUsageMilestone";
import { loadResearcherUsefulnessStore } from "./researcherUsefulnessFeedback";
import { loadWillingnessToPayStore } from "./willingnessToPayMilestone";

export const HOME_LOCAL_METRICS_SUMMARY_SCHEMA = "hsi-home-local-metrics-summary-1" as const;

export type HomeLocalMetricsHonesty = Pick<
  PilotReadinessHonesty,
  | "browserLocalOnly"
  | "productionWritesEnabled"
  | "inventsAggregateConversion"
  | "inventsPilotReady"
  | "inventsPilotConversion"
  | "journeyCompleteClaimed"
  | "scientificApproval"
> & {
  inventsConversionRate: false;
};

export const HOME_LOCAL_METRICS_HONESTY: HomeLocalMetricsHonesty = {
  browserLocalOnly: true,
  productionWritesEnabled: false,
  inventsAggregateConversion: false,
  inventsPilotReady: false,
  inventsPilotConversion: false,
  journeyCompleteClaimed: false,
  scientificApproval: false,
  inventsConversionRate: false,
};

export type HomeLocalMetricsSummary = {
  schemaVersion: typeof HOME_LOCAL_METRICS_SUMMARY_SCHEMA;
  honesty: HomeLocalMetricsHonesty;
  storageAvailable: boolean;
  localDoneCount: number;
  localTotalCount: number;
  alertPreferenceSet: boolean;
  /** Fold subtitle — counts + fail-closed honesty phrases. */
  subtitle: string;
  note: string;
};

type BrowserStore = ActivationStore & AlertStore;

export function assertHomeLocalMetricsHonesty(
  honesty: HomeLocalMetricsHonesty,
): HomeLocalMetricsHonesty {
  if (honesty.browserLocalOnly !== true) throw Error("browserLocalOnly must be true");
  if (honesty.productionWritesEnabled !== false) {
    throw Error("productionWritesEnabled must be false");
  }
  if (honesty.inventsAggregateConversion !== false) {
    throw Error("inventsAggregateConversion must be false");
  }
  if (honesty.inventsPilotReady !== false) throw Error("inventsPilotReady must be false");
  if (honesty.inventsPilotConversion !== false) {
    throw Error("inventsPilotConversion must be false");
  }
  if (honesty.journeyCompleteClaimed !== false) {
    throw Error("journeyCompleteClaimed must be false");
  }
  if (honesty.scientificApproval !== false) throw Error("scientificApproval must be false");
  if (honesty.inventsConversionRate !== false) {
    throw Error("inventsConversionRate must be false");
  }
  return honesty;
}

export function buildHomeLocalMetricsSummary(input: {
  storage: BrowserStore | null;
  cadence: AlertCadence;
}): HomeLocalMetricsSummary {
  const honesty = assertHomeLocalMetricsHonesty(HOME_LOCAL_METRICS_HONESTY);
  const storageAvailable = Boolean(input.storage);
  const feedback = loadResearcherUsefulnessStore(input.storage);
  const feedbackHasUseful = feedback.entries.some((e) => e.rating === "useful");
  const feedbackHasWillingness = feedback.entries.some((e) => e.willingness !== null);

  const checklist = buildPilotReadinessChecklist({
    storageAvailable,
    activation: loadActivationStore(input.storage).first ? "done" : "open",
    firstUseful: deriveFirstUsefulState({
      milestoneReached: Boolean(loadFirstUsefulStore(input.storage).first),
      feedbackHasUseful,
    }),
    repeatReopen: loadRepeatUsageStore(input.storage).firstReopen ? "done" : "open",
    willingness: deriveWillingnessState({
      milestoneReached: Boolean(loadWillingnessToPayStore(input.storage).first),
      feedbackHasWillingness,
    }),
  });

  const alertPanel = buildAlertPreferencePanel({
    cadence: input.cadence,
    engagement: loadAlertPreferenceEngagement(input.storage),
  });
  const alertPreferenceSet = storageAvailable && alertPanel.preferenceEngaged;

  const milestonesPart = storageAvailable
    ? `Local milestones ${checklist.localDoneCount}/${checklist.localTotalCount} done`
    : "Local milestones unknown";
  const alertPart = storageAvailable
    ? alertPreferenceSet
      ? "alert preference set"
      : "alert preference unset"
    : null;
  const subtitle = [
    milestonesPart,
    alertPart,
    "not conversion",
    "not pilot claims",
  ]
    .filter((x): x is string => Boolean(x))
    .join(" · ");

  return {
    schemaVersion: HOME_LOCAL_METRICS_SUMMARY_SCHEMA,
    honesty,
    storageAvailable,
    localDoneCount: checklist.localDoneCount,
    localTotalCount: checklist.localTotalCount,
    alertPreferenceSet,
    subtitle,
    note: storageAvailable
      ? "Device-local milestone counts only — not a conversion rate, not pilot ready."
      : "Local storage unavailable — milestone counts stay unknown; never invent conversion.",
  };
}
