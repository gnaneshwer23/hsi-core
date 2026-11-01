#!/usr/bin/env bun
/**
 * Demo: prove HSI ISI consume contract against local Discovery fixtures.
 * Run from repo root: bun run examples/isi-consumer/demo.ts
 */

import { HsiIsiConsumerClient, defaultPaths } from "./client";

function main(): void {
  const client = new HsiIsiConsumerClient(defaultPaths(process.cwd()));
  const proof = client.proveContract();
  const wiring = client.loadWiringSpec();
  const contract = client.loadConsumeContract();

  console.log("HSI → ISI consumer demo (hsi-core fixtures only)");
  console.log("================================================");
  console.log(`wiringSpec: ${proof.wiringSpecVersion}`);
  console.log(`consumeContract: ${proof.contractVersion}`);
  console.log(`grades: ${proof.grades.join(" | ")}`);
  console.log(`gateC: pending (autoApprove=${contract.gateC.autoApprove})`);
  console.log(`askStaysRa: ${proof.askStaysRa}`);
  console.log(`discovery files loaded: ${proof.loadedCount}`);
  console.log(
    `publish-only / missing from discovery: ${proof.missingFromDiscovery.length}`,
  );
  if (proof.missingFromDiscovery.length > 0) {
    console.log(
      `  (expected for some MANIFEST files — use bun run outputs for full bundle)`,
    );
    console.log(`  e.g. ${proof.missingFromDiscovery.slice(0, 5).join(", ")}`);
  }
  console.log(`playbook: ${wiring.companionTo.playbook}`);
  console.log(`routes mapped: ${wiring.discoveryRouteMap.length}`);
  console.log(`acceptance tests listed: ${wiring.acceptanceTests.length}`);
  console.log("");
  console.log("OK — contract proven against site/public/discovery (+ docs wiring spec).");
  console.log("Freeze: apply immunecity wires in that repo — not from this workspace.");
}

main();
