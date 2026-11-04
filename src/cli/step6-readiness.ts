#!/usr/bin/env bun
import { assessStep6Readiness, checkRepositoryEvidence, NO_VERIFIED_RUNTIME_EVIDENCE } from "../step6Readiness";
const repository=checkRepositoryEvidence();
const readiness=assessStep6Readiness(NO_VERIFIED_RUNTIME_EVIDENCE);
console.log(JSON.stringify({repository,readiness,note:"Repository checks do not verify external systems. No production-ready assertion."},null,2));
if(process.argv.includes("--require-production-ready") && readiness.blockedCount)process.exitCode=1;
