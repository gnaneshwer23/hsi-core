import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {loadDomainGraph} from "../../lib/claimGraphClient";
import {
  buildHomepageWorkedConflict,
  type HomepageWorkedConflict as WorkedConflict,
} from "../../../../src/knowledgeGraph/homepageWorkedConflict";

export function HomepageWorkedConflict(){
  const [conflict,setConflict]=useState<WorkedConflict|null>(null);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const c=new AbortController();
    const t=setTimeout(()=>c.abort(),12000);
    loadDomainGraph(null,c.signal)
      .then((g)=>{
        const built=buildHomepageWorkedConflict(g);
        if(!built)setFailed(true);
        else setConflict(built);
      })
      .catch(()=>setFailed(true))
      .finally(()=>clearTimeout(t));
    return()=>{c.abort();clearTimeout(t)};
  },[]);

  if(failed){
    return (
      <section className="pg-conflict" aria-labelledby="pg-conflict-h">
        <h2 id="pg-conflict-h">One worked conflict</h2>
        <p role="status">The sealed snapshot could not be verified, so no conflict example is shown.</p>
      </section>
    );
  }
  if(!conflict){
    return (
      <section className="pg-conflict" aria-labelledby="pg-conflict-h" aria-busy="true">
        <h2 id="pg-conflict-h">One worked conflict</h2>
        <p role="status">Verifying the sealed snapshot…</p>
      </section>
    );
  }

  const src=(s:WorkedConflict["leftSource"])=>
    s?(
      <a href={s.url} target="_blank" rel="noreferrer noopener">{s.title}</a>
    ):(
      <span>Source record unavailable</span>
    );

  return (
    <section className="pg-conflict" aria-labelledby="pg-conflict-h">
      <div className="pg-conflict-head">
        <h2 id="pg-conflict-h">One worked conflict</h2>
        <p>
          Two source-candidate findings from the gut metabolites → type 1 diabetes path. Compare their
          experimental context before calling them a contradiction.
        </p>
        <p className="pg-conflict-honesty" role="status">
          Unreviewed candidates · reviewed edges: {conflict.reviewedEdgeCount} · confirmed contradiction:
          false. Not dual-reviewed data.
        </p>
      </div>
      <div className="pg-conflict-pair" role="group" aria-label="Compared findings">
        <article aria-labelledby="pg-conflict-a">
          <h3 id="pg-conflict-a">Finding A · {conflict.leftEdgeId}</h3>
          <p>{conflict.leftAssertion}</p>
          <p className="pg-conflict-src">Source: {src(conflict.leftSource)}</p>
          <p className="pg-chip">Review: {conflict.reviewStates.left}</p>
        </article>
        <article aria-labelledby="pg-conflict-b">
          <h3 id="pg-conflict-b">Finding B · {conflict.rightEdgeId}</h3>
          <p>{conflict.rightAssertion}</p>
          <p className="pg-conflict-src">Source: {src(conflict.rightSource)}</p>
          <p className="pg-chip">Review: {conflict.reviewStates.right}</p>
        </article>
      </div>
      <div className="pg-conflict-diff" aria-label="Context differences">
        <h3>Why they may not be the same claim</h3>
        <p>
          Classification: {conflict.classification.replaceAll("_"," ")}. Same subject–outcome pair:{" "}
          {conflict.sameEntityPair?"yes":"no"}.
        </p>
        {conflict.differences.length===0?(
          <p>No field differences were extracted; still not a confirmed contradiction.</p>
        ):(
          <ul>
            {conflict.differences.map((d)=>(
              <li key={d.dimension}>
                <b>{d.dimension}</b>: {d.left} vs {d.right}
              </li>
            ))}
          </ul>
        )}
        <p>{conflict.honestyNote}</p>
        <Link
          className="pg-link"
          to={`/research/knowledge-graph?experience=advanced&investigation=gut-t1d`}
        >
          Open this comparison in the knowledge graph <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
