import {Link} from "react-router-dom";
import {useGraphSnapshot} from "./useGraphSnapshot";
import {ResearchBriefPreview} from "../public/ResearchPublic";

const clip=(s:string,n:number)=>s.length>n?s.slice(0,n-1).trimEnd()+"…":s;

/** What a researcher gets: four outputs, each rendered from recorded fields. Layout is a mock-up; the content is the snapshot's. */
export function OutputsGallery(){
  const {snapshot:s,failed}=useGraphSnapshot();
  const a=s?.examples[0],b=s?.examples[1];
  return (
    <section className="hv-outputs" aria-labelledby="hv-out-title">
      <div className="hv-inner">
        <h2 id="hv-out-title">What you get.</h2>
        <p className="hv-sub">Four outputs, each with its source, context and review status attached. Shown here from the published snapshot.</p>
        {!s?<div className="hv-grid-skeleton"><p className="hv-wait">{failed?"Snapshot unavailable. No substitute figures are shown.":"Verifying snapshot…"}</p></div>:(
        <div className="hv-grid">
          <article className="hv-card" aria-labelledby="o1">
            <h3 id="o1">Evidence record</h3>
            <p className="hv-stamp">Unreviewed</p>
            <dl>
              <div><dt>Relationship</dt><dd>{a!.subject} → {a!.predicate} → {a!.object}</dd></div>
              <div><dt>Source</dt><dd>{a!.source?clip(a!.source.title,88):"None recorded"}</dd></div>
              <div><dt>Passage</dt><dd>{a!.source?.locator??"Not recorded"}</dd></div>
              <div><dt>Context</dt><dd>{a!.model}; {clip(a!.design,50)}</dd></div>
              <div><dt>Limits</dt><dd>{clip(a!.limits,100)}</dd></div>
            </dl>
            <Link to="/evidence-intelligence">What an evidence record keeps →</Link>
          </article>
          <article className="hv-card" aria-labelledby="o2">
            <h3 id="o2">Context comparison</h3>
            <p className="hv-stamp">Comparability not assessed</p>
            <table>
              <caption className="sp-sr">Two recorded relationships compared by context</caption>
              <thead><tr><th scope="col"></th><th scope="col">A</th><th scope="col">B</th></tr></thead>
              <tbody>
                <tr><th scope="row">Relationship</th><td>{clip(`${a!.subject} → ${a!.object}`,30)}</td><td>{b?clip(`${b.subject} → ${b.object}`,30):"–"}</td></tr>
                <tr><th scope="row">Model</th><td>{a!.model}</td><td>{b?.model??"–"}</td></tr>
                <tr><th scope="row">Design</th><td>{clip(a!.design,34)}</td><td>{b?clip(b.design,34):"–"}</td></tr>
                <tr><th scope="row">Tissue</th><td>{a!.tissue??"not recorded"}</td><td>{b?(b.tissue??"not recorded"):"–"}</td></tr>
              </tbody>
            </table>
            <Link to="/context-conflict-audit">Try the audit on synthetic studies →</Link>
          </article>
          <article className="hv-card" aria-labelledby="o3">
            <h3 id="o3">Gap register</h3>
            <p className="hv-stamp">{s.gaps.length} open</p>
            <ul className="hv-gaps">{s.gaps.slice(0,3).map(g=><li key={g.question}>{clip(g.missing,120)}</li>)}</ul>
            <Link to="/research/knowledge-graph">Inspect the claims and gaps →</Link>
          </article>
          <article className="hv-card hv-card-brief" aria-labelledby="o4">
            <h3 id="o4">Draft research brief</h3>
            <p className="hv-stamp">Illustrative, source-free</p>
            <ResearchBriefPreview />
            <Link to="/research-briefs">See the example brief →</Link>
          </article>
        </div>)}
      </div>
    </section>
  );
}
