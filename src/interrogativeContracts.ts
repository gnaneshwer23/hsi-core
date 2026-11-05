/** Compatibility entrypoint. Browser code imports interrogativeValidation directly. */
import {createHash} from "node:crypto";
import {validateInterrogativeInvestigation,type InterrogativeInvestigation} from "./interrogativeValidation";
export * from "./interrogativeValidation";
export function fingerprintInterrogativeInvestigation(x:InterrogativeInvestigation):string{
 validateInterrogativeInvestigation(x);
 return createHash("sha256").update(JSON.stringify(x)).digest("hex");
}
