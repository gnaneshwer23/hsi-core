export class RequestBodyTooLarge extends Error{}
export class RequestBodyTimeout extends Error{}
/** Byte and full-read deadline bounds. A supplied Content-Length is never trusted. */
export async function boundedRequestText(request:Request,limit:number,timeoutMs=5000):Promise<string>{
 if(!Number.isSafeInteger(limit)||limit<1||!Number.isSafeInteger(timeoutMs)||timeoutMs<1)throw Error("Invalid request budget");
 const reader=request.body?.getReader();if(!reader)return "";
 const decoder=new TextDecoder();let total=0,text="",timedOut=false;
 const timer=setTimeout(()=>{timedOut=true;void reader.cancel().catch(()=>{})},timeoutMs);
 try{for(;;){const {done,value}=await reader.read();if(timedOut)throw new RequestBodyTimeout("Request body deadline exceeded");if(done)break;total+=value.byteLength;if(total>limit){void reader.cancel().catch(()=>{});throw new RequestBodyTooLarge("Payload too large")}text+=decoder.decode(value,{stream:true})}return text+decoder.decode()}
 finally{clearTimeout(timer);reader.releaseLock()}
}
