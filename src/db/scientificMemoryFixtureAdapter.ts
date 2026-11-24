/** Isolated adapter rehearsal; not wired to HTTP or live Neon. */
export interface MemorySql { unsafe(query:string,params:unknown[]):Promise<unknown[]> }
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const scope=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
export function createScientificMemoryFixtureAdapter(sql:MemorySql,sessionToken:string){
 if(typeof sessionToken!=="string"||sessionToken.length<16||sessionToken.length>4096||/\s/.test(sessionToken))throw Error("Invalid session");
 function keys(tenant:string,scopeId:string,id:string){
 if(!scope.test(tenant)||!scope.test(scopeId)||!uuid.test(id))throw Error("Invalid memory selector");
 return [sessionToken,tenant,scopeId,id];
 }
 function request(id:string){if(typeof id!=="string"||!uuid.test(id))throw Error("Invalid request");return id;}
 function expiry(value:string){if(typeof value!=="string"||!Number.isFinite(Date.parse(value))||!/^\d{4}-\d{2}-\d{2}T.*Z$/.test(value))throw Error("Invalid expiry");return value;}
 function content(body:string,sources:readonly string[]){if(typeof body!=="string"||new TextEncoder().encode(body).length>65536||!Array.isArray(sources)||sources.length>100||sources.some(s=>typeof s!=="string"||s.length>2048))throw Error("Invalid content");return JSON.stringify(sources);}
 return {
 async list(tenant:string,scopeId:string,after:string|null,limit:number){
 if(typeof tenant!=="string"||typeof scopeId!=="string"||!scope.test(tenant)||!scope.test(scopeId)||(after!==null&&(typeof after!=="string"||!uuid.test(after)))||!Number.isInteger(limit)||limit<1||limit>100)throw Error("Invalid pagination");
 return sql.unsafe("SELECT * FROM hsi_memory.list_current($1::text,$2::text,$3::text,$4::uuid,$5::integer)",[sessionToken,tenant,scopeId,after,limit]);
 },
 async exportCurrent(tenant:string,scopeId:string,id:string,requestId:string){
 return sql.unsafe("SELECT * FROM hsi_memory.export_current($1::text,$2::text,$3::text,$4::uuid,$5::uuid)",[...keys(tenant,scopeId,id),request(requestId)]);
 },
 async proposeCorrection(tenant:string,scopeId:string,id:string,expected:number,body:string,requestId:string){
 if(!Number.isInteger(expected)||expected<1||expected>2147483647||typeof body!=="string"||new TextEncoder().encode(body).length>65536)throw Error("Invalid correction");
 return sql.unsafe("SELECT hsi_memory.propose_correction($1::text,$2::text,$3::text,$4::uuid,$5::integer,$6::text,$7::uuid) AS proposal_id",[...keys(tenant,scopeId,id),expected,body,request(requestId)]);
 },
 async create(tenant:string,scopeId:string,id:string,kind:string,body:string,sources:readonly string[],until:string,requestId:string){
 if(!["note","preference","hypothesis","evidence_reference","investigation_reference"].includes(kind))throw Error("Invalid kind");
 return sql.unsafe("SELECT hsi_memory.create_record($1::text,$2::text,$3::text,$4::uuid,$5::text,$6::text,$7::jsonb,$8::timestamptz,$9::uuid) AS id",[...keys(tenant,scopeId,id),kind,body,content(body,sources),expiry(until),request(requestId)]);
 },
 async share(tenant:string,scopeId:string,id:string,grantee:string,until:string,requestId:string){
 if(typeof grantee!=="string"||!scope.test(grantee))throw Error("Invalid grantee");
 return sql.unsafe("SELECT hsi_memory.set_share($1::text,$2::text,$3::text,$4::uuid,$5::text,$6::timestamptz,$7::boolean,$8::uuid)",[...keys(tenant,scopeId,id),grantee,expiry(until),false,request(requestId)]);
 },
 async revoke(tenant:string,scopeId:string,id:string,grantee:string,requestId:string){
 if(typeof grantee!=="string"||!scope.test(grantee))throw Error("Invalid grantee");
 return sql.unsafe("SELECT hsi_memory.set_share($1::text,$2::text,$3::text,$4::uuid,$5::text,$6::timestamptz,$7::boolean,$8::uuid)",[...keys(tenant,scopeId,id),grantee,null,true,request(requestId)]);
 },
 async delete(tenant:string,scopeId:string,id:string,requestId:string){
 return sql.unsafe("SELECT hsi_memory.delete_record($1::text,$2::text,$3::text,$4::uuid,$5::uuid)",[...keys(tenant,scopeId,id),request(requestId)]);
 },
 async read(tenant:string,scopeId:string,id:string){
 return sql.unsafe("SELECT * FROM hsi_memory.read_current($1::text,$2::text,$3::text,$4::uuid)",keys(tenant,scopeId,id));
 },
 async revise(tenant:string,scopeId:string,id:string,expected:number,body:string,sources:readonly string[],requestId:string){
 if(!Number.isSafeInteger(expected)||expected<1||expected>=2147483647||typeof body!=="string"||new TextEncoder().encode(body).length>65536||!Array.isArray(sources)||sources.length>100||sources.some(s=>typeof s!=="string"||s.length>2048)||!uuid.test(requestId))throw Error("Invalid revision");
 return sql.unsafe("SELECT hsi_memory.revise($1::text,$2::text,$3::text,$4::uuid,$5::integer,$6::text,$7::jsonb,$8::uuid) AS version",[...keys(tenant,scopeId,id),expected,body,JSON.stringify(sources),requestId]);
 }
 };
}
