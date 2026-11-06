import {test,expect} from 'bun:test';
import {assessCapability,DEFAULT_CAPABILITY_FLAGS,CAPABILITIES} from '../src/capabilities/governance';
import {generateScenarioPack,verifyScenarioPack,scenarioQuality,buildScenarioResearchBrief} from '../src/capabilities/longitudinal';
import {emptyCommunityRehearsal,applyCommunityCommand,readCommunityRehearsal,type CommunityCommand} from '../src/capabilities/communityRehearsal';
import {assessShadowPromotion,SHADOW_CASES} from '../src/capabilities/shadowPromotion';
const command=(id:string,extra:Partial<CommunityCommand>={}):CommunityCommand=>({id,actor:'member_a',group:'alpha',action:'post',sample:'research_question',evidenceRef:'pmid:18375541',...extra});
const apply=(board:ReturnType<typeof emptyCommunityRehearsal>,cmd:CommunityCommand)=>applyCommunityCommand(board,cmd,true,false);
test('all capabilities default off, production stays denied and live patient scope cannot be enabled',()=>{
 for(const id of CAPABILITIES){expect(assessCapability(id,{flags:DEFAULT_CAPABILITY_FLAGS,killSwitch:false,environment:'local_rehearsal'}).enabled).toBe(false);expect(assessCapability(id,{flags:{synthetic_longitudinal:true,live_patient:true,community_publishing:true,graph_promotion:true},killSwitch:false,environment:'production'}).enabled).toBe(false)}
 expect(assessCapability('live_patient',{flags:{...DEFAULT_CAPABILITY_FLAGS,live_patient:true},killSwitch:false,environment:'local_rehearsal'}).enabled).toBe(false);
 expect(assessCapability('synthetic_longitudinal',{flags:{...DEFAULT_CAPABILITY_FLAGS,synthetic_longitudinal:true},killSwitch:true,environment:'local_rehearsal'}).enabled).toBe(false);
});
test('five 24-month cohorts are deterministic, explicitly synthetic and reproducible',()=>{
 const pack=generateScenarioPack(482913,3);expect(verifyScenarioPack(pack)).toEqual(generateScenarioPack(482913,3));expect(pack.patients).toHaveLength(15);expect(scenarioQuality(pack).visits).toBe(135);
 for(const p of pack.patients){expect(p.id).toMatch(/^SYN-CAP-/);expect(p.scientific_claim_allowed).toBe(false);expect(p.events.every(e=>e.data_class==='synthetic'&&!e.scientific_claim_allowed&&e.patientId===p.id)).toBe(true);expect(p.events.map(e=>e.timestamp)).toEqual(p.events.map(e=>e.timestamp).sort());expect(p.events.filter(e=>e.type==='encounter')).toHaveLength(9)}
 const forged=structuredClone(pack);(forged.patients[0] as any).data_class='real';expect(()=>verifyScenarioPack(forged)).toThrow();
 for(const config of [[0,2],[NaN,2],[123,251],[123,0]])expect(()=>generateScenarioPack(config[0],config[1])).toThrow();
});
test('lab units, rounded flags, derived HOMA values, control ranges and missingness remain coherent',()=>{
 const pack=generateScenarioPack(19,20),quality=scenarioQuality(pack);expect(quality.missingWearableProfiles).toBeGreaterThan(0);expect(quality.missingMicrobiomeProfiles).toBeGreaterThan(0);expect(quality.missingImmuneProfiles).toBeGreaterThan(0);
 for(const p of pack.patients)for(let visit=0;visit<=8;visit++){
  const labs=p.events.filter(e=>e.type==='lab_result'&&e.visit===visit).map(e=>e.values),hb=labs.find(l=>l.test==='HbA1c')!,crp=labs.find(l=>l.test==='hs-CRP')!;expect(hb.unit).toBe('%');expect(crp.unit).toBe('mg/L');
  const insulin=labs.find(l=>l.test==='Insulin')!,glucose=labs.find(l=>l.test==='Fasting glucose')!,homa=labs.find(l=>l.test==='HOMA-IR')!;expect(Math.abs(Number(homa.value)-Number(insulin.value)*Number(glucose.value)/22.5)).toBeLessThan(.02);
  for(const l of labs){expect(l.flag).toBe(Number(l.value)<Number(l.reference_low)?'below_fixture_range':Number(l.value)>Number(l.reference_high)?'above_fixture_range':'within_fixture_range');if(p.cohort==='healthy_control')expect(l.flag).toBe('within_fixture_range')}
 }
});
test('community accepts only registered samples, isolates groups, and binds retries to the original action',()=>{
 const empty=emptyCommunityRehearsal(),first=apply(empty,command('first'));expect(empty.posts).toHaveLength(0);expect(first.posts[0]?.state).toBe('visible');expect(apply(first,command('first'))).toBe(first);expect(()=>apply(first,command('first',{sample:'medical_advice'}))).toThrow('conflict');
 expect(()=>readCommunityRehearsal(first,'member_b','alpha')).toThrow();expect(()=>apply(first,command('role',{roles:['moderator']} as any))).toThrow();expect(()=>apply(first,command('raw',{body:'unapproved user text'} as any))).toThrow();expect(()=>apply(first,command('evidence',{evidenceRef:'invented-source'}))).toThrow();
 expect(()=>applyCommunityCommand(first,command('off'),false,false)).toThrow();expect(()=>applyCommunityCommand(first,command('kill'),true,true)).toThrow();
});
test('moderation holds risk, preserves revisions and keeps appeals from publishing unchanged risky content',()=>{
 let b=apply(emptyCommunityRehearsal(),command('risky',{sample:'unsupported_causality'}));expect(b.posts[0]?.state).toBe('queued');
 b=apply(b,command('edit',{actor:'moderator',action:'request_edit',postId:b.posts[0]!.id}));b=apply(b,command('revised',{action:'revise',postId:b.posts[0]!.id,sample:'methodological_reply'}));expect(b.posts[1]?.revisionOf).toBe(b.posts[0]!.id);expect(b.posts[0]?.state).toBe('needs_edit');expect(b.posts[1]?.state).toBe('visible');
 b=apply(b,command('private',{sample:'privacy_canary'}));const id=b.posts[2]!.id;expect(()=>apply(b,command('allow',{actor:'moderator',action:'allow',postId:id}))).toThrow();
 b=apply(b,command('appeal',{action:'appeal',postId:id}));b=apply(b,command('accept',{actor:'moderator',action:'accept_appeal',postId:id}));expect(b.posts[2]?.state).toBe('queued');expect(b.livePublishing).toBe(false);expect(b.audit).toHaveLength(6);
});
test('hidden thread parents do not expose replies to other members and moderator actions require a separate role',()=>{
 let b=apply(emptyCommunityRehearsal(),command('parent'));const parent=b.posts[0]!.id;b=apply(b,command('reply',{actor:'member_c',action:'reply',postId:parent,sample:'methodological_reply'}));
 expect(()=>apply(b,command('forge',{actor:'member_a',action:'remove',postId:parent}))).toThrow();b=apply(b,command('hide',{actor:'moderator',action:'hide',postId:parent}));expect(readCommunityRehearsal(b,'member_a','alpha').map(p=>p.id)).toEqual([parent]);expect(readCommunityRehearsal(b,'moderator','alpha')).toHaveLength(2);
});
test('repeated samples trigger warning and mute; a moderator can ban without erasing history',()=>{
 let b=emptyCommunityRehearsal();for(let i=0;i<5;i++)b=apply(b,command('strike-'+i,{sample:'harassment_canary'}));expect(b.restrictions.member_a).toBe('muted');expect(()=>apply(b,command('again'))).toThrow();b=apply(b,command('ban',{actor:'moderator',action:'ban',postId:b.posts[0]!.id}));expect(b.restrictions.member_a).toBe('banned');expect(()=>apply(b,command('warn',{actor:'moderator',action:'warn',postId:b.posts[0]!.id}))).toThrow();expect(b.audit).toHaveLength(6);
});
test('even an all-pass shadow fixture only recommends review and never grants production or canary access',()=>{
 const result=assessShadowPromotion(SHADOW_CASES.all_thresholds_pass!,true,false);expect(result.state).toBe('recommend_independent_review');expect(result.productionAllowed).toBe(false);expect(result.canaryAllowed).toBe(false);expect(result.observationsAuthenticated).toBe(false);expect(result.graphMutationPerformed).toBe(false);
 const synthetic=assessShadowPromotion({...SHADOW_CASES.all_thresholds_pass!,synthetic:true},true,false);expect(synthetic.state).toBe('blocked');expect(synthetic.reasons).toContain('synthetic_is_never_scientific_evidence');
 for(const key of ['retracted','humanRejected','unresolvedConflict'] as const)expect(assessShadowPromotion({...SHADOW_CASES.all_thresholds_pass!,[key]:true},true,false).state).toBe('quarantined');
 expect(assessShadowPromotion(SHADOW_CASES.all_thresholds_pass!,true,true).state).toBe('disabled');expect(()=>assessShadowPromotion({...SHADOW_CASES.all_thresholds_pass!,claimSupport:NaN},true,false)).toThrow();
});

test('synthetic research briefs cite generated event IDs and never create supporting evidence or clinical conclusions',()=>{const p=generateScenarioPack(482913,2),b=buildScenarioResearchBrief(p,p.patients[0]!.id);expect(b.evidence).toEqual([]);expect(b.graphPromotable).toBe(false);expect(b.scientificApprovalGranted).toBe(false);expect(b.trialEligibility).toBe('never_confirmed');expect(b.observations.every(o=>p.patients[0]!.events.some(e=>e.id===o.eventId&&e.values.value===o.value))).toBe(true);expect(()=>buildScenarioResearchBrief(p,'real-patient')).toThrow()});
