/** Deployment-independent rehearsal policy. No caller flag or claimed role enables a live product. */
export const CAPABILITIES=['synthetic_longitudinal','live_patient','community_publishing','graph_promotion'] as const;
export type Capability=typeof CAPABILITIES[number];
export type CapabilityFlags=Record<Capability,boolean>;
export const DEFAULT_CAPABILITY_FLAGS:CapabilityFlags={synthetic_longitudinal:false,live_patient:false,community_publishing:false,graph_promotion:false};
export const CAPABILITY_REGISTRY=CAPABILITIES.map(id=>({id,ownerRef:null,releaseState:id==='live_patient'?'excluded_by_current_boundary':'internal_prototype',defaultEnabled:false,rolloutAudience:'local_rehearsal_only',rollback:'Disable local switch, stop new actions and clear the rehearsal; no published data exists.'}));
export function assessCapability(id:Capability,input:{flags:CapabilityFlags;killSwitch:boolean;environment:'local_rehearsal'|'staging'|'production'}){
 if(!CAPABILITIES.includes(id)||!input.flags||CAPABILITIES.some(k=>typeof input.flags[k]!=='boolean')||typeof input.killSwitch!=='boolean'||!['local_rehearsal','staging','production'].includes(input.environment))throw Error('Invalid capability policy input');
 const reasons:string[]=[];if(id==='live_patient')reasons.push('live_phi_and_cds_excluded');if(input.killSwitch)reasons.push('kill_switch_active');if(!input.flags[id])reasons.push('default_off_or_disabled');if(input.environment!=='local_rehearsal')reasons.push('deployed_rollout_not_authorised');
 return {id,enabled:reasons.length===0,reasons,mode:'local_rehearsal_only' as const,livePublicationAllowed:false,livePatientProcessingAllowed:false,scientificApprovalGranted:false};
}
