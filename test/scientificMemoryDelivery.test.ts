import {test,expect} from "bun:test";
import {createScientificMemoryDelivery} from "../src/scientificMemoryDelivery";
const a="00000000-0000-4000-8000-000000000001",b="00000000-0000-4000-8000-000000000002";
const token="synthetic-token-alice";
const row=(id:string,version=1)=>({record_id:id,version,body:"synthetic",source_refs:[]});
test("preserves rank order and excludes missing authorization",async()=>{
 const d=createScientificMemoryDelivery({async unsafe(q,p){expect(q).toContain("revalidate_ranked");expect(p).toEqual([token,"a","s","{"+a+","+b+"}","{1,1}"]);return [row(b),row(a)];}});
 expect((await d.deliver(token,"a","s",[{id:a,version:1},{id:b,version:1}])).map(x=>x.id)).toEqual([a,b]);
 const missing=createScientificMemoryDelivery({async unsafe(){return [row(b)];}});
 const r=await missing.deliver(token,"a","s",[{id:a,version:1},{id:b,version:1}]);
 expect(r.map(x=>x.id)).toEqual([b]);expect(r[0]?.scientificClaimAllowed).toBe(false);
});
test("unexpected or stale database response fails closed",async()=>{
 for(const rows of [[row(a,2)],[row(b)],[row(a),row(a)]]){
 const d=createScientificMemoryDelivery({async unsafe(){return rows;}});
 await expect(d.deliver(token,"a","s",[{id:a,version:1}])).rejects.toThrow("Scientific memory delivery unavailable");
 }
});
test("database failure never falls back to cached content",async()=>{
 const d=createScientificMemoryDelivery({async unsafe(){throw Error("private database error");}});
 await expect(d.deliver(token,"a","s",[{id:a,version:1}])).rejects.toThrow("Scientific memory delivery unavailable");
});
