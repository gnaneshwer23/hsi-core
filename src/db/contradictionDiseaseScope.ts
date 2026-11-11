/**
 * P0.2.7 fail-closed scope agreement, independent of tenant or user claims.
 * Disease is extracted from both canonical persisted evidence edges.
 */
export function resolveContradictionDiseaseScope(snapshot:unknown):"ssc"|"ra"{
 if(!snapshot||typeof snapshot!=="object")throw Error("Missing contradiction snapshot");
 const s=snapshot as Record<string,unknown>;
 const read=(side:"left"|"right")=>{
  const e=s[side] as {context?:{disease?:{status?:string;value?:unknown;sourceLocator?:unknown}}}|undefined;
  const d=e?.context?.disease;
  if(d?.status!=="reported"||typeof d.value!=="string"||
   typeof d.sourceLocator!=="string"||!d.sourceLocator.trim())
   throw Error("Unverified disease context");
  return d.value.trim().toLowerCase();
 };
 const left=read("left"),right=read("right");
 if(left!==right)throw Error("Contradiction disease scopes disagree");
 if(left!=="ssc"&&left!=="ra")throw Error("Unsupported disease scope");
 return left;
}
