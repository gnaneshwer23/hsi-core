/** Unmounted HTTP rehearsal. Only synthetic fixture dependencies are permitted. */
import {boundedRequestText,RequestBodyTooLarge,RequestBodyTimeout} from "./boundedRequestBody";
import {createScientificMemoryFixtureAdapter,type MemorySql} from "../db/scientificMemoryFixtureAdapter";
type Dependencies={origin:string;verifyFixtureSession:(request:Request)=>Promise<string|null>;sql:MemorySql};
const root="/api/research/memory";
function json(body:unknown,status:number){return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"}});}
const selector=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
export async function handleScientificMemoryHttpFixture(req:Request,deps:Dependencies):Promise<Response|null>{
 const url=new URL(req.url);
 if(url.pathname!==root&&!url.pathname.startsWith(root+"/"))return null;
 const match=url.pathname.match(/^\/api\/research\/memory\/records\/([0-9a-f-]{36})$/i);
 if(!match||!["GET","PATCH"].includes(req.method))return json({code:"NOT_IMPLEMENTED"},501);
 if(req.method==="PATCH"&&(req.headers.get("origin")!==deps.origin||req.headers.get("sec-fetch-site")==="cross-site"))return json({code:"ORIGIN_DENIED"},403);
 const tenant=url.searchParams.get("tenant"),scope=url.searchParams.get("scope");
 if(!tenant||!scope||!selector.test(tenant)||!selector.test(scope))return json({code:"INVALID_SELECTOR"},400);
 try{
 const token=await deps.verifyFixtureSession(req);
 if(!token)return json({code:"SESSION_REQUIRED"},401);
 const adapter=createScientificMemoryFixtureAdapter(deps.sql,token);
 if(req.method==="GET"){
 const rows=await adapter.read(tenant,scope,match[1]!);
 return rows.length===1?json({record:rows[0]},200):json({code:"NOT_FOUND"},404);
 }
 if(req.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase()!=="application/json")return json({code:"JSON_REQUIRED"},415);
 let b:unknown;
 try{b=JSON.parse(await boundedRequestText(req,300000));}catch(e){if(e instanceof RequestBodyTooLarge)return json({code:"TOO_LARGE"},413);if(e instanceof RequestBodyTimeout)return json({code:"TIMEOUT"},408);return json({code:"INVALID_JSON"},400);}
 if(!b||typeof b!=="object"||Array.isArray(b))return json({code:"INVALID_BODY"},400);
 const v=b as Record<string,unknown>;
 if(Object.keys(v).some(k=>!["expectedVersion","body","sourceRefs","requestId"].includes(k))||typeof v.expectedVersion!=="number"||!Number.isSafeInteger(v.expectedVersion)||v.expectedVersion<1||typeof v.body!=="string"||new TextEncoder().encode(v.body).length>65536||!Array.isArray(v.sourceRefs)||v.sourceRefs.length>100||v.sourceRefs.some(s=>typeof s!=="string"||s.length>2048)||typeof v.requestId!=="string"||! /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v.requestId))return json({code:"INVALID_BODY"},400);
 const rows=await adapter.revise(tenant,scope,match[1]!,v.expectedVersion,v.body,v.sourceRefs as string[],v.requestId);
 return json({result:rows},200);
 }catch(e){const code=(e as {code?:unknown}|null)?.code;return json({code:code==="42501"?"NOT_FOUND":code==="40001"?"VERSION_CONFLICT":"MEMORY_UNAVAILABLE"},code==="42501"?404:code==="40001"?409:503);}
}
