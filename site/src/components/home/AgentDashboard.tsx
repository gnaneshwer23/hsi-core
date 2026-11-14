import {useState} from "react";
import {Link} from "react-router-dom";
import {intelligenceCapabilities} from "../../lib/intelligenceCollective";
import {AGENT_STATE,PIPELINE,agentSummary} from "../../lib/agentDashboard";

/** Public agent status board built from the capability records. States come from each record's maturity text. */
export function AgentDashboard(){
  const [slug,setSlug]=useState("parallax");
  const sel=intelligenceCapabilities.find(c=>c.slug===slug)??intelligenceCapabilities[0]!;
  const sum=agentSummary();
  return (
    <section className="ag" aria-labelledby="ag-title">
      <div className="ag-inner">
        <h2 id="ag-title">The graph is the foundation.<br/>The agents work around it.</h2>
        <p className="ag-lead">Each capability reads from and proposes to the shared graph. None approves anything. Today: {sum.capabilities} capabilities, {sum.liveRuns} live runs, {sum.independentlyAccepted} independently accepted, {sum.disabled} disabled.</p>
        <ol className="ag-flow" aria-label="Designed investigation flow">
          {PIPELINE.map((p,i)=><li key={p} style={{["--i" as string]:i}}>{p}</li>)}
        </ol>
        <p className="ag-fine">Designed order of work. The highlight shows sequence, not a live run.</p>
        <div className="ag-board">
          <table className="ag-table">
            <caption className="sp-sr">Capabilities and their operating state</caption>
            <thead><tr><th scope="col">Capability</th><th scope="col">Role</th><th scope="col">State</th></tr></thead>
            <tbody>
              {intelligenceCapabilities.map(c=>(
                <tr key={c.slug} data-selected={c.slug===sel.slug||undefined}>
                  <th scope="row"><button type="button" aria-pressed={c.slug===sel.slug} onClick={()=>setSlug(c.slug)}>{c.name}</button></th>
                  <td>{c.role}</td>
                  <td><span className="ag-state" data-state={AGENT_STATE[c.slug]!.state}>{AGENT_STATE[c.slug]!.label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <aside className="ag-detail" aria-live="polite" aria-label={`${sel.name} detail`}>
            <h3>{sel.name}</h3>
            <p className="ag-role">{sel.role} · {sel.layer}</p>
            <p>{sel.purpose}</p>
            <h4>Where it stands</h4>
            <p>{sel.maturity}.</p>
            <h4>Boundary</h4>
            <p>{sel.boundary}</p>
            <Link className="ag-link" to={`/intelligence/${sel.slug}`}>Read the {sel.name} responsibilities →</Link>
          </aside>
        </div>
        <p className="ag-fine"><Link to="/intelligence">All {sum.capabilities} capabilities</Link> · <Link to="/connected-intelligence">What exists today and what is planned</Link></p>
      </div>
    </section>
  );
}
