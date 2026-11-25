import { STATUS_META, STATUS_ORDER, type AtlasStatus } from "./atlasData";

/** A short line sample in the status's own stroke style, so the legend, chips and map use one visual language. */
export function StatusLine({ status, className }: { status: AtlasStatus; className?: string }) {
  const m = STATUS_META[status];
  return (
    <svg width="28" height="8" viewBox="0 0 28 8" aria-hidden className={className}>
      <line x1="1" y1="4" x2="27" y2="4" stroke={m.colour} strokeWidth={m.width} strokeDasharray={m.dash} strokeLinecap="round" />
    </svg>
  );
}

export function StatusChip({ status }: { status: AtlasStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2 py-0.5 font-mono text-[11px] text-foreground">
      <StatusLine status={status} />
      <span style={{ color: m.colour }}>{m.short}</span>
    </span>
  );
}

/** Legend for the atlas. The dot on each entity takes the weakest status among its relations. */
export function EvidenceLegend() {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Evidence status</p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATUS_ORDER.map((s) => (
          <li key={s} className="flex gap-3 text-sm">
            <StatusLine status={s} className="mt-1.5 shrink-0" />
            <span>
              <span className="font-medium">{STATUS_META[s].label}</span>
              <span className="block text-xs text-muted-foreground">{STATUS_META[s].gloss}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">
        The dot beside each entity shows the weakest status among its relations. Red is used only for unresolved conflicts.
      </p>
    </div>
  );
}
