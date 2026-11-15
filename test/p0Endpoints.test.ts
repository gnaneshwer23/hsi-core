import {beforeEach,describe,expect,test} from "bun:test";
import {handleHealth} from "../src/server/healthHandler";
import {handleCspReport,reduceReport,resetCspReportLimiter} from "../src/server/cspReportHandler";

const post=(body:string,type="application/csp-report")=>new Request("https://x.test/api/csp-report",{method:"POST",headers:{"content-type":type},body});
const legacy={"csp-report":{"document-uri":"https://x.test/research/home?token=SECRET#frag","blocked-uri":"https://evil.example/a.js?k=SECRET","effective-directive":"script-src-elem","script-sample":"alert(1) secret text"}};

describe("health",()=>{
 test("GET returns ok with no detail",async()=>{const r=handleHealth(new Request("https://x.test/api/health"),()=>0);expect(r.status).toBe(200);expect(await r.json()).toEqual({status:"ok",time:"1970-01-01T00:00:00.000Z"});expect(r.headers.get("cache-control")).toBe("no-store")});
 test("HEAD has no body, POST is refused",async()=>{expect(await handleHealth(new Request("https://x.test/h",{method:"HEAD"})).text()).toBe("");expect(handleHealth(new Request("https://x.test/h",{method:"POST"})).status).toBe(405)});
});

describe("csp report",()=>{
 beforeEach(resetCspReportLimiter);
 test("logs a reduced record: no query, fragment or sample",async()=>{
  const lines:string[]=[];const r=await handleCspReport(post(JSON.stringify(legacy)),{log:l=>lines.push(l)});
  expect(r.status).toBe(204);expect(lines).toHaveLength(1);
  expect(JSON.parse(lines[0]!)).toEqual({event:"csp_violation",directive:"script-src-elem",blocked:"https://evil.example",page:"/research/home"});
  expect(lines[0]).not.toContain("SECRET");expect(lines[0]).not.toContain("alert");
 });
 test("accepts the Reporting API format",()=>{
  expect(reduceReport([{type:"csp-violation",body:{documentURL:"https://x.test/a?b=1",blockedURL:"inline",effectiveDirective:"style-src-attr"}}])).toEqual({directive:"style-src-attr",blocked:"inline",page:"/a"});
 });
 test("rejects wrong method, type, size, bad JSON and shapes",async()=>{
  expect((await handleCspReport(new Request("https://x.test/c"))).status).toBe(405);
  expect((await handleCspReport(post("{}","text/plain"))).status).toBe(415);
  expect((await handleCspReport(post(JSON.stringify({a:"x".repeat(9000)})))).status).toBe(413);
  expect((await handleCspReport(post("{nope"))).status).toBe(400);
  expect((await handleCspReport(post(JSON.stringify({hello:1})))).status).toBe(400);
 });
 test("caps log lines per hour per instance but still answers 204",async()=>{
  const lines:string[]=[];let last=0;
  for(let i=0;i<250;i++)last=(await handleCspReport(post(JSON.stringify(legacy)),{now:()=>5_000_000,log:l=>lines.push(l)})).status;
  expect(lines).toHaveLength(200);expect(last).toBe(204);
 });
});
