import {test,expect} from "bun:test";
import {handleInterrogativeApi} from "../src/server/interrogativeApi";
const id="hsi-interrogative-example-12345678";
const services={load:async()=>({id}),submit:async()=>({state:"awaiting_scientific_review"}),review:async()=>({outcome:"reject"})};
const base="https://hsi.example/api/research/interrogative/"+id;
const cookie="__Secure-better-auth.session_token=example-session-token-long-enough";
test("GET requires secure cookie session",async()=>{
 const r=await handleInterrogativeApi(new Request(base),services);
 expect(r.status).toBe(401);
});
test("authenticated same-origin GET calls authorised loader",async()=>{
 const r=await handleInterrogativeApi(new Request(base,{headers:{cookie}}),services);
 expect(r.status).toBe(200);expect(r.headers.get("cache-control")).toBe("no-store");
});
test("cross-origin review submission is denied",async()=>{
 const r=await handleInterrogativeApi(new Request(base+"/submit-review",{method:"POST",headers:{cookie,origin:"https://attacker.example","content-type":"application/json"},body:"{}"}),services);
 expect(r.status).toBe(403);
});
test("JSON same-origin submission routes to trusted backend",async()=>{
 const r=await handleInterrogativeApi(new Request(base+"/submit-review",{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body:"{}"}),services);
 expect(r.status).toBe(200);
});
test("API never accepts arbitrary paths or exposes internal errors",async()=>{
 const r=await handleInterrogativeApi(new Request(base,{headers:{cookie}}),{...services,load:async()=>{throw Error("secret database url")}});
 expect(r.status).toBe(403);expect(await r.text()).not.toContain("secret");
});

test("GET cannot execute review submission",async()=>{
 const r=await handleInterrogativeApi(new Request(base+"/submit-review",{headers:{cookie}}),services);
 expect(r.status).toBe(405);
});
test("POST cannot execute read endpoint",async()=>{
 const r=await handleInterrogativeApi(new Request(base,{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body:"{}"}),services);
 expect(r.status).toBe(405);
});
test("malformed decision JSON returns a safe client error",async()=>{
 const r=await handleInterrogativeApi(new Request(base+"/decision",{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body:"{not-json"}),services);
 expect(r.status).toBe(400);
});
