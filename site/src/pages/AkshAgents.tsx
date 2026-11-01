import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";

type DirectoryEntry = {
  name: string;
  role: string;
  category: string;
  phase: number;
  live: boolean;
  status: string;
  kind: string;
  previously: string;
};

type RegisterEntry = {
  id: string;
  productName: string;
  role: string;
  stage: string;
  trigger: string;
  partOf: string | null;
  legacyIds: string[];
  status: string;
  environment: string;
};

type Catalog = {
  schemaVersion: string;
  notCds: boolean;
  clinicalActive: boolean;
  provenance: { repo: string; commit: string };
  directory: DirectoryEntry[];
  register: RegisterEntry[];
  outOfRegistry: { id: string; label: string; note: string }[];
  aliasMap: { canonical: string; legacy: string[] }[];
  counts?: {
    directoryPeers: number;
    registerAgents: number;
  };
};

export function AkshAgents() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/aksh/agent-catalog.json")
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load catalog (${res.status})`);
        return res.json() as Promise<Catalog>;
      })
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load catalog");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Aksh · agent catalog"
        title={
          <>
            Named agents,
            <br />
            <span className="accent">HITL inventory only.</span>
          </>
        }
        lede="Structured copy of the Aksh Health agent directory and register from aksh-health-redesign — reference for HSI translation / Akeno HITL, not live CDS."
      />

      <section className="section section-ink">
        <div className="container">
          <div className="dc-banner-stack" role="alert">
            <p className="dc-banner dc-banner-danger">
              NOT CLINICAL · catalog only · no diagnosis / treatment · no PHI ·
              no EHR · no Aksh/Akeno Neon
            </p>
            <p className="dc-banner dc-banner-warn">
              Relates to <Link to="/akeno">/akeno</Link> HITL consumer ·
              autoApprove=false · clinicalActive=false
            </p>
          </div>

          {error ? (
            <p className="dc-banner dc-banner-danger" role="alert">
              {error}
            </p>
          ) : null}

          {catalog ? (
            <>
              <div className="grade-row dc-grade-summary" style={{ marginTop: "1.5rem" }}>
                {(
                  [
                    ["directory peers", catalog.directory.length],
                    ["register agents", catalog.register.length],
                    ["aliases", catalog.aliasMap.length],
                    ["out-of-registry", catalog.outOfRegistry.length],
                  ] as const
                ).map(([label, n]) => (
                  <div key={label} className="grade-cell">
                    <div className="label">{label}</div>
                    <h3>{n}</h3>
                    <p>aksh</p>
                  </div>
                ))}
              </div>

              <p className="muted" style={{ marginTop: "1rem" }}>
                Provenance:{" "}
                <a href={catalog.provenance.repo} target="_blank" rel="noreferrer">
                  aksh-health-redesign
                </a>{" "}
                @ <code>{catalog.provenance.commit.slice(0, 12)}</code> · schema{" "}
                <code>{catalog.schemaVersion}</code>
              </p>

              <div className="section-head" style={{ marginTop: "2.5rem" }}>
                <span className="section-num">12 PEERS</span>
                <h2 className="display display-md">Agent directory</h2>
              </div>
              <table className="axis-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Category</th>
                    <th>Phase</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.directory.map((a) => (
                    <tr key={a.name}>
                      <td>
                        <code>{a.name}</code>
                      </td>
                      <td>{a.role}</td>
                      <td>{a.category}</td>
                      <td>{a.phase}</td>
                      <td>
                        {a.status}
                        {!a.live ? " · not live" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="section-head" style={{ marginTop: "2.5rem" }}>
                <span className="section-num">14 REGISTERED</span>
                <h2 className="display display-md">Agent register</h2>
              </div>
              <table className="axis-table">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Product</th>
                    <th>Role</th>
                    <th>Stage</th>
                    <th>Part of</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.register.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <code>{a.id}</code>
                        {a.legacyIds.length > 0 ? (
                          <span className="muted">
                            {" "}
                            ← {a.legacyIds.join(", ")}
                          </span>
                        ) : null}
                      </td>
                      <td>{a.productName}</td>
                      <td>{a.role}</td>
                      <td>{a.stage}</td>
                      <td>{a.partOf ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="section-head" style={{ marginTop: "2.5rem" }}>
                <span className="section-num">ALIASES</span>
                <h2 className="display display-md">Legacy ids</h2>
              </div>
              <ul className="checklist">
                {catalog.aliasMap.map((a) => (
                  <li key={a.canonical}>
                    <code>{a.canonical}</code> ← {a.legacy.join(", ")}
                  </li>
                ))}
              </ul>

              <div className="section-head" style={{ marginTop: "2.5rem" }}>
                <span className="section-num">OUTSIDE</span>
                <h2 className="display display-md">Not counted in the 14</h2>
              </div>
              <ul className="checklist">
                {catalog.outOfRegistry.map((m) => (
                  <li key={m.id}>
                    <strong>{m.label}</strong> — {m.note}
                  </li>
                ))}
              </ul>

              <p style={{ marginTop: "2rem" }}>
                <Link to="/akeno" className="btn">
                  Akeno HITL consumer <span className="arrow">↗</span>
                </Link>{" "}
                <Link to="/for-aksh" className="btn btn-ghost">
                  For Aksh
                </Link>{" "}
                <Link to="/discovery" className="btn btn-ghost">
                  Discovery
                </Link>
              </p>
            </>
          ) : !error ? (
            <p className="muted" style={{ marginTop: "1.5rem" }}>
              Loading agent catalog…
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
