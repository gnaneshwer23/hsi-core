export class RequestBodyTooLarge extends Error{}
/** Stream bound applies before parsing; a supplied Content-Length is not trusted. */
export async function boundedRequestText(request:Request,limit:number):Promise<string>{
 const reader=request.body?.getReader();if(!reader)return "";const decoder=new TextDecoder();let total=0,text="";
 try{for(;;){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>limit){await reader.cancel();throw new RequestBodyTooLarge("Payload too large")}text+=decoder.decode(value,{stream:true})}return text+decoder.decode()}finally{reader.releaseLock()}
}
