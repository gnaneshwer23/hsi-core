import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: ReactNode;
  lede: string;
};

/** Lightweight hero for secondary/status pages — premium tokens, no glow overlays. */
export function PageHero({ eyebrow, title, lede }: Props) {
  return (
    <header className="mp-hero cl-hero page-hero">
      <div className="mp-hero-frame page-hero-inner">
        <div className="mp-hero-copy">
          <p className="mp-eyebrow">
            <span aria-hidden="true" />
            {eyebrow}
          </p>
          <h1 className="display display-lg">{title}</h1>
          <p className="mp-lead lede">{lede}</p>
        </div>
      </div>
    </header>
  );
}
