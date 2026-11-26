import {interpretEuropePmcIdentity} from "./scientificMemoryEuropePmc";
import {interpretEuropePmcNotices} from "./scientificMemoryEuropePmcNotices";
// Candidate JSON mapping based on documented core commentCorrectionList fields.
// https://europepmc.org/docs/EBI_Europe_PMC_Web_Service_Reference.pdf
const relations:ReadonlyMap<string,string>=new Map([["retraction in","RetractionIn"],["erratum in","ErratumIn"],["expression of concern in","ExpressionOfConcernIn"],["update in","UpdateIn"],["republished in","RepublishedIn"]]);
export function projectEuropePmcCore(pmid:string,payload:unknown){
 const identity=interpretEuropePmcIdentity(pmid,payload);
 const row=(payload as {resultList:{result:Record<string,unknown>[]}}).resultList.result[0];
 if(!row)throw Error("Missing record");
 const list=row.commentCorrectionList;
 let links:{source:string;relation:string;pmid:string}[]=[];
 let unmapped=0;
 if(list!==undefined){
 if(!list||typeof list!=="object")throw Error("Invalid notice list");
 const entries=(list as {commentCorrection?:unknown}).commentCorrection;
 if(!Array.isArray(entries)||entries.length>1000)throw Error("Invalid notice entries");
 for(const e of entries){
 if(!e||typeof e!=="object"||typeof e.type!=="string"||e.type.length>128)throw Error("Invalid notice type");
 const relation=relations.get(e.type.trim().toLowerCase());
 if(!relation){unmapped++;continue;}
 if(e.source!=="MED"||typeof e.id!=="string")throw Error("Unsupported adverse notice identity");
 links.push({source:e.source,relation,pmid:e.id});
 }
 }
 return {...interpretEuropePmcNotices(identity,{source:"MED",pmid,links}),unmappedNoticeCount:unmapped,liveSchemaVerified:false as const};
}
