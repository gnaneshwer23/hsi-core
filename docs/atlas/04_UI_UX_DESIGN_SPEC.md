# Scientific Atlas UI design

Requirements A01/A04/A05/A06. Target is a quiet scientific instrument, retaining the simplified graph already reviewed locally. Do not recreate a wall of thirteen agent cards or show every possible control.

## Visual system

- Paper `#f7f9f7`; ink `#354d44`; graph teal `#12262b`; selected green `#38664f`; rule `#cbd8d1`; uncertainty amber `#695335`.
- Existing Host Grotesk Variable remains the UI typeface. Use sentence case, actual source names and explicit missing values. No generated confidence percentages or decorative biological chains.
- Main memorable element is the graph. Department controls remain restrained and text-first. All recorded domains has one shared entry; the six departments are selectors of that snapshot.

## Layout

Homepage: compact introduction → six-department navigation plus shared entry → search and one condition → explore/evidence/draft steps → large graph + evidence inspector. Desktop department navigation is one horizontal row, four columns at intermediate sizes, two at phone sizes. Workspace places department controls in the existing left sidebar; centre remains the graph and right remains the source dossier. Bottom evidence/research controls remain existing disclosures, not simulated agent activity.

```text
Homepage                 Research network workspace
shared / six departments departments | graph       | dossier
search / condition       search      | evidence    | context
explore → evidence → draft refinements | list       | comparison
large graph | inspector  pinned investigation/export controls
```

## Interaction and accessibility

`AtlasDepartmentNavigation.tsx` uses native buttons with `aria-pressed`, visible keyboard focus and text counts. `GraphVisual.tsx` retains keyboard node/edge selection, arrow-key panning, fit and accessible list alternative. Network history remains bounded. Refinements are collapsed; phone filter panel has an explicit show/hide control. At 320/390 px there must be no horizontal page overflow. Respect reduced motion and never encode evidence/review status by colour alone.

Changing department retains exact selected IDs, clears no saved record and does not silently switch to a disease example. Missing departmental records show coverage pending. Homepage draft actions are disabled if the selected edge is outside the current view. Source candidates and research gaps remain visibly distinct; no independently approved state exists in this snapshot.

Evidence: `atlas-departments.css`, `home-discovery.css`, `research-network.css`, `GraphVisual.tsx`; browser checks in `atlas-departments.spec.ts` and `homepage-discovery.spec.ts`. Hierarchical layout and true expand/collapse neighbourhood history are subsequent requirements, not implemented by styling this slice.
