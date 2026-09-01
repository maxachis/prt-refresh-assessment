/**
 * The Places view — the answer panel's population line, given a screen of its own.
 *
 * Every other view answers "what changes here?" at a point or over a walk
 * radius. This one answers a question with a different unit entirely: how
 * many of a *named place's own residents* lose every bus, county-wide,
 * ranked. It exists because the panel already prints that figure under a
 * walk circle that measures something else, and at Squirrel Hill South the
 * two disagree — the circle triples its service while 259 people on Beechwood
 * Boulevard lose every bus. See
 * `docs/worklog/the-place-number-has-no-view-of-its-own.md`.
 *
 * Three decisions worth keeping.
 *
 *  - THE RANK HAS TWO ORDERS, AND BOTH ARE TRUE. By count, twelve places carry
 *    70.2% of everyone who loses every bus, led by Baldwin borough at 7,985.
 *    By share, small boroughs and townships a count-ranked list buries lead
 *    instead — Reserve township is tenth by count and loses 85% of its
 *    residents. Neither order is the "right" one, so both are a click away
 *    rather than the app picking one and hiding the other (`sortPlaces`).
 *  - THE MAP DRAWS A FILLED BOUNDARY AND POINTS, AT DIFFERENT UNITS. This repo
 *    now carries real place geometry (`ingest_boundaries.py`, `/api/boundaries`),
 *    so every named place fills with a colour under `initPlacesLayer`'s
 *    `places-fill` layer. It is coloured by SHARE_LOST, not by count of
 *    residents lost — a raw residents-lost choropleth would just draw
 *    population density, which is exactly the failure the denominator work in
 *    `analyze_equity_places.place_totals` exists to avoid (`shareOpacity`).
 *    The changed block groups still draw as points on top of the fill, per
 *    convention 10's "never quote one alone": the fill says "this whole place
 *    lost 40% of its residents' bus service", the points say "and here is
 *    where inside it", and neither view replaces the other.
 *  - THE RESIDUAL IS GONE, BECAUSE THE BOUNDARY REPLACES THE LABEL RADIUS. An
 *    earlier version of this view named a block group after whichever
 *    labelled PRT stop was nearest, which left 151 residents beyond 2 km of
 *    any stop unnamed. Places are now assigned by boundary containment, so
 *    every one of the county's 1,238,177 residents is inside some named
 *    place, changed by the plan or not — see `SCOPE_NOTE`.
 */
import {
  PlaceSummary, PlaceChangedBlockGroup, PlaceDetail, BoundariesGeoJSON,
  PlaceBoundaryProperties, Day,
} from './types';
import { fetchJSON, esc } from './utils';
import { GONE_COLOR, NEW_COLOR } from './surface';

const SRC = 'places';
const LAYER = 'places-points';
const BOUNDARY_SRC = 'places-boundaries';
export const BOUNDARY_LAYER = 'places-fill';

export type PlaceSort = 'count' | 'share';

/**
 * Which reading the choropleth is painting: residents who lose all buses,
 * residents who gain one, or the place's own bus trips, signed.
 *
 * DESIGN CONSTRAINT ON THE FIRST TWO: 'lost' and 'gained' are separate
 * readings shown one at a time, NEVER a diverging net map. A place can lose
 * and gain heavily at once -- Ross township loses 6,119 residents' service
 * and gains 1,952 -- and subtracting them would draw Ross as mildly negative
 * while hiding that thousands of people on both sides had service replaced
 * rather than kept. Convention 10's "never quote one alone" applies inside a
 * single view: a reader switches between the two full readings, and never
 * sees a net that exists in neither one.
 *
 * 'service' is a genuinely different measurement, not a third instance of
 * that trap: it is a place's own bus trip COUNT, today against proposed, and
 * a percent change of a single count is a real signed quantity with nothing
 * being netted against anything else -- so it is the one reading here drawn
 * as a diverging red/blue ramp (`SERVICE_BANDS`) rather than a single-colour
 * share ramp. It is also the one reading that moves with the toolbar's day
 * switch: convention 16's population figures are day-free and county-wide,
 * but a place's trip count is a property of one day type, so switching days
 * has to redraw it (`setPlacesFill`'s `day` parameter, threaded from
 * `main.ts`'s day control).
 */
export type PlaceFill = 'lost' | 'gained' | 'service';

/** The view opens on losses -- the ranked list's own default order (`placeSort`). */
export const DEFAULT_PLACE_FILL: PlaceFill = 'lost';

/** Mirrors `query.SHARE_MIN_RESIDENTS` -- the floor below which a place's share is withheld. */
export const SHARE_MIN_RESIDENTS = 100;

/** Which GeoJSON property `fillOpacityExpr` reads, per residents reading -- `'service'` reads a per-day field instead, via `serviceField`. */
const SHARE_FIELD: Record<'lost' | 'gained', 'share_lost' | 'share_gained'> = {
  lost: 'share_lost',
  gained: 'share_gained',
};

/** The five stats `/api/boundaries` publishes per place per day -- see `PlaceBoundaryProperties`. */
type ServiceStat = 'now' | 'proposed' | 'pct' | 'rail_now' | 'rail_proposed';

/**
 * Builds one of the property names `/api/boundaries` emits for one day's
 * service reading, e.g. `serviceField('weekday', 'pct')` ->
 * `'service_weekday_pct'`. Named once here, per the no-magic-strings rule, so
 * no call site hand-interpolates the string -- a typo in a literal would
 * silently read `undefined` off the feature instead of failing loud.
 */
export function serviceField(day: Day, stat: ServiceStat): keyof PlaceBoundaryProperties {
  return `service_${day}_${stat}` as keyof PlaceBoundaryProperties;
}

/** Plain day words for the service tooltip and legend -- "a weekday", not "weekday". */
const SERVICE_DAY_WORD: Record<Day, string> = {
  weekday: 'a weekday',
  saturday: 'a Saturday',
  sunday: 'a Sunday',
};

/**
 * The view's scope, stated inline rather than fetched: it is a structural
 * fact about how a place is assigned, not a figure that moves with the view.
 *
 * Every Allegheny resident is in a named place now that places are assigned
 * by boundary containment (`ingest_boundaries.py`) rather than by nearest
 * labelled stop, so unlike an earlier version of this note there is no
 * residual to state — see the module docstring's third bullet.
 */
export const SCOPE_NOTE = "Every one of Allegheny County's 1,238,177 "
  + 'residents is in a named place: places are assigned by boundary, not by '
  + 'distance to a labelled stop, so nobody here goes unnamed. Every figure '
  + 'is Allegheny-only and day-free — losing all buses on any day of the '
  + "week — so it does not move with the toolbar's day switch. A place with "
  + 'under 100 residents is shown without a share: a denominator that small '
  + 'cannot carry one.';

/** Colour per class, sharing the surface's palette so every view agrees. */
export const KLASS_COLOR: Record<'lost' | 'gained', string> = {
  lost: GONE_COLOR,
  gained: NEW_COLOR,
};

let list: PlaceSummary[] | null = null;
let detail: PlaceDetail | null = null;
let boundaries: BoundariesGeoJSON | null = null;
let visible = false;
/**
 * The display name of a place whose fill a reader just clicked and that the
 * plan does not touch -- a real state, held beside `detail` rather than
 * folded into it, because "selected and empty" and "clicked and nothing to
 * show" need different sentences in the key (`selectedPlaceLine`). Cleared
 * wherever `detail` is: by `clearSelection` and by any successful
 * `selectPlace`, so leaving the view or picking a real place can never leave
 * this sentence stranded on screen for a different place.
 */
let unchanged: string | null = null;

export function listData(): PlaceSummary[] | null {
  return list;
}

export function layerData(): PlaceDetail | null {
  return detail;
}

/** The place a click landed on that the plan changes nothing in, if any -- see `unchanged` above. */
export function unchangedPlace(): string | null {
  return unchanged;
}

export function boundariesData(): BoundariesGeoJSON | null {
  return boundaries;
}

export function isVisible(): boolean {
  return visible;
}

/**
 * The ranked list in one of its two true orders, without touching the array
 * the caller handed in -- both `main.ts`'s cached list and a rendered legend
 * read from the same array between sorts.
 */
export function sortPlaces(places: PlaceSummary[], by: PlaceSort): PlaceSummary[] {
  const copy = [...places];
  if (by === 'count') return copy.sort((a, b) => b.residents_lost - a.residents_lost);
  return copy.sort((a, b) => (b.share_lost ?? -1) - (a.share_lost ?? -1));
}

/**
 * Which side of a changed block group to draw, and how big.
 *
 * A block group can hold both outcomes at once -- some of its census blocks
 * lose every bus, others gain one -- so the point drawn for it takes
 * whichever side is larger. A tie goes to lost: a wash reading as this view's
 * gain colour would be the one wrong impression a map is not allowed to give.
 */
export function blockGroupKlass(bg: Pick<PlaceChangedBlockGroup, 'residents_lost' | 'residents_gained'>): 'lost' | 'gained' {
  return bg.residents_gained > bg.residents_lost ? 'gained' : 'lost';
}

export function blockGroupMagnitude(bg: Pick<PlaceChangedBlockGroup, 'residents_lost' | 'residents_gained'>): number {
  return Math.max(bg.residents_lost, bg.residents_gained);
}

/** Smallest and largest dot radius, in pixels at z12 -- see `sizeFor`. */
const MIN_RADIUS = 4;
const MAX_RADIUS = 16;
/** A block group at or above this many residents draws at MAX_RADIUS. */
const RADIUS_SATURATES_AT = 1000;

/**
 * A dot's base radius from its magnitude, on a square-root scale.
 *
 * Square root, not linear, because the dot's AREA is what a reader compares
 * by eye, and area scales with the square of radius -- a linear radius would
 * make a 900-resident block group look nine times a 100-resident one instead
 * of three.
 */
function sizeFor(magnitude: number): number {
  const t = Math.min(1, Math.sqrt(magnitude / RADIUS_SATURATES_AT));
  return MIN_RADIUS + t * (MAX_RADIUS - MIN_RADIUS);
}

/** One Point feature per changed block group -- the only geometry this repo has. See the module docstring. */
export function toGeoJSON(place: PlaceDetail) {
  return {
    type: 'FeatureCollection' as const,
    features: place.changed.map((bg) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [bg.lon, bg.lat] },
      properties: {
        geoid: bg.geoid,
        klass: blockGroupKlass(bg),
        residents_lost: bg.residents_lost,
        residents_gained: bg.residents_gained,
        radius: sizeFor(blockGroupMagnitude(bg)),
      },
    })),
  };
}

function colorExpr(): any {
  return ['match', ['get', 'klass'],
    'lost', KLASS_COLOR.lost,
    'gained', KLASS_COLOR.gained,
    KLASS_COLOR.lost];
}

/** Radius scales with the precomputed base size and with zoom, like the one-seat layer's dots. */
function radiusExpr(): any {
  return ['interpolate', ['linear'], ['zoom'],
    9, ['*', ['get', 'radius'], 0.5],
    12, ['get', 'radius'],
    16, ['*', ['get', 'radius'], 1.6]];
}

/**
 * The choropleth's colour bands, by SHARE of a place's OWN residents who lose
 * every bus -- never by count, which is the whole reason the denominator work
 * in `analyze_equity_places.place_totals` exists (module docstring's second
 * bullet). A place under `query.SHARE_MIN_RESIDENTS` residents, or one the
 * plan does not touch, carries `share_lost: null` or `0` and gets the bottom
 * band -- fully transparent, the same treatment for both, because "no data"
 * and "no change" must both read as nothing to see, never as a small loss
 * painted red. Checked against the published figures: Reserve township
 * (85.1%) and Bon Air (93.1%) fall in the top band, Baldwin borough (39.7%)
 * just inside it, and Penn Hills municipality (7.9%) in the second-lowest.
 */
export const SHARE_BANDS: ReadonlyArray<{ max: number | null; label: string; opacity: number }> = [
  { max: 0, label: 'No loss, or too few residents to share', opacity: 0 },
  { max: 0.05, label: 'Up to 5%', opacity: 0.15 },
  { max: 0.15, label: '5–15%', opacity: 0.35 },
  { max: 0.30, label: '15–30%', opacity: 0.55 },
  { max: null, label: 'Over 30%', opacity: 0.8 },
];

/** A place's fill opacity from its share, per `SHARE_BANDS`. Null and 0 share the bottom band. */
export function shareOpacity(share: number | null): number {
  const s = share ?? 0;
  for (const band of SHARE_BANDS) {
    if (band.max === null || s <= band.max) return band.opacity;
  }
  return SHARE_BANDS[SHARE_BANDS.length - 1].opacity;
}

/**
 * The service reading's colour bands, by |percent change| in a place's own
 * bus trips on the active day. SIGNED, unlike `SHARE_BANDS`: which colour is
 * used (`fillColorExpr`) comes from the sign of the change, and this ramp
 * supplies only the intensity, by magnitude -- so the same three breakpoints
 * (10/30/60%) describe a loss and an equal-sized gain identically.
 *
 * The bottom band, under 10%, carries opacity 0 for two reasons that happen
 * to want the same treatment. A change that small reads as noise next to a
 * ±1060% extreme, so drawing it would just paint the whole county a faint
 * colour with nothing to say. And `service_<day>_pct` is `null` -- not
 * `Infinity` -- where a place has no bus today and some proposed, an
 * undefined change rather than a huge one; `fillOpacityExpr` coalesces that
 * null to 0 before this ramp ever sees it, so it lands in this same silent
 * band by construction rather than needing a second special case. Those
 * places are never left unexplained, though: the legend states them in
 * words instead (`firstBusPlaces`, `placesKeyHTML`), because "not shaded"
 * must not mean "not on the map at all".
 *
 * Checked against the published extremes: Brackenridge borough (+1060%),
 * North Fayette township (+216%) and Millvale borough (+82%) all clear the
 * top band on the gaining side; Plum borough (-84%) and the seven places at
 * exactly -100% clear it on the losing side.
 */
export const SERVICE_BANDS: ReadonlyArray<{ max: number; opacity: number }> = [
  { max: 10, opacity: 0 },
  { max: 30, opacity: 0.3 },
  { max: 60, opacity: 0.55 },
  { max: Infinity, opacity: 0.8 },
];

/** A place's fill opacity from its |percent change|, per `SERVICE_BANDS`. Null and 0 share the bottom band, the same reasoning as `shareOpacity`. */
export function serviceOpacity(pct: number | null): number {
  const magnitude = Math.abs(pct ?? 0);
  for (const band of SERVICE_BANDS) {
    if (magnitude <= band.max) return band.opacity;
  }
  return SERVICE_BANDS[SERVICE_BANDS.length - 1].opacity;
}

/**
 * `SHARE_BANDS` as a MapLibre `fill-opacity` expression, built the same way
 * `shareOpacity` reads it so the map and the legend cannot disagree.
 *
 * `step` is left-closed at each breakpoint, so a break placed at exactly 0
 * would put `share_lost === 0` in the first non-zero band instead of the
 * transparent one -- the ramp's first real breakpoint sits an epsilon above
 * zero instead, matching `shareOpacity`'s own `s <= 0` check.
 *
 * `SHARE_BANDS` itself is shared between both readings: the bands are
 * unit-free shares, so the same five breakpoints describe "share who lose"
 * and "share who gain" equally well. Only which property is read changes.
 *
 * The service reading takes a different branch entirely: it reads
 * `|pct|` off the active day's field (`serviceField`, `day` required for
 * this branch) against `SERVICE_BANDS`, matching `serviceOpacity`'s own
 * reading the same way the branch above matches `shareOpacity`'s.
 */
export function fillOpacityExpr(fill: PlaceFill, day?: Day): any {
  if (fill === 'service') {
    const pctField = serviceField(day as Day, 'pct');
    return ['step', ['abs', ['coalesce', ['get', pctField], 0]],
      SERVICE_BANDS[0].opacity,
      SERVICE_BANDS[0].max, SERVICE_BANDS[1].opacity,
      SERVICE_BANDS[1].max, SERVICE_BANDS[2].opacity,
      SERVICE_BANDS[2].max, SERVICE_BANDS[3].opacity];
  }
  return ['step', ['coalesce', ['get', SHARE_FIELD[fill]], 0],
    SHARE_BANDS[0].opacity,
    Number.EPSILON, SHARE_BANDS[1].opacity,
    SHARE_BANDS[1].max, SHARE_BANDS[2].opacity,
    SHARE_BANDS[2].max, SHARE_BANDS[3].opacity,
    SHARE_BANDS[3].max, SHARE_BANDS[4].opacity];
}

/**
 * `fill-color` for the choropleth. A flat swatch for the two residents
 * readings, unchanged from before -- but service's colour varies PER
 * FEATURE (red for fewer trips, blue for more), so that reading needs a real
 * expression instead of a constant. The `>= 0` branch also catches a
 * coalesced null (the undefined-change hole): its colour is moot there,
 * since `fillOpacityExpr` has already painted it fully transparent.
 */
export function fillColorExpr(fill: PlaceFill, day?: Day): any {
  if (fill === 'service') {
    const pctField = serviceField(day as Day, 'pct');
    return ['case',
      ['>=', ['coalesce', ['get', pctField], 0], 0], NEW_COLOR,
      GONE_COLOR];
  }
  return KLASS_COLOR[fill];
}

/**
 * Places whose service on `day` falls in the ramp's silent null hole for the
 * reason that actually needs an explanation: no bus today, some proposed, so
 * `service_<day>_pct` is `null` because there is nothing to divide by. A
 * place with no bus on EITHER side is not included -- that is "no change",
 * the same nothing-to-see reading a small nonzero change gets, and does not
 * need a sentence of its own. Computed from the loaded boundaries rather
 * than hardcoded, since the count moves with the day type: 1 on a weekday
 * (Pine township), 5 on Saturday and Sunday.
 */
export function firstBusPlaces(boundaries: BoundariesGeoJSON, day: Day): string[] {
  const nowField = serviceField(day, 'now');
  const proposedField = serviceField(day, 'proposed');
  return boundaries.features
    .filter((f) => (f.properties[nowField] as number) === 0
      && (f.properties[proposedField] as number) > 0)
    .map((f) => f.properties.place);
}

/** How many null-hole places `firstBusSentence` names before it switches to "and N more". */
const FIRST_BUS_NAMED_LIMIT = 3;

/**
 * The null-hole places, in one sentence -- e.g. "5 places get their first
 * bus and cannot be shown as a percentage: Harrison township, Brackenridge
 * borough and Verona borough (and 2 more)." Empty string when there are none
 * on this day, so the legend prints nothing rather than an empty caveat.
 */
function firstBusSentence(names: string[]): string {
  if (names.length === 0) return '';
  const shown = names.slice(0, FIRST_BUS_NAMED_LIMIT);
  const rest = names.length - shown.length;
  const shownList = shown.length <= 1
    ? shown.join('')
    : `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}`;
  const namedPart = rest > 0 ? `${shownList} (and ${rest} more)` : shownList;
  return names.length === 1
    ? `1 place gets its first bus and cannot be shown as a percentage: ${namedPart}.`
    : `${names.length} places get their first bus and cannot be shown as a `
      + `percentage: ${namedPart}.`;
}

export function initPlacesLayer(map: maplibregl.Map, beforeId: string) {
  // The fill goes in first, at the same slot the points layer below also
  // asks for: each addLayer call inserts immediately before `beforeId`, so
  // adding the fill here and the points layer after leaves the fill beneath
  // the points once both are in the stack -- the fill says "this whole place
  // lost 40% of its residents' bus service", the points say "and here is
  // where inside it", per the module docstring.
  map.addSource(BOUNDARY_SRC, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] } as any,
  });
  map.addLayer({
    id: BOUNDARY_LAYER, type: 'fill', source: BOUNDARY_SRC,
    layout: { visibility: 'none' },
    paint: {
      // A flat colour per SHARE_BANDS band, with the band carried entirely in
      // opacity -- see the module docstring and `setPlacesFill`: only one
      // reading is ever painted at a time, never a blend. The view always
      // opens on 'lost', which needs no `day`, so neither call below passes
      // one.
      'fill-color': fillColorExpr(DEFAULT_PLACE_FILL),
      'fill-opacity': fillOpacityExpr(DEFAULT_PLACE_FILL),
      'fill-outline-color': 'rgba(255,255,255,.25)',
    },
  }, beforeId);

  map.addSource(SRC, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] } as any,
  });
  map.addLayer({
    id: LAYER, type: 'circle', source: SRC,
    layout: { visibility: 'none' },
    paint: {
      'circle-color': colorExpr(),
      'circle-radius': radiusExpr(),
      'circle-opacity': 0.85,
      'circle-stroke-color': 'rgba(255,255,255,.9)',
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 9, 0.4, 12, 0.9, 16, 1.5],
    },
  }, beforeId);
}

/**
 * Switch the choropleth to a different reading -- see `PlaceFill`'s own
 * docstring for why this is a switch between whole pictures and never a
 * blend of them.
 *
 * `day` matters only for `'service'`, which is the one reading that moves
 * with the toolbar's day switch; the two residents readings ignore it. It is
 * still accepted for every fill, unused or not, so `main.ts`'s day handler
 * and click handler can call this the same way regardless of which fill is
 * active, rather than branching on the fill before deciding whether to pass
 * a day at all.
 */
export function setPlacesFill(map: maplibregl.Map, fill: PlaceFill, day?: Day) {
  map.setPaintProperty(BOUNDARY_LAYER, 'fill-color', fillColorExpr(fill, day));
  map.setPaintProperty(BOUNDARY_LAYER, 'fill-opacity', fillOpacityExpr(fill, day));
}

/** Fetches the ranked list once and caches it, like the corridor and surface layers do for their own data. */
export async function loadPlaces(): Promise<PlaceSummary[]> {
  if (!list) list = await fetchJSON<PlaceSummary[]>('/api/places');
  return list;
}

/**
 * Fetches the choropleth's ~3.5 MB of polygons once and caches them, like
 * `loadPlaces` caches the ranked list -- the boundaries never change within a
 * build, so re-fetching on every view switch would only cost bandwidth.
 */
export async function loadBoundaries(map: maplibregl.Map): Promise<BoundariesGeoJSON> {
  if (!boundaries) {
    boundaries = await fetchJSON<BoundariesGeoJSON>('/api/boundaries');
    (map.getSource(BOUNDARY_SRC) as maplibregl.GeoJSONSource).setData(boundaries as any);
  }
  return boundaries;
}

/**
 * The cached boundaries' own answer for whether `key` is a place the plan
 * changes nothing in -- `changed_block_groups` is 0 for exactly the 149 of
 * 220 places with no `/api/places/{key}` record, so this is checkable before
 * ever making that request. A pure lookup, kept separate from `selectPlace`,
 * so the "does this key need a fetch at all" question is testable without a
 * map.
 *
 * Returns `null` both when the boundaries have not loaded yet and when the
 * key is not a boundary at all (an older build's stale `place=` link) --
 * either way there is no name to short-circuit with, and `selectPlace` falls
 * through to the fetch, which is what actually decides whether the key is
 * real.
 */
export function unchangedPlaceName(bs: BoundariesGeoJSON | null, key: string): string | null {
  const feature = bs?.features.find((f) => f.properties.key === key);
  return feature && feature.properties.changed_block_groups === 0
    ? feature.properties.place
    : null;
}

/**
 * Select one place: fetch its block groups, draw them, and fly the map there.
 *
 * Three outcomes, not two. A key the plan does not touch is answered from the
 * boundaries already in memory (`unchangedPlaceName`) -- no request, since
 * `/api/places/{key}` has no record for it and would only ever 404. A key
 * `/api/places/{key}` does have a record for draws its block groups as
 * before. And a 404 -- a stale key from an older build, or simply not in the
 * loaded boundaries either -- clears the selection instead of throwing: a
 * link built against an older run should land on the list, not on an error
 * the reader did nothing to cause.
 *
 * Returns `null` for both the second and third outcome, so a caller cannot
 * tell "changes nothing here" apart from "unknown key" by return value alone
 * -- it doesn't need to. `unchangedPlace()` carries that distinction for the
 * key/legend, and the caller's own job (`goToPlace` in `main.ts`) is only
 * ever "did this key end up with something to show".
 */
export async function selectPlace(map: maplibregl.Map, key: string): Promise<PlaceDetail | null> {
  const already = unchangedPlaceName(boundaries, key);
  if (already) {
    detail = null;
    unchanged = already;
    (map.getSource(SRC) as maplibregl.GeoJSONSource)?.setData(
      { type: 'FeatureCollection', features: [] } as any);
    return null;
  }
  try {
    detail = await fetchJSON<PlaceDetail>(`/api/places/${encodeURIComponent(key)}`);
  } catch {
    detail = null;
    unchanged = null;
    return null;
  }
  unchanged = null;
  (map.getSource(SRC) as maplibregl.GeoJSONSource).setData(toGeoJSON(detail) as any);
  // A named place is neighbourhood- to borough-sized; z13 shows a changed
  // block group's own point without also showing the whole county around it.
  map.flyTo({ center: [detail.lon, detail.lat], zoom: 13 });
  return detail;
}

/** Clear the selection, e.g. leaving the Places view for another. */
export function clearSelection(map: maplibregl.Map) {
  detail = null;
  unchanged = null;
  (map.getSource(SRC) as maplibregl.GeoJSONSource)?.setData(
    { type: 'FeatureCollection', features: [] } as any);
}

export function setPlacesVisible(map: maplibregl.Map, on: boolean) {
  visible = on;
  map.setLayoutProperty(LAYER, 'visibility', on ? 'visible' : 'none');
  map.setLayoutProperty(BOUNDARY_LAYER, 'visibility', on ? 'visible' : 'none');
}

/** One ranked row: the place, its loss (the rank), and its gain beside it. */
function placeRow(p: PlaceSummary, selected: boolean): string {
  // A withheld share (too small a denominator to carry one -- see
  // `query.SHARE_MIN_RESIDENTS`) is drawn as a dash that says why on hover,
  // rather than as a 0% that would read as "loses nobody" or a percentage
  // the population behind it cannot support.
  const share = p.share_lost == null
    ? '<span class="place-share muted" title="Too few residents here to put a'
      + ' share on: this place\'s measured population is under 100.">—</span>'
    : `<span class="place-share muted">${(p.share_lost * 100).toFixed(1)}% of the place</span>`;
  return `
    <button type="button" class="place-row${selected ? ' selected' : ''}"
            data-select-place="${esc(p.key)}">
      <span class="place-name">${esc(p.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(p.residents_lost).toLocaleString()} lost</span>
        ${share}
        ${p.residents_gained
          ? `<span class="place-gained">${Math.round(p.residents_gained).toLocaleString()} gained</span>`
          : ''}
      </span>
    </button>`;
}

/**
 * The whole panel for this view: the scope note, the sort control and the
 * ranked list. Kept as one function, like `journeyPromptHTML`, because there
 * is no click-driven answer here to layer a second render on top of -- the
 * list IS the answer, and selecting a row only changes which row is marked
 * and what the map is drawing.
 *
 * The sort control stays here because it is the list's own control: it
 * reorders these rows and draws nothing on the map. The fill control that
 * used to sit beside it does not -- it decides what the MAP paints, so it
 * lives with the other controls that do, in the toolbar
 * (`#place-fill-controls`). `fill` still arrives as a parameter because this
 * panel has to know which reading is on screen to decide whether
 * `SERVICE_DAY_NOTE` prints.
 */
/**
 * Printed only in service mode, directly under `SCOPE_NOTE`: that note
 * already tells the reader the two residents readings are day-free and do
 * not move with the toolbar's day switch, so a reader who switches days in
 * service mode and sees the fill and the key redraw -- while `lost`/`gained`
 * never would have -- needs to be told that is the one reading behaving
 * differently, not a bug.
 */
const SERVICE_DAY_NOTE = 'Unlike the two residents readings above, this one '
  + "moves with the toolbar's day switch: it is asking about the plan's "
  + "actual weekday, Saturday or Sunday service, not residents' day-free "
  + 'losses and gains.';

export function placesListHTML(places: PlaceSummary[], sortBy: PlaceSort,
                                selectedKey: string | null, fill: PlaceFill): string {
  const rows = sortPlaces(places, sortBy)
    .map((p) => placeRow(p, p.key === selectedKey)).join('');
  return `
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${places.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${SCOPE_NOTE}</p>
    ${fill === 'service' ? `<p class="note">${SERVICE_DAY_NOTE}</p>` : ''}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${sortBy === 'count' ? ' class="active"' : ''}>By count</button>
      <button type="button" data-sort-places="share"${sortBy === 'share' ? ' class="active"' : ''}>By share</button>
    </div>
    <div class="place-list">${rows}</div>`;
}

/**
 * The map key: what the fill and the points mean, at their own units.
 *
 * The fill's bands come straight from `SHARE_BANDS`, one row per band with a
 * swatch at that band's opacity, so the legend cannot drift from what the
 * layer actually paints. The bottom band -- null or zero share -- gets no
 * row at all: it is "nothing to see", not a fifth colour to learn.
 */
/**
 * Which "click a place" heading leads the legend, shared by every fill mode
 * -- pulled out because `serviceKeyHTML` needs the identical line.
 *
 * Three states, not two -- `unchanged` is the middle one. Before this fix a
 * click on any of the 149 boundaries with no `/api/places/{key}` record
 * silently left the generic prompt on screen, the only cue an embed's reader
 * has for which places are clickable at all having just been ignored. So a
 * click that lands on a place the plan does not touch gets its own sentence,
 * naming the place rather than leaving the prompt as if nothing happened --
 * `selected` still wins when both are set, since a real selection is never
 * stale in the way `unchanged` can be (see `selectPlace`'s docstring).
 */
function selectedPlaceLine(selected: PlaceDetail | null, unchanged: string | null): string {
  if (selected) {
    return `<div class="lg-head"><b>${esc(selected.place)}</b>
        <span class="muted">· ${selected.changed_block_groups} block group${
          selected.changed_block_groups === 1 ? '' : 's'} changed</span></div>`;
  }
  if (unchanged) {
    return `<div class="lg-head"><b>${esc(unchanged)}</b>
        <span class="muted">· the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`;
  }
  return `<div class="lg-head">Click a place to see its changed block groups</div>`;
}

/**
 * One SERVICE_BANDS breakpoint's magnitude range, as a label -- "10–30%",
 * or "Over 60%" for the open-ended top band, matching `SHARE_BANDS`'
 * label style even though `SERVICE_BANDS` carries no label of its own (it is
 * one ramp printed twice, in the two directions `serviceKeyHTML` draws).
 */
function serviceBandLabel(band: { max: number }, prevMax: number): string {
  return band.max === Infinity ? `Over ${prevMax}%` : `${prevMax}–${band.max}%`;
}

/**
 * The legend body for `'service'`: the diverging ramp in both directions,
 * plus the null-hole places `SERVICE_BANDS` cannot shade at all.
 */
function serviceKeyHTML(selected: PlaceDetail | null, unchanged: string | null, day: Day,
                         boundaries: BoundariesGeoJSON | null): string {
  const bandRows = SERVICE_BANDS
    .map((band, i) => ({ band, prevMax: i === 0 ? 0 : SERVICE_BANDS[i - 1].max }))
    .filter(({ band }) => band.opacity > 0)
    .flatMap(({ band, prevMax }) => {
      const label = serviceBandLabel(band, prevMax);
      return [
        `<div class="lg-row lg-static">
          <i style="background:${GONE_COLOR};opacity:${band.opacity};border-radius:2px"></i>
          <span class="lg-lab">${esc(label)} fewer trips</span></div>`,
        `<div class="lg-row lg-static">
          <i style="background:${NEW_COLOR};opacity:${band.opacity};border-radius:2px"></i>
          <span class="lg-lab">${esc(label)} more trips</span></div>`,
      ];
    }).join('');
  // The null hole: `SERVICE_BANDS`' own bottom band already draws these
  // places as nothing, per that ramp's own docstring, so the only place left
  // to say what actually happened to them is here, in words.
  const names = boundaries ? firstBusPlaces(boundaries, day) : [];
  const sentence = firstBusSentence(names);
  const nullHoleRow = sentence ? `<div class="lg-foot">${esc(sentence)}</div>` : '';
  return `
    ${selectedPlaceLine(selected, unchanged)}
    <div class="lg-lab">Fill — percent change in the place's own bus trips
      on ${esc(SERVICE_DAY_WORD[day])}</div>
    ${bandRows}
    ${nullHoleRow}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`;
}

/** `placesKeyHTML`'s options -- bound by name, per the repo's convention for
 * a function taking more than a couple of parameters. */
export interface PlacesKeyOptions {
  /** The place with real detail on screen, or null if none is selected. */
  selected: PlaceDetail | null;
  /** Which reading the choropleth is painting -- decides the header, bands and colour. */
  fill: PlaceFill;
  /** Required only for `fill: 'service'`, which is the one reading that reads a day's field. */
  day?: Day;
  /** The cached boundaries, for the service reading's null-hole sentence (`firstBusPlaces`). */
  boundaries?: BoundariesGeoJSON | null;
  /** The name of a place a click landed on that the plan changes nothing in -- see `selectedPlaceLine`. */
  unchanged?: string | null;
}

export function placesKeyHTML(
  { selected, fill, day, boundaries, unchanged }: PlacesKeyOptions,
): string {
  if (fill === 'service') {
    return serviceKeyHTML(selected, unchanged ?? null, day as Day, boundaries ?? null);
  }
  // Which reading is on the map right now -- the header, the band labels and
  // the swatch colour all follow it, so a reader never learns one sentence
  // for a fill painted a different colour.
  const verb = fill === 'lost' ? 'lose all buses' : 'gain a bus';
  const bandRows = SHARE_BANDS
    .filter((b) => b.opacity > 0)
    .map((b) => `
    <div class="lg-row lg-static">
      <i style="background:${KLASS_COLOR[fill]};opacity:${b.opacity};border-radius:2px"></i>
      <span class="lg-lab">${esc(b.label)} of the place's own residents ${esc(verb)}</span>
    </div>`).join('');
  return `
    ${selectedPlaceLine(selected, unchanged ?? null)}
    <div class="lg-lab">Fill — share of a place's own residents who ${esc(verb)}</div>
    ${bandRows}
    <div class="lg-row lg-static"><i style="background:${KLASS_COLOR.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${KLASS_COLOR.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained — a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`;
}

/**
 * The choropleth's hover tooltip -- a pure function of one feature's own
 * properties (`query.boundaries`), so it is testable without a map and can
 * never show a figure the fill itself did not already have on hand.
 *
 * Leads with whichever reading `fill` is currently painting, per the toggle
 * above: the number under the cursor should be the number the colour on
 * screen is showing. Both readings still print -- only their order changes --
 * because convention 10's "never quote one alone" applies here too.
 */
/**
 * The service tooltip's body -- see `placeTooltipHTML`, which leads with
 * this in service mode.
 *
 * Two cases get their own sentence rather than falling into the generic
 * "N → M trips" line, because both are places where that line would be
 * literally true and still misleading. `proposed === 0 && now > 0`: the
 * place loses its last bus, and if a train (or an incline) still calls
 * there, saying so is not optional -- conventions 13 and 16 both name this
 * exact trap, and Bethel Park (rail) beside Reserve township (no rail) are
 * the two real cases that have to come out right. `now === 0 && proposed >
 * 0`: the undefined-change hole (`SERVICE_BANDS`'s own docstring) -- there
 * is no percent to print, so none is.
 */
function serviceTooltipBody(props: PlaceBoundaryProperties, day: Day): string {
  const now = props[serviceField(day, 'now')] as number;
  const proposed = props[serviceField(day, 'proposed')] as number;
  const pct = props[serviceField(day, 'pct')] as number | null;
  const railProposed = props[serviceField(day, 'rail_proposed')] as boolean;
  const dayWord = SERVICE_DAY_WORD[day];

  if (proposed === 0 && now > 0) {
    const railNote = railProposed ? '; the T still calls here' : '';
    return `Loses all buses on ${dayWord} (${now} → 0 trips)${railNote}.`;
  }
  if (now === 0 && proposed > 0) {
    return `Gets its first bus on ${dayWord} (0 → ${proposed} trips).`;
  }
  const pctText = pct == null ? '—' : `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
  return `${now} → ${proposed} trips on ${dayWord} (${pctText}).`;
}

export function placeTooltipHTML(props: PlaceBoundaryProperties, fill: PlaceFill, day?: Day): string {
  if (fill === 'service') {
    return `<b>${esc(props.place)}</b> <span class="muted">· ${esc(props.kind)}</span><br>
      ${serviceTooltipBody(props, day as Day)}`;
  }
  const total = Math.round(props.residents_total ?? 0).toLocaleString();
  if (props.changed_block_groups === 0) {
    // Nothing here changed -- printing "0 lose (—)" and "0 gain (—)" would
    // read as two measurements where there is only one true sentence: this
    // place is untouched, and it has this many residents to be untouched for.
    return `<b>${esc(props.place)}</b> <span class="muted">· ${esc(props.kind)}</span><br>
      None of its ${total} residents lose or gain a bus.`;
  }
  const lostLine = shareLine('lose all buses', props.residents_lost, props.share_lost);
  const gainedLine = props.residents_gained > 0
    ? shareLine('gain a bus', props.residents_gained, props.share_gained)
    : null;
  const lines = (fill === 'lost' ? [lostLine, gainedLine] : [gainedLine, lostLine])
    .filter((l): l is string => l !== null);
  return `<b>${esc(props.place)}</b> <span class="muted">· ${esc(props.kind)}</span><br>
    ${lines.join('<br>')}<br>
    <span class="muted">${total} residents total · ${props.changed_block_groups
      } block group${props.changed_block_groups === 1 ? '' : 's'} changed</span>`;
}

/**
 * One "N residents VERB (share)" line for the tooltip. A withheld share
 * (`SHARE_MIN_RESIDENTS`, mirroring `query.SHARE_MIN_RESIDENTS`) says why
 * rather than silently printing nothing, the same reasoning `placeRow`'s dash
 * follows for the ranked list.
 */
function shareLine(verb: string, count: number, share: number | null): string {
  const n = Math.round(count).toLocaleString();
  const shareText = share == null
    ? `share withheld — under ${SHARE_MIN_RESIDENTS} residents`
    : `${(share * 100).toFixed(1)}%`;
  return `${n} ${verb} (${shareText})`;
}
