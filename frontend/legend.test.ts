import { describe, it, expect } from 'vitest';
import { renderLegend, renderOneSeatLegend, pinKeyHTML } from './legend';
import {
  ChangeLayer, OneSeatDay, OneSeatLayer, SurfaceLayer, PopulationLayer,
} from './types';

/** Enough of an HTMLElement for renderLegend, which only sets innerHTML. */
function stub() {
  return { innerHTML: '' } as unknown as HTMLElement & { innerHTML: string };
}

/**
 * The rendered copy as a reader sees it: one line, single-spaced.
 *
 * A sentence in the source is wrapped to the column, so asserting on it
 * verbatim pins where the line breaks fall as tightly as the words. That
 * fails on a rewrap that changed nothing, which teaches the next person to
 * loosen the assertion rather than to read it.
 */
function prose(el: { innerHTML: string }) {
  return el.innerHTML.replace(/\s+/g, ' ');
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
  replacement: {},
  points: [
    //  lat     lon    pub  id     rm    weekday          saturday        sunday
    [40.44, -79.99, 1, 'c:1', 0, 40, 0, 0, 100, 30, 0, 0, 60, 20, 0, 0, 40],   // gone
    [40.45, -79.98, 1, 'c:2', 0, 40, 0, 0, 25, 30, 0, 0, 15, 20, 0, 0, 10],    // gone
    [40.44, -79.97, 1, 'c:3', 0, 10, 40, 5, 400, 8, 30, 5, 200, 5, 20, 5, 90], // doubled
    [40.44, -79.96, 1, 'c:4', 0, 10, 10, 7, 0, 0, 0, 7, 0, 0, 0, 7, 0],        // none
    [41.90, -79.99, 1, 'c:5', 0, 40, 0, 0, 900, 30, 0, 0, 500, 20, 0, 0, 300], // out of view
  ],
};

/** A stop the plan takes away, at a corner whose buses nonetheless double. */
const REMOVED_STOP = [40.44, -79.945, 1, 'c:7', 1,
                      10, 40, 5, 12, 8, 30, 5, 6, 5, 20, 5, 3];

/** A location the plan adds a bus to: served proposed, nothing there today. */
const NEW_POINT = [40.44, -79.95, 0, 'p:9', 0, 0, 30, 6, null, 0, 20, 6, null,
                   0, 10, 6, null];

/** A pole the plan adds where buses already ran: hollow, and not `new`. */
const NEW_STOP = [40.44, -79.955, 0, 'p:8', 0, 40, 90, 5, null, 30, 70, 5, null,
                  20, 50, 5, null];

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

  it('says a stop the plan adds beside an existing one recolours rather than appears', () => {
    // Twice now a reader has taken bare ground on a street the plan adds
    // stops to as the plan's gain being missing, when the gain is in the
    // colour of the dot at the stop a short walk away.
    for (const weight of ['locations', 'riders'] as const) {
      const el = stub();
      renderLegend(el, { layer: LAYER, day: 'weekday', bounds: BOX, weight });
      expect(prose(el)).toContain("changes a dot's colour rather than adding one");
      expect(prose(el)).toContain("where none stands within 150 m");
    }
  });

  it('describes the whole point set, not only the stops that exist today', () => {
    // The blue bucket is the half that does not sit at a stop today, so a
    // sentence claiming every dot does contradicts a row of the same key.
    const el = stub();
    renderLegend(el, { layer: LAYER, day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(prose(el)).not.toContain('A dot sits where a bus stops today');
    expect(prose(el)).toContain(
      'plus the places the plan puts a stop where none stands within 150 m');
  });

  it('keys the added stops as a row of their own, with a hollow swatch', () => {
    // The mark is a symbol on the map, and a symbol explained only in prose is
    // one a reader has to read a paragraph to decode. It gets the same
    // swatch-label-count line every colour on this key gets.
    const el = stub();
    renderLegend(el, { layer: { ...LAYER, points: [...LAYER.points, NEW_POINT] },
                       day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(el.innerHTML).toContain('lg-hollow');
    expect(prose(el)).toContain('the plan adds a stop here');
  });

  it('makes the added stops a switch, like every other row', () => {
    // They are dots now rather than an annotation on somebody else's dot, so
    // hiding them hides only themselves.
    const el = stub();
    renderLegend(el, { layer: { ...LAYER, points: [...LAYER.points, NEW_POINT] },
                       day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(el.innerHTML).toContain('data-bucket="newplace"');
  });

  it('counts the added stops in the same scope as every other row', () => {
    // One added place in view, one outside it. A key line whose count came
    // from the whole city would sit under a head line that says "in view".
    const far = [41.9, -79.99, 0, 'p:99', 0, 0, 30, 6, null, 0, 20, 6, null,
                 0, 10, 6, null];
    const el = stub();
    renderLegend(el, {
      layer: { ...LAYER, points: [...LAYER.points, NEW_POINT, far] },
      day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(el.innerHTML).toMatch(/lg-hollow[\s\S]*?<span class="lg-n">1<\/span>/);
  });

  it('keeps an added stop out of the service buckets entirely', () => {
    // NEW_STOP goes from 40 buses to 90, which is `doubled`. Counted there it
    // would read "doubled or better" AND "the plan adds a stop here" at once
    // -- two true marks with different footprints, which reads as a
    // contradiction. Max called that incongruous on 2026-09-08.
    const el = stub();
    renderLegend(el, { layer: { ...LAYER, points: [...LAYER.points, NEW_STOP] },
                       day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(el.innerHTML).toMatch(/data-bucket="doubled"[\s\S]*?<span class="lg-n">1</);
    expect(el.innerHTML).toMatch(/lg-hollow[\s\S]*?<span class="lg-n">1<\/span>/);
  });

  it('puts both marks under one heading, not two', () => {
    // The ring and the cross are the same question with two answers -- the
    // plan puts a pole here, the plan takes this one away -- and split across
    // the key each read as an extra outcome beside the colours. Max asked for
    // the single heading on 2026-09-09.
    const el = stub();
    renderLegend(el, {
      layer: { ...LAYER, points: [...LAYER.points, NEW_POINT, REMOVED_STOP] },
      day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(el.innerHTML.match(/lg-marks-head/g)).toHaveLength(1);
    expect(el.innerHTML).toMatch(
      /lg-marks-head[\s\S]*?lg-hollow[\s\S]*?lg-cross/);
  });

  it('opens the marks heading for an added stop with no removal beside it', () => {
    const el = stub();
    renderLegend(el, { layer: { ...LAYER, points: [...LAYER.points, NEW_POINT] },
                       day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(prose(el)).toContain('and what happens to the stop itself');
    expect(el.innerHTML).not.toContain('lg-cross');
  });

  it('keys the removed stops under their own heading, not as a bucket', () => {
    // The mark and the colour answer different questions, and the heading is
    // what stops a reader adding this row to the coloured rows above it.
    // REMOVED_STOP is one of them and its buses double.
    const el = stub();
    renderLegend(el, {
      layer: { ...LAYER, points: [...LAYER.points, REMOVED_STOP] },
      day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(el.innerHTML).toContain('lg-cross');
    expect(prose(el)).toContain('and what happens to the stop itself');
    expect(prose(el)).toContain('the plan removes this stop');
  });

  it('keeps a removed stop out of the service buckets', () => {
    // Max, 2026-09-09: a dot is a cross or a colour, never both. REMOVED_STOP
    // is a stop the plan takes away at a corner whose buses double, so the
    // `doubled` row keeps only c:3 and the cross carries this dot alone.
    // Counted in both, the key lists the same dot twice.
    const el = stub();
    renderLegend(el, {
      layer: { ...LAYER, points: [...LAYER.points, REMOVED_STOP] },
      day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(el.innerHTML).toMatch(/data-bucket="doubled"[\s\S]*?<span class="lg-n">1</);
    expect(el.innerHTML).toMatch(/lg-cross[\s\S]*?<span class="lg-n">1<\/span>/);
  });

  it('counts the removed stops into the locations in view', () => {
    // They are dots on screen and no coloured row holds them now, so a total
    // built from the coloured rows alone would be short by every cross.
    const el = stub();
    renderLegend(el, {
      layer: { ...LAYER, points: [...LAYER.points, REMOVED_STOP] },
      day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(el.innerHTML).toMatch(/<b>4<\/b>\s*locations in view/);
  });

  it('weighs the crosses by boardings when the key counts riders', () => {
    // The riders at a stop PRT is removing are the most at-risk on the map.
    // Out of the buckets and with nowhere else to go, they would vanish from
    // the head total the moment the reader switched to Riders.
    const el = stub();
    renderLegend(el, {
      layer: { ...LAYER, points: [...LAYER.points, REMOVED_STOP] },
      day: 'weekday', bounds: BOX, weight: 'riders' });
    expect(el.innerHTML).toMatch(/lg-cross[\s\S]*?<span class="lg-n">12<\/span>/);
    // 100 + 25 + 400 in the buckets, and 12 at the stop being removed.
    expect(el.innerHTML).toMatch(/<b>537<\/b>\s*daily boardings in view/);
  });

  it('says what a removed stop does not mean', () => {
    const el = stub();
    renderLegend(el, {
      layer: { ...LAYER, points: [...LAYER.points, REMOVED_STOP] },
      day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(prose(el)).toContain(
      'A removed stop is not the same as a corner losing its bus');
  });

  it('says nothing about removed stops when none is in view', () => {
    const el = stub();
    renderLegend(el, { layer: LAYER, day: 'weekday', bounds: BOX,
                       weight: 'locations' });
    expect(el.innerHTML).not.toContain('lg-cross');
    expect(prose(el)).not.toContain('A removed stop is not the same');
  });

  it('counts the added stops into the locations in view', () => {
    // No coloured row counts them any more, so a total built from those alone
    // would be smaller than the dots on screen.
    const el = stub();
    renderLegend(el, { layer: { ...LAYER, points: [...LAYER.points, NEW_POINT] },
                       day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(el.innerHTML).toMatch(/<b>4<\/b>\s*locations in view/);
  });

  it('drops the row when nothing in view is a place the plan adds a stop to', () => {
    // Every other row stays at zero because a bucket that vanishes reads as
    // impossible rather than absent. This one is different: it is not an
    // outcome of the plan, and "0 places have no stop today" is a sentence
    // about nothing.
    const el = stub();
    renderLegend(el, { layer: LAYER, day: 'weekday', bounds: BOX, weight: 'locations' });
    expect(el.innerHTML).not.toContain('lg-hollow');
    expect(el.innerHTML).not.toContain('data-bucket="newplace"');
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

describe('renderLegend with a painted selection', () => {
  // The one scope on this key a reader cannot reproduce by looking at the
  // same screen, so every figure it produces has to say it was hand-picked.
  const PICKED = new Set(['c:1', 'c:5']);   // one in view, one well outside

  it('counts the stops picked rather than the ones on screen', () => {
    const el = stub();
    renderLegend(el, { layer: LAYER, day: 'weekday', bounds: BOX,
                       weight: 'locations', selection: PICKED });
    expect(el.innerHTML).toMatch(/<b>2<\/b>\s*of 2 selected stops/);
    expect(el.innerHTML).not.toContain('locations in view');
  });

  it('says a hand-picked count was hand-picked', () => {
    const el = stub();
    renderLegend(el, { layer: LAYER, day: 'weekday', bounds: BOX,
                       weight: 'locations', selection: PICKED });
    expect(el.innerHTML).toContain('stops you painted');
  });

  it('weighs the picked stops by boardings, naming the scope in the head', () => {
    const el = stub();
    renderLegend(el, { layer: LAYER, day: 'weekday', bounds: BOX,
                       weight: 'riders', selection: PICKED });
    expect(el.innerHTML).toMatch(/<b>1,000<\/b>\s*daily boardings at 2 selected stops/);
  });

  it('falls back to the view when nothing has been painted', () => {
    const el = stub();
    renderLegend(el, { layer: LAYER, day: 'weekday', bounds: BOX,
                       weight: 'locations', selection: new Set() });
    expect(el.innerHTML).toMatch(/<b>3<\/b>\s*locations in view/);
  });
});

describe('the surface figures under a painted selection', () => {
  // Ground and people are measured over 100 m cells, which have no stops to
  // select. Leaving them counting the viewport while the dots above them
  // counted a painted set would put two scopes in one key, one of them
  // silently — so they say what they are instead of printing a number.
  const opts = { layer: LAYER, day: 'weekday' as const, bounds: BOX,
                 weight: 'locations' as const, surface: SURFACE,
                 selection: new Set(['c:1']) };

  it('drops the square kilometres and says why', () => {
    const el = stub();
    renderLegend(el, { ...opts, unit: 'area' });
    expect(el.innerHTML).not.toContain('km² lose all service');
    expect(el.innerHTML).toContain('not the stops you selected');
  });

  it('drops the resident figures too', () => {
    const el = stub();
    renderLegend(el, { ...opts, unit: 'people', population: POPULATION });
    expect(el.innerHTML).not.toContain('people lose all service');
  });

  it('keeps the ramp, which is a key and still true of what is painted', () => {
    const el = stub();
    renderLegend(el, { ...opts, unit: 'area' });
    expect(el.innerHTML).toContain('buses per day, proposed vs today');
  });
});
