import { describe, it, expect } from 'vitest';
import {
  countIn, countNewPlacesIn, countRemovedIn, sumRidersIn, STYLE, viewportScope,
  selectionScope, withinBrush, removedLine, dotLabel, toGeoJSON,
} from './change';
import {
  BUCKET, ID, NAME, PUBLISHED, REMOVED, RIDERS, STOP_CUR, STOP_PROP,
  ChangePoint, ChangeLayer,
} from './types';

// The wire format is positional, so an off-by-one in the offsets recolours the
// whole map and miscounts the legend without changing a single number on the
// server. These pin the offsets against a hand-built row.
//
//   [lat, lon, published, id, removed, name, wStopCur, wStopProp, wBucket,
//    wRiders, ...] -- the two trip counts are the pole's own, not the walk's
const KEYS = ['gone', 'halved', 'less', 'same', 'more', 'doubled', 'new', 'none'];

let nextId = 0;

function row(lat: number, lon: number, weekdayBucket: number,
             riders: number | null = 10, id = `c:${++nextId}`,
             removed = 0, name = 'Forbes Ave at Craig St'): ChangePoint {
  return [lat, lon, 1, id, removed, name,
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
  return [lat, lon, 0, id, 0, 'Penn Ave at Butler St',
          0, 20, weekdayBucket, null, 0, 15, 1, null, 0, 10, 1, null];
}

const BOX_SCOPE = (b: { w: number; s: number; e: number; n: number }) =>
  viewportScope(b.w, b.s, b.e, b.n);

describe('ChangePoint offsets', () => {
  it('reads each day type from its own slot', () => {
    const p = [40.44, -79.99, 1, 'c:1', 1, 'Fifth Ave at Bellefield',
               40, 20, 1, 99, 30, 15, 5, 50, 20, 0, 0, 25];
    expect(p[PUBLISHED]).toBe(1);
    expect(p[ID]).toBe('c:1');
    expect(p[REMOVED]).toBe(1);
    expect(p[NAME]).toBe('Fifth Ave at Bellefield');
    expect([STOP_CUR(0), STOP_PROP(0), BUCKET(0), RIDERS(0)].map((i) => p[i]))
      .toEqual([40, 20, 1, 99]);
    expect([STOP_CUR(1), STOP_PROP(1), BUCKET(1), RIDERS(1)].map((i) => p[i]))
      .toEqual([30, 15, 5, 50]);
    expect([STOP_CUR(2), STOP_PROP(2), BUCKET(2), RIDERS(2)].map((i) => p[i]))
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

  it('leaves out the stops the plan removes', () => {
    // Max, 2026-09-09: a dot is a cross OR a colour, never both. A removed
    // stop is drawn as a cross and counted on the cross's row, so counting it
    // in a bucket as well would put the same dot in the key twice -- and on a
    // weekday at 400 m every one of the 633 "loses all service" locations is
    // a removed stop, so the double-count is not a rounding matter.
    const kept = row(40.44, -79.99, 0, 10, 'c:keeps', 0);
    const gone = row(40.45, -79.98, 0, 10, 'c:goes', 1);
    const c = countIn([kept, gone], 0, KEYS, BOX_SCOPE(BOX));
    expect(c.gone).toBe(1);
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

  // The dots leave the buckets when they leave the colour, but the boardings
  // at them are the most at-risk riders on the map. Dropped from the key
  // entirely, the Riders head line would silently shed them.
  it('carries the boardings at removed stops on their own, not in a bucket', () => {
    const pts = [
      row(40.44, -79.99, 0, 100, 'c:keeps', 0),
      row(40.45, -79.98, 0, 60, 'c:goes', 1),
      row(40.45, -79.97, 5, null, 'c:goes-unmeasured', 1),
    ];
    const t = sumRidersIn(pts, 0, KEYS, BOX_SCOPE(BOX));
    expect(t.riders.gone).toBe(100);
    expect(t.removedRiders).toBe(60);
    expect(t.removedMeasured).toBe(1);
  });

  it('keeps a removed stop with no record out of the removed total too', () => {
    const pts = [row(40.45, -79.97, 0, null, 'c:goes', 1)];
    const t = sumRidersIn(pts, 0, KEYS, BOX_SCOPE(BOX));
    expect(t.removedRiders).toBe(0);
    expect(t.removedMeasured).toBe(0);
    expect(t.unmeasured).toBe(1);
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

/**
 * The mark, which is a different question from the colour.
 *
 * These pin the split the whole Stop-by-stop view rests on: a stop the plan
 * removes can sit in any service bucket, including one that gains, so the
 * count of crosses must never be derived from the count of "loses all
 * service" dots and vice versa.
 */
describe('countRemovedIn', () => {
  const BOX = { w: -80.1, s: 40.3, e: -79.9, n: 40.5 };
  const pts = [
    row(40.44, -79.99, 0, 10, 'c:a', 1),   // removed, and loses all service
    row(40.45, -79.98, 5, 10, 'c:b', 1),   // removed, and the buses doubled
    row(40.44, -79.97, 0, 10, 'c:c', 0),   // loses all service, stop stays
    row(41.90, -79.99, 0, 10, 'c:d', 1),   // removed, north of the box
  ];

  it('counts the crosses in view, whatever colour they wear', () => {
    expect(countRemovedIn(pts, BOX_SCOPE(BOX))).toBe(2);
  });

  it('counts what the reader painted rather than what is on screen', () => {
    expect(countRemovedIn(pts, selectionScope(new Set(['c:a', 'c:d'])))).toBe(2);
  });
});

describe('dotLabel at a removed stop', () => {
  const BUCKETS = KEYS.map((k) => ({ key: k, label: k }));

  it('leads with the removal and never names a service bucket', () => {
    // The colour rows describe the stops that stay. A removed dot is not
    // drawn in one, so the tooltip cannot report one either -- that was the
    // last place the two channels contradicted each other.
    const p = { published: 1, removed: 1, replacement: 378, nearestStraight: 340,
                b0: 'doubled', sc0: 40, sp0: 0 };
    const html = dotLabel(p, 'weekday', BUCKETS);
    expect(html).toContain('Stop removed');
    expect(html).not.toContain('doubled');
  });

  it('still counts the buses at the pole, which the cross does not say', () => {
    // As today's count, not as "40 -> 0": the removal sentence above already
    // says the plan runs nothing here, and a zero on the right restated it as
    // a change in service at a stop that will not exist.
    const p = { published: 1, removed: 1, replacement: 378, nearestStraight: 340,
                b0: 'doubled', sc0: 40, sp0: 0 };
    const html = dotLabel(p, 'weekday', BUCKETS);
    expect(html).toContain('Currently 40 buses per weekday at this stop');
    expect(html).not.toContain('→ 0');
  });

  it('names the bucket at a stop that stays', () => {
    const p = { published: 1, removed: 0, b0: 'doubled', sc0: 40, sp0: 80 };
    expect(dotLabel(p, 'weekday', BUCKETS)).toContain('doubled');
  });
});

describe('a dot answers for the pole with no pin down', () => {
  const BUCKETS = KEYS.map((k) => ({ key: k, label: k }));
  const pole = { published: 1, removed: 0, b0: 'doubled', sc0: 40, sp0: 80,
                 id: 'c:1043', name: 'Forbes Ave at Craig St', moved: null };

  it('names the pole and its stop id above the service reading', () => {
    // A dot IS a pole -- one point per stop id -- and until now only a pin
    // could say which one. The same pixel therefore said different things
    // depending on whether the reader had clicked, which is the complaint
    // this closes.
    const html = dotLabel(pole, 'weekday', BUCKETS);
    expect(html).toContain('Forbes Ave at Craig St');
    expect(html).toContain('stop 1043');
    expect(html.indexOf('Forbes')).toBeLessThan(html.indexOf('doubled'));
  });

  it('says when the plan stands the pole somewhere else', () => {
    const html = dotLabel({ ...pole, moved: 84 }, 'weekday', BUCKETS);
    expect(html).toContain('84 m');
  });

  it('says nothing about a move at the 6,540 poles the plan leaves alone', () => {
    expect(dotLabel(pole, 'weekday', BUCKETS)).not.toContain(' m');
  });

  it('drops the pole line when a mark above it has already said all that', () => {
    // The pin's marks print the pole themselves and then this beneath a
    // divider; printing it in both halves would name the stop twice in one
    // tooltip.
    const html = dotLabel(pole, 'weekday', BUCKETS, { pole: false });
    expect(html).not.toContain('Forbes Ave at Craig St');
    expect(html).toContain('doubled');
  });
});

describe('the drawn dot carries what the tooltip needs', () => {
  const layer = (points: ChangePoint[], moved = {}): ChangeLayer => ({
    radius: 400, days: ['weekday', 'saturday', 'sunday'],
    buckets: KEYS.map((k) => ({ key: k, label: k })),
    fields: [], replacement: {}, moved, points,
  } as any);

  it('puts the name off the packed row onto the feature', () => {
    const f = toGeoJSON(layer([row(0, 0, 5, 10, 'c:1043')])).features[0];
    expect(f.properties.name).toBe('Forbes Ave at Craig St');
  });

  it('puts the metres the plan moves the pole onto the feature, or null', () => {
    const pts = [row(0, 0, 5, 10, 'c:1043'), row(1, 1, 5, 10, 'c:99')];
    const feats = toGeoJSON(layer(pts, { 'c:1043': 84 })).features;
    expect(feats[0].properties.moved).toBe(84);
    expect(feats[1].properties.moved).toBeNull();
  });
});

describe('a dot in Stop-by-stop answers for its own pole', () => {
  const BUCKETS = KEYS.map((k) => ({ key: k, label: k === 'more' ? 'more service' : k }));
  const pole = { published: 1, removed: 0, b0: 'more', sc0: 3, sp0: 17,
                 id: 'c:1043', name: 'Babcock Blvd at Thompson', moved: null };

  it('counts the buses at this stop, not the ones within a walk', () => {
    // The hover used to print the 400 m reading, which downtown was 1,591
    // buses a weekday -- a district, not a stop. Max: "when someone hovers
    // over a stop, they expect to get information about that stop only".
    const html = dotLabel(pole, 'weekday', BUCKETS);
    expect(html).toContain('3 → 17 buses per weekday at this stop');
    expect(html).not.toContain('within a walk');
  });

  it('names the bucket without scoping it to anything but this stop', () => {
    // The label and the colour are now one measurement: `query.bucket()` on
    // the two numbers the line above prints. The word "nearby" shipped for
    // half a day while the colour was still the walk radius's answer, and it
    // is the thing Max asked to remove -- "if hover already shows that change
    // in service at the stop level only, why have coloration communicate
    // something potentially different?"
    const html = dotLabel(pole, 'weekday', BUCKETS);
    expect(html).toContain('more service');
    expect(html).not.toContain('nearby');
  });

  it('does not dress a pole the plan adds as a bucket', () => {
    // Its label is a sentence about the pole itself, so the scope word would
    // attach to the wrong noun.
    const added = { ...pole, published: 0, sc0: 0, sp0: 30 };
    const html = dotLabel(added, 'weekday', BUCKETS);
    expect(html).toContain('the plan adds a stop here');
    expect(html).not.toContain('nearby');
    expect(html).toContain('0 → 30 buses per weekday at this stop');
  });
});

describe('removedLine', () => {
  it('says nothing at a stop the plan keeps', () => {
    expect(removedLine({ removed: 0, replacement: null })).toBe('');
  });

  it('names the walk to the nearest surviving stop', () => {
    expect(removedLine({ removed: 1, replacement: 378, nearestStraight: 340 }))
      .toContain('nearest stop is a 378 m walk');
  });

  it('says so plainly when nothing survives within the search', () => {
    expect(removedLine({ removed: 1, replacement: null }))
      .toContain('no other stop within a 800 m walk');
  });

  // Mt Troy Rd + Beckert is the case that asked for this: the walk to any
  // surviving stop is 651 m, while the map shows Lowrie St stops 301 m away
  // that are 863 m on foot, because Mt Troy Road switchbacks around the head
  // of a ravine. Without the second number the walk reads as an error to
  // anyone looking at the map.
  //
  // The comparison is against the nearest stop AS THE CROW FLIES. Measured
  // instead against the straight line to the stop the walk found (501 m) the
  // ratio is 1.30 and this hover -- the one that prompted the whole change --
  // would print nothing.
  it('adds the straight line where the ground puts the walk far past it', () => {
    const html = removedLine(
      { removed: 1, replacement: 651, nearestStraight: 301 });
    expect(html).toContain('651 m walk');
    expect(html).toContain('the nearest in a straight line is 301 m');
  });

  it('leaves the straight line off where the two nearly agree', () => {
    // The countywide median walk is 1.22x its own straight line, so printing
    // both everywhere would put a second number on most of the 1,308 removals to
    // say nothing a reader needs.
    expect(removedLine({ removed: 1, replacement: 220, nearestStraight: 180 }))
      .not.toContain('straight line');
  });

  it('leaves it off when there is no straight line to compare', () => {
    expect(removedLine({ removed: 1, replacement: 400, nearestStraight: null }))
      .not.toContain('straight line');
  });

  // Mt Troy Rd + Homestead is worse than Beckert, not better: nothing at all
  // is reachable inside the 800 m search, while a stop stands 513 m off on the
  // map. Saying only "no other stop within a 800 m walk" there reads as flatly
  // false to whoever is looking at it.
  it('adds the straight line when nothing is reachable on foot at all', () => {
    const html = removedLine(
      { removed: 1, replacement: null, nearestStraight: 513 });
    expect(html).toContain('no other stop within a 800 m walk');
    expect(html).toContain('the nearest in a straight line is 513 m');
  });

  it('leaves it off when even the straight line is most of the search', () => {
    // 700 m away straight is not a number that explains an unreachable walk;
    // it says the same thing the sentence already said.
    expect(removedLine({ removed: 1, replacement: null, nearestStraight: 700 }))
      .not.toContain('straight line');
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
