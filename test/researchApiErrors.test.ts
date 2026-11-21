import {describe,expect,test} from "bun:test";
import {
  messageForResearchCode,
  messageForResearchStatus,
  parseResearchErrorBody,
  researchApiErrorMessage,
} from "../site/src/lib/researchApiErrors";

function jsonRes(status:number,body:unknown,headers:Record<string,string>={}):Response{
 return new Response(JSON.stringify(body),{
  status,
  headers:{"content-type":"application/json",...headers},
 });
}

describe("researchApiErrors",()=>{
 test("parses code and error without throwing on non-JSON",async()=>{
  expect(await parseResearchErrorBody(jsonRes(403,{code:"RESEARCH_WRITES_DISABLED",error:"writes off"}))).toEqual({
   code:"RESEARCH_WRITES_DISABLED",
   error:"writes off",
  });
  expect(await parseResearchErrorBody(new Response("not-json",{status:500}))).toEqual({});
 });

 test("maps known codes to honesty copy by context",()=>{
  expect(messageForResearchCode("AUTH_REQUIRED","workspace_load")).toContain("Sign in");
  expect(messageForResearchCode("AUTH_REQUIRED","workspace_create")).toContain("Sign in again");
  expect(messageForResearchCode("RESEARCH_WRITES_DISABLED","workspace_create")).toContain("not available");
  expect(messageForResearchCode("INVALID_CREATE_INVESTIGATION","workspace_create")).toContain("Patient information");
  expect(messageForResearchCode("UNKNOWN_SCENARIO","live_run")).toContain("scenario");
  expect(messageForResearchCode("MADE_UP_CODE","generic")).toBeUndefined();
 });

 test("researchApiErrorMessage prefers code and appends Retry-After on rate limits",async()=>{
  const writes=await researchApiErrorMessage(
   jsonRes(403,{code:"RESEARCH_WRITES_DISABLED",error:"ignored prose"}),
   "workspace_create",
   "fallback",
  );
  expect(writes).toContain("not available");
  expect(writes).not.toBe("ignored prose");

  const limited=await researchApiErrorMessage(
   jsonRes(429,{code:"RATE_LIMITED",error:"Rate limit reached. Try again later."},{"Retry-After":"600"}),
   "live_run",
   "fallback",
  );
  expect(limited).toContain("Rate limit reached");
  expect(limited).toContain("about 10 minute");
 });

 test("workspace load without a code prefers status honesty over opaque server error tokens",async()=>{
  expect(messageForResearchStatus(401,"workspace_load")).toContain("Sign in");
  expect(messageForResearchStatus(403,"workspace_load")).toContain("Research access has not been confirmed");
  const auth=await researchApiErrorMessage(
   jsonRes(401,{error:"Authentication required"}),
   "workspace_load",
   "fallback",
  );
  expect(auth).toContain("Sign in with a verified research account");
  const denied=await researchApiErrorMessage(
   jsonRes(403,{error:"Denied"}),
   "workspace_load",
   "fallback",
  );
  expect(denied).toContain("Research access has not been confirmed");
 });
});
