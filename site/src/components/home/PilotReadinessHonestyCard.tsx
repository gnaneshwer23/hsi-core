import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadActivationStore } from "@hsi/investigation/activationMilestone";
import { loadFirstUsefulStore } from "@hsi/investigation/firstUsefulInvestigation";
import {
  PILOT_READINESS_HONESTY,
  buildPilotReadinessChecklist,
  deriveFirstUsefulState,
  deriveWillingnessState,
  type PilotSignalState,
} from "@hsi/investigation/pilotReadinessHonesty";
import { loadRepeatUsageStore } from "@hsi/investigation/repeatUsageMilestone";
import { loadResearcherUsefulnessStore } from "@hsi/investigation/researcherUsefulnessFeedback";
import { loadWillingnessToPayStore } from "@hsi/investigation/willingnessToPayMilestone";
import { liveInvestigationHref } from "../../lib/workbenchPrimary";
import { Icon } from "./AppIcons";

function browserStorage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

const STATE_LABEL: Record<PilotSignalState, string> = {
  done: "Done",
  open: "Open",
  unknown: "Unknown",
};

/** Audit §I pilot prep — local signals vs owner-gated blockers. */
export function PilotReadinessHonestyCard() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onFocus = () => setTick((n) => n + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  void tick;
  const storage = browserStorage();
  const storageAvailable = Boolean(storage);
  const feedback = loadResearcherUsefulnessStore(storage);
  const feedbackHasUseful = feedback.entries.some((e) => e.rating === "useful");
  const feedbackHasWillingness = feedback.entries.some((e) => e.willingness !== null);

  const checklist = buildPilotReadinessChecklist({
    storageAvailable,
    activation: loadActivationStore(storage).first ? "done" : "open",
    firstUseful: deriveFirstUsefulState({
      milestoneReached: Boolean(loadFirstUsefulStore(storage).first),
      feedbackHasUseful,
    }),
    repeatReopen: loadRepeatUsageStore(storage).firstReopen ? "done" : "open",
    willingness: deriveWillingnessState({
      milestoneReached: Boolean(loadWillingnessToPayStore(storage).first),
      feedbackHasWillingness,
    }),
  });

  return (
    <section className="rh-card rh-pilot-ready" aria-labelledby="rh-pilot-h">
      <header className="rh-card-top">
        <span className="rh-tile rh-t-teal">
          <Icon name="clipboard" size={22} />
        </span>
        <div>
          <h2 id="rh-pilot-h">Pilot readiness (honesty)</h2>
          <p className="rh-sub">
            Audit checklist · browser local only: {String(PILOT_READINESS_HONESTY.browserLocalOnly)}{" "}
            · invents pilot ready: {String(PILOT_READINESS_HONESTY.inventsPilotReady)} · invents
            pilot conversion: {String(PILOT_READINESS_HONESTY.inventsPilotConversion)} · invents
            aggregate conversion: {String(PILOT_READINESS_HONESTY.inventsAggregateConversion)} ·
            journey complete claimed: {String(PILOT_READINESS_HONESTY.journeyCompleteClaimed)} ·
            scientific approval: {String(PILOT_READINESS_HONESTY.scientificApproval)} · pilot ready
            claimed: {String(checklist.pilotReadyClaimed)} · storage available:{" "}
            {String(checklist.storageAvailable)}
          </p>
        </div>
      </header>
      <p className="rh-note" role="status">
        {checklist.note}
      </p>
      <p className="rh-note">
        Local signals {checklist.localDoneCount} done · {checklist.localKnownCount} readable of{" "}
        {checklist.localTotalCount}
      </p>
      <ul className="rh-rows" aria-label="Local pilot-prep signals">
        {checklist.localSignals.map((s) => (
          <li key={s.id}>
            <div>
              <b>
                {STATE_LABEL[s.state]} · {s.label}
              </b>
              <span>{s.detail}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="rh-note">Owner-gated blockers (still blocked)</p>
      <ul className="rh-rows" aria-label="Blocked pilot gates">
        {checklist.blockedGates.map((g) => (
          <li key={g.id}>
            <div>
              <b>Blocked · {g.label}</b>
              <span>{g.detail}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="rh-row">
        <Link className="rh-primary" to={liveInvestigationHref()}>
          Continue local pilot-prep in the workspace <Icon name="arrow" size={16} />
        </Link>
      </div>
    </section>
  );
}
