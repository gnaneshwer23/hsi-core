import type {EvidenceStatus} from "./scientificMemoryEvidenceFreshness";
export function normalizeEvidenceDoi(value:string):string{
 if(typeof value!=="string"||value.length>1024)throw Error("Invalid DOI");
 const doi=value.trim().replace(/^(?:https:\/\/doi\.org\/|doi:\s*)/i,"").toLowerCase();
 if(!/^10\.\d{4,9}\/[\x21-\x7e]+$/.test(doi)||/[?#<>]/.test(doi))throw Error("Invalid DOI");
 return doi;
}
export interface CrossrefStatusCandidate {doi:string;status:EvidenceStatus;noticeDois:string[];scientificClaimAllowed:false}
/** Offline interpretation of Crossref work metadata. Absence of updates is not proof of current status. */
export function interpretCrossrefStatus(requestedDoi:string,payload:unknown):CrossrefStatusCandidate{
 const doi=normalizeEvidenceDoi(requestedDoi);
 if(!payload||typeof payload!=="object")throw Error("Invalid Crossref metadata");
 const envelope=payload as Record<string,unknown>;
 if(envelope.status!=="ok"||envelope["message-type"]!=="work"||!envelope.message||typeof envelope.message!=="object")throw Error("Invalid Crossref metadata");
 const work=envelope.message as Record<string,unknown>;
 if(typeof work.DOI!=="string"||normalizeEvidenceDoi(work.DOI)!==doi)throw Error("Crossref identity mismatch");
 const updates=work["updated-by"]??[];
 if(!Array.isArray(updates)||updates.length>1000)throw Error("Invalid Crossref updates");
 const notices=new Set<string>();const statuses=new Set<EvidenceStatus>();
 for(const update of updates){
  if(!update||typeof update!=="object"||typeof update.DOI!=="string"||typeof update.type!=="string")throw Error("Invalid Crossref update");
  notices.add(normalizeEvidenceDoi(update.DOI));
  switch(update.type.toLowerCase()){
   case "retraction":statuses.add("retracted");break;
   case "correction":case "erratum":case "corrigendum":statuses.add("corrected");break;
   case "expression-of-concern":statuses.add("expression_of_concern");break;
   case "replacement":statuses.add("superseded");break;
   default:statuses.add("unknown");
  }
 }
 const status=(["retracted","expression_of_concern","corrected","superseded"] as const).find(s=>statuses.has(s))??"unknown";
 return {doi,status,noticeDois:[...notices].sort(),scientificClaimAllowed:false};
}
