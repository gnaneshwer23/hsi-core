import { useState } from "react";
import { Link } from "react-router-dom";
import { CommunityShell } from "../components/enterprise/CommunityShell";
import { DemoUniverseRolePanel } from "../components/demo/DemoUniverseRolePanel";
import {
  communityDashboardDemo,
  type CommunityChallenge,
  type CommunityCircle,
} from "@hsi/enterprise/communityDashboardDemo";
import "../styles/enterprise-dashboard.css";

/** Research Community shell — demonstration fixtures; Circles store held. */
export function CommunityDashboard() {
  const demo = communityDashboardDemo();
  const [selectedCircle, setSelectedCircle] = useState<CommunityCircle>(
    demo.circles[0]!,
  );
  const [selectedChallenge, setSelectedChallenge] = useState<CommunityChallenge>(
    demo.challenges[0]!,
  );

  return (
    <CommunityShell
      title={demo.programmeName}
      subtitle="Societies · consortia · interdisciplinary networks preview"
    >
      <p className="ent-banner" role="status">
        {demo.governanceNote}
      </p>

      <section className="ent-stats" aria-label="Community summary demonstration">
        <article className="ent-stat">
          <strong>{demo.summary.circleCount}</strong>
          <span>Circles sketches</span>
          <em>Store held</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.reviewPathCount}</strong>
          <span>Evidence review paths</span>
          <em>Human Gate C</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.challengeCount}</strong>
          <span>Shared challenges</span>
          <em>Not public by default</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.researcherCount}</strong>
          <span>Discovery demos</span>
          <em>Opt-in / grant-scoped</em>
        </article>
      </section>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="com-circles-heading">
          <h2 id="com-circles-heading">Research Circles</h2>
          <p className="ent-lead">
            Permission-aware group sketches. Durable Circles store is held — no
            automatic IP bleed.
          </p>
          <div className="ent-tree" role="list">
            {demo.circles.map((c) => (
              <button
                key={c.id}
                type="button"
                className="ent-node"
                role="listitem"
                aria-pressed={selectedCircle.id === c.id}
                onClick={() => setSelectedCircle(c)}
              >
                <strong>{c.name}</strong>
                <span>{c.membership.replaceAll("_", " ")}</span>
                <span>durable store: {c.durableStore}</span>
              </button>
            ))}
          </div>
          <div className="ent-inspect" style={{ marginTop: "1rem" }}>
            <p className="ent-lead" style={{ margin: 0 }}>
              {selectedCircle.note} Auto IP bleed:{" "}
              {String(selectedCircle.autoIpBleed)}.
            </p>
            <div className="ent-actions" style={{ marginTop: "0.75rem" }}>
              <Link className="ent-btn ent-btn-secondary" to="/research/community-feed">
                Feed examples
              </Link>
            </div>
          </div>
        </section>

        <section className="ent-panel" aria-labelledby="com-rev-heading">
          <h2 id="com-rev-heading">Collaborative evidence reviews</h2>
          <p className="ent-lead">
            Dual-reviewer / curator paths and disagreement packs — human Gate C only.
          </p>
          <ul>
            {demo.evidenceReviews.map((r) => (
              <li key={r.id}>
                <strong>{r.title}</strong> · {r.path.replaceAll("_", " ")} · Gate C:{" "}
                {r.gateC.replaceAll("_", " ")}.
                <div className="ent-actions">
                  <Link className="ent-btn ent-btn-secondary" to={r.nextSurface}>
                    Open review surface
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="ent-panel" aria-labelledby="com-disc-heading">
        <h2 id="com-disc-heading">Expert discussions</h2>
        <p className="ent-lead">Proposed only — not a social vanity feed.</p>
        <ul>
          {demo.discussions.map((d) => (
            <li key={d.id}>
              <strong>{d.topic}</strong> · {d.status.replaceAll("_", " ")}. Vanity feed:{" "}
              {String(d.vanityFeed)}. {d.note}
            </li>
          ))}
        </ul>
      </section>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="com-chal-heading">
          <h2 id="com-chal-heading">Shared scientific challenges</h2>
          <p className="ent-lead">
            Gaps and next questions — shared ≠ public by default.
          </p>
          <div className="ent-tree" role="list">
            {demo.challenges.map((ch) => (
              <button
                key={ch.id}
                type="button"
                className="ent-node"
                role="listitem"
                aria-pressed={selectedChallenge.id === ch.id}
                onClick={() => setSelectedChallenge(ch)}
              >
                <strong>{ch.question}</strong>
                <span>default: {ch.sharedDefault.replaceAll("_", " ")}</span>
                <span>{ch.reviewStatus.replaceAll("_", " ")}</span>
              </button>
            ))}
          </div>
          <div className="ent-actions" style={{ marginTop: "0.75rem" }}>
            <Link className="ent-btn" to={selectedChallenge.nextSurface}>
              Open challenge surface
            </Link>
          </div>
        </section>

        <section className="ent-panel" aria-labelledby="com-res-heading">
          <h2 id="com-res-heading">Researcher discovery</h2>
          <p className="ent-lead">Opt-in / grant-scoped — not a public dump.</p>
          <ul>
            {demo.researchers.map((r) => (
              <li key={r.id}>
                <strong>{r.displayName}</strong> · {r.discovery.replaceAll("_", " ")} ·
                grant-scoped: {String(r.grantScoped)}. {r.note}
              </li>
            ))}
          </ul>
          <div className="ent-actions">
            <Link className="ent-btn ent-btn-secondary" to="/welcome">
              Onboarding / profile
            </Link>
            <Link className="ent-btn ent-btn-secondary" to="/research/home">
              Research home
            </Link>
          </div>
        </section>
      </div>

      <section className="ent-panel" aria-labelledby="com-pin-heading">
        <h2 id="com-pin-heading">Pinned resources</h2>
        <p className="ent-lead">
          Feed + projects + pinned links — collaboration chrome, not a second graph.
        </p>
        <ul>
          {demo.pinned.map((p) => (
            <li key={p.id}>
              <Link to={p.href}>{p.label}</Link> — {p.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="ent-panel" aria-labelledby="com-gaps-heading">
        <h2 id="com-gaps-heading">Community research questions</h2>
        <ul>
          {demo.opportunities.map((g) => (
            <li key={g.id}>
              <strong>{g.question}</strong>
              <p className="ent-lead">
                {g.entities.join(" · ")}. Uncertainty: {g.uncertainty}. Review:{" "}
                {g.reviewStatus}.
              </p>
              <div className="ent-actions">
                <Link className="ent-btn ent-btn-secondary" to={g.nextInvestigation}>
                  Next surface
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <DemoUniverseRolePanel roleId="community" />
    </CommunityShell>
  );
}
