import {useMemo} from "react";
import type {DomainEdge,DomainSource} from "../../../src/knowledgeGraph/domainGraph";
import {
  buildPassportEvidenceTable,
  type PassportEvidenceRow,
} from "../../../src/knowledgeGraph/passportEvidenceTable";
import "../styles/evidence-context-passport.css";
import "../styles/passport-evidence-table.css";

type Props={
  edges:readonly DomainEdge[];
  sources?:readonly DomainSource[];
  onInspect?:(edgeId:string)=>void;
  heading?:string;
};

function Row({
  row,
  source,
  onInspect,
}:{
  row:PassportEvidenceRow;
  source:DomainSource|undefined;
  onInspect?:(edgeId:string)=>void;
}){
  const title=source?.title??row.sourceTitle??row.sourceId??"No source attached";
  const locators=[
    source?.doi?`DOI ${source.doi}`:null,
    source?.pmid?`PMID ${source.pmid}`:null,
    source?`rights: ${source.rights}`:null,
    "sourceClearanceVerified: false",
  ].filter(Boolean).join(" · ");
  return (
    <tr>
      <th scope="row">
        {onInspect?(
          <button type="button" className="pet-edge" onClick={()=>onInspect(row.edgeId)}>
            {row.edgeId}
          </button>
        ):(
          <code>{row.edgeId}</code>
        )}
        <span className="pet-counts">{row.reportedCount} reported · {row.missingCount} missing</span>
      </th>
      <td className="pet-finding">{row.assertion}</td>
      <td className="pet-source">
        {source?.url?(
          <a href={source.url} target="_blank" rel="noreferrer noopener">{title}</a>
        ):(
          title
        )}
        {locators?(<><br/><span className="pet-source-meta">{locators}</span></>):null}
      </td>
      {row.cells.map(cell=>(
        <td key={cell.fieldId} data-status={cell.status} title={cell.label}>
          {cell.display}
        </td>
      ))}
    </tr>
  );
}

/** Elicit-style evidence table; columns = Evidence Context Passport edge fields. */
export function PassportEvidenceTable({
  edges,
  sources=[],
  onInspect,
  heading="Evidence table",
}:Props){
  const table=useMemo(()=>buildPassportEvidenceTable(edges,sources),[edges,sources]);
  const sourceById=useMemo(()=>new Map(sources.map(s=>[s.id,s])),[sources]);
  return (
    <section className="ecp pet" aria-labelledby="pet-heading">
      <p className="ecp-kicker">EVIDENCE TABLE · PASSPORT COLUMNS · NOT SCIENTIFICALLY APPROVED · SOURCE CLEARANCE NOT VERIFIED</p>
      <h3 id="pet-heading">{heading}</h3>
      <p className="ecp-summary">
        {table.rowCount} source-candidate row{table.rowCount===1?"":"s"}. Columns match the Evidence Context Passport.
        Passage-linked fields (dose, sample size, …) are not extracted here — open a passport per connection.
        Locators are not proof of support; rights remain unverified.
      </p>
      <div className="pet-scroll" role="region" aria-label="Passport evidence table" tabIndex={0}>
        <table className="pet-table">
          <thead>
            <tr>
              <th scope="col">Edge</th>
              <th scope="col">Finding</th>
              <th scope="col">Source</th>
              {table.columns.map(col=>(
                <th key={col.id} scope="col">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.length===0?(
              <tr>
                <td colSpan={3+table.columns.length}>No source-candidate edges in this brief slice.</td>
              </tr>
            ):table.rows.map(row=>(
              <Row
                key={row.edgeId}
                row={row}
                source={row.sourceId?sourceById.get(row.sourceId):undefined}
                onInspect={onInspect}
              />
            ))}
          </tbody>
        </table>
      </div>
      <p className="ecp-note">{table.note} Unreviewed · confidence not calibrated · graph promotion prohibited · sourceClearanceVerified: false.</p>
    </section>
  );
}
