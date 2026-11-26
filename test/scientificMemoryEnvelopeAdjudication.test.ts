import {test,expect} from "bun:test";
import {createProvenanceCapture} from "../src/scientificMemoryProvenanceCapture";
import {adjudicateCapturedPublication} from "../src/scientificMemoryEnvelopeAdjudication";
import type {PubmedXmlNode} from "../src/scientificMemoryPubmedXml";
const doi="10.1234/example";
const node=(name:string,text="",children:PubmedXmlNode[]=[],attributes:Record<string,string>={}):PubmedXmlNode=>({name,text,children,attributes});
function gateway(otherDoi:string){
 return createProvenanceCapture(async url=>{
 const host=new URL(url).hostname;
 if(host==="api.crossref.org")return Response.json({status:"ok","message-type":"work",message:{DOI:doi}});
 if(host==="www.ebi.ac.uk")return Response.json({hitCount:1,resultList:{result:[{source:"MED",id:"123",pmid:"123",doi:otherDoi,commentCorrectionList:{commentCorrection:[{type:"Retraction in",source:"MED",id:"456"}]}}]}});
 return new Response("<fixture/>",{headers:{"content-type":"application/xml"}});
 },true,()=>0,{parse:()=>node("PubmedArticleSet","",[node("PubmedArticle","",[node("MedlineCitation","",[node("PMID","123")]),node("PubmedData","",[node("ArticleIdList","",[node("ArticleId",doi,[],{IdType:"doi"})])])])])});
}
test("linked adverse notice quarantines candidate without promotion",async()=>{const r=await adjudicateCapturedPublication(gateway(doi),doi,"123","v1",()=>0);expect(r.decision).toBe("quarantine");expect(r.provenance.length).toBe(3);expect(r.versionVerified).toBe(false);expect(r.ingestionAllowed).toBe(false);});
test("conflicting DOI prevents attribution of adverse notice",async()=>{const r=await adjudicateCapturedPublication(gateway("10.1234/other"),doi,"123","v1",()=>0);expect(r.identityConflict).toBe(true);expect(r.decision).toBe("recheck_required");expect(r.linkedAuthorities).toEqual(["crossref"]);});
