/** Local-only discussion rehearsal; not publishing, identity authority or scientific approval. */
import {rejectPhiPayload} from "./cdsPhiBoundary";
export const DISCUSSION_TOPICS=[
 {id:"evidence-context",title:"What context belongs beside every claim?",prompt:"Discuss how species, tissue, assay and timepoint should affect a research interpretation."},
 {id:"contradictions",title:"When do findings really disagree?",prompt:"Explore the difference between a contradictory result and evidence from a different experimental setting."},
 {id:"research-briefs",title:"What makes a brief useful to review?",prompt:"Discuss source inspection, missing evidence, falsification and review hand-offs."}
] as const;
export type LocalResearchComment={id:string;parentId:string|null;topicId:string;text:string;sourceUrl:string|null;status:"local_unreviewed";flagged:boolean};
export function allowedResearchSource(value:string):string|null{
 if(!value.trim())return null;if(value.length>2000)throw Error("Source URL too long");const u=new URL(value);
 if(u.protocol!=="https:"||u.username||u.password||u.hash||u.search||u.pathname==="/"||!["pubmed.ncbi.nlm.nih.gov","europepmc.org","clinicaltrials.gov","doi.org","reactome.org"].includes(u.hostname))throw Error("Use a public research source URL");
 return u.href;
}
export function addLocalResearchComment(previous:readonly LocalResearchComment[],input:{topicId:string;text:string;sourceUrl:string;parentId:string|null}):LocalResearchComment[]{
 if(previous.length>=30||!DISCUSSION_TOPICS.some(t=>t.id===input.topicId)||typeof input.text!=="string"||input.text.trim().length<12||input.text.length>1000||!rejectPhiPayload({textBlobs:[input.text]}).ok||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(input.text)||(input.parentId!==null&&!previous.some(c=>c.id===input.parentId&&c.topicId===input.topicId)))throw Error("Invalid local research discussion");
 const sourceUrl=allowedResearchSource(input.sourceUrl);
 return [...previous,{id:"local-comment-"+(previous.length+1),parentId:input.parentId,topicId:input.topicId,text:input.text.trim(),sourceUrl,status:"local_unreviewed",flagged:false}];
}
export function exportLocalResearchDiscussion(comments:readonly LocalResearchComment[]){
 const checked:LocalResearchComment[]=[];for(const c of comments){const next=addLocalResearchComment(checked,{...c,sourceUrl:c.sourceUrl??""}).at(-1)!;if(next.id!==c.id||c.status!=="local_unreviewed"||typeof c.flagged!=="boolean")throw Error("Invalid discussion export");checked.push({...next,flagged:c.flagged})}
 return {schemaVersion:"hsi-local-research-discussion-1",scope:"local_rehearsal_only",published:false,persisted:false,scientificApproval:false,verifiedParticipantIdentity:false,sourceVerification:"references_only_not_verified",comments:checked};
}
