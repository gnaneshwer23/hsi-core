import {useMemo} from "react";
import type {DomainEdge,DomainSource} from "../../../src/knowledgeGraph/domainGraph";
import {
  buildPassportEvidenceTable,
  type PassportEvidenceRow,
} from "../../../src/knowledgeGraph/passportEvidenceTable";
import "../styles/passport-evidence-table.css";

type Props={
  edges:readonly DomainEdge[];
  sources?:readonly DomainSource[];
  onInspect?:(edgeId:string)=>void;
  heading?:string;
};

function Row({row,onInspect}:{row:PassportEvidenceRow;onInspect?:(edgeId:string)=>void}){
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
      <td className="pet-source">{row.sourceTitle??row.sourceId??"No source attached"}</td>
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
  return (
    <section className="pet" aria-labelledby="pet-heading">
      <p className="pet-kicker">EVIDENCE TABLE · PASSPORT COLUMNS · NOT SCIENTIFICALLY APPROVED</p>
      <h3 id="pet-heading">{heading}</h3>
      <p className="pet-summary">
        {table.rowCount} source-candidate row{table.rowCount===1?"":"s"}. Columns match the Evidence Context Passport.
        Passage-linked fields (dose, sample size, …) are not extracted here — open a passport per connection.
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
              <Row key={row.edgeId} row={row} onInspect={onInspect}/>
            ))}
          </tbody>
        </table>
      </div>
      <p className="pet-note">{table.note} Unreviewed · confidence not calibrated · graph promotion prohibited.</p>
    </section>
  );
}
