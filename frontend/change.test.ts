import { describe, it, expect } from 'vitest';
import { countInBounds, sumRidersInBounds, STYLE } from './change';
import { BUCKET, CUR, PROP, PUBLISHED, RIDERS, ChangePoint } from './types';

// The wire format is positional, so an off-by-one in the offsets recolours the
// whole map and miscounts the legend without changing a single number on the
// server. These pin the offsets against a hand-built row.
//
//   [lat, lon, published, wCur, wProp, wBucket, wRiders, sCur, ...]
const KEYS = ['gone', 'halved', 'less', 'same', 'more', 'doubled', 'new', 'none'];

function row(lat: number, lon: number, weekdayBucket: number,
             riders: number | null = 10): ChangePoint {
  return [lat, lon, riders === null ? 0 : 1,
          40, 20, weekdayBucket, riders, 30, 15, 1, riders, 20, 10, 1, riders];
}

describe('ChangePoint offsets', () => {
  it('reads each day type from its own slot', () => {
    const p = [40.44, -79.99, 1, 40, 20, 1, 99, 30, 15, 5, 50, 20, 0, 0, 25];
    expect(p[PUBLISHED]).toBe(1);
    expect([CUR(0), PROP(0), BUCKET(0), RIDERS(0)].map((i) => p[i]))
      .toEqual([40, 20, 1, 99]);
    expect([CUR(1), PROP(1), BUCKET(1), RIDERS(1)].map((i) => p[i]))
      .toEqual([30, 15, 5, 50]);
    expect([CUR(2), PROP(2), BUCKET(2), RIDERS(2)].map((i) => p[i]))
      .toEqual([20, 0, 0, 25]);
  });
});

describe('countInBounds', () => {
  const pts = [
    row(40.44, -79.99, 0),   // gone,    inside
    row(40.45, -79.98, 0),   // gone,    inside
    row(40.44, -79.99, 5),   // doubled, inside
    row(41.90, -79.99, 0),   // gone,    north of the box
    row(40.44, -75.00, 0),   // gone,    east of the box
  ];
  const BOX = { w: -80.1, s: 40.3, e: -79.9, n: 40.5 };

  it('counts only what is inside the viewport', () => {
    const c = countInBounds(pts, 0, KEYS, BOX.w, BOX.s, BOX.e, BOX.n);
    expect(c.gone).toBe(2);
    expect(c.doubled).toBe(1);
    expect(c.halved).toBe(0);
  });

  it('counts the day type it is asked for, not the weekday one', () => {
    // Every row above is bucket 1 (halved) on Saturday and Sunday.
    const sat = countInBounds(pts, 1, KEYS, BOX.w, BOX.s, BOX.e, BOX.n);
    expect(sat.halved).toBe(3);
    expect(sat.gone).toBe(0);
  });

  it('returns a zero for every bucket, so the legend never omits a row', () => {
    const c = countInBounds([], 0, KEYS, BOX.w, BOX.s, BOX.e, BOX.n);
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


describe('sumRidersInBounds', () => {
  const pts = [
    row(40.44, -79.99, 0, 100),    // gone,    inside, 100 boardings
    row(40.45, -79.98, 0, 25),     // gone,    inside,  25 boardings
    row(40.44, -79.97, 5, 400),    // doubled, inside
    row(40.44, -79.96, 6, null),   // new,     inside, no record at all
    row(41.90, -79.99, 0, 900),    // gone,    north of the box
  ];
  const BOX = { w: -80.1, s: 40.3, e: -79.9, n: 40.5 };

  it('sums the boardings of what is in view, by bucket', () => {
    const t = sumRidersInBounds(pts, 0, KEYS, BOX.w, BOX.s, BOX.e, BOX.n);
    expect(t.riders.gone).toBe(125);
    expect(t.riders.doubled).toBe(400);
    expect(t.riders.halved).toBe(0);
  });

  it('keeps a location with no ridership record out of every total', () => {
    // The plan adds a bus here. Counting it as 0 riders would say nobody will
    // use it, which is a claim no observed number can make.
    const t = sumRidersInBounds(pts, 0, KEYS, BOX.w, BOX.s, BOX.e, BOX.n);
    expect(t.riders.new).toBe(0);
    expect(t.measured.new).toBe(0);
    expect(t.unmeasured).toBe(1);
  });

  it('counts the measured locations behind each total', () => {
    const t = sumRidersInBounds(pts, 0, KEYS, BOX.w, BOX.s, BOX.e, BOX.n);
    expect(t.measured.gone).toBe(2);
    expect(t.measured.doubled).toBe(1);
  });

  it('reads the day type it is asked for', () => {
    // Every row is bucket 1 (halved) on a Saturday.
    const sat = sumRidersInBounds(pts, 1, KEYS, BOX.w, BOX.s, BOX.e, BOX.n);
    expect(sat.riders.halved).toBe(525);
    expect(sat.riders.gone).toBe(0);
  });
});
