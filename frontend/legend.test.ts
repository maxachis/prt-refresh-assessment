import { describe, it, expect } from 'vitest';
import { renderLegend } from './legend';
import { ChangeLayer } from './types';

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
