import { Link } from "../../router";

/** Screenshots of the graph workspace, captured from the published candidate graph. */
export const WORKSPACE_SHOTS = {
  overview: { src: "/images/product/workspace-overview.webp", w: 1440, h: 820, alt: "Graph workspace: filters on the left, the immunology and microbiome slice in the centre with scale controls, and a relationship inspector on the right listing its candidate status and which context is not stated" },
  threeD: { src: "/images/product/workspace-3d.webp", w: 760, h: 595, alt: "3D view of the same concepts, stacked by biological scale, with concepts whose scale is not recorded on a separate lower plane" },
  contradiction: { src: "/images/product/workspace-contradiction.webp", w: 760, h: 1300, alt: "Recorded disagreements sorted into potential contradiction, possible context dependence and insufficient context, with a side-by-side table of the variables each finding states" },
  nexus: { src: "/images/product/workspace-nexus.webp", w: 760, h: 1150, alt: "NEXUS panel with six selected findings, three deterministic checks, language-model interpretation shown as not enabled, and a comparability answer labelled as a candidate finding" },
  experiment: { src: "/images/product/workspace-experiment.webp", w: 722, h: 890, alt: "A recorded question shown as a candidate experiment design with its prediction, what would count against it, recorded controls, gaps and association chains" },
} as const;

export function WorkspaceFigure({ shot, caption, cta, to = "/workspace/graph" }: { shot: keyof typeof WORKSPACE_SHOTS; caption: string; cta?: string; to?: string }) {
  const s = WORKSPACE_SHOTS[shot];
  return (
    <figure className="max-w-full">
      <img src={s.src} width={s.w} height={s.h} alt={s.alt} loading="lazy" decoding="async" className="h-auto w-full rounded-xl border border-border" />
      <figcaption className="mt-2 text-sm text-muted-foreground">
        {caption} Screenshot of the published candidate graph; every relationship shown is unreviewed.
        {cta ? (
          <>
            {" "}
            <Link to={to} className="text-primary underline underline-offset-4">{cta}</Link>
          </>
        ) : null}
      </figcaption>
    </figure>
  );
}
