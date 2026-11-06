/** Finite sample-only community state machine. Not a classifier, account system or live publishing API. */
import {canonicalEvidenceJson} from '../evidence/researchEvidenceCorpus';
export const COMMUNITY_SAMPLES={
 research_question:{text:'Which study designs could distinguish immune association from causal mechanism?',risk:'low',disposition:'visible',reasons:['sample_research_question']},
 methodological_reply:{text:'Compare population, tissue, assay and timepoint before interpreting the reported association.',risk:'low',disposition:'visible',reasons:['sample_methods_discussion']},
 unsupported_causality:{text:'This paper proves IL-6 causes diabetes.',risk:'medium',disposition:'queued',reasons:['unsupported_causal_certainty','curator_review_required']},
 medical_advice:{text:'I have chest pain, what should I take?',risk:'high',disposition:'held',reasons:['personal_medical_advice_request','clinical_safety_escalation_rehearsal']},
 privacy_canary:{text:'PATIENT_IDENTIFIER_CANARY — artificial privacy-control test; no actual person data.',risk:'high',disposition:'held',reasons:['privacy_canary_fixture','privacy_escalation_rehearsal']},
 harassment_canary:{text:'HARASSMENT_CANARY — artificial moderation-control sample.',risk:'high',disposition:'held',reasons:['conduct_canary_fixture','moderator_escalation_rehearsal']}
} as const;
export type CommunitySample=keyof typeof COMMUNITY_SAMPLES;
export const REHEARSAL_ACTORS={member_a:{label:'Simulated member A',groups:['alpha'],role:'member'},member_b:{label:'Simulated member B',groups:['beta'],role:'member'},member_c:{label:'Simulated member C',groups:['alpha'],role:'member'},moderator:{label:'Simulated moderator',groups:['alpha','beta'],role:'moderator'},visitor:{label:'Simulated visitor',groups:[],role:'visitor'}} as const;
export type RehearsalActor=keyof typeof REHEARSAL_ACTORS;
export const SAMPLE_EVIDENCE_REFS=['pmid:18375541','pmid:24586782','pmid:30760472','pmid:29514998','pmid:33175976'] as const;
type State='visible'|'queued'|'held'|'needs_edit'|'removed';
export type RehearsalPost={id:string;group:'alpha'|'beta';author:RehearsalActor;sample:CommunitySample;evidenceRef:string;parentId:string|null;revisionOf:string|null;state:State;appeal:'none'|'open'|'rejected'|'review_requested'};
export type CommunityCommand={id:string;actor:RehearsalActor;group:'alpha'|'beta';action:'post'|'reply'|'revise'|'report'|'allow'|'request_edit'|'hide'|'remove'|'escalate'|'appeal'|'accept_appeal'|'reject_appeal'|'send_to_curation'|'warn'|'mute'|'ban';sample?:CommunitySample;evidenceRef?:string;postId?:string};
export type CommunityRehearsal={schemaVersion:'hsi-community-rehearsal-1';posts:RehearsalPost[];audit:{sequence:number;occurredAt:string;policyVersion:'hsi-community-samples-1';reasonCodes:string[];command:CommunityCommand;result:string}[];violations:Partial<Record<RehearsalActor,number>>;restrictions:Partial<Record<RehearsalActor,'warned'|'muted'|'banned'>>;requests:Record<string,string>;livePublishing:false;operationalAudit:false};
export function emptyCommunityRehearsal():CommunityRehearsal{return {schemaVersion:'hsi-community-rehearsal-1',posts:[],audit:[],violations:{},restrictions:{},requests:{},livePublishing:false,operationalAudit:false}}
function actor(id:RehearsalActor){if(!Object.hasOwn(REHEARSAL_ACTORS,id))throw Error('Unknown rehearsal identity');return REHEARSAL_ACTORS[id]}
function membership(id:RehearsalActor,group:string){if(!['alpha','beta'].includes(group)||!(actor(id).groups as readonly string[]).includes(group))throw Error('Rehearsal group access denied')}
export function readCommunityRehearsal(board:CommunityRehearsal,id:RehearsalActor,group:'alpha'|'beta'){
 membership(id,group);const role=actor(id).role;
 const readable=(p:RehearsalPost,seen=new Set<string>()):boolean=>{if(seen.has(p.id))return false;seen.add(p.id);if(p.group!==group||p.state!=='visible')return false;const parent=p.parentId?board.posts.find(x=>x.id===p.parentId):null;return !p.parentId||!!parent&&readable(parent,seen)};
 return board.posts.filter(p=>p.group===group&&(role==='moderator'||p.author===id||readable(p))).filter(p=>role==='moderator'||p.author===id||p.state==='visible');
}
export function applyCommunityCommand(board:CommunityRehearsal,command:CommunityCommand,enabled:boolean,killSwitch:boolean):CommunityRehearsal{
 if(enabled!==true||killSwitch!==false)throw Error('Community rehearsal is disabled');
 if(board.schemaVersion!=='hsi-community-rehearsal-1'||board.livePublishing!==false||board.operationalAudit!==false||board.audit.length>=500)throw Error('Invalid or full rehearsal');
 const allowed=['id','actor','group','action','sample','evidenceRef','postId'];if(Object.keys(command).some(k=>!allowed.includes(k))||!/^[a-z0-9-]{1,90}$/.test(command.id))throw Error('Invalid command or claimed authority');
 membership(command.actor,command.group);const role=actor(command.actor).role,key=canonicalEvidenceJson(command),prior=Object.hasOwn(board.requests,command.id)?board.requests[command.id]:undefined;
 if(prior){if(prior!==key)throw Error('Request ID conflict');return board}
 const next=structuredClone(board),post=next.posts.find(p=>p.id===command.postId&&p.group===command.group);let result='';
 if(command.action==='post'||command.action==='reply'||command.action==='revise'){
  if(role!=='member'||['muted','banned'].includes(next.restrictions[command.actor]??''))throw Error('Posting restricted in rehearsal');
  if(!command.sample||!Object.hasOwn(COMMUNITY_SAMPLES,command.sample)||!SAMPLE_EVIDENCE_REFS.includes(command.evidenceRef as typeof SAMPLE_EVIDENCE_REFS[number])||next.posts.length>=200)throw Error('Only registered sample text and evidence references are accepted');
  if(command.action==='reply'&&(!post||post.state!=='visible'||!readCommunityRehearsal(board,command.actor,command.group).some(p=>p.id===post.id)))throw Error('Reply target unavailable');
  if(command.action==='revise'&&(!post||post.author!==command.actor||!['queued','held','needs_edit'].includes(post.state)))throw Error('Revision unavailable');
  if(command.action==='revise'&&post?.parentId&&!next.posts.some(p=>p.id===post.parentId&&p.state==='visible'))throw Error('Revision parent unavailable');
  const sample=COMMUNITY_SAMPLES[command.sample];next.posts.push({id:'rehearsal-post-'+(next.posts.length+1),group:command.group,author:command.actor,sample:command.sample,evidenceRef:command.evidenceRef!,parentId:command.action==='reply'?post!.id:command.action==='revise'?post!.parentId:null,revisionOf:command.action==='revise'?post!.id:null,state:sample.disposition,appeal:'none'});
  if(sample.risk!=='low')next.violations[command.actor]=(next.violations[command.actor]??0)+1;
  const violations=next.violations[command.actor]??0;if(violations>=5)next.restrictions[command.actor]='muted';else if(violations>=3)next.restrictions[command.actor]='warned';result=sample.disposition+(violations>=5?':simulated_mute':violations>=3?':simulated_warning':'');
 }else{
  if(!post)throw Error('Post outside rehearsal scope');
  if(command.action==='appeal'){
   if(post.author!==command.actor||!['held','needs_edit','removed'].includes(post.state)||post.appeal==='open')throw Error('Appeal unavailable');post.appeal='open';result='appeal_opened';
  }else if(command.action==='report'){
   if(role!=='member'||!readCommunityRehearsal(board,command.actor,command.group).some(p=>p.id===post.id)||post.state!=='visible')throw Error('Report target unavailable');post.state='held';result='reported_to_local_queue';
  }else{
   if(role!=='moderator'||post.author===command.actor)throw Error('Independent simulated moderator required');
   if(command.action==='warn'&&['muted','banned'].includes(next.restrictions[post.author]??'')||command.action==='mute'&&next.restrictions[post.author]==='banned')throw Error('Restriction cannot be silently downgraded');
   switch(command.action){
    case 'allow':if(COMMUNITY_SAMPLES[post.sample].risk!=='low')throw Error('Risky sample requires edit; it cannot be allowed unchanged');post.state='visible';result='allowed_in_rehearsal';break;
    case 'request_edit':post.state='needs_edit';result='edit_requested';break;
    case 'hide':post.state='held';result='temporarily_hidden';break;
    case 'remove':post.state='removed';result='removed_with_history_retained';break;
    case 'escalate':post.state='held';result='escalation_recorded_locally_no_notification_sent';break;
    case 'accept_appeal':if(post.appeal!=='open')throw Error('Open appeal required');post.appeal='review_requested';post.state='queued';result='appeal_returned_to_review_not_published';break;
    case 'reject_appeal':if(post.appeal!=='open')throw Error('Open appeal required');post.appeal='rejected';result='appeal_rejected';break;
    case 'warn':next.restrictions[post.author]='warned';result='author_warned_in_rehearsal';break;
    case 'mute':next.restrictions[post.author]='muted';result='author_muted_in_rehearsal';break;
    case 'ban':next.restrictions[post.author]='banned';result='author_banned_in_rehearsal';break;
    case 'send_to_curation':if(COMMUNITY_SAMPLES[post.sample].risk==='high')throw Error('High-risk content cannot enter curation');result='curation_handoff_only_no_graph_publication';break;
    default:throw Error('Unknown rehearsal action');
   }
  }
 }
 next.audit.push({sequence:next.audit.length+1,occurredAt:new Date().toISOString(),policyVersion:'hsi-community-samples-1',reasonCodes:command.action==='post'||command.action==='reply'||command.action==='revise'?[...COMMUNITY_SAMPLES[command.sample!].reasons]:[command.action+'_sample_policy'],command:structuredClone(command),result});next.requests[command.id]=key;return next;
}
