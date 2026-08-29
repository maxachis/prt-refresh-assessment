import { describe, it, expect } from 'vitest';
import { serviceBodyHTML } from './place';
import { DayService, PlaceResult, SideResult } from './types';

function service(over: Partial<DayService> = {}): DayService {
  return {
    trips: 84,
    boardings: { total: 1240, measured: 3, unmeasured: 0 },
    periods: { am_6_9a: 12, mid_9a_3p: 30 },
    hourly: true,
    headways: { in: { median: 10, max_gap_6a_6p: 20 } },
    routes: ['61A'],
    first: 300,
    last: 1500,
    ...over,
  };
}

function side(name: SideResult['side'], trips: number): SideResult {
  const riders = name === 'current'
    ? undefined
    : { boardings: null };
  return {
    side: name,
    stops: [],
    days: {
      weekday: service({ trips, ...riders }),
      saturday: service({ trips: trips - 20, ...riders }),
      sunday: service({ trips: trips - 40, ...riders }),
    },
  };
}

const PLACE: PlaceResult = {
  lat: 40.4,
  lon: -80.01,
  radius: 400,
  current: side('current', 84),
  proposed: side('proposed', 71),
  change: {
    weekday: { trips: -13, hourly: [true, true] },
    saturday: { trips: -8, hourly: [true, false] },
    sunday: { trips: -4, hourly: [false, false] },
  },
  place: { muni: 'Pittsburgh', hood: 'Beechview' },
  population: {
    place: 'Beechview', lost: 1923.3, gained: 0, block_groups: 3,
    measured: true,
  },
  oneseat: [],
};

describe('the key under the chart', () => {
  // The two colours key the bars AND the stop dots the map draws around the
  // pin, which nothing else on screen names. A reader who cannot tell an
  // orange dot from a blue one is reading the map's central comparison --
  // two stop inventories over the same ground -- as noise.
  const html = serviceBodyHTML(PLACE, 'weekday');

  it('names both networks', () => {
    expect(html).toContain('sw-now');
    expect(html).toContain('sw-prop');
  });

  it('names the dashed circle at the radius the answer used', () => {
    expect(html).toContain('sw-walk');
    expect(html).toMatch(/400 m walk/);
  });

  it('names the red pin', () => {
    expect(html).toContain('sw-pin');
  });

  it('says a stop kept by both networks draws as one mark, not two', () => {
    expect(html).toMatch(/both networks keep/i);
  });
});


describe('boardings in the panel', () => {
  it('reports the riders at the stops it is already drawing', () => {
    const html = serviceBodyHTML(PLACE, 'weekday');
    expect(html).toContain('1,240');
    // Never in the today -> proposed headline: the plan has no observed side,
    // and an empty column there would read as a zero.
    expect(html.split('<dl class="facts">')[0]).not.toContain('1,240');
  });

  it('says the figure is today\'s only, and cannot ever have a proposed half', () => {
    const html = serviceBodyHTML(PLACE, 'weekday');
    expect(html).toMatch(/what is at risk/);
    expect(html).toMatch(/30%/);
  });

  it('names the stops it could not count rather than treating them as empty', () => {
    const p = {
      ...PLACE,
      current: {
        ...PLACE.current,
        days: {
          ...PLACE.current.days,
          weekday: service({ boardings: { total: 90, measured: 1, unmeasured: 2 } }),
        },
      },
    };
    const html = serviceBodyHTML(p, 'weekday');
    expect(html).toContain('90');
    expect(html).toMatch(/2 of the 3 stops|2 stops/);
  });

  it('shows no rider figure at all where nothing was counted', () => {
    const p = {
      ...PLACE,
      current: {
        ...PLACE.current,
        days: {
          ...PLACE.current.days,
          weekday: service({ boardings: { total: null, measured: 0, unmeasured: 0 } }),
        },
      },
    };
    const html = serviceBodyHTML(p, 'weekday');
    expect(html).toContain('not counted here');
    // No caveat without a number to caveat.
    expect(html).not.toContain('30%');
  });
});


describe('the place\'s residents in the panel', () => {
  it('reports the published figure for the whole place, not for the walk', () => {
    const html = serviceBodyHTML(PLACE, 'weekday');
    expect(html).toContain('1,923');
    expect(html).toContain('Beechview');
    // The measure is any bus in a week, so it must not look like it belongs
    // to the day type the switch above is set to.
    expect(html).toMatch(/any day of the week|does not move with the day/i);
  });

  it('says plainly when a place the plan leaves alone loses nobody', () => {
    const p = { ...PLACE, population: {
      place: 'Whitehall borough', lost: 0, gained: 0, block_groups: 0,
      measured: true } };
    const html = serviceBodyHTML(p, 'weekday');
    expect(html).toMatch(/nobody/i);
    expect(html).toContain('Whitehall borough');
  });

  it('says nothing at all where the equity work never asked', () => {
    const html = serviceBodyHTML({ ...PLACE, population: null }, 'weekday');
    expect(html).not.toMatch(/residents/i);
    expect(html).not.toMatch(/lose every bus/i);
  });
});
