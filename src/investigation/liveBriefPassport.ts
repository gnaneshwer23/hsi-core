/**
 * Map a live investigation onto passport evidence-table rows for the research brief.
 * Browser-safe; never invents biological context or scientific approval.
 */
import type {DomainEdge,DomainSource} from "../knowledgeGraph/domainGraph";
import {
  buildPassportEvidenceTable,
  renderPassportEvidenceTableMarkdown,
  type PassportEvidenceTable,
} from "../knowledgeGraph/passportEvidenceTable";
import {liveClaimToPassportEdge} from "./liveClaimPassportEdge";
import type {LiveInvestigation} from "./liveRun";

const safe=(s:string)=>s.replace(/[<>&`*_\[\]#|]/g,c=>"&#"+c.charCodeAt(0)+";").replace(/[\r\n]+/g," ");

const VERIFY_LABEL:Record<LiveInvestigation["candidates"][number]["verification"],string>={
  not_run:"not checked (ranked lower)",
  agree_directional:"both checks agree on direction",
  agree_association_only:"both checks agree association only",
  disputed:"checks disagreed",
  insufficient_abstain:"checks abstained / insufficient",
  check_failed:"model check failed",
};

export function liveInvestigationPassportEdges(b:LiveInvestigation):DomainEdge[]{
  const ctx=(k:string)=>b.byContext[k]?.label??k;
  return b.candidates.map(c=>liveClaimToPassportEdge({
    candidate:c,
    contextLabels:c.contexts.map(ctx),
  }));
}

/** Lightweight source rows for table titles only (not a verified DomainBundle import). */
export function liveInvestigationPassportSources(b:LiveInvestigation):DomainSource[]{
  return b.records.map(r=>({
    id:r.sourceId,
    title:r.title,
    url:r.sourceUrl,
    doi:r.doi,
    pmid:r.pmid,
    identityStatus:"bibliographic_candidate_not_retrieved",
    rights:"unverified",
    retrievedAt:r.retrievedAt,
    passages:[],
  }));
}

export function buildLiveBriefEvidenceTable(b:LiveInvestigation):PassportEvidenceTable{
  return buildPassportEvidenceTable(
    liveInvestigationPassportEdges(b),
    liveInvestigationPassportSources(b),
  );
}

export function renderLiveClaimVerificationMarkdown(b:LiveInvestigation):string{
  const lines=[
    "## Claim verification status",
    "",
    "Verification is a two-model passage check, not scientific approval. Missing context stays explicit in the passport table below.",
    "",
  ];
  if(!b.candidates.length){
    lines.push("- No candidates in this run.","");
    return lines.join("\n");
  }
  for(const c of b.candidates){
    const label=VERIFY_LABEL[c.verification];
    lines.push(
      `- **${safe(c.subject)} ~ ${safe(c.object)}** · verification: ${label} · polarity: ${c.polarity} · direction: ${c.direction.replaceAll("_"," ")} · basis: ${c.polarityBasis.replaceAll("_"," ")}`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

export function renderLiveBriefPassportSections(b:LiveInvestigation):string{
  const table=buildLiveBriefEvidenceTable(b);
  return [
    renderLiveClaimVerificationMarkdown(b).trimEnd(),
    "",
    renderPassportEvidenceTableMarkdown(table).trimEnd(),
    "",
  ].join("\n");
}
