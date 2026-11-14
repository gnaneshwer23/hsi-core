import {useState} from "react";
import {Link} from "react-router-dom";
import {intelligenceCapabilities} from "../../lib/intelligenceCollective";
import {AGENT_STATE} from "../../lib/agentDashboard";
import {FLOW_STAGES,ASSURANCE_SLUGS,COORDINATION_SLUGS} from "../../lib/flowStages";
import {useGraphSnapshot} from "./useGraphSnapshot";

const clip=(s:string,n:number)=>s.length>n?s.slice(0,n-1).trimEnd()+"…":s;
const cap=(slug:string)=>intelligenceCapabilities.find(c=>c.slug===slug)!;
const uniq=(xs:string[])=>[...new Set(xs)];

function Chip({slug}:{slug:string}){
  const c=cap(slug),st=AGENT_STATE[slug]!;
  return <Link className="hv-chip" to={`/intelligence/${slug}`} title={st.label}><span className="hv-dot" data-state={st.state} aria-hidden="true"/>{c.name}<span className="sp-sr"> ({st.label})</span></Link>;
}

/** How one question moves through HSI, stage by stage: which capabilities act, what they read, what stays out of scope, and where a person decides. */
export function FlowInfographic(){
  const {snapshot:s}=useGraphSnapshot();
  const [id,setId]=useState("map");
  const stage=FLOW_STAGES.find(x=>x.id===id)!;
  const caps=stage.slugs.map(cap);
  const e=s?.examples[0];
  const trace:Record<string,string>=e?{
    source:e.source?clip(e.source.title,84):"No source recorded",
    assertion:clip(e.assertion,96),
    relationship:`${e.subject} → ${e.predicate} → ${e.object}`,
    context:`${e.model}; ${clip(e.design,48)}`,
    limits:clip(e.limits,84),
    status:"Unreviewed. Scientific approval: none.",
  }:{};
  return (
    <section className="hv-flow" aria-labelledby="hv-flow-title">
      <div className="hv-inner">
        <h2 id="hv-flow-title">How a question moves through HSI.</h2>
        <p className="hv-sub">Six stages, one accountable trail. Select a stage to see who acts, what they read and where they stop.</p>
        <div className="hv-lane hv-lane-top"><span>Coordinates the whole investigation</span>{COORDINATION_SLUGS.map(x=><Chip key={x} slug={x}/>)}</div>
        <ol className="hv-rail" aria-label="Stages of an investigation">
          {FLOW_STAGES.map((x,i)=>(
            <li key={x.id} data-human={x.human||undefined} data-active={x.id===id||undefined} style={{["--i" as string]:i}}>
              <button type="button" aria-pressed={x.id===id} onClick={()=>setId(x.id)}>
                <span className="hv-n">{i+1}</span>
                <strong>{x.short}</strong>
                <span className="hv-agents">{x.slugs.map(sl=>cap(sl).name).join(" · ")}</span>
              </button>
              <div className="hv-trace" aria-hidden={!e}>{trace[x.trace]??""}</div>
            </li>
          ))}
        </ol>
        <div className="hv-gate" aria-hidden="true"><span>Human decision</span></div>
        <div className="hv-lane hv-lane-bottom"><span>Watches and evaluates throughout</span>{ASSURANCE_SLUGS.map(x=><Chip key={x} slug={x}/>)}</div>
        <p className="hv-fine">The line under each stage is a field recorded in the published snapshot, shown where that stage would produce it. No live agent run produced it, and none of these capabilities has had one.</p>
        <div className="hv-detail" aria-live="polite" aria-label={`${stage.title} detail`}>
          <div className="hv-detail-head">
            <h3>{stage.title}</h3>
            <div>{stage.slugs.map(sl=><Chip key={sl} slug={sl}/>)}</div>
          </div>
          <div className="hv-cols">
            <div><h4>Reads</h4><ul>{uniq(caps.flatMap(c=>c.dependencies)).slice(0,5).map(d=><li key={d}>{d}</li>)}</ul></div>
            <div><h4>Does</h4><ul>{uniq(caps.flatMap(c=>c.responsibility)).slice(0,5).map(d=><li key={d}>{d}</li>)}</ul></div>
            <div><h4>Stops at</h4><ul>{caps.map(c=><li key={c.slug}><b>{c.name}:</b> {c.boundary}</li>)}</ul></div>
            <div><h4>Where it stands</h4><ul>{caps.map(c=><li key={c.slug}><b>{c.name}:</b> {c.maturity}.</li>)}</ul></div>
          </div>
          {stage.human&&<p className="hv-human">This is where a person decides. A model result is never an approval, and publishing to the graph is a separate decision.</p>}
        </div>
      </div>
    </section>
  );
}
