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
 const match=url.pathname.match(/^\/api\/research\/memory\/records\/([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})(?:\/(share|revoke|export|corrections))?$/i);
 const create=url.pathname===root+"/records"&&req.method==="POST";
 const action=create?"create":url.pathname===root+"/records"&&req.method==="GET"?"list":match?(match[2]&&req.method==="POST"?match[2]:!match[2]?({GET:"read",PATCH:"revise",DELETE:"delete"} as Record<string,string>)[req.method]:undefined):undefined;
 if(!action)return json({code:"NOT_IMPLEMENTED"},501);
 if(action!=="read"&&action!=="list"&&(req.headers.get("origin")!==deps.origin||req.headers.get("sec-fetch-site")==="cross-site"))return json({code:"ORIGIN_DENIED"},403);
 const tenant=url.searchParams.get("tenant"),scope=url.searchParams.get("scope");
 if(!tenant||!scope||!selector.test(tenant)||!selector.test(scope))return json({code:"INVALID_SELECTOR"},400);
 try{
 const token=await deps.verifyFixtureSession(req);
 if(!token)return json({code:"SESSION_REQUIRED"},401);
 const adapter=createScientificMemoryFixtureAdapter(deps.sql,token);
 if(action==="list"){
 const after=url.searchParams.get("after"),raw=url.searchParams.get("limit")??"50",limit=Number(raw);
 if(!/^\d{1,3}$/.test(raw)||limit<1||limit>100||(after!==null&&!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(after)))return json({code:"INVALID_PAGINATION"},400);
 const rows=await adapter.list(tenant,scope,after,limit);
 return json({records:rows},200);
 }
 if(action==="read"){
 const rows=await adapter.read(tenant,scope,match![1]!);
 return rows.length===1?json({record:rows[0]},200):json({code:"NOT_FOUND"},404);
 }
 if(req.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase()!=="application/json")return json({code:"JSON_REQUIRED"},415);
 let b:unknown;
 try{b=JSON.parse(await boundedRequestText(req,300000));}catch(e){if(e instanceof RequestBodyTooLarge)return json({code:"TOO_LARGE"},413);if(e instanceof RequestBodyTimeout)return json({code:"TIMEOUT"},408);return json({code:"INVALID_JSON"},400);}
 if(!b||typeof b!=="object"||Array.isArray(b))return json({code:"INVALID_BODY"},400);
 const v=b as Record<string,unknown>;
 const uuid=(x:unknown):x is string=>typeof x==="string"&&/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(x);
 const invalid=()=>json({code:"INVALID_BODY"},400);
 const fields:Record<string,string[]>={create:["id","kind","body","sourceRefs","until","requestId"],revise:["expectedVersion","body","sourceRefs","requestId"],share:["grantee","until","requestId"],revoke:["grantee","requestId"],delete:["requestId"],export:["requestId"],corrections:["requestId","expectedVersion","body"]};
 if(!uuid(v.requestId)||Object.keys(v).some(k=>!fields[action]?.includes(k)))return invalid();
 const id=create?v.id:match?.[1];if(!uuid(id))return invalid();
 const expiry=(x:unknown):x is string=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(x)&&Number.isFinite(Date.parse(x));
 if(action==="create"||action==="revise"){
 if(typeof v.body!=="string"||new TextEncoder().encode(v.body).length>65536||!Array.isArray(v.sourceRefs)||v.sourceRefs.length>100||v.sourceRefs.some(s=>typeof s!=="string"||s.length>2048))return invalid();
 if(action==="create"){
 if(typeof v.kind!=="string"||!["note","preference","hypothesis","evidence_reference","investigation_reference"].includes(v.kind)||!expiry(v.until))return invalid();
 await adapter.create(tenant,scope,id,v.kind,v.body,v.sourceRefs as string[],v.until,v.requestId);
 return json({id},201);
 }
 if(typeof v.expectedVersion!=="number"||!Number.isSafeInteger(v.expectedVersion)||v.expectedVersion<1||v.expectedVersion>=2147483647)return invalid();
 const rows=await adapter.revise(tenant,scope,id,v.expectedVersion,v.body,v.sourceRefs as string[],v.requestId);
 return json({result:rows},200);
 }
 if(action==="export"){const rows=await adapter.exportCurrent(tenant,scope,id,v.requestId);return rows.length===1?json({record:rows[0]},200):json({code:"NOT_FOUND"},404);}
 if(action==="corrections"){
 if(typeof v.expectedVersion!=="number"||!Number.isInteger(v.expectedVersion)||v.expectedVersion<1||v.expectedVersion>2147483647||typeof v.body!=="string"||new TextEncoder().encode(v.body).length>65536)return invalid();
 const rows=await adapter.proposeCorrection(tenant,scope,id,v.expectedVersion,v.body,v.requestId);
 return json({result:rows,scientificApproval:false},201);
 }
 if(action==="delete"){await adapter.delete(tenant,scope,id,v.requestId);return json({ok:true},200);}
 if(typeof v.grantee!=="string"||!selector.test(v.grantee))return invalid();
 if(action==="share"){if(!expiry(v.until))return invalid();await adapter.share(tenant,scope,id,v.grantee,v.until,v.requestId);}
 else await adapter.revoke(tenant,scope,id,v.grantee,v.requestId);
 return json({ok:true},200);
 }catch(e){const code=(e as {code?:unknown}|null)?.code;return json({code:code==="42501"?"NOT_FOUND":code==="40001"?"VERSION_CONFLICT":"MEMORY_UNAVAILABLE"},code==="42501"?404:code==="40001"?409:503);}
}
