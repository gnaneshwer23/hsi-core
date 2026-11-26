import {normalizePmid} from "./scientificMemoryPubmed";
import {normalizeEvidenceDoi,interpretCrossrefStatus} from "./scientificMemoryCrossref";
import {projectEuropePmcCore} from "./scientificMemoryEuropePmcCore";
import {projectPubmedXml,type PubmedXmlParser} from "./scientificMemoryPubmedXml";
type Authority="crossref"|"pubmed"|"europe_pmc";
type Fetcher=(url:string,init:RequestInit)=>Promise<Response>;
/** Isolated capture gateway. Injected transport and clock are trusted fixture dependencies, not client inputs. */
export function createProvenanceCapture(fetcher:Fetcher,enabled=false,clock:()=>number=Date.now,fixtureParser?:PubmedXmlParser){
 async function captureInternal(authority:Authority,identifier:string,project:"europe_pmc"|"crossref"|"pubmed"|false){
 if(!enabled)throw Error("Capture disabled");
 if(project==="pubmed"&&!fixtureParser)throw Error("Fixture XML parser required");
 let url:string;
 switch(authority){
 case "crossref":url="https://api.crossref.org/works/"+encodeURIComponent(normalizeEvidenceDoi(identifier));break;
 case "pubmed":url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?"+new URLSearchParams({db:"pubmed",retmode:"xml",id:normalizePmid(identifier)});break;
 case "europe_pmc":url="https://www.ebi.ac.uk/europepmc/webservices/rest/search?"+new URLSearchParams({query:"EXT_ID:"+normalizePmid(identifier)+" AND SRC:MED",format:"json",resultType:"core",pageSize:"2"});break;
 default:throw Error("Unsupported authority");
 }
 const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
 const run=async()=>{
 const response=await fetcher(url,{method:"GET",redirect:"error",credentials:"omit",signal:controller.signal,headers:{Accept:authority==="pubmed"?"application/xml,text/xml":"application/json"}});
 if(!response.ok||!response.body||response.redirected)throw Error("Capture failed");
 const mediaType=(response.headers.get("content-type")??"").split(";")[0]?.trim().toLowerCase();
 if(authority==="pubmed"?mediaType!=="application/xml"&&mediaType!=="text/xml":mediaType!=="application/json")throw Error("Unexpected media type");
 const reader=response.body.getReader();const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const c=await reader.read();if(c.done)break;size+=c.value.byteLength;if(size>2097152){controller.abort();throw Error("Capture too large");}chunks.push(c.value);}}finally{reader.releaseLock();}
 if(!size)throw Error("Empty capture");
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 const digest=await crypto.subtle.digest("SHA-256",bytes);
 const payloadSha256=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
 const checkedAt=new Date(clock()).toISOString();
 const provenance={authority,endpoint:url,checkedAt,payloadSha256,byteLength:size,mediaType,authorityAuthenticated:false as const,ingestionAllowed:false as const,scientificClaimAllowed:false as const};
 const decoded=project?new TextDecoder("utf-8",{fatal:true}).decode(bytes):"";
 const payload:unknown=project&&project!=="pubmed"?JSON.parse(decoded):null;
 const pubmedCandidate=project==="pubmed"&&fixtureParser?projectPubmedXml(identifier,decoded,fixtureParser):null;
 const candidate=project==="europe_pmc"?projectEuropePmcCore(normalizePmid(identifier),payload):null;
 const crossrefCandidate=project==="crossref"?interpretCrossrefStatus(identifier,payload):null;
 return {provenance,candidate,crossrefCandidate,pubmedCandidate};
 };
 try{return await Promise.race([run(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error("Capture timeout"));},5000);})]);}finally{if(timer!==undefined)clearTimeout(timer);}
 }
 return {
 async capture(authority:Authority,identifier:string){return (await captureInternal(authority,identifier,false)).provenance;},
 async captureEuropePmc(identifier:string){const result=await captureInternal("europe_pmc",identifier,"europe_pmc");if(!result.candidate)throw Error("Missing projection");return {provenance:result.provenance,candidate:result.candidate,ingestionAllowed:false as const,scientificClaimAllowed:false as const};},
 async captureCrossref(identifier:string){const result=await captureInternal("crossref",identifier,"crossref");if(!result.crossrefCandidate)throw Error("Missing projection");return {provenance:result.provenance,candidate:result.crossrefCandidate,ingestionAllowed:false as const,scientificClaimAllowed:false as const};},
 async capturePubmed(identifier:string){const result=await captureInternal("pubmed",identifier,"pubmed");if(!result.pubmedCandidate)throw Error("Missing projection");return {provenance:result.provenance,candidate:result.pubmedCandidate,parserAccepted:false as const,ingestionAllowed:false as const,scientificClaimAllowed:false as const};}
 };
}
