export type Day = 'weekday' | 'saturday' | 'sunday';
export type Side = 'current' | 'proposed';

export const DAYS: Day[] = ['weekday', 'saturday', 'sunday'];

/** Period keys, in axis order. Must match query.PERIODS server-side. */
export const PKEYS = [
  'early_4_6a', 'am_6_9a', 'mid_9a_3p', 'pm_3_6p',
  'eve_6_8p', 'late_8_11p', 'owl_11p_4a',
] as const;

export const PERIOD_LABEL: Record<string, string> = {
  early_4_6a: '4–6am',
  am_6_9a: '6–9am',
  mid_9a_3p: '9am–3pm',
  pm_3_6p: '3–6pm',
  eve_6_8p: '6–8pm',
  late_8_11p: '8–11pm',
  owl_11p_4a: '11pm–4am',
};

export interface StopRef {
  stop_id: string;
  name: string;
  lat: number;
  lon: number;
  metres: number;
}

export interface DayService {
  trips: number;
  periods: Record<string, number>;
  hourly: boolean;
  headways: Record<string, { median: number | null; max_gap_6a_6p: number | null }>;
  routes: string[];
  first: number | null;
  last: number | null;
}

export interface SideResult {
  side: Side;
  stops: StopRef[];
  days: Record<Day, DayService>;
}

/**
 * One row of the citywide layer, columnar to keep ~5,900 locations under a few
 * hundred kilobytes on the wire:
 *
 *   [lat, lon, published, wCur, wProp, wBucket, sCur, ..., uBucket]
 *
 * All three day types travel together so switching between them repaints from
 * memory rather than refetching — 152 locations keep their weekday buses and
 * lose the weekend entirely, and that comparison should be instant.
 */
export type ChangePoint = number[];

/** Offsets into a ChangePoint for day `i` of DAYS. */
export const CUR = (i: number) => 3 + 3 * i;
export const PROP = (i: number) => 4 + 3 * i;
export const BUCKET = (i: number) => 5 + 3 * i;
export const PUBLISHED = 2;

export interface ChangeLayer {
  radius: number;
  days: Day[];
  buckets: { key: string; label: string }[];
  fields: string[];
  points: ChangePoint[];
}

/** The five one-seat verdicts. `here` is the destination itself, not an outcome. */
export type OneSeatStatus = 'here' | 'keeps' | 'gains' | 'loses' | 'none';

/**
 * One location on the one-seat layer:
 *
 *   [lat, lon, published, statusIndex, routesToday, routesProposed]
 *
 * The two route strings are ';'-joined and hold only the routes that actually
 * provide the one-seat ride — not everything serving the location — so the
 * hover text can name them without a second request.
 */
export type OneSeatPoint = (number | string)[];

export interface DestinationRef {
  key: string | null;
  name: string | null;
  seeds: number;
  lat: number | null;
  lon: number | null;
}

/**
 * Which day the one-seat question was asked for.
 *
 * 'any' is the PUBLISHED answer -- a route serves a place or it does not,
 * counted on any calendar -- and it is what `data/oneseat_change.csv` and the
 * answer documents mean. A day type beside it is a different measurement, not
 * a sharper one, so anything showing those counts has to say so.
 */
export type OneSeatDay = 'any' | Day;

export interface OneSeatLayer {
  radius: number;
  day: OneSeatDay;
  destination: DestinationRef;
  statuses: { key: OneSeatStatus; label: string }[];
  counts: Record<OneSeatStatus, number>;
  fields: string[];
  points: OneSeatPoint[];
}

/** One named destination's verdict at the clicked point, for the panel. */
export interface OneSeatVerdict {
  /** null for a dropped pin -- it has no name in the database. */
  key: string | null;
  name: string;
  lat: number;
  lon: number;
  status: OneSeatStatus;
  /** Absent on a database built before the day-restricted variant. */
  day?: OneSeatDay;
  current: string[];
  proposed: string[];
  kept: string[];
  lost: string[];
  gained: string[];
}

export interface PlaceResult {
  lat: number;
  lon: number;
  radius: number;
  current: SideResult;
  proposed: SideResult;
  change: Record<Day, { trips: number; hourly: [boolean, boolean] }>;
  place: { muni: string; hood: string } | null;
  /** Empty when the database predates the one-seat layer. */
  oneseat: OneSeatVerdict[];
  /** Which day the verdicts above answered for; 'any' is the published one. */
  oneseat_day?: OneSeatDay;
}

/**
 * One cell of the magnitude surface, columnar for the same reason the change
 * layer is — ~48,500 cells is the largest thing this app sends:
 *
 *   [ix, iy, wCur, wProp, sCur, sProp, uCur, uProp]
 *
 * Position is a lattice index, not a coordinate: the lattice is regular, so
 * `origin` reconstructs the square exactly and four corners per cell would
 * multiply the payload for nothing.
 */
export type SurfaceCell = number[];

/** Offsets into a SurfaceCell for day `i` of DAYS. */
export const S_CUR = (i: number) => 2 + 2 * i;
export const S_PROP = (i: number) => 3 + 2 * i;

export interface SurfaceLayer {
  radius: number;
  cell_m: number;
  days: Day[];
  /** South-west corner of cell (ix, iy) is (lat0 + iy*dlat, lon0 + ix*dlon). */
  origin: { lat0: number; lon0: number; dlat: number; dlon: number };
  fields: string[];
  cells: SurfaceCell[];
}

/** A run's outcome: whether a bus runs on this piece of street today, under the plan, or both. */
export type CorridorKlass = 'kept' | 'lost' | 'added';

export interface CorridorRun {
  klass: CorridorKlass;
  length_m: number;
  geometry: [number, number][];
}

export interface CorridorLayer {
  day: Day;
  km: Record<CorridorKlass, number>;
  runs: CorridorRun[];
}

/**
 * A proposed on-demand zone — the one part of the plan neither timetable can
 * express, and so the one thing every other layer here paints as a plain loss.
 *
 * `vehicles_weekday` is for the WHOLE zone all day, which is the number that
 * decides whether this reads as a replacement or a fallback: 1-3 vans over
 * 15-48 km2. `hidden_in_remix` is PRT's own flag on all ten in the project
 * file, and is why this is "what the plan file says" rather than a commitment.
 * The km2 figures are `analyze_coverage_area.py`'s, carried over verbatim.
 */
export interface OnDemandZone {
  name: string;
  vehicles_weekday: number | null;
  weekday_hours: string;
  days: string[];
  hidden_in_remix: boolean;
  zone_km2: number | null;
  fixed_route_km2_now: number | null;
  fixed_route_km2_proposed: number | null;
  lost_km2_inside: number | null;
  gained_km2_inside: number | null;
  /** MultiPolygon coordinates: polygon -> ring -> [lon, lat]. */
  geometry: [number, number][][][];
}

export interface OnDemandTotals {
  zones: number;
  vehicles_weekday: number;
  zone_km2: number;
  lost_km2_inside: number;
  /** Null when the database carries no denominator — unknown, not zero. */
  lost_km2_citywide: number | null;
  lost_pct_inside: number | null;
}

export interface OnDemandLayer {
  zones: OnDemandZone[];
  totals: OnDemandTotals;
}

/**
 * How long the trip actually takes — the only measure on this site with a
 * clock, and the only one whose answer is a distribution rather than a number.
 *
 * `median_min` is the median over every minute a rider could be ready inside
 * the window, waiting included; `reachable_fraction` is the share of those
 * minutes the trip can be made at all, and it is the denominator that number
 * needs. Every pair comes back at both transfer radii, because the transfers
 * are synthesised and the choice is not neutral between the two networks
 * (convention 14).
 */
export interface JourneyStopEnd {
  stop_id: string;
  /** Null for rail: `stops` is the bus-only service table, on purpose. */
  name: string | null;
  lat: number;
  lon: number;
}

export type LegKind = 'walk' | 'ride';

export interface JourneyLeg {
  kind: LegKind;
  route: string | null;
  /** Null at the origin end of the first walk and the far end of the last. */
  from: JourneyStopEnd | null;
  to: JourneyStopEnd | null;
  depart: number;
  arrive: number;
  /**
   * Where the bus drives, or the rider walks, between the two ends, as
   * [lon, lat] pairs, for drawing only. Null on a ride whose pattern named no
   * shape in its feed, and on a walk the pedestrian network could not route
   * within the distance it was charged for -- not, any more, on every walk.
   * Thinned at build time and never to be measured.
   */
  path: [number, number][] | null;
}

export interface Itinerary {
  ready_at: number;
  arrive: number;
  total_min: number;
  ride_min: number;
  walk_min: number;
  wait_min: number;
  transfers: number;
  legs: JourneyLeg[];
}

export interface JourneySide {
  median_min: number | null;
  best_min: number | null;
  worst_min: number | null;
  reachable_fraction: number;
  median_transfers: number | null;
  median_wait_min: number | null;
  origin_access_stops: number;
  dest_access_stops: number;
  /** The trip that takes the median time — a real one, not a composite. */
  itinerary: Itinerary | null;
}

/** Why a pair has no comparable time. Only the first is about time at all. */
export type JourneyClass =
  'comparable' | 'no_origin_coverage' | 'no_dest_coverage' | 'no_journey';

export interface JourneyAtRadius {
  transfer_walk_m: number;
  classification: JourneyClass;
  /** Positive where the plan makes the trip longer. */
  change_min: number | null;
  current: JourneySide;
  proposed: JourneySide;
}

export type TransferRadiusKey = 'headline' | 'strict';

export interface JourneyResult {
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  day: Day;
  window: { start_min: number; end_min: number; minutes: number };
  radii: Record<TransferRadiusKey, JourneyAtRadius>;
  /** True where the two radii disagree about which network is faster. */
  sign_flips: boolean | null;
  constants: Record<string, number>;
}

/** One named destination's centre, from /api/destinations. */
export interface NamedDestination {
  key: string;
  name: string;
  seeds: number;
  lat: number;
  lon: number;
}
