import {useEffect,useState} from "react";
import {loadDomainGraph} from "../../lib/claimGraphClient";

export type Snapshot={concepts:number;relationships:number;gaps:{question:string;missing:string}[];sources:number;notRetrieved:number;reviewed:number;version:string};

/** Reads counts from the published, digest-verified graph snapshot. Nothing is typed in; failure shows no substitute figures. */
export function useGraphSnapshot(){
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null),[failed,setFailed]=useState(false);
  useEffect(()=>{
    const c=new AbortController();let active=true;const t=setTimeout(()=>c.abort(),12000);
    loadDomainGraph(null,c.signal).then(g=>{
      if(!active)return;
      setSnapshot({
        concepts:g.nodes.length,
        relationships:g.edges.filter(e=>e.kind==="source_candidate").length,
        gaps:g.gaps.map(x=>({question:x.question,missing:x.missing})),
        sources:g.sources.length,
        notRetrieved:g.sources.filter(x=>x.identityStatus==="bibliographic_candidate_not_retrieved").length,
        reviewed:g.edges.filter(e=>(e.reviewStatus as string)!=="unreviewed").length,
        version:g.version.slice(0,8),
      });
    }).catch(()=>{if(active)setFailed(true)}).finally(()=>clearTimeout(t));
    return()=>{active=false;c.abort();clearTimeout(t)};
  },[]);
  return {snapshot,failed};
}
