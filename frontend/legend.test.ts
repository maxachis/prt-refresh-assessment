import { describe, it, expect } from 'vitest';
import { renderLegend, renderOneSeatLegend, pinKeyHTML } from './legend';
import {
  ChangeLayer, OneSeatDay, OneSeatLayer, SurfaceLayer, PopulationLayer,
} from './types';

/** Enough of an HTMLElement for renderLegend, which only sets innerHTML. */
function stub() {
  return { innerHTML: '' } as unknown as HTMLElement & { innerHTML: string };
}

const LAYER: ChangeLayer = {
  radius: 400,
  days: ['weekday', 'saturday', 'sunday'],
  buckets: [
    { key: 'gone', label: 'loses all service' },
    { key: 'halved', label: 'halved or worse' },
    { key: 'less', label: 'less service' },
    { key: 'same', label: 'about the same' },
    { key: 'more', label: 'more service' },
    { key: 'doubled', label: 'doubled or better' },
    { key: 'new', label: 'new service' },
    { key: 'none', label: 'no service either way' },
  ],
  fields: [],
  points: [
    //  lat     lon     pub  weekday          saturday        sunday
    [40.44, -79.99, 1, 40, 0, 0, 100, 30, 0, 0, 60, 20, 0, 0, 40],   // gone
    [40.45, -79.98, 1, 40, 0, 0, 25, 30, 0, 0, 15, 20, 0, 0, 10],    // gone
    [40.44, -79.97, 1, 10, 40, 5, 400, 8, 30, 5, 200, 5, 20, 5, 90], // doubled
    [40.44, -79.96, 1, 10, 10, 7, 0, 0, 0, 7, 0, 0, 0, 7, 0],        // none
    [41.90, -79.99, 1, 40, 0, 0, 900, 30, 0, 0, 500, 20, 0, 0, 300], // out of view
  ],
};

/** A location the plan adds a bus to: served proposed, nothing there today. */
const NEW_POINT = [40.44, -79.95, 0, 0, 30, 6, null, 0, 20, 6, null,
                   0, 10, 6, null];

const BOX = { west: -80.1, south: 40.3, east: -79.9, north: 40.5 };

describe('renderLegend', () => {
  it('counts only what is in view, and says which day type', () => {
    const el = stub();
    renderLegend(el, { layer: LAYER, day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(el.innerHTML).toContain('a weekday');
    expect(el.innerHTML).toContain('400 m');
    // 2 gone + 1 doubled in view; the fifth point is outside the box, and
    // `none` is not an outcome so it is not in the total.
    expect(el.innerHTML).toMatch(/<b>3<\/b>\s*locations in view/);
  });

  it('never lists "no service either way" as an outcome of the plan', () => {
    const el = stub();
    renderLegend(el, { layer: LAYER, day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(el.innerHTML).not.toContain('no service either way');
    expect(el.innerHTML).toContain('loses all service');
  });

  it('keeps a row for every bucket, including the empty ones', () => {
    // A bucket that drops out when its count hits zero reads as "this cannot
    // happen here" rather than "this does not happen here".
    const el = stub();
    renderLegend(el, { layer: LAYER, day: 'weekday', bounds: BOX, weight: 'locations' });
    for (const b of LAYER.buckets) {
      if (b.key === 'none') continue;
      expect(el.innerHTML).toContain(`data-bucket="${b.key}"`);
    }
  });

  it('offers the rider weighting without switching to it', () => {
    const el = stub();
    renderLegend(el, { layer: LAYER, day: 'weekday', bounds: BOX,
                       weight: 'locations' });
    expect(el.innerHTML).toContain('data-weight="riders"');
    expect(el.innerHTML).toMatch(/data-weight="locations"[^>]*aria-pressed="true"/);
  });

  it('says the counts are locations rather than riders', () => {
    const el = stub();
    renderLegend(el, { layer: LAYER, day: 'sunday', bounds: BOX, weight: 'locations' });
    expect(el.innerHTML).toContain('not riders');
    expect(el.innerHTML).toContain('a Sunday');
  });
});

describe('renderLegend weighted by ridership', () => {
  const opts = { layer: LAYER, day: 'weekday' as const, bounds: BOX,
                 weight: 'riders' as const };

  it('heads with the boardings in view, not the locations', () => {
    const el = stub();
    renderLegend(el, opts);
    // 100 + 25 + 400 in view; the fifth point is outside the box.
    expect(el.innerHTML).toMatch(/<b>525<\/b>\s*daily boardings in view/);
    expect(el.innerHTML).toContain('a weekday');
  });

  it('puts the boardings on each bucket row', () => {
    const el = stub();
    renderLegend(el, opts);
    expect(el.innerHTML).toMatch(/data-bucket="gone"[\s\S]*?>125</);
  });

  it('reads the day type it was given', () => {
    const el = stub();
    renderLegend(el, { ...opts, day: 'sunday' });
    expect(el.innerHTML).toMatch(/<b>140<\/b>/);
  });

  it('never prints a zero for a location the plan adds a bus to', () => {
    // 0 boardings would read as "nobody will use it". There is no record,
    // because no bus stops there today.
    const el = stub();
    renderLegend(el, {
      ...opts, layer: { ...LAYER, points: [...LAYER.points, NEW_POINT] } });
    expect(el.innerHTML).toMatch(/data-bucket="new"[\s\S]*?>—</);
    expect(el.innerHTML).toMatch(/1 location in view/);
  });

  it('carries the ridership caveats wherever the number is', () => {
    const el = stub();
    renderLegend(el, opts);
    // Marked so the phone layout, which drops the other footnotes for room,
    // cannot drop the one that says what the number means.
    expect(el.innerHTML).toContain('lg-foot-riders');
    expect(el.innerHTML).toContain('May 2025');
    expect(el.innerHTML).toContain('30%');
    expect(el.innerHTML).toMatch(/not people/);
  });
});

const WHOLE_COUNTY = { west: -80.4, south: 40.1, east: -79.6, north: 40.8 };

function oneSeatLayer(day: OneSeatDay): OneSeatLayer {
  return {
    radius: 400,
    day,
    destination: { key: 'downtown', name: 'Downtown', seeds: 44,
                   lat: null, lon: null },
    statuses: [
      { key: 'here', label: 'at the destination' },
      { key: 'keeps', label: 'keeps a one-seat ride' },
      { key: 'gains', label: 'gains a one-seat ride' },
      { key: 'loses', label: 'loses its one-seat ride' },
      { key: 'none', label: 'no one-seat ride either way' },
    ],
    counts: { here: 1, keeps: 2, gains: 1, loses: 1, none: 1 },
    fields: ['lat', 'lon', 'published', 'status', 'current', 'proposed'],
    points: [[40.44, -79.99, 1, 1, '61A', '61A']],
  };
}

describe('the one-seat legend on a day type', () => {
  it('says which day it answered for, and that it is not the published one', () => {
    const el = stub();
    renderOneSeatLegend(el, oneSeatLayer('sunday'), WHOLE_COUNTY);
    expect(el.innerHTML).toContain('Sunday');
    expect(el.innerHTML).toMatch(/published/i);
  });

  it('says there is no day type at all on the published answer', () => {
    const el = stub();
    renderOneSeatLegend(el, oneSeatLayer('any'), WHOLE_COUNTY);
    expect(el.innerHTML).toContain('No day type');
  });
});

const SURFACE_ORIGIN = { lat0: 40.45, lon0: -79.98, dlat: 0.000898, dlon: 0.001181 };

/** [ix, iy, wCur, wProp, sCur, sProp, uCur, uProp] */
const SURFACE: SurfaceLayer = {
  radius: 400, cell_m: 100,
  days: ['weekday', 'saturday', 'sunday'],
  origin: SURFACE_ORIGIN, fields: [],
  cells: [[0, 0, 10, 0, 0, 0, 0, 0]],   // gone, weekday
};

/** [ix, iy, wLost, wGained, wKept, wNone, sLost, ..., uNone] */
const POPULATION: PopulationLayer = {
  radius: 400, cell_m: 100,
  days: ['weekday', 'saturday', 'sunday'],
  classes: [
    { key: 'lost', label: 'lose all bus service' },
    { key: 'gained', label: 'gain bus service' },
    { key: 'kept', label: 'keep a bus' },
    { key: 'none', label: 'no bus either way' },
  ],
  origin: SURFACE_ORIGIN, fields: [],
  cells: [[0, 0, 240, 0, 1500, 12, 100, 0, 700, 12, 50, 0, 600, 12]],
};

describe('the surface key\'s ground/people switch', () => {
  const opts = { layer: LAYER, day: 'weekday' as const, bounds: BOX,
                 weight: 'locations' as const, surface: SURFACE };

  it('renders the switch pressed on ground by default', () => {
    const el = stub();
    renderLegend(el, { ...opts, unit: 'area' });
    expect(el.innerHTML).toMatch(/data-surface-unit="area"[^>]*aria-pressed="true"/);
    expect(el.innerHTML).toMatch(/data-surface-unit="people"[^>]*aria-pressed="false"/);
  });

  it('shows square kilometres on ground, not population figures', () => {
    const el = stub();
    renderLegend(el, { ...opts, unit: 'area' });
    expect(el.innerHTML).toContain('km²');
    expect(el.innerHTML).toContain('of ground in view, not of people');
    expect(el.innerHTML).not.toContain('counted at home');
  });

  it('shows the four population lines and the census note on people', () => {
    const el = stub();
    renderLegend(el, { ...opts, unit: 'people', population: POPULATION });
    expect(el.innerHTML).toMatch(/data-surface-unit="people"[^>]*aria-pressed="true"/);
    expect(el.innerHTML).toMatch(/<b>240<\/b>\s*people lose all service/);
    expect(el.innerHTML).toMatch(/<b>0<\/b>\s*gain service/);
    expect(el.innerHTML).toMatch(/<b>1,500<\/b>\s*keep a bus/);
    expect(el.innerHTML).toMatch(/<b>12<\/b>\s*have no bus either way/);
    expect(el.innerHTML)
      .toContain('where people live in view — 2020 census, counted at home, not where they board');
    expect(el.innerHTML).not.toContain('km²');
  });

  it('shows a loading note instead of zeroes when the population layer has not arrived', () => {
    const el = stub();
    renderLegend(el, { ...opts, unit: 'people', population: null });
    expect(el.innerHTML).toMatch(/data-surface-unit="people"[^>]*aria-pressed="true"/);
    expect(el.innerHTML).toContain('loading…');
    expect(el.innerHTML).not.toMatch(/<b>0<\/b>/);
  });
});

describe('the key for the marks around the pin', () => {
  // These four marks are on the map in every view that answers at a point,
  // while the box above them changes with the view. Swatches only: the
  // explanation lives beside the stop count in the panel, which is what it
  // explains.
  it('names all four marks, at the radius the answer used', () => {
    const html = pinKeyHTML(150);
    expect(html).toContain('sw-now');
    expect(html).toContain('sw-prop');
    expect(html).toContain('sw-pin');
    expect(html).toContain('sw-walk');
    expect(html).toContain('150 m');
    expect(html).toContain('Around the pin');
  });

  it('shows the mark a stop kept by both networks actually draws as', () => {
    // Two swatches cannot key three marks: a location both networks stop at
    // draws as neither a blue dot nor an orange one but as a blue dot inside
    // an orange ring, and that is the commonest mark inside the circle.
    expect(pinKeyHTML(400)).toContain('sw-both');
  });

  it('carries no prose, so it cannot restate the panel at a different length', () => {
    // Anything past the four short labels belongs in the panel, next to the
    // "stops within 400 m" line it is a key for.
    const words = pinKeyHTML(400).replace(/<[^>]*>/g, ' ').trim().split(/\s+/);
    expect(words.length).toBeLessThanOrEqual(22);
  });
});
