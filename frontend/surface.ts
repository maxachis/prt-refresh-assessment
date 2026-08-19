/**
 * The magnitude surface — the citywide layer as a continuous field.
 *
 * The dots can only be drawn where a stop stands today, which has two costs: a
 * scatter of ~5,900 points is hard to read as a shape, and the layer is blind
 * to ground the plan adds a bus to. This paints the same before-and-after on
 * `analyze_coverage_area.py`'s 100 m lattice, where a cell is a location that
 * need not have a stop on it.
 *
 * The presentation rules are the dots' rules, with one addition:
 *
 *  - THE RAMP IS A DISPLAY CHOICE AND THE BUCKETS ARE NOT. `gone`, `halved`,
 *    `doubled` and `new` are published criteria whose counts docs/answers/
 *    prints; a continuous ramp has no counts to publish. So the ramp passes
 *    THROUGH the bucket colours at the bucket edges — halved is the same
 *    orange here as there — but the surface never reports a bucket tally, and
 *    the legend keeps saying that its counts are locations.
 *  - GAINS READ AS LOUDLY AS LOSSES: the ramp is symmetric about no-change in
 *    both saturation and lightness.
 *  - TOTAL LOSS AND NEW SERVICE ARE STEPS, NOT RAMP ENDS. `gone` is a
 *    categorical outcome, not "a lot less", and letting it fade in from
 *    "quartered" would bury the plainest finding on the map in a gradient.
 *  - AREA IS EXTENT, NOT PEOPLE. A square kilometre of hillside paints like a
 *    square kilometre of Brookline, so the in-view summary reports km² and
 *    says so, and the location counts stay on screen beside it (convention 10:
 *    the two are complements and neither is quoted alone).
 */
import { SurfaceLayer, SurfaceCell, Day, DAYS, S_CUR, S_PROP } from './types';
import { fetchJSON } from './utils';

const SRC = 'surface';
const LAYER = 'surface-fill';

/** The dead-band grey -- same colour as change.ts's `same` bucket, by design. */
export const DEAD_BAND_COLOR = '#6b7280';

/**
 * Ramp anchors in log2(proposed / current), with the colours the dots use at
 * the bucket edges so the two layers agree where they can.
 *
 * ±0.138 is log2(1.10) — the same ±10% dead band the dots' `same` bucket uses,
 * kept so a near service-neutral redesign does not render as a field of faint
 * colour in which nothing stands out. It is the one arbitrary edge here and
 * nothing published rests on it.
 */
export const RAMP: [number, string][] = [
  [-2, '#d01c2f'],          // quartered or worse
  [-1, '#ef5c33'],          // halved — LOSE-FREQUENCY-HALF's edge
  [-0.138, DEAD_BAND_COLOR], // dead band
  [0.138, DEAD_BAND_COLOR],
  [1, '#12a163'],           // doubled — GAIN-FREQUENCY-DOUBLE's edge
  [2, '#0b7a48'],           // quadrupled or better
];

export const GONE_COLOR = '#e8232f';
export const NEW_COLOR = '#0f79c9';
export const RAMP_CLAMP = 2;

let data: SurfaceLayer | null = null;
let visible = false;

export function layerData(): SurfaceLayer | null {
  return data;
}

export function isVisible(): boolean {
  return visible;
}

/**
 * Where a cell sits on the ramp, in log2(prop / cur).
 *
 * Returns null for the two categorical outcomes and for a cell with no service
 * either way, so the caller decides how each is drawn rather than having them
 * smuggled in as ramp extremes.
 */
export function rampValue(cur: number, prop: number): number | null {
  if (cur <= 0 || prop <= 0) return null;
  const v = Math.log2(prop / cur);
  return Math.max(-RAMP_CLAMP, Math.min(RAMP_CLAMP, v));
}

/** 'gone' | 'new' | 'none' | 'ramp' — which of the four ways a cell is drawn. */
export function cellKind(cur: number, prop: number): string {
  if (cur <= 0 && prop <= 0) return 'none';
  if (cur <= 0) return 'new';
  if (prop <= 0) return 'gone';
  return 'ramp';
}

/**
 * Square kilometres in view by outcome, for one day type.
 *
 * The area counterpart of the legend's location counts, and reported in km²
 * rather than as a cell tally because "1,847 cells" is not a unit anybody can
 * argue with PRT about.
 */
export function summariseInBounds(
  cells: SurfaceCell[], dayIndex: number,
  west: number, south: number, east: number, north: number,
  origin: SurfaceLayer['origin'], cellKm2: number,
): Record<string, number> {
  const out = { gone: 0, less: 0, same: 0, more: 0, new: 0 };
  for (const c of cells) {
    const lat = origin.lat0 + (c[1] + 0.5) * origin.dlat;
    const lon = origin.lon0 + (c[0] + 0.5) * origin.dlon;
    if (lat < south || lat > north || lon < west || lon > east) continue;
    const cur = c[S_CUR(dayIndex)], prop = c[S_PROP(dayIndex)];
    const kind = cellKind(cur, prop);
    if (kind === 'none') continue;
    if (kind === 'ramp') {
      const v = rampValue(cur, prop)!;
      out[v < -0.138 ? 'less' : v > 0.138 ? 'more' : 'same'] += cellKm2;
    } else {
      out[kind as 'gone' | 'new'] += cellKm2;
    }
  }
  return out;
}

/** One square per cell, rebuilt from the lattice origin rather than shipped. */
export function toGeoJSON(layer: SurfaceLayer) {
  const { lat0, lon0, dlat, dlon } = layer.origin;
  return {
    type: 'FeatureCollection' as const,
    features: layer.cells.map((c) => {
      const s = lat0 + c[1] * dlat, n = s + dlat;
      const w = lon0 + c[0] * dlon, e = w + dlon;
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]],
        },
        properties: Object.fromEntries(DAYS.flatMap((_d, i) => {
          const cur = c[S_CUR(i)], prop = c[S_PROP(i)];
          return [
            [`k${i}`, cellKind(cur, prop)],
            [`v${i}`, rampValue(cur, prop) ?? 0],
          ];
        })),
      };
    }),
  };
}

/** `['case', gone, red, new, blue, ['interpolate', ...ramp on v]]` */
function colorExpr(dayIndex: number): any {
  return ['case',
    ['==', ['get', `k${dayIndex}`], 'gone'], GONE_COLOR,
    ['==', ['get', `k${dayIndex}`], 'new'], NEW_COLOR,
    ['interpolate', ['linear'], ['get', `v${dayIndex}`],
      ...RAMP.flatMap(([stop, color]) => [stop, color])]];
}

/**
 * Opacity by how much changed, so the eye lands on change rather than on
 * coverage.
 *
 * A field painted at one opacity is mostly the neutral colour -- most ground
 * keeps roughly the service it has -- and the places that did change are then
 * competing with a wall of grey. Fading the middle of the ramp lets the
 * extremes carry, WITHOUT dropping the neutral ground out of the map: it stays
 * visible as covered territory, which is the thing a reader is orienting
 * against, and the legend reports its square kilometres either way. Total loss
 * and new service are never faded.
 */
function opacityExpr(dayIndex: number, peak: number): any {
  return ['case',
    ['in', ['get', `k${dayIndex}`], ['literal', ['gone', 'new']]], peak,
    ['interpolate', ['linear'], ['abs', ['get', `v${dayIndex}`]],
      0, peak * 0.45,
      1, peak]];
}

export function initSurfaceLayer(map: maplibregl.Map, beneath: string) {
  map.addSource(SRC, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] } as any,
  });
  map.addLayer({
    id: LAYER, type: 'fill', source: SRC,
    layout: { visibility: 'none' },
    paint: {
      'fill-color': colorExpr(0),
      // ANTIALIASING OFF, WHICH IS NOT A PERFORMANCE TWEAK. Each cell is its
      // own polygon, and antialiased edges of two abutting squares blend with
      // the basemap instead of each other -- drawing a pale seam along every
      // shared edge. At 48,500 cells that is a visible mesh laid over the
      // whole county, and a lattice artefact that reads as data is the one
      // thing this layer must not do.
      'fill-antialias': false,
      // Translucent on purpose: the streets underneath are how a reader knows
      // which hillside they are looking at, and an opaque field of colour
      // would make the surface unplaceable.
      'fill-opacity': [
        'interpolate', ['linear'], ['zoom'],
        9, opacityExpr(0, 0.85),
        13, opacityExpr(0, 0.62),
        16, opacityExpr(0, 0.45),
      ],
    },
  }, beneath);
}

export async function loadSurfaceLayer(
  map: maplibregl.Map, radius: number, day: Day,
) {
  data = await fetchJSON<SurfaceLayer>(`/api/surface?radius=${radius}`);
  (map.getSource(SRC) as maplibregl.GeoJSONSource).setData(toGeoJSON(data) as any);
  setSurfaceDay(map, day);
  return data;
}

export function setSurfaceDay(map: maplibregl.Map, day: Day) {
  const i = DAYS.indexOf(day);
  map.setPaintProperty(LAYER, 'fill-color', colorExpr(i));
  map.setPaintProperty(LAYER, 'fill-opacity', [
    'interpolate', ['linear'], ['zoom'],
    9, opacityExpr(i, 0.85),
    13, opacityExpr(i, 0.62),
    16, opacityExpr(i, 0.45),
  ]);
}

export function setSurfaceVisible(map: maplibregl.Map, on: boolean) {
  visible = on;
  map.setLayoutProperty(LAYER, 'visibility', on ? 'visible' : 'none');
}
