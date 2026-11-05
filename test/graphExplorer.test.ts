import {test,expect} from 'bun:test';
import {filterExplorerGraph,forceGraphPositions} from '../site/src/features/science/graphExplorer';
import {SCIENCE_GRAPH} from '../site/src/features/science/knowledgeGraph';
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
test('force layout is deterministic, bounded and does not mutate scientific records',()=>{
 const before=JSON.stringify(SCIENCE_GRAPH),first=forceGraphPositions(SCIENCE_GRAPH),second=forceGraphPositions(SCIENCE_GRAPH);
 expect([...first]).toEqual([...second]);expect(first.size).toBe(SCIENCE_GRAPH.nodes.length);
 for(const p of first.values()){expect(Number.isFinite(p.x)&&Number.isFinite(p.y)).toBe(true);expect(p.x).toBeGreaterThanOrEqual(45);expect(p.x).toBeLessThanOrEqual(855);expect(p.y).toBeGreaterThanOrEqual(45);expect(p.y).toBeLessThanOrEqual(580)}
 expect(JSON.stringify(SCIENCE_GRAPH)).toBe(before);
 expect([...forceGraphPositions({...SCIENCE_GRAPH,nodes:[],edges:[]})]).toEqual([]);
});
