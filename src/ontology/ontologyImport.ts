import {parseOntology,type ExtractedOntology} from "./oboTerms";

export type ImportSource={prefix:string;name:string;licence:string;release:string;format:"obo"|"obo-json";url:string;sha256:string|null;bytes:number|null;termCount:number|null;dataVersion?:string|null};
export type ImportManifest={schemaVersion:"hsi-ontology-import-manifest-1";approvedOn:string;approvedBy:string;skipped:{prefix:string;reason:string}[];storesIn:string;sources:ImportSource[]};

export async function sha256Hex(bytes:Uint8Array):Promise<string>{
 const h=await globalThis.crypto.subtle.digest("SHA-256",bytes as Uint8Array<ArrayBuffer>);return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
/** A download is accepted only if it matches the pinned hash (when recorded), parses, and yields terms under the expected prefix. */
export async function ingestRelease(source:ImportSource,bytes:Uint8Array):Promise<{sha256:string;extracted:ExtractedOntology}>{
 const sha256=await sha256Hex(bytes);
 if(source.sha256&&source.sha256!==sha256)throw Error(`${source.prefix}: downloaded file does not match the pinned sha256`);
 const extracted=parseOntology(source.format,new TextDecoder().decode(bytes),source.prefix);
 if(extracted.terms.length<100)throw Error(`${source.prefix}: only ${extracted.terms.length} terms found under the ${source.prefix}: prefix; refusing to record this release`);
 return {sha256,extracted};
}
