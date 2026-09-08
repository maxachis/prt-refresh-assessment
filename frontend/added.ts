/**
 * The stops the plan adds — the one layer here whose unit is a stop, not a
 * reading taken at one.
 *
 * It exists because the layer underneath it kept being asked a question it
 * cannot answer. The Locations dots are measurement points for a walk-access
 * question: a proposed stop earns a dot of its own only where nothing stops
 * within the walk radius today, so infill a couple of hundred metres from an
 * existing stop is drawn as a colour change on that stop's dot and the new
 * kerb stays bare. Three separate readers — PPT on Penn Avenue, then a PRT
 * consultant on the four stops route 34 gains on McMonagle Avenue — have read
 * that bare ground as the plan's gain missing from the data. 400 of the 521
 * added stops are in that position, and a sentence in the key did not fix it,
 * because a caveat does not compete with the absence of a mark on the street
 * a reader is looking at.
 *
 * Three rules keep it from becoming a measurement it is not.
 *
 *  - IT IS AN INVENTORY, NOT A READING. Every other citywide layer paints a
 *    number that means something about change — a bucket, a percentage, a
 *    count of residents. A ring here says only "the proposed feed stops a bus
 *    at this kerb", and the hover says which routes and how many trips.
 *    Whether the neighbourhood gains *access* is the dots' question and the
 *    surface's, and this layer must never be quoted for it.
 *  - IT ENTERS NO COUNT. These stops are not in `query.change_points`, so no
 *    published bucket count, boardings total or area figure moves because
 *    they became visible. Convention 15's asymmetry holds here too: a stop
 *    the plan adds has no observed boardings and never can, so there is
 *    nothing to weigh it by and the Riders switch leaves it alone.
 *  - A RING, NOT A DOT, AND THAT IS THE WHOLE POINT OF THE SHAPE. Every mark
 *    in the change ramp is a filled disc carrying a bucket. An unfilled ring
 *    reads as a different kind of thing at a glance, which is what stops a
 *    reader counting it into the ramp's tallies. Its blue is the surface's
 *    and the street view's NEW_COLOR, imported rather than re-typed, so
 *    "blue means the plan adds something" holds across all three.
 *
 * It is drawn ABOVE the dots and defaults to ON in the views that have dots.
 * Off by default would have left the reader who does not know to look exactly
 * where the three reports found them.
 */
import { AddedStop, Day, DAYS } from './types';
import { fetchJSON } from './utils';
import { NEW_COLOR } from './surface';

const SRC = 'added-stops';
const LAYER = 'added-stop-rings';

/** The ring's stroke. Shared with the surface and the street view. */
export const ADDED_STOP_COLOR = NEW_COLOR;

/**
 * The disc inside the ring, near-white rather than transparent.
 *
 * A truly hollow ring over Positron takes whatever is under it — a road
 * casing, a park fill, another dot — and at city zoom that reads as noise
 * rather than as a mark. An opaque centre makes the ring a marker, and keeps
 * it distinguishable from the ramp's filled discs, which is the job the shape
 * is doing.
 */
const ADDED_STOP_FILL = '#ffffff';

let data: AddedStop[] | null = null;
let visible = false;

export function layerData(): AddedStop[] | null {
  return data;
}

export function isVisible(): boolean {
  return visible;
}

export function toGeoJSON(stops: AddedStop[]) {
  return {
    type: 'FeatureCollection' as const,
    features: stops.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lon, s.lat] },
      properties: {
        stop_id: s.stop_id,
        name: s.name,
        routes: s.routes.join(', '),
        ...Object.fromEntries(DAYS.map((d) => [d, s.trips[d] ?? 0])),
      } as Record<string, string | number>,
    })),
  };
}

/** How many of them are on screen, for the key's own row. */
export function countInBounds(
  stops: AddedStop[],
  west: number, south: number, east: number, north: number,
): number {
  return stops.filter((s) => s.lon >= west && s.lon <= east
    && s.lat >= south && s.lat <= north).length;
}

/**
 * The hover text: the stop's name, its routes, and its calls on the day the
 * reader has selected.
 *
 * The day is named in the sentence rather than assumed, because this layer's
 * own control has no day type — a stop is a stop on every calendar — and the
 * trip count beside it is the one thing here that does move with the day
 * switch in the toolbar.
 */
export function hoverHTML(p: Record<string, any>, day: Day): string {
  const n = Number(p[day] ?? 0);
  return `<b>${p.name}</b><br>a stop the plan adds · route ${p.routes}
    <br>${n} ${n === 1 ? 'call' : 'calls'} on a ${day === 'weekday' ? 'weekday'
    : day === 'saturday' ? 'Saturday' : 'Sunday'}`;
}

/** Radius and stroke both grow with zoom, so the ring stays a ring. */
function radiusExpr(): any {
  return ['interpolate', ['linear'], ['zoom'], 9, 2.5, 13, 4.5, 16, 7];
}

function strokeExpr(): any {
  return ['interpolate', ['linear'], ['zoom'], 9, 1, 13, 1.6, 16, 2.4];
}

export function initAddedStopsLayer(map: maplibregl.Map, beforeId: string) {
  map.addSource(SRC, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] } as any,
  });
  map.addLayer({
    id: LAYER, type: 'circle', source: SRC,
    layout: { visibility: 'none' },
    paint: {
      'circle-radius': radiusExpr(),
      'circle-color': ADDED_STOP_FILL,
      'circle-opacity': 0.95,
      'circle-stroke-width': strokeExpr(),
      'circle-stroke-color': ADDED_STOP_COLOR,
    },
  }, beforeId);
}

export async function loadAddedStops(map: maplibregl.Map) {
  data = await fetchJSON<AddedStop[]>('/api/added-stops');
  (map.getSource(SRC) as maplibregl.GeoJSONSource).setData(toGeoJSON(data) as any);
  return data;
}

export function setAddedStopsVisible(map: maplibregl.Map, on: boolean) {
  visible = on;
  map.setLayoutProperty(LAYER, 'visibility', on ? 'visible' : 'none');
}

/** The hover popup, wired once at startup. */
export function initAddedStopsHover(map: maplibregl.Map, activeDay: () => Day) {
  const popup = new maplibregl.Popup({ closeButton: false, offset: 10 });
  map.on('mouseenter', LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', LAYER, () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });
  map.on('mousemove', LAYER, (e: any) => {
    const f = e.features?.[0];
    if (!f) return;
    popup.setLngLat(e.lngLat).setHTML(hoverHTML(f.properties, activeDay()))
      .addTo(map);
  });
}

export const ADDED_STOPS_LAYER_ID = LAYER;
