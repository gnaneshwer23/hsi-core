import {test,expect} from "bun:test";
import {DISCUSSION_TOPICS,addLocalResearchComment,allowedResearchSource,exportLocalResearchDiscussion} from "../src/researchDiscussionPreview";
test("threaded discussion drafts remain local, unreviewed and non-authoritative",()=>{
 const input={topicId:DISCUSSION_TOPICS[0]!.id,text:"How should tissue context be represented beside a claim?",sourceUrl:"https://pubmed.ncbi.nlm.nih.gov/18375541/",parentId:null};
 const first=addLocalResearchComment([],input),thread=addLocalResearchComment(first,{...input,text:"The source model and assay need separate fields.",parentId:first[0]!.id});
 expect(first).toHaveLength(1);expect(thread).toHaveLength(2);expect(thread[1]!.parentId).toBe(first[0]!.id);
 const out=exportLocalResearchDiscussion(thread);expect(out.published).toBe(false);expect(out.persisted).toBe(false);expect(out.scientificApproval).toBe(false);expect(out.verifiedParticipantIdentity).toBe(false);expect(out.sourceVerification).toBe("references_only_not_verified");
});
test("invalid topic, foreign reply, identifying markers and unsafe citation URLs are refused",()=>{
 const input={topicId:"evidence-context",text:"A source-context question for research.",sourceUrl:"",parentId:null};
 for(const variant of [{...input,topicId:"fake"},{...input,parentId:"foreign"},{...input,text:"Patient name and NHS number must be in the record."}])expect(()=>addLocalResearchComment([],variant)).toThrow();
 for(const url of ["http://doi.org/10.1/example","https://attacker.example/source","javascript:alert(1)","https://user:secret@doi.org/example","https://pubmed.ncbi.nlm.nih.gov/?email=private","https://pubmed.ncbi.nlm.nih.gov/"])expect(()=>allowedResearchSource(url)).toThrow();
});
test("draft export rejects forged review state and bounds conversation size",()=>{
 const input={topicId:"evidence-context",text:"How should source context be reviewed?",sourceUrl:"",parentId:null};let list=addLocalResearchComment([],input);
 const changed=structuredClone(list);changed[0]!.status="approved" as "local_unreviewed";expect(()=>exportLocalResearchDiscussion(changed)).toThrow();
 for(let i=1;i<30;i++)list=addLocalResearchComment(list,input);expect(()=>addLocalResearchComment(list,input)).toThrow();
});
