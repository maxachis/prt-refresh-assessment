import { describe, it, expect } from 'vitest';
import {
  toGeoJSON, klassColor, pavementPct, colorExpr, KEPT_COLOR, KEPT_COLOR_LOW,
} from './corridor';
import { GONE_COLOR, NEW_COLOR, DEAD_BAND_COLOR } from './surface';
import { CorridorLayer } from './types';

function layer(overrides: Partial<CorridorLayer> = {}): CorridorLayer {
  return {
    day: 'weekday',
    km: { kept: 897.8, lost: 258.5, added: 83.0 },
    runs: [
      { klass: 'kept', length_m: 120.4, geometry: [[-79.99, 40.44], [-79.98, 40.45]] },
      { klass: 'lost', length_m: 45.1, geometry: [[-79.97, 40.43], [-79.96, 40.42]] },
      { klass: 'added', length_m: 60.0, geometry: [[-79.95, 40.41], [-79.94, 40.40]] },
    ],
    ...overrides,
  };
}

describe('toGeoJSON', () => {
  it('produces one LineString feature per run, klass carried as a property', () => {
    const gj = toGeoJSON(layer());
    expect(gj.features).toHaveLength(3);
    expect(gj.features.map((f) => f.properties.klass)).toEqual(['kept', 'lost', 'added']);
    expect(gj.features.every((f) => f.geometry.type === 'LineString')).toBe(true);
  });

  it('carries coordinates through in the order the API sent them, unparsed', () => {
    const gj = toGeoJSON(layer());
    expect(gj.features[1].geometry.coordinates).toEqual([[-79.97, 40.43], [-79.96, 40.42]]);
  });
});

describe('klassColor', () => {
  it('matches the surface palette for lost and added, so the two views agree', () => {
    expect(klassColor('lost')).toBe(GONE_COLOR);
    expect(klassColor('added')).toBe(NEW_COLOR);
  });

  it('gives kept its own colour, distinct from the surface dead band', () => {
    // kept needs contrast against the Positron basemap that the surface's
    // fill layer never had to survive -- see the corridor.ts module doc.
    expect(klassColor('kept')).toBe(KEPT_COLOR);
    expect(KEPT_COLOR).not.toBe(DEAD_BAND_COLOR);
  });
});

describe('pavementPct', () => {
  it("expresses loss and gain as a share of today's pavement (kept + lost)", () => {
    const { lostPct, addedPct } = pavementPct(layer().km);
    // today = 897.8 + 258.5 = 1156.3
    expect(lostPct).toBeCloseTo((258.5 / 1156.3) * 100, 5);
    expect(addedPct).toBeCloseTo((83.0 / 1156.3) * 100, 5);
  });

  it('does not divide by added km, which is not part of the denominator', () => {
    const { lostPct } = pavementPct({ kept: 10, lost: 10, added: 1000 });
    expect(lostPct).toBeCloseTo(50, 5);
  });
});

describe('colorExpr', () => {
  // MapLibre allows a zoom expression only as the input to a TOP-LEVEL step or
  // interpolate. Nesting one inside the match on `klass` -- the shape the code
  // wants, since only kept varies with zoom -- is rejected at addLayer time and
  // the entire Streets layer silently fails to draw. It typechecks, because
  // these expressions are `any`, so this test is the only thing standing
  // between that mistake and a blank map.
  it('puts zoom at the top level, not inside the match on class', () => {
    const expr = colorExpr();
    expect(expr[0]).toBe('interpolate');
    expect(expr[2]).toEqual(['zoom']);
    for (const part of expr.slice(3)) {
      expect(JSON.stringify(part)).not.toContain('zoom');
    }
  });

  it('darkens kept at low zoom and lightens it back in', () => {
    const expr = colorExpr();
    const [lowZoom, lowExpr, highZoom, highExpr] = expr.slice(3);
    expect(lowZoom).toBeLessThan(highZoom);
    expect(lowExpr[lowExpr.length - 1]).toBe(KEPT_COLOR_LOW);
    expect(highExpr[highExpr.length - 1]).toBe(KEPT_COLOR);
  });

  it('keeps lost and added flat at every zoom', () => {
    const [lowExpr, highExpr] = [colorExpr()[4], colorExpr()[6]];
    for (const expr of [lowExpr, highExpr]) {
      expect(expr).toContain(klassColor('lost'));
      expect(expr).toContain(klassColor('added'));
    }
  });
});
