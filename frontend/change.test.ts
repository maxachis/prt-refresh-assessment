import { describe, it, expect } from 'vitest';
import { countInBounds, STYLE } from './change';
import { BUCKET, CUR, PROP, PUBLISHED } from './types';

// The wire format is positional, so an off-by-one in the offsets recolours the
// whole map and miscounts the legend without changing a single number on the
// server. These pin the offsets against a hand-built row.
//
//   [lat, lon, published, wCur, wProp, wBucket, sCur, sProp, sBucket, ...]
const KEYS = ['gone', 'halved', 'less', 'same', 'more', 'doubled', 'new', 'none'];

function row(lat: number, lon: number, weekdayBucket: number): number[] {
  return [lat, lon, 1, 40, 20, weekdayBucket, 30, 15, 1, 20, 10, 1];
}

describe('ChangePoint offsets', () => {
  it('reads each day type from its own slot', () => {
    const p = [40.44, -79.99, 1, 40, 20, 1, 30, 15, 5, 20, 0, 0];
    expect(p[PUBLISHED]).toBe(1);
    expect([CUR(0), PROP(0), BUCKET(0)].map((i) => p[i])).toEqual([40, 20, 1]);
    expect([CUR(1), PROP(1), BUCKET(1)].map((i) => p[i])).toEqual([30, 15, 5]);
    expect([CUR(2), PROP(2), BUCKET(2)].map((i) => p[i])).toEqual([20, 0, 0]);
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
