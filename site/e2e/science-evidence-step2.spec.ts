import {test,expect} from "@playwright/test";
import {buildEvidenceDossier,validateEvidenceAssessments,type EvidenceAssessment} from "../src/features/science/evidenceDossier";
import {SCIENCE_TYPED_GRAPH} from "../src/features/science/typedGraphData";
import type {TypedGraph} from "../src/features/science/typedGraphSchema";
const graph:TypedGraph={schemaVersion:"2.0.0",description:"test fixture; not published evidence",nodes:[
 {id:"macrophage",label:"Macrophage",kind:"cell",reviewStatus:"draft",version:"1"},
 {id:"tnf",label:"TNF",kind:"protein",reviewStatus:"draft",version:"1"}],
 edges:[{id:"e1",subjectId:"macrophage",predicate:"PRODUCES",objectId:"tnf",assertionType:"reported_association",context:{tissue:"synovium",species:"human"},reviewStatus:"draft",evidenceStatus:"unassessed",evidenceIds:["src1"],version:"1"}],
 evidence:[{id:"src1",sourceType:"publication",sourceId:"test-only",url:"https://example.org/test-only",retrievedAt:"2026-11-04",assessment:"unassessed"}]};
const assessment:EvidenceAssessment={edgeId:"e1",sourceId:"src1",scope:"direct_claim",stance:"supports",notes:"Test fixture only, no actual claim review.",curator:"test",assessedAt:"2026-11-04",reviewedBy:"test-reviewer",reviewedAt:"2026-11-04"};
test("Step 2 evidence dossier distinguishes sources from reviewed support",()=>{
 const d=buildEvidenceDossier(graph,"e1")!;
 expect(d.records).toHaveLength(1);expect(d.readyForReview).toBe(false);
 expect(d.warnings).toContain("Some sources have not been assessed against this specific relationship.");
 expect(buildEvidenceDossier(graph,"e1",[assessment])!.readyForReview).toBe(true);
 expect(validateEvidenceAssessments(graph,[assessment])).toEqual([]);
 expect(validateEvidenceAssessments(graph,[{...assessment,scope:"background"}])).toContain("Background source cannot directly support claim e1:src1");
 expect(validateEvidenceAssessments(graph,[{...assessment,sourceId:"missing"}])).toContain("Unlinked assessment e1:missing");
});
test("existing editorial links remain unsupported and visibly disclose missing evidence",async({page})=>{
 const id=SCIENCE_TYPED_GRAPH.edges.find(e=>e.subjectId==="pancreas")!.id;
 expect(buildEvidenceDossier(SCIENCE_TYPED_GRAPH,id)!.readyForReview).toBe(false);
 await page.goto("/science/graph?node=pancreas");
 await page.getByRole("button",{name:/Inspect evidence/}).first().click();
 await expect(page.getByRole("region",{name:"Relationship evidence dossier"})).toBeVisible();
 await expect(page.getByText("No source records linked to this relationship.")).toBeVisible();
 await expect(page.getByText(/Independent scientific review required/)).toBeVisible();
});
