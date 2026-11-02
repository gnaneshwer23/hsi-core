import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import {
  decideGatewayRequest,
  gatewayAuditEvent,
  gatewayContract,
  type GatewayRequestStub,
} from "../../../src/akshHsiGateway";

const DEMO_NOW = new Date("2026-11-02T12:00:00.000Z");

const FIXTURES: Array<{
  label: string;
  expect: "allow" | "deny";
  highlight?: "phi";
  req: GatewayRequestStub;
}> = [
  {
    label: "Allow — synthetic concept xref",
    expect: "allow",
    req: {
      requestId: "demo-gw-allow-xref",
      purpose: "research_concept_xref",
      fromPlane: "aksh_clinic",
      toPlane: "hsi_research",
      payloadKeys: ["claimId"],
      syntheticOnly: true,
      containsPhi: false,
    },
  },
  {
    label: "Deny — PHI toward research DB",
    expect: "deny",
    highlight: "phi",
    req: {
      requestId: "demo-gw-deny-phi",
      purpose: "research_concept_xref",
      fromPlane: "aksh_clinic",
      toPlane: "hsi_research",
      payloadKeys: ["mrn"],
      syntheticOnly: false,
      containsPhi: true,
    },
  },
  {
    label: "Deny — PHI toward trials stub",
    expect: "deny",
    highlight: "phi",
    req: {
      requestId: "demo-gw-deny-phi-trials",
      purpose: "trials_criterion_stub",
      fromPlane: "aksh_clinic",
      toPlane: "hsi_trials_stub",
      payloadKeys: ["nhsNumber"],
      syntheticOnly: false,
      containsPhi: true,
    },
  },
  {
    label: "Allow — synthetic timeline handoff",
    expect: "allow",
    req: {
      requestId: "demo-gw-allow-timeline",
      purpose: "synthetic_timeline_handoff",
      fromPlane: "aksh_clinic",
      toPlane: "hsi_clinical_synthetic",
      payloadKeys: ["fixtureId"],
      syntheticOnly: true,
      containsPhi: false,
    },
  },
  {
    label: "Allow — synthetic trials criterion stub",
    expect: "allow",
    req: {
      requestId: "demo-gw-allow-trials",
      purpose: "trials_criterion_stub",
      fromPlane: "hsi_clinical_synthetic",
      toPlane: "hsi_trials_stub",
      payloadKeys: ["criterionId"],
      syntheticOnly: true,
      containsPhi: false,
    },
  },
  {
    label: "Deny — clinic→research without syntheticOnly",
    expect: "deny",
    req: {
      requestId: "demo-gw-deny-flag",
      purpose: "research_concept_xref",
      fromPlane: "aksh_clinic",
      toPlane: "hsi_research",
      payloadKeys: ["claimId"],
      syntheticOnly: false,
      containsPhi: false,
    },
  },
];

export function GatewayDemo() {
  const contract = gatewayContract();
  const rows = FIXTURES.map((f) => {
    const decision = decideGatewayRequest(f.req);
    const audit = gatewayAuditEvent(f.req, decision, DEMO_NOW);
    return { ...f, decision, audit };
  });
  const allowCount = rows.filter((r) => r.decision.allow).length;
  const denyCount = rows.length - allowCount;
  const phiDenies = rows.filter(
    (r) => !r.decision.allow && r.decision.reason === "phi_to_research_db",
  );

  return (
    <>
      <PageHero
        eyebrow="Aksh ↔ HSI gateway · In development · stubs only"
        title={
          <>
            Cross-plane handoffs{" "}
            <span className="accent">fail closed on PHI.</span>
          </>
        }
        lede="Contract + policy demo for synthetic handoffs. No live Aksh CDS, no EMIS, no research-DB writes from this surface."
      />

      <section className="section section-grid-light" id="gateway-policy">
        <div className="container">
          <div className="dc-banner-stack demo-banner-stack">
            <p className="dc-banner dc-banner-danger demo-banner-on-light">
              liveEmis=false · ehrWriteBack=false · researchDbWrite=false · phiToLlm=false
            </p>
            <p className="dc-banner dc-banner-warn demo-banner-on-light">
              syntheticOnly required for clinic→research · no live PHI · maturity=
              {contract.maturity}
            </p>
            <p className="dc-banner dc-banner-info demo-banner-on-light">
              {contract.schemaVersion} · deep-linked from{" "}
              <Link to="/status#demos">/status#demos</Link>
            </p>
          </div>

          <div className="tag-row" style={{ marginTop: "1rem" }}>
            <span className="tag tag-light">syntheticOnly</span>
            <span className="tag tag-light">no live PHI</span>
            <span className="tag tag-light">liveEmis=false</span>
            <span className="tag tag-light">researchDbWrite=false</span>
            <span className="tag tag-light">stubs only</span>
          </div>

          <div className="demo-meta-grid" style={{ marginTop: "1.5rem" }}>
            <article className="product-card">
              <h3>Contract</h3>
              <p>
                <code>{contract.schemaVersion}</code>
              </p>
              <p className="xs muted">{contract.product}</p>
            </article>
            <article className="product-card">
              <h3>Sample decisions</h3>
              <p>
                <code>
                  allow={allowCount} · deny={denyCount}
                </code>
              </p>
              <p className="xs muted">Live <code>decideGatewayRequest</code> on fixtures.</p>
            </article>
            <article className="product-card">
              <h3>Research DB deny list</h3>
              <p className="xs muted">{contract.researchDbTargets.join(" · ")}</p>
            </article>
            <article className="product-card">
              <h3>CDS / PHI invariants</h3>
              <p>
                <code>containsPhi={String(contract.invariants.containsPhi)}</code>
              </p>
              <p>
                <code>liveEmis={String(contract.invariants.liveEmis)}</code>
              </p>
            </article>
          </div>

          <div className="gateway-phi-callout" role="note">
            <h3>Explicit: PHI → research denied</h3>
            <p>
              Any stub with <code>containsPhi=true</code> targeting{" "}
              <code>hsi_research</code> or <code>hsi_trials_stub</code> returns{" "}
              <code>phi_to_research_db</code>. This demo shows {phiDenies.length} such deny
              path{phiDenies.length === 1 ? "" : "s"} — research DB writes stay false.
            </p>
            <ul className="gateway-purpose-list">
              {contract.allowedPurposes.map((p) => (
                <li key={p}>
                  <code>{p}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-elevated" id="gateway-fixtures">
        <div className="container">
          <div className="section-head">
            <span className="section-num">FIXTURES</span>
            <h2 className="display display-md">Allow / deny decisions.</h2>
          </div>
          <p className="lede" style={{ maxWidth: "40rem" }}>
            Each row runs <code>decideGatewayRequest</code> on a synthetic stub. PHI → research is
            always denied.
          </p>

          <div className="gateway-decision-grid">
            {rows.map((row) => {
              const allow = row.decision.allow;
              const reason = row.decision.reason;
              return (
                <article
                  key={row.req.requestId}
                  className={`gateway-decision-card ${
                    allow ? "gateway-decision-allow" : "gateway-decision-deny"
                  }${row.highlight === "phi" ? " gateway-decision-phi" : ""}`}
                >
                  <div className="product-card-head">
                    <h3>{row.label}</h3>
                    <span
                      className={`maturity-chip ${
                        allow ? "maturity-chip-available" : "maturity-chip-planned"
                      }`}
                    >
                      {allow ? "allow" : "deny"}
                    </span>
                  </div>
                  <div className="tag-row">
                    <span className="tag tag-light">
                      syntheticOnly={String(row.req.syntheticOnly)}
                    </span>
                    <span className="tag tag-light">
                      containsPhi={String(row.req.containsPhi)}
                    </span>
                    {row.highlight === "phi" ? (
                      <span className="tag tag-light gateway-tag-phi">PHI→research</span>
                    ) : null}
                  </div>
                  <p className="xs muted">
                    {row.req.purpose} · {row.req.fromPlane} → {row.req.toPlane}
                  </p>
                  <p className="xs muted">
                    payloadKeys: <code>{row.req.payloadKeys.join(", ")}</code>
                  </p>
                  <p>
                    Reason: <code>{reason}</code>
                  </p>
                  <p className="xs muted">
                    Audit: researchDbWrite={String(row.audit.researchDbWrite)} ·{" "}
                    {row.audit.timestamp}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="section-head">
            <span className="section-num">HONESTY</span>
            <h2 className="display display-md">What this is not.</h2>
          </div>
          <ul className="checklist" style={{ maxWidth: "40rem" }}>
            {contract.honesty.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>

          <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: "2rem" }}>
            <Link to="/status#demos" className="btn btn-ghost">
              Back to status demos
            </Link>
            <Link to="/clinical-timeline" className="text-link">
              Clinical timeline →
            </Link>
            <Link to="/trials-criteria" className="text-link">
              Trials criteria →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
