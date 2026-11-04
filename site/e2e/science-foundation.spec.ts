import {test,expect} from "@playwright/test";
import {BIOLOGY_ENTITIES,BIOLOGY_RELATIONS,SCIENCE_SOURCES,validateScienceCatalogue} from "../src/features/science/biologyCatalogue";
test("Phase 0 public science catalogue has valid references and stable IDs",()=>{
 expect(validateScienceCatalogue()).toEqual([]);
 expect(new Set(BIOLOGY_ENTITIES.map(e=>e.id)).size).toBe(BIOLOGY_ENTITIES.length);
 expect(SCIENCE_SOURCES.length).toBeGreaterThan(0);
});
test("Phase 0 unreviewed associations cannot masquerade as approved evidence",()=>{
 for(const r of BIOLOGY_RELATIONS){
  expect(r.reviewState).toBe("draft");
  expect(r.predicate).toBe("RELATED_TOPIC");
  expect(r.evidenceRefs).toEqual([]);
 }
 for(const e of BIOLOGY_ENTITIES)expect(e.reviewState).toBe("draft");
});
