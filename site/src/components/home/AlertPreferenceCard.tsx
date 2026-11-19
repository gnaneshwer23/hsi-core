import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ALERT_PREFERENCE_HONESTY,
  buildAlertPreferencePanel,
  loadAlertPreferenceEngagement,
  recordAlertPreferenceChange,
  type AlertCadence,
  type AlertPreferenceEngagementStore,
} from "@hsi/investigation/alertPreferenceHonesty";
import type { Profile } from "../../lib/researchHome";
import { Icon } from "./AppIcons";

const CADENCE_LABEL: Record<AlertCadence, string> = {
  off: "Off",
  weekly: "Weekly",
  daily: "Daily",
};

/** Stage 3 alert preference — device-local cadence; no live email/push delivery. */
export function AlertPreferenceCard({
  profile,
  onProfile,
}: {
  profile: Profile;
  onProfile: (next: Profile) => void;
}) {
  const [engagement, setEngagement] = useState<AlertPreferenceEngagementStore>(() =>
    loadAlertPreferenceEngagement(typeof localStorage !== "undefined" ? localStorage : null),
  );
  const [error, setError] = useState<string | null>(null);
  const panel = buildAlertPreferencePanel({
    cadence: profile.cadence,
    engagement,
  });

  useEffect(() => {
    setEngagement(
      loadAlertPreferenceEngagement(typeof localStorage !== "undefined" ? localStorage : null),
    );
  }, [profile.cadence]);

  const setCadence = (to: AlertCadence) => {
    const from = profile.cadence;
    if (from === to) return;
    const result = recordAlertPreferenceChange(
      typeof localStorage !== "undefined" ? localStorage : null,
      { from, to },
    );
    setEngagement(result.store);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    onProfile({ ...profile, cadence: to });
  };

  return (
    <section className="rh-card rh-alert-pref" aria-labelledby="rh-alert-h">
      <header className="rh-card-top">
        <span className="rh-tile rh-t-teal">
          <Icon name="layers" size={22} />
        </span>
        <div>
          <h2 id="rh-alert-h">Research update preference</h2>
          <p className="rh-sub">
            Stage 3 · USP C · preference only: {String(ALERT_PREFERENCE_HONESTY.preferenceOnly)} ·
            live delivery: {String(ALERT_PREFERENCE_HONESTY.liveDeliveryEnabled)} · email claimed:{" "}
            {String(ALERT_PREFERENCE_HONESTY.emailDeliveryClaimed)} · invents open rates:{" "}
            {String(ALERT_PREFERENCE_HONESTY.inventsOpenRates)} · production writes:{" "}
            {String(ALERT_PREFERENCE_HONESTY.productionWritesEnabled)}
          </p>
        </div>
      </header>

      <p className="rh-note" role="status">
        {panel.note}
      </p>

      <div className="rh-chips2" role="group" aria-label="Alert cadence preference">
        {(Object.keys(CADENCE_LABEL) as AlertCadence[]).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={profile.cadence === id}
            onClick={() => setCadence(id)}
          >
            {CADENCE_LABEL[id]}
          </button>
        ))}
      </div>

      <p className="rh-note">
        Preference engagement (this browser): {panel.engagementCount} change
        {panel.engagementCount === 1 ? "" : "s"}
        {panel.lastChangedAt ? ` · last ${panel.lastChangedAt.slice(0, 10)}` : ""} · radar mode:{" "}
        {panel.radarRefreshMode.split("_").join(" ")}. Not an email open-rate metric.
      </p>

      {error ? (
        <p className="rh-err" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rh-row">
        <Link className="rh-ghost" to="/welcome">
          Edit full setup
        </Link>
        <a className="rh-ghost" href="#rh-radar">
          Open research radar
        </a>
      </div>
    </section>
  );
}
