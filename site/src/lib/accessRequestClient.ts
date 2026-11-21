import {parseRetryAfterSeconds,rateLimitedMessage} from "./retryAfter";

export type AccessRequestStatus={
 kind:"configured"|"unavailable"|"unknown";
 deliveryConfigured:boolean;
 note?:string;
};

export type AccessRequestSubmitResult=
 |{kind:"accepted";note:string;providerAccepted:true;delivered:boolean}
 |{kind:"quiet_accept";note:string}
 |{kind:"not_configured";error:string}
 |{kind:"rate_limited";error:string;retryAfterSeconds?:number}
 |{kind:"refused";code?:string;error:string}
 |{kind:"error";error:string};

const rec=(v:unknown):v is Record<string,unknown>=>typeof v==="object"&&v!==null&&!Array.isArray(v);

export async function fetchAccessRequestStatus(
 request:typeof fetch=fetch,
 signal?:AbortSignal,
):Promise<AccessRequestStatus>{
 try{
  const r=await request("/api/access-requests",signal?{signal}:{});
  const b:unknown=await r.json().catch(()=>null);
  if(!r.ok||!rec(b))return{kind:"unknown",deliveryConfigured:false};
  const deliveryConfigured=b.deliveryConfigured===true;
  return{
   kind:deliveryConfigured?"configured":"unavailable",
   deliveryConfigured,
   note:typeof b.note==="string"?b.note:undefined,
  };
 }catch{
  return{kind:"unknown",deliveryConfigured:false};
 }
}

export type AccessRequestBody={
 question:string;
 email?:string;
 domain?:string;
 scenarioId?:string;
 company_website?:string;
};

export async function submitAccessRequest(
 body:AccessRequestBody,
 request:typeof fetch=fetch,
):Promise<AccessRequestSubmitResult>{
 let res:Response;
 try{
  res=await request("/api/access-requests",{
   method:"POST",
   headers:{"content-type":"application/json"},
   body:JSON.stringify(body),
  });
 }catch{
  return{kind:"error",error:"The access request could not be accepted by the notification provider. Nothing was claimed as delivered."};
 }
 const data:unknown=await res.json().catch(()=>({}));
 const record=rec(data)?data:{};
 const serverError=typeof record.error==="string"?record.error:undefined;

 if(res.status===202&&record.ok===true&&record.providerAccepted!==true&&record.delivered!==true){
  return{
   kind:"quiet_accept",
   note:typeof record.note==="string"?record.note:"Request recorded. Nothing was claimed as delivered to the operator.",
  };
 }
 if(res.ok&&(record.providerAccepted===true||record.delivered===true)){
  return{
   kind:"accepted",
   note:typeof record.note==="string"?record.note:"Accepted by the notification provider. Operator receipt is not confirmed. This does not grant research access.",
   providerAccepted:true,
   delivered:record.delivered===true,
  };
 }
 if(res.status===503||record.code==="ACCESS_REQUEST_NOT_CONFIGURED"){
  return{
   kind:"not_configured",
   error:serverError??"Delivery is not configured on this deployment. Nothing was sent.",
  };
 }
 if(res.status===429||record.code==="RATE_LIMITED"){
  const retryAfterSeconds=parseRetryAfterSeconds(res);
  return{
   kind:"rate_limited",
   error:rateLimitedMessage(res,serverError,"Hourly limit reached. Try again later."),
   ...(retryAfterSeconds===undefined?{}:{retryAfterSeconds}),
  };
 }
 if(typeof record.code==="string"||serverError){
  return{
   kind:"refused",
   code:typeof record.code==="string"?record.code:undefined,
   error:serverError??"The access request could not be accepted by the notification provider. Nothing was claimed as delivered.",
  };
 }
 return{
  kind:"error",
  error:"The access request could not be accepted by the notification provider. Nothing was claimed as delivered.",
 };
}
