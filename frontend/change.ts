/**
 * The citywide change layer — what the map says before anybody clicks.
 *
 * The app could already answer "what happens at my corner", but only one
 * corner at a time, which meant the shape of the plan was invisible unless you
 * knew where to look. This paints every location at once.
 *
 * Presentation rules here are the same ones the panel obeys, and for the same
 * reasons:
 *
 *  - THE BUCKETS ARE PUBLISHED CRITERIA, NOT A COLOUR RAMP SOMEBODY CHOSE.
 *    `gone`, `halved`, `doubled` and `new` are COVERAGE-CHANGE,
 *    LOSE-FREQUENCY-HALF and GAIN-FREQUENCY-DOUBLE restated; the counts this
 *    file renders are the counts docs/answers/ prints. See query.BUCKETS.
 *  - GAINS READ AS LOUDLY AS LOSSES. The ramp is symmetric — the two loss
 *    buckets and the two gain buckets get the same saturation and the same
 *    dot size — because the honest headline for this plan is a near
 *    service-neutral redesign, and a map that draws losses larger than gains
 *    would lie at a glance, which is the one distance at which nobody reads
 *    the caveats.
 *  - GAIN IS VIOLET, NOT GREEN, BECAUSE SIZE DOES NOT RESCUE COLOUR. Sizes run
 *    6 / 4.5 / 3 outward from `same` on BOTH sides, so size encodes how big a
 *    change is and never which way it goes -- `less` and `more` are both
 *    size 3. Under red-green colour blindness a red/green ramp put those two
 *    opposite findings at the same size AND the same apparent hue. Moving the
 *    gain half onto violet (`more`, `doubled`) fixes the direction read for
 *    the two red-green deficiencies; a hue redundancy in shape or hatch is
 *    still the only complete answer and remains open --
 *    docs/worklog/the-change-ramp-fails-red-green-colour-blindness.md.
 *  - EVERY COUNT SAYS WHICH DAY TYPE IT IS. 152 locations keep their weekday
 *    buses and lose the weekend entirely; on a weekday-only map they are
 *    invisible, so the day control governs this layer and not just the panel.
 */
import {
  ChangeLayer, ChangePoint, Day, DAYS, BUCKET, NAME, PUBLISHED, REMOVED,
  STOP_CUR, STOP_PROP,
  field, riders, pointId,
} from './types';
import { fetchJSONOnce } from './utils';

/**
 * Colour and size per bucket, in ramp order.
 *
 * Loss stays red; gain is violet rather than green, because red/green is
 * exactly the pair roughly 1 in 12 men cannot separate, and size does not
 * cover for it -- see the module note above. Violet, not the more
 * obvious blue, because blue was already spoken for: `new` is `#0f79c9` and
 * `GONE_COLOR`/`NEW_COLOR` are shared with the street and one-seat layers, so
 * a blue gain ramp would either collide with "new service" or force those
 * layers to repaint too. frontend/cvd.test.ts pins the worst-case distance
 * between every loss/gain bucket pair under normal vision and all three
 * dichromat simulations, so this can't silently drift back. `gone` and `new`
 * are still the largest dots and `same` the smallest -- size still carries
 * magnitude, just never direction.
 *
 * The ramp is also balanced for CONTRAST against the basemap, not just for
 * saturation. Gains at the previous brightness read ~1.6:1 against Positron
 * where losses read ~3.1:1 -- "gains as loud as losses" was true of hue and
 * size but not of the one channel that decides whether you see a dot at all.
 * frontend/contrast.test.ts enforces a 2.5:1 floor per bucket and 6%
 * loss/gain symmetry, so this can't silently drift back either -- the violet
 * hexes were chosen from a grid search constrained by that floor, which is
 * why they are not more saturated.
 */
export const STYLE: Record<string, { color: string; size: number }> = {
  gone:    { color: '#e8232f', size: 6 },
  halved:  { color: '#ef5c33', size: 4.5 },
  less:    { color: '#b06a55', size: 3 },
  same:    { color: '#6b7280', size: 2.5 },
  more:    { color: '#996cb4', size: 3 },
  doubled: { color: '#bd60e7', size: 4.5 },
  new:     { color: '#0f79c9', size: 6 },
  none:    { color: '#3a3f4a', size: 2 },
};

const SRC = 'change';
const LAYER = 'change-dots';

/** `true` for a dot the reader has painted. */
const SELECTED: any = ['boolean', ['feature-state', 'selected'], false];
/** Ink, not a hue: the ramp owns every colour that means something here. */
const SELECTED_HALO = '#15181e';

/**
 * A place the plan puts a stop where none stands today, drawn HOLLOW.
 *
 * One mark, one claim. Until 2026-09-08 these dots carried a service colour
 * and a ring: the colour said what happens to the buses within the walk
 * radius, the ring said no pole stands here, and a reader met "doubled or
 * better" and "no stop here today" on one dot and read a contradiction. Both
 * statements were true and they have different footprints -- 400 m of walking
 * against 15 m of kerb -- which is not something a key can teach fast enough.
 *
 * WHY NOT AN EIGHTH COLOUR, which is the obvious answer. The palette is full.
 * Searching the whole HSL space at the contrast the other seven hold (2.9-4.2
 * against Positron), the best available colour sits at deltaE 14.6 from its
 * nearest neighbour under the worst of normal vision and the three
 * dichromacies -- and that neighbour is `new`, the one it must never be
 * confused with. The ramp's own sign-crossing pairs are held to 40. Going
 * darker buys separation (a near-black navy reaches 37.9) at 15:1 contrast,
 * which would make the plan's 260 additions the loudest mark on a map whose
 * subject includes 633 locations losing every bus -- overstating the gains,
 * which CLAUDE.md forbids as plainly as it forbids overstating the losses.
 *
 * So the mark uses the channel the palette has left: fill. A filled dot is a
 * stop that stands today, coloured by what happens to its service; a hollow
 * dot is a stop the plan adds. Filled against hollow is the oldest way a map
 * says actual against proposed, it survives every colour deficiency because
 * it is not a colour, and it cannot be read as a position on the loss-gain
 * ramp -- which is the point, because these locations are not on it.
 *
 * The outline is ink rather than a hue for the same reason: a hue would put
 * the dot back on the ramp. It is heavier than the white halo the filled dots
 * carry, because here the outline IS the dot rather than a separator.
 */
const NEW_PLACE: any = ['==', ['get', 'published'], 0];
/** The pseudo-bucket the key toggles these by; never a `query.BUCKETS` key. */
export const NEW_PLACE_KEY = 'newplace';
const NEW_PLACE_INK = '#15181e';
/** Between `doubled` (4.5) and `gone` (6): present, not shouting. */
const NEW_PLACE_SIZE = 5;

/**
 * A stop the plan takes away, drawn as a cross INSTEAD of a coloured dot.
 *
 * ONE DOT SAYS ONE THING. Either the plan removes this stop -- a red cross,
 * true on every day of the week -- or the stop stays and wears the colour of
 * what happens to the buses within a walk of it. Max set that rule on
 * 2026-09-09, after the two channels drawn together produced a stop that was
 * crossed out and coloured "new service" on a Saturday: 25 stops PRT retires
 * stand where the plan puts a weekend bus that is not there today, and a dot
 * saying both at once is a dot a reader cannot resolve.
 *
 * The reason it can be one or the other is that the neighbouring dots are on
 * screen. A removed stop with buses still around it sits in a field of
 * coloured dots that say so; a removed stop in a corridor the plan abandons
 * sits among crosses and empty ground. That reading was the argument for
 * carrying both channels on one dot, and the map already makes it -- Max's
 * call, and it is why nothing here re-derives "is there service nearby".
 *
 * WHAT IT COSTS, recorded because it is easy to forget: the cross is not the
 * `gone` bucket and never was. On a weekday at 400 m every one of the 633
 * "loses all service" locations is also a removed stop, so that row now reads
 * 0 there and the 1,308 crosses carry the whole story; the two part company on
 * weekends, when 149 of Saturday's 443 stranded locations are stops that
 * survive with nothing left to catch. The published 633 lives on `/findings`
 * and in `data/coverage_change.csv`, which is where a quotable figure belongs.
 *
 * WHY A DRAWN ICON rather than a glyph. `text-field: '✕'` depends on the
 * basemap's glyph coverage for U+2715, which is not ours to guarantee; a
 * canvas image is. It carries its own white casing so it reads on the
 * basemap and on a surface cell underneath it in the Both view, and because a
 * cross is a shape rather than a hue it survives every colour deficiency --
 * the same argument the hollow fill makes for added stops.
 */
const REMOVED_STOP: any = ['==', ['get', 'removed'], 1];
/** The pseudo-bucket the key toggles the mark by; never a `query.BUCKETS` key. */
export const REMOVED_KEY = 'removedstop';
const REMOVED_LAYER = 'change-removed';
/** The selection ring under a painted cross; see `initChangeLayer`. */
const REMOVED_SEL_LAYER = 'change-removed-selected';
const REMOVED_ICON = 'removed-cross';
/** The ramp's own red, so the map has one red and not two that nearly match. */
const REMOVED_INK = '#e8232f';

/**
 * The cross, drawn once into an image the symbol layer then places.
 *
 * White underneath and red on top, both round-capped: the casing is what keeps
 * it legible on a dark basemap and on the surface cells of the Both view.
 */
function crossIcon(scale = 2): ImageData {
  const s = 16 * scale;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const g = canvas.getContext('2d')!;
  const pad = s * 0.2;
  g.lineCap = 'round';
  for (const [width, ink] of [[s * 0.26, 'rgba(255,255,255,.95)'],
                              [s * 0.14, REMOVED_INK]] as const) {
    g.lineWidth = width;
    g.strokeStyle = ink;
    g.beginPath();
    g.moveTo(pad, pad);
    g.lineTo(s - pad, s - pad);
    g.moveTo(s - pad, pad);
    g.lineTo(pad, s - pad);
    g.stroke();
  }
  // Solid through the middle. It punched a hole there while a coloured dot
  // sat underneath and the colour was the other half of the reading; there is
  // no dot under it now, so the hole would show the basemap through the mark.
  return g.getImageData(0, 0, s, s);
}

let data: ChangeLayer | null = null;
/** Buckets the reader has switched off by clicking the legend. */
const hidden = new Set<string>();

/**
 * The dots the reader has painted, by their server ids.
 *
 * A second scope for the same figures, and the first one in this app that is
 * neither published nor derived from the question: the viewport is arbitrary
 * too, but it is arbitrary in a way a link reproduces exactly, and a
 * hand-painted set is only as reproducible as the ids that name it. That is
 * why it holds ids rather than row indices, and why `urlstate` writes them
 * out in full.
 */
const selected = new Set<string>();

/**
 * Every layer the Stop-by-stop view draws, in the order they were added.
 *
 * Named here rather than spelled out in `main` because a removed stop is now
 * drawn by two of them and a dot by one, and a view switch that hid only the
 * dots would leave 1,308 crosses hanging over the Streets or One-seat map.
 */
export const CHANGE_LAYERS = [LAYER, REMOVED_SEL_LAYER, REMOVED_LAYER];

/** The layers a pointer can land on: a coloured dot, or a cross. */
export const CHANGE_HIT_LAYERS = [LAYER, REMOVED_LAYER];

/** The slot other layers insert beneath to sit under the dots. */
export const CHANGE_BASE_LAYER = LAYER;

/** Show or hide the whole view at once — see `CHANGE_LAYERS`. */
export function showChangeLayers(map: maplibregl.Map, on: boolean) {
  for (const id of CHANGE_LAYERS) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
    }
  }
}

export function layerData(): ChangeLayer | null {
  return data;
}

export function isHidden(key: string): boolean {
  return hidden.has(key);
}

/**
 * Which dots one figure is counted over.
 *
 * The legend's numbers were always scoped -- to the viewport -- and painting
 * makes that scope a choice rather than a fact, so it becomes a value the
 * caller passes instead of four coordinates each of these helpers tests for
 * itself. Everything else about the counting is unchanged: still tallied from
 * the raw rows, so a bucket switched off in the key keeps reporting its
 * total.
 */
export type Scope = (p: ChangePoint) => boolean;

export function viewportScope(
  west: number, south: number, east: number, north: number,
): Scope {
  return (p) => inBounds(p, west, south, east, north);
}

export function selectionScope(ids: ReadonlySet<string>): Scope {
  return (p) => ids.has(pointId(p));
}

export function selection(): ReadonlySet<string> {
  return selected;
}

/** Sorted, so the same painted set always writes the same link. */
export function selectionIds(): string[] {
  return [...selected].sort();
}

export function selectionSize(): number {
  return selected.size;
}

/**
 * Paint, unpaint, or replace the selection, repainting only what changed.
 *
 * Feature state rather than a re-`setData`: the layer is ~5,900 dots and this
 * runs on every pointer move of a drag. `addToSelection` reports how many
 * dots it actually took, so a caller can redraw the counts only on the
 * frames where they changed.
 */
export function addToSelection(
  map: maplibregl.Map, ids: Iterable<string>,
): number {
  let added = 0;
  for (const id of ids) {
    if (selected.has(id)) continue;
    selected.add(id);
    mark(map, id, true);
    added++;
  }
  return added;
}

export function toggleSelected(map: maplibregl.Map, id: string) {
  if (selected.delete(id)) mark(map, id, false);
  else {
    selected.add(id);
    mark(map, id, true);
  }
}

export function setSelection(map: maplibregl.Map, ids: Iterable<string>) {
  clearSelection(map);
  addToSelection(map, ids);
}

export function clearSelection(map: maplibregl.Map) {
  for (const id of selected) mark(map, id, false);
  selected.clear();
}

function mark(map: maplibregl.Map, id: string, on: boolean) {
  // A selection can arrive from a link before the layer has loaded, and
  // MapLibre throws on a feature state set against a source it has no data
  // for yet. The set is the record; the halo catches up when the dots land.
  try {
    map.setFeatureState({ source: SRC, id }, { selected: on });
  } catch {
    /* the dots have not arrived; `restoreSelection` re-marks them */
  }
}

/** Re-apply the halo after the dots are (re)loaded. */
function restoreSelection(map: maplibregl.Map) {
  for (const id of selected) mark(map, id, true);
}

/**
 * Which of the dots a query box returned are actually under the brush.
 *
 * The map can only be asked for features inside a RECTANGLE, and the brush
 * the reader is watching is a circle. Left as the rectangle, a stroke would
 * pick up stops in its corners that the ring on screen never touched -- a
 * selection that does not match the thing that drew it, in a view whose
 * whole job is that the number and the picture agree.
 */
export function withinBrush(
  cx: number, cy: number, radiusPx: number,
  dots: { id: string; x: number; y: number }[],
): string[] {
  const r2 = radiusPx * radiusPx;
  return dots
    .filter((d) => (d.x - cx) ** 2 + (d.y - cy) ** 2 <= r2)
    .map((d) => d.id);
}

/**
 * The dots under a brush stroke, by id.
 *
 * Deliberately what is RENDERED, unlike every count in this file: you can
 * only paint what you can see, so a bucket switched off in the key cannot be
 * picked up by a stroke passing over where its dots would be. That is the
 * same rule the key already follows from the other side -- switching a bucket
 * off does not drop what it has already counted.
 */
export function dotsUnder(
  map: maplibregl.Map, x: number, y: number, radiusPx: number,
): string[] {
  const box: [[number, number], [number, number]] = [
    [x - radiusPx, y - radiusPx], [x + radiusPx, y + radiusPx]];
  // Both layers: a removed stop is drawn only as a cross, so asking the dot
  // layer alone would make the 1,308 crosses unpaintable -- and a scope that
  // silently cannot hold the stops a reader is most likely to be selecting
  // would be worse than no brush.
  const layers = [LAYER, REMOVED_LAYER].filter((id) => map.getLayer(id));
  const dots = map.queryRenderedFeatures(box as any, { layers })
    .filter((f) => f.id !== undefined)
    .map((f) => {
      const [lon, lat] = (f.geometry as any).coordinates;
      const at = map.project([lon, lat]);
      return { id: f.id as string, x: at.x, y: at.y };
    });
  return withinBrush(x, y, radiusPx, dots);
}

/**
 * Points inside `scope`, tallied by bucket for one day type.
 *
 * Counted from the raw rows rather than from `queryRenderedFeatures`, which
 * only sees what survived the legend filter and what the current tile has
 * actually drawn. The summary has to keep reporting a bucket the reader has
 * just switched off, or turning a layer off would look like the losses in view
 * had gone away.
 */
export function countIn(
  points: ChangePoint[], dayIndex: number, keys: string[], scope: Scope,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of keys) out[k] = 0;
  for (const p of points) {
    // Stops that stand today only. The buckets are convention 4's published
    // criteria and their citywide counts are measured over exactly this set,
    // so folding the plan's additions in would put a number under a published
    // label that no published file agrees with. `countNewPlacesIn` has them.
    //
    // And stops that stay. A removed stop is drawn as a cross INSTEAD of a
    // colour, so it is counted on the cross's row instead of in a bucket --
    // see REMOVED_STOP for why the two channels stopped overlapping.
    if (!scope(p) || field(p, PUBLISHED) === 0 || field(p, REMOVED) === 1) continue;
    const key = keys[field(p, BUCKET(dayIndex))];
    if (key !== undefined) out[key]++;
  }
  return out;
}

/**
 * Places the plan puts a stop where none stands today, in scope.
 *
 * Counted here rather than in the legend so the key and the map read the same
 * field (`published`) by the same rule; a key that counted one thing while the
 * map drew another would be worse than no key.
 *
 * These are NOT a bucket and are deliberately outside `countIn`: the buckets
 * are published criteria measured over the stops that exist today, and a
 * location with no stop has no service today to compare against. It is a
 * category of dot, not a seventh outcome.
 */
export function countNewPlacesIn(points: ChangePoint[], scope: Scope): number {
  let n = 0;
  for (const p of points) if (scope(p) && field(p, PUBLISHED) === 0) n++;
  return n;
}

/**
 * Stops the plan takes away, in scope — the red crosses.
 *
 * Counted apart from `countIn` for the opposite reason to new places: these
 * dots ARE in a bucket, and they keep it. A removed stop's colour still says
 * what happens to the buses within a walk of it, and on a weekday at 400 m
 * that colour is "more service" at 95 of them and "doubled or better" at 27.
 * Adding this to the bucket rows would double-count the dots; folding it into
 * one of them would delete the other half of what the dot says.
 *
 * So this is a count of a MARK, not of an outcome, and the key has to put it
 * under its own heading or a reader will add the column up.
 */
export function countRemovedIn(points: ChangePoint[], scope: Scope): number {
  let n = 0;
  for (const p of points) if (scope(p) && field(p, REMOVED) === 1) n++;
  return n;
}

function inBounds(p: ChangePoint, west: number, south: number,
                  east: number, north: number): boolean {
  const lat = field(p, 0), lon = field(p, 1);
  return lat >= south && lat <= north && lon >= west && lon <= east;
}

/** Boardings in scope per bucket, and how much of the scope they speak for. */
export interface RiderTally {
  /** Observed daily boardings, summed per bucket. */
  riders: Record<string, number>;
  /** How many locations each of those totals is made of. */
  measured: Record<string, number>;
  /** Stops in scope the usage extract has no figure for — see below. */
  unmeasured: number;
  /**
   * Boardings at the stops the plan removes, which are in no bucket.
   *
   * They leave the colour rows with the dots, and they are the most at-risk
   * riders the view can show, so they travel here rather than being dropped:
   * the key puts them on the cross's row and in its head total.
   */
  removedRiders: number;
  /** How many removed stops that total is made of. */
  removedMeasured: number;
}

/**
 * The same points as `countIn`, weighted by who boards at them.
 *
 * The second denominator for one set of dots (convention 15). Counting
 * locations says the plan strands 633 places; counting boardings says those
 * places carry 0.8% of the system's riders. Both are true, which is why this
 * sits beside the location count rather than replacing it.
 *
 * A stop with no ridership record is kept out of every total and counted
 * separately, never folded in as a zero: the extract simply has no figure for
 * it, and a 0 would state a boardings finding the data cannot support. The
 * legend renders `unmeasured` as a sentence for that reason.
 *
 * The places the plan adds a stop to are outside this entirely, not merely
 * unmeasured. Nobody boards where no bus stops, so they can never carry an
 * observed figure -- that is convention 15's one-sidedness, and the legend
 * says it in its own row rather than inside this total.
 */
export function sumRidersIn(
  points: ChangePoint[], dayIndex: number, keys: string[], scope: Scope,
): RiderTally {
  const tally: RiderTally = {
    riders: {}, measured: {}, unmeasured: 0,
    removedRiders: 0, removedMeasured: 0,
  };
  for (const k of keys) {
    tally.riders[k] = 0;
    tally.measured[k] = 0;
  }
  for (const p of points) {
    // Today's stops, like `countIn`: this is the same dots under a second
    // denominator, so it cannot be counted over a different set. It also
    // makes `unmeasured` mean what the legend says it means -- stops the
    // usage extract has no figure for, rather than those plus every location
    // that cannot have one.
    if (!scope(p) || field(p, PUBLISHED) === 0) continue;
    const key = keys[field(p, BUCKET(dayIndex))];
    if (key === undefined) continue;
    const n = riders(p, dayIndex);
    // A removed stop is in no bucket, for the same reason it wears no colour.
    // The missing-record rule is the one thing that does not change with it:
    // no figure is still named rather than added as a zero.
    const gone = field(p, REMOVED) === 1;
    if (n === null) {
      if (key !== 'none') tally.unmeasured++;
      continue;
    }
    if (gone) {
      tally.removedRiders += n;
      tally.removedMeasured++;
      continue;
    }
    tally.riders[key] += n;
    tally.measured[key]++;
  }
  return tally;
}

export function toGeoJSON(layer: ChangeLayer) {
  const keys = layer.buckets.map((b) => b.key);
  return {
    type: 'FeatureCollection' as const,
    features: layer.points
      // `none` is not drawn: a location with no bus on either side on this day
      // is not a change, and 464 of them on a Saturday would read as a fifth
      // colour of outcome rather than as an absence.
      .filter((p) => DAYS.some((_d, i) => keys[field(p, BUCKET(i))] !== 'none'))
      .map((p) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [p[1], p[0]] },
        properties: {
          id: pointId(p),
          published: p[2],
          removed: p[REMOVED],
          name: p[NAME],
          // `null` where the plan leaves the pole where it stands, which is
          // 6,540 of the 6,765 — see ChangeLayer.moved.
          moved: layer.moved?.[pointId(p)] ?? null,
          // `null`, never 0: no replacement inside the search bound is not a
          // replacement at zero metres, and the hover says the two apart.
          // Split into two flat properties because a MapLibre feature property
          // holding an array cannot be read back by an expression, and the
          // hover reads these off the rendered feature.
          replacement: layer.replacement?.[pointId(p)]?.[0] ?? null,
          nearestStraight: layer.replacement?.[pointId(p)]?.[1] ?? null,
          ...Object.fromEntries(DAYS.flatMap((_d, i) => [
            [`b${i}`, keys[field(p, BUCKET(i))]],
            // The pole's own trips, not the walk radius's — see types.ts.
            [`sc${i}`, p[STOP_CUR(i)]],
            [`sp${i}`, p[STOP_PROP(i)]],
          ])),
        },
      })),
  };
}

/** `['match', ['get', 'b0'], 'gone', '#e8232f', ..., fallback]` */
function rampExpr(dayIndex: number, field: 'color' | 'size'): any {
  const cases = Object.entries(STYLE).flatMap(([k, s]) => [k, s[field]]);
  return ['match', ['get', `b${dayIndex}`], ...cases, STYLE.none[field]];
}

/** The ramp, except that a new place takes no colour from it -- see above. */
function colorExpr(dayIndex: number): any {
  return ['case', NEW_PLACE, 'rgba(0,0,0,0)', rampExpr(dayIndex, 'color')];
}

/** One size for a new place: it has no bucket, so it has no bucket's size. */
function baseSizeExpr(dayIndex: number): any {
  return ['case', NEW_PLACE, NEW_PLACE_SIZE, rampExpr(dayIndex, 'size')];
}

function sizeExpr(dayIndex: number): any {
  // Dots shrink with zoom rather than staying fixed: at county scale the layer
  // has to read as a field of colour, and at street scale as individual
  // locations you can aim at.
  return ['interpolate', ['linear'], ['zoom'],
    9, ['*', baseSizeExpr(dayIndex), 0.45],
    12, baseSizeExpr(dayIndex),
    16, ['*', baseSizeExpr(dayIndex), 1.9]];
}

export function initChangeLayer(map: maplibregl.Map) {
  map.addSource(SRC, {
    type: 'geojson',
    // The server's own name for a dot becomes the feature id, which is what
    // lets a painted selection be held as a set of ids and drawn with feature
    // state instead of by rewriting the whole collection on every stroke.
    promoteId: 'id',
    data: { type: 'FeatureCollection', features: [] } as any,
  });
  // Beneath the walk circle and the two stop layers, which belong to whatever
  // point the reader has clicked and must stay legible on top of it.
  map.addLayer({
    id: LAYER, type: 'circle', source: SRC,
    paint: {
      'circle-color': colorExpr(0),
      'circle-radius': sizeExpr(0),
      'circle-opacity': 0.85,
      // A near-white halo, not a dark hairline, and one that grows with zoom.
      // A dark stroke does nothing for a pale dot on Positron's near-white
      // ground -- it doesn't separate the dot from the basemap, since the
      // basemap is already dark by comparison. And in the "Both" view a dot
      // sits on a surface cell of its OWN colour -- a green dot on green
      // ground -- so the halo is what keeps the dot visible against the layer
      // that agrees with it, not against the basemap it's already clear of.
      // A new place is drawn BY its outline, so the outline is ink there and
      // a halo everywhere else. Selection still wins: it is the only state a
      // reader creates themselves, and it has to be visible on either mark.
      'circle-stroke-color': ['case',
        SELECTED, SELECTED_HALO, NEW_PLACE, NEW_PLACE_INK, 'rgba(255,255,255,.9)'],
      // A selected dot is drawn with a heavier, darker ring and nothing else.
      // Colour and size are both taken here -- they carry the bucket, which is
      // a published criterion -- so the halo is the only channel left that can
      // say "this one is in the count" without saying something untrue about
      // how much service it lost.
      // The selection test sits INSIDE the zoom ramp rather than around it:
      // MapLibre allows only one zoom-based interpolate per expression.
      // Heavier for a new place than for a filled dot's halo: there the
      // stroke separates a dot from the ground, here it IS the dot.
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'],
        9, ['case', SELECTED, 1.6, NEW_PLACE, 0.9, 0.5],
        12, ['case', SELECTED, 2.4, NEW_PLACE, 1.5, 1],
        16, ['case', SELECTED, 3.2, NEW_PLACE, 2.2, 1.6]],
    },
  }, 'walk-fill');

  // A painted cross has to show that it is in the count, and a symbol layer
  // has no stroke to thicken -- an image icon takes neither `icon-color` nor
  // a halo. So the selection ring for a removed stop is a circle drawn under
  // the cross, and only ever when that stop is selected: convention 17 says
  // the scope a reader paints must be visible on the thing they painted.
  // Selection cannot be a FILTER here -- MapLibre reads feature state in paint
  // expressions but not in filters -- so the layer holds every removed stop
  // and draws a ring only on the selected ones, at width 0 otherwise.
  map.addLayer({
    id: REMOVED_SEL_LAYER, type: 'circle', source: SRC,
    filter: REMOVED_STOP,
    paint: {
      'circle-color': 'rgba(0,0,0,0)',
      'circle-stroke-color': SELECTED_HALO,
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 3.5, 12, 6, 16, 10],
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'],
        9, ['case', SELECTED, 1.6, 0],
        12, ['case', SELECTED, 2.4, 0],
        16, ['case', SELECTED, 3.2, 0]],
    },
  }, 'walk-fill');

  // The cross rides in its own layer, and it is the only thing drawn at a
  // removed stop -- see REMOVED_STOP. Overlap is allowed: a suppressed cross
  // would silently unmark a removed stop in exactly the dense corridors where
  // the removals cluster, and "no cross" has to keep meaning "not removed".
  if (!map.hasImage(REMOVED_ICON)) {
    map.addImage(REMOVED_ICON, crossIcon(), { pixelRatio: 2 });
  }
  map.addLayer({
    id: REMOVED_LAYER, type: 'symbol', source: SRC,
    filter: REMOVED_STOP,
    layout: {
      'icon-image': REMOVED_ICON,
      // Tracks the dots' own zoom growth, and stays a little wider than they
      // are: an X exactly the size of the dot paints over the colour it is
      // crossing, and the colour is the other half of what the mark says.
      // Wider, the dot reads in the four quadrants between the arms.
      'icon-size': ['interpolate', ['linear'], ['zoom'],
        9, 0.34, 12, 0.55, 16, 1.0],
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
  }, 'walk-fill');
}

export async function loadChangeLayer(map: maplibregl.Map, radius: number, day: Day) {
  // Held for the life of the page: the dot layer is the same 150 KB at a
  // radius the reader has already visited, and toggling 400 m -> 150 m ->
  // 400 m was three round trips of about half a second each.
  data = await fetchJSONOnce<ChangeLayer>(`/api/change?radius=${radius}`);
  (map.getSource(SRC) as maplibregl.GeoJSONSource).setData(toGeoJSON(data) as any);
  // The dots are the same set at either radius (query.change_points), so a
  // selection survives a radius change -- but the feature state does not
  // survive the data being replaced under it.
  restoreSelection(map);
  setChangeDay(map, day);
  return data;
}

export function setChangeDay(map: maplibregl.Map, day: Day) {
  const i = DAYS.indexOf(day);
  map.setPaintProperty(LAYER, 'circle-color', colorExpr(i));
  map.setPaintProperty(LAYER, 'circle-radius', sizeExpr(i));
  applyFilter(map, day);
}

export function toggleBucket(map: maplibregl.Map, key: string, day: Day) {
  if (hidden.has(key)) hidden.delete(key);
  else hidden.add(key);
  applyFilter(map, day);
}

export function resetBuckets(map: maplibregl.Map, day: Day) {
  hidden.clear();
  applyFilter(map, day);
}

function applyFilter(map: maplibregl.Map, day: Day) {
  const i = DAYS.indexOf(day);
  const off = ['none', ...hidden];
  // New places answer to their own switch, not to a bucket's: they are no
  // longer drawn in a bucket's colour, so hiding `doubled` must not take the
  // 44 new places whose service happens to double with it.
  const visible: any = ['case',
    NEW_PLACE, !hidden.has(NEW_PLACE_KEY),
    ['!', ['in', ['get', `b${i}`], ['literal', off]]]];
  // A removed stop is drawn by its cross alone, so it is kept out of the dot
  // layer entirely rather than drawn underneath one.
  map.setFilter(LAYER, ['all', ['!', REMOVED_STOP], visible] as any);
  // And the cross answers only to its own switch. It is in no bucket now, so
  // hiding "more service" must not take the 192 removed stops whose radius
  // gains service with it -- the key would then be hiding a row it is still
  // counting.
  const crosses: any = ['all', REMOVED_STOP, !hidden.has(REMOVED_KEY)];
  map.setFilter(REMOVED_LAYER, crosses);
  // The selection ring rides with the mark it belongs to, or switching the
  // crosses off would leave rings around stops that are no longer drawn.
  map.setFilter(REMOVED_SEL_LAYER, crosses);
}

/**
 * The pole a dot is drawn at: its name, its stop id, and where the plan
 * stands it.
 *
 * A dot IS a pole — one point per stop id — so this is a fact about the dot
 * rather than a summary of the ground under it, and it goes above the divider
 * for that reason: the lines beneath answer for everything within a walk of
 * here, which is a different question with a different answer.
 *
 * The move is phrased as something the plan does rather than as a distance
 * the pole has travelled, because the dot is standing on today's kerb while
 * it says it.
 */
function poleLine(props: any): string {
  const stopId = String(props.id ?? '').split(':')[1] ?? '';
  const moved = props.moved != null
    ? `<br>the plan stands this pole ${props.moved} m away` : '';
  return `<b>${props.name}</b><br>stop ${stopId}${moved}` +
    `<div style="margin-top:6px;padding-top:6px;` +
    `border-top:1px solid rgba(255,255,255,.18)"></div>`;
}

/**
 * Hover text for one dot: the pole, then the buses at its own kerb.
 *
 * Trips both sides, never a bare delta — and since 2026-09-10 they are the
 * trips at THIS KERB. Stop-by-stop is the view about stops; the walk radius is
 * what the Surface view and the answer panel are for, and printing its counts
 * here told a reader hovering a downtown dot that 1,591 buses served it on a
 * weekday.
 *
 * The bucket line beneath is now the SAME measurement in words -- the colour
 * is `query.bucket()` on the two numbers printed above it. It ran scoped
 * "nearby" for half a day, while the number was the pole's and the colour was
 * the radius's; Max ruled that a view whose two channels answer different
 * questions is the defect, not the missing scope word.
 *
 * `pole: false` suppresses the pole heading, and exists for one caller: the
 * marks a pin drops name the pole themselves and print this beneath their own
 * divider, so leaving it on would name the same stop twice in one tooltip.
 */
export function dotLabel(props: any, day: Day,
                         buckets: { key: string; label: string }[],
                         { pole = true }: { pole?: boolean } = {}) {
  const i = DAYS.indexOf(day);
  const key = props[`b${i}`];
  // Neither a new place nor a removed stop is drawn in a bucket, so neither
  // reports one here: the tooltip was the last place that contradiction
  // survived. Both still report their pole's own buses, which is true of the
  // kerb either way -- at a removed stop as "Currently 37 at this stop",
  // under the removal sentence `removedLine` supplies. Not "37 -> 0": that
  // sentence has already said the plan runs nothing here, and the arrow
  // restated it as a change in service at a stop the plan does not have.
  const gone = props.removed === 1;
  // Unscoped, because there is nothing left to scope it against: the bucket
  // index the dot was drawn with is `query.bucket()` applied to the very two
  // numbers on the line above. Do not reintroduce "nearby" or any other
  // radius word here without moving the colour back to the radius too —
  // matching the words to the colour is the whole point of this pair.
  const label = props.published === 0
    ? 'the plan adds a stop here'
    : (buckets.find((b) => b.key === key)?.label ?? key);
  const cur = props[`sc${i}`], prop = props[`sp${i}`];
  const dayWord = day === 'weekday' ? 'weekday' : day;
  const count = gone ? `Currently ${cur}` : `${cur} → ${prop}`;
  return `${pole ? poleLine(props) : ''}${removedLine(props)}` +
    `${count} buses per ${dayWord} at this stop<br>` +
    `${gone ? '' : `<b>${label}</b><br>`}` +
    `<span style="opacity:.6">click for the full comparison</span>`;
}

/**
 * When the walk and the straight line are far enough apart to print both.
 *
 * The countywide median walk is 1.22x its own straight line, so at any low
 * threshold most of the 1,308 removals would carry a second number saying
 * nothing. Above this one the gap is itself the finding, and it answers a
 * question the reader is already asking: Mt Troy Rd + Beckert reports a 651 m
 * walk while the map shows a surviving stop 301 m away, because the ones on
 * Lowrie St are 863 m on foot around a ravine. Max set the threshold on
 * 2026-09-09, after that hover read as a bug.
 *
 * Measured against the nearest stop AS THE CROW FLIES, not against the
 * straight line to the stop the walk found — that pair is only 1.30x here and
 * would have left this very hover unexplained.
 */
const STRAIGHT_LINE_NOTE_RATIO = 1.5;

/**
 * How far `build_webdb.write_stop_fates` searched, on foot and as the crow
 * flies, before calling a removed stop stranded. Mirrored here because the
 * hover both names the bound in words and measures the stranded case against
 * it: a walk that failed is a walk longer than this.
 */
const REPLACEMENT_SEARCH_M = 800;

/**
 * What became of the stop itself, above what became of the service near it.
 *
 * This is the sentence the map owed a reader standing at a stop the plan
 * consolidates. Before it existed, Fifth Avenue at Gist Street — where PRT
 * moves the stop 170 m up the block to Wyandotte — reported "loses all
 * service, 489 → 0" at the 150 m setting and nothing at all about the stop,
 * and a reader who lives there quite reasonably read that as the buses
 * leaving Uptown.
 *
 * The distance is a walk, not a straight line, because the reader is going to
 * walk it — with the straight line beside it where the ground puts the two
 * far apart, see STRAIGHT_LINE_NOTE_RATIO. Where the search found nothing
 * within `REPLACEMENT_SEARCH_M` this says so in words instead of printing a
 * number it doesn't have: 536 of the 1,308 removals are in that position, and
 * they are the withdrawals proper.
 */
export function removedLine(props: any): string {
  if (props.removed !== 1) return '';
  const m = props.replacement, straight = props.nearestStraight;
  // "the nearest ... is", not "it is": the two distances are to different
  // stops here, and a parenthetical would be read as one stop measured twice.
  // A stranded stop has no walk to compare, but it has a bound: whatever the
  // walk is, it is longer than the search. That case is the sharpest version
  // of the same confusion, not an exception to it.
  const walked = m ?? REPLACEMENT_SEARCH_M;
  const detour = straight != null
      && walked > straight * STRAIGHT_LINE_NOTE_RATIO
    ? `; the nearest in a straight line is ${
        Math.round(straight).toLocaleString()} m`
    : '';
  const where = m == null
    ? `no other stop within a ${REPLACEMENT_SEARCH_M} m walk${detour}`
    : `nearest stop is a ${Math.round(m).toLocaleString()} m walk${detour}`;
  return `<b style="color:${REMOVED_INK}">Stop removed</b> — ${where}<br>`;
}
