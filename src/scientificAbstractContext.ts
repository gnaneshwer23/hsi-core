/**
 * v2.3: source-grounded abstract inspection. This does NOT extract validated claims.
 * Europe PMC returns source abstracts, and lexical annotations are explicitly candidates.
 */
export type ContextCandidate={label:string;category:"disease"|"cell"|"cytokine"|"phenotype"|"tissue";matchedText:string;status:"lexical_mention_only"};
export type AbstractContext={pmid:string;source:"Europe PMC";sourceUrl:string;retrievedAt:string;title:string;abstractText:string|null;availability:"abstract_available"|"abstract_unavailable";candidates:ContextCandidate[];reviewStatus:"unreviewed";limitations:string[]};
const TERMS:{label:string;category:ContextCandidate["category"];pattern:RegExp}[]=[
 {label:"Systemic sclerosis",category:"disease",pattern:/\b(systemic sclerosis|scleroderma)\b/i},
 {label:"T follicular helper cells",category:"cell",pattern:/\b(Tfh(?: cells?)?|T follicular helper(?: cells?)?)\b/i},
 {label:"B cells",category:"cell",pattern:/\bB[ -]?cells?\b/i},
 {label:"IL-21",category:"cytokine",pattern:/\bIL[ -]?21\b/i},
 {label:"Fibrosis",category:"phenotype",pattern:/\bfibros(?:is|es|tic)\b/i},
 {label:"Fibroblasts",category:"cell",pattern:/\bfibroblasts?\b/i},
 {label:"Skin",category:"tissue",pattern:/\bskin\b/i},
 {label:"Lung",category:"tissue",pattern:/\b(lung|pulmonary)\b/i},
];
export function annotateAbstract(text:string):ContextCandidate[]{
 return TERMS.flatMap(t=>{const m=text.match(t.pattern);return m?[{label:t.label,category:t.category,matchedText:m[0],status:"lexical_mention_only" as const}]:[];});
}
export async function retrieveAbstractContext(pmid:string,fetcher:typeof fetch=fetch,signal?:AbortSignal):Promise<AbstractContext>{
 if(!/^\d{1,12}$/.test(pmid))throw new Error("Invalid PubMed identifier");
 const url="https://www.ebi.ac.uk/europepmc/webservices/rest/search?"+new URLSearchParams({query:"EXT_ID:"+pmid+" AND SRC:MED",format:"json",pageSize:"1",resultType:"core"}).toString();
 const response=await fetcher(url,{headers:{Accept:"application/json"},signal});
 if(!response.ok)throw new Error("Europe PMC returned "+response.status);
 const data=await response.json() as any;
 const item=(Array.isArray(data?.resultList?.result)?data.resultList.result:[]).find((x:any)=>String(x?.id)===pmid&&x?.source==="MED");
 if(!item)throw new Error("Publication not found in Europe PMC");
 const title=typeof item.title==="string"?item.title:"";
 const abstractText=typeof item.abstractText==="string"&&item.abstractText.trim()?item.abstractText.trim():null;
 // Lexical matches from abstract only; title must not imply evidence.
 const candidates=abstractText?annotateAbstract(abstractText):[];
 return {pmid,source:"Europe PMC",sourceUrl:"https://europepmc.org/article/MED/"+pmid,retrievedAt:new Date().toISOString(),title,abstractText,availability:abstractText?"abstract_available":"abstract_unavailable",candidates,reviewStatus:"unreviewed",limitations:["Lexical mentions do not establish direction, causality, tissue specificity or experimental support.","The abstract is incomplete evidence; verify full text, cohort, assay, species, outcomes and limitations.","No graph facts or reviewer approvals were created."]};
}
