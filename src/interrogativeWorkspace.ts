/** Browser-safe workspace contracts. Ownership, releases and permissions are server-owned. */
export type InvestigationRelease={id:string;version:string;manifestHash:string};
export type InvestigationCursor={createdAt:string;id:string};
export type InvestigationSummary={
 id:string;question:string;createdAt:string;state:"draft"|"awaiting_scientific_review"|"reviewed"|"rejected";
 release:InvestigationRelease;
};
export type InvestigationWorkspace={
 items:InvestigationSummary[];nextCursor:InvestigationCursor|null;releases:InvestigationRelease[];
 writesEnabled:boolean;canCreate:boolean;
};
export type CreateInvestigationInput={question:string;releaseId:string;requestId:string};
const ID=/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/;
export function parseCreateInvestigation(value:unknown):CreateInvestigationInput{
 const x=value as CreateInvestigationInput;
 if(!x||typeof x!=="object"||Array.isArray(x)||Object.keys(x).sort().join(",")!=="question,releaseId,requestId"||
 typeof x.question!=="string"||!x.question.trim()||x.question.trim().length>500||
 typeof x.releaseId!=="string"||!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(x.releaseId)||
 typeof x.requestId!=="string"||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(x.requestId))throw Error("Invalid investigation request");
 return {question:x.question.trim(),releaseId:x.releaseId,requestId:x.requestId};
}
export function parseInvestigationCursor(value:unknown):InvestigationCursor|null{
 if(value===null)return null;
 const x=value as InvestigationCursor;
 if(!x||typeof x!=="object"||Object.keys(x).sort().join(",")!=="createdAt,id"||typeof x.id!=="string"||!ID.test(x.id)||
 typeof x.createdAt!=="string"||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3,6}Z$/.test(x.createdAt)||!Number.isFinite(Date.parse(x.createdAt)))throw Error("Invalid investigation cursor");
 return {id:x.id,createdAt:x.createdAt};
}
export function validateWorkspaceRelease(x:InvestigationRelease):void{
 if(!x||typeof x.id!=="string"||!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(x.id)||typeof x.version!=="string"||!/^\d+\.\d+\.\d+$/.test(x.version)||typeof x.manifestHash!=="string"||!/^[a-f0-9]{64}$/.test(x.manifestHash))throw Error("Invalid investigation release");
}
export function parseInvestigationWorkspace(value:unknown):InvestigationWorkspace{
 const x=value as InvestigationWorkspace;
 if(!x||!Array.isArray(x.items)||x.items.length>25||!Array.isArray(x.releases)||x.releases.length>1||typeof x.writesEnabled!=="boolean"||typeof x.canCreate!=="boolean"||
 (x.canCreate&&(!x.writesEnabled||!x.releases.length)))throw Error("Invalid workspace response");
 x.releases.forEach(validateWorkspaceRelease);
 const ids=new Set<string>();
 for(const i of x.items){
  if(!i||typeof i.id!=="string"||!ID.test(i.id)||ids.has(i.id)||typeof i.question!=="string"||!i.question.trim()||i.question.length>500||
   typeof i.createdAt!=="string"||!Number.isFinite(Date.parse(i.createdAt))||!["draft","awaiting_scientific_review","reviewed","rejected"].includes(i.state))throw Error("Invalid workspace record");
  validateWorkspaceRelease(i.release);ids.add(i.id);
 }
 const nextCursor=parseInvestigationCursor(x.nextCursor);
 if(nextCursor&&(!x.items.length||nextCursor.id!==x.items[x.items.length-1]!.id))throw Error("Invalid workspace pagination");
 return {items:x.items,nextCursor,releases:x.releases,writesEnabled:x.writesEnabled,canCreate:x.canCreate};
}
