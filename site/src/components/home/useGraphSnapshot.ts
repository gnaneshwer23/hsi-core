import {createContext,createElement,useContext,useEffect,useState,type ReactNode} from "react";
import {loadDomainGraph} from "../../lib/claimGraphClient";

export type Example={id:string;subject:string;object:string;predicate:string;negated:boolean;assertion:string;model:string;design:string;tissue:string|null;limits:string;warnings:string[];context:string;source:{title:string;pmid:string|null;identity:string;locator:string|null}|null};
export type Snapshot={examples:Example[];concepts:number;relationships:number;gaps:{question:string;missing:string}[];sources:number;notRetrieved:number;reviewed:number;version:string};

/** Fetches the published, digest-verified graph snapshot. Nothing is typed in; failure shows no substitute figures. */
function useSnapshotFetch(enabled:boolean){
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null),[failed,setFailed]=useState(false);
  useEffect(()=>{
    if(!enabled)return;
    const c=new AbortController();let active=true;const t=setTimeout(()=>c.abort(),12000);
    loadDomainGraph(null,c.signal).then(g=>{
      if(!active)return;
      const names=new Map(g.nodes.map(n=>[n.id,n.name]));
      const sources=new Map(g.sources.map(x=>[x.id,x]));
      const cands=g.edges.filter(e=>e.kind==="source_candidate"&&e.sourceId);
      const picked=cands.slice(0,3);const neg=cands.find(e=>e.negated&&!picked.includes(e));if(neg)picked.push(neg);else if(cands[3])picked.push(cands[3]);
      const examples:Example[]=picked.map(e=>{const src=sources.get(e.sourceId!);return {id:e.id,subject:names.get(e.subjectId)??e.subjectId,object:names.get(e.objectId)??e.objectId,predicate:e.predicate.replaceAll("_"," "),negated:e.negated,assertion:e.assertion,model:e.model,design:e.design,tissue:e.tissue,limits:e.limitations,warnings:e.scopeWarnings,context:e.contextStatus.replaceAll("_"," "),source:src?{title:src.title,pmid:src.pmid,identity:src.identityStatus.replaceAll("_"," "),locator:src.passages[0]?.locator??null}:null}});
      setSnapshot({
        examples,
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
  },[enabled]);
  return {snapshot,failed};
}
type Value={snapshot:Snapshot|null;failed:boolean};
const SnapshotContext=createContext<Value|null>(null);
/** One fetch for a whole page: components below read it through useGraphSnapshot. */
export function GraphSnapshotProvider({children}:{children:ReactNode}){
  const value=useSnapshotFetch(true);
  return createElement(SnapshotContext.Provider,{value},children);
}
export function useGraphSnapshot():Value{
  const shared=useContext(SnapshotContext);
  const own=useSnapshotFetch(shared===null);
  return shared??own;
}
