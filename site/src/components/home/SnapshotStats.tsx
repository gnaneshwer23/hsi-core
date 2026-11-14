import {useEffect,useState} from "react";
import {loadDomainGraph} from "../../lib/claimGraphClient";

type Stats={concepts:number;relationships:number;gaps:number;sources:number;reviewed:number;version:string};
/** Counts read from the published, digest-verified graph snapshot. No numbers are typed in here. */
export function SnapshotStats(){
  const [stats,setStats]=useState<Stats|null>(null),[failed,setFailed]=useState(false);
  useEffect(()=>{
    const c=new AbortController();let active=true;const t=setTimeout(()=>c.abort(),12000);
    loadDomainGraph(null,c.signal).then(g=>{
      if(!active)return;
      setStats({
        concepts:g.nodes.length,
        relationships:g.edges.filter(e=>e.kind==="source_candidate").length,
        gaps:g.gaps.length,
        sources:g.sources.length,
        reviewed:g.edges.filter(e=>(e.reviewStatus as string)!=="unreviewed").length,
        version:g.version.slice(0,8),
      });
    }).catch(()=>{if(active)setFailed(true)}).finally(()=>clearTimeout(t));
    return()=>{active=false;c.abort();clearTimeout(t)};
  },[]);
  const tiles:[string,number|undefined,string][]=[
    ["Concepts",stats?.concepts,"Cells, molecules, tissues and conditions"],
    ["Relationships",stats?.relationships,"Recorded candidate connections"],
    ["Open gaps",stats?.gaps,"Missing evidence, named"],
    ["Sources",stats?.sources,"Bibliographic records"],
    ["Reviewed",stats?.reviewed,"Independently reviewed relationships"],
  ];
  return (
    <section className="hx-stats" aria-label="Published graph snapshot">
      <div className="hx-stats-head">
        <p>Published snapshot</p>
        <p>{failed?"Snapshot unavailable. No substitute figures are shown.":stats?`Version ${stats.version} · scientific approval: none`:"Verifying snapshot…"}</p>
      </div>
      <dl className="hx-tiles">
        {tiles.map(([k,v,note])=>(
          <div key={k}>
            <dt>{k}</dt>
            <dd aria-busy={!stats&&!failed}><span className="hx-num">{v===undefined?"–":v.toLocaleString("en-GB")}</span><small>{note}</small></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
