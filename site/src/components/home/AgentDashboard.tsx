import {useState} from "react";
import {Link} from "react-router-dom";
import {intelligenceCapabilities,intelligenceLayers} from "../../lib/intelligenceCollective";
import {AGENT_STATE,PIPELINE,agentSummary} from "../../lib/agentDashboard";

/** Public agent dashboard built from the capability records. States come from each record's maturity text. */
export function AgentDashboard(){
  const [slug,setSlug]=useState("parallax");
  const sel=intelligenceCapabilities.find(c=>c.slug===slug)??intelligenceCapabilities[0]!;
  const sum=agentSummary();
  return (
    <section className="hx-agents" aria-labelledby="hx-agents-title">
      <div className="hx-agents-inner">
        <p className="hx-kicker">Intelligence Collective</p>
        <h2 id="hx-agents-title">The graph is the foundation.<br/>The agents work around it.</h2>
        <p className="hx-agents-lead">Each capability reads from and proposes to the shared graph. None approves anything. This board shows where each one stands today.</p>
        <dl className="hx-kpis">
          <div><dt>Capabilities</dt><dd>{sum.capabilities}</dd></div>
          <div><dt>Live runs</dt><dd>{sum.liveRuns}</dd></div>
          <div><dt>Independently accepted</dt><dd>{sum.independentlyAccepted}</dd></div>
          <div><dt>Disabled</dt><dd>{sum.disabled}</dd></div>
        </dl>
        <ol className="hx-pipeline" aria-label="Designed investigation flow">
          {PIPELINE.map((p,i)=><li key={p} style={{["--i" as string]:i}}><span>{String(i+1).padStart(2,"0")}</span>{p}</li>)}
        </ol>
        <p className="hx-fine">Designed order of work. The highlight shows sequence, not a live run.</p>
        <div className="hx-board">
          <div className="hx-roster">
            {intelligenceLayers.map(layer=>(
              <div key={layer} className="hx-layer">
                <h3>{layer}</h3>
                <ul>
                  {intelligenceCapabilities.filter(c=>c.layer===layer).map(c=>(
                    <li key={c.slug}>
                      <button type="button" aria-pressed={c.slug===sel.slug} onClick={()=>setSlug(c.slug)}>
                        <strong>{c.name}</strong>
                        <span>{c.role}</span>
                        <em data-state={AGENT_STATE[c.slug]!.state}><i aria-hidden="true"/>{AGENT_STATE[c.slug]!.label}</em>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <aside className="hx-detail" aria-live="polite" aria-label={`${sel.name} detail`}>
            <p className="hx-kicker">{sel.layer}</p>
            <h3>{sel.name} <span>{sel.role}</span></h3>
            <p>{sel.purpose}</p>
            <h4>Where it stands</h4>
            <p>{sel.maturity}.</p>
            <h4>Boundary</h4>
            <p>{sel.boundary}</p>
            <Link className="hx-link" to={`/intelligence/${sel.slug}`}>Read the {sel.name} responsibilities →</Link>
          </aside>
        </div>
        <p className="hx-fine"><Link to="/intelligence">All {sum.capabilities} capabilities</Link> · <Link to="/connected-intelligence">What exists today and what is planned</Link></p>
      </div>
    </section>
  );
}
