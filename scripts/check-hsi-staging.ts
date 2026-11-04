/** Safe standalone preflight. Never reads DATABASE_URL or modifies any branch/account. */
import {inspectNeonBranches,inspectSignIn} from "./lib/hsiStagingPreflight";
const report:Record<string,unknown>={mode:"read_only",productionModified:false,migrationsRun:false,accountsCreated:false};
const key=process.env.NEON_API_KEY;
if(!key)report.neon={status:"blocked",reason:"NEON_API_KEY is not configured in this runtime"};
else try{report.neon={status:"checked",...await inspectNeonBranches(key)};}catch(error){report.neon={status:"blocked",reason:error instanceof Error&&error.message.startsWith("Neon ")?error.message:"Management access failed; no service result or database operation was obtained"};}
const origin=process.env.HSI_STAGING_APP_URL;
if(!origin)report.signIn={status:"blocked",reason:"HSI_STAGING_APP_URL is not confirmed; no production URL substituted"};
else try{const url=new URL(origin);url.pathname="/sign-in";report.signIn={status:"checked",...await inspectSignIn(url.href)};}catch{report.signIn={status:"blocked",reason:"Staging sign-in could not be reached or its URL was invalid"};}
const neon=report.neon as {status:string;branches?:{exists:boolean;safeNonProduction:boolean}[]};
const signIn=report.signIn as {status:string;httpStatus?:number};
const controlPlanePassed=neon.status==="checked"&&neon.branches?.length===2&&neon.branches.every(b=>b.exists&&b.safeNonProduction);
const pageReachable=signIn.status==="checked"&&typeof signIn.httpStatus==="number"&&signIn.httpStatus>=200&&signIn.httpStatus<300;
report.controlPlaneChecksPassed=Boolean(controlPlanePassed);
report.signInPageReachable=pageReachable;
report.authenticatedSignInVerified=false;
report.independentReviewerVerified=false;
console.log(JSON.stringify(report,null,2));
if(!controlPlanePassed||!pageReachable)process.exitCode=2;
