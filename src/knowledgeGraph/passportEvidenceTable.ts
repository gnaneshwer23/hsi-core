/**
 * Structured evidence table for investigation briefs (A5.2).
 * Columns are Evidence Context Passport edge fields. Never invents values or approval.
 */
import type {DomainEdge,DomainSource} from "./domainGraph";
import {
  EDGE_PASSPORT_FIELDS,
  EDGE_LABELS,
  buildEvidenceContextPassport,
  type EdgePassportField,
  type PassportFieldStatus,
} from "./evidenceContextPassport";

export const EVIDENCE_TABLE_SCHEMA="hsi-passport-evidence-table-1" as const;

export type PassportEvidenceCell={
  fieldId:EdgePassportField;
  label:string;
  status:PassportFieldStatus;
  display:string;
};

export type PassportEvidenceRow={
  edgeId:string;
  assertion:string;
  sourceId:string|null;
  sourceTitle:string|null;
  kind:DomainEdge["kind"];
  cells:PassportEvidenceCell[];
  reportedCount:number;
  missingCount:number;
};

export type PassportEvidenceTable={
  schemaVersion:typeof EVIDENCE_TABLE_SCHEMA;
  columns:ReadonlyArray<{id:EdgePassportField;label:string}>;
  rows:PassportEvidenceRow[];
  rowCount:number;
  scientificApproval:false;
  graphPromotable:false;
  note:string;
};

export {EDGE_PASSPORT_FIELDS,EDGE_LABELS};

function cellDisplay(status:PassportFieldStatus,value:string|null,missingReason:string|null):string{
  if(status==="reported"&&value)return value;
  if(status==="not_stated")return "Not stated";
  if(status==="not_extracted")return "Not extracted";
  if(status==="not_applicable")return "Not applicable";
  return missingReason??"Not available";
}

export function buildPassportEvidenceTable(
  edges:readonly DomainEdge[],
  sources:readonly DomainSource[]=[],
):PassportEvidenceTable{
  const sourceById=new Map(sources.map(s=>[s.id,s]));
  const columns=EDGE_PASSPORT_FIELDS.map(id=>({id,label:EDGE_LABELS[id]}));
  const rows:PassportEvidenceRow[]=[];
  for(const edge of edges){
    if(edge.kind!=="source_candidate")continue;
    const passport=buildEvidenceContextPassport(edge);
    const byId=new Map(passport.fields.map(f=>[f.id,f]));
    const cells:PassportEvidenceCell[]=EDGE_PASSPORT_FIELDS.map(id=>{
      const field=byId.get(id)!;
      return {
        fieldId:id,
        label:field.label,
        status:field.status,
        display:cellDisplay(field.status,field.value,field.missingReason),
      };
    });
    const source=edge.sourceId?sourceById.get(edge.sourceId):undefined;
    rows.push({
      edgeId:edge.id,
      assertion:edge.assertion,
      sourceId:edge.sourceId,
      sourceTitle:source?.title??null,
      kind:edge.kind,
      cells,
      reportedCount:cells.filter(c=>c.status==="reported").length,
      missingCount:cells.filter(c=>c.status==="not_stated"||c.status==="not_extracted").length,
    });
  }
  rows.sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
  return {
    schemaVersion:EVIDENCE_TABLE_SCHEMA,
    columns,
    rows,
    rowCount:rows.length,
    scientificApproval:false,
    graphPromotable:false,
    note:"Elicit-style evidence table using Evidence Context Passport edge columns. Passage-linked fields (dose, sample size, species detail, …) are not columns here — open each passport. Missing cells stay explicit. Not scientific approval.",
  };
}

function mdCell(value:string):string{
  return value.replaceAll("|","\\|").replaceAll("\n"," ").trim()||"—";
}

/** Markdown table for research brief export. */
export function renderPassportEvidenceTableMarkdown(table:PassportEvidenceTable):string{
  const headers=["Edge","Finding","Source",...table.columns.map(c=>c.label)];
  const sep=headers.map(()=>"---");
  const lines=[
    "## Evidence table (context passport columns)",
    "",
    table.note,
    "",
    `| ${headers.join(" | ")} |`,
    `| ${sep.join(" | ")} |`,
  ];
  if(!table.rows.length){
    lines.push(`| — | No source-candidate edges in this brief slice | — | ${table.columns.map(()=>"—").join(" | ")} |`);
  }else{
    for(const row of table.rows){
      const source=row.sourceTitle??row.sourceId??"No source attached";
      lines.push(`| ${[row.edgeId,row.assertion,source,...row.cells.map(c=>c.display)].map(mdCell).join(" | ")} |`);
    }
  }
  lines.push("","Scientific approval: false · graph promotion prohibited · unreviewed candidates only.","");
  return lines.join("\n");
}
