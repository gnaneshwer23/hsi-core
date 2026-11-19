import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FIRST_USEFUL_HONESTY,
  buildFirstUsefulMilestone,
  loadFirstUsefulStore,
  type FirstUsefulStore,
} from "@hsi/investigation/firstUsefulInvestigation";
import { liveInvestigationHref } from "../../lib/workbenchPrimary";
import { Icon } from "./AppIcons";

/** Audit §H first-useful milestone — device-local only. */
export function FirstUsefulInvestigationCard() {
  const [store, setStore] = useState<FirstUsefulStore>(() =>
    loadFirstUsefulStore(typeof localStorage !== "undefined" ? localStorage : null),
  );

  useEffect(() => {
    setStore(loadFirstUsefulStore(typeof localStorage !== "undefined" ? localStorage : null));
    const onFocus = () =>
      setStore(loadFirstUsefulStore(typeof localStorage !== "undefined" ? localStorage : null));
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const milestone = buildFirstUsefulMilestone(store);

  return (
    <section className="rh-card rh-first-useful" aria-labelledby="rh-fu-h">
      <header className="rh-card-top">
        <span className="rh-tile rh-t-teal">
          <Icon name="spark" size={22} />
        </span>
        <div>
          <h2 id="rh-fu-h">First useful investigation</h2>
          <p className="rh-sub">
            Audit metric · browser local only: {String(FIRST_USEFUL_HONESTY.browserLocalOnly)} ·
            invents aggregate conversion:{" "}
            {String(FIRST_USEFUL_HONESTY.inventsAggregateConversion)} · invents activation funnel:{" "}
            {String(FIRST_USEFUL_HONESTY.inventsActivationFunnel)} · journey complete claimed:{" "}
            {String(FIRST_USEFUL_HONESTY.journeyCompleteClaimed)} · pilot conversion claimed:{" "}
            {String(FIRST_USEFUL_HONESTY.pilotConversionClaimed)} · scientific approval:{" "}
            {String(FIRST_USEFUL_HONESTY.scientificApproval)}
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
            Rated useful {milestone.record.ratedAt.slice(0, 10)} · briefHash{" "}
            <code>{milestone.record.briefHash.slice(0, 12)}…</code>
          </p>
        </>
      ) : null}
      <div className="rh-row">
        <Link className="rh-primary" to={liveInvestigationHref()}>
          {milestone.reached
            ? "Reopen workspace from this milestone"
            : "Rate usefulness in the workspace"}{" "}
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    </section>
  );
}
