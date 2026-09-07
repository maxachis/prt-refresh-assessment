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
 *  - COLOUR IS NOT THE ONLY CHANNEL. Size carries the same signal, so the
 *    extremes are still the extremes for a reader who cannot separate the red
 *    from the green.
 *  - EVERY COUNT SAYS WHICH DAY TYPE IT IS. 152 locations keep their weekday
 *    buses and lose the weekend entirely; on a weekday-only map they are
 *    invisible, so the day control governs this layer and not just the panel.
 */
import {
  ChangeLayer, ChangePoint, Day, DAYS, BUCKET, CUR, PROP, field, riders,
  pointId,
} from './types';
import { fetchJSON } from './utils';

/**
 * Colour and size per bucket, in ramp order.
 *
 * Red for loss and green for gain matches the delta colours the panel already
 * uses, which is worth more than picking a colour-blind-optimal pair the rest
 * of the app would then contradict. The redundancy is size: `gone` and `new`
 * are the largest dots on the map and `same` the smallest, so the extremes
 * survive any colour deficiency.
 *
 * The ramp is also balanced for CONTRAST against the basemap, not just for
 * saturation. Gains at the previous brightness read ~1.6:1 against Positron
 * where losses read ~3.1:1 -- "gains as loud as losses" was true of hue and
 * size but not of the one channel that decides whether you see a dot at all.
 * frontend/contrast.test.ts now enforces a 2.5:1 floor per bucket and 6%
 * loss/gain symmetry, so this can't silently drift back.
 */
export const STYLE: Record<string, { color: string; size: number }> = {
  gone:    { color: '#e8232f', size: 6 },
  halved:  { color: '#ef5c33', size: 4.5 },
  less:    { color: '#b06a55', size: 3 },
  same:    { color: '#6b7280', size: 2.5 },
  more:    { color: '#478a68', size: 3 },
  doubled: { color: '#12a163', size: 4.5 },
  new:     { color: '#0f79c9', size: 6 },
  none:    { color: '#3a3f4a', size: 2 },
};

const SRC = 'change';
const LAYER = 'change-dots';

/** `true` for a dot the reader has painted. */
const SELECTED: any = ['boolean', ['feature-state', 'selected'], false];
/** Ink, not a hue: the ramp owns every colour that means something here. */
const SELECTED_HALO = '#15181e';

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
 * runs on every pointer move of a drag.
 */
export function addToSelection(map: maplibregl.Map, ids: Iterable<string>) {
  for (const id of ids) {
    if (selected.has(id)) continue;
    selected.add(id);
    mark(map, id, true);
  }
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
  return map.queryRenderedFeatures(box as any, { layers: [LAYER] })
    .map((f) => f.id as string)
    .filter((id) => id !== undefined);
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
    if (!scope(p)) continue;
    const key = keys[field(p, BUCKET(dayIndex))];
    if (key !== undefined) out[key]++;
  }
  return out;
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
  /** Locations in scope with no ridership record at all — see below. */
  unmeasured: number;
}

/**
 * The same points as `countIn`, weighted by who boards at them.
 *
 * The second denominator for one set of dots (convention 15). Counting
 * locations says the plan strands 633 places; counting boardings says those
 * places carry 0.8% of the system's riders. Both are true, which is why this
 * sits beside the location count rather than replacing it.
 *
 * A location with no ridership record is kept out of every total and counted
 * separately, never folded in as a zero. Those are the places the proposed
 * network serves and today's does not: no bus stops there now, so nobody
 * boards there now, and a 0 in the `new` row would read as a finding about the
 * plan's gains rather than as the absence of any way to measure them. The
 * legend renders `unmeasured` as a sentence for that reason.
 */
export function sumRidersIn(
  points: ChangePoint[], dayIndex: number, keys: string[], scope: Scope,
): RiderTally {
  const tally: RiderTally = { riders: {}, measured: {}, unmeasured: 0 };
  for (const k of keys) {
    tally.riders[k] = 0;
    tally.measured[k] = 0;
  }
  for (const p of points) {
    if (!scope(p)) continue;
    const key = keys[field(p, BUCKET(dayIndex))];
    if (key === undefined) continue;
    const n = riders(p, dayIndex);
    if (n === null) {
      if (key !== 'none') tally.unmeasured++;
      continue;
    }
    tally.riders[key] += n;
    tally.measured[key]++;
  }
  return tally;
}

function toGeoJSON(layer: ChangeLayer) {
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
          ...Object.fromEntries(DAYS.flatMap((_d, i) => [
            [`b${i}`, keys[field(p, BUCKET(i))]],
            [`c${i}`, p[CUR(i)]],
            [`p${i}`, p[PROP(i)]],
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

function sizeExpr(dayIndex: number): any {
  // Dots shrink with zoom rather than staying fixed: at county scale the layer
  // has to read as a field of colour, and at street scale as individual
  // locations you can aim at.
  return ['interpolate', ['linear'], ['zoom'],
    9, ['*', rampExpr(dayIndex, 'size'), 0.45],
    12, rampExpr(dayIndex, 'size'),
    16, ['*', rampExpr(dayIndex, 'size'), 1.9]];
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
      'circle-color': rampExpr(0, 'color'),
      'circle-radius': sizeExpr(0),
      'circle-opacity': 0.85,
      // A near-white halo, not a dark hairline, and one that grows with zoom.
      // A dark stroke does nothing for a pale dot on Positron's near-white
      // ground -- it doesn't separate the dot from the basemap, since the
      // basemap is already dark by comparison. And in the "Both" view a dot
      // sits on a surface cell of its OWN colour -- a green dot on green
      // ground -- so the halo is what keeps the dot visible against the layer
      // that agrees with it, not against the basemap it's already clear of.
      'circle-stroke-color': ['case', SELECTED, SELECTED_HALO, 'rgba(255,255,255,.9)'],
      // A selected dot is drawn with a heavier, darker ring and nothing else.
      // Colour and size are both taken here -- they carry the bucket, which is
      // a published criterion -- so the halo is the only channel left that can
      // say "this one is in the count" without saying something untrue about
      // how much service it lost.
      // The selection test sits INSIDE the zoom ramp rather than around it:
      // MapLibre allows only one zoom-based interpolate per expression.
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'],
        9, ['case', SELECTED, 1.6, 0.5],
        12, ['case', SELECTED, 2.4, 1],
        16, ['case', SELECTED, 3.2, 1.6]],
    },
  }, 'walk-fill');
}

export async function loadChangeLayer(map: maplibregl.Map, radius: number, day: Day) {
  data = await fetchJSON<ChangeLayer>(`/api/change?radius=${radius}`);
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
  map.setPaintProperty(LAYER, 'circle-color', rampExpr(i, 'color'));
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
  map.setFilter(LAYER, ['!', ['in', ['get', `b${i}`], ['literal', off]]] as any);
}

/** Hover text for one dot. Trips both sides, never a bare delta. */
export function dotLabel(props: any, day: Day, buckets: { key: string; label: string }[]) {
  const i = DAYS.indexOf(day);
  const key = props[`b${i}`];
  const label = buckets.find((b) => b.key === key)?.label ?? key;
  const cur = props[`c${i}`], prop = props[`p${i}`];
  const dayWord = day === 'weekday' ? 'weekday' : day;
  return `<b>${label}</b><br>${cur} → ${prop} buses per ${dayWord}<br>` +
    `<span style="opacity:.6">click for the full comparison</span>`;
}
