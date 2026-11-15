/**
 * Selection tools for the graph explorer: shortest path inside the visible view and an evidence-linked brief.
 * Read-only and derived only from the supplied graph. A path is a route through recorded candidate relationships, not proof of causality.
 */
import type {DomainBundle} from './domainGraph';

export type PathStep={edgeId:string;from:string;to:string};
/** Shortest undirected route (at most maxHops) through the supplied edges. */
export function shortestPath(edges:readonly {id:string;s:string;o:string}[],a:string,b:string,maxHops=4):PathStep[]|null{
 if(a===b)return [];
 const adj=new Map<string,{id:string;to:string}[]>();
 for(const e of edges){(adj.get(e.s)??adj.set(e.s,[]).get(e.s)!).push({id:e.id,to:e.o});(adj.get(e.o)??adj.set(e.o,[]).get(e.o)!).push({id:e.id,to:e.s})}
 const prev=new Map<string,{from:string;id:string}>();let frontier=[a];
 for(let d=0;d<maxHops&&!prev.has(b);d++){
  const next:string[]=[];
  for(const f of frontier)for(const x of (adj.get(f)??[]).sort((p,q)=>p.id.localeCompare(q.id)))if(x.to!==a&&!prev.has(x.to)){prev.set(x.to,{from:f,id:x.id});next.push(x.to)}
  frontier=next;
 }
 if(!prev.has(b))return null;
 const out:PathStep[]=[];for(let c=b;c!==a;){const p=prev.get(c)!;out.unshift({edgeId:p.id,from:p.from,to:c});c=p.from}
 return out;
}

const pretty=(s:string)=>s.replaceAll('_',' ');
/** A markdown research brief for the selected concepts, with each relationship's model, source and review status. */
export function selectionBrief(bundle:DomainBundle,ids:readonly string[],opts:{now?:string;gapQuestions?:readonly {id:string;question:string;entityIds:readonly string[]}[]}={}):string{
 const name=(id:string)=>bundle.nodes.find(n=>n.id===id)?.name??id,pick=new Set(ids);
 const nodes=ids.map(id=>bundle.nodes.find(n=>n.id===id)).filter((n):n is NonNullable<typeof n>=>!!n);
 const edges=bundle.edges.filter(e=>e.kind==='source_candidate'&&(pick.has(e.subjectId)||pick.has(e.objectId)));
 const inner=edges.filter(e=>pick.has(e.subjectId)&&pick.has(e.objectId));
 const src=(id:string|null)=>{const s=id?bundle.sources.find(x=>x.id===id):null;return s?`${s.title} (${s.pmid?`PMID ${s.pmid}`:s.doi?`DOI ${s.doi}`:s.id}; identity ${pretty(s.identityStatus)})`:'no source attached'};
 const rel=(e:(typeof edges)[number])=>`- ${e.negated?'[did not hold] ':''}${name(e.subjectId)} ${pretty(e.predicate)} ${name(e.objectId)}. Model: ${pretty(e.model)}. Design: ${e.design}. Source: ${src(e.sourceId)}. Limits: ${e.limitations}`;
 const gaps=(opts.gapQuestions??[]).filter(g=>g.entityIds.some(id=>pick.has(id)));
 return [
  `# Research brief: ${nodes.map(n=>n.name).join(', ')||'no concepts selected'}`,
  '',
  `Generated ${opts.now??new Date().toISOString()} from the published candidate graph, version ${bundle.version}.`,
  '**Status: research brief. Every relationship is an unreviewed candidate, confidence is not calibrated, and nothing here is clinical advice.** It lists what the graph records; it does not search the wider literature, so a missing item is a coverage limit, not evidence of absence.',
  '',
  '## Concepts',
  ...nodes.map(n=>`- ${n.name} (${pretty(n.kind)}; ${n.domains.map(pretty).join(', ')||'no department'}; id ${n.id})`),
  '',
  `## Relationships between the selected concepts (${inner.length})`,
  ...(inner.length?inner.map(rel):['None recorded between them.']),
  '',
  `## Other relationships touching the selection (${edges.length-inner.length})`,
  ...edges.filter(e=>!inner.includes(e)).slice(0,60).map(rel),
  '',
  `## Findings that did not hold (${edges.filter(e=>e.negated).length})`,
  ...(edges.filter(e=>e.negated).length?edges.filter(e=>e.negated).map(rel):['None recorded.']),
  '',
  `## Research gaps naming a selected concept (${gaps.length})`,
  ...(gaps.length?gaps.map(g=>`- ${g.question} (${g.entityIds.map(name).join(' / ')})`):['None recorded.']),
  '',
  '## Limits',
  '- Source identity is not verified for any record in this snapshot.',
  '- Context such as tissue, population, assay and timepoint is often missing; see each relationship.',
  '- A route through several relationships is not evidence of a causal chain.',
 ].join('\n');
}
