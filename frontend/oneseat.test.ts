import { describe, it, expect } from 'vitest';
import {
  STATUS_STYLE, STATUS_ORDER, LEGEND_ROWS, LOSES_RETIRED, rowLabel, rowCounts,
  countInBounds, toGeoJSON, dotLabel, ONESEAT_HIT_LAYERS,
  destinationQuery, destinationLabel, activeDestButton, NO_RIDE_COLOR,
  oneSeatQuery, oneSeatDayFor, ANY_DAY, dayControlsShown,
} from './oneseat';
import { GONE_COLOR, NEW_COLOR } from './surface';
import { KEPT_COLOR } from './corridor';
import { OneSeatLayer } from './types';

const STATUSES: OneSeatLayer['statuses'] = [
  { key: 'here', label: 'at the destination' },
  { key: 'keeps', label: 'keeps a one-seat ride' },
  { key: 'gains', label: 'gains a one-seat ride' },
  { key: 'loses', label: 'loses its one-seat ride' },
  { key: 'none', label: 'no one-seat ride either way' },
];

function layer(points: OneSeatLayer['points'],
               destination?: Partial<OneSeatLayer['destination']>): OneSeatLayer {
  return {
    radius: 400,
    day: 'any',
    destination: {
      key: 'downtown', name: 'Downtown', seeds: 44, lat: null, lon: null,
      ...destination,
    },
    statuses: STATUSES,
    counts: { here: 0, keeps: 0, gains: 0, loses: 0, none: 0 },
    retired: { here: 0, keeps: 0, gains: 0, loses: 0, none: 0 },
    fields: ['lat', 'lon', 'published', 'status', 'current', 'proposed', 'removed'],
    points,
  };
}

describe('the palette', () => {
  it('reuses the colours the other layers already taught the reader', () => {
    // Not a style preference: a reader who has learned red-means-gone on the
    // surface and the street view must not have to relearn it here.
    expect(STATUS_STYLE.loses.color).toBe(GONE_COLOR);
    expect(STATUS_STYLE.gains.color).toBe(NEW_COLOR);
    expect(STATUS_STYLE.keeps.color).toBe(KEPT_COLOR);
  });

  it('draws the two findings larger than the two non-findings', () => {
    expect(STATUS_STYLE.loses.size).toBeGreaterThan(STATUS_STYLE.keeps.size);
    expect(STATUS_STYLE.gains.size).toBeGreaterThan(STATUS_STYLE.none.size);
  });

  it('gives losses and gains identical weight', () => {
    // The repo's standing instruction: overstating losses discredits the real
    // ones, and at a glance size is what a reader reads.
    expect(STATUS_STYLE.loses.size).toBe(STATUS_STYLE.gains.size);
  });

  it('has a style and a legend row for every status', () => {
    expect(new Set(STATUS_ORDER)).toEqual(new Set(Object.keys(STATUS_STYLE)));
    expect(STATUS_ORDER.length).toBe(STATUSES.length);
  });

  it('leads the legend with the two findings', () => {
    expect(STATUS_ORDER.slice(0, 2)).toEqual(['loses', 'gains']);
  });
});

describe('the legend rows', () => {
  // A "loses" dot is two sentences -- the stop stays and the ride now needs
  // a transfer, or PRT retires the stop itself -- and one red row told them
  // as one. Downtown's 955 losses are mostly retired stops; Oakland's 354 are
  // mostly stops that stay. The split is the Stop-by-stop precedent: decided
  // at the kerb, never at the walk radius, and drawn with that view's cross.
  it('splits a lost ride by whether the stop is kept or retired, and leads with both', () => {
    expect(LEGEND_ROWS.slice(0, 3)).toEqual(['loses', LOSES_RETIRED, 'gains']);
    expect(LEGEND_ROWS).toHaveLength(STATUS_ORDER.length + 1);
  });

  it('labels both halves so neither can be read as the whole', () => {
    // Max: the labels of both must distinguish a loss where the kerb is
    // kept from one where it is retired.
    const kept = rowLabel('loses', STATUSES);
    const retired = rowLabel(LOSES_RETIRED, STATUSES);
    expect(kept).toContain('loses its one-seat ride');
    expect(retired).toContain('loses its one-seat ride');
    expect(kept).toMatch(/stop kept/i);
    expect(retired).toMatch(/stop retired/i);
    expect(rowLabel('gains', STATUSES)).toBe('gains a one-seat ride');
  });

  it('splits the citywide counts the same way, so the column still adds up', () => {
    const l = layer([]);
    l.counts = { here: 79, keeps: 5230, gains: 160, loses: 955, none: 341 };
    l.retired = { here: 11, keeps: 593, gains: 4, loses: 679, none: 21 };
    const rows = rowCounts(l);
    expect(rows.loses).toBe(276);
    expect(rows[LOSES_RETIRED]).toBe(679);
    // A retired stop that keeps its ride stays a keeps dot: the ride is
    // there, at a stop the reader can see.
    expect(rows.keeps).toBe(5230);
    expect(Object.values(rows).reduce((a, b) => a + b, 0))
      .toBe(Object.values(l.counts).reduce((a, b) => a + b, 0));
  });

  it('draws the retired half in its own layer, so a click or hover can find it', () => {
    expect(ONESEAT_HIT_LAYERS).toHaveLength(2);
  });
});

describe('countInBounds', () => {
  const keys = STATUSES.map((s) => s.key);
  const points = [
    [40.44, -79.99, 1, 3, '61A', '', 0],       // loses, stop kept, in view
    [40.45, -79.98, 1, 2, '', 'P3', 0],        // gains, in view
    [40.90, -79.99, 1, 3, '61A', '', 0],       // loses, north of view
    [40.46, -79.97, 1, 3, '54', '', 1],        // loses, stop retired, in view
    [40.47, -79.96, 1, 1, '61A', '61A', 1],    // keeps, at a retired stop
  ];

  it('counts only what is on screen', () => {
    const got = countInBounds(points, keys, -80.1, 40.4, -79.9, 40.5);
    expect(got.loses).toBe(1);
    expect(got.gains).toBe(1);
  });

  it('counts a lost ride at a retired stop on its own row, and nowhere else', () => {
    const got = countInBounds(points, keys, -80.1, 40.4, -79.9, 40.5);
    expect(got[LOSES_RETIRED]).toBe(1);
    expect(got.loses).toBe(1);
    // The mark only splits a LOSS. A kept ride at a retired stop is a kept
    // ride; the stop that provides it is on the map.
    expect(got.keeps).toBe(1);
  });

  it('reports a zero for every row, not a missing key', () => {
    const got = countInBounds([], keys, -80.1, 40.4, -79.9, 40.5);
    expect(Object.keys(got).sort()).toEqual([...keys, LOSES_RETIRED].sort());
    expect(Object.values(got).every((v) => v === 0)).toBe(true);
  });
});

describe('toGeoJSON', () => {
  it('draws "no ride either way" rather than dropping it', () => {
    // For Oakland this is more than half the county. Left off the map, the
    // empty half reads as missing data instead of as the finding: most of
    // Allegheny cannot reach Oakland without transferring, before or after.
    const gj = toGeoJSON(layer([[40.44, -79.99, 1, 4, '', '']]));
    expect(gj.features).toHaveLength(1);
    expect(gj.features[0].properties.status).toBe('none');
  });

  it('puts coordinates in lon/lat order and carries both route lists', () => {
    const gj = toGeoJSON(layer([[40.44, -79.99, 1, 3, '61A;61B', '', 0]]));
    expect(gj.features[0].geometry.coordinates).toEqual([-79.99, 40.44]);
    expect(gj.features[0].properties.current).toBe('61A;61B');
    expect(gj.features[0].properties.proposed).toBe('');
  });

  it('carries the retired-stop flag, which is what the cross layer filters on', () => {
    const gj = toGeoJSON(layer([[40.44, -79.99, 1, 3, '54', '', 1]]));
    expect(gj.features[0].properties.removed).toBe(1);
  });
});

describe('destinationQuery', () => {
  it('sends a named destination by key', () => {
    expect(destinationQuery({ key: 'oakland' })).toBe('dest=oakland');
  });

  it('sends a dropped pin as a point', () => {
    expect(destinationQuery({ lat: 40.4406, lon: -79.9959 }))
      .toBe('dest_lat=40.440600&dest_lon=-79.995900');
  });
});

describe('destinationLabel', () => {
  it('prefers the district name', () => {
    expect(destinationLabel(layer([]))).toBe('Downtown');
  });

  it('falls back to the pin coordinates', () => {
    const l = layer([], { key: null, name: null, seeds: 1, lat: 40.44, lon: -79.99 });
    expect(destinationLabel(l)).toBe('40.4400, -79.9900');
  });
});

describe('dotLabel', () => {
  it('names the routes behind the verdict on both sides', () => {
    // A bare verdict invites the map to be quoted without the route numbers
    // that make it checkable.
    const html = dotLabel(
      { status: 'loses', current: '61A;61B', proposed: '', removed: 0 }, layer([]));
    expect(html).toContain('loses its one-seat ride');
    expect(html).toContain('Downtown');
    expect(html).toContain('61A, 61B');
    expect(html).toContain('none');
  });

  it('says whether the stop under a lost ride is kept or retired', () => {
    const kept = dotLabel(
      { status: 'loses', current: '28X', proposed: '', removed: 0 }, layer([]));
    const gone = dotLabel(
      { status: 'loses', current: '28X', proposed: '', removed: 1 }, layer([]));
    expect(kept).toMatch(/stop kept/i);
    expect(gone).toMatch(/stop retired/i);
    // Only a loss is split. A kept ride at a retired stop is labelled as the
    // kept ride it is.
    const keeps = dotLabel(
      { status: 'keeps', current: '61A', proposed: '61A', removed: 1 }, layer([]));
    expect(keeps).not.toMatch(/retired/i);
  });

  it('says a place at the destination needs no ride to it', () => {
    const html = dotLabel({ status: 'here', current: '', proposed: '' }, layer([]));
    expect(html).toContain('no one-seat ride needed');
  });
});

describe('NO_RIDE_COLOR', () => {
  it('is lighter than every status that carries a finding', () => {
    // Deliberately recessive, and exempted from the contrast floor in
    // contrast.test.ts for the same reason change.ts's `none` is.
    expect(NO_RIDE_COLOR).not.toBe(STATUS_STYLE.keeps.color);
  });
});

describe('which destination button is lit', () => {
  it('lights the named district in force', () => {
    expect(activeDestButton({ key: 'oakland' })).toBe('oakland');
  });

  it('lights "pick a point" for any dropped or dragged point', () => {
    // Dragging the destination marker turns a named district into a point of
    // the reader's own, and the toolbar has to stop claiming Downtown.
    expect(activeDestButton({ lat: 40.44, lon: -79.99 })).toBe('pin');
  });
});

describe('the day-restricted variant', () => {
  it('asks for the published day-free answer by default', () => {
    // ANY_DAY is what data/oneseat_change.csv means by a one-seat ride, and
    // it must stay what the map shows unless the reader asks otherwise.
    expect(oneSeatQuery(400, { key: 'downtown' }, ANY_DAY))
      .toBe('radius=400&dest=downtown&day=any');
  });

  it('carries a day type when the reader restricts to one', () => {
    expect(oneSeatQuery(400, { key: 'downtown' }, 'sunday'))
      .toBe('radius=400&dest=downtown&day=sunday');
  });

  it('reads the toolbar day only while the reader has opted into it', () => {
    // The toggle is the opt-in, not the day buttons: switching Weekday to
    // Saturday must not silently move this view off the published answer.
    expect(oneSeatDayFor(false, 'sunday')).toBe(ANY_DAY);
    expect(oneSeatDayFor(true, 'sunday')).toBe('sunday');
  });
});

describe('whether the day buttons are shown at all', () => {
  it('hides them while the one-seat map is on the published day-free answer', () => {
    // No day type enters that answer, so a day control there is a lever
    // attached to nothing on the map. The one-seat toggle sits directly above
    // it and is what brings it back.
    expect(dayControlsShown('oneseat', false)).toBe(false);
  });

  it('brings them back the moment the one-seat map follows a day', () => {
    expect(dayControlsShown('oneseat', true)).toBe(true);
  });

  it('always shows them in the views the day type governs', () => {
    for (const view of ['dots', 'surface', 'both', 'corridors', 'journey']) {
      expect(dayControlsShown(view, false)).toBe(true);
    }
  });

  it('hides them on Places while mapping the day-free residents readings', () => {
    // The published place figures are day-free, and unlike one-seat there is
    // no restriction toggle here that could ever make the day matter -- for
    // these two readings.
    expect(dayControlsShown('places', false)).toBe(false);
    expect(dayControlsShown('places', true)).toBe(false);
    expect(dayControlsShown('places', false, 'lost')).toBe(false);
    expect(dayControlsShown('places', false, 'gained')).toBe(false);
  });

  it('brings them back on Places in service mode, the one reading with a day of its own', () => {
    expect(dayControlsShown('places', false, 'service')).toBe(true);
  });
});
