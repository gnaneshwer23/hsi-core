import { useState } from "react";
import { Link } from "react-router-dom";
import { exampleResearcherWorkspace, setDigestCadence, type DigestCadence } from "@hsi/researcherWorkspace";
import "../styles/scientific-investigation.css";

const CADENCE: DigestCadence[] = ["off", "daily", "weekly"];

export function ResearcherHome() {
  const workspace = exampleResearcherWorkspace();
  const [cadence, setCadence] = useState<DigestCadence>(workspace.digest.cadence);
  const digest = setDigestCadence(workspace.digest, cadence);
  return (
    <div className="inv-page">
      <div className="inv-wrap">
        <p className="inv-kicker">Personal workspace</p>
        <div className="inv-title-row">
          <h1>Your research</h1>
          <span className="inv-badge">Demo environment</span>
        </div>
        <p className="inv-lead">{workspace.disclaimer} Saved investigations appear here after an authorised workspace save. This example list is empty.</p>
        <section className="inv-card">
          <h2>Saved investigations</h2>
          {workspace.savedInvestigationIds.length === 0 ? <p>No saved investigations for Example researcher.</p> : null}
          <Link to="/research/investigate">Start an investigation</Link>
        </section>
        <section className="inv-card">
          <h2>Followed interests</h2>
          <ul>
            {workspace.interests.map((interest) => (
              <li key={interest.id}>
                {interest.kind}: {interest.label}
              </li>
            ))}
          </ul>
          <p>Topics: {workspace.follows.join(", ")}</p>
        </section>
        <section className="inv-card">
          <h2>Notifications</h2>
          <ul>
            {workspace.notifications.map((item) => (
              <li key={item.id}>{item.body}</li>
            ))}
            {workspace.reviewRequests.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
          <label className="inv-field">
            In-app digest
            <select value={digest.cadence} onChange={(event) => setCadence(event.target.value as DigestCadence)}>
              {CADENCE.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <p>Channel: {digest.channel}. Email: off. SMS: off. Nothing is sent outside the app.</p>
        </section>
        <p>
          <Link to="/research/community-feed">Community examples</Link>
        </p>
      </div>
    </div>
  );
}
