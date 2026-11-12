/** Server-only stored-artifact resolver. Neither options nor authorization come from HTTP JSON. */
import type {TrustedResearchActor} from "../db/researchInvestigationStore";
import type {ReviewPackage} from "../investigationDelivery";
import {canonicalGraphContext} from "../investigationGraphContext";
import type {ResearchOutcomeOptions,OutcomeAttachmentBinding,OutcomeAttachmentAuthority} from "../researchOutcome";
export type StoredOutcomeAttachments=OutcomeAttachmentBinding&{options:ResearchOutcomeOptions};
export type OutcomeAttachmentResolver={
 load:(actor:Readonly<TrustedResearchActor>,packageValue:Readonly<ReviewPackage>)=>Promise<StoredOutcomeAttachments|null>;
 /** Rechecks current source actions, artifact integrity, ownership and any independent review receipt. */
 authorize:(actor:Readonly<TrustedResearchActor>,packageValue:Readonly<ReviewPackage>,artifact:Readonly<StoredOutcomeAttachments>)=>Promise<boolean>;
};
export async function resolveBoundOutcomeAttachments(resolver:OutcomeAttachmentResolver|undefined,actor:TrustedResearchActor,p:ReviewPackage,digest:(s:string)=>string):Promise<{options:ResearchOutcomeOptions;authority?:OutcomeAttachmentAuthority}>{
 if(!resolver)return {options:{}};
 const load=resolver.load,authorize=resolver.authorize;
 if(typeof load!=="function"||typeof authorize!=="function")throw Error("Trusted outcome attachment resolver required");
 const value=structuredClone(await load(structuredClone(actor),structuredClone(p)));
 if(!value)return {options:{}};
 const expected:OutcomeAttachmentBinding={investigationId:p.investigation.id,packageHash:p.packageHash,contextHash:p.context.contentHash,releaseId:p.context.primary.release.id,manifestHash:p.context.primary.release.manifestHash,attachmentsHash:digest(canonicalGraphContext(value.options))};
 if(Object.entries(expected).some(([key,v])=>value[key as keyof OutcomeAttachmentBinding]!==v))throw Error("Stored attachments do not bind to the saved investigation package");
 return {options:value.options,authority:{authorize:async binding=>{
  if(canonicalGraphContext(binding)!==canonicalGraphContext(expected))return false;
  return await authorize(structuredClone(actor),structuredClone(p),structuredClone(value))===true;
 }}};
}
