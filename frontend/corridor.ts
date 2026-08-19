/**
 * The corridor layer — the citywide layer as pieces of street, not catchments.
 *
 * The dots and the surface both answer "how much service can I reach on foot
 * from here", which is a walk-access question and takes a radius. This answers
 * a different question that takes none: on this piece of street, does a bus
 * run today, under the plan, or both? A location can keep full walk access
 * while a specific street loses its only bus, if a parallel block a minute's
 * walk away picks up the trip instead — real loss of pavement, and the walk
 * radius would paper over it by construction. So this layer has no radius
 * control, and route numbers never enter its classification, which is what
 * keeps it out of the repo's first analytical convention (never compare route
 * N to route N): a street is served or it isn't, independent of which route
 * number does the serving on either side.
 *
 * Presentation follows the surface's rules where they still apply:
 *
 *  - LOST AND ADDED SHARE THE SURFACE'S PALETTE. They are the surface's
 *    GONE_COLOR and NEW_COLOR, imported rather than re-typed as hex, so a
 *    reader who has already learned red-means-gone from the surface does not
 *    have to relearn it here.
 *  - KEPT DOES NOT SHARE IT, AND THAT IS DELIBERATE. The surface's dead-band
 *    grey (DEAD_BAND_COLOR) was chosen to sit inside a saturated ramp on a
 *    fill layer -- it all but disappears drawn as a thin line against
 *    Positron's near-white basemap, and kept is 897.8 of 1,239.3 km, most of
 *    the layer. A kept network that cannot be seen fails the one thing this
 *    view exists to do: show a red or blue segment as part of a network, so a
 *    reader can tell an isolated block from a severed trunk corridor. So
 *    kept gets its own neutral grey with real contrast against the basemap,
 *    drawn thinner and lower-opacity than lost/added and underneath them --
 *    subordinate, not invisible. It stays DESATURATED rather than taking a
 *    cooler blue-grey: added is a blue, and a blue-grey kept next to it
 *    makes "gains a bus" and "keeps its bus" read as one hue family, which
 *    is the single distinction this view exists to draw. Grey against red
 *    and blue keeps change as the only thing on the map carrying colour.
 *  - KEPT ALSO DARKENS AS YOU ZOOM OUT, NOT ONE FLAT COLOUR. At city zoom the
 *    kept grey sits right next to Positron's OWN grey motorway casings, and
 *    the network reads as basemap -- which defeats the point of drawing it.
 *    That only resolves by z14, where the street grid has spread out enough
 *    for kept's grey to read as a layer again rather than blend into the
 *    roads under it. So kept takes a darker grey below z14 and lightens back
 *    to its base colour from z14 up, rather than one colour at every zoom.
 *  - LEGEND TOTALS ARE CITYWIDE, NOT IN-VIEW, unlike every other legend in
 *    this app. The API has no radius parameter and returns the whole city's
 *    kilometres for the requested day type; summing only what scrolled into
 *    view would silently change what the numbers mean layer to layer, so the
 *    legend says "citywide" rather than letting the reader assume otherwise.
 */
import { CorridorLayer, CorridorKlass, Day, DAYS } from './types';
import { fetchJSON } from './utils';
import { GONE_COLOR, NEW_COLOR } from './surface';

const SRC = 'corridor';
const LAYER = 'corridor-lines';

// A cooler, lighter grey than the surface's dead-band colour -- chosen for
// contrast against Positron's near-white basemap, which the surface's fill
// version never had to survive. See the module docstring.
export const KEPT_COLOR = '#8b929c';

// A darker variant of KEPT_COLOR, used below z14 where the kept grey would
// otherwise compete with Positron's own motorway-casing grey. See the module
// docstring.
export const KEPT_COLOR_LOW = '#6f7783';

/** Colour per class, sharing the surface's palette so the two views agree. */
export const KLASS_COLOR: Record<CorridorKlass, string> = {
  lost: GONE_COLOR,
  added: NEW_COLOR,
  kept: KEPT_COLOR,
};

export function klassColor(klass: CorridorKlass): string {
  return KLASS_COLOR[klass];
}

let data: CorridorLayer | null = null;
let visible = false;

export function layerData(): CorridorLayer | null {
  return data;
}

export function isVisible(): boolean {
  return visible;
}

/** One LineString feature per run, coordinates passed through as the API sent them. */
export function toGeoJSON(layer: CorridorLayer) {
  return {
    type: 'FeatureCollection' as const,
    features: layer.runs.map((r) => ({
      type: 'Feature' as const,
      geometry: { type: 'LineString' as const, coordinates: r.geometry },
      properties: { klass: r.klass, length_m: r.length_m },
    })),
  };
}

/**
 * Loss and gain as a share of today's pavement, for the legend.
 *
 * The denominator is `kept + lost` — the network as it stands today — not
 * `kept + lost + added`, because added pavement did not exist today and
 * including it would understate the loss percentage by diluting it with
 * streets that are not part of what "today's pavement" means.
 */
export function pavementPct(km: Record<CorridorKlass, number>) {
  const today = km.kept + km.lost;
  return {
    lostPct: today > 0 ? (km.lost / today) * 100 : 0,
    addedPct: today > 0 ? (km.added / today) * 100 : 0,
  };
}

/**
 * Colour per class, with kept darkening below z14 -- see the module
 * docstring's "darkens as you zoom out" note.
 *
 * ZOOM HAS TO BE THE OUTER EXPRESSION, which is why this reads inside-out:
 * only kept varies with zoom, so the natural shape is a match on class with
 * an interpolate in the kept branch -- and MapLibre rejects that outright
 * ("zoom expression may only be used as input to a top-level step or
 * interpolate"), silently dropping the whole layer at addLayer time rather
 * than falling back to a flat colour. TypeScript cannot see it: these
 * expressions are `any`. So the match is repeated per zoom stop instead, and
 * `corridor.test.ts` pins the ordering.
 */
export function colorExpr(): any {
  const atZoom = (kept: string) => ['match', ['get', 'klass'],
    'lost', KLASS_COLOR.lost,
    'added', KLASS_COLOR.added,
    kept];
  return ['interpolate', ['linear'], ['zoom'],
    9, atZoom(KEPT_COLOR_LOW),
    14, atZoom(KEPT_COLOR)];
}

/**
 * Width by zoom and by class: hairlines at z10 read as noise and fat lines at
 * z16 bury the street grid, so width scales with zoom on an interpolate
 * expression. Kept is drawn thinner than lost/added at every zoom, on top of
 * being drawn underneath them, so it stays subordinate on both axes -- but
 * the gap is narrower than a first pass had it, because a kept line thin
 * enough to vanish is not "recessive", it is absent.
 */
function widthExpr(): any {
  const scale = ['match', ['get', 'klass'], 'kept', 0.85, 1] as any;
  return ['interpolate', ['linear'], ['zoom'],
    9,  ['*', scale, 1.2],
    13, ['*', scale, 2.6],
    16, ['*', scale, 6]];
}

function opacityExpr(): any {
  return ['match', ['get', 'klass'], 'kept', 0.85, 0.9] as any;
}

export function initCorridorLayer(map: maplibregl.Map, beforeId: string) {
  map.addSource(SRC, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] } as any,
  });
  map.addLayer({
    id: LAYER, type: 'line', source: SRC,
    layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': colorExpr(),
      'line-width': widthExpr(),
      'line-opacity': opacityExpr(),
    },
  }, beforeId);
}

export async function loadCorridorLayer(map: maplibregl.Map, day: Day) {
  data = await fetchJSON<CorridorLayer>(`/api/corridors?day=${day}`);
  (map.getSource(SRC) as maplibregl.GeoJSONSource).setData(toGeoJSON(data) as any);
  return data;
}

export async function setCorridorDay(map: maplibregl.Map, day: Day) {
  if (!DAYS.includes(day)) return;
  await loadCorridorLayer(map, day);
}

export function setCorridorVisible(map: maplibregl.Map, on: boolean) {
  visible = on;
  map.setLayoutProperty(LAYER, 'visibility', on ? 'visible' : 'none');
}
