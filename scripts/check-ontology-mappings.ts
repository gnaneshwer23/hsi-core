import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {verifyOntologyMappings} from '../src/knowledgeGraph/ontologyMapping';
const root=resolve(import.meta.dir,'..'),sha=async(s:string)=>createHash('sha256').update(s).digest('hex');
const file=resolve(root,'research/ontology/mappings.v1.json');
if(!existsSync(file)){console.error('research/ontology/mappings.v1.json is missing');process.exit(1)}
const graph=JSON.parse(readFileSync(resolve(root,'research/domain-graph/graph.v1.json'),'utf8')),input=JSON.parse(readFileSync(file,'utf8'));
const errors=await verifyOntologyMappings(input,graph,sha);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
const m=input.mappings as {reviewStatus:string}[];
console.log(JSON.stringify({mappings:m.length,candidate:m.filter(x=>x.reviewStatus==='candidate').length,reviewed:m.filter(x=>x.reviewStatus==='reviewed').length,rejected:m.filter(x=>x.reviewStatus==='rejected').length,note:'Identifier syntax and structure are verified. Equivalence is never assumed and not judged here.'}));
