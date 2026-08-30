import { describe, it, expect } from 'vitest';
import { placeLabel, serviceBodyHTML } from './place';
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
    expect(html).toMatch(/today's stops only/i);
    // PRT asks this one to travel with the number itself, so it stays on
    // screen rather than moving behind the method link with the rest.
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


// The panel says only what changes the reading of the number beside it; the
// provenance behind each figure lives once in the method drawer, reachable
// from the figure rather than restated under it.
describe('the panel points at its own method', () => {
  it('sends every caveated figure to the drawer entry that explains it', () => {
    const html = serviceBodyHTML(PLACE, 'weekday');
    for (const id of ['boardings', 'place-population', 'location-not-route']) {
      expect(html).toContain(`data-caveat="${id}"`);
    }
  });

  it('does not offer a method link for a figure it is not showing', () => {
    const html = serviceBodyHTML({ ...PLACE, population: null }, 'weekday');
    expect(html).not.toContain('data-caveat="place-population"');
  });

  it('keeps the panel short enough to take in at a glance', () => {
    const words = serviceBodyHTML(PLACE, 'weekday')
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
    expect(words).toBeLessThan(220);
  });
});


// PRT writes a municipality as "Ross township (Allegheny, PA)". 5,726 of the
// 5,751 labelled stops are in Allegheny, so the county earns its space only
// where it is not the one the reader has already assumed -- and it earns it
// there twice over, because that is also where the residents block goes
// silent.
describe('naming the place a reader clicked in', () => {
  const at = (place: any) => placeLabel({ ...PLACE, place });

  it('does not repeat the county that 99.6% of the map is in', () => {
    expect(at({ muni: 'Ross township (Allegheny, PA)', hood: '' }))
      .toBe('Ross township');
  });

  it('keeps the county where it is not the one being assumed', () => {
    expect(at({ muni: 'Ambridge borough (Beaver, PA)', hood: '' }))
      .toBe('Ambridge borough (Beaver)');
  });

  it('prefers the neighbourhood, which carries no county at all', () => {
    expect(at({ muni: 'Pittsburgh city (Allegheny, PA)', hood: 'Beechview' }))
      .toBe('Beechview');
  });

  it('leaves a label PRT wrote without a county alone', () => {
    expect(at({ muni: 'Mount Oliver borough', hood: '' }))
      .toBe('Mount Oliver borough');
  });
});


// A column of "a -> b" rows is read down the column, not across the row: the
// eye wants today under today and the plan under the plan. Ragged rows make
// that comparison a hunt.
describe('the before-and-after rows line up in columns', () => {
  it('puts today, the arrow and the plan in three fixed columns', () => {
    const html = serviceBodyHTML(PLACE, 'weekday');
    expect(html).toMatch(/<dd class="cmp[^"]*"><span class="cmp-a">/);
    // Every comparison row, not just the first, or the column breaks. A row
    // whose two sides match carries a second class and still counts.
    expect((html.match(/<dd class="cmp( same)?">/g) ?? []).length).toBe(4);
  });

  it('leaves a figure with no proposed half out of the columns', () => {
    const html = serviceBodyHTML(PLACE, 'weekday');
    const boardings = html.split('<dt>Boardings</dt>')[1];
    expect(boardings.slice(0, 30)).not.toContain('cmp');
  });
});


describe('the two route lists sit side by side', () => {
  it('gives today and the plan a column each, not a row each', () => {
    const html = serviceBodyHTML(PLACE, 'weekday');
    const pair = html.match(/<div class="rpair">[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? '';
    expect(pair.indexOf('today')).toBeGreaterThan(-1);
    // Today's column opens before the plan's, so the reading order matches
    // the before -> after everything else on the panel uses.
    expect(pair.indexOf('today')).toBeLessThan(pair.indexOf('proposed'));
    expect((pair.match(/class="rside"/g) ?? []).length).toBe(2);
  });
});


// Blue and orange already mean today and the plan four inches up the panel;
// red and green already mean service lost and gained. A route that only one
// network runs is the first pair, never the second.
describe('the route pills say which network runs them', () => {
  const pair = (html: string) =>
    html.match(/<div class="rpair">[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? '';

  const withRoutes = (now: string[], prop: string[]) => {
    const p = { ...PLACE,
      current: { ...PLACE.current, days: { ...PLACE.current.days,
        weekday: service({ routes: now }) } },
      proposed: { ...PLACE.proposed, days: { ...PLACE.proposed.days,
        weekday: service({ routes: prop }) } } };
    return pair(serviceBodyHTML(p, 'weekday'));
  };

  it('marks a route both networks run as unchanged, on both sides', () => {
    const html = withRoutes(['61A', '28X'], ['61A', '75']);
    expect((html.match(/class="route both">61A/g) ?? []).length).toBe(2);
  });

  it('marks a route only today runs in today\'s own colour', () => {
    expect(withRoutes(['28X'], ['75'])).toContain('class="route only-now">28X');
  });

  it('marks a route only the plan runs in the plan\'s own colour', () => {
    expect(withRoutes(['28X'], ['75'])).toContain('class="route only-prop">75');
  });

  it('never dresses a route the plan drops in the colour of a loss', () => {
    // Renumbering makes this a list difference, not a service change: the
    // 61A-D become the 60X/61X/62X and nothing on the ground moved.
    const html = withRoutes(['61A'], ['61X']);
    expect(html).not.toMatch(/class="route [^"]*(lost|down|gone)/);
  });
});


it('writes each colour in the key in the colour it names', () => {
  const html = serviceBodyHTML(PLACE, 'weekday');
  expect(html).toContain('<span class="k-now">Blue</span>');
  expect(html).toContain('<span class="k-prop">orange</span>');
  expect(html).toContain('<span class="k-shared">grey</span>');
});


// The only row on the panel where a number can be graded. A wait is the one
// figure whose direction is unambiguous -- and whose arithmetic runs opposite
// to everything above it, since a bigger number is a worse service.
describe('grading the typical wait', () => {
  const withWait = (now: number, prop: number) => {
    const h = (m: number) => ({ '0': { median: m, max_gap_6a_6p: m } } as any);
    const p = { ...PLACE,
      current: { ...PLACE.current, days: { ...PLACE.current.days,
        weekday: service({ headways: h(now) }) } },
      proposed: { ...PLACE.proposed, days: { ...PLACE.proposed.days,
        weekday: service({ headways: h(prop) }) } } };
    return serviceBodyHTML(p, 'weekday');
  };

  it('calls a longer wait worse, not an increase', () => {
    expect(withWait(15, 30)).toContain('<span class="cmp-b worse">30 min</span>');
  });

  it('calls a shorter wait better', () => {
    expect(withWait(30, 15)).toContain('<span class="cmp-b better">15 min</span>');
  });

  it('grades nothing when the wait does not move', () => {
    const html = withWait(20, 20);
    expect(html).not.toContain('cmp-b better');
    expect(html).not.toContain('cmp-b worse');
  });

  it('never grades the stop count, which consolidation moves on its own', () => {
    // Convention 3: a vanished stop id is not a lost bus.
    const stops = withWait(20, 20).split('<dt>Stops within')[1] ?? '';
    expect(stops.slice(0, 200)).not.toMatch(/better|worse/);
  });
});

describe('a figure that did not move steps back', () => {
  it('dims both sides when they are the same', () => {
    const html = serviceBodyHTML(PLACE, 'weekday');
    expect(html).toContain('<dd class="cmp same">');
  });
});


// A later first bus is worse and a later last bus is better, so the endpoints
// cannot be graded. The distance between them can: a longer day is more bus.
describe('the length of the service day', () => {
  const withSpan = (a: [number, number], b: [number, number]) => {
    const p = { ...PLACE,
      current: { ...PLACE.current, days: { ...PLACE.current.days,
        weekday: service({ first: a[0], last: a[1] }) } },
      proposed: { ...PLACE.proposed, days: { ...PLACE.proposed.days,
        weekday: service({ first: b[0], last: b[1] }) } } };
    return serviceBodyHTML(p, 'weekday');
  };

  it('states the hours between the first bus and the last', () => {
    expect(withSpan([281, 1679], [303, 1568])).toContain('23h 18m');
  });

  it('calls a shorter service day worse', () => {
    expect(withSpan([281, 1679], [303, 1568]))
      .toContain('<span class="cmp-b worse">21h 05m</span>');
  });

  it('calls a longer service day better', () => {
    expect(withSpan([303, 1568], [281, 1679]))
      .toContain('<span class="cmp-b better">23h 18m</span>');
  });

  it('says nothing about a day with no bus in it', () => {
    expect(withSpan([281, 1679], [null as any, null as any]))
      .toContain('<span class="cmp-b">—</span>');
  });
});
