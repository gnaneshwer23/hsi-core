import { Link as RouterLink, type LinkProps } from "react-router-dom";

/** The few pages that are still previews live under this prefix; every other path is a real site route. */
export const LV2_BASE = "/landing-v2";
const PREVIEW_PAGES = new Set<string>();
/** "Early access" goes to /contact, the one working way to ask for access (a pilot request plus account creation). */
const ALIASES: Record<string, string> = { "/early-access": "/contact" };

export function hrefFor(to: string) {
  const base = to.split(/[?#]/)[0]!;
  const rest = to.slice(base.length);
  return (ALIASES[base] ?? (PREVIEW_PAGES.has(base) ? LV2_BASE + base : base)) + rest;
}
export function Link({ to, ...rest }: Omit<LinkProps, "to"> & { to: string }) {
  return <RouterLink to={hrefFor(to)} {...rest} />;
}
/** A link to any other page of the site, unchanged. Kept for call sites that want to say so. */
export function SiteLink(props: LinkProps) {
  return <RouterLink {...props} />;
}
