import {test,expect} from 'bun:test';
import {createHash} from 'node:crypto';
import {canonicalEvidenceJson} from '../src/evidence/researchEvidenceCorpus';
import {createGraphCurationPacket} from '../src/knowledgeGraph/evidencePreparation';
import {createGraphContextBriefService,renderGraphContextBrief,validateGraphContextBrief} from '../src/knowledgeGraph/contextBrief';
import {graphBriefFixture as fixture} from './fixtures/graphContextBrief';
test('prepared passages compose the existing five-class report without inventing search, verification or review',async()=>{
 const i=await fixture();let calls=0;const service=createGraphContextBriefService({enabled:true,clearance:{authorize:async()=>{calls++;return true}}});
 const b=await service.create(i);expect(calls).toBe(2);expect(b.report[0]!.classification).toBe('potential_conflict');expect(b.scientificApproval).toBe(false);expect(b.graphPromotable).toBe(false);expect(b.searchStatus).toBe('not_executed');expect(b.verifierStatus).toBe('not_executed');
 expect(b.units[0]!.label).toBe(i.passages[0]!.passage.text.slice(0,13));expect(JSON.parse(renderGraphContextBrief(b,'json')).briefHash).toBe(b.briefHash);expect(renderGraphContextBrief(b,'markdown')).toContain('independent verification and human review have not occurred');
 const next=await service.create({...i,previous:b});expect(next.version).toBe(2);expect(next.parentBriefHash).toBe(b.briefHash);expect(b.version).toBe(1);expect(next.briefHash).not.toBe(b.briefHash);expect(calls).toBe(4);
});
test('all finding spans and previous binding validate before authority calls',async()=>{
 for(const mutate of [(i:Awaited<ReturnType<typeof fixture>>)=>{i.findings[1]!.end=99999},(i:Awaited<ReturnType<typeof fixture>>)=>{i.findings[1]!.edgeId=i.findings[0]!.edgeId}]){
  const i=await fixture();let calls=0;mutate(i);await expect(createGraphContextBriefService({enabled:true,clearance:{authorize:async()=>{calls++;return true}}}).create(i)).rejects.toThrow();expect(calls).toBe(0);
 }
 const i=await fixture(),service=createGraphContextBriefService({enabled:true,clearance:{authorize:async()=>true}}),b=await service.create(i);
 await expect(service.create({...i,question:'Another question',previous:b})).rejects.toThrow('another investigation');b.question='tampered';expect(()=>validateGraphContextBrief(b)).toThrow();
});
test('revoked clearance on a rerun denies output and missing context cannot be called consistent',async()=>{
 const i=await fixture();let revoked=false;const service=createGraphContextBriefService({enabled:true,clearance:{authorize:async()=>!revoked}});
 delete i.passages[1]!.extractions.dose;i.findings[1]!.polarity='supporting';const b=await service.create(i);expect(b.report[0]!.classification).toBe('insufficient_evidence');expect(b.gaps).toContain(i.findings[1]!.edgeId+': dose unresolved');
 revoked=true;await expect(service.create({...i,previous:b})).rejects.toThrow('authorized');
 await expect(service.export(i,'markdown')).rejects.toThrow('authorized');
 await expect(createGraphContextBriefService({clearance:{authorize:async()=>true}}).create(i)).rejects.toThrow('disabled');
});
test('exports recheck current permissions and escape curator text without executing it',async()=>{
 const i=await fixture();let calls=0;const service=createGraphContextBriefService({enabled:true,clearance:{authorize:async()=>{calls++;return true}}});
 i.question='Synthetic <script>alert(1)</script> question';
 const md=await service.export(i,'markdown');expect(md).not.toContain('<script>');expect(md).toContain('&#60;script');expect(calls).toBe(2);
 await service.export(i,'json');expect(calls).toBe(4);
});
test('different snapshot entity pairs stay incomparable even with identical extracted context',async()=>{
 const i=await fixture(),edge=i.bundle.edges.find(e=>e.id===i.findings[1]!.edgeId)!;
 edge.objectId=i.bundle.nodes.find(n=>n.id!==edge.subjectId&&n.id!==edge.objectId)!.id;
 const {version,...body}=i.bundle;i.bundle.version=createHash('sha256').update(canonicalEvidenceJson(body)).digest('hex');
 i.packet=await createGraphCurationPacket(i.bundle,i.findings.map(f=>f.edgeId));
 const b=await createGraphContextBriefService({enabled:true,clearance:{authorize:async()=>true}}).create(i);
 expect(b.report[0]!.classification).toBe('insufficient_evidence');expect(b.comparisons[0]!.trace.sharedSubjectObject).toBe(false);
});
