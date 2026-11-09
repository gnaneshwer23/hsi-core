# Agent skills watchlist (HSI / ISI)

Personal Cursor skills live under `~/.cursor/skills/` (~590 installed). **Do not** `alwaysApply` the pack. Load a skill by reading its `SKILL.md` only when the task matches a row below.

Canonical inventory / GitHub install notes: `~/.cursor/skills/_installed-from-github/INDEX.md`  
Source caches: `~/Projects/_skill-sources/` (symlink packs)  
Cursor built-ins: `~/.cursor/skills-cursor/` (create-rule, create-skill, review-security, …)  
Mirrored copies also under `~/.agents/skills/` and some under `~/.claude/skills/`.

## How to load

1. Match the task to a **When** row in this doc (or a `.cursor/rules/*.mdc` pointer).
2. `Read` `~/.cursor/skills/<name>/SKILL.md` (follow one level of links only).
3. Prefer **one** primary skill; add a second only if the first explicitly needs it.
4. Continuous build stays **human-gated** — skills do not authorize Gate C auto-approve, MoU invention, production `legalBinding`, or Neon cross-wiring.

## High-value load map

| When (task) | Load (personal skill) | Notes |
|-------------|----------------------|--------|
| ISI/HSI marketing SEO, keywords, SERP gaps | `seo-audit`, `keyword-research`, `competitive-landscape`, `seo-project-setup`, `seo-coach`, `seo-report`, `agency-seo-specialist` | OpenSEO skills from [every-app/open-seo](https://github.com/every-app/open-seo) at `~/.cursor/skills/` (source: `~/Projects/_skill-sources/open-seo`). Public site / content only; see immunecity `docs/SEO.md` |
| OpenSEO MCP / plugin connect | `setup-openseo` | Optional; do not invent Search Console access |
| AI answer / AEO visibility for ISI brand | `ai-visibility-audit`, `agency-ai-citation-strategist` | Brand prompts — not clinical claims |
| React / TanStack / Vite UI performance | `vercel-react-best-practices`, `agency-frontend-developer` | Respect existing ISI design tokens |
| Landing / page art direction (anti-slop) | `hallmark`, `taste-skill` / `design-taste-frontend`, `ui-ux-pro-max` | Prefer ISI `biotech.css` / `isi.css` over inventing a new theme |
| UI polish / a11y / layout | `better-ui`, `better-accessibility`, `better-layout`, `web-design-guidelines`, `agency-accessibility-auditor` | |
| Knowledge graph structure / KG planning | `agency-knowledge-graph-engineer`, `graphify` | Curated KG remains source of truth; no invented science |
| Literature / evidence synthesis (research) | `literature-review`, `agency-research-synthesist`, `citation-management`, `bgpt-paper-search` | Outputs are research artifacts; Gate C human-only |
| Clinical evidence *standards* (credibility framing) | `agency-clinical-evidence-agent` | Framing only — **not** live CDS |
| Defensive AppSec / AI-code review | `agency-ai-generated-code-security-auditor`, `agency-application-security-engineer`, `agency-privacy-engineer` | Patching / hardening; no exploit PoCs |
| Minimal diffs / review discipline | `agency-minimal-change-engineer`, `agency-code-reviewer` | |
| Architecture / flow diagrams | `diagram-design`, `archify` | Docs and strategy only unless asked |
| PRD / prioritization / JTBD | `pm-prd`, `pm-moscow-prioritization`, `pm-jobs-to-be-done`, `pm-north-star-metric` | Strategy docs — no silent product commits |
| Privacy / GDPR program language | `agency-data-privacy-officer`, `agency-privacy-engineer` | Align with `docs/CDS_PHI_BOUNDARY.md` |
| Stitch design→code experiments | `stitch-*` skills | Optional founder tooling — do not force into ISI product chrome |

## Hard excludes (this workspace)

| Do not load / do not invent | Why |
|----------------------------|-----|
| Live CDS product wiring; PHI→LLM; EHR write-back | [`CDS_PHI_BOUNDARY.md`](./CDS_PHI_BOUNDARY.md) |
| `clinical-decision-support` for product features | Research-eval skill only; never ship as ISI/HSI CDS |
| Gate C auto-approve, invented MoU, shared Neon with immunecity | Binding AGENTS.md policy |
| PentAGI, RAG-Anything, Anime.js, MediSearch, Hippocratic, Nabla as product deps | Browse-adjacent only — **not** wired into repos |
| DeliverX / `swift-deliveries` | Out of scope |
| Dumping agency-* / scientific packs into every chat | Context bloat; use this watchlist |

## Adjacent tool browsing (explicit non-goals)

Founder may explore PentAGI, RAG-Anything, Anime.js, MediSearch, Hippocratic, Nabla, etc. Treat as **research bookmarks**. Do not add dependencies, routes, or agent skills that pull them into `hsi-core` or `immune-city` unless a separate human-gated decision says so.

## Repo pointers

- hsi-core agents: root [`AGENTS.md`](../AGENTS.md) + `.cursor/rules/agent-skills.mdc`
- immunecity (ISI product): `~/Desktop/immune-city` — same watchlist pattern via its `docs/AGENT_SKILLS.md`
