import {useMemo} from "react";
import type {DomainEdge} from "../../../src/knowledgeGraph/domainGraph";
import type {PassageLinkedContext} from "../../../src/evidence/passageLinkedContext";
import {
  buildEvidenceContextPassport,
  exportEvidenceContextPassport,
  type EvidenceContextPassport as Passport,
  type PassportFieldStatus,
} from "../../../src/knowledgeGraph/evidenceContextPassport";
import "../styles/evidence-context-passport.css";

const STATUS_LABEL:Record<PassportFieldStatus,string>={
 reported:"Reported",
 not_stated:"Not stated",
 not_extracted:"Not extracted",
 not_applicable:"Not applicable",
};

function download(passport:Passport){
 const blob=new Blob([JSON.stringify(exportEvidenceContextPassport(passport),null,2)+"\n"],{type:"application/json"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;
 a.download=`hsi-evidence-context-passport-${passport.edgeId}.json`;
 a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}

/** One inspectable context passport per edge/claim. Missing fields stay explicit. */
export function EvidenceContextPassportView({
  edge,
  passage,
  heading="Evidence context passport",
  headingLevel=4,
}:{
  edge:DomainEdge;
  passage?:PassageLinkedContext;
  heading?:string;
  headingLevel?:3|4;
}){
  const passport=useMemo(()=>buildEvidenceContextPassport(edge,passage),[edge,passage]);
  const H=("h"+headingLevel) as "h3"|"h4";
  const id=`ecp-${edge.id.replace(/[^a-z0-9-]/gi,"-")}`;
  return <section className="ecp" aria-labelledby={id}>
    <p className="ecp-kicker">EVIDENCE CONTEXT PASSPORT · NOT SCIENTIFICALLY APPROVED</p>
    <H id={id}>{heading}</H>
    <p className="ecp-summary">
      {passport.reportedCount} reported · {passport.missingCount} missing or not extracted
      {passport.kind==="research_gap"?" · unresolved research connection (not supporting evidence)":" · source-linked candidate"}
    </p>
    <ul className="ecp-list" aria-label="Context fields for this record">
      {passport.fields.map(field=>(
        <li key={field.id} className="ecp-row">
          <span className="ecp-label">{field.label}</span>
          <span className="ecp-status" data-status={field.status}>{STATUS_LABEL[field.status]}</span>
          <span className="ecp-value" data-missing={field.value===null?true:undefined}>
            {field.value??field.missingReason??"Not available"}
          </span>
        </li>
      ))}
    </ul>
    {passport.missingFieldIds.length>0&&(
      <p className="ecp-missing">
        Explicitly missing: {passport.missingFieldIds.join(", ")}. Absence of a field is not evidence against the claim.
      </p>
    )}
    <p className="ecp-note">{passport.note} Unreviewed · confidence not calibrated · graph promotion prohibited.</p>
    <button type="button" className="ecp-btn" onClick={()=>download(passport)}>Export context passport</button>
  </section>;
}
