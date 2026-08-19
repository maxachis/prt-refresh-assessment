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
import { ChangeLayer, ChangePoint, Day, DAYS, BUCKET, CUR, PROP } from './types';
import { fetchJSON } from './utils';

/**
 * Colour and size per bucket, in ramp order.
 *
 * Red for loss and green for gain matches the delta colours the panel already
 * uses, which is worth more than picking a colour-blind-optimal pair the rest
 * of the app would then contradict. The redundancy is size: `gone` and `new`
 * are the largest dots on the map and `same` the smallest, so the extremes
 * survive any colour deficiency.
 */
export const STYLE: Record<string, { color: string; size: number }> = {
  gone:    { color: '#ff3b47', size: 6 },
  halved:  { color: '#ff8f6e', size: 4.5 },
  less:    { color: '#a8756c', size: 3 },
  same:    { color: '#59606e', size: 2.5 },
  more:    { color: '#6aa387', size: 3 },
  doubled: { color: '#35d98a', size: 4.5 },
  new:     { color: '#4ec3ff', size: 6 },
  none:    { color: '#3a3f4a', size: 2 },
};

const SRC = 'change';
const LAYER = 'change-dots';

let data: ChangeLayer | null = null;
/** Buckets the reader has switched off by clicking the legend. */
const hidden = new Set<string>();

export function layerData(): ChangeLayer | null {
  return data;
}

export function isHidden(key: string): boolean {
  return hidden.has(key);
}

/**
 * Points inside `bounds`, tallied by bucket for one day type.
 *
 * Counted from the raw rows rather than from `queryRenderedFeatures`, which
 * only sees what survived the legend filter and what the current tile has
 * actually drawn. The summary has to keep reporting a bucket the reader has
 * just switched off, or turning a layer off would look like the losses in view
 * had gone away.
 */
export function countInBounds(
  points: ChangePoint[], dayIndex: number, keys: string[],
  west: number, south: number, east: number, north: number,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of keys) out[k] = 0;
  for (const p of points) {
    const lat = p[0], lon = p[1];
    if (lat < south || lat > north || lon < west || lon > east) continue;
    const key = keys[p[BUCKET(dayIndex)]];
    if (key !== undefined) out[key]++;
  }
  return out;
}

function toGeoJSON(layer: ChangeLayer) {
  const keys = layer.buckets.map((b) => b.key);
  return {
    type: 'FeatureCollection' as const,
    features: layer.points
      // `none` is not drawn: a location with no bus on either side on this day
      // is not a change, and 464 of them on a Saturday would read as a fifth
      // colour of outcome rather than as an absence.
      .filter((p) => DAYS.some((_d, i) => keys[p[BUCKET(i)]] !== 'none'))
      .map((p) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [p[1], p[0]] },
        properties: {
          published: p[2],
          ...Object.fromEntries(DAYS.flatMap((_d, i) => [
            [`b${i}`, keys[p[BUCKET(i)]]],
            [`c${i}`, p[CUR(i)]],
            [`p${i}`, p[PROP(i)]],
          ])),
        },
      })),
  };
}

/** `['match', ['get', 'b0'], 'gone', '#ff3b47', ..., fallback]` */
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
      'circle-stroke-width': 0.5,
      'circle-stroke-color': 'rgba(10,12,16,.65)',
    },
  }, 'walk-fill');
}

export async function loadChangeLayer(map: maplibregl.Map, radius: number, day: Day) {
  data = await fetchJSON<ChangeLayer>(`/api/change?radius=${radius}`);
  (map.getSource(SRC) as maplibregl.GeoJSONSource).setData(toGeoJSON(data) as any);
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
