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
 *    71.5% of everyone who loses every bus, led by Baldwin borough at 9,613.
 *    By share, small boroughs and townships a count-ranked list buries lead
 *    instead — Reserve township is ninth by count and loses 85% of its
 *    residents. Neither order is the "right" one, so both are a click away
 *    rather than the app picking one and hiding the other (`sortPlaces`).
 *  - THE MAP DRAWS POINTS, NEVER A FILLED BOUNDARY. This repo carries no place
 *    geometry at all — a block group takes the name of the nearest surviving
 *    labelled PRT stop, median 373 m away and up to 1,989 m
 *    (`query.place_detail`) — so filling a real municipal polygon with these
 *    numbers would assert that PRT's labelling and the municipal partition
 *    agree, which nothing here has checked. A point per changed block group
 *    claims only what was measured. DO NOT "improve" this into a choropleth;
 *    that was considered and rejected in the worklog entry above.
 *  - THE RESIDUAL IS STATED, NOT IMPLIED AWAY. 151 of the county's 68,989
 *    residents who lose every bus live beyond `analyze_equity_places`'s label
 *    radius of a labelled stop, take no place name, and are not in this list
 *    or its map. `SCOPE_NOTE` says so wherever the list is drawn, per
 *    convention 12's "never quote one alone".
 *
 * Like the corridor and one-seat layers, a block group's colour reuses the
 * surface's red/blue palette (`GONE_COLOR`/`NEW_COLOR`) rather than inventing
 * one, so a reader who has already learned red-means-gone does not relearn it
 * here. Unlike them, a block group can hold both losses and gains at once —
 * some of its blocks lose every bus, others gain one — so `blockGroupKlass`
 * draws whichever side is larger, and a tie is drawn as a loss: a wash should
 * never read as the gain-coloured half of this view.
 */
import { PlaceSummary, PlaceChangedBlockGroup, PlaceDetail } from './types';
import { fetchJSON, esc } from './utils';
import { GONE_COLOR, NEW_COLOR } from './surface';

const SRC = 'places';
const LAYER = 'places-points';

export type PlaceSort = 'count' | 'share';

/**
 * The county's residual, outside every place this list can name. Stated
 * inline rather than fetched: it is a structural fact about the analysis
 * (`analyze_equity_places.LABEL_RADIUS_M`), not a figure that moves with the
 * view, and pinning it in the panel means a reader cannot read this list as
 * totalling the county — see the module docstring's third bullet.
 */
export const SCOPE_NOTE = 'Named places only, Allegheny County. 151 of the '
  + "county's 68,989 residents who lose every bus live beyond 2 km of a "
  + 'labelled PRT stop, take no place name, and are not in this list. Every '
  + 'figure here is day-free — losing every bus on any day of the week — so '
  + "it does not move with the toolbar's day switch. A place with under 100 "
  + 'residents is listed but given no share: a denominator that small cannot '
  + 'carry one.';

/** Colour per class, sharing the surface's palette so every view agrees. */
export const KLASS_COLOR: Record<'lost' | 'gained', string> = {
  lost: GONE_COLOR,
  gained: NEW_COLOR,
};

let list: PlaceSummary[] | null = null;
let detail: PlaceDetail | null = null;
let visible = false;

export function listData(): PlaceSummary[] | null {
  return list;
}

export function layerData(): PlaceDetail | null {
  return detail;
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

export function initPlacesLayer(map: maplibregl.Map, beforeId: string) {
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

/** The map key: what the dots' colour and size mean. */
export function placesKeyHTML(selected: PlaceDetail | null): string {
  const selectedLine = selected
    ? `<div class="lg-head"><b>${esc(selected.place)}</b>
        <span class="muted">· ${selected.changed_block_groups} block group${
          selected.changed_block_groups === 1 ? '' : 's'} changed</span></div>`
    : `<div class="lg-head">Click a place to see its changed block groups</div>`;
  return `
    ${selectedLine}
    <div class="lg-row lg-static"><i style="background:${KLASS_COLOR.lost}"></i>
      <span class="lg-lab">loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${KLASS_COLOR.gained}"></i>
      <span class="lg-lab">gains more than it loses</span></div>
    <div class="lg-foot">Points, not a filled area: this repo has no place
      boundaries, only the nearest surviving PRT stop each block group is
      named for. Size is the larger of a block group's losses or gains.</div>`;
}
