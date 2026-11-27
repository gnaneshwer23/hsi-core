import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import type { Status } from "../../lib/site-data";

/** A status inside a list or table: plain small text, not a badge. Pages state their overall status once, with PageStatus. */
export function StatusTag({ s, className }: { s: Status; className?: string }) {
  return <span className={cn("text-xs text-muted-foreground", s === "Prototype" && "text-primary", className)}>{s}</span>;
}

/** The one status line a page carries: what works today, and what is planned or illustrative. */
export function PageStatus({ children }: { children: ReactNode }) {
  return (
    <p className="mt-8 max-w-2xl border-l-2 border-border pl-4 text-sm leading-relaxed text-muted-foreground">
      <span className="font-medium text-foreground">Status. </span>
      {children}
    </p>
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
      <div className="relative mx-auto max-w-[1440px] border-b border-border px-5 pb-20 pt-24 md:px-10 md:pt-32">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.6rem,6vw,5.75rem)] font-medium leading-[0.95] tracking-[-0.04em]">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl font-serif text-xl leading-snug text-foreground/75">
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
