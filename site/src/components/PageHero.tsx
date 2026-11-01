import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: ReactNode;
  lede: string;
};

export function PageHero({ eyebrow, title, lede }: Props) {
  return (
    <section className="page-hero">
      <div className="hero-glow" aria-hidden />
      <div className="container page-hero-inner">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="display display-lg">{title}</h1>
        <p className="lede">{lede}</p>
      </div>
    </section>
  );
}
