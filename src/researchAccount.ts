/** Browser-safe account contract. Only a trusted backend may establish these capabilities. */
export type ResearchAccountAccess={
 principalId:string;
 researcher:boolean;
 scientificReviewer:boolean;
 investigations:{id:string;state:"draft"|"awaiting_scientific_review"|"reviewed"|"rejected";canReview:boolean}[];
};
export function parseResearchAccountAccess(value:unknown,expectedPrincipal:string):ResearchAccountAccess{
 const v=value as ResearchAccountAccess|null;
 if(!v||typeof v!=="object"||v.principalId!==expectedPrincipal||!expectedPrincipal.trim()||
 typeof v.researcher!=="boolean"||typeof v.scientificReviewer!=="boolean"||!Array.isArray(v.investigations)||v.investigations.length>50)
  throw Error("Invalid research account response");
 if(!v.researcher&&!v.scientificReviewer&&v.investigations.length)throw Error("Unauthorised account records");
 const ids=new Set<string>();
 const investigations=v.investigations.map(i=>{
  if(!i||typeof i!=="object"||typeof i.id!=="string"||!/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/.test(i.id)||
   !["draft","awaiting_scientific_review","reviewed","rejected"].includes(i.state)||typeof i.canReview!=="boolean"||
   (i.canReview&&(!v.scientificReviewer||i.state!=="awaiting_scientific_review"))||ids.has(i.id))throw Error("Invalid research account record");
  ids.add(i.id);return {id:i.id,state:i.state,canReview:i.canReview};
 });
 return {principalId:v.principalId,researcher:v.researcher,scientificReviewer:v.scientificReviewer,investigations};
}
