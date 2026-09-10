/**
 * The plan's own stops, drawn as poles rather than as locations.
 *
 * Every other reading of change on this map is a question about a LOCATION —
 * how much service is within a walk of this point — and the dot layer is
 * built to match: one dot per location, where a proposed stop within
 * `UNIVERSE_DEDUP_M` (150 m) of a stop that runs today is not a location of
 * its own. That is the honest drawing of a walk-access question, and it has
 * one consequence that reads as an omission. A stop the plan adds a couple of
 * hundred metres from an existing one earns no dot: its gain lands in the
 * colour of the neighbouring dot and its own kerb stays bare. 496 of the
 * plan's 5,413 poles are in that position, and two readers — PPT and PRT —
 * separately took the bare ground for the plan's stops missing from the data.
 *
 * Until 2026-09-10 the only way to see those poles was to drop a pin beside
 * them, which put the answer behind a click nobody knew to make; Max hit it
 * three times in one morning. So the poles get a layer of their own.
 *
 * Three rules keep it from being mistaken for a measure:
 *
 *  - IT IS A RING, NEVER A FILLED DOT, and it borrows the mark the pin
 *    already uses for a proposed stop (`mapview.PROP`). A reader who has met
 *    the orange ring beside a click meets the same mark here.
 *  - IT COUNTS NOTHING. No row in the key carries a number for it, because a
 *    pole count and a location count in one box invite being added together,
 *    and they are different units (conventions 1 and 2).
 *  - IT WAITS FOR STREET ZOOM. 5,413 rings over the county is a smear, and
 *    the question it answers — does the plan put a stop on this street — is a
 *    street-level one.
 */
import { fetchJSON } from './utils';
import { PROP } from './mapview';

const SRC = 'plan-stops';
const LAYER = 'plan-stops-c';

/** Below this the rings merge into a smear. See the module docstring. */
export const MIN_ZOOM = 14;

/** [lat, lon, stop_id, name], as `query.plan_stops` writes them. */
export type PlanStop = [number, number, string, string];

let data: PlanStop[] | null = null;

export function planStopsData(): PlanStop[] | null {
  return data;
}

export function toGeoJSON(stops: PlanStop[]) {
  return {
    type: 'FeatureCollection' as const,
    features: stops.map(([lat, lon, stop_id, name]) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [lon, lat] },
      properties: { stop_id, name },
    })),
  };
}

export function initPlanStopsLayer(map: maplibregl.Map, beforeId: string) {
  map.addSource(SRC, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] } as any,
  });
  map.addLayer({
    id: LAYER, type: 'circle', source: SRC, minzoom: MIN_ZOOM,
    layout: { visibility: 'none' },
    paint: {
      // Hollow, so a dot underneath still reads: at a pole both networks keep
      // this ring sits around today's dot exactly as the pin's mark does.
      'circle-color': 'rgba(0,0,0,0)',
      'circle-stroke-color': PROP,
      'circle-radius': ['interpolate', ['linear'], ['zoom'],
        MIN_ZOOM, 3, 16, 5.5, 18, 8],
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'],
        MIN_ZOOM, 1, 16, 1.5, 18, 2],
    },
  }, beforeId);
}

export async function loadPlanStops(map: maplibregl.Map) {
  if (!data) data = await fetchJSON<PlanStop[]>('/api/stops/all?side=proposed');
  (map.getSource(SRC) as maplibregl.GeoJSONSource)
    .setData(toGeoJSON(data) as any);
  return data;
}

export async function setPlanStopsVisible(map: maplibregl.Map, on: boolean) {
  if (on && !data) await loadPlanStops(map);
  if (map.getLayer(LAYER)) {
    map.setLayoutProperty(LAYER, 'visibility', on ? 'visible' : 'none');
  }
}

export const PLAN_STOPS_LAYER = LAYER;
