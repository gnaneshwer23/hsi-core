import {createContext,createElement,useContext,useEffect,useState,type ReactNode} from "react";
import {loadDomainGraph} from "../../lib/claimGraphClient";

export type Example={id:string;subject:string;object:string;predicate:string;negated:boolean;assertion:string;model:string;design:string;tissue:string|null;limits:string;warnings:string[];context:string;source:{title:string;pmid:string|null;identity:string;locator:string|null}|null};
export type Network={center:string;nodes:{id:string;name:string}[];edges:{id:string;s:string;o:string;predicate:string;negated:boolean}[]};
export type Snapshot={network:Network;predicates:[string,number][];negated:number;examples:Example[];concepts:number;relationships:number;gaps:{question:string;missing:string}[];sources:number;notRetrieved:number;reviewed:number;version:string};

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
      const centerId=picked[0]?.subjectId??g.nodes[0]!.id;
      const touching=(id:string)=>cands.filter(e=>e.subjectId===id||e.objectId===id);
      const keep=new Set<string>([centerId]);
      for(const e of touching(centerId)){if(keep.size<8)keep.add(e.subjectId===centerId?e.objectId:e.subjectId)}
      for(const id of [...keep].slice(1)){for(const e of touching(id)){if(keep.size>=10)break;keep.add(e.subjectId===id?e.objectId:e.subjectId)}}
      const netEdges=cands.filter(e=>keep.has(e.subjectId)&&keep.has(e.objectId)).slice(0,18).map(e=>({id:e.id,s:e.subjectId,o:e.objectId,predicate:e.predicate.replaceAll("_"," "),negated:e.negated}));
      const counts=new Map<string,number>();for(const e of g.edges.filter(x=>x.kind==="source_candidate"))counts.set(e.predicate,(counts.get(e.predicate)??0)+1);
      setSnapshot({
        network:{center:centerId,nodes:[...keep].map(id=>({id,name:names.get(id)??id})),edges:netEdges},
        predicates:[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>[k.replaceAll("_"," "),v] as [string,number]),
        negated:g.edges.filter(e=>e.kind==="source_candidate"&&e.negated).length,
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
