/** P1.12.1 server-only bridge between the existing verified HSI session and
 * the P1.8 evidence service. No HTTP route, database write, or role grant.
 * Never accept tenant IDs or roles from request JSON.
 */
import type {TrustedSessionGateway} from "../evidence/authenticatedEvidenceService";
import type {TrustedResearchActor} from "../db/researchInvestigationStore";

export type VerifiedEvidenceSession={
  sessionId:string;
  actor:TrustedResearchActor;
};
/** The organisation must come from trusted, server-side membership storage. */
export type ResolveEvidenceOrganisation=(principalId:string)=>Promise<string|null>;

const ORGANISATION=/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;
const ROLE_SET=new Set(["researcher","scientific_reviewer","research_admin"]);
type EvidenceRole="researcher"|"scientific_reviewer"|"research_admin";

/** A server-injected verifier and membership resolver are mandatory.
 * Callers must not implement either using client-supplied claims.
 */
export function createHsiEvidenceSessionGateway(input:{
  verifyProviderSession:(sessionToken:string)=>Promise<VerifiedEvidenceSession|null>;
  resolveOrganisation:ResolveEvidenceOrganisation;
}):TrustedSessionGateway{
  return {
    async verifySession(sessionToken){
      if(typeof sessionToken!=="string"||sessionToken.length<16||
        sessionToken.length>4096||/\\s/.test(sessionToken))return null;
      const verified=await input.verifyProviderSession(sessionToken);
      if(!verified?.actor?.authenticated||!verified.actor.principalId?.trim()||
        !verified.sessionId?.trim())return null;
      const roles=(verified.actor.roles??[]).filter(
        (role):role is EvidenceRole=>ROLE_SET.has(role),
      );
      if(roles.length===0)return null;
      const organizationId=await input.resolveOrganisation(verified.actor.principalId);
      if(!organizationId||!ORGANISATION.test(organizationId))return null;
      return {subjectId:verified.actor.principalId,organizationId,
        sessionId:verified.sessionId,roles};
    },
  };
}
