/** Original HSI dashboard mock UIs — illustrative demo data, not product screenshots. */

type MockProps = { className?: string };

export function GateCQueueMock({ className }: MockProps) {
  const rows = [
    { area: "REL", title: "Barber 2016 · IL-1β ↔ insulin resistance", impact: 88, pri: "P0" },
    { area: "PMID", title: "CANTOS · canakinumab CV outcomes", impact: 74, pri: "P0" },
    { area: "SEED", title: "Herold · anti-CD3 T1D preservation", impact: 61, pri: "P1" },
    { area: "GAP", title: "Unmapped IRAE hyperglycemia path", impact: 42, pri: "P1" },
    { area: "AXIS", title: "teachingStatus ≠ hsiGrade check", impact: 55, pri: "P0" },
  ];
  return (
    <div className={`mock-frame ${className ?? ""}`}>
      <div className="mock-card">
        <div className="mock-card-head">
          <div>
            <div className="mock-kicker">GATE C · CURATOR</div>
            <div className="mock-title">Evidence queue</div>
          </div>
          <span className="mock-live">● ILLUSTRATIVE</span>
        </div>
        <div className="mock-metrics">
          <div className="mock-metric">
            <span className="mock-metric-n">9</span>
            <span className="mock-metric-l">PMID-linked</span>
          </div>
          <div className="mock-metric">
            <span className="mock-metric-n">0</span>
            <span className="mock-metric-l">auto-approve</span>
          </div>
          <div className="mock-metric">
            <span className="mock-metric-n">3</span>
            <span className="mock-metric-l">axes intact</span>
          </div>
        </div>
        <div className="mock-table">
          {rows.map((r) => (
            <div key={r.title} className="mock-row">
              <span className="mock-area">{r.area}</span>
              <span className="mock-row-title">{r.title}</span>
              <span className="mock-bar" aria-hidden>
                <i style={{ width: `${r.impact}%` }} />
              </span>
              <span className={`mock-pri pri-${r.pri.toLowerCase()}`}>{r.pri}</span>
            </div>
          ))}
        </div>
        <div className="mock-foot-cards">
          <div>
            <strong>Check → supports</strong>
            <span>Human S-P-O re-read</span>
          </div>
          <div>
            <strong>Approve</strong>
            <span>Never from PMID alone</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EvidenceGradesMock({ className }: MockProps) {
  return (
    <div className={`mock-frame ${className ?? ""}`}>
      <div className="mock-card mock-card-arch">
        <div className="mock-card-head">
          <div>
            <div className="mock-kicker">ARCHITECTURE · GRADE AXES</div>
            <div className="mock-title">Three axes, never collapsed</div>
          </div>
          <span className="mock-ok">OK</span>
        </div>
        <div className="mock-flow">
          {[
            { t: "INLET", d: "Seed edge" },
            { t: "READ", d: "PMID + axes" },
            { t: "GATE", d: "Human C" },
            { t: "WRITE", d: "Export only" },
          ].map((s, i) => (
            <div key={s.t} className="mock-flow-step">
              <div className="mock-flow-icon">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div className="mock-flow-t">{s.t}</div>
                <div className="mock-flow-d">{s.d}</div>
              </div>
              {i < 3 && <span className="mock-flow-arrow">→</span>}
            </div>
          ))}
        </div>
        <div className="mock-split-2">
          <div className="mock-mini">
            <strong>Permissions</strong>
            <ul>
              <li>Curator checklist in docs/</li>
              <li>No product auto-promote</li>
              <li>Consumers pull exports</li>
            </ul>
          </div>
          <div className="mock-mini">
            <strong>Risk tier</strong>
            <ul>
              <li>Clinic path: established only</li>
              <li>HITL below Gate C: blocked</li>
              <li>Discovery: all grades OK</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AkshHitlMock({ className }: MockProps) {
  const weeks = [
    { w: 1, title: "aksh: map export", sub: "durable ids · cds false", st: "Shipped" },
    { w: 2, title: "HITL stub read", sub: "isCdsSurfacable gate", st: "Shipped" },
    { w: 3, title: "Gate C checklist", sub: "docs/ curator path", st: "Shipped" },
    { w: 4, title: "Suggestion card stub", sub: "no write-back", st: "In review" },
  ];
  return (
    <div className={`mock-frame ${className ?? ""}`}>
      <div className="mock-card">
        <div className="mock-card-head">
          <div>
            <div className="mock-kicker">AKSH · HITL STUB</div>
            <div className="mock-title">Deployment · P1</div>
          </div>
          <span className="mock-live">● WEEK 4</span>
        </div>
        <div className="mock-progress-squares" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className={
                i < 3 ? "sq done" : i === 3 ? "sq review" : "sq planned"
              }
            />
          ))}
        </div>
        <div className="mock-legend">
          <span>
            <i className="dot done" /> shipped
          </span>
          <span>
            <i className="dot review" /> in review
          </span>
          <span>
            <i className="dot planned" /> planned
          </span>
        </div>
        <div className="mock-feed">
          {weeks.map((w) => (
            <div key={w.w} className="mock-feed-item">
              <div className="mock-feed-icon">{String(w.w).padStart(2, "0")}</div>
              <div className="mock-feed-body">
                <div className="mock-kicker">WEEK {w.w}</div>
                <strong>{w.title}</strong>
                <span>{w.sub}</span>
              </div>
              <span className={w.st === "Shipped" ? "mock-ok" : "mock-review"}>{w.st}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ClaimMarkerMock({ className }: MockProps) {
  return (
    <div className={`mock-frame ${className ?? ""}`}>
      <div className="mock-card">
        <div className="mock-card-head">
          <div>
            <div className="mock-kicker">PIPELINE · MONTH ILLUSTRATIVE</div>
            <div className="mock-title">Claim → marker → observation</div>
          </div>
          <span className="mock-ok">LEADERSHIP VIEW</span>
        </div>
        <div className="mock-metrics">
          <div className="mock-metric">
            <span className="mock-metric-n">42</span>
            <span className="mock-metric-l">graded edges</span>
          </div>
          <div className="mock-metric">
            <span className="mock-metric-n">18</span>
            <span className="mock-metric-l">LOINC links</span>
          </div>
          <div className="mock-metric">
            <span className="mock-metric-n">0</span>
            <span className="mock-metric-l">PHI in seeds</span>
          </div>
        </div>
        <div className="mock-chart" aria-hidden>
          <svg viewBox="0 0 280 80" className="mock-spark">
            <defs>
              <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#17645f" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#17645f" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 60 C 40 55, 60 48, 80 42 S 120 28, 140 30 S 180 22, 200 18 S 240 12, 280 8"
              fill="none"
              stroke="#17645f"
              strokeWidth="2.5"
            />
            <path
              d="M0 60 C 40 55, 60 48, 80 42 S 120 28, 140 30 S 180 22, 200 18 S 240 12, 280 8 V80 H0 Z"
              fill="url(#spark-fill)"
            />
            <circle cx="200" cy="18" r="4" fill="#e4a65a" />
          </svg>
          <div className="mock-chart-label">Edges linked · weekly · illustrative</div>
        </div>
        <div className="mock-table mock-table-compact">
          {[
            { a: "claim", b: "inflammation ↔ IR", c: "uncertain" },
            { a: "marker", b: "LOINC:4548-4 HbA1c", c: "mapped" },
            { a: "obs stub", b: "no PHI payload", c: "safe" },
          ].map((r) => (
            <div key={r.a} className="mock-row">
              <span className="mock-area">{r.a}</span>
              <span className="mock-row-title">{r.b}</span>
              <span className="mock-ok">{r.c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function IsiCoworkerMock({ className }: MockProps) {
  return (
    <div className={`coworker-card ${className ?? ""}`}>
      <div className="coworker-head">
        <strong>ISI discovery surface</strong>
        <span className="mock-live">● ILLUSTRATIVE</span>
      </div>
      <div className="coworker-metrics">
        <div>
          <b>14</b>
          <span>HOT edges</span>
        </div>
        <div>
          <b>17</b>
          <span>uncertain</span>
        </div>
        <div>
          <b>9</b>
          <span>unexplored</span>
        </div>
      </div>
      <div className="coworker-heat" aria-hidden>
        {Array.from({ length: 30 }, (_, i) => (
          <span
            key={i}
            style={{
              opacity: [0.15, 0.35, 0.55, 0.8, 1][i % 5],
              background: i % 7 === 0 ? "#17645f" : "rgba(23,100,95,0.35)",
            }}
          />
        ))}
      </div>
      <div className="coworker-actions">
        <div>
          <span className="mock-pri pri-p0">GATE</span> REL suggestion pending human
        </div>
        <div>
          <span className="mock-ok">ASK</span> Radar returns honest grades
        </div>
        <div>
          <span className="mock-review">MAP</span> 24 curation pointers
        </div>
      </div>
      <p className="coworker-cap">
        ISI: Ask / Radar / REL suggestions — discovery only, never CDS.
      </p>
    </div>
  );
}

export function AkshCoworkerMock({ className }: MockProps) {
  return (
    <div className={`coworker-card ${className ?? ""}`}>
      <div className="coworker-head">
        <strong>Aksh HITL co-worker</strong>
        <span className="mock-live">● ILLUSTRATIVE</span>
      </div>
      <div className="coworker-pipeline">
        {["Classify", "Draft", "Human sends", "Audit"].map((s, i) => (
          <span key={s} className={i === 2 ? "active" : undefined}>
            {s}
          </span>
        ))}
      </div>
      <div className="coworker-actions">
        <div>
          <span className="mock-ok">AUTO</span> established + approved only
        </div>
        <div>
          <span className="mock-pri pri-p0">GATE</span> below threshold → human
        </div>
        <div>
          <span className="mock-pri pri-p1">FLAG</span> no write-back from map
        </div>
      </div>
      <div className="coworker-metrics">
        <div>
          <b>0</b>
          <span>PHI in seeds</span>
        </div>
        <div>
          <b>100%</b>
          <span>HITL required</span>
        </div>
        <div>
          <b>Gate C</b>
          <span>human only</span>
        </div>
      </div>
      <div className="coworker-bars" aria-hidden>
        {[40, 48, 55, 62, 70, 78, 85, 92].map((h, i) => (
          <span key={i} style={{ height: `${h}%` }} />
        ))}
      </div>
      <p className="coworker-cap">
        Aksh: suggestion cards only when isCdsSurfacable passes — illustrative.
      </p>
    </div>
  );
}
