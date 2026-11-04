import {test,expect} from "bun:test";
import {commitHsiFencedArtifact,hsiIdempotencyKey,hsiArtifactHash,type HsiFencedArtifactStore,type HsiExecutionFence} from "../src/hsiFencedArtifact";
const fence:HsiExecutionFence={investigationId:"inv-1",taskId:"planner",attempt:1,checkpointVersion:1,inputHash:"a".repeat(64)};
test("same logical output is idempotent and differing payload conflicts",async()=>{
 const records=new Map<string,{hash:string;id:string}>();
 let current={...fence};
 const store:HsiFencedArtifactStore={commitIfCurrent:async({fence:f,idempotencyKey,contentHash})=>{
  if(f.checkpointVersion!==current.checkpointVersion||f.attempt!==current.attempt)throw Error("Stale fence");
  const old=records.get(idempotencyKey);
  if(old&&old.hash!==contentHash)throw Error("Idempotency conflict");
  const id=old?.id??"artifact-1";records.set(idempotencyKey,{hash:contentHash,id});
  return {artifactId:id,contentHash,outputRef:"hsi-artifact:"+id,fence:f};
 }};
 const a=await commitHsiFencedArtifact({store,fence,logicalOutputId:"mechanism-map",payload:"evidence A"});
 const b=await commitHsiFencedArtifact({store,fence,logicalOutputId:"mechanism-map",payload:"evidence A"});
 expect(a.artifactId).toBe(b.artifactId);expect(records.size).toBe(1);
 await expect(commitHsiFencedArtifact({store,fence,logicalOutputId:"mechanism-map",payload:"evidence B"})).rejects.toThrow("Idempotency conflict");
 current={...fence,attempt:2,checkpointVersion:3};
 await expect(commitHsiFencedArtifact({store,fence,logicalOutputId:"other",payload:"late output"})).rejects.toThrow("Stale fence");
});
test("idempotency key ignores attempt and canonical content hash is stable",()=>{
 expect(hsiIdempotencyKey(fence,"result")).toBe(hsiIdempotencyKey({...fence,attempt:2,checkpointVersion:3},"result"));
 expect(hsiArtifactHash("evidence")).toHaveLength(64);
});
