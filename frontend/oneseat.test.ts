import { describe, it, expect } from 'vitest';
import {
  STATUS_STYLE, STATUS_ORDER, countInBounds, toGeoJSON, dotLabel,
  destinationQuery, destinationLabel, NO_RIDE_COLOR,
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
    destination: {
      key: 'downtown', name: 'Downtown', seeds: 44, lat: null, lon: null,
      ...destination,
    },
    statuses: STATUSES,
    counts: { here: 0, keeps: 0, gains: 0, loses: 0, none: 0 },
    fields: ['lat', 'lon', 'published', 'status', 'current', 'proposed'],
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

describe('countInBounds', () => {
  const keys = STATUSES.map((s) => s.key);
  const points = [
    [40.44, -79.99, 1, 3, '61A', ''],          // loses, in view
    [40.45, -79.98, 1, 2, '', 'P3'],           // gains, in view
    [40.90, -79.99, 1, 3, '61A', ''],          // loses, north of view
  ];

  it('counts only what is on screen', () => {
    const got = countInBounds(points, keys, -80.1, 40.4, -79.9, 40.5);
    expect(got.loses).toBe(1);
    expect(got.gains).toBe(1);
  });

  it('reports a zero for every status, not a missing key', () => {
    const got = countInBounds([], keys, -80.1, 40.4, -79.9, 40.5);
    expect(Object.keys(got).sort()).toEqual(keys.slice().sort());
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
    const gj = toGeoJSON(layer([[40.44, -79.99, 1, 3, '61A;61B', '']]));
    expect(gj.features[0].geometry.coordinates).toEqual([-79.99, 40.44]);
    expect(gj.features[0].properties.current).toBe('61A;61B');
    expect(gj.features[0].properties.proposed).toBe('');
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
      { status: 'loses', current: '61A;61B', proposed: '' }, layer([]));
    expect(html).toContain('loses its one-seat ride');
    expect(html).toContain('Downtown');
    expect(html).toContain('61A, 61B');
    expect(html).toContain('none');
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
