import { describe, it, expect } from 'vitest';
import { summarisePopulationInBounds } from './population';
import { PopulationCell } from './types';

const ORIGIN = { lat0: 40.45, lon0: -79.98, dlat: 0.000898, dlon: 0.001181 };
const BOX = { w: -80.5, s: 40.0, e: -79.5, n: 41.0 };

function tally(cells: PopulationCell[], day = 0) {
  return summarisePopulationInBounds(
    cells, day, BOX.w, BOX.s, BOX.e, BOX.n, ORIGIN);
}

describe('summarisePopulationInBounds', () => {
  it('sums each class over the cells in view', () => {
    // [ix, iy, wLost, wGained, wKept, wNone, sLost, sGained, sKept, sNone, uLost, uGained, uKept, uNone]
    const cells: PopulationCell[] = [
      [0, 0, 12, 0, 40, 3, 6, 0, 20, 3, 4, 0, 18, 3],
      [1, 0, 8, 5, 10, 0, 4, 2, 5, 0, 2, 1, 4, 0],
    ];
    expect(tally(cells)).toEqual({ lost: 20, gained: 5, kept: 50, none: 3 });
  });

  it('reads the day type it is asked for, not always weekday', () => {
    const cells: PopulationCell[] = [
      [0, 0, 12, 0, 40, 3, 6, 1, 20, 2, 4, 0, 18, 3],
    ];
    expect(tally(cells, 1)).toEqual({ lost: 6, gained: 1, kept: 20, none: 2 });
  });

  it('counts only cells whose centre falls inside the bounds', () => {
    const inView: PopulationCell = [0, 0, 12, 0, 40, 3, 6, 0, 20, 3, 4, 0, 18, 3];
    const farAway: PopulationCell = [99999, 99999, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    expect(tally([inView, farAway])).toEqual({ lost: 12, gained: 0, kept: 40, none: 3 });
  });

  it('sees no residents when the lattice has no cells at all', () => {
    expect(tally([])).toEqual({ lost: 0, gained: 0, kept: 0, none: 0 });
  });
});
