import { describe, it, expect } from 'vitest';
import { renderLegend, renderOneSeatLegend, pinKeyHTML } from './legend';
import { ChangeLayer, OneSeatDay, OneSeatLayer } from './types';

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
    //  lat     lon     pub  weekday      saturday     sunday
    [40.44, -79.99, 1, 40, 0, 0, 30, 0, 0, 20, 0, 0],   // gone
    [40.45, -79.98, 1, 40, 0, 0, 30, 0, 0, 20, 0, 0],   // gone
    [40.44, -79.97, 1, 10, 40, 5, 8, 30, 5, 5, 20, 5],  // doubled
    [40.44, -79.96, 1, 10, 10, 7, 0, 0, 7, 0, 0, 7],    // none
    [41.90, -79.99, 1, 40, 0, 0, 30, 0, 0, 20, 0, 0],   // gone, out of view
  ],
};

const BOX = { west: -80.1, south: 40.3, east: -79.9, north: 40.5 };

describe('renderLegend', () => {
  it('counts only what is in view, and says which day type', () => {
    const el = stub();
    renderLegend(el, LAYER, 'weekday', BOX);
    expect(el.innerHTML).toContain('a weekday');
    expect(el.innerHTML).toContain('400 m');
    // 2 gone + 1 doubled in view; the fifth point is outside the box, and
    // `none` is not an outcome so it is not in the total.
    expect(el.innerHTML).toMatch(/<b>3<\/b>\s*locations in view/);
  });

  it('never lists "no service either way" as an outcome of the plan', () => {
    const el = stub();
    renderLegend(el, LAYER, 'weekday', BOX);
    expect(el.innerHTML).not.toContain('no service either way');
    expect(el.innerHTML).toContain('loses all service');
  });

  it('keeps a row for every bucket, including the empty ones', () => {
    // A bucket that drops out when its count hits zero reads as "this cannot
    // happen here" rather than "this does not happen here".
    const el = stub();
    renderLegend(el, LAYER, 'weekday', BOX);
    for (const b of LAYER.buckets) {
      if (b.key === 'none') continue;
      expect(el.innerHTML).toContain(`data-bucket="${b.key}"`);
    }
  });

  it('says the counts are locations rather than riders', () => {
    const el = stub();
    renderLegend(el, LAYER, 'sunday', BOX);
    expect(el.innerHTML).toContain('not riders');
    expect(el.innerHTML).toContain('a Sunday');
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
