import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import type { Status } from "../../lib/site-data";

const statusStyle: Record<Status, string> = {
  Prototype: "text-primary border-primary/40 bg-primary/10",
  "In development": "text-helix-ink border-helix/40 bg-helix/10",
  Planned: "text-muted-foreground border-border bg-muted",
  Illustrative: "text-signal border-signal/40 bg-signal/10",
};

export function StatusTag({ s, className }: { s: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyle[s],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {s}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-primary">
      {children}
    </p>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("border-t border-border/60 py-20 md:py-28", className)}>
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="max-w-3xl">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h2 className="mt-5 font-display text-[clamp(2.1rem,4.4vw,4rem)] font-medium leading-[0.98] tracking-[-0.03em]">
            {title}
          </h2>
          {intro && (
            <p className="mt-6 max-w-2xl font-serif text-xl leading-snug text-foreground/75">
              {intro}
            </p>
          )}
        </div>
        {children && <div className="mt-12">{children}</div>}
      </div>
    </section>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "border-t border-border bg-transparent pt-6 pb-2 transition-colors duration-300 hover:border-primary",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 glow-hero" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="relative mx-auto max-w-[1440px] px-5 pb-24 pt-24 md:px-10 md:pt-36">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 max-w-5xl font-display text-[clamp(2.6rem,6vw,5.75rem)] font-medium leading-[0.95] tracking-[-0.04em]">
          {title}
        </h1>
        <p className="mt-8 max-w-2xl font-serif text-xl leading-snug text-foreground/75 md:text-2xl">
          {intro}
        </p>
        {children}
      </div>
    </section>
  );
}

export function meta(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
