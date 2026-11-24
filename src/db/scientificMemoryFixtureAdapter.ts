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
 return {
 async read(tenant:string,scopeId:string,id:string){
 return sql.unsafe("SELECT * FROM hsi_memory.read_current($1::text,$2::text,$3::text,$4::uuid)",keys(tenant,scopeId,id));
 },
 async revise(tenant:string,scopeId:string,id:string,expected:number,body:string,sources:readonly string[],requestId:string){
 if(!Number.isSafeInteger(expected)||expected<1||expected>=2147483647||typeof body!=="string"||new TextEncoder().encode(body).length>65536||!Array.isArray(sources)||sources.length>100||sources.some(s=>typeof s!=="string"||s.length>2048)||!uuid.test(requestId))throw Error("Invalid revision");
 return sql.unsafe("SELECT hsi_memory.revise($1::text,$2::text,$3::text,$4::uuid,$5::integer,$6::text,$7::jsonb,$8::uuid) AS version",[...keys(tenant,scopeId,id),expected,body,JSON.stringify(sources),requestId]);
 }
 };
}
