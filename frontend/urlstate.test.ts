import { describe, it, expect } from 'vitest';
import { parseUrlState, toSearch, isFramed, UrlState } from './urlstate';

const FULL: UrlState = {
  view: 'oneseat',
  day: 'saturday',
  radius: 150,
  oneSeatRestricted: true,
  dest: { key: 'oakland' },
  at: { lat: 40.4406, lon: -79.9959 },
  camera: { lat: 40.44, lon: -80.0, zoom: 13.5 },
};

describe('toSearch', () => {
  it('writes every control, so an embed src shows all its knobs', () => {
    const p = new URLSearchParams(toSearch(FULL));
    expect(p.get('view')).toBe('oneseat');
    expect(p.get('day')).toBe('saturday');
    expect(p.get('radius')).toBe('150');
    expect(p.get('oneseatday')).toBe('selected');
    expect(p.get('dest')).toBe('oakland');
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

  it('round-trips through parse', () => {
    expect(parseUrlState(toSearch(FULL))).toEqual(FULL);
  });
});

describe('parseUrlState', () => {
  it('returns nothing for an unadorned URL', () => {
    expect(parseUrlState('')).toEqual({});
    expect(parseUrlState('?')).toEqual({});
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
    ['?at=40.44', 'at'],
    ['?at=here,there', 'at'],
    ['?map=40.44,-79.99', 'camera'],
    ['?dest=', 'dest'],
  ])('ignores %s', (search, key) => {
    expect(parseUrlState(search)).not.toHaveProperty(key);
  });

  it('refuses to arm the pin mode from a URL', () => {
    // "Pick a point" is a mode the next click consumes. Arriving in it would
    // make an embedded map answer a question nobody asked on the first tap.
    expect(parseUrlState('?dest=pin')).not.toHaveProperty('dest');
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
