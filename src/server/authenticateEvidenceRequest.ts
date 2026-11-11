/** P1.12.2: verify a research request using the existing provider + HSI
 * database session chain. Server-only, no new public API and no DB writes.
 * Never accept a browser-provided identity, organisation or role.
 */
import {verifiedProviderSession,type AuthGatewayConfig} from "./neonAuthGateway";
import {resolveProviderSessionToken} from "../db/providerSessionToken";
import {authenticateHsiNeonSession} from "../db/neonAuthResearchActor";
import {createHsiEvidenceSessionGateway,type ResolveEvidenceOrganisation} from "./hsiEvidenceSessionGateway";
import type {TrustedSessionGateway} from "../evidence/authenticatedEvidenceService";
import type {FetchLike} from "../fetchLike";

export type EvidenceRequestIdentity={
  sessionToken:string;
  gateway:TrustedSessionGateway;
};
export type EvidenceRequestAuthDependencies={
  providerSession:typeof verifiedProviderSession;
  resolveToken:typeof resolveProviderSessionToken;
  authenticateSession:typeof authenticateHsiNeonSession;
};
const defaults:EvidenceRequestAuthDependencies={
  providerSession:verifiedProviderSession,
  resolveToken:resolveProviderSessionToken,
  authenticateSession:authenticateHsiNeonSession,
};

/** Only call this after the normal Vercel research config, origin and
 * maintenance checks. The token is private server-side material: do not
 * serialize the result, return it to clients, or log it.
 */
export async function authenticateEvidenceRequest(input:{
  request:Request;
  config:AuthGatewayConfig & {databaseUrl:string;neonProjectId?:string|null};
  resolveOrganisation:ResolveEvidenceOrganisation;
  transport?:FetchLike;
  dependencies?:Partial<EvidenceRequestAuthDependencies>;
}):Promise<EvidenceRequestIdentity|null>{
  const deps={...defaults,...input.dependencies};
  const provider=await deps.providerSession(input.config,input.request,input.transport);
  if(!provider?.user.emailVerified)return null;
  const sessionToken=await deps.resolveToken({
    databaseUrl:input.config.databaseUrl,neonProjectId:input.config.neonProjectId,
    sessionId:provider.session.id,userId:provider.user.id,
  });
  if(!sessionToken)return null;
  const actor=await deps.authenticateSession({
    databaseUrl:input.config.databaseUrl,neonProjectId:input.config.neonProjectId,
    sessionToken,
  });
  if(!actor||actor.principalId!==provider.user.id)return null;
  const gateway=createHsiEvidenceSessionGateway({
    verifyProviderSession:async token=>token===sessionToken?
      {sessionId:provider.session.id,actor}:null,
    resolveOrganisation:input.resolveOrganisation,
  });
  if(!await gateway.verifySession(sessionToken))return null;
  return {sessionToken,gateway};
}
