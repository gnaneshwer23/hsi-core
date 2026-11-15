/** GET /api/health. Liveness only: no secrets, no upstream calls, no provider detail. For uptime checks and alerts. */
export function handleHealth(request:Request,now:()=>number=Date.now):Response{
 if(request.method!=="GET"&&request.method!=="HEAD")return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:{Allow:"GET, HEAD","Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
 return new Response(request.method==="HEAD"?null:JSON.stringify({status:"ok",time:new Date(now()).toISOString()}),{status:200,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
}
