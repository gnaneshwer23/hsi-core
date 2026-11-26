import { Link as RouterLink, type LinkProps } from "react-router-dom";

/** Pages of this section that are not the homepage live under this prefix. */
export const LV2_BASE = "/landing-v2";
/** Destinations that exist as real site pages: the homepage and the Trust page. Everything else is a landing v2 page. */
const SITE_PAGES: Record<string, string> = { "/": "/", "/trust": "/trust" };

export function hrefFor(to: string) {
  return SITE_PAGES[to] ?? LV2_BASE + to;
}
export function Link({ to, ...rest }: Omit<LinkProps, "to"> & { to: string }) {
  return <RouterLink to={hrefFor(to)} {...rest} />;
}
/** A link to any other page of the site, unchanged (sign-in, how it works, contact, the research app). */
export function SiteLink(props: LinkProps) {
  return <RouterLink {...props} />;
}
