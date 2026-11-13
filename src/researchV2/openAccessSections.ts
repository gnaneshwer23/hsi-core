/**
 * P2-02: bounded section-level extraction from Europe PMC open-access JATS XML.
 * The excerpt retriever returns only the first abstract paragraph; an investigation needs the methods and
 * results paragraphs that carry species, tissue, assay and estimand. Output is candidate text only: licence,
 * correction status and reuse rights are NOT verified here (see sourceClearance.ts).
 * No XML parser or HTML rendering: a tag tokenizer with hard bounds, failing closed.
 */
import {createHash} from "node:crypto";
import {assertSafeArticleXml,validPmcid} from "./openAccessPassages";
import type {SourceFetcher} from "./sourceAdapters";
import type {ResearchPassage} from "../researchContracts";

export type OpenAccessSectionKind="abstract"|"introduction"|"methods"|"results"|"discussion"|"other";
export interface OpenAccessParagraph{id:string;text:string;sha256:string;locator:string}
export interface OpenAccessSection{kind:OpenAccessSectionKind;title:string;paragraphs:OpenAccessParagraph[]}
export interface OpenAccessSections{
 pmcid:string;sections:OpenAccessSection[];paragraphCount:number;skippedParagraphs:number;truncated:boolean;
 reuseRightsVerified:false;correctionStatusVerified:false;
}
const MAX_PARAGRAPHS=400,MIN_CHARS=40,MAX_CHARS=3000,MAX_TITLE=160;
const NAMED:Record<string,string>={amp:"&",lt:"<",gt:">",quot:'"',apos:"'"};
const sha256Hex=(text:string)=>createHash("sha256").update(text).digest("hex");

export function classifySectionTitle(title:string):OpenAccessSectionKind{
 const t=title.toLowerCase();
 if(/\b(materials?|methods?|experimental procedures?|study design|patients and)\b/.test(t))return "methods";
 if(/\bresults?\b|\bfindings\b/.test(t))return "results";
 if(/\bdiscussion\b|\bconclusions?\b/.test(t))return "discussion";
 if(/\bintroduction\b|\bbackground\b/.test(t))return "introduction";
 if(/\babstract\b/.test(t))return "abstract";
 return "other";
}
/** Strip tags, decode a closed set of entities, collapse whitespace. Returns null when other entities remain. */
function cleanText(fragment:string):string|null{
 const noTags=fragment.replace(/<[^>]*>/g," ");
 let unsupported=false;
 const decoded=noTags.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi,(whole,name:string)=>{
  const named=NAMED[name.toLowerCase()];if(named!==undefined)return named;unsupported=true;return whole;
 });
 if(unsupported)return null;
 return decoded.replace(/\s+/g," ").trim();
}

export function extractOpenAccessSections(xml:string,pmcid:string):OpenAccessSections{
 if(!validPmcid.test(pmcid))throw Error("Invalid PMCID");
 assertSafeArticleXml("application/xml",xml);
 // Drop blocks whose paragraphs are not body prose: references, back matter, figures, tables, footnotes.
 const prose=xml.replace(/<(ref-list|back|fig|table-wrap|fn-group|supplementary-material)\b[\s\S]*?<\/\1>/gi," ");
 const abstract=prose.match(/<abstract\b[\s\S]*?<\/abstract>/i)?.[0]??"";
 const body=prose.match(/<body\b[\s\S]*?<\/body>/i)?.[0]??"";
 if(!abstract&&!body)throw Error("No abstract or body found");
 const sections:OpenAccessSection[]=[],byKey=new Map<string,OpenAccessSection>();
 let paragraphCount=0,skipped=0,truncated=false;
 const walk=(region:string,rootTitle:string)=>{
  const stack:{title:string}[]=rootTitle?[{title:rootTitle}]:[];
  const token=/<(\/?)sec\b[^>]*>|<title\b[^>]*>([\s\S]*?)<\/title>|<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match:RegExpExecArray|null,pendingSecTitle=false;
  while((match=token.exec(region))!==null){
   if(match[0].toLowerCase().startsWith("<sec")||match[0].toLowerCase().startsWith("</sec")){
    if(match[1]==="/"){stack.pop();pendingSecTitle=false}else{stack.push({title:""});pendingSecTitle=true}
    continue;
   }
   if(match[2]!==undefined){
    const title=cleanText(match[2]);
    if(pendingSecTitle&&stack.length&&title!==null){stack[stack.length-1]!.title=title.slice(0,MAX_TITLE);pendingSecTitle=false}
    continue;
   }
   pendingSecTitle=false;
   if(paragraphCount>=MAX_PARAGRAPHS){truncated=true;break}
   const text=cleanText(match[3]??"");
   if(text===null||text.length<MIN_CHARS||text.length>MAX_CHARS){skipped++;continue}
   const path=stack.map(s=>s.title).filter(Boolean),title=path.join(" > ")||"(untitled)";
   const kind=classifySectionTitle(path.join(" ")||rootTitle);
   const key=kind+"|"+title;let section=byKey.get(key);
   if(!section){section={kind,title,paragraphs:[]};byKey.set(key,section);sections.push(section)}
   paragraphCount++;
   section.paragraphs.push({id:pmcid+":p"+paragraphCount,text,sha256:sha256Hex(text),locator:title+" ¶"+(section.paragraphs.length+1)});
  }
 };
 if(abstract)walk(abstract,"Abstract");
 if(body)walk(body,"");
 return {pmcid,sections,paragraphCount,skippedParagraphs:skipped,truncated,reuseRightsVerified:false,correctionStatusVerified:false};
}

export async function retrieveOpenAccessSections(pmcid:string,fetcher:SourceFetcher=fetch):Promise<OpenAccessSections>{
 if(!validPmcid.test(pmcid))throw Error("Invalid PMCID");
 const response=await fetcher("https://www.ebi.ac.uk/europepmc/webservices/rest/"+pmcid+"/fullTextXML",{headers:{Accept:"application/xml"},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error("Full text unavailable: "+response.status);
 const xml=await response.text();
 assertSafeArticleXml(response.headers.get("content-type")??"",xml);
 return extractOpenAccessSections(xml,pmcid);
}

/** Candidate passages for an audit search hit. Rights and clearance remain separate attestations. */
export function sectionsToPassages(sections:OpenAccessSections,input:{sourceId:string;sourceVersion:string;kinds?:readonly OpenAccessSectionKind[]}):ResearchPassage[]{
 const kinds=new Set(input.kinds??["results","methods"]);
 return sections.sections.filter(s=>kinds.has(s.kind)).flatMap(s=>s.paragraphs.map(p=>({
  id:input.sourceId+":"+p.id,sourceId:input.sourceId,sourceVersion:input.sourceVersion,text:p.text,locator:p.locator,dataClass:"public_real" as const,sha256:p.sha256,
 })));
}
