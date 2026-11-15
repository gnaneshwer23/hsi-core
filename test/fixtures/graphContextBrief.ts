import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseDomainBundle} from '../../src/knowledgeGraph/domainGraph';
import {canonicalEvidenceJson} from '../../src/evidence/researchEvidenceCorpus';
import {createGraphCurationPacket,type GraphPassageInput} from '../../src/knowledgeGraph/evidencePreparation';
import {type CuratedGraphFinding} from '../../src/knowledgeGraph/contextBrief';
import {contextUnit} from './contextConflictAudit';
export async function graphBriefFixture(){
 const bundle=parseDomainBundle(JSON.parse(readFileSync('research/domain-graph/graph.v1.json','utf8'))),passages:GraphPassageInput[]=[],findings:CuratedGraphFinding[]=[];
 const edges=bundle.edges.filter(e=>e.kind==='source_candidate').slice(0,2);
 Object.assign(edges[1]!,{subjectId:edges[0]!.subjectId,objectId:edges[0]!.objectId,predicate:'associated_with'});edges[0]!.predicate='associated_with';
 for(const [n,e] of edges.entries()){
  const f=contextUnit(n===0?'a':'b');bundle.sources.push({id:f.source.id,title:'Synthetic fixture only',url:'https://pubmed.ncbi.nlm.nih.gov/'+String(123+n)+'/',pmid:String(123+n),doi:null,identityStatus:'bibliographic_candidate_not_retrieved',rights:'unverified',retrievedAt:null,passages:[]});e.sourceId=f.source.id;
  passages.push({edgeId:e.id,source:f.source,passage:f.passage,receipt:{id:'fixture-clearance-'+(n===0?'a':'b'),canonicalId:'PMID:'+String(123+n)},clearanceReceiptId:'fixture-clearance-'+(n===0?'a':'b'),extractions:f.extractions});
  findings.push({edgeId:e.id,start:0,end:13,polarity:n===0?'supporting':'opposing'});
 }
 const {version,...body}=bundle;bundle.version=createHash('sha256').update(canonicalEvidenceJson(body)).digest('hex');
 return {investigationId:'fixture-investigation',question:'Synthetic engineering question only',bundle,packet:await createGraphCurationPacket(bundle,edges.map(e=>e.id)),passages,findings};
}
