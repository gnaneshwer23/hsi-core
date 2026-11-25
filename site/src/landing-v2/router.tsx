import { Link as RouterLink, type LinkProps } from "react-router-dom";

/** The landing v2 pages are mounted under this prefix, so they never collide with the site's existing routes. */
export const LV2_BASE = "/landing-v2";

export function Link({ to, ...rest }: Omit<LinkProps, "to"> & { to: string }) {
  return <RouterLink to={to === "/" ? LV2_BASE : LV2_BASE + to} {...rest} />;
}
