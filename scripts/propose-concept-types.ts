import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {canonicalTypingText,proposeConceptTypes,RULES_VERSION,TYPING_RULES,verifyTypingProposals,type TypingProposalFile} from '../src/knowledgeGraph/conceptTyping';
const root=resolve(import.meta.dir,'..'),sha=async(s:string)=>createHash('sha256').update(s).digest('hex');
const graph=JSON.parse(readFileSync(resolve(root,'research/domain-graph/graph.v1.json'),'utf8'));
const body={schemaVersion:'hsi-concept-typing-1' as const,mappedAgainst:graph.version as string,rulesVersion:RULES_VERSION,proposals:proposeConceptTypes(graph.nodes)};
const file:TypingProposalFile={...body,digest:await sha(canonicalTypingText(body))};
const errors=await verifyTypingProposals(file,graph,sha);if(errors.length){console.error(errors.join('\n'));process.exit(1)}
writeFileSync(resolve(root,'research/ontology/concept-types.v1.json'),JSON.stringify(file,null,2)+'\n');
const attention=file.proposals.filter(p=>p.alternatives.length||p.proposedType==='unclassified');
const byType=new Map<string,typeof file.proposals>();for(const p of file.proposals)byType.set(p.proposedType,[...(byType.get(p.proposedType)??[]),p]);
const row=(p:typeof file.proposals[number])=>`| ${p.name} | ${p.ruleId??'none'} | ${p.alternatives.map(a=>a.type.replaceAll('_',' ')+' ('+a.ruleId+')').join(', ')||'-'} |`;
const md=[
 '# KG-02 slice 2: proposed entity types for review','',
 `Generated from graph version ${graph.version.slice(0,8)} by \`bun run ontology:types\` (rules ${RULES_VERSION}). **Proposals only.** Nothing here is applied to the graph, the types are not calibrated, and every row needs a person to accept, change or reject it. A reviewer who is the owner is an interim reviewer, not an independent one.`,'',
 `${file.proposals.length} concepts are typed only as "biological concept" in the graph. ${attention.length} need particular care: their name matches rules for more than one type, or no rule.`,'',
 '## Needs particular care','','| Concept | Rule used | Other types that also matched |','|---|---|---|',...attention.map(row),'',
 '## All proposals by type','',
 ...[...byType].sort((a,b)=>a[0].localeCompare(b[0])).flatMap(([t,ps])=>[`### ${t.replaceAll('_',' ')} (${ps.length})`,'','| Concept | Rule used | Other types that also matched |','|---|---|---|',...ps.map(row),'']),
 '## Rules (first match decides)','','| Rule | Type | Meaning |','|---|---|---|',...TYPING_RULES.map(r=>`| ${r.id} | ${r.type.replaceAll('_',' ')} | ${r.reason} |`),'',
].join('\n');
writeFileSync(resolve(root,'docs/architecture/KG-02_CONCEPT_TYPE_REVIEW.md'),md+'\n');
console.log(JSON.stringify({proposals:file.proposals.length,needCare:attention.length,unclassified:file.proposals.filter(p=>p.proposedType==='unclassified').length}));
