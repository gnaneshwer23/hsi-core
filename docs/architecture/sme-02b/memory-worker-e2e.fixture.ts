// Disposable CI only. Fixed loopback endpoint; no environment-derived database URL.
import {SQL} from "bun";
import {createScientificEmbeddingFixtureWorker} from "../../../src/scientificMemoryEmbeddingWorker";
import {createScientificEmbeddingGateway,createSyntheticEmbeddingProvider} from "../../../src/scientificMemoryEmbeddingProvider";
if(process.env.SME_DISPOSABLE_FIXTURE!=="1")throw Error("Disposable fixture opt-in required");
const db=new SQL("postgres://postgres:fixture-only@127.0.0.1:5432/sme_fixture",{max:1});
const id="00000000-0000-4000-8000-000000000091";
const token="synthetic-token-alice";
function check(value:unknown,message:string){if(!value)throw Error(message);}
async function role<T>(name:"sme_fixture_runtime"|"sme_fixture_worker",fn:()=>Promise<T>):Promise<T>{
 await db.unsafe("SET ROLE "+name);
 try{return await fn();}finally{await db.unsafe("RESET ROLE");}
}
const worker=createScientificEmbeddingFixtureWorker({async unsafe(query,params){return role("sme_fixture_worker",async()=>Array.from(await db.unsafe(query,params)));}});
const gateway=createScientificEmbeddingGateway(createSyntheticEmbeddingProvider());
async function search(body:string){
 const vector=JSON.stringify(await gateway.embed({text:body,dataClass:"synthetic_demo"}));
 return role("sme_fixture_runtime",async()=>db.unsafe("SELECT * FROM hsi_memory.search_semantic($1,'a','s','hsi-synthetic-fixture-v1',$2::public.vector,10)",[token,vector]));
}
try{
 await role("sme_fixture_runtime",async()=>db.unsafe("SELECT hsi_memory.create_record($1,'a','s',$2::uuid,'note','synthetic first','[]',now()+interval '1 day',gen_random_uuid())",[token,id]));
 check(await worker.runOnce()==="succeeded","initial worker failed");
 const first=await search("synthetic first");
 check(first.length===1&&first[0].record_id===id&&first[0].version===1,"initial retrieval failed");
 await role("sme_fixture_runtime",async()=>db.unsafe("SELECT hsi_memory.revise($1,'a','s',$2::uuid,1,'synthetic revision','[]',gen_random_uuid())",[token,id]));
 check((await search("synthetic first")).length===0,"stale version returned");
 check(await worker.runOnce()==="succeeded","regeneration failed");
 const second=await search("synthetic revision");
 check(second.length===1&&second[0].record_id===id&&second[0].version===2,"revised retrieval failed");
 let denied=false;
 try{await role("sme_fixture_runtime",async()=>db.unsafe("SELECT * FROM hsi_memory.search_semantic('synthetic-token-bob','a','s','hsi-synthetic-fixture-v1','[1,0,0,0,0,0,0,0]',10)"));}catch(e){denied=String(e).includes("Memory unavailable");}
 check(denied,"cross tenant denial missing");
 await role("sme_fixture_runtime",async()=>db.unsafe("SELECT hsi_memory.delete_record($1,'a','s',$2::uuid,gen_random_uuid())",[token,id]));
 check((await search("synthetic revision")).length===0,"deleted memory returned");
 check(await worker.runOnce()==="idle","unexpected remaining job");
 console.log("Synthetic worker database lifecycle passed");
}finally{await db.close();}
