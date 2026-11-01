/**
 * Compose ISI REL + Aksh node pointers onto claims (orthogonal; neither opens CDS).
 */
import type { HsiClaim } from "../schema";
import { HSI_T2D_IMMUNO_SEED_CLAIMS } from "../seed/t2dImmunoMetabolic";
import { claimsWithIsiMappings } from "./isiRelSuggestions";
import { claimsWithAkshMappings } from "./akshNodeSuggestions";

export function claimsWithProductMappings(
  base: readonly HsiClaim[] = HSI_T2D_IMMUNO_SEED_CLAIMS,
): HsiClaim[] {
  const isi = claimsWithIsiMappings(base);
  const aksh = claimsWithAkshMappings(base);
  const akshById = new Map(aksh.map((c) => [c.id, c]));
  return isi.map((claim) => {
    const a = akshById.get(claim.id);
    return a?.akshNodeId ? { ...claim, akshNodeId: a.akshNodeId } : claim;
  });
}
