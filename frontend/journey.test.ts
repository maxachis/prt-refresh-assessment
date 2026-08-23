import { describe, it, expect } from 'vitest';
import {
  toGeoJSON, changePhrase, legLine, journeyPanelHTML, journeyUrl,
  journeyKeyHTML, NOW_COLOR, PROP_COLOR,
} from './journey';
import { JourneyResult, JourneySide, JourneyLeg } from './types';

function leg(overrides: Partial<JourneyLeg> = {}): JourneyLeg {
  return {
    kind: 'ride',
    route: '61B',
    from: { stop_id: '1', name: 'Forbes Ave at Murray Ave', lat: 40.44, lon: -79.92 },
    to: { stop_id: '2', name: 'Fifth Ave at Craig St', lat: 40.45, lon: -79.95 },
    depart: 425,
    arrive: 440,
    path: null,
    ...overrides,
  };
}

function side(overrides: Partial<JourneySide> = {}): JourneySide {
  return {
    median_min: 32.4,
    best_min: 24.0,
    worst_min: 48.1,
    reachable_fraction: 1.0,
    median_transfers: 1,
    median_wait_min: 6.2,
    origin_access_stops: 4,
    dest_access_stops: 22,
    itinerary: {
      ready_at: 420,
      arrive: 452.4,
      total_min: 32.4,
      ride_min: 21.0,
      walk_min: 5.2,
      wait_min: 6.2,
      transfers: 1,
      legs: [
        leg({ kind: 'walk', route: null, from: null, depart: 420, arrive: 424 }),
        leg(),
        leg({ kind: 'walk', route: null, to: null, depart: 440, arrive: 452.4 }),
      ],
    },
    ...overrides,
  };
}

function result(overrides: Partial<JourneyResult> = {}): JourneyResult {
  return {
    origin: { lat: 40.4406, lon: -79.9959 },
    destination: { lat: 40.443719, lon: -79.958853 },
    day: 'weekday',
    window: { start_min: 420, end_min: 540, minutes: 120 },
    radii: {
      headline: {
        transfer_walk_m: 400,
        classification: 'comparable',
        change_min: 5.6,
        current: side(),
        proposed: side({ median_min: 38.0, best_min: 27.0, worst_min: 55.0 }),
      },
      strict: {
        transfer_walk_m: 150,
        classification: 'comparable',
        change_min: 7.1,
        current: side(),
        proposed: side({ median_min: 39.5 }),
      },
    },
    sign_flips: false,
    constants: {
      walk_speed_m_per_min: 80,
      max_transfer_walk_m: 400,
      min_transfer_buffer_min: 3,
    },
    ...overrides,
  };
}

// --------------------------------------------------------------------------
// what the map draws
// --------------------------------------------------------------------------

describe('drawing a ride along the street', () => {
  // Two stops a block apart joined by a path that turns a corner: the drawn
  // line has to be the corner, not the chord through the block.
  const PATH: [number, number][] = [
    [-79.99, 40.44], [-79.98, 40.44], [-79.98, 40.45],
  ];

  function oneLeg(overrides: Partial<JourneyLeg>) {
    const only = side({
      itinerary: { ...side().itinerary!, legs: [leg(overrides)] },
    });
    return result({
      radii: { ...result().radii,
               headline: { ...result().radii.headline,
                           current: only, proposed: only } },
    });
  }

  it('follows the path the bus drives when the server sends one', () => {
    const drawn = toGeoJSON(oneLeg({ kind: 'ride', path: PATH }), 'headline');
    expect(drawn.features[0].geometry.coordinates).toEqual(PATH);
  });

  it('falls back to the straight line when there is no path', () => {
    const drawn = toGeoJSON(oneLeg({ kind: 'ride', path: null }), 'headline');
    expect(drawn.features[0].geometry.coordinates).toHaveLength(2);
  });

  it('follows a walk leg\'s routed path when the server sends one', () => {
    const drawn = toGeoJSON(oneLeg({ kind: 'walk', path: PATH }), 'headline');
    expect(drawn.features[0].geometry.coordinates).toEqual(PATH);
  });

  it('falls back to the straight line when a walk has no path', () => {
    const drawn = toGeoJSON(oneLeg({ kind: 'walk', path: null }), 'headline');
    expect(drawn.features[0].geometry.coordinates).toHaveLength(2);
  });
});

describe('toGeoJSON', () => {
  it('draws both networks, one line per leg, carrying side and kind', () => {
    const gj = toGeoJSON(result(), 'headline');
    expect(gj.features).toHaveLength(6);
    expect(gj.features.filter((f) => f.properties.side === 'current')).toHaveLength(3);
    expect(gj.features.filter((f) => f.properties.side === 'proposed')).toHaveLength(3);
    expect(gj.features.map((f) => f.properties.kind).slice(0, 3))
      .toEqual(['walk', 'ride', 'walk']);
  });

  it('anchors the first and last walk at the pins, not at a stop', () => {
    // The router leaves those ends null -- the rider starts at the point they
    // dropped, not at the stop -- so a line drawn from the stop alone would
    // hide the walk that the clock is already counting.
    const gj = toGeoJSON(result(), 'headline');
    const first = gj.features[0].geometry.coordinates;
    const last = gj.features[2].geometry.coordinates;
    expect(first[0]).toEqual([-79.9959, 40.4406]);
    expect(last[last.length - 1]).toEqual([-79.958853, 40.443719]);
  });

  it('draws nothing for a network with no journey, and still draws the other', () => {
    const r = result();
    r.radii.headline.proposed = side({ median_min: null, itinerary: null });
    const gj = toGeoJSON(r, 'headline');
    expect(gj.features.every((f) => f.properties.side === 'current')).toBe(true);
  });

  it('takes the radius it is asked for, so the map can show the strict one', () => {
    const r = result();
    r.radii.strict.current = side({ itinerary: null });
    r.radii.strict.proposed = side({ itinerary: null });
    expect(toGeoJSON(r, 'strict').features).toHaveLength(0);
    expect(toGeoJSON(r, 'headline').features.length).toBeGreaterThan(0);
  });
});

describe('the two networks keep the panel palette', () => {
  it('today is the blue the before/after panel already uses, proposed the orange', () => {
    expect(NOW_COLOR).toBe('#4aa3ff');
    expect(PROP_COLOR).toBe('#ffa23a');
  });
});

// --------------------------------------------------------------------------
// what the words say
// --------------------------------------------------------------------------

describe('changePhrase', () => {
  it('says slower when the plan takes longer and faster when it does not', () => {
    expect(changePhrase(5.6)).toContain('slower');
    expect(changePhrase(-3.2)).toContain('faster');
  });

  it('carries the size of the change, not just its direction', () => {
    expect(changePhrase(5.6)).toContain('5.6');
    expect(changePhrase(-3.2)).toContain('3.2');
  });

  it('says no change rather than "0.0 min slower"', () => {
    expect(changePhrase(0)).toBe('no change');
  });

  it('has nothing to say when one side has no trip at all', () => {
    expect(changePhrase(null)).toBe('—');
  });
});

describe('legLine', () => {
  it('names the route a rider boards and how long they are on it', () => {
    const html = legLine(leg(), result());
    expect(html).toContain('61B');
    expect(html).toContain('15 min');
    expect(html).toContain('Fifth Ave at Craig St');
  });

  it('calls the first walk a walk from the point the reader dropped', () => {
    const html = legLine(leg({ kind: 'walk', route: null, from: null }), result());
    expect(html).toContain('walk');
    expect(html).not.toContain('61B');
  });

  it('falls back to a stop id where the name is missing, which rail always is', () => {
    // `stops` is the bus-only service table by design (convention 13), so a T
    // station has coordinates and no name. An empty label would read as a bug.
    const html = legLine(leg({
      to: { stop_id: 'T-STA-1', name: null, lat: 40.4, lon: -80.0 },
    }), result());
    expect(html).toContain('T-STA-1');
  });

  it('escapes the stop names, which come from PRT rather than from us', () => {
    const html = legLine(leg({
      to: { stop_id: '9', name: 'A & B <b>', lat: 40.4, lon: -80.0 },
    }), result());
    expect(html).toContain('&amp;');
    expect(html).not.toContain('<b>');
  });
});

// --------------------------------------------------------------------------
// the panel
// --------------------------------------------------------------------------

describe('journeyPanelHTML', () => {
  it('leads with both medians and the change between them', () => {
    const html = journeyPanelHTML(result(), 'Oakland');
    expect(html).toContain('32.4');
    expect(html).toContain('38.0');
    expect(html).toContain('5.6');
    expect(html).toContain('Oakland');
  });

  it('says the clock starts when the rider is ready, not when they board', () => {
    expect(journeyPanelHTML(result(), 'Oakland').toLowerCase()).toContain('wait');
  });

  it('shows the spread, because the answer is a profile and not a departure', () => {
    const html = journeyPanelHTML(result(), 'Oakland');
    expect(html).toContain('24.0');
    expect(html).toContain('48.1');
  });

  it('reports the strict transfer radius beside the headline one', () => {
    const html = journeyPanelHTML(result(), 'Oakland');
    expect(html).toContain('150');
    expect(html).toContain('39.5');
  });

  it('warns loudly when the two transfer radii disagree about the direction', () => {
    const r = result({ sign_flips: true });
    r.radii.strict.change_min = -2.4;
    const html = journeyPanelHTML(r, 'Oakland');
    expect(html).toContain('js-flip');
  });

  it('says nothing about a flip when the two radii agree', () => {
    expect(journeyPanelHTML(result(), 'Oakland')).not.toContain('js-flip');
  });

  it('names the window the profile was taken over', () => {
    const html = journeyPanelHTML(result(), 'Oakland');
    expect(html).toContain('7:00am');
    expect(html).toContain('9:00am');
  });

  it('reports how much of the window the trip can be made at all', () => {
    const r = result();
    r.radii.headline.proposed = side({ median_min: 38.0, reachable_fraction: 0.42 });
    expect(journeyPanelHTML(r, 'Oakland')).toContain('42%');
  });

  it('quotes the constants that invented the transfers', () => {
    // Convention 14: neither feed publishes transfers, and a time quoted
    // without the numbers that built it quotes a chosen constant as a fact.
    const html = journeyPanelHTML(result(), 'Oakland');
    expect(html).toContain('400');
    expect(html).toContain('80');
  });

  it('sends a point with no bus in reach to the coverage views instead', () => {
    // The failure `one-point-cannot-represent-a-township.md` is about: "no
    // trip found" reads as the plan having taken a trip away, when what is
    // true is that nothing stops within a walk of that pin on either network.
    const r = result();
    r.radii.headline.classification = 'no_origin_coverage';
    r.radii.headline.current = side({ median_min: null, itinerary: null,
                                      origin_access_stops: 0 });
    r.radii.headline.proposed = side({ median_min: null, itinerary: null,
                                       origin_access_stops: 0 });
    r.radii.headline.change_min = null;
    const html = journeyPanelHTML(r, 'Oakland');
    expect(html.toLowerCase()).toContain('no bus');
    expect(html).toContain('Locations');
  });

  it('distinguishes a served pair the search could not connect', () => {
    const r = result();
    r.radii.headline.classification = 'no_journey';
    r.radii.headline.current = side({ median_min: null, itinerary: null });
    r.radii.headline.proposed = side({ median_min: null, itinerary: null });
    r.radii.headline.change_min = null;
    const html = journeyPanelHTML(r, 'Oakland').toLowerCase();
    expect(html).not.toContain('no bus within');
  });

  it('says it is schedule against schedule, not observed running times', () => {
    expect(journeyPanelHTML(result(), 'Oakland')).toContain('schedule');
  });
});

describe('journeyUrl', () => {
  it('carries both points and the day type', () => {
    const url = journeyUrl({ lat: 40.4406, lon: -79.9959 },
                           { lat: 40.4437, lon: -79.9589 }, 'saturday');
    expect(url).toContain('lat=40.440600');
    expect(url).toContain('dest_lon=-79.958900');
    expect(url).toContain('day=saturday');
  });
});

describe('journeyKeyHTML', () => {
  it('is a key for the two drawn trips and says which radius is drawn', () => {
    const html = journeyKeyHTML(result());
    expect(html).toContain('today');
    expect(html).toContain('proposed');
    expect(html).toContain('400');
  });
});
