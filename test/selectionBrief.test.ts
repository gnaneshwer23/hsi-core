import {describe,expect,test} from 'bun:test';
import {shortestPath,selectionBrief} from '../src/knowledgeGraph/selectionBrief';
import type {DomainBundle} from '../src/knowledgeGraph/domainGraph';

const E=[{id:'e1',s:'a',o:'b'},{id:'e2',s:'b',o:'c'},{id:'e3',s:'c',o:'d'},{id:'e4',s:'a',o:'d'}];
describe('selection tools',()=>{
 test('finds the shortest route and is stable',()=>{
  expect(shortestPath(E,'a','c')!.map(s=>s.edgeId)).toEqual(['e1','e2']);
  expect(shortestPath(E,'a','d')!.map(s=>s.edgeId)).toEqual(['e4']);
 });
 test('returns null when nothing connects within the hop limit',()=>{
  expect(shortestPath([{id:'x',s:'a',o:'b'}],'a','z')).toBeNull();
  expect(shortestPath([{id:'1',s:'a',o:'b'},{id:'2',s:'b',o:'c'},{id:'3',s:'c',o:'d'}],'a','d',2)).toBeNull();
 });
 test('the brief states it is unreviewed, lists provenance and does not mutate input',()=>{
  const b={version:'v1',nodes:[{id:'a',name:'A',kind:'gene',aliases:[],domains:['immune']},{id:'b',name:'B',kind:'gene',aliases:[],domains:[]}],
   sources:[{id:'s1',title:'Paper',url:'u',doi:null,pmid:'1',identityStatus:'repository_locator_not_reverified'}],
   edges:[{id:'e1',subjectId:'a',objectId:'b',predicate:'activates',kind:'source_candidate',sourceId:'s1',model:'mouse',design:'KO',limitations:'small n',negated:true}],gaps:[]} as unknown as DomainBundle;
  const before=JSON.stringify(b),md=selectionBrief(b,['a','b'],{now:'T'});
  expect(md).toContain('unreviewed candidate');expect(md).toContain('PMID 1');expect(md).toContain('[did not hold] A activates B');expect(md).toContain('not evidence of absence');
  expect(JSON.stringify(b)).toBe(before);
 });
});
