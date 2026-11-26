import {test,expect} from "bun:test";
import {createProvenanceCapture} from "../src/scientificMemoryProvenanceCapture";
import type {PubmedXmlNode,PubmedXmlParser} from "../src/scientificMemoryPubmedXml";
const xml="<PubmedArticleSet><PubmedArticle><MedlineCitation><PMID>123</PMID></MedlineCitation></PubmedArticle></PubmedArticleSet>";
const node=(name:string,text="",children:PubmedXmlNode[]=[]):PubmedXmlNode=>({name,text,children,attributes:{}});
const parser:PubmedXmlParser={parse(input,options){expect(input).toBe(xml);expect(options.externalEntities).toBe(false);expect(options.resolveDtd).toBe(false);return node("PubmedArticleSet","",[node("PubmedArticle","",[node("MedlineCitation","",[node("PMID","123")])])]);}};
test("fixture XML projection and digest use one response",async()=>{
 let calls=0;
 const gateway=createProvenanceCapture(async()=>{calls++;return new Response(xml,{headers:{"content-type":"application/xml"}});},true,()=>0,parser);
 const r=await gateway.capturePubmed("123");
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(xml));
 expect(r.provenance.payloadSha256).toBe(Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join(""));
 expect(calls).toBe(1);expect(r.parserAccepted).toBe(false);expect(r.ingestionAllowed).toBe(false);
 await expect(gateway.capturePubmed("999")).rejects.toThrow();
});
test("missing fixture parser fails before network retrieval",async()=>{let calls=0;const gateway=createProvenanceCapture(async()=>{calls++;throw Error("unexpected");},true);await expect(gateway.capturePubmed("123")).rejects.toThrow("Fixture XML parser required");expect(calls).toBe(0);});
