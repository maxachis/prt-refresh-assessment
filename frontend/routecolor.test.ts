import { describe, it, expect } from 'vitest';
import { routeColors, oklchToHex, ROUTE_L, ROUTE_C, naturalCompare } from './routecolor';

// --------------------------------------------------------------------------
// the converter
// --------------------------------------------------------------------------

/**
 * OKLCH's hue, read back off a rendered hex — sRGB decoded, linearised, run
 * through the inverse of the same matrices.
 *
 * The test owns this rather than the module, deliberately: "equal steps in
 * hue" is the whole claim of the palette, and a claim checked with the
 * module's own forward function would only prove the function agrees with
 * itself. This measures the colour a browser will actually paint.
 */
function hueOf(hex: string): number {
  const to = (i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = [0, 1, 2].map((i) => lin(to(i)));
  const cb = (v: number) => Math.cbrt(v);
  const l = cb(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = cb(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = cb(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
}

/** Degrees between two hues, the short way round the circle. */
function hueGap(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180);
}

/** Rounding to eight bits per channel moves a hue by a fraction of a degree. */
const HUE_TOLERANCE_DEG = 1.5;

describe('oklchToHex', () => {
  it('reproduces the sRGB primaries the CSS spec gives in OKLCH', () => {
    // oklch(0.627955 0.257683 29.2338) is the CSS Color 4 worked value for
    // pure red; a converter off by a matrix would miss it visibly.
    expect(oklchToHex(0.627955, 0.257683, 29.2338)).toBe('#ff0000');
  });

  it('takes lightness to the ends of the range', () => {
    expect(oklchToHex(1, 0, 0)).toBe('#ffffff');
    expect(oklchToHex(0, 0, 0)).toBe('#000000');
  });

  it('lands inside sRGB for every hue, by pulling chroma in where it must', () => {
    // At L 0.55 the gamut is narrowest around cyan, where only about C 0.093
    // fits; asked for 0.16 there, an unclamped converter would return a
    // channel it had to saturate, and two neighbouring hues would come back
    // as the same flat colour.
    for (let h = 0; h < 360; h++) {
      const hex = oklchToHex(ROUTE_L, ROUTE_C, h);
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
      // The hue survives: a converter that clipped an out-of-gamut channel
      // instead of pulling chroma in would land on a different hue than the
      // one it was asked for, and two neighbours would converge.
      expect(hueGap(hueOf(hex), h)).toBeLessThan(HUE_TOLERANCE_DEG);
    }
  });
});

// --------------------------------------------------------------------------
// the natural sort
// --------------------------------------------------------------------------

describe('naturalCompare', () => {
  it('orders a route list the way PRT numbers one, not the way a string sorts', () => {
    const ids = ['O1', '61B', '16', 'G3', '8', '61A'];
    expect([...ids].sort(naturalCompare)).toEqual(['8', '16', '61A', '61B', 'G3', 'O1']);
  });

  it('puts the numbered routes before the lettered ones', () => {
    expect([...['P1', '48', '28X']].sort(naturalCompare)).toEqual(['28X', '48', 'P1']);
  });
});

// --------------------------------------------------------------------------
// the palette
// --------------------------------------------------------------------------

describe('routeColors', () => {
  it('gives every route its own colour', () => {
    const ids = ['61A', '61B', '61C', '61D', '71A', '71B'];
    const m = routeColors(ids);
    expect(m.size).toBe(6);
    expect(new Set(m.values()).size).toBe(6);
  });

  it('spaces the hues evenly, which is what OKLCH is here for', () => {
    const ids = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const hues = [...routeColors(ids).values()].map(hueOf);
    const steps = hues.slice(1).map((h, i) => (h - hues[i] + 360) % 360);
    for (const s of steps) expect(hueGap(s, 360 / ids.length)).toBeLessThan(HUE_TOLERANCE_DEG);
  });

  it('holds its hues apart at a downtown kerb, where 36 routes call', () => {
    const ids = Array.from({ length: 36 }, (_, i) => `R${i}`);
    const m = routeColors(ids);
    expect(new Set(m.values()).size).toBe(36);
  });

  it('is independent of the order the ids arrived in', () => {
    const ids = ['61B', '8', 'G3', '16'];
    const forward = routeColors(ids);
    const back = routeColors([...ids].reverse());
    for (const id of ids) expect(back.get(id)).toBe(forward.get(id));
  });

  it('ignores a repeated id rather than spending a hue on it', () => {
    const m = routeColors(['61A', '61A', '61B']);
    expect(m.size).toBe(2);
    expect(m).toEqual(routeColors(['61A', '61B']));
  });

  it('colours a lone route rather than dividing by nothing', () => {
    const m = routeColors(['61A']);
    expect(m.get('61A')).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('draws nothing for an empty kerb', () => {
    expect(routeColors([]).size).toBe(0);
  });

  it('takes any iterable, so a Set of ids needs no array made of it', () => {
    expect(routeColors(new Set(['8', '16']))).toEqual(routeColors(['8', '16']));
  });
});
