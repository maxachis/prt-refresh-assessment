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
  /**
   * Whether no stop stands within 150 m of this pole today — the fact the map
   * draws as a ring.
   *
   * Proposed stops only, and absent rather than false on today's side: a stop
   * that runs today stands where a stop stands today, so the question has no
   * content there. Same one-sidedness as boardings, for a different reason.
   */
  new_place?: boolean;
  /**
   * How far the plan moves a pole it keeps, in whole metres, with the
   * coordinates that pole stands at today — `moved_lat`/`moved_lon`, which is
   * where the map anchors the leader line.
   *
   * Proposed stops only, and absent rather than 0 where the pole did not move:
   * the plan keeping a stop exactly where it is has nothing to say. Decided by
   * the stop id alone (`query.moved_pole`), so a renumbered kerb carries no
   * distance even where a move is plainly what happened — no feed says which
   * of two neighbouring ids became which.
   */
  moved_m?: number;
  moved_lat?: number;
  moved_lon?: number;
  /**
   * Whether the plan takes this stop away — retires the id and stops at no
   * pole within 25 m of it. Today's stops only, and the exact mirror of
   * `new_place`, at the same distance: a proposed stop is not something the
   * plan can remove.
   *
   * Not a restatement of the "loses all service" colour. That colour is a
   * claim about the buses within the whole walk radius; this is a claim about
   * one pole, and the two disagree at 675 of the 1,308 removed stops.
   */
  removed?: boolean;
  /**
   * How far the nearest stop the plan does keep is, as a walk over the
   * pedestrian network rather than as the crow flies. Present only on a
   * removed stop, and `null` there when nothing survives within an 800 m
   * walk — which is 536 of the 1,308.
   */
  replacement_walk_m?: number | null;
  /**
   * How far the nearest surviving stop is as the crow flies — on hilly ground
   * a different stop from the one the walk found, and the one a reader can see
   * on the map. Present even where the walk is `null`.
   */
  nearest_straight_m?: number | null;
}

/**
 * Observed boardings at the stops inside one walk radius, on one day type.
 *
 * One-sided by construction (convention 15): today's stops were counted, the
 * plan's cannot have been. `total` is null where nothing was counted at all,
 * never 0, and `unmeasured` says how many of the stops on screen the usage
 * extract has no figure for — a place is never quietly credited with the
 * riders of the stops nobody counted.
 */
export interface Boardings {
  total: number | null;
  measured: number;
  unmeasured: number;
}

export interface DayService {
  trips: number;
  /** Today's side only; null on the proposed side, which has no observed riders. */
  boardings: Boardings | null;
  periods: Record<string, number>;
  hourly: boolean;
  headways: Record<string, { median: number | null; max_gap_6a_6p: number | null }>;
  routes: string[];
  /**
   * The routes in `routes` this scope only catches one way — their other
   * direction runs on a street outside it. A subset of `routes`, never a
   * separate tally: the trips of a one-directional route are already in
   * `trips`. Empty at most locations and at nearly every kerb.
   */
  one_direction_routes: string[];
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
 *   [lat, lon, published, id, removed, wCur, wProp, wBucket, wRiders, sCur,
 *    ..., uRiders]
 *
 * `id` is the server's own name for the location -- `c:<stop_id>` where a bus
 * stops today, `p:<stop_id>` where only the proposed network stops -- and it
 * is the one field here that is not a number. It ships because a dot has to be
 * nameable and not merely locatable: a painted selection is a set of these,
 * and a row index could not stand in for them, since the order is the
 * server's and a rebuild that reordered it would silently reselect different
 * stops in a link somebody had already sent.
 *
 * `removed` is the stop's own fate rather than the walk radius's: 1 where the
 * plan takes this pole away and stops at no pole within 25 m of it, 0
 * everywhere else. It rides beside the buckets rather than among them because
 * it answers a different question -- the colour is what happens to the buses
 * within a walk, this is what happens to the stop the reader is standing at,
 * and 675 of the 1,308 removed stops sit in a bucket other than "loses all
 * service", 235 of them in one that gains.
 *
 * All three day types travel together so switching between them repaints from
 * memory rather than refetching — 152 locations keep their weekday buses and
 * lose the weekend entirely, and that comparison should be instant.
 *
 * `riders` is the only field that can be absent, and it is `null` rather than
 * 0 when it is: at a location the plan adds a bus to, nobody boards today
 * because no bus stops there today. Zero would read as "nobody uses this",
 * which is a claim about the plan's gains that no observed number can make.
 */
export type ChangePoint = (number | string | null)[];

/**
 * Offsets into a ChangePoint for day `i` of DAYS.
 *
 * The stride is mirrored from `query.POINT_STRIDE`. If the two disagree the
 * map recolours itself without a single number changing on the server, so the
 * offsets are pinned by frontend/change.test.ts as well as by the API tests.
 */
export const POINT_STRIDE = 4;
/** Mirrored from `query.FIXED_FIELDS`: lat, lon, published, id, removed, name. */
export const FIXED_FIELDS = 6;
/**
 * Buses calling at THIS KERB on day `i`, today and under the plan.
 *
 * The kerb, never the walk radius — mirrored from `query.kerb_departures`:
 * every pole of each network within 25 m of the dot, summed on both sides.
 * Stop-by-stop is a view about stops, and the radius counts that used to sit
 * here read "1,591 → 2,178 buses per weekday" at a downtown dot, which is
 * every bus within 400 m of the Central Business District.
 *
 * `BUCKET` is `query.bucket()` on these same two numbers, so the dot's colour
 * and its tooltip cannot disagree about one stop. The walk radius's own
 * answer stayed in the `change` table, where the answer panel and
 * `docs/answers/` read it.
 *
 * The plan's side is read at whatever pole the plan runs on this kerb, so a
 * kerb PRT renumbers does not report zero (convention 3).
 */
export const STOP_CUR = (i: number) => FIXED_FIELDS + POINT_STRIDE * i;
export const STOP_PROP = (i: number) => FIXED_FIELDS + 1 + POINT_STRIDE * i;
export const BUCKET = (i: number) => FIXED_FIELDS + 2 + POINT_STRIDE * i;
export const RIDERS = (i: number) => FIXED_FIELDS + 3 + POINT_STRIDE * i;
export const PUBLISHED = 2;
export const ID = 3;
/**
 * 1 where the plan runs no stop at this kerb — `query.is_removed_stop`.
 *
 * Fixed rather than per-day because it is a fact about the stop, not about
 * the service at it: it does not move with the day switch, where the colour
 * beside it does.
 */
export const REMOVED = 4;

/**
 * PRT's own name for the pole this dot is drawn at — "Forbes Ave at Craig St".
 *
 * A dot is a pole: the layer carries one point per stop id, so the name is a
 * fact about the dot and not an approximation of one. It travels as a column
 * rather than a lookup keyed by id because the row is the format's unit, and
 * an aligned-by-position second list is one reordering away from naming every
 * dot after its neighbour. The cost is 65 KB gzipped, 15 of which came back
 * when the radius trip counts left the row: the layer is 205 KB against
 * 155 KB before either change, paid so that the map gives one answer about a
 * kerb whether or not a pin happens to be down over it.
 */
export const NAME = 5;

/** The server's name for this location; see ChangePoint. */
export const pointId = (p: ChangePoint): string => p[ID] as string;

/** A packed field that is always present. */
export const field = (p: ChangePoint, i: number): number => p[i] as number;

/** Boardings on day `i`, or null where there is no record — see ChangePoint. */
export const riders = (p: ChangePoint, i: number): number | null =>
  p[RIDERS(i)] as number | null;

/**
 * What the change legend is counting: places, or the riders who board at them.
 *
 * Two denominators for one set of dots, and the reason both exist is
 * convention 15 — the plan concentrates service where ridership already is, so
 * counting locations and counting boardings give opposite-sounding answers to
 * the same question and neither is the whole one.
 */
export type Weight = 'locations' | 'riders';

export interface ChangeLayer {
  radius: number;
  days: Day[];
  buckets: { key: string; label: string }[];
  fields: string[];
  /**
   * `[metres on foot, metres in a straight line]` to a surviving stop, by
   * point id, for the stops the plan removes. Absent where the bounded search
   * found no walk — which the hover says in words, because there is no
   * distance to print.
   *
   * The two name DIFFERENT STOPS wherever the ground is in the way, and that
   * is the point of carrying both: at Mt Troy Rd + Beckert the walk to any
   * surviving stop is 651 m, while the Lowrie St stops the map shows 301 m
   * away are 863 m on foot around a ravine. Printing only the walk reads as an
   * error to anyone looking at the map.
   */
  replacement: Record<string, [number, number]>;
  /**
   * Metres from where a pole stands today to where the plan stands it, by
   * point id, for the 225 poles the plan moves at all.
   *
   * Keyed on the published point (`c:…`) because a pole whose id the plan
   * keeps is never a point of its own on the proposed side — the dot that
   * carries the sentence is the one drawn on today's kerb, which is also the
   * kerb the sentence is about. Sparse, like `replacement`: 225 numbers do
   * not justify 6,540 nulls.
   */
  moved: Record<string, number>;
  points: ChangePoint[];
}

/** The five one-seat verdicts. `here` is the destination itself, not an outcome. */
export type OneSeatStatus = 'here' | 'keeps' | 'gains' | 'loses' | 'none';

/**
 * One location on the one-seat layer:
 *
 *   [lat, lon, published, statusIndex, routesToday, routesProposed, removed]
 *
 * The two route strings are ';'-joined and hold only the routes that actually
 * provide the one-seat ride — not everything serving the location — so the
 * hover text can name them without a second request. `removed` is the
 * Stop-by-stop view's flag, decided at the kerb: 1 where the plan retires
 * this stop, so a lost ride can be drawn as that view's cross when the stop
 * itself goes and as a red dot when it stays. A mark, not a sixth status.
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
  /** Of `counts`, how many stand at a stop the plan retires. */
  retired: Record<OneSeatStatus, number>;
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

export interface PlacePopulation {
  /** The key `/api/places` is addressed by, served so the panel's link into
   *  the Places view does not have to re-derive `query.place_key` in TS. */
  key: string;
  place: string;
  lost: number;
  gained: number;
  block_groups: number;
  measured: boolean;
}

/**
 * The stop under the click — the same unit Stop-by-stop colours and hovers.
 *
 * `current` and `proposed` have the shape of a `SideResult` measured at one
 * kerb instead of one walk radius: today's poles within `dedup_m` of the
 * point, and the plan's read at whatever pole the plan runs there. It is NOT
 * the published unit — `data/coverage_change.csv` publishes the walk radius,
 * which is what `PlaceResult.current` still carries — so anything quoting a
 * figure from here has to say it is per stop.
 */
export interface KerbResult {
  /** The pole the reader clicked: the nearest of today's ids on this kerb,
   *  or of the plan's where only the plan stands a pole here. */
  stop_id: string;
  /** Every name PRT gives the poles on this kerb, deduplicated. */
  names: string[];
  /** How far apart two poles may stand and still be one kerb — 25 m. */
  dedup_m: number;
  lat: number;
  lon: number;
  current: SideResult;
  proposed: SideResult;
}

/**
 * One route pattern calling at a kerb, as `/api/kerb_routes` sends it — the
 * shape the toolbar's ROUTES control draws end to end.
 *
 * `pattern_id` rather than `route` is the thing drawn once each: a route
 * with a short-turn or a branch calls at the same kerb on more than one
 * shape, and each is real service a reader asked to see all of. `points` are
 * already `[lon, lat]`, the order MapLibre wants and the order every other
 * drawn path in this app carries.
 */
export interface KerbRouteFeature {
  route: string;
  name: string | null;
  pattern_id: number;
  points: [number, number][];
  stop_index: number;
}

/**
 * Every route calling at one kerb, today and under the plan, from
 * `/api/kerb_routes` — the drawing's own answer, additive to `KerbResult`
 * rather than folded into it, since drawing every pattern end to end is a
 * different question from counting the buses that call. Both networks in one
 * response, so the toolbar's switch between them costs no second request.
 */
export interface KerbRoutesResult {
  lat: number;
  lon: number;
  day: Day;
  dedup_m: number;
  stop_id: string;
  names: string[];
  current: KerbRouteFeature[];
  proposed: KerbRouteFeature[];
}

export interface PlaceResult {
  lat: number;
  lon: number;
  radius: number;
  current: SideResult;
  proposed: SideResult;
  change: Record<Day, { trips: number; hourly: [boolean, boolean] }>;
  place: { muni: string; hood: string } | null;
  /**
   * What the equity work published for the *place* this point sits in — not
   * for the walk radius the rest of the panel measures. Null outside
   * Allegheny, where the question was never asked; a measured zero inside it,
   * where the answer is that nobody here loses or gains every bus.
   */
  population: PlacePopulation | null;
  /**
   * The stop under the click, or null where no pole of either network
   * stands within 25 m of it — a stop the plan adds has one, reading 0
   * today. Additive to everything above, which stays the walk radius's
   * answer.
   */
  kerb?: KerbResult | null;
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

/**
 * Ground, or the people who live on it — the surface key's own switch, in the
 * same spirit as the change legend's `Weight`: two denominators over one
 * lattice rather than a correction to the first (convention 10, sharpened by
 * conventions 12 and 15 for population specifically).
 */
export type SurfaceUnit = 'area' | 'people';

/**
 * One cell of the population surface — the same 100 m lattice as
 * `SurfaceCell`, but counting residents in each of the four outcomes instead
 * of buses per day:
 *
 *   [ix, iy, wLost, wGained, wKept, wNone, sLost, ..., uNone]
 *
 * Position means exactly what it means on `SurfaceLayer`: a lattice index
 * against the same `origin`, not a coordinate, so the two layers' cells line
 * up without either shipping its own copy of the grid.
 */
export type PopulationCell = number[];

/** Offsets into a PopulationCell for day `i` of DAYS. */
export const POP_STRIDE = 4;
export const POP_LOST = (i: number) => 2 + POP_STRIDE * i;
export const POP_GAINED = (i: number) => 3 + POP_STRIDE * i;
export const POP_KEPT = (i: number) => 4 + POP_STRIDE * i;
export const POP_NONE = (i: number) => 5 + POP_STRIDE * i;

export interface PopulationLayer {
  radius: number;
  days: Day[];
  classes: { key: string; label: string }[];
  cell_m: number;
  /** South-west corner of cell (ix, iy) is (lat0 + iy*dlat, lon0 + ix*dlon). */
  origin: { lat0: number; lon0: number; dlat: number; dlon: number };
  fields: string[];
  cells: PopulationCell[];
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

/**
 * One named place's published equity figures, from /api/places.
 *
 * `residents_total` is the place's whole ACS population, not the population of
 * only the block groups that changed -- see `query._place_row`. The shares are
 * `null` where a place's total is 0 (nobody lives there, or PRT's label maps
 * to a place the census does not recognise), which is not the same as a share
 * of zero.
 */
export interface PlaceSummary {
  key: string;
  place: string;
  changed_block_groups: number;
  block_groups: number;
  residents_lost: number;
  residents_gained: number;
  residents_total: number;
  share_lost: number | null;
  share_gained: number | null;
  lat: number;
  lon: number;
}

/** One census block group the plan changed, as a point -- see `query.place_detail`. */
export interface PlaceChangedBlockGroup {
  geoid: string;
  lat: number;
  lon: number;
  residents_lost: number;
  residents_gained: number;
}

/** One place's summary, plus the block groups behind it, from /api/places/{key}. */
export interface PlaceDetail extends PlaceSummary {
  changed: PlaceChangedBlockGroup[];
}

/**
 * One named place's boundary and change figures, from /api/boundaries --
 * see `query.boundaries`. Deliberately not `PlaceSummary`: a place under
 * `query.SHARE_MIN_RESIDENTS` residents, or one the plan does not touch,
 * carries `residents_total: null` there, which `PlaceSummary` (built for the
 * ranked list, where every row is a place the plan changed) does not allow.
 */
/**
 * A place's bus trips on one day type, today and under the plan -- the
 * fields `serviceField` (`places.ts`) names by day and stat rather than
 * having every call site spell out `service_${day}_${stat}` itself.
 *
 * `pct` is `null`, not `Infinity`, where the place has no bus today and some
 * proposed: an undefined change, because there is nothing to divide by. Both
 * `rail_*` flags exist so a place that loses its last bus while the T (or an
 * incline) still calls there is never described as losing "all transit" --
 * conventions 13 and 16 both cover that trap.
 */
export interface PlaceBoundaryProperties {
  key: string;
  place: string;
  kind: string;
  changed_block_groups: number;
  block_groups: number;
  residents_lost: number;
  residents_gained: number;
  residents_total: number | null;
  share_lost: number | null;
  share_gained: number | null;
  service_weekday_now: number;
  service_weekday_proposed: number;
  service_weekday_pct: number | null;
  service_weekday_rail_now: boolean;
  service_weekday_rail_proposed: boolean;
  service_saturday_now: number;
  service_saturday_proposed: number;
  service_saturday_pct: number | null;
  service_saturday_rail_now: boolean;
  service_saturday_rail_proposed: boolean;
  service_sunday_now: number;
  service_sunday_proposed: number;
  service_sunday_pct: number | null;
  service_sunday_rail_now: boolean;
  service_sunday_rail_proposed: boolean;
}

export interface PlaceBoundaryFeature {
  type: 'Feature';
  geometry: { type: 'MultiPolygon'; coordinates: number[][][][] };
  properties: PlaceBoundaryProperties;
}

/** The choropleth's whole GeoJSON, from /api/boundaries -- ~220 features, ~3.5 MB. */
export interface BoundariesGeoJSON {
  type: 'FeatureCollection';
  features: PlaceBoundaryFeature[];
}
