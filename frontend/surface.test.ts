import { describe, it, expect } from 'vitest';
import {
  rampValue, cellKind, toGeoJSON, summariseInBounds, RAMP, RAMP_CLAMP,
} from './surface';
import { SurfaceLayer } from './types';

const ORIGIN = { lat0: 40.45, lon0: -79.98, dlat: 0.000898, dlon: 0.001181 };

/** [ix, iy, wCur, wProp, sCur, sProp, uCur, uProp] */
function layer(cells: number[][]): SurfaceLayer {
  return {
    radius: 400, cell_m: 100,
    days: ['weekday', 'saturday', 'sunday'],
    origin: ORIGIN, fields: [], cells,
  };
}

describe('cellKind', () => {
  it('separates total loss and new service from the ramp', () => {
    expect(cellKind(40, 0)).toBe('gone');
    expect(cellKind(0, 40)).toBe('new');
    expect(cellKind(0, 0)).toBe('none');
    expect(cellKind(40, 20)).toBe('ramp');
  });

  // The ordering that matters: prop === 0 also satisfies "halved or worse",
  // and letting the ratio decide first would hide the plainest outcome on the
  // map inside a frequency gradient. Same rule as query.bucket().
  it('calls a cell that loses everything gone, not quartered', () => {
    expect(cellKind(100, 0)).toBe('gone');
    expect(rampValue(100, 0)).toBeNull();
  });
});

describe('rampValue', () => {
  it('is zero at no change and symmetric about it', () => {
    expect(rampValue(40, 40)).toBe(0);
    expect(rampValue(40, 20)).toBe(-1);
    expect(rampValue(40, 80)).toBe(1);
  });

  it('clamps the extremes so one outlier cannot own the ramp', () => {
    expect(rampValue(1, 1000)).toBe(RAMP_CLAMP);
    expect(rampValue(1000, 1)).toBe(-RAMP_CLAMP);
  });

  it('puts the published bucket edges where the ramp has its anchors', () => {
    // halved (LOSE-FREQUENCY-HALF) and doubled (GAIN-FREQUENCY-DOUBLE) must
    // land exactly on a ramp stop, or the surface would show a bucket edge
    // somewhere the dots do not.
    const stops = RAMP.map(([v]) => v);
    expect(stops).toContain(rampValue(40, 20));
    expect(stops).toContain(rampValue(40, 80));
  });
});

describe('the ramp itself', () => {
  it('is symmetric in its stops, so gains read as loudly as losses', () => {
    const stops = RAMP.map(([v]) => v);
    expect(stops.map((v) => -v).sort((a, b) => a - b))
      .toEqual([...stops].sort((a, b) => a - b));
  });

  it('is ordered, as a gradient needs to be', () => {
    const stops = RAMP.map(([v]) => v);
    expect([...stops].sort((a, b) => a - b)).toEqual(stops);
  });
});

describe('toGeoJSON', () => {
  it('rebuilds a closed square from the lattice index', () => {
    const gj = toGeoJSON(layer([[0, 0, 10, 10, 0, 0, 0, 0]]));
    const ring = gj.features[0].geometry.coordinates[0];
    expect(ring).toHaveLength(5);
    expect(ring[0]).toEqual(ring[4]);                      // closed
    expect(ring[0][0]).toBeCloseTo(ORIGIN.lon0, 6);        // SW corner
    expect(ring[2][1]).toBeCloseTo(ORIGIN.lat0 + ORIGIN.dlat, 6);
  });

  it('carries a kind and a ramp value per day type', () => {
    const gj = toGeoJSON(layer([[3, 4, 10, 5, 10, 0, 0, 8]]));
    const p = gj.features[0].properties as any;
    expect([p.k0, p.v0]).toEqual(['ramp', -1]);
    expect(p.k1).toBe('gone');
    expect(p.k2).toBe('new');
  });
});

describe('summariseInBounds', () => {
  const CELL_KM2 = 0.01;
  const box = { w: -80.5, s: 40.0, e: -79.5, n: 41.0 };

  function area(cells: number[][], day = 0) {
    return summariseInBounds(cells, day, box.w, box.s, box.e, box.n,
                             ORIGIN, CELL_KM2);
  }

  it('reports square kilometres by outcome', () => {
    const got = area([
      [0, 0, 10, 0, 0, 0, 0, 0],     // gone
      [1, 0, 0, 10, 0, 0, 0, 0],     // new
      [2, 0, 10, 4, 0, 0, 0, 0],     // less
      [3, 0, 10, 40, 0, 0, 0, 0],    // more
      [4, 0, 10, 10, 0, 0, 0, 0],    // same
    ]);
    expect(got).toEqual({
      gone: CELL_KM2, new: CELL_KM2, less: CELL_KM2,
      more: CELL_KM2, same: CELL_KM2,
    });
  });

  it('treats a change inside the dead band as no change', () => {
    // +5% is inside the +/-10% band the dots' `same` bucket uses.
    expect(area([[0, 0, 100, 105, 0, 0, 0, 0]]).same).toBe(CELL_KM2);
    expect(area([[0, 0, 100, 105, 0, 0, 0, 0]]).more).toBe(0);
  });

  it('counts only what is on screen', () => {
    const far = [[9999, 9999, 10, 0, 0, 0, 0, 0]];
    expect(area(far).gone).toBe(0);
  });

  it('ignores cells with no service either way', () => {
    const got = area([[0, 0, 0, 0, 0, 0, 0, 0]]);
    expect(Object.values(got).every((v) => v === 0)).toBe(true);
  });

  it('summarises the day type it is asked for', () => {
    const cells = [[0, 0, 10, 10, 10, 0, 0, 0]];
    expect(area(cells, 0).same).toBe(CELL_KM2);
    expect(area(cells, 1).gone).toBe(CELL_KM2);
  });
});
