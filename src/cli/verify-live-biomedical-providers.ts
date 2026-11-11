import {verifyLiveBiomedicalProviders} from "../evidence/liveProviderVerification";

/**
 * Explicit network opt-in. Never executed by import or normal unit tests.
 * Usage: bun src/cli/verify-live-biomedical-providers.ts --live
 */
if(!process.argv.includes("--live")){
  console.error("Live biomedical verification requires --live");
  process.exitCode=2;
}else{
  const report=await verifyLiveBiomedicalProviders({
    proteinAccession:process.env.HSI_TEST_UNIPROT_ACCESSION||"P01375",
    reactomeStableId:process.env.HSI_TEST_REACTOME_ID||"R-HSA-199420",
  });
  console.log(JSON.stringify(report,null,2));
  if(!report.allPassed)process.exitCode=1;
}
