/** Open-access methods text from Europe PMC, licence-filtered. Only papers whose record states a CC BY or CC0 licence are used, so short quoted passages are permitted. */
import type {FetchLike} from "../fetchLike";
const BASE="https://www.ebi.ac.uk/europepmc/webservices/rest";
export const OPEN_LICENCE=/^(cc[ -]?by(?![ -]?(nc|nd))[\w .-]*|cc0[\w .-]*)$/i;
export type OaPaper={pmcid:string;title:string;url:string;licence:string};
export function parseSearch(body:unknown,limit:number):OaPaper[]{
 const rs=(body as any)?.resultList?.result;if(!Array.isArray(rs))throw Error("Unexpected Europe PMC response");
 const out:OaPaper[]=[];
 for(const r of rs){
  const pmcid=typeof r?.pmcid==="string"&&/^PMC\d{4,9}$/.test(r.pmcid)?r.pmcid:null,lic=typeof r?.license==="string"?r.license.trim():"";
  if(!pmcid||!OPEN_LICENCE.test(lic)||typeof r.title!=="string")continue;
  out.push({pmcid,title:r.title.replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim().slice(0,300),url:"https://europepmc.org/article/PMC/"+pmcid.slice(3),licence:lic.slice(0,40)});
  if(out.length>=limit)break;
 }
 return out;
}
const ENT:Record<string,string>={amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" ",micro:"µ",deg:"°",times:"×",ndash:"–",mdash:"—"};
const decode=(s:string)=>s.replace(/&#x([0-9a-f]+);/gi,(_,h)=>{const n=parseInt(h,16);return n>0&&n<0x110000?String.fromCodePoint(n):""}).replace(/&#(\d+);/g,(_,d)=>{const n=Number(d);return n>0&&n<0x110000?String.fromCodePoint(n):""}).replace(/&([a-z]+);/gi,(m,e)=>ENT[e.toLowerCase()]??m);
/** The methods section of a JATS full-text document as plain text, or null if none is found. Bounded. */
export function methodsText(xml:string):string|null{
 const x=xml.length>3_000_000?xml.slice(0,3_000_000):xml;
 let start=x.search(/<sec[^>]*sec-type="[^"]*methods[^"]*"[^>]*>/i);
 if(start<0){const t=/<title>\s*(?:materials and methods|methods|experimental procedures|experimental methods)\s*<\/title>/i.exec(x);if(t)start=t.index}
 if(start<0)return null;
 let seg=x.slice(start,start+120_000);
 const end=seg.slice(20).search(/<sec[^>]*sec-type="[^"]*(?:results|discussion|conclusion)[^"]*"/i);if(end>=0)seg=seg.slice(0,end+20);
 const text=decode(seg.replace(/<xref[^>]*>.*?<\/xref>/gi,"").replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim();
 return text.length>200?text.slice(0,60_000):null;
}
export async function searchOpenAccess(query:string,limit:number,f:FetchLike=fetch,signal?:AbortSignal):Promise<OaPaper[]>{
 const u=new URL(BASE+"/search");u.searchParams.set("query",`(${query}) AND OPEN_ACCESS:Y AND HAS_FT:Y AND NOT PUB_TYPE:"Review"`);u.searchParams.set("format","json");u.searchParams.set("resultType","core");u.searchParams.set("pageSize","25");
 const r=await f(u.toString(),{headers:{Accept:"application/json"},signal});if(!r.ok)throw Error("Europe PMC HTTP "+r.status);
 return parseSearch(await r.json(),limit);
}
export async function fetchMethods(pmcid:string,f:FetchLike=fetch,signal?:AbortSignal):Promise<string|null>{
 if(!/^PMC\d{4,9}$/.test(pmcid))throw Error("Bad PMC id");
 const r=await f(`${BASE}/${pmcid}/fullTextXML`,{headers:{Accept:"application/xml"},signal});if(!r.ok)return null;
 const t=await r.text();return methodsText(t);
}
