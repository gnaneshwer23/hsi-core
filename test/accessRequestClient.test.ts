import {describe,expect,test} from "bun:test";
import {
  fetchAccessRequestStatus,
  submitAccessRequest,
} from "../site/src/lib/accessRequestClient";

const json=(status:number,body:unknown,headers:Record<string,string>={})=>
  (async()=>new Response(JSON.stringify(body),{
    status,
    headers:{"content-type":"application/json",...headers},
  })) as unknown as typeof fetch;

describe("accessRequestClient",()=>{
  test("status mapping",async()=>{
    expect(await fetchAccessRequestStatus(json(200,{deliveryConfigured:true}))).toMatchObject({
      kind:"configured",
      deliveryConfigured:true,
    });
    expect(await fetchAccessRequestStatus(json(200,{deliveryConfigured:false}))).toMatchObject({
      kind:"unavailable",
      deliveryConfigured:false,
    });
    expect(await fetchAccessRequestStatus(json(500,{}))).toMatchObject({kind:"unknown"});
    expect(
      await fetchAccessRequestStatus((async()=>{throw Error("net")}) as unknown as typeof fetch),
    ).toMatchObject({kind:"unknown"});
  });

  test("submit outcomes stay honest about delivery and rate limits",async()=>{
    expect(
      await submitAccessRequest(
        {question:"What is known about IL-21 in systemic sclerosis research?"},
        json(200,{providerAccepted:true,delivered:true,note:"Accepted by provider."}),
      ),
    ).toEqual({
      kind:"accepted",
      note:"Accepted by provider.",
      providerAccepted:true,
      delivered:true,
    });

    expect(
      await submitAccessRequest(
        {question:"What is known about IL-21 in systemic sclerosis research?",company_website:"http://bot"},
        json(202,{ok:true,providerAccepted:false,delivered:false}),
      ),
    ).toMatchObject({kind:"quiet_accept"});

    expect(
      await submitAccessRequest(
        {question:"What is known about IL-21 in systemic sclerosis research?"},
        json(503,{code:"ACCESS_REQUEST_NOT_CONFIGURED",error:"not configured"}),
      ),
    ).toMatchObject({kind:"not_configured"});

    const limited=await submitAccessRequest(
      {question:"What is known about IL-21 in systemic sclerosis research?"},
      json(429,{code:"RATE_LIMITED",error:"Hourly limit reached. Try again later."},{"Retry-After":"3600"}),
    );
    expect(limited.kind).toBe("rate_limited");
    if(limited.kind==="rate_limited"){
      expect(limited.retryAfterSeconds).toBe(3600);
      expect(limited.error).toContain("60 minutes");
    }

    expect(
      await submitAccessRequest(
        {question:"Patient NHS number 943 476 5919"},
        json(400,{code:"PHI_REFUSED",error:"Do not include patient identifiers"}),
      ),
    ).toEqual({
      kind:"refused",
      code:"PHI_REFUSED",
      error:"Do not include patient identifiers",
    });
  });
});
