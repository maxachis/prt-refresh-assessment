import { describe, it, expect } from 'vitest';
import {
  countIn, countNewPlacesIn, sumRidersIn, STYLE, viewportScope, selectionScope,
  withinBrush,
} from './change';
import { BUCKET, CUR, ID, PROP, PUBLISHED, RIDERS, ChangePoint } from './types';

// The wire format is positional, so an off-by-one in the offsets recolours the
// whole map and miscounts the legend without changing a single number on the
// server. These pin the offsets against a hand-built row.
//
//   [lat, lon, published, id, wCur, wProp, wBucket, wRiders, sCur, ...]
const KEYS = ['gone', 'halved', 'less', 'same', 'more', 'doubled', 'new', 'none'];

let nextId = 0;

function row(lat: number, lon: number, weekdayBucket: number,
             riders: number | null = 10, id = `c:${++nextId}`): ChangePoint {
  return [lat, lon, 1, id,
          40, 20, weekdayBucket, riders, 30, 15, 1, riders, 20, 10, 1, riders];
}

/**
 * A place the plan puts a stop where none stands today (`published = 0`).
 *
 * Never in a bucket and never in a rider total: no bus stops there, so it has
 * no service today to compare against and nobody has boarded there.
 */
function addedPlace(lat: number, lon: number, weekdayBucket: number,
                    id = `p:${++nextId}`): ChangePoint {
  return [lat, lon, 0, id,
          0, 20, weekdayBucket, null, 0, 15, 1, null, 0, 10, 1, null];
}

const BOX_SCOPE = (b: { w: number; s: number; e: number; n: number }) =>
  viewportScope(b.w, b.s, b.e, b.n);

describe('ChangePoint offsets', () => {
  it('reads each day type from its own slot', () => {
    const p = [40.44, -79.99, 1, 'c:1',
               40, 20, 1, 99, 30, 15, 5, 50, 20, 0, 0, 25];
    expect(p[PUBLISHED]).toBe(1);
    expect(p[ID]).toBe('c:1');
    expect([CUR(0), PROP(0), BUCKET(0), RIDERS(0)].map((i) => p[i]))
      .toEqual([40, 20, 1, 99]);
    expect([CUR(1), PROP(1), BUCKET(1), RIDERS(1)].map((i) => p[i]))
      .toEqual([30, 15, 5, 50]);
    expect([CUR(2), PROP(2), BUCKET(2), RIDERS(2)].map((i) => p[i]))
      .toEqual([20, 0, 0, 25]);
  });
});

describe('countIn', () => {
  const pts = [
    row(40.44, -79.99, 0),   // gone,    inside
    row(40.45, -79.98, 0),   // gone,    inside
    row(40.44, -79.99, 5),   // doubled, inside
    row(41.90, -79.99, 0),   // gone,    north of the box
    row(40.44, -75.00, 0),   // gone,    east of the box
  ];
  const BOX = { w: -80.1, s: 40.3, e: -79.9, n: 40.5 };

  it('counts only what is inside the viewport', () => {
    const c = countIn(pts, 0, KEYS, BOX_SCOPE(BOX));
    expect(c.gone).toBe(2);
    expect(c.doubled).toBe(1);
    expect(c.halved).toBe(0);
  });

  it('counts the day type it is asked for, not the weekday one', () => {
    // Every row above is bucket 1 (halved) on Saturday and Sunday.
    const sat = countIn(pts, 1, KEYS, BOX_SCOPE(BOX));
    expect(sat.halved).toBe(3);
    expect(sat.gone).toBe(0);
  });

  it('counts only the stops that stand today', () => {
    // The buckets compare today's service to the plan's, and a place with no
    // stop today has nothing on the left-hand side. Counted in one anyway, a
    // dot read "doubled or better" and "the plan adds a stop here" at once.
    const pts = [row(40.44, -79.99, 0), addedPlace(40.44, -79.98, 5)];
    const c = countIn(pts, 0, KEYS, BOX_SCOPE({ w: -80.1, s: 40.3, e: -79.9, n: 40.5 }));
    expect(c.gone).toBe(1);
    expect(c.doubled).toBe(0);
  });

  it('returns a zero for every bucket, so the legend never omits a row', () => {
    const c = countIn([], 0, KEYS, BOX_SCOPE(BOX));
    expect(Object.keys(c).sort()).toEqual([...KEYS].sort());
    expect(Object.values(c).every((n) => n === 0)).toBe(true);
  });
});

describe('the ramp', () => {
  it('has a style for every bucket the server can send', () => {
    for (const k of KEYS) expect(STYLE[k]).toBeDefined();
  });

  it('gives losses and gains equal weight', () => {
    // Gains read as loudly as losses: the plan is close to service-neutral and
    // a map that drew the losses larger would mislead at a glance.
    expect(STYLE.halved.size).toBe(STYLE.doubled.size);
    expect(STYLE.less.size).toBe(STYLE.more.size);
    expect(STYLE.gone.size).toBe(STYLE.new.size);
  });

  it('keeps size as a second channel, so the extremes survive colour blindness', () => {
    expect(STYLE.gone.size).toBeGreaterThan(STYLE.halved.size);
    expect(STYLE.halved.size).toBeGreaterThan(STYLE.less.size);
    expect(STYLE.less.size).toBeGreaterThan(STYLE.same.size);
  });
});


describe('sumRidersIn', () => {
  const pts = [
    row(40.44, -79.99, 0, 100),    // gone,    inside, 100 boardings
    row(40.45, -79.98, 0, 25),     // gone,    inside,  25 boardings
    row(40.44, -79.97, 5, 400),    // doubled, inside
    row(40.44, -79.96, 6, null),   // new,     inside, stands today, no record
    addedPlace(40.44, -79.955, 6),  // a stop the plan adds, inside the box
    row(41.90, -79.99, 0, 900),    // gone,    north of the box
  ];
  const BOX = { w: -80.1, s: 40.3, e: -79.9, n: 40.5 };

  it('sums the boardings of what is in view, by bucket', () => {
    const t = sumRidersIn(pts, 0, KEYS, BOX_SCOPE(BOX));
    expect(t.riders.gone).toBe(125);
    expect(t.riders.doubled).toBe(400);
    expect(t.riders.halved).toBe(0);
  });

  it('keeps a stop with no ridership record out of every total', () => {
    // 209 stops that run today carry no row in the usage extract. Counting
    // one as 0 riders would say nobody boards there, which the absence of a
    // record cannot support.
    const t = sumRidersIn(pts, 0, KEYS, BOX_SCOPE(BOX));
    expect(t.riders.new).toBe(0);
    expect(t.measured.new).toBe(0);
    expect(t.unmeasured).toBe(1);
  });

  it('leaves out the places the plan adds a stop to, not even as unmeasured', () => {
    // A different absence from the one above, and running them together was
    // the old defect: nobody has boarded where no bus stops, so these can
    // never carry a figure. The legend says that in its own row.
    const t = sumRidersIn(pts, 0, KEYS, BOX_SCOPE(BOX));
    expect(t.unmeasured).toBe(1);
    expect(countNewPlacesIn(pts, BOX_SCOPE(BOX))).toBe(1);
  });

  it('counts the measured locations behind each total', () => {
    const t = sumRidersIn(pts, 0, KEYS, BOX_SCOPE(BOX));
    expect(t.measured.gone).toBe(2);
    expect(t.measured.doubled).toBe(1);
  });

  it('reads the day type it is asked for', () => {
    // Every row is bucket 1 (halved) on a Saturday.
    const sat = sumRidersIn(pts, 1, KEYS, BOX_SCOPE(BOX));
    expect(sat.riders.halved).toBe(525);
    expect(sat.riders.gone).toBe(0);
  });
});

describe('selectionScope', () => {
  // The scope a reader paints, rather than the one they pan to. Its whole
  // point is that it ignores the viewport: a stop selected and then scrolled
  // off screen is still one of the stops the number speaks for.
  const near = row(40.44, -79.99, 0, 100, 'c:1');
  const alsoNear = row(40.45, -79.98, 5, 200, 'c:2');
  const faraway = row(41.90, -79.99, 0, 400, 'c:3');
  const pts = [near, alsoNear, faraway];
  const picked = new Set(['c:1', 'c:3']);

  it('counts the stops picked, wherever they are', () => {
    const c = countIn(pts, 0, KEYS, selectionScope(picked));
    expect(c.gone).toBe(2);      // c:1 in view and c:3 well outside it
    expect(c.doubled).toBe(0);   // c:2 is on screen and was not picked
  });

  it('weighs the same stops by their boardings', () => {
    const t = sumRidersIn(pts, 0, KEYS, selectionScope(picked));
    expect(t.riders.gone).toBe(500);
    expect(t.measured.gone).toBe(2);
  });

  it('counts nothing when nothing is picked', () => {
    const c = countIn(pts, 0, KEYS, selectionScope(new Set()));
    expect(Object.values(c).every((n) => n === 0)).toBe(true);
  });
});

describe('withinBrush', () => {
  // The map answers with a rectangle; the reader is watching a circle. The
  // corners are the difference, and they are stops the ring never touched.
  const dots = [
    { id: 'c:mid', x: 100, y: 100 },
    { id: 'c:edge', x: 100, y: 113 },   // 13px away, inside a 14px brush
    { id: 'c:corner', x: 113, y: 113 }, // in the query box, outside the ring
    { id: 'c:far', x: 200, y: 100 },
  ];

  it('takes what the ring covers and leaves the box corners', () => {
    expect(withinBrush(100, 100, 14, dots)).toEqual(['c:mid', 'c:edge']);
  });

  it('takes nothing when the stroke is over empty ground', () => {
    expect(withinBrush(500, 500, 14, dots)).toEqual([]);
  });
});
