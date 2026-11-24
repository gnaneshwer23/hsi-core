# HSI Connected Scientific Intelligence — Prototype documentation

**Status:** Proposed specification; implementation truth requires repository audit.  
**Scope:** Preserve all existing HSI products, scientific workflows, architecture and six domains. This documentation does not authorise a product pivot or production deployment.

## Read in order
1. [Master vision, product and engineering specification](MASTER_SPEC.md)
2. [Architecture and Mermaid flows](ARCHITECTURE.md)
3. [Cursor audit and implementation instructions](CURSOR_START_HERE.md)

## Non-negotiable principle
**Understand the mechanism. Preserve the evidence. Explain the uncertainty. Inform the next decision.**

The new federated institutional research and permission-based collaboration layer extends, but does not replace, HSI's existing evidence verification, living knowledge graph, research workbench, contradiction/gap analysis, hypothesis workspace, clinical and trials direction.

## Demonstration goal
An authenticated researcher joins a private group, connects a permitted research dataset, investigates a mechanism across public biomedical evidence and synthetic patient/omics records, reviews traceable findings and uncertainties, explores an interactive graph, generates a research brief, and explicitly opts in to share a minimal collaboration request. Another researcher can accept or decline without accessing private data.

**Data integrity:** Never present synthetic data as real, invent clinical evidence, or join unrelated public datasets into fictitious patient-level records without explicit synthetic labelling.

## Next action
Cursor must audit existing code, migrations, CI, deployments, authentication and isolation before implementing. Deliver a verified built/partial/missing matrix and staged plan, then build and test a single complete demonstration flow.
