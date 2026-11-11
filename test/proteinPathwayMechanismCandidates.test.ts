import {describe,expect,test} from "bun:test";
import {buildProteinPathwayCandidate} from "../src/evidence/proteinPathwayMechanismCandidates";
import {uniProtProteinDraftNode} from "../src/evidence/uniProtOntologyBridge";
import type {HsiGraphNode} from "../src/livingHealthKnowledgeGraph";
import {validateHsiLogicalGraph} from "../src/livingHealthKnowledgeGraph";

const protein=uniProtProteinDraftNode({
  provider:"uniprotkb",accession:"P01375",proteinName:"Tumor necrosis factor",
  organismScientificName:"Homo sapiens",organismTaxonId:9606,geneNames:["TNF"],
  entryType:"UniProtKB reviewed (Swiss-Prot)",url:"https://www.uniprot.org/uniprotkb/P01375/entry",
  retrievedAt:"2026-11-10T00:00:00Z",verificationState:"metadata_retrieved_not_claim_verified",
  reviewState:"unreviewed",scientificApproval:false,graphPromotable:false,claimSupport:false,
});
const pathway:HsiGraphNode={
  schemaVersion:"hsi-lhkg-node-1",id:"pathway.reactome.R-HSA-199420",
  layer:"biomedical_evidence",kind:"pathway",preferredLabel:"Apoptosis",aliases:[],
  sourceIdentifiers:[{system:"Reactome",value:"R-HSA-199420",mapping:"unreviewed"}],
  version:"1.0.0",visibility:"governed_research",reviewState:"draft",
  sourceProvenance:["reactome:metadata:R-HSA-199420:2026-11-10"],
};
const context={tissue:"unknown",cellType:"unknown",disease:"unknown",
  species:"Homo sapiens",experimentalSystem:"unresolved"};
describe("Protein-pathway candidate governance",()=>{
  test("creates a draft noncausal hypothesis with context",()=>{
    const result=buildProteinPathwayCandidate({
      protein,pathway,sourceReference:"PMID:12345678",context,
    });
    expect(result.relationship.epistemicType).toBe("unvalidated_hypothesis");
    expect(result.relationship.causalClaim).toBe(false);
    expect(result.relationship.reviewState).toBe("draft");
    expect(result.relationship.sourceEvidenceIds).toEqual([]);
    expect(result.graphPromotable).toBe(false);
    expect(()=>validateHsiLogicalGraph([protein,pathway],[result.relationship])).not.toThrow();
  });
  test("rejects absent source reference",()=>{
    expect(()=>buildProteinPathwayCandidate({protein,pathway,sourceReference:"",context})).toThrow();
  });
  test("rejects missing context",()=>{
    expect(()=>buildProteinPathwayCandidate({
      protein,pathway,sourceReference:"PMID:12345678",context:{...context,tissue:""},
    })).toThrow();
  });
  test("rejects approved or public nodes",()=>{
    expect(()=>buildProteinPathwayCandidate({
      protein:{...protein,reviewState:"approved"},pathway,sourceReference:"PMID:12345678",context,
    })).toThrow();
  });
});
