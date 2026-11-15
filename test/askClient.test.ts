import {describe,expect,test} from "bun:test";
import {askLengthOk,askQuestion} from "../site/src/lib/askClient";
const res=(status:number,body:unknown)=>(async()=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json"}})) as unknown as typeof fetch;
const Q="Does IL-21 drive T follicular helper cells in autoimmunity?";
describe("askClient",()=>{
 test("length rules",()=>{expect(askLengthOk("short")).toBe(false);expect(askLengthOk(Q)).toBe(true);expect(askLengthOk("x".repeat(501))).toBe(false)});
 test("invalid input makes no request",async()=>{let called=false;const f=(async()=>{called=true;return new Response("{}")}) as unknown as typeof fetch;expect((await askQuestion("hi",f)).kind).toBe("invalid");expect(called).toBe(false)});
 test("status mapping",async()=>{
  expect((await askQuestion(Q,res(401,{}))).kind).toBe("signed-out");
  expect((await askQuestion(Q,res(403,{code:"EMAIL_NOT_VERIFIED"}))).kind).toBe("unverified");
  expect((await askQuestion(Q,res(403,{code:"ORIGIN_NOT_ALLOWED"}))).kind).toBe("error");
  expect((await askQuestion(Q,res(429,{}))).kind).toBe("limited");
  expect((await askQuestion(Q,res(503,{}))).kind).toBe("unavailable");
  expect((await askQuestion(Q,res(500,{}))).kind).toBe("error");
  expect((await askQuestion(Q,(async()=>{throw Error("net")}) as unknown as typeof fetch)).kind).toBe("error");
 });
 test("unrouted and routed shapes; malformed success is an error",async()=>{
  const u=await askQuestion(Q,res(200,{routed:false,message:"Nothing was run.",available:[{id:"a",title:"T",question:"Q?"},"bad"]}));
  expect(u.kind==="unrouted"&&u.available).toEqual([{id:"a",title:"T",question:"Q?"}]);
  const r=await askQuestion(Q,res(200,{routed:true,scenarioId:"s",trace:{matchedBy:"m",question:"q",sources:["A"],modelCheck:"not_configured"},result:{candidates:[],records:[]}}));
  expect(r.kind==="routed"&&r.trace.sources).toEqual(["A"]);
  expect((await askQuestion(Q,res(200,{routed:true,scenarioId:"s",trace:{},result:{}}))).kind).toBe("error");
  expect((await askQuestion(Q,res(200,"nope"))).kind).toBe("error");
 });
});
