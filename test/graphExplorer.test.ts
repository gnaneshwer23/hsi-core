import {test,expect} from 'bun:test';
import {filterExplorerGraph,forceGraphPositions,graphStartingPoints,neighboursGroupedByKind,GRAPH_HONESTY,countNodesByKind} from '../site/src/features/science/graphExplorer';
import {SCIENCE_GRAPH} from '../site/src/features/science/knowledgeGraph';
import {typedGraphNeighbours} from '../site/src/features/science/typedGraphData';
const all={query:'',kind:'all',domain:'all',review:'all',evidence:'all'};
test('graph filters preserve endpoint integrity and never invent evidence',()=>{
 const status=new Map(SCIENCE_GRAPH.edges.map(e=>[e.id,'not_curated']));
 for(const filters of [{...all,kind:'organ'},{...all,domain:'immune'},{...all,evidence:'not_curated'}]){
  const result=filterExplorerGraph(SCIENCE_GRAPH,filters,status),ids=new Set(result.nodes.map(n=>n.id));
  expect(result.edges.every(e=>ids.has(e.subjectId)&&ids.has(e.objectId))).toBe(true);
  expect(result.reviewed).toBe(false);
 }
 expect(filterExplorerGraph(SCIENCE_GRAPH,{...all,evidence:'supported'},status).nodes).toEqual([]);
 expect(filterExplorerGraph(SCIENCE_GRAPH,{...all,query:'no-such-concept'},status).nodes).toEqual([]);
 expect(filterExplorerGraph(SCIENCE_GRAPH,{...all,query:'pancreas'},status).nodes.some(n=>n.id==='pancreas')).toBe(true);
});
test('flagship honesty contract stays educational and non-clinical',()=>{
 expect(GRAPH_HONESTY.scientificApproval).toBe(false);
 expect(GRAPH_HONESTY.clinicalAdvice).toBe(false);
 expect(GRAPH_HONESTY.layoutMeansBiology).toBe(false);
 expect(GRAPH_HONESTY.emptyFilterIsFinding).toBe(false);
 expect(SCIENCE_GRAPH.reviewed).toBe(false);
});
test('starting points are real catalogue nodes ranked by degree',()=>{
 const starters=graphStartingPoints(SCIENCE_GRAPH);
 expect(starters.length).toBeGreaterThan(0);
 const ids=new Set(SCIENCE_GRAPH.nodes.map(n=>n.id));
 for(const s of starters){
  expect(ids.has(s.id)).toBe(true);
  expect(s.degree).toBeGreaterThan(0);
 }
 expect(starters[0]!.degree).toBeGreaterThanOrEqual(starters.at(-1)!.degree);
});
test('neighbours group by kind without inventing endpoints',()=>{
 const groups=neighboursGroupedByKind('pancreas',typedGraphNeighbours('pancreas'));
 const kinds=new Set(groups.map(g=>g.kind));
 expect(kinds.size).toBe(groups.length);
 for(const g of groups)for(const item of g.items){
  expect(SCIENCE_GRAPH.nodes.some(n=>n.id===item.id)).toBe(true);
  expect(['in','out']).toContain(item.direction);
 }
 expect(Object.values(countNodesByKind(SCIENCE_GRAPH)).reduce((a,b)=>a+b,0)).toBe(SCIENCE_GRAPH.nodes.length);
});
test('force layout is deterministic, bounded and does not mutate scientific records',()=>{
 const before=JSON.stringify(SCIENCE_GRAPH),first=forceGraphPositions(SCIENCE_GRAPH),second=forceGraphPositions(SCIENCE_GRAPH);
 expect([...first]).toEqual([...second]);expect(first.size).toBe(SCIENCE_GRAPH.nodes.length);
 for(const p of first.values()){expect(Number.isFinite(p.x)&&Number.isFinite(p.y)).toBe(true);expect(p.x).toBeGreaterThanOrEqual(45);expect(p.x).toBeLessThanOrEqual(855);expect(p.y).toBeGreaterThanOrEqual(45);expect(p.y).toBeLessThanOrEqual(580)}
 expect(JSON.stringify(SCIENCE_GRAPH)).toBe(before);
 expect([...forceGraphPositions({...SCIENCE_GRAPH,nodes:[],edges:[]})]).toEqual([]);
});
test('graph layout handles 100 and 500 test nodes and rejects 1000 before expensive work',()=>{
 for(const count of [100,500]){
  const graph={...SCIENCE_GRAPH,nodes:Array.from({length:count},(_,i)=>({...SCIENCE_GRAPH.nodes[0]!,id:'layout-fixture-'+i})),edges:[]};
  const points=forceGraphPositions(graph);expect(points.size).toBe(count);
  expect([...points.values()].every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))).toBe(true);
 }
 expect(()=>forceGraphPositions({...SCIENCE_GRAPH,nodes:Array.from({length:1000},(_,i)=>({...SCIENCE_GRAPH.nodes[0]!,id:'oversized-fixture-'+i})),edges:[]})).toThrow('layout budget');
});
