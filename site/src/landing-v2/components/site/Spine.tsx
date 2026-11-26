import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** A numbered vertical rail for ordered steps. Plain list semantics, no state or motion. */
export function Spine({ items, label, className }: { items: { title: string; text: ReactNode; tag?: ReactNode }[]; label: string; className?: string }) {
  return (
    <ol className={cn("relative max-w-3xl", className)} aria-label={label}>
      {items.map((s, i) => (
        <li key={s.title} className="relative flex gap-5 pb-8 last:pb-0">
          {i < items.length - 1 && <span className="absolute left-[15px] top-9 h-[calc(100%-2rem)] w-px bg-border" aria-hidden />}
          <span className="relative grid size-8 shrink-0 place-items-center rounded-full border border-primary/50 bg-background font-mono text-xs text-primary">{i + 1}</span>
          <div>
            <h3 className="flex flex-wrap items-center gap-3 font-display text-lg font-medium">
              {s.title}
              {s.tag}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** One short statement per line, set apart from body copy. */
export function Statements({ items }: { items: string[] }) {
  return (
    <ul className="mt-10 max-w-3xl space-y-3 border-l-2 border-primary/50 pl-5">
      {items.map((t) => (
        <li key={t} className="font-serif text-xl leading-snug text-foreground/85">{t}</li>
      ))}
    </ul>
  );
}

/** Holds a form or widget built for a light surface inside the dark theme. */
export function PaperPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl bg-paper p-5 text-ink md:p-8", className)}>{children}</div>;
}
