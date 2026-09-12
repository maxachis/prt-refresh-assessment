import { describe, it, expect } from 'vitest';
import { parseUrlState, toSearch, isFramed, UrlState } from './urlstate';

const FULL: UrlState = {
  view: 'oneseat',
  day: 'saturday',
  radius: 150,
  oneSeatRestricted: true,
  weight: 'riders',
  surfaceUnit: 'people',
  dest: { key: 'oakland' },
  at: { lat: 40.4406, lon: -79.9959 },
  camera: { lat: 40.44, lon: -80.0, zoom: 13.5 },
  place: 'baldwin borough',
  placeFill: 'gained',
  selection: ['c:10005', 'p:2201'],
  stopRoutes: 'proposed',
  route: 'c:77-86',
  oneToOne: 'shown',
};

describe('toSearch', () => {
  it('writes every control, so an embed src shows all its knobs', () => {
    const p = new URLSearchParams(toSearch(FULL));
    expect(p.get('view')).toBe('oneseat');
    expect(p.get('day')).toBe('saturday');
    expect(p.get('radius')).toBe('150');
    expect(p.get('oneseatday')).toBe('selected');
    expect(p.get('dest')).toBe('oakland');
    expect(p.get('weight')).toBe('riders');
    expect(p.get('surfaceunit')).toBe('people');
    expect(p.get('placefill')).toBe('gained');
    expect(p.get('stoproutes')).toBe('proposed');
    expect(p.get('route')).toBe('c:77-86');
    expect(p.get('onetoone')).toBe('shown');
  });

  it('writes which network the drawn routes are, since only one is on the map', () => {
    // Off, today or the plan are three positions of one control, not a
    // toggle with a refinement hanging off it: the lines are one network at
    // a time, so which one is half of what is drawn.
    const p = new URLSearchParams(toSearch({ ...FULL, stopRoutes: 'current' }));
    expect(p.get('stoproutes')).toBe('current');
  });

  it('writes the routes control off, unlike the omitted-when-default controls', () => {
    // Unlike weight/surfaceUnit/placeFill, this control has no "nothing
    // chosen" state -- off is a position a reader can be in -- so it is
    // always in the URL, off included.
    const p = new URLSearchParams(toSearch({ ...FULL, stopRoutes: 'off' }));
    expect(p.get('stoproutes')).toBe('off');
  });

  it('leaves the place fill out of a link that is mapping the default, losses', () => {
    // Same reasoning as `weight`: losses is the default reading, so it stays implicit.
    const p = new URLSearchParams(toSearch({ ...FULL, placeFill: 'lost' }));
    expect(p.has('placefill')).toBe(false);
  });

  it('leaves the ridership weighting out of a link that is not using it', () => {
    // The default is locations; a `weight=locations` in every URL would make
    // the weighting look like a setting the reader had chosen.
    const p = new URLSearchParams(toSearch({ ...FULL, weight: 'locations' }));
    expect(p.has('weight')).toBe(false);
  });

  it('leaves the surface unit out of a link that is showing ground', () => {
    // Same reasoning as `weight`: `area` is the default, so it stays implicit.
    const p = new URLSearchParams(toSearch({ ...FULL, surfaceUnit: 'area' }));
    expect(p.has('surfaceunit')).toBe(false);
  });

  it('writes a dropped destination pin as coordinates', () => {
    const p = new URLSearchParams(toSearch({ ...FULL, dest: { lat: 40.5, lon: -79.9 } }));
    expect(p.get('dest')).toBe('40.50000,-79.90000');
  });

  it('leaves out the asked point when nothing has been asked', () => {
    const p = new URLSearchParams(toSearch({ ...FULL, at: null }));
    expect(p.has('at')).toBe(false);
  });

  it('leaves out the camera until the map has been moved', () => {
    const p = new URLSearchParams(toSearch({ ...FULL, camera: null }));
    expect(p.has('map')).toBe(false);
  });

  it('leaves out the selected place until one has been picked', () => {
    const p = new URLSearchParams(toSearch({ ...FULL, place: null }));
    expect(p.has('place')).toBe(false);
  });

  it('leaves out the selected route group until one has been picked', () => {
    // Absence, like `place` and `at`: nothing is selected until it is.
    const p = new URLSearchParams(toSearch({ ...FULL, route: null }));
    expect(p.has('route')).toBe(false);
  });

  it('writes the one-to-one control hidden as well as shown, like the routes control', () => {
    // Two positions a reader can be in, no "nothing chosen yet" -- so it is
    // always in the link, the way `stoproutes` is.
    const p = new URLSearchParams(toSearch({ ...FULL, oneToOne: 'hidden' }));
    expect(p.get('onetoone')).toBe('hidden');
  });

  it('round-trips through parse', () => {
    expect(parseUrlState(toSearch(FULL))).toEqual(FULL);
  });

  it('round-trips the service fill mode too, the third of the three values', () => {
    const withService = { ...FULL, placeFill: 'service' as const };
    expect(parseUrlState(toSearch(withService))).toEqual(withService);
  });
});

describe('parseUrlState', () => {
  it('returns nothing for an unadorned URL', () => {
    expect(parseUrlState('')).toEqual({});
    expect(parseUrlState('?')).toEqual({});
  });

  it('reads the added-stops switch, and ignores a value it has no button for', () => {
  });

  it('reads a point to ask at', () => {
    expect(parseUrlState('?at=40.4406,-79.9959').at)
      .toEqual({ lat: 40.4406, lon: -79.9959 });
  });

  it('reads a camera as centre plus zoom', () => {
    expect(parseUrlState('?map=40.44,-79.99,12.5').camera)
      .toEqual({ lat: 40.44, lon: -79.99, zoom: 12.5 });
  });

  // Every one of these would otherwise reach a control as a value it has no
  // button for, or the map as NaN. A hand-typed embed src is the expected way
  // this gets used, so a wrong parameter has to leave the default standing
  // rather than break the view.
  it.each([
    ['?view=nonsense', 'view'],
    ['?day=tuesday', 'day'],
    ['?radius=wide', 'radius'],
    ['?radius=-400', 'radius'],
    ['?oneseatday=maybe', 'oneSeatRestricted'],
    ['?weight=people', 'weight'],
    ['?surfaceunit=ground', 'surfaceUnit'],
    ['?at=40.44', 'at'],
    ['?at=here,there', 'at'],
    ['?map=40.44,-79.99', 'camera'],
    ['?dest=', 'dest'],
    ['?placefill=net', 'placeFill'],
    ['?route=51', 'route'],
    ['?route=c:', 'route'],
    ['?route=x:51', 'route'],
    ['?route=c:51/../etc', 'route'],
    ['?onetoone=maybe', 'oneToOne'],
    ['?stoproutes=maybe', 'stopRoutes'],
    // The two parameters this replaced before the feature shipped: `on` was
    // the old toggle's value and the side rode in a second parameter, so a
    // link written against either spelling is a link this build cannot
    // honour, and it opens at the default rather than half-applied.
    ['?stoproutes=on', 'stopRoutes'],
    ['?stoproutes=', 'stopRoutes'],
  ])('ignores %s', (search, key) => {
    expect(parseUrlState(search)).not.toHaveProperty(key);
  });

  it('refuses to arm the pin mode from a URL', () => {
    // "Pick a point" is a mode the next click consumes. Arriving in it would
    // make an embedded map answer a question nobody asked on the first tap.
    expect(parseUrlState('?dest=pin')).not.toHaveProperty('dest');
  });

  it('reads a route group key in either of the API\'s two spellings', () => {
    expect(parseUrlState('?route=c:51').route).toBe('c:51');
    expect(parseUrlState('?route=p:89-89S').route).toBe('p:89-89S');
  });

  it('takes only the parameters that are there', () => {
    expect(parseUrlState('?view=surface')).toEqual({ view: 'surface' });
  });
});

describe('isFramed', () => {
  it('is true when the page is not its own top window', () => {
    const self = {};
    expect(isFramed({ self, top: {} })).toBe(true);
    expect(isFramed({ self, top: self })).toBe(false);
  });

  it('treats a top it cannot read as a frame', () => {
    // Reading `window.top` across origins throws in some browsers, and that
    // throw is itself the answer: only a framed page has a top it cannot see.
    const win = { self: {}, get top(): unknown { throw new Error('cross-origin'); } };
    expect(isFramed(win)).toBe(true);
  });
});

describe('a painted selection in the link', () => {
  it('writes the stops out in full, so the link can be read and edited', () => {
    const p = new URLSearchParams(toSearch(FULL));
    expect(p.get('sel')).toBe('c:10005,p:2201');
  });

  it('leaves nothing behind when nothing has been painted', () => {
    const p = new URLSearchParams(toSearch({ ...FULL, selection: [] }));
    expect(p.has('sel')).toBe(false);
  });

  it('round-trips', () => {
    expect(parseUrlState(toSearch(FULL)).selection).toEqual(['c:10005', 'p:2201']);
  });

  it('drops the ids it cannot read and keeps the rest', () => {
    // Unlike every other parameter here, which is ignored whole: this is the
    // one a person hand-edits forty entries of, and one typo should cost the
    // typo rather than the other thirty-nine.
    const s = parseUrlState('?sel=c:10005,not an id,p:2201').selection;
    expect(s).toEqual(['c:10005', 'p:2201']);
  });
});
