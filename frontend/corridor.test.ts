import { describe, it, expect } from 'vitest';
import { toGeoJSON, klassColor, pavementPct, KEPT_COLOR } from './corridor';
import { GONE_COLOR, NEW_COLOR } from './surface';
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
    expect(KEPT_COLOR).not.toBe('#59606e');
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
