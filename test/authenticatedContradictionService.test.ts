import {expect,it} from "bun:test";
import {persistAuthenticatedContradiction} from "../src/db/authenticatedContradictionService";
it("fails closed before DB tenant RLS and authenticated staging acceptance",async()=>{
 await expect(persistAuthenticatedContradiction()).rejects.toThrow("persistence held");
});
