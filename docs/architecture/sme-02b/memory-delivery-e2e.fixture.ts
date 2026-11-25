// Disposable CI only. Independent reader and writer connections.
import {SQL} from "bun";
import {createScientificMemoryDelivery} from "../../../src/scientificMemoryDelivery";
if(process.env.SME_DISPOSABLE_FIXTURE!=="1")throw Error("Disposable fixture opt-in required");
const url="postgres://postgres:fixture-only@127.0.0.1:5432/sme_fixture";
const reader=new SQL(url,{max:1}),writer=new SQL(url,{max:1});
const id="00000000-0000-4000-8000-000000000095";
const alice="synthetic-token-alice",carol="synthetic-token-carol";
function check(v:unknown,m:string){if(!v)throw Error(m);}
const delivery=createScientificMemoryDelivery({async unsafe(q,p){return Array.from(await reader.unsafe(q,p));}});
const read=(token:string,version:number)=>delivery.deliver(token,"a","s",[{id,version}]);
async function mutate(q:string,p:unknown[]){return writer.unsafe(q,p);}
try{
 await reader.unsafe("SET ROLE sme_fixture_runtime");
 await writer.unsafe("SET ROLE sme_fixture_runtime");
 await mutate("SELECT hsi_memory.create_record($1,'a','s',$2::uuid,'note','delivery original','[]',now()+interval '1 day',gen_random_uuid())",[alice,id]);
 check((await read(alice,1))[0]?.body==="delivery original","owner delivery failed");
 check((await read(carol,1)).length===0,"private delivery leaked");
 await mutate("SELECT hsi_memory.set_share($1,'a','s',$2::uuid,'carol',now()+interval '1 hour',false,gen_random_uuid())",[alice,id]);
 check((await read(carol,1)).length===1,"shared delivery failed");
 // Uncommitted changes must not leak; after commit the next delivery must exclude.
 await writer.unsafe("BEGIN");
 await mutate("SELECT hsi_memory.set_share($1,'a','s',$2::uuid,'carol',NULL,true,gen_random_uuid())",[alice,id]);
 check((await read(carol,1)).length===1,"uncommitted revoke visible");
 await writer.unsafe("COMMIT");
 check((await read(carol,1)).length===0,"committed revoke ignored");
 await writer.unsafe("BEGIN");
 await mutate("SELECT hsi_memory.revise($1,'a','s',$2::uuid,1,'delivery revised','[]',gen_random_uuid())",[alice,id]);
 check((await read(alice,1)).length===1,"uncommitted revision visible");
 await writer.unsafe("COMMIT");
 check((await read(alice,1)).length===0,"stale reference delivered");
 check((await read(alice,2))[0]?.body==="delivery revised","current revision missing");
 await writer.unsafe("BEGIN");
 await mutate("SELECT hsi_memory.delete_record($1,'a','s',$2::uuid,gen_random_uuid())",[alice,id]);
 check((await read(alice,2)).length===1,"uncommitted delete visible");
 await writer.unsafe("COMMIT");
 check((await read(alice,2)).length===0,"deleted reference delivered");
 let denied=false;
 try{await mutate("SELECT hsi_memory.create_record($1,'a','s',$2::uuid,'note','replacement','[]',now()+interval '1 day',gen_random_uuid())",[alice,id]);}catch(e){denied=String(e).includes("Memory identifier unavailable");}
 check(denied,"identifier reused");
 check((await read(alice,1)).length===0,"old reference revived");
 console.log("Independent-connection delivery validation passed");
}finally{await writer.close();await reader.close();}
