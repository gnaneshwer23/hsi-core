/** P2 server-only composition of existing saved-attachment authority with current versioned re-review state. */
import type {OutcomeAttachmentResolver,StoredOutcomeAttachments} from "../server/boundOutcomeAttachments";
import type {TrustedResearchActor} from "../db/researchInvestigationStore";
import type {ReviewPackage} from "../investigationDelivery";
export function protectOutcomeAttachmentsWithRereview(base:OutcomeAttachmentResolver,deps:{
 organization:(actor:Readonly<TrustedResearchActor>,p:Readonly<ReviewPackage>)=>Promise<string|null>;
 /** Independently stored dependency registry, not browser-provided hashes. */
 artifactHashes:(actor:Readonly<TrustedResearchActor>,p:Readonly<ReviewPackage>,stored:Readonly<StoredOutcomeAttachments>)=>Promise<readonly string[]>;
 authorizeCurrentArtifactUse:(binding:{artifactHash:string;organizationRef:string;actions:readonly ("display"|"export")[]})=>Promise<boolean>;
}):OutcomeAttachmentResolver{
 const load=base.load,authorize=base.authorize,{organization,artifactHashes,authorizeCurrentArtifactUse}=deps;
 return {load:async(actor,p)=>load(structuredClone(actor),structuredClone(p)),authorize:async(actor,p,stored)=>{
  if(await authorize(structuredClone(actor),structuredClone(p),structuredClone(stored))!==true)return false;
  const org=await organization(structuredClone(actor),structuredClone(p)),hashes=[...await artifactHashes(structuredClone(actor),structuredClone(p),structuredClone(stored))];
  if(!org||!hashes.length||hashes.length>100||new Set(hashes).size!==hashes.length||hashes.some(h=>!/^[a-f0-9]{64}$/.test(h)))return false;
  for(const artifactHash of hashes)if(await authorizeCurrentArtifactUse({artifactHash,organizationRef:org,actions:["display","export"]})!==true)return false;
  return true;
 }};
}
