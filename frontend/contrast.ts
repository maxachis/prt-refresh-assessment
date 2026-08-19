/**
 * WCAG 2.1 contrast, standard library only.
 *
 * Every colour this app draws on the map sits on the same ground: OpenFreeMap
 * Positron's land fill (main.ts's basemap style). Hue and dot size can be as
 * symmetric as change.ts's docstring insists and a colour can still be
 * invisible if it is too close in lightness to that ground -- contrast is the
 * one channel that decides whether a reader sees a mark at all, so it gets a
 * floor of its own, checked here rather than left to a comment.
 */

/** OpenFreeMap Positron's land colour -- the ground every map colour here is judged against. */
export const BASEMAP_LAND = '#f2efe9';

function srgbChannelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.1 relative luminance of a '#rrggbb' colour. */
export function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const [rl, gl, bl] = [r, g, b].map(srgbChannelToLinear);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** WCAG 2.1 contrast ratio between two '#rrggbb' colours, always >= 1. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}
