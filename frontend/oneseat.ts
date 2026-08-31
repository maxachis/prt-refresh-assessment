/**
 * The one-seat layer — can a rider get from here to there without changing bus?
 *
 * Every other view in this app measures a QUANTITY of service: trips within a
 * walk, square kilometres of covered ground, kilometres of street with a bus
 * on it. This one measures a CONNECTION, and the difference runs through all
 * of its presentation decisions.
 *
 *  - ITS DEFAULT HAS NO DAY TYPE, AND THE LEGEND SAYS SO. A route serves a
 *    location or it does not; that is the method `data/oneseat_change.csv`
 *    publishes, and it is why the day control does not move this view unless
 *    the reader opts in. Opting in restricts both ends to routes that call
 *    there on that day type -- a different measurement, whose counts are not
 *    the published ones, and which exists because the plan's weekend cuts
 *    make "can I still do this on a Sunday" a separate question. What neither
 *    can say is how OFTEN: a ride that survives may run hourly, so the legend
 *    keeps pointing at the panel, which carries the day-by-day counts.
 *  - IT COUNTS RAIL, ALONE AMONG THE VIEWS. The T and the inclines are
 *    outside the Refresh, so every service figure here drops them — but drop
 *    them from THIS question and Beechview reads as losing a Downtown ride the
 *    Blue Line still runs. `query.py`'s one-seat section has the full note.
 *  - IT REUSES THE PALETTE RATHER THAN INVENTING ONE. Lost is the surface's
 *    red and gained its blue, exactly as the street layer took them, so a
 *    reader who has learned red-means-gone does not relearn it here. Keeps
 *    takes the street layer's desaturated grey for the same reason it does
 *    there: it is most of the map, and a keeps colour with any hue in it would
 *    compete with the two that carry the finding.
 *  - THE DESTINATION ITSELF IS NOT A VERDICT. A place needs no one-seat ride
 *    to itself. `analyze_one_seat.py` drops the anchor districts outright;
 *    this layer has to paint them, so they get a status of their own in a
 *    neutral near-black — painting Downtown solid grey as though the plan had
 *    preserved something there would be the loudest wrong signal on the map.
 *  - "NO RIDE EITHER WAY" IS DRAWN, FAINTLY. For Oakland it is more than half
 *    the county, and leaving it off would make the map's empty half read as
 *    missing data rather than as the finding it is: most of Allegheny County
 *    cannot reach Oakland without transferring, before or after.
 */
import { Day, OneSeatDay, OneSeatLayer, OneSeatPoint, OneSeatStatus } from './types';
import { fetchJSON } from './utils';
import { GONE_COLOR, NEW_COLOR } from './surface';
import { KEPT_COLOR } from './corridor';
import { PlaceFill } from './places';

/** Neutral, off the red/blue axis: the destination is not an outcome. */
export const HERE_COLOR = '#2b3038';

/**
 * Deliberately below the contrast floor the other layers hold to, and
 * exempted in `contrast.test.ts` for the same reason `change.ts`'s `none` is:
 * it carries no finding. It is drawn only so that the ground with no one-seat
 * ride either way reads as measured rather than as missing.
 */
export const NO_RIDE_COLOR = '#b9bec6';

export const STATUS_STYLE: Record<OneSeatStatus, { color: string; size: number }> = {
  loses: { color: GONE_COLOR, size: 6 },
  gains: { color: NEW_COLOR, size: 6 },
  keeps: { color: KEPT_COLOR, size: 3 },
  here: { color: HERE_COLOR, size: 3.5 },
  none: { color: NO_RIDE_COLOR, size: 1.8 },
};

/** Reading order for the legend: the two findings first. */
export const STATUS_ORDER: OneSeatStatus[] = ['loses', 'gains', 'keeps', 'none', 'here'];

const SRC = 'oneseat';
const LAYER = 'oneseat-dots';

let data: OneSeatLayer | null = null;
let visible = false;

export function layerData(): OneSeatLayer | null {
  return data;
}

export function isVisible(): boolean {
  return visible;
}

/** Statuses in view, tallied from the raw rows — see change.ts's countInBounds. */
export function countInBounds(
  points: OneSeatPoint[], keys: string[],
  west: number, south: number, east: number, north: number,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of keys) out[k] = 0;
  for (const p of points) {
    const lat = p[0] as number, lon = p[1] as number;
    if (lat < south || lat > north || lon < west || lon > east) continue;
    const key = keys[p[3] as number];
    if (key !== undefined) out[key]++;
  }
  return out;
}

export function toGeoJSON(layer: OneSeatLayer) {
  const keys = layer.statuses.map((s) => s.key);
  return {
    type: 'FeatureCollection' as const,
    features: layer.points.map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p[1] as number, p[0] as number] },
      properties: {
        status: keys[p[3] as number],
        current: p[4] as string,
        proposed: p[5] as string,
      },
    })),
  };
}

function colorExpr(): any {
  return ['match', ['get', 'status'],
    ...Object.entries(STATUS_STYLE).flatMap(([k, s]) => [k, s.color]),
    NO_RIDE_COLOR];
}

function sizeExpr(): any {
  const base = ['match', ['get', 'status'],
    ...Object.entries(STATUS_STYLE).flatMap(([k, s]) => [k, s.size]),
    STATUS_STYLE.none.size] as any;
  return ['interpolate', ['linear'], ['zoom'],
    9, ['*', base, 0.45],
    12, base,
    16, ['*', base, 1.9]];
}

export function initOneSeatLayer(map: maplibregl.Map, beforeId: string) {
  map.addSource(SRC, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] } as any,
  });
  map.addLayer({
    id: LAYER, type: 'circle', source: SRC,
    layout: { visibility: 'none' },
    paint: {
      'circle-color': colorExpr(),
      'circle-radius': sizeExpr(),
      'circle-opacity': 0.85,
      'circle-stroke-color': 'rgba(255,255,255,.9)',
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 9, 0.4, 12, 0.9, 16, 1.5],
    },
  }, beforeId);
}

/** A named destination key, or a dropped pin. */
export type Destination = { key: string } | { lat: number; lon: number };

export function destinationQuery(dest: Destination): string {
  return 'key' in dest
    ? `dest=${encodeURIComponent(dest.key)}`
    : `dest_lat=${dest.lat.toFixed(6)}&dest_lon=${dest.lon.toFixed(6)}`;
}

/**
 * Which `[data-dest]` button the toolbar should light for a destination.
 *
 * A point of the reader's own lights "pick a point" however it was chosen --
 * clicked in pin mode, or dragged there from a district's centre. Dragging is
 * the case that needs this: the toolbar would otherwise go on claiming
 * Downtown while the map measured to somewhere else entirely.
 */
export const PIN_BUTTON = 'pin';

export function activeDestButton(dest: Destination): string {
  return 'key' in dest ? dest.key : PIN_BUTTON;
}

/**
 * The published question has no day type; 'any' asks for it and is the default
 * everywhere. See `OneSeatDay`.
 */
export const ANY_DAY: OneSeatDay = 'any';

/** The whole query string for one layer load -- pure, so it can be tested. */
export function oneSeatQuery(radius: number, dest: Destination,
                             day: OneSeatDay): string {
  return `radius=${radius}&${destinationQuery(dest)}&day=${day}`;
}

/**
 * Which day the layer should ask for, given the toggle and the toolbar.
 *
 * The toggle is the opt-in, deliberately: the day buttons govern every other
 * view, and letting them silently move this one off the published answer
 * would mean a reader who switched to Saturday an hour ago is quoting numbers
 * that are not in `data/oneseat_change.csv` without ever having chosen to.
 */
export function oneSeatDayFor(restricted: boolean, day: Day): OneSeatDay {
  return restricted ? day : ANY_DAY;
}

/**
 * Should the day buttons be on screen at all?
 *
 * Hidden in exactly one place: the one-seat view showing its published
 * day-free answer. No day type enters that measurement -- a route serves a
 * place or it doesn't -- so a day control sitting there is a lever attached
 * to nothing, and a reader who moves it and sees the map hold still has been
 * told something false about what they are looking at. The one-seat toggle
 * immediately before it is what brings the buttons back, which is why the day
 * group is the last control in the toolbar rather than the second: it is
 * subordinate to the view, and it now reads that way.
 *
 * Deliberately not the greying the walk radius gets on Streets and Travel
 * time. That control is permanently meaningless in those views, so a
 * disabled-looking button is a durable statement. This one appears and
 * disappears with a toggle a click away, and a row of ghosts that flickers
 * back to life is more confusing than a row that simply isn't there yet.
 *
 * Places gets the disabled-button treatment for two of its own three
 * readings, alongside oneseat: the residents figures ('lost'/'gained') are
 * day-free and count every day of the week at once (convention 12), and
 * unlike the one-seat view there is no opt-in restriction on THEM that could
 * bring the day buttons back. The third reading breaks that pattern on
 * purpose -- 'service' is a place's own bus trip count on one day type, so
 * the day buttons are exactly as live there as everywhere else, and
 * `placeFill` is what tells this function which of the three is up.
 */
export function dayControlsShown(view: string, restricted: boolean, placeFill?: PlaceFill): boolean {
  if (view === 'places') return placeFill === 'service';
  return view !== 'oneseat' || restricted;
}

export async function loadOneSeatLayer(
  map: maplibregl.Map, radius: number, dest: Destination,
  day: OneSeatDay = ANY_DAY,
) {
  data = await fetchJSON<OneSeatLayer>(
    `/api/oneseat?${oneSeatQuery(radius, dest, day)}`);
  (map.getSource(SRC) as maplibregl.GeoJSONSource).setData(toGeoJSON(data) as any);
  return data;
}

export function setOneSeatVisible(map: maplibregl.Map, on: boolean) {
  visible = on;
  map.setLayoutProperty(LAYER, 'visibility', on ? 'visible' : 'none');
}

/** What the destination is called, for a legend header or a panel line. */
export function destinationLabel(layer: OneSeatLayer): string {
  const d = layer.destination;
  if (d.name) return d.name;
  if (d.lat != null && d.lon != null) {
    return `${d.lat.toFixed(4)}, ${d.lon.toFixed(4)}`;
  }
  return 'the destination';
}

/** Hover text for one dot: the verdict, then the route numbers behind it. */
export function dotLabel(props: any, layer: OneSeatLayer): string {
  const label = layer.statuses.find((s) => s.key === props.status)?.label
    ?? props.status;
  const now = (props.current || '').split(';').filter(Boolean);
  const prop = (props.proposed || '').split(';').filter(Boolean);
  const line = (rs: string[]) => (rs.length ? rs.join(', ') : 'none');
  const to = destinationLabel(layer);
  if (props.status === 'here') {
    return `<b>at ${to}</b><br><span style="opacity:.6">no one-seat ride needed</span>`;
  }
  return `<b>${label}</b> — ${to}<br>today: ${line(now)}<br>proposed: ${line(prop)}`;
}
