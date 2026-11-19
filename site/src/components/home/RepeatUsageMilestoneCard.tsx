import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  REPEAT_USAGE_HONESTY,
  buildRepeatUsageMilestone,
  loadRepeatUsageStore,
  type RepeatUsageStore,
} from "@hsi/investigation/repeatUsageMilestone";
import { liveInvestigationHref } from "../../lib/workbenchPrimary";
import { Icon } from "./AppIcons";

/** Audit §H repeat usage — first browser reopen milestone only. */
export function RepeatUsageMilestoneCard() {
  const [store, setStore] = useState<RepeatUsageStore>(() =>
    loadRepeatUsageStore(typeof localStorage !== "undefined" ? localStorage : null),
  );

  useEffect(() => {
    setStore(loadRepeatUsageStore(typeof localStorage !== "undefined" ? localStorage : null));
    const onFocus = () =>
      setStore(loadRepeatUsageStore(typeof localStorage !== "undefined" ? localStorage : null));
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const milestone = buildRepeatUsageMilestone(store);

  return (
    <section className="rh-card rh-repeat-usage" aria-labelledby="rh-ru-h">
      <header className="rh-card-top">
        <span className="rh-tile rh-t-teal">
          <Icon name="layers" size={22} />
        </span>
        <div>
          <h2 id="rh-ru-h">Repeat usage (this device)</h2>
          <p className="rh-sub">
            Audit metric · browser local only: {String(REPEAT_USAGE_HONESTY.browserLocalOnly)} ·
            invents retention metrics: {String(REPEAT_USAGE_HONESTY.inventsRetentionMetrics)} ·
            invents aggregate conversion:{" "}
            {String(REPEAT_USAGE_HONESTY.inventsAggregateConversion)} · journey complete claimed:{" "}
            {String(REPEAT_USAGE_HONESTY.journeyCompleteClaimed)} · pilot conversion claimed:{" "}
            {String(REPEAT_USAGE_HONESTY.pilotConversionClaimed)} · scientific approval:{" "}
            {String(REPEAT_USAGE_HONESTY.scientificApproval)}
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
            First reopen {milestone.record.reopenedAt.slice(0, 10)} · briefHash{" "}
            <code>{milestone.record.briefHash.slice(0, 12)}…</code>
          </p>
        </>
      ) : null}
      <div className="rh-row">
        <Link className="rh-primary" to={liveInvestigationHref({ reopen: true })}>
          {milestone.reached ? "Continue from browser library" : "Reopen a saved investigation"}{" "}
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    </section>
  );
}
