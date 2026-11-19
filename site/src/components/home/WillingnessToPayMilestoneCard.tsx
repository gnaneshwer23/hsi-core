import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  WILLINGNESS_TO_PAY_HONESTY,
  buildWillingnessToPayMilestone,
  loadWillingnessToPayStore,
  type WillingnessToPayStore,
} from "@hsi/investigation/willingnessToPayMilestone";
import { liveInvestigationHref } from "../../lib/workbenchPrimary";
import { Icon } from "./AppIcons";

const ANSWER_LABEL = { yes: "Yes", no: "No", maybe: "Maybe" } as const;

/** Audit §H willingness-to-pay — first browser signal only. */
export function WillingnessToPayMilestoneCard() {
  const [store, setStore] = useState<WillingnessToPayStore>(() =>
    loadWillingnessToPayStore(typeof localStorage !== "undefined" ? localStorage : null),
  );

  useEffect(() => {
    setStore(
      loadWillingnessToPayStore(typeof localStorage !== "undefined" ? localStorage : null),
    );
    const onFocus = () =>
      setStore(
        loadWillingnessToPayStore(typeof localStorage !== "undefined" ? localStorage : null),
      );
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const milestone = buildWillingnessToPayMilestone(store);

  return (
    <section className="rh-card rh-wtp" aria-labelledby="rh-wtp-h">
      <header className="rh-card-top">
        <span className="rh-tile rh-t-teal">
          <Icon name="trend" size={22} />
        </span>
        <div>
          <h2 id="rh-wtp-h">Willingness to pay (this device)</h2>
          <p className="rh-sub">
            Audit metric · browser local only: {String(WILLINGNESS_TO_PAY_HONESTY.browserLocalOnly)}{" "}
            · invents aggregate conversion:{" "}
            {String(WILLINGNESS_TO_PAY_HONESTY.inventsAggregateConversion)} · invents revenue:{" "}
            {String(WILLINGNESS_TO_PAY_HONESTY.inventsRevenue)} · checkout enabled:{" "}
            {String(WILLINGNESS_TO_PAY_HONESTY.checkoutEnabled)} · journey complete claimed:{" "}
            {String(WILLINGNESS_TO_PAY_HONESTY.journeyCompleteClaimed)} · pilot conversion claimed:{" "}
            {String(WILLINGNESS_TO_PAY_HONESTY.pilotConversionClaimed)} · scientific approval:{" "}
            {String(WILLINGNESS_TO_PAY_HONESTY.scientificApproval)}
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
            Answered {ANSWER_LABEL[milestone.record.answer]} ·{" "}
            {milestone.record.answeredAt.slice(0, 10)} · briefHash{" "}
            <code>{milestone.record.briefHash.slice(0, 12)}…</code>
          </p>
        </>
      ) : null}
      <div className="rh-row">
        <Link className="rh-primary" to={liveInvestigationHref()}>
          {milestone.reached
            ? "Continue in the workspace"
            : "State willingness after a brief"}{" "}
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    </section>
  );
}
