import { useState } from "react";
import type { EvidenceRow } from "../lib/discoveryData";
import { buildResearchBrief, evidenceSourceLink, selectedEvidence, type ResearchBriefContext } from "../lib/researchBrief";

export function ResearchComparison({ rows, context }: { rows: EvidenceRow[]; context: ResearchBriefContext }) {
  const [ids, setIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const selected = selectedEvidence(rows, ids);
  const canExport = selected.length >= 2;

  function toggle(id: string) {
    setNotice("");
    setIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function download() {
    const brief = buildResearchBrief(context, rows, ids);
    const url = URL.createObjectURL(new Blob([brief], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "hsi-research-comparison.md";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Research brief downloaded. Source support still requires expert review.");
  }

  return (
    <section className="dc-card research-comparison" aria-labelledby="research-comparison-title">
      <div className="dc-panel-head">
        <h3 id="research-comparison-title">Compare evidence. Prepare a research brief.</h3>
        <span className="dc-pill">Static pack · session only</span>
      </div>
      <p>Select two to four claims from the scoped pack. Compare what is recorded and what still needs source review.</p>
      <p className="muted">Question: {context.question}</p>
      <p className="research-comparison-warning">A source link does not verify claim support. Study details, contradictions and retractions require expert checking. This workflow makes no treatment or eligibility recommendation.</p>
      <fieldset className="research-comparison-options">
        <legend>Claims to compare (maximum four)</legend>
        {rows.map((row) => (
          <label key={row.claimId}>
            <input type="checkbox" checked={ids.includes(row.claimId)} disabled={ids.length >= 4 && !ids.includes(row.claimId)} onChange={() => toggle(row.claimId)} />
            <span><strong>{row.claimId}</strong> — {row.claimText}</span>
          </label>
        ))}
      </fieldset>
      {!rows.length ? <p>No scoped claims are available. Nothing can be compared or exported.</p> : null}
      <p role="status" aria-live="polite">{ids.length} of 4 selected. {canExport ? "Ready to export a draft for review." : "Select at least two claims."} {notice}</p>
      {selected.length ? (
        <div className="dc-table-wrap" tabIndex={0} role="region" aria-label="Selected claim comparison">
          <table className="dc-table research-comparison-table">
            <caption>Selected claims — pack metadata, not independently verified findings</caption>
            <thead><tr><th scope="col">Context</th>{selected.map((row) => <th key={row.claimId} scope="col">{row.claimId}</th>)}</tr></thead>
            <tbody>
              {([
                ["Claim", (row: EvidenceRow) => row.claimText],
                ["Relationship", (row: EvidenceRow) => `${row.subject} → ${row.relationship} → ${row.object}`],
                ["Disease context", (row: EvidenceRow) => row.conditionContext || "Not recorded"],
                ["Pack grade / review", (row: EvidenceRow) => `${row.evidenceGrade} / ${row.reviewStatus}`],
                ["Pack limitations", (row: EvidenceRow) => row.limitations || "Not recorded; inspect source"],
                ["Study context", () => "Species, population, tissue, design and date not structured in this pack"],
                ["Claim support", () => "Not independently verified by this workflow"],
              ] as const).map(([label, value]) => (
                <tr key={label}><th scope="row">{label}</th>{selected.map((row) => <td key={row.claimId}>{value(row)}</td>)}</tr>
              ))}
              <tr><th scope="row">Source locator</th>{selected.map((row) => {
                const link = evidenceSourceLink(row);
                return <td key={row.claimId}>{row.source.citationLabel || "Citation label not recorded"}<br />{link ? <a href={link} target="_blank" rel="noreferrer">{link.startsWith("https://pubmed.ncbi.nlm.nih.gov/") ? `PMID ${row.source.pmid}` : row.source.doi}</a> : "No valid source identifier"}</td>;
              })}</tr>
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="dc-hero-actions">
        <button type="button" className="btn btn-primary" disabled={!canExport} onClick={download}>Download cited brief (.md)</button>
        <button type="button" className="btn btn-ghost" disabled={!ids.length} onClick={() => { setIds([]); setNotice(""); }}>Clear selection</button>
      </div>
      <p className="muted">Selections reset when this panel closes. No approval, investigation history or account is saved.</p>
    </section>
  );
}
