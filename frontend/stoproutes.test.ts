import { describe, it, expect } from 'vitest';
import {
  toGeoJSON, stopRoutesUrl, routeLineLabel, dashSequence, routeColors,
  sideHasRoutes,
} from './stoproutes';
import { KerbRoutesResult, KerbRouteFeature } from './types';

function feature(overrides: Partial<KerbRouteFeature> = {}): KerbRouteFeature {
  return {
    route: '61B',
    name: 'Braddock — Downtown',
    pattern_id: 1,
    points: [[-79.99, 40.44], [-79.98, 40.44], [-79.98, 40.45]],
    stop_index: 1,
    ...overrides,
  };
}

function result(overrides: Partial<KerbRoutesResult> = {}): KerbRoutesResult {
  return {
    lat: 40.44,
    lon: -79.985,
    day: 'weekday',
    dedup_m: 25,
    stop_id: '8156',
    names: ['FORBES AVE AT CRAIG ST'],
    current: [feature()],
    proposed: [feature({ route: '61X', pattern_id: 2, name: null })],
    ...overrides,
  };
}

// --------------------------------------------------------------------------
// what the map draws
// --------------------------------------------------------------------------

describe('toGeoJSON', () => {
  it('draws one network at a time, and only the one asked for', () => {
    // Both at once was two channels on one line: a reader had to hold
    // "orange means the plan" and "which orange is the 61B" at the same
    // time, and past five or six routes the second one cannot be held at
    // all. The response carries both sides, so the switch costs no fetch.
    const gj = toGeoJSON(result(), 'current');
    expect(gj.features).toHaveLength(1);
    expect(gj.features[0].properties.side).toBe('current');
    expect(toGeoJSON(result(), 'proposed').features[0].properties.side)
      .toBe('proposed');
  });

  it('carries the route, the name and the pattern id as properties', () => {
    const gj = toGeoJSON(result(), 'current');
    expect(gj.features[0].properties).toMatchObject({
      side: 'current', route: '61B', name: 'Braddock — Downtown', pattern_id: 1,
    });
  });

  it('gives each feature its route\'s own colour, for the line to be painted by', () => {
    const r = result({
      current: [feature({ route: '61B' }), feature({ route: '71A', pattern_id: 3 })],
    });
    const gj = toGeoJSON(r, 'current');
    const want = routeColors(['61B', '71A']);
    expect(gj.features[0].properties.color).toBe(want.get('61B'));
    expect(gj.features[1].properties.color).toBe(want.get('71A'));
    expect(gj.features[0].properties.color).not.toBe(gj.features[1].properties.color);
  });

  it('colours over the drawn side\'s routes alone, so the other side cannot shift a hue', () => {
    // The two sides are coloured independently: a route the plan drops is
    // not a gap in today's palette, and a route it adds does not renumber
    // today's colours behind the reader's back.
    const r = result({
      current: [feature({ route: '61B' })],
      proposed: [feature({ route: '61B', pattern_id: 9 }), feature({ route: '61X', pattern_id: 10 })],
    });
    expect(toGeoJSON(r, 'current').features[0].properties.color)
      .toBe(routeColors(['61B']).get('61B'));
    expect(toGeoJSON(r, 'proposed').features[0].properties.color)
      .toBe(routeColors(['61B', '61X']).get('61B'));
  });

  it('takes the coordinates as sent, already [lon, lat]', () => {
    const gj = toGeoJSON(result(), 'current');
    expect(gj.features[0].geometry.coordinates)
      .toEqual([[-79.99, 40.44], [-79.98, 40.44], [-79.98, 40.45]]);
  });

  it('draws every pattern of a route with a short-turn or a branch, not one line per route', () => {
    const r = result({
      current: [feature({ pattern_id: 1 }), feature({ pattern_id: 2, route: '61B' })],
    });
    const gj = toGeoJSON(r, 'current');
    expect(gj.features).toHaveLength(2);
    // One route, so one colour: a branch is the same bus, and two hues for
    // it would read as two routes.
    expect(gj.features[0].properties.color).toBe(gj.features[1].properties.color);
  });

  it('draws nothing on a side with no routes at this kerb', () => {
    expect(toGeoJSON(result({ proposed: [] }), 'proposed').features).toHaveLength(0);
  });
});

// --------------------------------------------------------------------------
// the request
// --------------------------------------------------------------------------

describe('stopRoutesUrl', () => {
  it('carries the point at six decimal places and the day type', () => {
    const url = stopRoutesUrl({ lat: 40.4406, lon: -79.9959 }, 'saturday');
    expect(url).toBe('/api/kerb_routes?lat=40.440600&lon=-79.995900&day=saturday');
  });
});

// --------------------------------------------------------------------------
// the words
// --------------------------------------------------------------------------

describe('routeLineLabel', () => {
  const props = (over: Partial<Parameters<typeof routeLineLabel>[0]> = {}) => ({
    side: 'current' as const, route: '61B', name: 'Braddock — Downtown',
    pattern_id: 1, color: '#b73f6e', ...over,
  });

  it('names the route in bold and the long name where there is one', () => {
    const html = routeLineLabel(props());
    expect(html).toContain('61B');
    expect(html).toContain('Braddock — Downtown');
    expect(html).toContain('today');
  });

  it('leads with the line\'s own colour, so the hover keys the line under it', () => {
    // The palette is per kerb and unlabelled on the map itself; without the
    // swatch the reader has to match a hue by eye against the chips.
    const html = routeLineLabel(props({ color: '#0079b3' }));
    expect(html).toContain('#0079b3');
    expect(html.indexOf('#0079b3')).toBeLessThan(html.indexOf('61B'));
  });

  it('says nothing about a name the feed did not send', () => {
    const html = routeLineLabel(props({ side: 'proposed', route: '61X', name: null }));
    expect(html).toContain('61X');
    expect(html).toContain('proposed');
    expect(html).not.toContain('null');
  });

  it('says the arrows are the direction of travel', () => {
    const html = routeLineLabel(props({ name: null }));
    expect(html.toLowerCase()).toContain('direction of travel');
  });

  it('escapes a route name that came from PRT rather than from us', () => {
    const html = routeLineLabel(props({ name: 'A & B <i>x</i>' }));
    expect(html).toContain('&amp;');
    expect(html).toContain('&lt;i&gt;');
    expect(html).not.toContain('<i>');
  });
});

// --------------------------------------------------------------------------
// the flow animation
// --------------------------------------------------------------------------

describe('dashSequence', () => {
  it('returns one dasharray per requested step', () => {
    expect(dashSequence(4, 3, 12)).toHaveLength(12);
  });

  it('keeps every frame summing to the same period, so the pattern never jumps in length', () => {
    const seq = dashSequence(4, 3, 12);
    const period = 4 + 3;
    for (const frame of seq) {
      const sum = frame.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(period);
    }
  });

  it('starts the cycle at the plain dash/gap pattern', () => {
    const seq = dashSequence(4, 3, 12);
    expect(seq[0]).toEqual([0, 3, 4]);
  });

  it('advances the dash by one even step per frame, so the flow reads as motion', () => {
    // Each frame's leading gap is one step further along than the last, and
    // the step is the same size throughout -- a sequence that stalled or
    // jumped would read as a stutter rather than as a bus moving.
    const [dash, gap, steps] = [4, 3, 12];
    const seq = dashSequence(dash, gap, steps);
    // The dash's own remaining length is the phase: it runs down to nothing
    // over the first half and down again over the second, one cycle.
    const phase = seq.map((f) => f[f.length - 1]);
    const first = phase.slice(0, steps / 2);
    expect(first).toEqual(phase.slice(steps / 2));
    const deltas = first.slice(1).map((v, i) => first[i] - v);
    for (const d of deltas) expect(d).toBeCloseTo(dash / (steps / 2));
  });

  it('wraps without a jump: the last frame is one step short of the first', () => {
    // `startFlow` loops the array with a modulo, so the seam between the end
    // and the start has to be the same step as every other frame -- the last
    // frame's dash has one step left to run before it is whole again.
    const [dash, steps] = [4, 12];
    const step = dash / (steps / 2);
    const seq = dashSequence(dash, 3, steps);
    const phaseOf = (f: number[]) => f[f.length - 1];
    expect(phaseOf(seq[0])).toBeCloseTo(dash);
    expect(phaseOf(seq[seq.length - 1])).toBeCloseTo(step);
  });
});

// --------------------------------------------------------------------------
// whether the drawn side put anything on the map
// --------------------------------------------------------------------------

describe('sideHasRoutes', () => {
  it('is true for a side with a line to draw', () => {
    expect(sideHasRoutes(result(), 'current')).toBe(true);
    expect(sideHasRoutes(result(), 'proposed')).toBe(true);
  });

  it('is false on the empty side of a stop only one network serves', () => {
    // A stop the plan adds answers with today's list empty; the pin key
    // must not then describe lines that are not on the map.
    expect(sideHasRoutes(result({ current: [] }), 'current')).toBe(false);
    expect(sideHasRoutes(result({ current: [] }), 'proposed')).toBe(true);
  });

  it('is false before any answer has arrived', () => {
    expect(sideHasRoutes(null, 'current')).toBe(false);
  });
});
