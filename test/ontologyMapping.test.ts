import {describe,expect,test} from 'bun:test';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {canonicalMappingText,IDENTIFIER_PATTERNS,verifyOntologyMappings,type OntologyMapping,type OntologyMappingFile} from '../src/knowledgeGraph/ontologyMapping';

const sha=async(s:string)=>createHash('sha256').update(s).digest('hex');
const graph={nodes:[{id:'concept:il-21'},{id:'concept:b-cell'}]} as any;
const ONT=[{namespace:'HGNC' as const,version:'2026-11-01',retrievedAt:'2026-11-16',licence:'CC0'},{namespace:'CL' as const,version:'2026-10-05',retrievedAt:'2026-11-16',licence:'CC BY 4.0'}];
const base=(over:Partial<OntologyMapping>={}):OntologyMapping=>({id:'m1',conceptId:'concept:il-21',namespace:'HGNC',identifier:'HGNC:6005',label:'IL21',relation:'exact',evidence:{method:'exact_label',note:'Label equals the approved symbol'},reviewStatus:'candidate',mappedBy:'candidate-generator',mappedAt:'2026-11-16',reviewer:null,reviewedAt:null,rejectionReason:null,...over});
async function file(mappings:OntologyMapping[],ontologies=ONT,patch:Partial<OntologyMappingFile>={}):Promise<OntologyMappingFile>{
 const body={schemaVersion:'hsi-ontology-mappings-1' as const,mappedAgainst:'a'.repeat(64),ontologies,mappings,...patch};
 return {...body,digest:await sha(canonicalMappingText(body))} as OntologyMappingFile;
}
const reviewer={name:'Owner',role:'Interim reviewer (owner)',independent:false};
const has=(errs:string[],s:string)=>expect(errs.some(e=>e.includes(s))).toBe(true);

describe('ontology mapping contract',()=>{
 test('the committed file is valid against the real graph and holds no mappings yet',async()=>{
  const g=JSON.parse(readFileSync('research/domain-graph/graph.v1.json','utf8')),f=JSON.parse(readFileSync('research/ontology/mappings.v1.json','utf8'));
  expect(await verifyOntologyMappings(f,g,sha)).toEqual([]);expect(f.mappings).toEqual([]);
 });
 test('accepts a candidate and a reviewed mapping with a labelled non-independent reviewer',async()=>{
  const f=await file([base(),base({id:'m2',conceptId:'concept:b-cell',namespace:'CL',identifier:'CL:0000236',label:'B cell',reviewStatus:'reviewed',reviewer,reviewedAt:'2026-11-17'})]);
  expect(await verifyOntologyMappings(f,graph,sha)).toEqual([]);
 });
 test('rejects a concept that is not in the graph',async()=>{has(await verifyOntologyMappings(await file([base({conceptId:'concept:missing'})]),graph,sha),'is not in the graph')});
 test('rejects malformed identifiers per namespace',async()=>{
  has(await verifyOntologyMappings(await file([base({identifier:'6005'})]),graph,sha),'not a valid HGNC identifier');
  expect(IDENTIFIER_PATTERNS.UNIPROT.test('P05231')).toBe(true);expect(IDENTIFIER_PATTERNS.UNIPROT.test('p05231')).toBe(false);
  expect(IDENTIFIER_PATTERNS.REACTOME.test('R-HSA-168256')).toBe(true);expect(IDENTIFIER_PATTERNS.MONDO.test('MONDO:12')).toBe(false);
 });
 test('requires a pinned, licensed ontology version for every namespace used',async()=>{
  has(await verifyOntologyMappings(await file([base()],[]),graph,sha),'no pinned ontology version');
  has(await verifyOntologyMappings(await file([],[{...ONT[0]!,version:''}]),graph,sha),'must pin a version');
  has(await verifyOntologyMappings(await file([],[{...ONT[0]!,licence:''}]),graph,sha),'licence');
 });
 test('a candidate cannot carry review fields, and a reviewed mapping must name its reviewer',async()=>{
  has(await verifyOntologyMappings(await file([base({reviewer})]),graph,sha),'candidate must have no reviewer');
  has(await verifyOntologyMappings(await file([base({reviewStatus:'reviewed'})]),graph,sha),'needs a reviewer');
  has(await verifyOntologyMappings(await file([base({reviewStatus:'reviewed',reviewer:{...reviewer,independent:undefined as any},reviewedAt:'2026-11-17'})]),graph,sha),'independent true or false');
 });
 test('a rejected mapping needs a reason',async()=>{has(await verifyOntologyMappings(await file([base({reviewStatus:'rejected'})]),graph,sha),'needs a reason')});
 test('records ambiguity as candidates: two reviewed exact mappings for one concept and namespace are refused',async()=>{
  const r={reviewStatus:'reviewed' as const,reviewer,reviewedAt:'2026-11-17'};
  has(await verifyOntologyMappings(await file([base({...r}),base({...r,id:'m2',identifier:'HGNC:6006'})]),graph,sha),'already has a reviewed exact');
  expect(await verifyOntologyMappings(await file([base(),base({id:'m2',identifier:'HGNC:6006'})]),graph,sha)).toEqual([]);
 });
 test('rejects duplicate ids and the same concept, namespace and identifier twice',async()=>{
  has(await verifyOntologyMappings(await file([base(),base()]),graph,sha),'duplicate id');
  has(await verifyOntologyMappings(await file([base(),base({id:'m2'})]),graph,sha),'mapped twice');
 });
 test('rejects unknown keys, unsupported versions and a tampered digest',async()=>{
  const f=await file([base()]);
  has(await verifyOntologyMappings({...f,extra:1},graph,sha),'exactly');
  has(await verifyOntologyMappings({...f,schemaVersion:'x'},graph,sha),'Unsupported schemaVersion');
  has(await verifyOntologyMappings({...f,mappings:[{...f.mappings[0]!,label:'Changed'}]},graph,sha),'digest does not match');
 });
 test('does not mutate its input',async()=>{const f=await file([base()]),before=JSON.stringify(f);await verifyOntologyMappings(f,graph,sha);expect(JSON.stringify(f)).toBe(before)});
});
