/**
 * Reads a researcher's own documents (papers, CV, LinkedIn "Save to PDF") IN THE BROWSER. Nothing is uploaded.
 * Text is used only to recognise DOIs, PubMed IDs and graph concepts; the researcher chooses what to keep.
 * PDF reading is best effort: scanned or font-encoded PDFs yield little text, and that is reported, not hidden.
 */
export const MAX_FILES=5,MAX_BYTES=10*1024*1024,ACCEPT=".pdf,.docx,.txt,.md,.csv,.ris,.bib";
export type EvidenceFile={name:string;chars:number;text:string;note:string};

async function inflate(data:Uint8Array,format:"deflate"|"deflate-raw"):Promise<Uint8Array|null>{
 try{
  const s=new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(s).arrayBuffer());
 }catch{return null}
}
const u16=(d:DataView,o:number)=>d.getUint16(o,true),u32=(d:DataView,o:number)=>d.getUint32(o,true);
/** Pulls word/document.xml out of a .docx (zip) and returns its plain text. */
export async function docxText(buf:ArrayBuffer):Promise<string>{
 const b=new Uint8Array(buf),d=new DataView(buf);
 let e=-1;for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--)if(u32(d,i)===0x06054b50){e=i;break}
 if(e<0)return "";
 let o=u32(d,e+16);const n=u16(d,e+10);
 for(let k=0;k<n&&o+46<=b.length;k++){
  if(u32(d,o)!==0x02014b50)break;
  const method=u16(d,o+10),csize=u32(d,o+20),nl=u16(d,o+28),el=u16(d,o+30),cl=u16(d,o+32),lo=u32(d,o+42);
  const name=new TextDecoder().decode(b.subarray(o+46,o+46+nl));
  if(name==="word/document.xml"){
   const start=lo+30+u16(d,lo+26)+u16(d,lo+28),raw=b.subarray(start,start+csize);
   const xml=new TextDecoder().decode(method===0?raw:(await inflate(raw,"deflate-raw"))??new Uint8Array());
   return xml.replace(/<\/w:p>/g,"\n").replace(/<w:tab\/>/g," ").replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'");
  }
  o+=46+nl+el+cl;
 }
 return "";
}
/** Best-effort text from a PDF: inflates content streams and reads the text-showing operators. */
export async function pdfText(buf:ArrayBuffer):Promise<string>{
 const b=new Uint8Array(buf),latin=(x:Uint8Array)=>{let s="";for(let i=0;i<x.length;i+=8192)s+=String.fromCharCode(...x.subarray(i,i+8192));return s};
 const src=latin(b),out:string[]=[src.replace(/[^\x20-\x7e\n]+/g," ")];
 const re=/stream\r?\n/g;let count=0;
 while(re.exec(src)&&count<400){
  const end=src.indexOf("endstream",re.lastIndex);if(end<0)break;count++;
  const body=b.subarray(re.lastIndex,end),t=await inflate(body,"deflate");
  if(!t)continue;
  const s=latin(t);let txt="";
  for(const part of s.matchAll(/\[((?:[^\]\\]|\\.)*)\]\s*TJ|\(((?:[^)\\]|\\.)*)\)\s*Tj/g)){
   const chunk=part[1]??part[2]??"";
   for(const piece of chunk.matchAll(/\(((?:[^)\\]|\\.)*)\)/g))txt+=piece[1]!.replace(/\\([()\\])/g,"$1");
   if(part[2]!==undefined)txt+=part[2].replace(/\\([()\\])/g,"$1");
   txt+=" ";
  }
  out.push(txt.replace(/[^\x20-\x7e]+/g," "));
 }
 return out.join("\n");
}
export async function readEvidenceFile(f:File):Promise<EvidenceFile>{
 const ext=f.name.split(".").pop()?.toLowerCase()??"";
 if(f.size>MAX_BYTES)return {name:f.name,chars:0,text:"",note:"Larger than 10 MB, not read."};
 if(!ACCEPT.split(",").includes("."+ext))return {name:f.name,chars:0,text:"",note:"Unsupported type. Use PDF, Word (.docx), text, CSV, RIS or BibTeX."};
 let text="";
 try{
  if(ext==="docx")text=await docxText(await f.arrayBuffer());
  else if(ext==="pdf")text=await pdfText(await f.arrayBuffer());
  else text=await f.text();
 }catch{return {name:f.name,chars:0,text:"",note:"Could not be read."}}
 text=text.slice(0,400_000);
 const words=(text.match(/[A-Za-z]{3,}/g)??[]).length;
 return {name:f.name,chars:text.length,text,note:words<40?"Little readable text found (scanned or font-encoded files read poorly). Paste the abstract or DOIs instead.":""};
}
/** DOIs and PubMed IDs mentioned in text, normalised for the papers box. */
export function refsFrom(text:string):string[]{
 const out=new Set<string>();
 for(const m of text.matchAll(/\b10\.\d{4,9}\/[^\s"<>()\[\],;]+/g))out.add(m[0].replace(/[.:]+$/,"").toLowerCase());
 for(const m of text.matchAll(/PMID:?\s*(\d{6,9})/gi))out.add(m[1]!);
 return [...out].slice(0,20);
}
