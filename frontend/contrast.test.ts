import { describe, it, expect } from 'vitest';
import { relativeLuminance, contrastRatio, BASEMAP_LAND } from './contrast';
import { STYLE } from './change';
import { RAMP, GONE_COLOR, NEW_COLOR, DEAD_BAND_COLOR } from './surface';
import { KEPT_COLOR, KEPT_COLOR_LOW } from './corridor';

// The floor this file exists to enforce: change.ts's docstring says gains
// read as loudly as losses, which was true of hue and dot size but said
// nothing about contrast against the basemap -- the one channel that decides
// whether a reader sees a mark at all. These assertions make that a build
// failure instead of a comment nobody re-checks.

function withinRelative(a: number, b: number, pct: number): boolean {
  const larger = Math.max(a, b);
  const smaller = Math.min(a, b);
  return (larger - smaller) / larger <= pct;
}

describe('contrastRatio', () => {
  it('is 21 for white against black', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);
  });

  it('is 1 for a colour against itself', () => {
    expect(contrastRatio('#478a68', '#478a68')).toBeCloseTo(1, 5);
  });
});

describe('relativeLuminance', () => {
  it('is 1 for white and 0 for black', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });
});

describe('change.ts STYLE against the basemap', () => {
  const CONTRAST_FLOOR = 2.5;

  for (const [key, style] of Object.entries(STYLE)) {
    if (key === 'none') continue; // never drawn -- change.ts filters it out
    it(`${key} (${style.color}) clears ${CONTRAST_FLOOR}:1 against the basemap`, () => {
      expect(contrastRatio(style.color, BASEMAP_LAND)).toBeGreaterThanOrEqual(CONTRAST_FLOOR);
    });
  }

  // gone/new, halved/doubled, less/more -- the loss/gain mirror pairs.
  const PAIRS: [string, string][] = [
    ['gone', 'new'],
    ['halved', 'doubled'],
    ['less', 'more'],
  ];

  for (const [loss, gain] of PAIRS) {
    it(`${loss} and ${gain} are within 6% of each other in contrast against the basemap`, () => {
      const lossContrast = contrastRatio(STYLE[loss].color, BASEMAP_LAND);
      const gainContrast = contrastRatio(STYLE[gain].color, BASEMAP_LAND);
      expect(withinRelative(lossContrast, gainContrast, 0.06)).toBe(true);
    });
  }
});

// The surface and the corridor layers re-export three of the bucket colours
// under their own names, so a reader who learns red-means-gone on one layer
// reads it the same way on the next. Nothing else stops those copies drifting
// apart -- the map would simply start saying two different things about the
// same outcome, on two views a click apart.
describe('the layers agree on the colours they share', () => {
  it('the surface paints total loss and new service as the dots do', () => {
    expect(GONE_COLOR).toBe(STYLE.gone.color);
    expect(NEW_COLOR).toBe(STYLE.new.color);
  });

  it("the surface's dead band is the dots' `same` bucket", () => {
    expect(DEAD_BAND_COLOR).toBe(STYLE.same.color);
  });
});

describe('surface.ts RAMP ends against the basemap', () => {
  it('the first and last ramp anchors are within 6% of each other in contrast', () => {
    const first = RAMP[0][1];
    const last = RAMP[RAMP.length - 1][1];
    const firstContrast = contrastRatio(first, BASEMAP_LAND);
    const lastContrast = contrastRatio(last, BASEMAP_LAND);
    expect(withinRelative(firstContrast, lastContrast, 0.06)).toBe(true);
  });
});

describe('corridor.ts kept colours against the basemap', () => {
  it('KEPT_COLOR clears 2.5:1', () => {
    expect(contrastRatio(KEPT_COLOR, BASEMAP_LAND)).toBeGreaterThanOrEqual(2.5);
  });

  it('KEPT_COLOR_LOW clears 3.5:1', () => {
    expect(contrastRatio(KEPT_COLOR_LOW, BASEMAP_LAND)).toBeGreaterThanOrEqual(3.5);
  });
});
