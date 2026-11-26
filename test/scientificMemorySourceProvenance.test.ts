import {test,expect} from "bun:test";
import {assessSourceProvenance,type SourceProvenanceCandidate} from "../src/scientificMemorySourceProvenance";
const root:SourceProvenanceCandidate={id:"publisher",authority:"publisher",upstreamIds:[],payloadSha256:"a".repeat(64)};
test("replicated payloads and declared dependencies are reported",()=>{const r=assessSourceProvenance([root,{...root,id:"index",authority:"crossref",upstreamIds:["publisher"]}]);expect(r.duplicatePayloadGroups).toEqual([["index","publisher"]]);expect(r.declaredDependencies).toEqual(["index"]);expect(r.independentCorroborationVerified).toBe(false);});
test("missing lineage never establishes independence",()=>{const r=assessSourceProvenance([{...root,upstreamIds:["missing"]}]);expect(r.missingUpstreamIds).toEqual(["missing"]);expect(r.authorityAuthenticated).toBe(false);expect(r.ingestionAllowed).toBe(false);});
test("cycles and duplicate record identifiers rejected",()=>{expect(()=>assessSourceProvenance([{...root,upstreamIds:["publisher"]}])).toThrow();expect(()=>assessSourceProvenance([root,root])).toThrow();});
