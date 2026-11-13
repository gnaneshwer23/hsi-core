/**
 * B-04.4: live Europe PMC OA XML retrieval. Fail closed on unknown licences.
 * The output is a candidate excerpt, never a rights-attested verified passage.
 */
import type {SourceFetcher} from "./sourceAdapters";
export interface OpenAccessExcerpt {
 pmcid:string;url:string;retrievedAt:string;licenceUrl:string|null;
 passage:string;sha256:string;reuseRightsVerified:false;correctionStatusVerified:false;
}
export const validPmcid=/^PMC[1-9][0-9]{0,11}$/;
export const MAX_BYTES=2_000_000;
/** Shared guard for every Europe PMC full-text read: XML content type, size cap, article root, no DTD/entities. */
export function assertSafeArticleXml(contentType:string,xml:string):void{
 if(!/xml/i.test(contentType))throw Error("Unexpected full text content type");
 if(xml.length===0||new TextEncoder().encode(xml).length>MAX_BYTES||!/<article(?:\s|>)/.test(xml)||/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error("Unsafe or invalid article XML");
}
export async function retrieveOpenAccessExcerpt(pmcid:string,fetcher:SourceFetcher=fetch):Promise<OpenAccessExcerpt>{
 if(!validPmcid.test(pmcid))throw Error("Invalid PMCID");
 const url="https://www.ebi.ac.uk/europepmc/webservices/rest/"+pmcid+"/fullTextXML";
 const response=await fetcher(url,{headers:{Accept:"application/xml"},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error("Full text unavailable: "+response.status);
 const xml=await response.text();
 assertSafeArticleXml(response.headers.get("content-type")??"",xml);
 // Extract only plain text from the first abstract paragraph. No XML parser or arbitrary HTML rendering.
 const abstract=xml.match(/<abstract(?:\s[^>]*)?>([\s\S]{0,150000}?)<\/abstract>/i)?.[1];
 if(!abstract)throw Error("No bounded abstract found");
 const paragraph=abstract.match(/<p(?:\s[^>]*)?>([\s\S]{0,12000}?)<\/p>/i)?.[1];
 if(!paragraph)throw Error("No abstract paragraph");
 const passage=paragraph.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
 if(passage.length<20||passage.length>3000||/&(?:#\d+|#x[0-9a-f]+|[a-z]+);/i.test(passage))throw Error("Unsupported passage encoding or size");
 const licenceUrl=xml.match(/<license(?:\s[^>]*)?>([\s\S]{0,10000}?)<\/license>/i)?.[1]?.match(/https:\/\/creativecommons\.org\/licenses\/[a-z-]+\/[0-9.]+\/?/i)?.[0]??null;
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(passage));
 const sha256=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
 return {pmcid,url,retrievedAt:new Date().toISOString(),licenceUrl,passage,sha256,reuseRightsVerified:false,correctionStatusVerified:false};
}
