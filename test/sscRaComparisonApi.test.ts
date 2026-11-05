import {test,expect} from "bun:test";
import {handleInterrogativeApi} from "../src/server/interrogativeApi";
const path="https://hsi.example/api/research/comparison/ssc-ra?sscNode=cell:tfh&raNode=cell:tfh";
const cookie="__Secure-better-auth.session_token=verified-research-session";
const services={load:async()=>({}),submit:async()=>({}),review:async()=>({}),compare:async({sscNodeId,raNodeId}:{sscNodeId:string;raNodeId:string})=>({schemaVersion:"hsi-disease-comparison-1",sscNodeId,raNodeId,graphPromotable:false})};
test("comparison requires authenticated session",async()=>expect((await handleInterrogativeApi(new Request(path),services)).status).toBe(401));
test("comparison rejects malformed RA identifier",async()=>expect((await handleInterrogativeApi(new Request(path.replace("raNode=cell:tfh","raNode=bad%20id"),{headers:{cookie}}),services)).status).toBe(400));
test("comparison rejects writes",async()=>expect((await handleInterrogativeApi(new Request(path,{method:"POST",headers:{cookie}}),services)).status).toBe(405));
test("comparison routes verified identity and uses no-store",async()=>{const r=await handleInterrogativeApi(new Request(path,{headers:{cookie}}),services);expect(r.status).toBe(200);expect(r.headers.get("cache-control")).toBe("no-store");expect((await r.json()).graphPromotable).toBe(false)});
