/** Retrieval-only dry run against Europe PMC. Usage: bun scripts/retrieval-dry-run.ts --question "..." --terms-ref <signed-terms-ref> [--terms "a,b"] [--articles 3]
 * Sends only allow-listed GET requests (search + open-access full text). No model is called, nothing is stored, no passage text is printed.
 * Refuses without a source terms reference: a human must have signed off Europe PMC terms first.
 */
import {runRetrievalDryRun} from "../src/retrievalDryRun";
const args=process.argv.slice(2),flag=(n:string)=>{const i=args.indexOf(n);return i>=0?args[i+1]:undefined};
const question=flag("--question"),termsRef=flag("--terms-ref");
if(!question||!termsRef){console.error("Usage: bun scripts/retrieval-dry-run.ts --question \"...\" --terms-ref <signed terms reference> [--terms a,b] [--articles 1-5]");process.exit(2)}
const articles=Number(flag("--articles")??3);
try{
 const report=await runRetrievalDryRun({question,termsRef,fetcher:fetch,extraTerms:(flag("--terms")??"").split(",").map(t=>t.trim()).filter(Boolean),maxArticlesPerIntent:articles});
 console.log(JSON.stringify(report,null,2));
}catch(error){console.error(`Dry run refused or failed: ${error instanceof Error?error.message:"unknown error"}`);process.exit(1)}
export {};
