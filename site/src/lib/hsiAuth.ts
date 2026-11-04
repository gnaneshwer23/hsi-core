/** Browser-facing Neon Better Auth client.
 * Public URL only; never put DB credentials or session secrets in Vite variables.
 * Cross-origin cookies and trusted origins require an approved deployment configuration.
 */
const configured = import.meta.env.VITE_HSI_AUTH_BASE_URL as string | undefined;
export const authBaseUrl = configured && /^https:\/\//.test(configured) ? configured.replace(/\/$/, "") : null;
type AuthResult<T> = { data: T | null; error: { message?: string } | null };
async function authRequest<T>(path: string, body?: unknown): Promise<AuthResult<T>> {
 if (!authBaseUrl) return {data:null,error:{message:"Authentication service is not configured for this deployment."}};
 try {
  const response = await fetch(authBaseUrl+path,{
   method:body===undefined?"GET":"POST",
   credentials:"include",
   cache:"no-store",
   headers:{"Accept":"application/json",...(body===undefined?{}:{"Content-Type":"application/json"})},
   ...(body===undefined?{}:{body:JSON.stringify(body)})
  });
  const value:unknown=await response.json().catch(()=>null);
  if(!response.ok) {
   const message=value&&typeof value==="object"&&"message" in value&&typeof value.message==="string"?value.message:"Authentication request was denied.";
   return {data:null,error:{message}};
  }
  return {data:value as T,error:null};
 } catch {return {data:null,error:{message:"Authentication service unavailable. Check the approved origin and network configuration."}}}
}
export type HsiAuthSession={session:{id:string;expiresAt:string};user:{id:string;name?:string;email:string;emailVerified:boolean}};
export const hsiAuth={
 signIn:(email:string,password:string)=>authRequest<unknown>("/sign-in/email",{email,password}),
 signUp:(name:string,email:string,password:string)=>authRequest<unknown>("/sign-up/email",{name,email,password}),
 session:()=>authRequest<HsiAuthSession>("/get-session"),
 signOut:()=>authRequest<unknown>("/sign-out",{}),
};
