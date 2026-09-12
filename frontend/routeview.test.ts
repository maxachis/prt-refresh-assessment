import { describe, it, expect } from 'vitest';
import {
  routeUrl, routeColor, toGeoJSON, routeKeyHTML, routeCardHTML, daysSentence,
  ROUTE_HIGHLIGHT,
} from './routeview';
import { RouteResult } from './types';

/** The card wraps its sentences across source lines; compare them as prose. */
const prose = (html: string) => html.replace(/\s+/g, ' ');

const result = (over: Partial<RouteResult> = {}): RouteResult => ({
  side: 'current', route_id: '61C', short_name: '61C', long_name: 'Murray',
  color: 'A0522D', day: 'weekday', days: ['weekday', 'saturday', 'sunday'],
  features: [
    { pattern_id: 1, points: [[-79.99, 40.44], [-79.98, 40.44]] },
    { pattern_id: 2, points: [[-79.98, 40.44], [-79.97, 40.45]] },
  ],
  bbox: [-79.99, 40.44, -79.97, 40.45],
  crosswalk: {
    current_route: '61C Murray', final_route: '61 Murray', category: 'Modified',
    related_routes: '61X', route_page: 'https://www.rideprt.org/blr/61',
  },
  ...over,
});

// --------------------------------------------------------------------------
// the request
// --------------------------------------------------------------------------

describe('routeUrl', () => {
  it('names the side, the route and the day', () => {
    expect(routeUrl({ side: 'proposed', route_id: '61' }, 'saturday'))
      .toBe('/api/route?side=proposed&route_id=61&day=saturday');
  });

  it('encodes a route id the feed spelled with characters a URL cannot carry bare', () => {
    expect(routeUrl({ side: 'current', route_id: 'P1 & 2' }, 'weekday'))
      .toContain('route_id=P1+%26+2');
  });
});

// --------------------------------------------------------------------------
// the colour
// --------------------------------------------------------------------------

describe('routeColor', () => {
  it('uses the feed\'s own colour, with the # GTFS leaves off', () => {
    expect(routeColor('A0522D')).toBe('#A0522D');
  });

  it('falls back to the highlight when the feed gave none', () => {
    // The plan's feed carries colours; today's may not for every route. A
    // route with no colour is still one the reader asked for by name.
    expect(routeColor(null)).toBe(ROUTE_HIGHLIGHT);
    expect(routeColor('')).toBe(ROUTE_HIGHLIGHT);
  });

  it('leaves a colour that already has its # alone', () => {
    expect(routeColor('#A0522D')).toBe('#A0522D');
  });
});

// --------------------------------------------------------------------------
// what the map draws
// --------------------------------------------------------------------------

describe('toGeoJSON', () => {
  it('draws one line per pattern, every one in the route\'s colour', () => {
    const gj = toGeoJSON(result());
    expect(gj.features).toHaveLength(2);
    expect(gj.features.map((f) => f.properties.pattern_id)).toEqual([1, 2]);
    expect(gj.features[0].properties.color).toBe('#A0522D');
    expect(gj.features[1].properties.color).toBe('#A0522D');
  });

  it('carries what the shared hover label needs: the route, its name and the side', () => {
    // The line's hover is `stoproutes.routeLineLabel`, so the properties
    // have to be the shape that function reads.
    expect(toGeoJSON(result()).features[0].properties).toMatchObject({
      side: 'current', route: '61C', name: 'Murray',
    });
  });

  it('takes the coordinates as sent, already [lon, lat]', () => {
    expect(toGeoJSON(result()).features[0].geometry.coordinates)
      .toEqual([[-79.99, 40.44], [-79.98, 40.44]]);
  });

  it('draws nothing on a day the route does not run', () => {
    expect(toGeoJSON(result({ features: [] })).features).toHaveLength(0);
  });
});

// --------------------------------------------------------------------------
// the days
// --------------------------------------------------------------------------

describe('daysSentence', () => {
  it('lists every day type when the route runs on all three', () => {
    expect(daysSentence(['weekday', 'saturday', 'sunday']))
      .toBe('Runs on weekdays, Saturdays and Sundays.');
  });

  it('names the days it does not run, so a missing line is explained', () => {
    expect(daysSentence(['weekday', 'saturday']))
      .toBe('Runs on weekdays and Saturdays; does not run on Sundays.');
    expect(daysSentence(['weekday']))
      .toBe('Runs on weekdays; does not run on Saturdays or Sundays.');
  });

  it('says so when the feed runs it on no day type at all', () => {
    expect(daysSentence([])).toBe('Does not run on any day type in this feed.');
  });
});

// --------------------------------------------------------------------------
// the key
// --------------------------------------------------------------------------

describe('routeKeyHTML', () => {
  it('names the route, the network and the day it is drawn for, and offers to clear it', () => {
    const html = routeKeyHTML(result());
    expect(html).toContain('61C');
    expect(html).toContain('Murray');
    expect(html).toContain('today');
    expect(html).toContain('a weekday');
    expect(html).toContain('data-clear-route');
  });

  it('wears the line\'s colour, since the chip is the line\'s only key', () => {
    expect(routeKeyHTML(result())).toContain('#A0522D');
  });

  it('says the route is not drawn on a day it does not run', () => {
    const html = routeKeyHTML(result({ day: 'sunday', days: ['weekday'], features: [] }));
    expect(html).toContain('does not run on a Sunday');
    expect(html).not.toContain('direction of travel');
  });

  it('says the arrows are the direction of travel when a line is drawn', () => {
    expect(routeKeyHTML(result()).toLowerCase()).toContain('direction of travel');
  });

  it('calls the plan\'s side proposed', () => {
    expect(routeKeyHTML(result({ side: 'proposed' }))).toContain('proposed');
  });
});

// --------------------------------------------------------------------------
// the card
// --------------------------------------------------------------------------

describe('routeCardHTML', () => {
  it('heads with the route and says which network', () => {
    const html = routeCardHTML(result());
    expect(html).toContain('Route 61C · Murray');
    expect(html).toContain('today');
    expect(routeCardHTML(result({ side: 'proposed' }))).toContain('the plan');
  });

  it('says which days it runs and which it does not', () => {
    const html = routeCardHTML(result({ days: ['weekday', 'saturday'] }));
    expect(html).toContain('does not run on Sundays');
  });

  it('prints PRT\'s crosswalk row as PRT wrote it, with the link in a new tab', () => {
    const html = routeCardHTML(result());
    expect(html).toContain("PRT's crosswalk: Modified · 61 Murray. Related: 61X");
    expect(html).toContain('href="https://www.rideprt.org/blr/61"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener"');
    expect(html).toContain("PRT's page for this route ↗");
  });

  it('names the counterpart on today\'s side for a route of the plan', () => {
    // The row is one row; which of its two names is the "other" route
    // depends on which side the reader is looking at.
    const html = routeCardHTML(result({ side: 'proposed', route_id: '61', short_name: '61' }));
    expect(html).toContain("PRT's crosswalk: Modified · 61C Murray");
  });

  it('leaves out an empty related-routes cell rather than printing "Related: "', () => {
    const cw = { ...result().crosswalk!, related_routes: '' };
    const html = routeCardHTML(result({ crosswalk: cw }));
    expect(html).not.toContain('Related:');
  });

  it('says when PRT has no row for the route', () => {
    const html = routeCardHTML(result({ crosswalk: null }));
    expect(html).toContain('no row');
    expect(html).not.toContain('target="_blank"');
  });

  it('carries the convention-1 caveat: this is PRT\'s labelling, not a comparison', () => {
    const html = prose(routeCardHTML(result()));
    expect(html).toContain("PRT's own labelling");
    expect(html).toContain('not a comparison');
    expect(html).toContain('click a stop on it');
  });

  it('says the line is drawing only and buses only', () => {
    const html = prose(routeCardHTML(result()));
    expect(html).toContain('for drawing only');
    expect(html).toContain('buses only');
  });

  it('says why nothing is drawn on a day the route does not run', () => {
    const html = prose(routeCardHTML(result({ day: 'sunday', days: ['weekday'], features: [] })));
    expect(html).toContain('nothing is drawn');
  });

  it('escapes the crosswalk, which is PRT\'s text and not ours', () => {
    const cw = { ...result().crosswalk!, category: 'A <b>&</b> B' };
    const html = routeCardHTML(result({ crosswalk: cw }));
    expect(html).toContain('A &lt;b&gt;&amp;&lt;/b&gt; B');
  });
});
