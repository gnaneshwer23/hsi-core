/** P1.2 ISI release adapter: server-side, fail-closed, read-only transport.
 * A configured and independently authenticated ISI service is required.
 * Never exposes raw ISI credentials to a browser or publishes graph facts.
 */
export interface IsiMechanismRelease {schemaVersion:"hsi-isi-mechanism-release-1";releaseId:string;version:string;reviewedByHuman:false;graphPromotable:false;containsPhi:false;nodes:Array<{id:string;preferredLabel:string;kind:string}>;relationships:Array<{id:string;subjectId:string;objectId:string;predicate:string;reviewState:string;sourceEvidenceIds:string[];context:{studyContext?:string;sourceLocator?:string;limitations?:string;model?:string}}>}
export interface IsiMechanismTransport {get(url:string,authorization:string,signal:AbortSignal):Promise<{status:number;body:unknown}>}
const id=/^[A-Za-z0-9][A-Za-z0-9:_.-]{0,127}$/;
function fail():never{throw Error("ISI release unavailable or untrusted")}
export function validateIsiMechanismRelease(input:unknown):IsiMechanismRelease{
 if(!input||typeof input!=="object"||Array.isArray(input))fail();
 const x=input as Record<string,unknown>;
 if(x.schemaVersion!=="hsi-isi-mechanism-release-1"||x.reviewedByHuman!==false||x.graphPromotable!==false||x.containsPhi!==false||typeof x.releaseId!=="string"||!id.test(x.releaseId)||typeof x.version!=="string"||!/^\d+\.\d+\.\d+$/.test(x.version)||!Array.isArray(x.nodes)||!Array.isArray(x.relationships)||x.nodes.length>500||x.relationships.length>1000)fail();
 const nodes=new Set<string>(),edges=new Set<string>();
 for(const n of x.nodes){if(!n||typeof n!=="object"||!id.test(n.id)||typeof n.preferredLabel!=="string"||!n.preferredLabel.trim()||typeof n.kind!=="string"||nodes.has(n.id))fail();nodes.add(n.id)}
 for(const e of x.relationships){if(!e||typeof e!=="object"||!id.test(e.id)||edges.has(e.id)||!nodes.has(e.subjectId)||!nodes.has(e.objectId)||typeof e.predicate!=="string"||!e.predicate.trim()||e.reviewState!=="draft"||!Array.isArray(e.sourceEvidenceIds)||e.sourceEvidenceIds.length>30||e.sourceEvidenceIds.some((s:unknown)=>typeof s!=="string"||!id.test(s))||!e.context||typeof e.context!=="object")fail();edges.add(e.id)}
 return x as unknown as IsiMechanismRelease;
}
export async function fetchIsiMechanismRelease(config:{origin:string;path:string;bearerToken:string;timeoutMs?:number},transport:IsiMechanismTransport):Promise<IsiMechanismRelease>{
 const url=new URL(config.origin);
 if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash||!url.hostname||url.hostname==="localhost"||/^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)||!/^\/[A-Za-z0-9/_-]{1,160}$/.test(config.path)||!config.bearerToken||config.bearerToken.length>4096)fail();
 const ms=config.timeoutMs??8000;if(!Number.isInteger(ms)||ms<100||ms>15000)fail();
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),ms);
 try{const response=await transport.get(new URL(config.path,url).toString(),"Bearer "+config.bearerToken,controller.signal);if(response.status!==200)fail();return validateIsiMechanismRelease(response.body)}catch{fail()}finally{clearTimeout(timer)}
}
