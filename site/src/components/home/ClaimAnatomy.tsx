import {useMemo} from "react";
import {useSharedBundle} from "../../lib/useSharedBundle";

const pretty=(s:string)=>s.replaceAll("_"," ");
const FIELDS=["tissue","population","assay","timepoint","intervention","outcome"] as const;
/** One real relationship from the published snapshot, shown the way HSI stores it. The most fully described candidate is chosen; blanks say "Not recorded". */
export function ClaimAnatomy(){
 const {bundle:b,failed}=useSharedBundle();
 const pick=useMemo(()=>{
  if(!b)return null;
  const name=new Map(b.nodes.map(n=>[n.id,n.name])),src=new Map(b.sources.map(s=>[s.id,s]));
  const score=(e:typeof b.edges[number])=>FIELDS.filter(k=>e[k]).length*2+(e.sourceId?1:0)+(e.negated?0:1);
  const e=b.edges.filter(x=>x.kind==="source_candidate"&&x.sourceId).sort((p,q)=>score(q)-score(p)||p.id.localeCompare(q.id))[0];
  return e?{e,s:name.get(e.subjectId)??"",o:name.get(e.objectId)??"",src:src.get(e.sourceId!)}:null;
 },[b]);
 if(failed)return <p className="ca-wait" role="status">Snapshot unavailable. No example claim is shown.</p>;
 if(!pick)return <div className="ca ca-load" role="status" aria-label="Loading an example claim">Loading a claim from the published snapshot…</div>;
 const {e,s,o,src}=pick,rows:[string,string][]=[
  ["Source",src?(src.pmid?`PubMed ${src.pmid}`:src.doi?`DOI ${src.doi}`:src.title):"Not recorded"],
  ["Model",pretty(e.model)],["Design",e.design],
  ...FIELDS.map((k):[string,string]=>[k[0]!.toUpperCase()+k.slice(1),e[k]??"Not recorded"]),
  ["Limitations",e.limitations],
 ];
 return (
  <figure className="ca">
   <figcaption>One claim, as stored</figcaption>
   <p className="ca-claim"><b>{s}</b> {e.negated?"did not ":""}{pretty(e.predicate)} <b>{o}</b></p>
   <dl>{rows.map(([k,v])=><div key={k} data-blank={v==="Not recorded"||undefined}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
   <p className="ca-status"><span>Unreviewed</span><span>Confidence not calibrated</span><span>Not scientifically approved</span></p>
  </figure>
 );
}
