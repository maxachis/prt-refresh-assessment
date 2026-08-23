/**
 * The travel-time view — how long the trip actually takes, door to door.
 *
 * Every other view on this site measures service that is *near* a reader: trips
 * within a walk, covered ground, streets with a bus on them, a route that runs
 * through to a destination. This one is the only measure with a clock on it,
 * and four of convention 14's six points about it decide what this module
 * draws and says:
 *
 *  - THE CLOCK STARTS WHEN THE RIDER IS READY, NOT WHEN THEY BOARD. The wait
 *    is part of the trip, and it is the only place on this site where a
 *    doubled headway reaches a person as time rather than as a trip count. So
 *    the panel shows the typical wait as a line of its own, and the drawn trip
 *    starts at the pin the reader dropped rather than at the first stop.
 *  - THE ANSWER IS A PROFILE, NOT A DEPARTURE. Leaving at 8:03 rather than
 *    8:07 is the whole answer when a headway goes from 15 to 30, so the median
 *    is shown with the fastest and slowest minute of the window beside it, and
 *    with the share of minutes the trip can be made at all. A single number
 *    with no spread under it would be quotable and misleading in the same
 *    breath.
 *  - THE TRANSFERS ARE INVENTED, AND THE INVENTION IS NOT NEUTRAL. Neither
 *    feed publishes transfers, so connections are synthesised from stop
 *    coordinates, and because the Refresh leans on transferring more than
 *    today's network does, a generous transfer walk can only flatter it. Every
 *    answer therefore carries both radii, and where the two disagree about
 *    which network is FASTER the disagreement is promoted above the number —
 *    that flip is the finding, and neither median may be quoted alone.
 *  - IT IS SCHEDULE AGAINST SCHEDULE. Today's side is compared at its
 *    scheduled times because the proposed side has no observed ones, which is
 *    symmetric and is not the same claim as "your trip will take this long".
 *
 * The palette is the before/after panel's own blue and orange rather than the
 * map's red-and-blue change palette. Those two colours already mean "today"
 * and "proposed" everywhere on this screen, and here there are exactly two
 * things to draw — one trip on each network — rather than an outcome to
 * classify.
 */
import { esc, clock } from './utils';
import {
  JourneyResult, JourneyAtRadius, JourneySide, JourneyLeg, Itinerary,
  TransferRadiusKey, Day, Side,
} from './types';

/** The panel's `--now` and `--prop`, repeated here as the map cannot read CSS vars. */
export const NOW_COLOR = '#4aa3ff';
export const PROP_COLOR = '#ffa23a';

/** The radius the map draws and the panel leads with; the other is the check. */
export const DRAWN_RADIUS: TransferRadiusKey = 'headline';

const SRC = 'journey';
// Two layers, not one: `line-dasharray` is the one paint property here that
// cannot be data-driven, so the walks and the rides have to be separate layers
// rather than one layer switching on the leg kind. MapLibre rejects the layer
// outright if you try, which is how this was found.
const LAYER_RIDE = 'journey-rides';
const LAYER_WALK = 'journey-walks';
const JOURNEY_LAYERS = [LAYER_RIDE, LAYER_WALK];

let data: JourneyResult | null = null;
let visible = false;

export function journeyData(): JourneyResult | null {
  return data;
}

export function isVisible(): boolean {
  return visible;
}

// --------------------------------------------------------------------------
// the map
// --------------------------------------------------------------------------

interface LineFeature {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: { side: Side; kind: string; route: string | null };
}

/**
 * Both median trips as lines, one feature per leg.
 *
 * The first and last legs are walks whose far end the router leaves null — the
 * rider starts where they dropped the pin, not at a stop — so those ends are
 * filled from the request's own points. Drawing them from the stop instead
 * would hide the walk the clock is already counting, which is exactly the
 * thing this view exists to stop hiding.
 */
export function toGeoJSON(r: JourneyResult, key: TransferRadiusKey) {
  const at = r.radii[key];
  const features: LineFeature[] = [];
  for (const side of ['current', 'proposed'] as Side[]) {
    const itinerary = at[side].itinerary;
    if (!itinerary) continue;
    for (const leg of itinerary.legs) {
      const from = leg.from ?? r.origin;
      const to = leg.to ?? r.destination;
      // A ride follows the street its bus drives, and a walk now follows the
      // pedestrian network, whenever either one names a path; either kind
      // falls back to the straight line this view drew before there were
      // paths at all, which for a walk now means the network could not
      // route it rather than that a walk is always a straight line.
      const straight: [number, number][] = [[from.lon, from.lat], [to.lon, to.lat]];
      const drawn = leg.path?.length ? leg.path : straight;
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: drawn },
        properties: { side, kind: leg.kind, route: leg.route },
      });
    }
  }
  return { type: 'FeatureCollection' as const, features };
}

/** Today's trip in the panel's blue, the proposed one in its orange. */
function sideColor(): any {
  return ['match', ['get', 'side'],
    'current', NOW_COLOR, 'proposed', PROP_COLOR, NOW_COLOR];
}

/**
 * The proposed trip is drawn thinner than today's so that where the two run
 * down the same street both stay visible; without this the second one painted
 * simply erases the first.
 */
function sideWidth(scale: number): any {
  const per = (wide: number, thin: number) =>
    ['match', ['get', 'side'], 'proposed', thin * scale, wide * scale];
  return ['interpolate', ['linear'], ['zoom'], 9, per(3.5, 2), 14, per(7, 4)];
}

export function initJourneyLayer(map: maplibregl.Map, beforeId?: string) {
  map.addSource(SRC, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] } as any,
  });
  map.addLayer({
    id: LAYER_RIDE,
    type: 'line',
    source: SRC,
    filter: ['==', ['get', 'kind'], 'ride'],
    layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': sideColor(),
      'line-width': sideWidth(1),
      'line-opacity': 0.85,
    },
  }, beforeId);
  // A walk now follows the pedestrian network -- sidewalks, alleys and
  // Pittsburgh's public stairways -- the same way a ride follows the street
  // its bus drives. Dashing the walk and drawing it thinner is what still
  // tells the two apart on a map where neither is a straight line any more.
  map.addLayer({
    id: LAYER_WALK,
    type: 'line',
    source: SRC,
    filter: ['==', ['get', 'kind'], 'walk'],
    layout: { visibility: 'none', 'line-cap': 'butt', 'line-join': 'round' },
    paint: {
      'line-color': sideColor(),
      'line-width': sideWidth(0.6),
      'line-opacity': 0.8,
      'line-dasharray': [1.5, 1.5],
    },
  }, beforeId);
}

export function setJourneyVisible(map: maplibregl.Map, on: boolean) {
  visible = on;
  for (const layer of JOURNEY_LAYERS) {
    map.setLayoutProperty(layer, 'visibility', on ? 'visible' : 'none');
  }
}

export function drawJourney(map: maplibregl.Map, r: JourneyResult | null) {
  data = r;
  const gj = r ? toGeoJSON(r, DRAWN_RADIUS)
    : { type: 'FeatureCollection' as const, features: [] };
  (map.getSource(SRC) as maplibregl.GeoJSONSource).setData(gj as any);
}

// --------------------------------------------------------------------------
// the request
// --------------------------------------------------------------------------

export interface Point { lat: number; lon: number }

export function journeyUrl(origin: Point, dest: Point, day: Day): string {
  return `/api/journey?lat=${origin.lat.toFixed(6)}&lon=${origin.lon.toFixed(6)}`
    + `&dest_lat=${dest.lat.toFixed(6)}&dest_lon=${dest.lon.toFixed(6)}`
    + `&day=${day}`;
}

// --------------------------------------------------------------------------
// the words
// --------------------------------------------------------------------------

const MINUTES = (n: number) => `${n.toFixed(1)} min`;

/** Which way the plan moves this trip, with the size attached to the word. */
export function changePhrase(change: number | null): string {
  if (change == null) return '—';
  if (change === 0) return 'no change';
  return change > 0 ? `${MINUTES(change)} slower` : `${MINUTES(-change)} faster`;
}

function stopLabel(end: { name: string | null; stop_id: string } | null,
                   fallback: string): string {
  if (!end) return fallback;
  // Rail stops have coordinates and no name by construction — `stops` is the
  // bus-only service table (convention 13) — so the id stands in, marked as an
  // id rather than left as a bare number a reader would try to read as a stop
  // name. See `docs/worklog/rail-stops-have-no-name-in-a-journey.md`.
  return end.name ? esc(end.name) : `stop ${esc(end.stop_id)}`;
}

/** One leg as a line a reader can follow: what they do, for how long, to where. */
export function legLine(leg: JourneyLeg, r: JourneyResult): string {
  const mins = Math.round(leg.arrive - leg.depart);
  if (leg.kind === 'walk') {
    const to = stopLabel(leg.to, 'the destination');
    return `<div class="jl"><span class="jl-what">walk ${mins} min</span>
            <span class="muted">to ${to}</span></div>`;
  }
  return `<div class="jl"><span class="jl-what">ride
          <span class="route">${esc(leg.route ?? '?')}</span> ${mins} min</span>
          <span class="muted">to ${stopLabel(leg.to, 'the destination')}</span></div>`;
}

/**
 * The median trip, leg by leg, with the waits between them spelled out.
 *
 * The waits are not legs — the router has nothing to draw for them — but they
 * are most of what changes when a headway does, so leaving them implicit in a
 * gap between two times would drop the point of the whole view.
 */
function itineraryHTML(itinerary: Itinerary, r: JourneyResult): string {
  const rows: string[] = [];
  let previous: JourneyLeg | null = null;
  for (const leg of itinerary.legs) {
    const wait = previous ? Math.round(leg.depart - previous.arrive) : 0;
    if (wait > 0) {
      rows.push(`<div class="jl jl-wait"><span class="jl-what">wait ${wait} min</span></div>`);
    }
    rows.push(legLine(leg, r));
    previous = leg;
  }
  return rows.join('');
}

const CLASS_NOTE: Record<string, string> = {
  no_origin_coverage:
    'No bus stops within a walk of this point on one or both networks, so '
    + 'there is no trip to time from here. That is a coverage answer rather '
    + 'than a travel-time one — the Locations and Surface views are where it '
    + 'is measured.',
  no_dest_coverage:
    'No bus stops within a walk of the destination on one or both networks, '
    + 'so there is nothing to arrive at. That is a coverage answer rather than '
    + 'a travel-time one — the Locations and Surface views are where it is '
    + 'measured.',
  no_journey:
    'Both ends have buses, but no trip connects them inside this window on '
    + 'one or both networks — within the transfer walk below, and with a '
    + 'change of bus allowed.',
};

function sideCell(s: JourneySide): string {
  return s.median_min == null ? '—' : s.median_min.toFixed(1);
}

/** The spread and the wait, side by side — the profile, not one departure. */
function profileTable(at: JourneyAtRadius): string {
  const rows: [string, (s: JourneySide) => string][] = [
    ['Fastest minute to be ready', (s) => (s.best_min == null ? '—' : s.best_min.toFixed(1))],
    ['Slowest minute to be ready', (s) => (s.worst_min == null ? '—' : s.worst_min.toFixed(1))],
    ['Typical wait, included above',
      (s) => (s.median_wait_min == null ? '—' : s.median_wait_min.toFixed(1))],
    ['Changes of bus',
      (s) => (s.median_transfers == null ? '—' : String(s.median_transfers))],
    ['Minutes the trip can be made at all',
      (s) => `${Math.round(s.reachable_fraction * 100)}%`],
  ];
  return `
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${rows.map(([label, cell]) => `
        <tr><th>${label}</th>
          <td class="n">${cell(at.current)}</td>
          <td class="n">${cell(at.proposed)}</td></tr>`).join('')}
      </tbody>
    </table>`;
}

/**
 * The strict-radius check, and the flip warning when it contradicts.
 *
 * `docs/worklog/transfer-radius-favours-one-network.md`: across the 343
 * published pairs exactly one flips materially, so the headline is quotable —
 * but a reader is pinning their own pair, not the published set, and the one
 * that flips has to say so on screen rather than in a caveat drawer.
 */
function sensitivityHTML(r: JourneyResult): string {
  const strict = r.radii.strict;
  const walk = strict.transfer_walk_m;
  const flip = r.sign_flips
    ? `<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented — neither feed
        publishes them — and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`
    : '';
  return `
    <div class="routes">
      <h3>If riders will only walk ${walk} m to change bus</h3>
      <div class="jl"><span class="jl-what">${sideCell(strict.current)} →
        ${sideCell(strict.proposed)} min</span>
        <span class="muted">${changePhrase(strict.change_min)}</span></div>
      ${flip}
    </div>`;
}

function notesHTML(r: JourneyResult): string {
  const c = r.constants;
  return `<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here — a rider is assumed to walk
    up to ${c.max_transfer_walk_m} m between stops at
    ${c.walk_speed_m_per_min} m per minute, with
    ${c.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`;
}

/** The whole panel for one answered pair. */
export function journeyPanelHTML(r: JourneyResult, destLabel: string): string {
  const at = r.radii[DRAWN_RADIUS];
  const cls = at.change_min == null ? 'flat'
    : at.change_min > 0 ? 'down' : at.change_min < 0 ? 'up' : 'flat';
  const head = `
    <div class="place-head">
      <h2>Travel time to ${esc(destLabel)}</h2>
      <div class="muted">
        from ${r.origin.lat.toFixed(5)}, ${r.origin.lon.toFixed(5)} ·
        ${r.day} · ready at any minute between ${clock(r.window.start_min)}
        and ${clock(r.window.end_min)}
      </div>
    </div>`;

  if (at.classification !== 'comparable') {
    return `${head}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${CLASS_NOTE[at.classification] ?? ''}</p>
      </div>
      ${notesHTML(r)}`;
  }

  return `${head}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${sideCell(at.current)}</div>
      </div>
      <div class="hl-arrow">→</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${sideCell(at.proposed)}</div>
      </div>
      <div class="hl-delta ${cls}">${changePhrase(at.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${profileTable(at)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${at.current.itinerary ? itineraryHTML(at.current.itinerary, r) : ''}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${at.proposed.itinerary ? itineraryHTML(at.proposed.itinerary, r) : ''}
      <p class="note">One real trip out of the ${r.window.minutes} the window
        holds — the one that takes the median time — not a summary of several.</p>
    </div>

    ${sensitivityHTML(r)}
    ${notesHTML(r)}`;
}

/** What to show before a reader has picked a starting point. */
export function journeyPromptHTML(destLabel: string): string {
  return `
    <div class="empty">
      <h2>How long does the trip take?</h2>
      <p>Click anywhere on the map to time the trip from there to
         <b>${esc(destLabel)}</b>, on today's network and under the plan.</p>
      <p>This is the only view here with a clock on it. The time starts when a
         rider is ready to leave, not when they board, so the wait for the bus
         counts — which is the one place a changed headway shows up as minutes
         of someone's morning rather than as a trip count.</p>
      <p>The answer is a spread, not a departure: the trip is timed from every
         minute of the morning peak and what is shown is the median, with the
         best and worst minute beside it.</p>
      <p class="muted">It takes a moment — both networks are routed from
         scratch for the two points you choose, twice over, because the
         connections between buses are not published by either feed and have to
         be assumed.</p>
    </div>`;
}

/** The map key: two trips, and which assumed transfer walk is drawn. */
export function journeyKeyHTML(r: JourneyResult | null): string {
  const walk = r ? r.radii[DRAWN_RADIUS].transfer_walk_m : 400;
  return `
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${NOW_COLOR}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${PROP_COLOR}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${walk} m to change bus — a number nobody publishes, so the
      panel answers at a stricter one too.</p>`;
}
