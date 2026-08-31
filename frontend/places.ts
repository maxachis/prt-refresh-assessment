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
} from './types';
import { fetchJSON, esc } from './utils';
import { GONE_COLOR, NEW_COLOR } from './surface';

const SRC = 'places';
const LAYER = 'places-points';
const BOUNDARY_SRC = 'places-boundaries';
export const BOUNDARY_LAYER = 'places-fill';

export type PlaceSort = 'count' | 'share';

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
  + 'is Allegheny-only and day-free — losing every bus on any day of the '
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

export function listData(): PlaceSummary[] | null {
  return list;
}

export function layerData(): PlaceDetail | null {
  return detail;
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
 * `SHARE_BANDS` as a MapLibre `fill-opacity` expression, built the same way
 * `shareOpacity` reads it so the map and the legend cannot disagree.
 *
 * `step` is left-closed at each breakpoint, so a break placed at exactly 0
 * would put `share_lost === 0` in the first non-zero band instead of the
 * transparent one -- the ramp's first real breakpoint sits an epsilon above
 * zero instead, matching `shareOpacity`'s own `s <= 0` check.
 */
export function fillOpacityExpr(): any {
  return ['step', ['coalesce', ['get', 'share_lost'], 0],
    SHARE_BANDS[0].opacity,
    Number.EPSILON, SHARE_BANDS[1].opacity,
    SHARE_BANDS[1].max, SHARE_BANDS[2].opacity,
    SHARE_BANDS[2].max, SHARE_BANDS[3].opacity,
    SHARE_BANDS[3].max, SHARE_BANDS[4].opacity];
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
      // A flat colour, GONE_COLOR, with SHARE_BANDS carried entirely in
      // opacity -- see the module docstring: this is a loss map, so it draws
      // in the loss colour only, never the gain one.
      'fill-color': KLASS_COLOR.lost,
      'fill-opacity': fillOpacityExpr(),
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
 * Select one place: fetch its block groups, draw them, and fly the map there.
 *
 * A 404 clears the selection instead of throwing -- a stale key surviving a
 * page reload (a link built against an older run) should land on the list,
 * not on an error the reader did nothing to cause.
 */
export async function selectPlace(map: maplibregl.Map, key: string): Promise<PlaceDetail | null> {
  try {
    detail = await fetchJSON<PlaceDetail>(`/api/places/${encodeURIComponent(key)}`);
  } catch {
    detail = null;
    return null;
  }
  (map.getSource(SRC) as maplibregl.GeoJSONSource).setData(toGeoJSON(detail) as any);
  // A named place is neighbourhood- to borough-sized; z13 shows a changed
  // block group's own point without also showing the whole county around it.
  map.flyTo({ center: [detail.lon, detail.lat], zoom: 13 });
  return detail;
}

/** Clear the selection, e.g. leaving the Places view for another. */
export function clearSelection(map: maplibregl.Map) {
  detail = null;
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
 * The whole panel for this view: the scope note, the sort control, and the
 * ranked list. Kept as one function, like `journeyPromptHTML`, because there
 * is no click-driven answer here to layer a second render on top of -- the
 * list IS the answer, and selecting a row only changes which row is marked
 * and what the map is drawing.
 */
export function placesListHTML(places: PlaceSummary[], sortBy: PlaceSort,
                                selectedKey: string | null): string {
  const rows = sortPlaces(places, sortBy)
    .map((p) => placeRow(p, p.key === selectedKey)).join('');
  return `
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${places.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${SCOPE_NOTE}</p>
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
export function placesKeyHTML(selected: PlaceDetail | null): string {
  const selectedLine = selected
    ? `<div class="lg-head"><b>${esc(selected.place)}</b>
        <span class="muted">· ${selected.changed_block_groups} block group${
          selected.changed_block_groups === 1 ? '' : 's'} changed</span></div>`
    : `<div class="lg-head">Click a place to see its changed block groups</div>`;
  const bandRows = SHARE_BANDS
    .filter((b) => b.opacity > 0)
    .map((b) => `
    <div class="lg-row lg-static">
      <i style="background:${KLASS_COLOR.lost};opacity:${b.opacity};border-radius:2px"></i>
      <span class="lg-lab">${esc(b.label)} of the place's own residents</span>
    </div>`).join('');
  return `
    ${selectedLine}
    <div class="lg-lab">Fill — share of a place's own residents who lose every bus</div>
    ${bandRows}
    <div class="lg-row lg-static"><i style="background:${KLASS_COLOR.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${KLASS_COLOR.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost — a raw count would just draw where people live. Click a place to
      select it. Points are the changed census block groups inside it; size is
      the larger of a block group's losses or gains.</div>`;
}
