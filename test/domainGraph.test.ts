import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildDomainGraph,repositoryModel} from '../src/knowledgeGraph/buildDomainGraph';
import {parseDomainBundle,verifyDomainBundle,filterDomainGraph,domainPaths,exportDomainBrief,compareDomainEvidence,renderDomainBrief} from '../src/knowledgeGraph/domainGraph';
import {selectValidationCohort,importPublicStudies,assessCohortStudyOverlap} from '../src/knowledgeGraph/cohortTrials';
const load=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const graph=load('research/domain-graph/graph.v1.json');const digest=async(s:string)=>createHash('sha256').update(s).digest('hex');
const name=(name:string)=>graph.nodes.find((n:any)=>n.name===name)!.id;
const study=(conditions=['Diabetes Mellitus, Type 1'])=>({protocolSection:{identificationModule:{nctId:'NCT01030861',briefTitle:'Test registry metadata; not a clinical trial identity verification'},conditionsModule:{conditions},statusModule:{overallStatus:'COMPLETED',lastUpdatePostDateStruct:{date:'2020-01-01'}},eligibilityModule:{minimumAge:'8 Years',maximumAge:'45 Years',eligibilityCriteria:'Test-only criteria: investigator assessment and independent source verification required.'}}});
test('cross-domain snapshot verifies, stays non-promotable and binds all source/gap endpoints',async()=>{
 expect(await verifyDomainBundle(graph,digest,graph.version)).toEqual(graph);expect(graph.nodes.length).toBeGreaterThan(100);expect(graph.edges.length).toBeGreaterThan(100);expect(graph.sources.filter((s:any)=>s.identityStatus==='bibliographic_candidate_not_retrieved')).toHaveLength(12);
 expect(graph.scientificApproval).toBe(false);expect(graph.edges.every((e:any)=>e.reviewStatus==='unreviewed'&&e.confidence==='not_calibrated'&&!e.scientificClaimAllowed)).toBe(true);
 expect(graph.validationProfiles).toHaveLength(200);expect(new Set(graph.validationProfiles.map((p:any)=>p.condition)).size).toBe(20);
});
test('new bibliographic candidates never manufacture quotations, retrieval dates or licence clearance',()=>{
 for(const s of graph.sources.filter((s:any)=>s.identityStatus==='bibliographic_candidate_not_retrieved')){expect(s.passages.every((p:any)=>p.text===null)).toBe(true);expect(s.retrievedAt).toBeNull();expect(s.rights).toBe('unverified')}
 const tamper=structuredClone(graph);tamper.sources.find((s:any)=>s.identityStatus==='bibliographic_candidate_not_retrieved').passages[0].text='Invented exact quotation';expect(()=>parseDomainBundle(tamper)).toThrow();
});
test('a related RA source is quarantined instead of becoming diabetes mechanism evidence',()=>{
 for(const id of ['HSI-C-IM-002','HSI-C-IM-003','HSI-C-IM-005','HSI-C-IM-006','HSI-C-IM-010']){const e=graph.edges.find((e:any)=>e.id===id)!;expect(e.kind).toBe('research_gap');expect(e.scopeWarnings.join(' ')).toContain('not this diabetes-specific assertion')}
 const p=domainPaths(graph,name('TNF-α'),name('Insulin resistance'));expect(p.some(p=>p.edgeIds.includes('HSI-C-IM-002'))).toBe(false);expect(p.some(p=>p.edgeIds.includes('DIAB-012'))).toBe(true);
});
test('human-derived bacteria tested in mice and ex-vivo human cells are never human participant evidence',()=>{
 expect(repositoryModel('HSI-C-GUT-002','Human-derived strains tested in mice')).toBe('mouse');expect(repositoryModel('HSI-C-GUT-007','Caco-2')).toBe('human_cell_line');expect(repositoryModel('HSI-C-GUT-009','Human DC')).toBe('human_ex_vivo');
 const human=filterDomainGraph(graph,{model:'human_in_vivo'});expect(human.edges.length).toBeGreaterThan(0);expect(human.edges.every(e=>e.model==='human_in_vivo')).toBe(true);expect(human.edges.some(e=>['HSI-C-GUT-002','HSI-C-GUT-009','DIAB-002'].includes(e.id))).toBe(false);
});
test('directed paths preserve model context and never complete an explanation with a gap',()=>{
 const from=name('Butyrate'),regulatory=name('IL-10+ type-1 regulatory T cells (Tr1-like)');const paths=domainPaths(graph,from,regulatory);expect(paths.some(p=>p.edgeIds.includes('DIAB-016')&&p.edgeIds.includes('DIAB-017'))).toBe(true);
 expect(domainPaths(graph,from,name('Insulin resistance')).some(p=>p.edgeIds.includes('gap:treg-insulin'))).toBe(false);
 expect(paths.every(p=>p.causalConclusionAllowed===false)).toBe(true);expect(()=>domainPaths(graph,from,regulatory,99)).toThrow();
 const t1=domainPaths(graph,name('Microbial acetate and butyrate'),name('Type 1 diabetes'));expect(t1[0]!.warnings.join(' ')).toContain('animal');
});
test('source-only filters cannot silently expose gap links as support and keep endpoint integrity',()=>{
 const f=filterDomainGraph(graph,{includeGaps:false});expect(f.edges.every(e=>e.kind==='source_candidate')).toBe(true);expect(f.edges.every(e=>f.nodes.some(n=>n.id===e.subjectId)&&f.nodes.some(n=>n.id===e.objectId))).toBe(true);
 expect(filterDomainGraph(graph,{query:'Butyrate'}).nodes.some(n=>n.name==='Colonic / mucosal Foxp3+ Treg')).toBe(true);
});
test('source hashes, extra private fields and scientific promotion flags fail closed',async()=>{
 const changed=structuredClone(graph);changed.nodes[0].name='Tampered';await expect(verifyDomainBundle(changed,digest)).rejects.toThrow();
 for(const change of [(g:any)=>g.scientificApproval=true,(g:any)=>g.edges[0].confidence=.9,(g:any)=>g.edges[0].scientificClaimAllowed=true,(g:any)=>g.validationProfiles[0].patientName='Private record',(g:any)=>g.edges[0].sourceId='not-in-snapshot']){const g=structuredClone(graph);change(g);expect(()=>parseDomainBundle(g)).toThrow()}
 await expect(verifyDomainBundle(graph,digest,'f'.repeat(64))).rejects.toThrow();
});
test('brief exports retain source candidates, gaps and falsification without clinical or AI-runtime claims',()=>{
 const brief=exportDomainBrief(graph,'gut-t1d',{model:'human_in_vivo',includeGaps:false});expect(brief.evidence.every(e=>e.model==='human_in_vivo')).toBe(true);expect(brief.summaryMethod).toBe('editorial_template_not_live_llm');expect(brief.gaps.some(g=>g.id==='gap:islet-specificity')).toBe(true);expect(brief.scientificApproval).toBe(false);expect(brief.trialEligibilityConfirmed).toBe(false);expect(brief.hypothesis.falsification).not.toBe('');
});
test('cohort finding uses latest HbA1c and AND filters without mixing type 1 and type 2',()=>{
 const query={condition:'Type 1 diabetes',minAge:0,maxAge:120,minHba1c:null,medication:''};const t1=selectValidationCohort(graph.validationProfiles,query);expect(t1.summary.count).toBe(10);expect(t1.members.every(p=>p.condition==='Type 1 diabetes')).toBe(true);
 const t2=selectValidationCohort(graph.validationProfiles,{...query,condition:'Type 2 diabetes',minHba1c:8});expect(t2.members.every(p=>p.condition==='Type 2 diabetes'&&p.lastHba1c!>=8)).toBe(true);
 expect(()=>selectValidationCohort(graph.validationProfiles,{...query,minAge:90,maxAge:20})).toThrow();const unsafe=structuredClone(graph.validationProfiles);unsafe[0].dataClass='real';expect(()=>selectValidationCohort(unsafe,query)).toThrow();
});
test('public registry parsing preserves unverified provenance and rejects malformed or private inputs',()=>{
 const records=importPublicStudies({studies:[study()]});expect(records[0]).toMatchObject({nctId:'NCT01030861',minimumAge:8,maximumAge:45,liveStatusVerified:false,sourceStatus:'operator_uploaded_unverified'});
 for(const unsafe of [{...study(),patient_id:'private'}, {...study(),containsPhi:true},{studies:[study(),study()]},{protocolSection:{...study().protocolSection,identificationModule:{nctId:'NCT-FAKE',briefTitle:'bad'}}}])expect(()=>importPublicStudies(unsafe)).toThrow();
 const month=study();month.protocolSection.eligibilityModule.minimumAge='6 Months';expect(importPublicStudies(month)[0]!.minimumAge).toBe(.5);
});
test('study overlap never confirms eligibility and does not use generic diabetes as exact T1D/T2D overlap',()=>{
 const trial=importPublicStudies(study())[0]!;const t1=graph.validationProfiles.filter((p:any)=>p.condition==='Type 1 diabetes'),t2=graph.validationProfiles.filter((p:any)=>p.condition==='Type 2 diabetes');
 expect(assessCohortStudyOverlap(t1,trial)).toMatchObject({conditionOverlapCount:10,confirmedEligible:false,patientEligibilityAssessed:false});expect(assessCohortStudyOverlap(t2,trial).conditionOverlapCount).toBe(0);
 expect(assessCohortStudyOverlap(t2,importPublicStudies(study(['Diabetes']))[0]!).state).toBe('no_exact_condition_overlap');
 const noAge=importPublicStudies(study())[0]!;noAge.minimumAge=null;noAge.maximumAge=null;expect(assessCohortStudyOverlap(t1,noAge).ageCompatibleCount).toBeNull();
});
test('offline builder is deterministic and retains all cited source inputs',()=>{
 const paths=graph.inputs.map((i:any)=>i.path),raw=paths.map((p:string)=>readFileSync(p,'utf8')),values=raw.map((s:string)=>JSON.parse(s));
 const input={pack:values[0],legacy:values[1],expansion:values[2],patients:values[3],labs:values[4],medications:values[5],inputs:graph.inputs,parentVersion:graph.parentVersion};expect(buildDomainGraph(input)).toEqual(graph);
});

test('context comparisons expose species, compounds and missing assays without declaring contradiction',()=>{
 const c=compareDomainEvidence(graph,'DIAB-003','DIAB-015')!;expect(c.differences.some(x=>x.dimension==='model')).toBe(true);expect(c.sameEntityPair).toBe(false);expect(c.confirmedContradiction).toBe(false);expect(c.pooledEffectAllowed).toBe(false);expect(c.missingContext).toContain('dose');
 expect(compareDomainEvidence(graph,'DIAB-003','DIAB-003')).toBeNull();expect(compareDomainEvidence(graph,'gap:treg-insulin','DIAB-003')).toBeNull();
});
test('Markdown research briefs preserve source identities, uncertainty and falsification',()=>{
 const text=renderDomainBrief(exportDomainBrief(graph,'gut-t1d',{}));expect(text).toContain('# HSI Research Brief');expect(text).toContain(graph.version);expect(text).toContain('bibliographic_candidate_not_retrieved');expect(text).toContain('Falsification:');expect(text).toContain('does not confirm eligibility');
});

test('research brief exports omit free-text search but preserve explicit selected record identities',()=>{
 const brief=exportDomainBrief(graph,'gut-t2d',{query:'Butyrate'});expect(brief.filters).not.toHaveProperty('query');expect(brief.freeTextQueryRetained).toBe(false);expect(brief.selection.edgeIds.length).toBeGreaterThan(0);
});

test('negated human translation disclaimers never turn preclinical or unknown records into participant evidence',()=>{
 for(const id of ['HSI-C-GUT-005','HSI-C-GUT-006','HSI-C-GUT-012','HSI-C-NI-013'])expect(repositoryModel(id,'Do not overclaim human therapy; not human clinical evidence')).toBe('unspecified');
 expect(repositoryModel('unmapped','not human clinical evidence')).toBe('unspecified');expect(repositoryModel('unmapped','Mouse model; not human clinical evidence')).toBe('mouse');
});
