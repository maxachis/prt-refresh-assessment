import { describe, it, expect } from 'vitest';
import {
  STATUS_COLOR, STATUS_LABEL, STATUS_ORDER, RESHAPED_COLOR, DIM_OPACITY,
  isRouteKey, mappingLabel, sideLabel, signedPct, statusCounts,
  toOverviewGeoJSON, toSelectedGeoJSON, routeGroupBounds, CASING_WIDTH, SELECTED_WIDTH,
  routeListHTML, routeCardHTML, routeKeyHTML, routeTooltipHTML,
  ROUTE_CHANGES_CAVEAT, ROUTE_BUCKETS, BUCKET_STATUSES, DEFAULT_HIDDEN_BUCKETS,
  isRouteBucket, normaliseBuckets, bucketFilter,
  SERVICE_BUCKETS, SERVICE_LABEL, SERVICE_WIDTH, isServiceBucket, serviceFilter,
  DEFAULT_ROUTE_READING, isRouteReading,
} from './routechange';
import { STYLE } from './change';
import { GONE_COLOR, NEW_COLOR } from './surface';
import { KEPT_COLOR } from './corridor';
import { NOW_COLOR, PROP_COLOR } from './journey';
import {
  RouteGroup, RouteGroupDetail, RouteChangeFeature, RouteChangesResult,
  RouteDayService,
} from './types';

function service(overrides: Partial<RouteDayService> = {}): RouteDayService {
  return {
    cur_trips: 210, prop_trips: 188, cur_hours: 160.7, prop_hours: 164.0,
    pct_trips: -10.5, pct_hours: 2.1, bucket: 'less',
    ...overrides,
  };
}

function group(overrides: Partial<RouteGroup> = {}): RouteGroup {
  return {
    key: 'c:51',
    rank: 1,
    status: 'split',
    current: [{ route: '51', name: 'CARRICK' }],
    proposed: [{ route: '51', name: 'Carrick' }, { route: '51S', name: 'Carrick Short' }],
    riders_weekday: 6012.9,
    service: { weekday: service(), saturday: service(), sunday: service() },
    prt: [{
      current_route: '51', final_route: '51 Carrick', category: 'Modified',
      related_routes: '51S Carrick Short', route_page: 'https://example.test/51',
    }],
    shown: 'proposed',
    ...overrides,
  };
}

const DISCONTINUED = group({
  key: 'c:2', rank: 40, status: 'discontinued',
  current: [{ route: '2', name: 'Mount Royal' }], proposed: [],
  riders_weekday: 412,
  service: {
    weekday: service({ prop_trips: 0, prop_hours: 0, pct_trips: -100, pct_hours: -100, bucket: 'gone' }),
    saturday: service({ cur_trips: 0, cur_hours: 0, prop_trips: 0, prop_hours: 0,
                        pct_trips: null, pct_hours: null, bucket: 'none' }),
    sunday: service({ prop_trips: 0, prop_hours: 0, pct_trips: -100, pct_hours: -100, bucket: 'gone' }),
  },
  prt: [{ current_route: '2', final_route: '-', category: 'Discontinued',
          related_routes: '', route_page: '' }],
  shown: 'current',
});

const NEW = group({
  key: 'p:45', rank: 30, status: 'new',
  current: [], proposed: [{ route: '45', name: 'Carrick-Oakland-East Liberty' }],
  riders_weekday: 0,
  service: {
    weekday: service({ cur_trips: 0, cur_hours: 0, prop_trips: 70, prop_hours: 55.2,
                       pct_trips: null, pct_hours: null, bucket: 'new' }),
    saturday: service({ cur_trips: 0, cur_hours: 0, pct_trips: null, pct_hours: null, bucket: 'new' }),
    sunday: service({ cur_trips: 0, cur_hours: 0, pct_trips: null, pct_hours: null, bucket: 'new' }),
  },
  prt: [],
});

const MERGED = group({
  key: 'c:77-86', rank: 12, status: 'merged',
  current: [{ route: '77', name: 'PENN HILLS' }, { route: '86', name: 'LIBERTY' }],
  proposed: [{ route: '86', name: 'Liberty' }],
});

const KEPT = group({
  key: 'c:61C', rank: 3, status: 'one-to-one',
  current: [{ route: '61C', name: 'MCKEESPORT-HOMESTEAD' }],
  proposed: [{ route: '61C', name: 'McKeesport-Homestead' }],
  service: {
    weekday: service({ prop_trips: 210, pct_trips: 0, pct_hours: 0.4, bucket: 'same' }),
    saturday: service(),
    sunday: service({ pct_trips: null, cur_trips: 0, cur_hours: 0 }),
  },
});

const GROUPS = [group(), KEPT, MERGED, NEW, DISCONTINUED];

function feature(overrides: Partial<RouteChangeFeature> = {}): RouteChangeFeature {
  return {
    key: 'c:51', side: 'proposed', route: '51', name: 'Carrick', status: 'split',
    pattern_id: 12, points: [[-79.99, 40.40], [-79.98, 40.41]],
    ...overrides,
  };
}

describe('the status palette', () => {
  it('reuses the site\'s colours for gone, new and kept', () => {
    expect(STATUS_COLOR.discontinued).toBe(GONE_COLOR);
    expect(STATUS_COLOR.new).toBe(NEW_COLOR);
    expect(STATUS_COLOR['one-to-one']).toBe(KEPT_COLOR);
  });

  it('gives split and merged one shared colour, distinct from every other line colour', () => {
    expect(STATUS_COLOR.split).toBe(RESHAPED_COLOR);
    expect(STATUS_COLOR.merged).toBe(RESHAPED_COLOR);
    for (const other of [GONE_COLOR, NEW_COLOR, KEPT_COLOR, NOW_COLOR, PROP_COLOR]) {
      expect(RESHAPED_COLOR.toLowerCase()).not.toBe(other.toLowerCase());
    }
  });

  it('orders the directory with what changed first and one-to-one last', () => {
    expect(STATUS_ORDER[0]).toBe('discontinued');
    expect(STATUS_ORDER[STATUS_ORDER.length - 1]).toBe('one-to-one');
    expect(STATUS_ORDER).toHaveLength(5);
    expect(Object.keys(STATUS_LABEL).sort()).toEqual([...STATUS_ORDER].sort());
  });

  it('dims rather than hides the unselected lines', () => {
    expect(DIM_OPACITY).toBeGreaterThan(0);
    expect(DIM_OPACITY).toBeLessThan(0.25);
  });
});

describe('isRouteKey', () => {
  it('accepts the two spellings the API uses', () => {
    for (const k of ['c:51', 'c:77-86', 'p:45', 'p:89-89S', 'c:61C']) {
      expect(isRouteKey(k)).toBe(true);
    }
  });

  it('rejects anything else, so a hand-edited link cannot reach the fetch', () => {
    for (const k of ['51', 'x:51', 'c:', 'c:51/..', 'c:51 52', `c:${'a'.repeat(65)}`]) {
      expect(isRouteKey(k)).toBe(false);
    }
  });
});

describe('mappingLabel', () => {
  it('names both sides of a split, in full', () => {
    expect(mappingLabel(group())).toBe('51 CARRICK → 51 Carrick, 51S Carrick Short');
  });

  it('can name the far side by number alone, for a directory row', () => {
    expect(mappingLabel(group(), { farSideNamed: false })).toBe('51 CARRICK → 51, 51S');
    expect(mappingLabel(MERGED, { farSideNamed: false })).toBe('77 PENN HILLS, 86 LIBERTY → 86');
  });

  it('names a discontinued or new group by its one side alone, with no arrow to nowhere', () => {
    // The status says which side it is; "→ —" said it twice and read as a
    // rendering fault (Max's call).
    expect(mappingLabel(DISCONTINUED)).toBe('2 Mount Royal');
    expect(mappingLabel(NEW)).toBe('45 Carrick-Oakland-East Liberty');
  });

  it('keeps a new route\'s name even in the short form -- it is the only side there is', () => {
    expect(mappingLabel(NEW, { farSideNamed: false }))
      .toBe('45 Carrick-Oakland-East Liberty');
  });

  it('names one side on its own', () => {
    expect(sideLabel(group().proposed)).toBe('51 Carrick, 51S Carrick Short');
    expect(sideLabel([])).toBe('—');
  });
});

describe('signedPct', () => {
  it('signs both directions, with a real minus sign', () => {
    expect(signedPct(-10.5)).toBe('−10%');
    expect(signedPct(2.1)).toBe('+2%');
    expect(signedPct(0)).toBe('0%');
  });

  it('draws a dash where there was nothing to divide by', () => {
    expect(signedPct(null)).toBe('—');
  });
});

describe('statusCounts', () => {
  it('counts every status, zero included', () => {
    expect(statusCounts(GROUPS)).toEqual({
      discontinued: 1, new: 1, split: 1, merged: 1, 'one-to-one': 1,
    });
    expect(statusCounts([])).toEqual({
      discontinued: 0, new: 0, split: 0, merged: 0, 'one-to-one': 0,
    });
  });
});

describe('toOverviewGeoJSON', () => {
  const result: RouteChangesResult = {
    day: 'weekday',
    groups: GROUPS,
    features: [
      feature(),
      feature({ key: 'c:61C', route: '61C', name: 'McKeesport-Homestead',
                status: 'one-to-one', pattern_id: 3 }),
      feature({ key: 'c:2', side: 'current', route: '2', name: 'Mount Royal',
                status: 'discontinued', pattern_id: 7 }),
    ],
  };

  it('draws one line per pattern, coloured by status', () => {
    const gj = toOverviewGeoJSON(result);
    expect(gj.features).toHaveLength(3);
    const byKey = new Map(gj.features.map((f) => [f.properties.key, f]));
    expect(byKey.get('c:51')!.properties.color).toBe(RESHAPED_COLOR);
    expect(byKey.get('c:61C')!.properties.color).toBe(KEPT_COLOR);
    expect(byKey.get('c:2')!.properties.color).toBe(GONE_COLOR);
    expect(byKey.get('c:51')!.geometry.coordinates).toEqual([[-79.99, 40.40], [-79.98, 40.41]]);
  });

  it('puts the one-to-one grey underneath everything coloured', () => {
    // Both by feature order and by sort key, so a status that changes colour
    // never ends up drawn over the change it is the background to.
    const gj = toOverviewGeoJSON(result);
    expect(gj.features[0].properties.status).toBe('one-to-one');
    expect(gj.features[0].properties.sort).toBe(0);
    for (const f of gj.features.slice(1)) expect(f.properties.sort).toBe(1);
  });

  it('carries the day\'s service bucket, its colour and its width, joined from the group', () => {
    // The colour is the dots' own for that bucket, and the width runs
    // symmetric about "about the same" the way the dot sizes do, so a gain
    // is drawn as loudly as a loss.
    const byKey = new Map(toOverviewGeoJSON(result).features.map((f) => [f.properties.key, f.properties]));
    expect(byKey.get('c:51')!.bucket).toBe('less');
    expect(byKey.get('c:51')!.scolor).toBe(STYLE.less.color);
    expect(byKey.get('c:51')!.sw).toBe(SERVICE_WIDTH.less);
    expect(byKey.get('c:51')!.pct).toBe(-10.5);
    expect(byKey.get('c:2')!.bucket).toBe('gone');
    expect(byKey.get('c:2')!.scolor).toBe(STYLE.gone.color);
    expect(byKey.get('c:2')!.pct).toBe(-100);
    expect(byKey.get('c:61C')!.bucket).toBe('same');
    expect(byKey.get('c:61C')!.sw).toBe(SERVICE_WIDTH.same);
  });

  it('reads the bucket for the day the overview was drawn for', () => {
    const sunday = toOverviewGeoJSON({ ...result, day: 'sunday' });
    expect(sunday.features.find((f) => f.properties.key === 'c:61C')!.properties.bucket).toBe('less');
  });

  it('carries what the hover and the click need', () => {
    const p = toOverviewGeoJSON(result).features.find((f) => f.properties.key === 'c:51')!.properties;
    expect(p).toMatchObject({ key: 'c:51', side: 'proposed', route: '51',
                              name: 'Carrick', status: 'split', pattern_id: 12 });
  });
});

describe('toSelectedGeoJSON', () => {
  const detail: RouteGroupDetail = {
    ...group(),
    day: 'weekday',
    features: [
      feature({ side: 'proposed', route: '51S', name: 'Carrick Short', pattern_id: 13 }),
      feature({ side: 'current', route: '51', name: 'CARRICK', pattern_id: 2 }),
      feature({ side: 'proposed', route: '51', pattern_id: 12 }),
    ],
  };

  it('colours today\'s side and the plan\'s in the site\'s own pair', () => {
    const gj = toSelectedGeoJSON(detail);
    for (const f of gj.features) {
      expect(f.properties.color).toBe(f.properties.side === 'current' ? NOW_COLOR : PROP_COLOR);
    }
  });

  it('draws today underneath the plan', () => {
    const gj = toSelectedGeoJSON(detail);
    expect(gj.features[0].properties.side).toBe('current');
    expect(gj.features[0].properties.sort).toBe(0);
    expect(gj.features.slice(1).every((f) => f.properties.sort === 1)).toBe(true);
  });

  it('draws today wider, so a shared street shows it as a casing rather than hiding it', () => {
    const gj = toSelectedGeoJSON(detail);
    for (const f of gj.features) {
      expect(f.properties.w).toBe(f.properties.side === 'current' ? CASING_WIDTH : SELECTED_WIDTH);
    }
  });

  it('gives the overview one width everywhere', () => {
    const gj = toOverviewGeoJSON({ day: 'weekday', groups: [group()], features: detail.features });
    expect(gj.features.every((f) => f.properties.w === 1)).toBe(true);
  });
});

describe('routeGroupBounds', () => {
  it('spans every point of every pattern', () => {
    const bounds = routeGroupBounds([
      feature({ points: [[-80.0, 40.40], [-79.98, 40.41]] }),
      feature({ points: [[-79.97, 40.39], [-79.99, 40.42]] }),
    ]);
    expect(bounds).toEqual([[-80.0, 40.39], [-79.97, 40.42]]);
  });

  it('is null with nothing drawn, so nothing tries to fit an empty box', () => {
    expect(routeGroupBounds([])).toBeNull();
    expect(routeGroupBounds([feature({ points: [] })])).toBeNull();
  });
});

describe('route buckets', () => {
  it('are the key\'s four rows, covering every status exactly once', () => {
    expect(ROUTE_BUCKETS).toEqual(['discontinued', 'new', 'reshaped', 'one-to-one']);
    const covered = ROUTE_BUCKETS.flatMap((b) => BUCKET_STATUSES[b]).sort();
    expect(covered).toEqual([...STATUS_ORDER].sort());
    expect(BUCKET_STATUSES.reshaped).toEqual(['split', 'merged']);
  });

  it('start with only the one-to-one grey hidden', () => {
    expect(DEFAULT_HIDDEN_BUCKETS).toEqual(['one-to-one']);
  });

  it('recognise a bucket name and nothing else', () => {
    expect(isRouteBucket('reshaped')).toBe(true);
    expect(isRouteBucket('split')).toBe(false);
    expect(isRouteBucket('')).toBe(false);
  });

  it('normalise a list into key order without repeats', () => {
    expect(normaliseBuckets(['one-to-one', 'new', 'new'])).toEqual(['new', 'one-to-one']);
    expect(normaliseBuckets([])).toEqual([]);
  });
});

describe('the service reading', () => {
  it('starts on what happened, and knows its two readings', () => {
    expect(DEFAULT_ROUTE_READING).toBe('status');
    expect(isRouteReading('service')).toBe(true);
    expect(isRouteReading('status')).toBe(true);
    expect(isRouteReading('trips')).toBe(false);
  });

  it('uses the site\'s buckets in the site\'s order, with the site\'s words', () => {
    expect(SERVICE_BUCKETS).toEqual(['gone', 'halved', 'less', 'same', 'more', 'doubled', 'new']);
    expect(SERVICE_LABEL.gone).toBe('loses all service');
    expect(SERVICE_LABEL.same).toBe('about the same');
    expect(SERVICE_LABEL.doubled).toBe('doubled or better');
    for (const b of SERVICE_BUCKETS) expect(STYLE[b]).toBeDefined();
    expect(isServiceBucket('halved')).toBe(true);
    expect(isServiceBucket('none')).toBe(false);
  });

  it('draws gains as wide as losses, and the unchanged narrowest', () => {
    expect(SERVICE_WIDTH.gone).toBe(SERVICE_WIDTH.new);
    expect(SERVICE_WIDTH.halved).toBe(SERVICE_WIDTH.doubled);
    expect(SERVICE_WIDTH.less).toBe(SERVICE_WIDTH.more);
    expect(SERVICE_WIDTH.same).toBeLessThan(SERVICE_WIDTH.less);
    expect(SERVICE_WIDTH.less).toBeLessThan(SERVICE_WIDTH.halved);
    expect(SERVICE_WIDTH.halved).toBeLessThan(SERVICE_WIDTH.gone);
  });

  it('filters the overview by bucket, and by nothing when every row is on', () => {
    expect(serviceFilter(['same', 'less']))
      .toEqual(['!', ['in', ['get', 'bucket'], ['literal', ['same', 'less']]]]);
    expect(serviceFilter([])).toBeNull();
  });
});

describe('bucketFilter', () => {
  it('drops the statuses of every hidden bucket, and nothing when none is hidden', () => {
    expect(bucketFilter(['one-to-one']))
      .toEqual(['!', ['in', ['get', 'status'], ['literal', ['one-to-one']]]]);
    expect(bucketFilter(['reshaped', 'new']))
      .toEqual(['!', ['in', ['get', 'status'], ['literal', ['split', 'merged', 'new']]]]);
    expect(bucketFilter([])).toBeNull();
  });
});

describe('routeListHTML', () => {
  const html = routeListHTML(GROUPS, null);

  it('groups the directory under headings with counts, changed things first', () => {
    const iDisc = html.indexOf('Discontinued (1)');
    const iNew = html.indexOf('New (1)');
    const iSplit = html.indexOf('Split or merged (2)');
    const iKept = html.indexOf('One-to-one (1)');
    expect(iDisc).toBeGreaterThan(-1);
    expect(iNew).toBeGreaterThan(iDisc);
    expect(iSplit).toBeGreaterThan(iNew);
    expect(iKept).toBeGreaterThan(iSplit);
  });

  it('folds the one-to-one routes into a closed details, so the list opens on what changed', () => {
    const details = html.slice(html.indexOf('<details'));
    expect(details).not.toMatch(/<details[^>]*\bopen\b/);
    expect(details).toContain('One-to-one (1)');
    expect(details).toContain('data-select-route="c:61C"');
    // And nothing that changed is inside it.
    expect(details).not.toContain('data-select-route="c:51"');
  });

  it('gives every row its key, so a click can select it', () => {
    for (const g of GROUPS) expect(html).toContain(`data-select-route="${g.key}"`);
  });

  it('writes each row as a mapping to the other side, and the weekday trips change', () => {
    expect(html).toContain('51 CARRICK → 51, 51S');
    expect(html).toContain('2 Mount Royal');
    expect(html).toContain('45 Carrick-Oakland-East Liberty');
    expect(html).not.toContain('→ —');
    expect(html).not.toContain('— →');
    expect(html).toContain('−10%');
  });

  it('colours each row\'s name by its status, so the panel reads in the key\'s colours', () => {
    expect(html).toMatch(/class="rc-map discontinued"[^>]*>2 Mount Royal/);
    expect(html).toMatch(/class="rc-map new"[^>]*>45 Carrick/);
    expect(html).toMatch(/class="rc-map split"[^>]*>51 CARRICK/);
    expect(html).toMatch(/class="rc-map merged"[^>]*>77 PENN HILLS/);
    // One-to-one is the uncoloured section: it is not one of the three the
    // map colours, and grey text on the dark panel would read as disabled.
    expect(html).toMatch(/class="rc-map"[^>]*>61C/);
  });

  it('draws a dash, not 0%, where the weekday change is undefined', () => {
    const sundayNull = group({ key: 'c:99', status: 'one-to-one',
      service: { ...group().service, weekday: service({ pct_trips: null }) } });
    const row = routeListHTML([sundayNull], null);
    expect(row).toContain('data-select-route="c:99"');
    expect(row).toMatch(/rc-pct[^>]*>—</);
  });

  it('regroups under the service buckets for the day when asked, in the key\'s colours', () => {
    const svc = routeListHTML(GROUPS, null, { reading: 'service', day: 'weekday' });
    const iLess = svc.indexOf('Less service (2)');
    const iSame = svc.indexOf('About the same (1)');
    const iGone = svc.indexOf('Loses all service (1)');
    const iNew = svc.indexOf('New service (1)');
    expect(iGone).toBeGreaterThan(-1);
    expect(iLess).toBeGreaterThan(iGone);
    expect(iSame).toBeGreaterThan(iLess);
    expect(iNew).toBeGreaterThan(iSame);
    expect(svc).not.toContain('Discontinued (');
    expect(svc).not.toContain('<details');
    expect(svc).toContain('weekday trips');
    expect(svc).toMatch(new RegExp(`style="color:${STYLE.less.color}"[^>]*>51 CARRICK`));
    expect(svc).toMatch(new RegExp(`style="color:${STYLE.gone.color}"[^>]*>2 Mount Royal`));
  });

  it('follows the day in the service reading, so a Sunday regroups the same groups', () => {
    const sunday = routeListHTML(GROUPS, null, { reading: 'service', day: 'sunday' });
    expect(sunday).toContain('Less service (3)');
    expect(sunday).toContain('Sunday trips');
    expect(sunday).not.toContain('About the same (');
  });

  it('leaves out a bucket no group falls in, and names the ones that run on neither network', () => {
    const sat = routeListHTML([DISCONTINUED, NEW], null, { reading: 'service', day: 'saturday' });
    expect(sat).not.toContain('Loses all service (');
    expect(sat).toContain('New service (1)');
    expect(sat).toMatch(/1 group runs on neither network on a Saturday/);
  });

  it('leaves the change off a group with only one side -- there is nothing to compare', () => {
    const one = routeListHTML([NEW, DISCONTINUED], null);
    expect(one).not.toContain('−100%');
    expect(one).not.toMatch(/rc-pct/);
  });

  it('marks the selected row', () => {
    expect(routeListHTML(GROUPS, 'c:51')).toMatch(/class="rc-row selected"[^>]*data-select-route="c:51"/);
    expect(html).not.toContain('selected');
  });

  it('says what a group is, and links the caveat, above the headings', () => {
    expect(html).toContain(`data-caveat="${ROUTE_CHANGES_CAVEAT}"`);
    expect(html.indexOf('not a corridor')).toBeLessThan(html.indexOf('Discontinued (1)'));
  });

  it('escapes what PRT named a route', () => {
    const nasty = group({ key: 'c:9', current: [{ route: '9', name: '<b>PERRY</b>' }] });
    expect(routeListHTML([nasty], null)).not.toContain('<b>PERRY</b>');
    expect(routeListHTML([nasty], null)).toContain('&lt;b&gt;PERRY&lt;/b&gt;');
  });
});

describe('routeCardHTML', () => {
  const detail: RouteGroupDetail = { ...group(), day: 'weekday', features: [feature()] };
  const html = routeCardHTML(detail);

  it('leads with the mapping and a status pill, and a way back to the directory', () => {
    expect(html).toContain('51 CARRICK → 51 Carrick, 51S Carrick Short');
    expect(html).toMatch(/class="rc-status split"[^>]*>split</);
    expect(html).toContain('data-select-route=""');
    expect(html).toContain('All routes');
  });

  it('tabulates all three days: trips and revenue hours, today → plan, signed', () => {
    for (const day of ['weekday', 'saturday', 'sunday']) expect(html).toContain(`>${day}<`);
    expect(html).toContain('>210<');
    expect(html).toContain('>188<');
    expect(html).toContain('>160.7<');
    expect(html).toContain('>164.0<');
    expect(html).toContain('>−10%<');
    expect(html).toContain('>+2%<');
  });

  it('prints a dash for an undefined percent', () => {
    expect(routeCardHTML({ ...NEW, features: [], day: 'weekday' })).toMatch(/>—</);
  });

  it('gives the weekday riders with their source, and omits them for a new group', () => {
    expect(html).toContain('6,013');
    expect(html).toContain('WPRDC route ridership, average weekday');
    const fresh = routeCardHTML({ ...NEW, features: [], day: 'weekday' });
    expect(fresh).not.toContain('WPRDC');
  });

  it('says what revenue hours are not', () => {
    expect(html).toContain('Revenue hours are in-service time only, not a cost figure.');
  });

  it('reports PRT\'s own account: category, where it points riders, and a link out', () => {
    expect(html).toContain('Modified');
    expect(html).toContain('PRT points riders to: 51S Carrick Short');
    expect(html).toMatch(/<a [^>]*href="https:\/\/example\.test\/51"[^>]*target="_blank"[^>]*rel="noopener"/);
  });

  it('says when PRT\'s table has no row for the group', () => {
    const fresh = routeCardHTML({ ...NEW, features: [], day: 'weekday' });
    expect(fresh).toMatch(/PRT.s table has no row/);
    expect(fresh).not.toContain('PRT points riders to');
  });

  it('skips the pointer and the link where PRT left them blank', () => {
    const gone = routeCardHTML({ ...DISCONTINUED, features: [], day: 'weekday' });
    expect(gone).toContain('Discontinued');
    expect(gone).not.toContain('PRT points riders to');
    expect(gone).not.toContain('<a ');
  });

  it('carries the caveat, naming the Carrick case and the views that measure access', () => {
    expect(html).toContain(`data-caveat="${ROUTE_CHANGES_CAVEAT}"`);
    expect(html).toContain('not a corridor');
    expect(html).toContain('45');
  });

  it('escapes PRT\'s strings everywhere', () => {
    const nasty: RouteGroupDetail = {
      ...group({
        current: [{ route: '51', name: '<i>x</i>' }],
        prt: [{ current_route: '51', final_route: '51', category: '<u>Mod</u>',
                related_routes: '<s>r</s>', route_page: 'https://e.test/?a=1&b="2"' }],
      }),
      day: 'weekday',
      features: [],
    };
    const out = routeCardHTML(nasty);
    expect(out).not.toContain('<i>x</i>');
    expect(out).not.toContain('<u>Mod</u>');
    expect(out).not.toContain('<s>r</s>');
    expect(out).toContain('href="https://e.test/?a=1&amp;b=&quot;2&quot;"');
  });
});

describe('routeKeyHTML', () => {
  const nothing = routeKeyHTML({ groups: GROUPS, day: 'weekday', hidden: ['one-to-one'], serviceHidden: [], reading: 'status', selected: null });

  it('opens with a summary sentence that stands alone when the key is folded', () => {
    expect(nothing).toContain(
      '5 route groups · 1 discontinued · 1 new · 2 split or merged · a weekday');
  });

  it('keys a swatch per bucket with its count', () => {
    expect(nothing).toContain(`background:${GONE_COLOR}`);
    expect(nothing).toContain(`background:${NEW_COLOR}`);
    expect(nothing).toContain(`background:${RESHAPED_COLOR}`);
    expect(nothing).toContain(`background:${KEPT_COLOR}`);
    expect(routeKeyHTML({ groups: GROUPS, day: 'saturday', hidden: [], serviceHidden: [], reading: 'status', selected: null }))
      .toContain('a Saturday');
  });

  it('makes every row a toggle, pressed while its lines are drawn, like the dots key', () => {
    for (const b of ROUTE_BUCKETS) {
      expect(nothing).toMatch(new RegExp(`<button class="lg-row[^"]*" data-route-bucket="${b}"`));
    }
    expect(nothing).toMatch(/class="lg-row off" data-route-bucket="one-to-one"\s+aria-pressed="false"/);
    expect(nothing).toMatch(/class="lg-row " data-route-bucket="new"\s+aria-pressed="true"/);
    const grey = routeKeyHTML({ groups: GROUPS, day: 'weekday', hidden: ['new'], serviceHidden: [], reading: 'status', selected: null });
    expect(grey).toMatch(/class="lg-row " data-route-bucket="one-to-one"/);
    expect(grey).toMatch(/class="lg-row off" data-route-bucket="new"/);
  });

  it('offers the two readings as a switch, pressed on the current one', () => {
    expect(nothing).toMatch(/data-route-reading="status"\s+aria-pressed="true"/);
    expect(nothing).toMatch(/data-route-reading="service"\s+aria-pressed="false"/);
  });

  it('keys the service buckets with counts for the day, in the dots\' colours, toggles like the status rows', () => {
    const svc = routeKeyHTML({
      groups: GROUPS, day: 'weekday', hidden: ['one-to-one'], serviceHidden: ['same'],
      reading: 'service', selected: null,
    });
    expect(svc).toContain('5 route groups · 3 fewer trips · 1 about the same · 1 more · a weekday');
    expect(svc).toMatch(/data-route-service="less"\s+aria-pressed="true"/);
    expect(svc).toMatch(/class="lg-row off" data-route-service="same"/);
    expect(svc).toContain(`background:${STYLE.less.color}`);
    expect(svc).toContain(`background:${STYLE.gone.color}`);
    expect(svc).not.toContain('data-route-service="halved"');
    expect(svc).not.toContain('data-route-bucket=');
    expect(svc).not.toContain(`background:${RESHAPED_COLOR}`);
    expect(svc).toContain('±10%');
    expect(svc).toContain('not a corridor');
  });

  it('switches to the two alignment swatches once a group is selected, because blue changes meaning', () => {
    const detail: RouteGroupDetail = { ...group(), day: 'weekday', features: [feature()] };
    const selected = routeKeyHTML({ groups: GROUPS, day: 'weekday', hidden: ['one-to-one'], serviceHidden: [], reading: 'service', selected: detail });
    expect(selected).toContain('51 CARRICK → 51 Carrick, 51S Carrick Short');
    expect(selected).toContain(`background:${NOW_COLOR}`);
    expect(selected).toContain("today's alignment");
    expect(selected).toContain(`background:${PROP_COLOR}`);
    expect(selected).toContain('proposed alignment');
    expect(selected).not.toContain(`background:${RESHAPED_COLOR}`);
  });

  it('has something to say before the layer arrives', () => {
    expect(routeKeyHTML({ groups: null, day: 'weekday', hidden: ['one-to-one'], serviceHidden: [], reading: 'status', selected: null }))
      .toContain('Route changes');
  });
});

describe('routeTooltipHTML', () => {
  const props = { key: 'c:51', side: 'proposed' as const, route: '51', name: 'Carrick',
                  status: 'split' as const, pattern_id: 12, color: RESHAPED_COLOR, sort: 1 as const, w: 1,
                  bucket: 'less' as const, scolor: STYLE.less.color, sw: SERVICE_WIDTH.less, pct: -10.5 };

  it('names the route, the network and the status', () => {
    const html = routeTooltipHTML(props, { selected: false });
    expect(html).toContain('51 Carrick');
    expect(html).toContain('proposed');
    expect(html).toContain('split');
    expect(html).toMatch(/<b>51 Carrick<\/b>/);
  });

  it('adds the trips change in the service reading, where the colour is asking about it', () => {
    const html = routeTooltipHTML(props, { selected: false, reading: 'service' });
    expect(html).toContain('−10% trips');
    expect(html).toContain('less service');
    expect(routeTooltipHTML(props, { selected: false, reading: 'status' })).not.toContain('trips');
    // A new route has no percent, so it says so rather than printing a dash.
    const fresh = routeTooltipHTML({ ...props, bucket: 'new', pct: null, status: 'new' },
                                   { selected: false, reading: 'service' });
    expect(fresh).toContain('new service');
    expect(fresh).not.toContain('—');
  });

  it('says today for the current side', () => {
    const html = routeTooltipHTML({ ...props, side: 'current', status: 'discontinued',
                                    route: '2', name: 'Mount Royal' }, { selected: false });
    expect(html).toContain('2 Mount Royal');
    expect(html).toContain('today');
    expect(html).toContain('discontinued');
  });

  it('puts the weight on the network once a group is selected', () => {
    expect(routeTooltipHTML(props, { selected: true })).toMatch(/<b>proposed<\/b>/);
  });

  it('escapes the name', () => {
    expect(routeTooltipHTML({ ...props, name: '<x>' }, { selected: false })).not.toContain('<x>');
  });
});
