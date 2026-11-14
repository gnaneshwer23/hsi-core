import {useGraphSnapshot} from "./useGraphSnapshot";

const clip=(s:string,n:number)=>s.length>n?s.slice(0,n-1).trimEnd()+"…":s;

/** Annotated anatomy of one real relationship from the published snapshot. The layout is schematic; every label is a recorded field. */
export function AnatomyDiagram(){
  const {snapshot:s,failed}=useGraphSnapshot();
  const e=s?.examples[0];
  const items:[string,string,string][]=e?[
    ["Entities",`${e.subject} and ${e.object}`,"Each concept keeps an identifier in the graph."],
    ["Relationship",e.predicate,"Direction is recorded as annotated. Checking it against the source is still pending."],
    ["Source",e.source?clip(e.source.title,90):"None recorded",e.source?`Status: ${e.source.identity}.`:""],
    ["Context",`${e.model}; ${clip(e.design,60)}`,"Species, design and tissue stay with the claim."],
    ["Limits",clip(e.limits,110),"Named, not smoothed over."],
    ["Review status","Unreviewed","Scientific approval: none."],
  ]:[];
  return (
    <figure className="hv-anatomy" aria-labelledby="hv-anatomy-cap">
      <div className="hv-anatomy-plate">
        <svg viewBox="0 0 640 320" role="img" aria-labelledby="hv-an-t hv-an-d">
          <title id="hv-an-t">Anatomy of one recorded relationship</title>
          <desc id="hv-an-d">Two concepts joined by a relationship. Below it, the source, context, limits and review status that stay attached to it. Numbers refer to the list beside the diagram.</desc>
          <line className="hv-edge" x1="168" y1="120" x2="468" y2="120"/>
          <path className="hv-arrow" d="M456 110L470 120L456 130"/>
          <circle className="hv-node" cx="110" cy="120" r="58"/>
          <circle className="hv-node" cx="530" cy="120" r="58"/>
          <text className="hv-nt" x="110" y="126" textAnchor="middle">{e?clip(e.subject,12):"…"}</text>
          <text className="hv-nt" x="530" y="116" textAnchor="middle">{e?clip(e.object.split(" ")[0]!,12):"…"}</text>
          <text className="hv-nt" x="530" y="140" textAnchor="middle">{e?clip(e.object.split(" ").slice(1).join(" "),12):""}</text>
          <text className="hv-et" x="318" y="100" textAnchor="middle">{e?clip(e.predicate,26):"relationship"}</text>
          <path className="hv-leader" d="M318 124V196"/>
          {[["Source",70],["Context",212],["Limits",354],["Status",496]].map(([k,x])=>(
            <g key={k as string}>
              <rect className="hv-tag" x={x as number} y="196" width="128" height="56" rx="6"/>
              <text className="hv-tt" x={(x as number)+64} y="230" textAnchor="middle">{k as string}</text>
            </g>
          ))}
          <path className="hv-leader" d="M134 196V150M276 196V156M418 196V156M560 196V170" />
          {[["1",110,30],["2",318,62],["3",134,282],["4",276,282],["5",418,282],["6",560,282]].map(([n,x,y])=>(
            <g key={n as string}><circle className="hv-pin" cx={x as number} cy={y as number} r="15"/><text className="hv-pn" x={x as number} y={(y as number)+6} textAnchor="middle">{n as string}</text></g>
          ))}
        </svg>
        <p className="hv-note">Layout is schematic. Labels are fields recorded in the published snapshot{s?` (${s.version})`:""}. Candidate, unreviewed.</p>
      </div>
      <ol className={"hv-legend"+(!e&&!failed?" hv-loading":"")}>
        {e?items.map(([k,v,n],i)=>(
          <li key={k}><span className="hv-pin-n" aria-hidden="true">{i+1}</span><div><strong>{k}</strong><span>{v}</span>{n&&<small>{n}</small>}</div></li>
        )):<li className="hv-wait">{failed?"Snapshot unavailable. No substitute figures are shown.":"Verifying snapshot…"}</li>}
      </ol>
      <figcaption id="hv-anatomy-cap" className="sp-sr">One recorded relationship and what stays attached to it.</figcaption>
    </figure>
  );
}
