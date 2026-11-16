import {describe,expect,test} from 'bun:test';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {canonicalTypingText,ENTITY_TYPES,proposeConceptTypes,RULES_VERSION,TYPING_RULES,verifyTypingProposals,type TypingProposalFile} from '../src/knowledgeGraph/conceptTyping';

const sha=async(s:string)=>createHash('sha256').update(s).digest('hex');
const graph=JSON.parse(readFileSync('research/domain-graph/graph.v1.json','utf8'));
const committed:TypingProposalFile=JSON.parse(readFileSync('research/ontology/concept-types.v1.json','utf8'));
const typeOf=(name:string)=>proposeConceptTypes(graph.nodes).find(p=>p.name===name)?.proposedType;
const redigest=async(f:Omit<TypingProposalFile,'digest'>)=>({...f,digest:await sha(canonicalTypingText(f))});
const has=(errs:string[],s:string)=>expect(errs.some(e=>e.includes(s))).toBe(true);

describe('concept type proposals',()=>{
 test('only concepts the graph calls "biological concept" are typed, and every proposal is uncalibrated and unreviewed',()=>{
  const p=proposeConceptTypes(graph.nodes),expected=graph.nodes.filter((n:any)=>n.kind==='biological concept').length;
  expect(p.length).toBe(expected);expect(p.length).toBeGreaterThan(100);
  expect(p.every(x=>x.confidence==='uncalibrated'&&x.status==='proposed')).toBe(true);
  expect(p.every(x=>(ENTITY_TYPES as readonly string[]).includes(x.proposedType))).toBe(true);
 });
 test('known names get the expected proposal',()=>{
  expect(typeOf('B cell')).toBe('cell_type');expect(typeOf('BAFF (B-cell activating factor)')).toBe('cytokine_or_mediator');
  expect(typeOf('CXCL13+ Tfh-like T cells (SSc skin)')).toBe('cell_type');expect(typeOf('IL-21')).toBe('cytokine_or_mediator');
  expect(typeOf('Systemic sclerosis')).toBe('disease');expect(typeOf('HbA1c')).toBe('clinical_measurement');
  expect(typeOf('SSc cohort')).toBe('study_context');expect(typeOf('Anti-TNF response heterogeneity')).toBe('phenotype_or_state');
 });
 test('a name matching no rule stays unclassified instead of being guessed',()=>{
  const p=proposeConceptTypes([{id:'c:1',name:'Cholinergic neural signals to the spleen',kind:'biological concept'}]);
  expect(p[0]!.proposedType).toBe('unclassified');expect(p[0]!.ruleId).toBeNull();
 });
 test('ambiguity is recorded: the first rule decides and the other types that matched are listed',()=>{
  const [p]=proposeConceptTypes([{id:'c:1',name:'IL-6 pathway blockade (tocilizumab class)',kind:'biological concept'}]);
  expect(p!.proposedType).toBe('drug_or_therapy');expect(p!.alternatives.map(a=>a.type)).toContain('pathway');
 });
 test('rules have unique ids and the committed proposals match what the rules produce now',async()=>{
  expect(new Set(TYPING_RULES.map(r=>r.id)).size).toBe(TYPING_RULES.length);
  const fresh=await redigest({schemaVersion:'hsi-concept-typing-1',mappedAgainst:graph.version,rulesVersion:RULES_VERSION,proposals:proposeConceptTypes(graph.nodes)});
  expect(committed.digest).toBe(fresh.digest);
 });
});
describe('proposal file verifier',()=>{
 test('the committed file is valid against the real graph',async()=>{expect(await verifyTypingProposals(committed,graph,sha)).toEqual([])});
 test('rejects a tampered digest, a missing proposal, a stale rules version and a reviewed status',async()=>{
  has(await verifyTypingProposals({...committed,proposals:[{...committed.proposals[0]!,name:'Changed'},...committed.proposals.slice(1)]},graph,sha),'digest does not match');
  const dropped=await redigest({...committed,proposals:committed.proposals.slice(1)});has(await verifyTypingProposals(dropped,graph,sha),'has no proposal');
  has(await verifyTypingProposals({...committed,rulesVersion:'rules-0'},graph,sha),'rulesVersion');
  const reviewed=await redigest({...committed,proposals:[{...committed.proposals[0]!,status:'reviewed' as any},...committed.proposals.slice(1)]});has(await verifyTypingProposals(reviewed,graph,sha),'status proposed');
 });
 test('rejects an unclassified proposal that names a rule, an unknown type and a concept that is not in the graph',async()=>{
  const bad=(over:object)=>redigest({...committed,proposals:[{...committed.proposals[0]!,...over},...committed.proposals.slice(1)]});
  has(await verifyTypingProposals(await bad({proposedType:'unclassified'}),graph,sha),'unclassified must be exactly');
  has(await verifyTypingProposals(await bad({proposedType:'gene'}),graph,sha),'unknown type');
  has(await verifyTypingProposals(await bad({conceptId:'concept:missing'}),graph,sha),'not in the graph');
 });
 test('does not mutate its input',async()=>{const before=JSON.stringify(committed);await verifyTypingProposals(committed,graph,sha);expect(JSON.stringify(committed)).toBe(before)});
});
