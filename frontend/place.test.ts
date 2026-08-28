import { describe, it, expect } from 'vitest';
import { serviceBodyHTML } from './place';
import { DayService, PlaceResult, SideResult } from './types';

function service(over: Partial<DayService> = {}): DayService {
  return {
    trips: 84,
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
  return {
    side: name,
    stops: [],
    days: {
      weekday: service({ trips }),
      saturday: service({ trips: trips - 20 }),
      sunday: service({ trips: trips - 40 }),
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
