import { describe, it, expect } from 'vitest';
import {
  searchRequest, stopTag, routeTag, addressTag, rows, groupOrder, nextHighlight, resultsHTML,
  easeTarget, NETWORK_TAG, SEARCH_LIMIT,
} from './search';
import { SearchResponse, SearchPlace, SearchStop, SearchRoute, SearchAddress } from './types';

const place = (over: Partial<SearchPlace> = {}): SearchPlace => ({
  key: 'carrick', name: 'Carrick', kind: 'neighbourhood',
  bbox: [-79.99, 40.39, -79.97, 40.41], ...over,
});
const stop = (over: Partial<SearchStop> = {}): SearchStop => ({
  name: 'BROWNSVILLE RD AT NOBLES LN', lat: 40.4, lon: -79.98,
  sides: ['current', 'proposed'], place: 'Carrick', ...over,
});
const route = (over: Partial<SearchRoute> = {}): SearchRoute => ({
  side: 'current', route_id: '61C', short_name: '61C', long_name: 'Murray',
  days: ['weekday', 'saturday', 'sunday'], ...over,
});
const address = (over: Partial<SearchAddress> = {}): SearchAddress => ({
  kind: 'address', label: '118 ORR AVE', place: 'Harmar township', zip: '15024',
  lat: 40.53, lon: -79.83, ...over,
});
const response = (over: Partial<SearchResponse> = {}): SearchResponse => ({
  q: 'car', places: [place()], stops: [stop()], routes: [route()], addresses: [], ...over,
});

// --------------------------------------------------------------------------
// the request
// --------------------------------------------------------------------------

describe('searchRequest', () => {
  it('POSTs the text in the body, so it never reaches the access log', () => {
    // The deployed site logs request URIs, and readers type home addresses
    // into search boxes. A GET with `?q=` would write every one of them to
    // disk on the box.
    const { url, init } = searchRequest('123 Brownsville Rd');
    expect(init.method).toBe('POST');
    expect(url).toBe('/api/search');
    expect(url).not.toContain('Brownsville');
    expect(JSON.parse(init.body as string)).toEqual({ q: '123 Brownsville Rd', limit: SEARCH_LIMIT });
  });

  it('says the body is JSON', () => {
    const { init } = searchRequest('x');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });
});

// --------------------------------------------------------------------------
// the tags
// --------------------------------------------------------------------------

describe('stopTag', () => {
  it('names both networks for a stop both have', () => {
    expect(stopTag(['current', 'proposed'])).toBe(`${NETWORK_TAG.current} · ${NETWORK_TAG.proposed}`);
  });

  it('names today alone for a stop only today has, and says nothing about loss', () => {
    // A stop only today's network has is one the plan removes OR renames,
    // and the box cannot tell which from a name; the kerb decides when it is
    // clicked. So the tag is the network, not a verdict.
    const tag = stopTag(['current']);
    expect(tag).toBe(NETWORK_TAG.current);
    expect(tag.toLowerCase()).not.toContain('removed');
  });

  it('names the plan alone for a stop only the plan has', () => {
    expect(stopTag(['proposed'])).toBe(NETWORK_TAG.proposed);
  });

  it('orders today before the plan whatever order the server sent', () => {
    expect(stopTag(['proposed', 'current'])).toBe(stopTag(['current', 'proposed']));
  });

  it('leads with the place that contains the stop, when there is one', () => {
    // PRT reuses one name at corners kilometres apart, so the place is what
    // tells two "NOBLESTOWN RD + #235" rows apart. By containment, never
    // PRT's own stop label (convention 6). Outside every boundary -- a
    // Westmoreland corner -- the tag is the networks alone.
    expect(stopTag(['current'], 'Squirrel Hill South'))
      .toBe(`Squirrel Hill South · ${NETWORK_TAG.current}`);
    expect(stopTag(['current'], null)).toBe(NETWORK_TAG.current);
  });
});

describe('routeTag', () => {
  it('says which network and the long name', () => {
    expect(routeTag(route())).toBe('today · Murray');
    expect(routeTag(route({ side: 'proposed' }))).toBe('proposed · Murray');
  });

  it('is the network alone when the feed gave no long name', () => {
    expect(routeTag(route({ long_name: '' }))).toBe('today');
  });
});

describe('addressTag', () => {
  it('names the place and zip for an address, dropping either that is null', () => {
    expect(addressTag(address())).toBe('Harmar township · 15024');
    expect(addressTag(address({ place: null }))).toBe('15024');
    expect(addressTag(address({ zip: null }))).toBe('Harmar township');
    expect(addressTag(address({ place: null, zip: null }))).toBe('');
  });

  it('tags a street as a street, not an address, and carries no zip', () => {
    // A street row is a whole street's median point, not one building, so
    // its tag says so rather than implying a specific address was found.
    expect(addressTag(address({ kind: 'street', label: 'ORR AVE', zip: null })))
      .toBe('street · Harmar township');
  });
});

// --------------------------------------------------------------------------
// the rows, flattened for the keyboard
// --------------------------------------------------------------------------

describe('rows', () => {
  it('runs places, then stops, then routes, then addresses, in the order the headings show', () => {
    const r = rows(response());
    expect(r.map((x) => x.kind)).toEqual(['place', 'stop', 'route']);
  });

  it('is empty when nothing was found', () => {
    expect(rows(response({ places: [], stops: [], routes: [], addresses: [] }))).toEqual([]);
  });

  it('leads with routes when the query starts with a digit but no house number', () => {
    // "61" is a route number to anyone typing it, and PRT's "#6130"-style
    // stop names would otherwise put two stops above the whole 61 family.
    const r = rows(response({ q: '61' }));
    expect(r.map((x) => x.kind)).toEqual(['route', 'place', 'stop']);
    expect(groupOrder('61')).toEqual(['routes', 'places', 'stops', 'addresses']);
    expect(groupOrder('p1')).toEqual(['places', 'stops', 'routes', 'addresses']);
  });

  it('leads with addresses when the query is a house number followed by a word', () => {
    // "118 orr" reads as a house number to anyone typing it, so it must beat
    // both the route-number rule (which would otherwise catch the leading
    // digit) and the plain-word rule.
    expect(groupOrder('118 orr')).toEqual(['addresses', 'routes', 'places', 'stops']);
    expect(groupOrder('118 Orr Ave')).toEqual(['addresses', 'routes', 'places', 'stops']);
  });

  it('puts a bare street name last, after places, stops and routes', () => {
    // A street with no number is not a route number and not obviously an
    // address either -- "brownsville" is a place and a dozen stops before
    // it is the name of a street, so the street row goes last.
    expect(groupOrder('brownsville')).toEqual(['places', 'stops', 'routes', 'addresses']);
  });

  it('does not treat a bare number as a house number', () => {
    // "118" alone has no street word after it, so it stays a route-number
    // query rather than jumping to addresses.
    expect(groupOrder('118')).toEqual(['routes', 'places', 'stops', 'addresses']);
  });
});

describe('nextHighlight', () => {
  it('starts at the top on ArrowDown with nothing highlighted', () => {
    expect(nextHighlight(null, 1, 3)).toBe(0);
  });

  it('starts at the bottom on ArrowUp with nothing highlighted', () => {
    expect(nextHighlight(null, -1, 3)).toBe(2);
  });

  it('wraps at either end, so the arrows never dead-end across the groups', () => {
    expect(nextHighlight(2, 1, 3)).toBe(0);
    expect(nextHighlight(0, -1, 3)).toBe(2);
  });

  it('stays at nothing when there is nothing to highlight', () => {
    expect(nextHighlight(null, 1, 0)).toBeNull();
    expect(nextHighlight(0, 1, 0)).toBeNull();
  });
});

// --------------------------------------------------------------------------
// the list
// --------------------------------------------------------------------------

describe('resultsHTML', () => {
  it('groups under four headings and shows each row\'s name and tag', () => {
    const html = resultsHTML(response({ addresses: [address()] }), null);
    expect(html).toContain('Places');
    expect(html).toContain('Stops');
    expect(html).toContain('Routes');
    expect(html).toContain('Addresses');
    expect(html).toContain('Carrick');
    expect(html).toContain('neighbourhood');
    expect(html).toContain('BROWNSVILLE RD AT NOBLES LN');
    expect(html).toContain('today · plan');
    expect(html).toContain('61C');
    expect(html).toContain('today · Murray');
    expect(html).toContain('118 ORR AVE');
    expect(html).toContain('Harmar township · 15024');
  });

  it('omits a group with no rows', () => {
    const html = resultsHTML(response({ stops: [], routes: [] }), null);
    expect(html).toContain('Places');
    expect(html).not.toContain('Stops');
    expect(html).not.toContain('Routes');
    expect(html).not.toContain('Addresses');
  });

  it('says nothing was found when all four are empty', () => {
    const html = resultsHTML(response({ places: [], stops: [], routes: [], addresses: [] }), null);
    expect(html).toContain('Nothing found');
    expect(html).not.toContain('role="option"');
  });

  it('numbers the options in row order and marks the highlighted one', () => {
    // The index is what the keyboard walks and what a click reports back,
    // so it has to be the same order `rows` returns -- across the groups,
    // not restarting at each heading.
    const html = resultsHTML(response(), 2);
    expect(html).toContain('data-idx="0"');
    expect(html).toContain('data-idx="1"');
    expect(html).toContain('data-idx="2"');
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).toContain('id="search-opt-2" role="option" aria-selected="true"');
  });

  it('escapes names, which are PRT\'s and the county\'s rather than ours', () => {
    const html = resultsHTML(response({ stops: [stop({ name: 'A <b>&</b> B' })] }), null);
    expect(html).toContain('A &lt;b&gt;&amp;&lt;/b&gt; B');
    expect(html).not.toContain('<b>&</b>');
  });
});

// --------------------------------------------------------------------------
// moving the map to a picked stop
// --------------------------------------------------------------------------

describe('easeTarget', () => {
  const inView = { zoom: 15, bounds: { west: -80, south: 40.3, east: -79.9, north: 40.5 } };
  const point = { lat: 40.4, lon: -79.95 };

  it('leaves the map alone when the stop is on screen and the map is close enough', () => {
    expect(easeTarget(inView, point)).toBeNull();
  });

  it('moves to the stop when it is off screen', () => {
    const target = easeTarget(inView, { lat: 40.6, lon: -79.95 });
    expect(target).toEqual({ lat: 40.6, lon: -79.95, zoom: 15 });
  });

  it('zooms in to a stop when the map is zoomed out to the county', () => {
    // At county zoom a stop is a pixel and the panel that opens is about a
    // kerb nobody can see; the dot has to be findable.
    const target = easeTarget({ ...inView, zoom: 12 }, point);
    expect(target).toEqual({ lat: 40.4, lon: -79.95, zoom: 15 });
  });

  it('keeps a closer zoom rather than pulling back to the minimum', () => {
    const target = easeTarget({ ...inView, zoom: 17 }, { lat: 40.6, lon: -79.95 });
    expect(target?.zoom).toBe(17);
  });
});
