import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ACTIVATION_HONESTY,
  buildActivationMilestone,
  loadActivationStore,
  type ActivationStore,
} from "@hsi/investigation/activationMilestone";
import { liveInvestigationHref } from "../../lib/workbenchPrimary";
import { Icon } from "./AppIcons";

/** Audit §H activation — first successful live run on this device. */
export function ActivationMilestoneCard() {
  const [store, setStore] = useState<ActivationStore>(() =>
    loadActivationStore(typeof localStorage !== "undefined" ? localStorage : null),
  );

  useEffect(() => {
    setStore(loadActivationStore(typeof localStorage !== "undefined" ? localStorage : null));
    const onFocus = () =>
      setStore(loadActivationStore(typeof localStorage !== "undefined" ? localStorage : null));
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const milestone = buildActivationMilestone(store);

  return (
    <section className="rh-card rh-activation" aria-labelledby="rh-act-h">
      <header className="rh-card-top">
        <span className="rh-tile rh-t-teal">
          <Icon name="target" size={22} />
        </span>
        <div>
          <h2 id="rh-act-h">Activation (this device)</h2>
          <p className="rh-sub">
            Audit metric · browser local only: {String(ACTIVATION_HONESTY.browserLocalOnly)} ·
            invents activation funnel: {String(ACTIVATION_HONESTY.inventsActivationFunnel)} ·
            invents aggregate conversion: {String(ACTIVATION_HONESTY.inventsAggregateConversion)} ·
            journey complete claimed: {String(ACTIVATION_HONESTY.journeyCompleteClaimed)} · pilot
            conversion claimed: {String(ACTIVATION_HONESTY.pilotConversionClaimed)} · scientific
            approval: {String(ACTIVATION_HONESTY.scientificApproval)}
          </p>
        </div>
      </header>
      <p className="rh-note" role="status">
        {milestone.note}
      </p>
      {milestone.reached && milestone.record ? (
        <>
          <p>
            <b>{milestone.record.question}</b>
          </p>
          <p className="rh-note">
            First run {milestone.record.activatedAt.slice(0, 10)} · briefHash{" "}
            <code>{milestone.record.briefHash.slice(0, 12)}…</code>
          </p>
        </>
      ) : null}
      <div className="rh-row">
        <Link className="rh-primary" to={liveInvestigationHref()}>
          {milestone.reached
            ? "Continue from activation milestone"
            : "Start activation in the workspace"}{" "}
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    </section>
  );
}
