/** Rights/retraction checks are independent attestations, not model opinions. */
export interface SourceClearance {sourceId:string;pmid:string;pmcid:string;rights:{status:"verified"|"unknown"|"denied";licenceId:string|null;verifiedBy:string|null};retraction:{status:"clear"|"corrected"|"retracted"|"unknown";checkedBy:string|null};identity:{status:"matched"|"unknown";checkedBy:string|null};}
export function assessSourceClearance(x:SourceClearance):{usableForPassageVerification:boolean;requiresException:boolean;reasons:string[]}{
 if(!x||!x.sourceId||!/^\d+$/.test(x.pmid)||!/^PMC\d+$/.test(x.pmcid)||!x.rights||!x.retraction||!x.identity)throw Error("Invalid clearance record");
 const reasons:string[]=[];
 if(x.identity.status!=="matched"||!x.identity.checkedBy)reasons.push("Publication identity not independently matched");
 if(x.rights.status!=="verified"||!x.rights.licenceId||!x.rights.verifiedBy)reasons.push("Passage reuse rights not verified");
 if(x.retraction.status!=="clear"||!x.retraction.checkedBy)reasons.push("Current retraction and correction status not cleared");
 return {usableForPassageVerification:reasons.length===0,requiresException:reasons.length>0,reasons};
}
