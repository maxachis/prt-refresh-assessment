/**
 * The Route changes view — the plan read by route group, which is the one
 * unit the repo's first convention otherwise forbids.
 *
 * Every other view here is built so that a route number never enters the
 * answer: a location, a cell, a street, a place. This one puts the numbers
 * back, because "what happens to the 51?" is the question a rider actually
 * asks and no view on the site could answer it. Its unit is a ROUTE GROUP:
 * the connected set of today's route numbers and the plan's that PRT maps
 * onto one another (`analyze_route_hours.py`'s docstring is the reference).
 * Today's 61B and the proposed 62X are one group, not a route that vanished
 * and a route that appeared; 77 and 86 merging into the proposed 86 are one
 * group; 51 splitting into 51 and 51S are one group.
 *
 * Four decisions worth keeping.
 *
 *  - A GROUP IS NOT A CORRIDOR, AND THE VIEW SAYS SO EVERYWHERE IT CAN. Where
 *    the plan covers a corridor with a route PRT records as NEW, the new route
 *    is its own group and the incumbent's group looks cut. Carrick is exactly
 *    that case: today's 51 groups with the plan's 51 and 51S and reads as
 *    −10% weekday trips, while the new 45 — 70 weekday trips over much of the
 *    same street — is a separate `new` group. Nothing adds them together, and
 *    nothing may: PRT's `related_routes` column chains (1 relates to 5 and
 *    91, 39 to 34 and 35) and unioning on it collapses most of the network
 *    into one component. So this view answers "what happened to this
 *    service", and access stays with the location, surface and street views.
 *    The caveat (`ROUTE_CHANGES_CAVEAT`) travels with the directory, the card
 *    and the method drawer.
 *  - ONE-TO-ONE IS GREY, AND BEHIND A TOGGLE. Sixty-odd of the hundred-odd
 *    groups keep one number on each side, and drawn at full weight they are
 *    most of the network — a map of everything, coloured by nothing. Max's
 *    decision: grey, drawn beneath the coloured lines, and off until asked
 *    (`OneToOne`, the toolbar's `#route-onetoone-controls`). The key says
 *    which state the grey is in, because a map missing sixty routes has to
 *    say it is.
 *  - SELECTING A GROUP CHANGES WHAT BLUE MEANS. Unselected, the lines are
 *    coloured by status and blue is `new`. Selected, the group's own two
 *    sides are drawn in the site's today/plan pair (`NOW_COLOR` is a blue too)
 *    over everything else dimmed. The key rewrites itself on selection for
 *    that reason — it must say what the colours mean at every moment, and
 *    the same hue means two different things a click apart.
 *  - THE OVERVIEW IS PER DAY; THE DIRECTORY IS NOT. The drawn patterns are
 *    the shown side's journey patterns on the toolbar's day, and a route
 *    with no Sunday pattern draws nothing on a Sunday — so the day control
 *    stays visible in this view and a day change refetches the overview.
 *    The group list and the card are day-free: a group's status is a fact
 *    about the crosswalk, and its card tabulates all three days at once.
 */
import {
  RouteChangesResult, RouteGroup, RouteGroupDetail, RouteChangeFeature,
  RouteStatus, RouteRef, Day, Side, DAYS,
} from './types';
import { fetchJSONOnce, esc } from './utils';
import { GONE_COLOR, NEW_COLOR } from './surface';
import { KEPT_COLOR } from './corridor';
import { NOW_COLOR, PROP_COLOR } from './journey';

// --------------------------------------------------------------------------
// the vocabulary
// --------------------------------------------------------------------------

/**
 * The toolbar's ONE-TO-ONE control: whether the grey routes are drawn at all.
 * Off by default -- see the module docstring's second bullet.
 */
export type OneToOne = 'hidden' | 'shown';
export const DEFAULT_ONE_TO_ONE: OneToOne = 'hidden';

/**
 * The colour for a route the plan reshapes -- split into several, or several
 * merged into one. A purple: far from the red of gone and the blue of new
 * (`surface.ts`), from the grey of kept (`corridor.ts`), and from the
 * today/plan blue-and-orange pair (`journey.ts`) that takes over the map
 * once a group is selected. Chosen against Positron's near-white basemap,
 * which is what the lines are drawn over; the panel's own pill uses a
 * lighter tint of it in CSS, since this hex sits at about 3:1 against the
 * dark panel and text there needs more.
 */
export const RESHAPED_COLOR = '#8e44ad';

/** Which of the overview's colours each status wears. */
export const STATUS_COLOR: Record<RouteStatus, string> = {
  discontinued: GONE_COLOR,
  new: NEW_COLOR,
  split: RESHAPED_COLOR,
  merged: RESHAPED_COLOR,
  'one-to-one': KEPT_COLOR,
};

export const STATUS_LABEL: Record<RouteStatus, string> = {
  discontinued: 'discontinued',
  new: 'new',
  split: 'split',
  merged: 'merged',
  'one-to-one': 'one-to-one',
};

/**
 * The directory's order: what changed first, what did not last. Split and
 * merged are one heading in the panel ("Split or merged") and one colour on
 * the map, but two statuses in the data, because the card's pill says which.
 */
export const STATUS_ORDER: RouteStatus[] = ['discontinued', 'new', 'split', 'merged', 'one-to-one'];

/**
 * The `/api/meta` caveat this view links to, under `data-caveat`, the way
 * every other view links its own. Named once so the directory, the card and
 * `main.ts` cannot spell it three ways.
 */
export const ROUTE_CHANGES_CAVEAT = 'route-changes';

/**
 * What every unselected line fades to while a group is selected. Dimmed
 * rather than hidden, so the selected group still reads against the rest of
 * the network it belongs to -- but low enough that its own two colours are
 * the only saturated thing on the map.
 */
export const DIM_OPACITY = 0.12;

/** The overview's opacity, restored when the selection clears. */
const FULL_OPACITY = 0.9;

/** A selected group is drawn solid: it is the only saturated thing on the map. */
const SELECTED_OPACITY = 1.0;

/**
 * A group key as the API spells it: `c:` or `p:` for which side named it,
 * then the route ids joined by `-`. This is the whole grammar a URL's
 * `route=` is checked against before anything is fetched with it.
 */
const ROUTE_KEY = /^[cp]:[\w-]{1,64}$/;

export function isRouteKey(s: string): boolean {
  return ROUTE_KEY.test(s);
}

/** Plain day words for the key's head line -- "a weekday", not "weekday". */
const DAY_WORD: Record<Day, string> = {
  weekday: 'a weekday',
  saturday: 'a Saturday',
  sunday: 'a Sunday',
};

const SIDE_WORD: Record<Side, string> = { current: 'today', proposed: 'proposed' };

/** The arrow between a group's two sides, and the dash for a side it lacks. */
const MAPS_TO = ' → ';
const NO_SIDE = '—';

// --------------------------------------------------------------------------
// the words
// --------------------------------------------------------------------------

/** One side of a group as "51 Carrick, 51S Carrick Short", or a dash for none. */
export function sideLabel(refs: RouteRef[], { named = true } = {}): string {
  if (refs.length === 0) return NO_SIDE;
  return refs.map((r) => (named && r.name ? `${r.route} ${r.name}` : r.route)).join(', ');
}

/**
 * A group as its mapping: "51 CARRICK → 51 Carrick, 51S Carrick Short".
 *
 * `farSideNamed: false` gives the directory's short form, where the plan's
 * side is numbers alone ("51 CARRICK → 51, 51S") -- except for a new group,
 * whose plan side is the only side there is and so keeps its name.
 */
export function mappingLabel(g: RouteGroup, { farSideNamed = true } = {}): string {
  const near = sideLabel(g.current);
  const far = sideLabel(g.proposed, { named: farSideNamed || g.current.length === 0 });
  return `${near}${MAPS_TO}${far}`;
}

/**
 * A percent change, signed both ways with a real minus sign, or a dash for
 * `null` -- which the API sends where today's side is zero and there is
 * nothing to divide by. Whole percents: a route group's trips are counted in
 * tens and hundreds, and a decimal would be precision the count cannot
 * carry.
 */
export function signedPct(pct: number | null): string {
  if (pct === null) return NO_SIDE;
  const n = Math.round(pct);
  if (n === 0) return '0%';
  return n > 0 ? `+${n}%` : `−${Math.abs(n)}%`;
}

/** How many groups wear each status, every status present even at zero. */
export function statusCounts(groups: RouteGroup[]): Record<RouteStatus, number> {
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<RouteStatus, number>;
  for (const g of groups) counts[g.status] += 1;
  return counts;
}

// --------------------------------------------------------------------------
// the map
// --------------------------------------------------------------------------

const SRC = 'routechange';
const LAYER_LINES = 'routechange-lines';
const LAYER_ARROWS = 'routechange-arrows';
const SEL_SRC = 'routechange-selected';
const LAYER_SEL_LINES = 'routechange-selected-lines';
const LAYER_SEL_ARROWS = 'routechange-selected-arrows';
const ALL_LAYERS = [LAYER_LINES, LAYER_ARROWS, LAYER_SEL_LINES, LAYER_SEL_ARROWS];

/**
 * The line layers a click or a hover is tested against, topmost first: a
 * selected group's own lines win over the dimmed network beneath them.
 */
export const ROUTE_HIT_LAYERS = [LAYER_SEL_LINES, LAYER_LINES];

/**
 * The arrow image, registered once as an SDF so `icon-color` can paint it per
 * feature -- the same trick `stoproutes.ts` uses, under its own name so the
 * two layers cannot fight over one image if either changes its glyph.
 */
const ARROW = 'routechange-arrow';

/** Line width at z14; the overview is thinner than a kerb's routes, since it is the whole network. */
const WIDE = 2.6;

/** Properties on every line this module draws. */
export interface RouteLineProps {
  key: string;
  side: Side;
  route: string;
  name: string | null;
  status: RouteStatus;
  pattern_id: number;
  /** What the line is painted -- status colour in the overview, side colour once selected. */
  color: string;
  /** Draw order: 0 beneath 1. Grey under colour in the overview; today under the plan once selected. */
  sort: 0 | 1;
  /** Width multiplier: 1 everywhere except a selected group's today side -- see `CASING_WIDTH`. */
  w: number;
}

/**
 * A selected group's widths, as multiples of the overview's line.
 *
 * The plan side is drawn heavier than the overview because it is the one
 * thing on the map at that moment, over a network dimmed almost to nothing,
 * and the today/plan pair is a pale one on Positron's near-white ground.
 * Today's side is wider still, underneath: the two sides are mostly the same
 * street -- a split keeps the trunk, a reroute moves a few blocks -- and
 * drawn at one width the plan's line simply covers today's, so "today's
 * alignment" would appear to be only the stub where the two part company.
 * Wider beneath, today shows as a blue casing along every shared stretch
 * and as a blue line alone where the plan left it, which is the diff a
 * reader is looking for.
 */
export const SELECTED_WIDTH = 1.5;
export const CASING_WIDTH = 2.8;

interface RouteLineFeature {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: RouteLineProps;
}

function lineFeature(f: RouteChangeFeature, color: string, sort: 0 | 1, w = 1): RouteLineFeature {
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: f.points },
    properties: {
      key: f.key, side: f.side, route: f.route, name: f.name, status: f.status,
      pattern_id: f.pattern_id, color, sort, w,
    },
  };
}

/**
 * Every group's shown side, one line per pattern, coloured by status.
 *
 * The one-to-one grey is put FIRST in the collection and given the lower
 * sort key, so it renders underneath everything coloured whichever of the
 * two orderings MapLibre honours -- `line-sort-key` where it applies, source
 * order otherwise. A grey drawn over a red would hide exactly the change the
 * view exists to show.
 */
export function toOverviewGeoJSON(r: RouteChangesResult) {
  const features = r.features
    .map((f) => lineFeature(f, STATUS_COLOR[f.status], f.status === 'one-to-one' ? 0 : 1))
    .sort((a, b) => a.properties.sort - b.properties.sort);
  return { type: 'FeatureCollection' as const, features };
}

/**
 * One selected group, both sides, in the site's today/plan pair -- today
 * underneath and wider (`CASING_WIDTH`), the plan on top, the same order
 * every other today-against-plan drawing here uses.
 */
export function toSelectedGeoJSON(d: RouteGroupDetail) {
  const features = d.features
    .map((f) => (f.side === 'current'
      ? lineFeature(f, NOW_COLOR, 0, CASING_WIDTH)
      : lineFeature(f, PROP_COLOR, 1, SELECTED_WIDTH)))
    .sort((a, b) => a.properties.sort - b.properties.sort);
  return { type: 'FeatureCollection' as const, features };
}

/** `[[west, south], [east, north]]` around every point drawn, or null with nothing to fit. */
export function routeGroupBounds(features: RouteChangeFeature[]): [[number, number], [number, number]] | null {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const f of features) {
    for (const [lon, lat] of f.points) {
      if (lon < w) w = lon;
      if (lon > e) e = lon;
      if (lat < s) s = lat;
      if (lat > n) n = lat;
    }
  }
  return Number.isFinite(w) ? [[w, s], [e, n]] : null;
}

/**
 * The layer filter for the ONE-TO-ONE control: drop the grey while it is
 * hidden, no filter while it is shown. A filter rather than an opacity of
 * zero, because a hidden feature is also un-hoverable and un-clickable --
 * a transparent line that still answered the pointer would be a ghost.
 */
export function oneToOneFilter(mode: OneToOne): any {
  return mode === 'hidden' ? ['!=', ['get', 'status'], 'one-to-one'] : null;
}

/**
 * Zoom-scaled, times the feature's own multiplier. The multiplier sits in
 * the curve's outputs rather than around the curve, because MapLibre only
 * accepts `zoom` as the input of a top-level interpolate.
 */
function lineWidth(): any {
  const at = (px: number) => ['*', ['get', 'w'], px];
  return ['interpolate', ['linear'], ['zoom'],
    9, at(WIDE * 0.5), 14, at(WIDE), 16, at(WIDE * 1.6)];
}

/**
 * The arrowhead, drawn once -- identical in construction to `stoproutes.ts`'s
 * and kept separate for the reason `ARROW` gives. White and soft-edged
 * because it is an SDF: the alpha is a distance field and the colour comes
 * from `icon-color` per feature.
 */
function arrowIcon(scale = 2): ImageData {
  const s = 16 * scale;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#ffffff';
  if ('filter' in g) g.filter = `blur(${Math.round(s * 0.06)}px)`;
  const pad = s * 0.24;
  g.beginPath();
  g.moveTo(s - pad, s / 2);
  g.lineTo(pad, pad);
  g.lineTo(pad, s - pad);
  g.closePath();
  g.fill();
  return g.getImageData(0, 0, s, s);
}

function addLineLayers(map: maplibregl.Map, src: string, lines: string, arrows: string,
                       beforeId: string | undefined, opacity: number) {
  map.addSource(src, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] } as any,
  });
  map.addLayer({
    id: lines,
    type: 'line',
    source: src,
    layout: {
      visibility: 'none', 'line-cap': 'round', 'line-join': 'round',
      // Grey beneath colour, today beneath the plan: see `toOverviewGeoJSON`.
      'line-sort-key': ['get', 'sort'],
    },
    paint: {
      'line-color': ['get', 'color'],
      'line-width': lineWidth(),
      'line-opacity': opacity,
    },
  }, beforeId);
  map.addLayer({
    id: arrows,
    type: 'symbol',
    source: src,
    layout: {
      visibility: 'none',
      'symbol-placement': 'line',
      // Sparser than a kerb's routes: this is the whole network, and an
      // arrow every 90 px over a hundred routes is a texture, not a direction.
      'symbol-spacing': 140,
      'symbol-sort-key': ['get', 'sort'],
      'icon-image': ARROW,
      'icon-size': ['interpolate', ['linear'], ['zoom'], 12, 0.45, 16, 0.8],
      'icon-rotation-alignment': 'map',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
    paint: { 'icon-color': ['get', 'color'], 'icon-opacity': opacity },
  }, beforeId);
}

export function initRouteChangesLayer(map: maplibregl.Map, beforeId?: string) {
  if (!map.hasImage(ARROW)) {
    map.addImage(ARROW, arrowIcon(), { pixelRatio: 2, sdf: true });
  }
  // The overview first and the selection after, both at the same slot, so the
  // selected group's two sides sit over the dimmed network -- the same
  // insertion trick `initPlacesLayer` uses for its fill and points.
  addLineLayers(map, SRC, LAYER_LINES, LAYER_ARROWS, beforeId, FULL_OPACITY);
  addLineLayers(map, SEL_SRC, LAYER_SEL_LINES, LAYER_SEL_ARROWS, beforeId, SELECTED_OPACITY);
  setOneToOne(map, DEFAULT_ONE_TO_ONE);
}

// --------------------------------------------------------------------------
// the data
// --------------------------------------------------------------------------

let overview: RouteChangesResult | null = null;
let detail: RouteGroupDetail | null = null;
let visible = false;

/** The overview on screen -- the groups and the drawn day -- or null before it has loaded. */
export function layerData(): RouteChangesResult | null {
  return overview;
}

/** The directory: every group, in rank order. Identical on every day, so any loaded overview will do. */
export function groupsData(): RouteGroup[] | null {
  return overview?.groups ?? null;
}

/** The selected group with both its sides drawn, or null while nothing is selected. */
export function selectedData(): RouteGroupDetail | null {
  return detail;
}

export function isVisible(): boolean {
  return visible;
}

export function routeChangesUrl(day: Day): string {
  return `/api/route_changes?day=${day}`;
}

export function routeGroupUrl(key: string, day: Day): string {
  return `/api/route_changes/${encodeURIComponent(key)}?day=${day}`;
}

/**
 * Fetch and draw one day's overview. Through `fetchJSONOnce`, since the
 * answer is a precomputed table: switching Saturday and back costs one
 * request per day type for the life of the page, the way the corridor and
 * surface layers are meant to be paid for.
 */
export async function loadRouteChanges(map: maplibregl.Map, day: Day): Promise<RouteChangesResult> {
  if (!DAYS.includes(day)) throw new Error(`no such day type: ${day}`);
  overview = await fetchJSONOnce<RouteChangesResult>(routeChangesUrl(day));
  (map.getSource(SRC) as maplibregl.GeoJSONSource).setData(toOverviewGeoJSON(overview) as any);
  return overview;
}

/**
 * Select one group: fetch both its sides for `day`, draw them over the
 * dimmed network, and fit the map to them.
 *
 * A 404 -- a stale key from an older build, or a hand-typed `route=` that
 * passed the grammar but names nothing -- clears the selection rather than
 * throwing, the same choice `selectPlace` makes: a link built against an
 * older run should land on the directory, not on an error the reader did
 * nothing to cause.
 *
 * `fly` is off when a link also carried a camera: the reader who copied the
 * link was looking at something in particular, and fitting the whole group
 * would move them off it.
 */
export async function selectRouteGroup(
  map: maplibregl.Map, key: string, day: Day, { fly = true } = {},
): Promise<RouteGroupDetail | null> {
  try {
    detail = await fetchJSONOnce<RouteGroupDetail>(routeGroupUrl(key, day));
  } catch {
    clearRouteSelection(map);
    return null;
  }
  (map.getSource(SEL_SRC) as maplibregl.GeoJSONSource).setData(toSelectedGeoJSON(detail) as any);
  setDimmed(map, true);
  const bounds = routeGroupBounds(detail.features);
  if (fly && bounds) {
    // Padded so the ends of a route are not under the key or the toolbar,
    // and capped so a short shuttle does not zoom to street level.
    map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
  }
  return detail;
}

/** Drop the selection: the network comes back to full weight and nothing is drawn over it. */
export function clearRouteSelection(map: maplibregl.Map) {
  detail = null;
  (map.getSource(SEL_SRC) as maplibregl.GeoJSONSource)?.setData(
    { type: 'FeatureCollection', features: [] } as any);
  if (map.getLayer(LAYER_LINES)) setDimmed(map, false);
}

function setDimmed(map: maplibregl.Map, dim: boolean) {
  const opacity = dim ? DIM_OPACITY : FULL_OPACITY;
  map.setPaintProperty(LAYER_LINES, 'line-opacity', opacity);
  map.setPaintProperty(LAYER_ARROWS, 'icon-opacity', opacity);
}

/** Show or drop the one-to-one grey -- see `oneToOneFilter`. Only the overview carries grey. */
export function setOneToOne(map: maplibregl.Map, mode: OneToOne) {
  map.setFilter(LAYER_LINES, oneToOneFilter(mode));
  map.setFilter(LAYER_ARROWS, oneToOneFilter(mode));
}

export function setRouteChangesVisible(map: maplibregl.Map, on: boolean) {
  visible = on;
  for (const layer of ALL_LAYERS) {
    map.setLayoutProperty(layer, 'visibility', on ? 'visible' : 'none');
  }
}

// --------------------------------------------------------------------------
// the panel
// --------------------------------------------------------------------------

/**
 * What the directory and the card both say a group is, before any number.
 * One sentence, because it is the whole caveat in miniature and the method
 * drawer holds the rest.
 */
const GROUP_NOTE = 'A route group is PRT’s own mapping of today’s route '
  + 'numbers onto the plan’s — the routes it says replace each other. It '
  + 'is not a corridor: a street can lose one group’s buses and gain '
  + 'another’s, and only the location, surface and street views can see '
  + 'that.';

function methodLink(): string {
  return ` <button class="howto" data-caveat="${ROUTE_CHANGES_CAVEAT}">method</button>`;
}

/**
 * The trips column of a directory row, or nothing for a group with one side.
 *
 * A discontinued route is −100% by construction and a new one has no
 * percent at all; printing either beside the mapping would say "−100%" of a
 * route the row already says is gone. The heading carries that fact, so the
 * figure is reserved for the groups where it means something.
 */
function rowChange(g: RouteGroup): string {
  if (g.current.length === 0 || g.proposed.length === 0) return '';
  const pct = g.service.weekday.pct_trips;
  return `<span class="rc-pct ${trend(pct)}" title="Weekday trips, today to plan">${signedPct(pct)}</span>`;
}

/** The colour class a signed figure wears: the panel's own up/down/flat. */
function trend(pct: number | null): 'up' | 'down' | 'flat' {
  if (pct === null || Math.round(pct) === 0) return 'flat';
  return pct > 0 ? 'up' : 'down';
}

function routeRow(g: RouteGroup, selected: boolean): string {
  return `
    <button type="button" class="rc-row${selected ? ' selected' : ''}"
            data-select-route="${esc(g.key)}">
      <span class="rc-map">${esc(mappingLabel(g, { farSideNamed: false }))}</span>
      ${rowChange(g)}
    </button>`;
}

/** A heading and its rows -- "Discontinued (21)" over the rows that wear it. */
function section(title: string, groups: RouteGroup[], selectedKey: string | null): string {
  return `
    <div class="scope-head">${esc(title)} (${groups.length})</div>
    <div class="rc-list">${groups.map((g) => routeRow(g, g.key === selectedKey)).join('')}</div>`;
}

/**
 * The directory: every group under its status heading, in rank order within
 * each. Split and merged share a heading -- they share a colour on the map,
 * and "reshaped" is the reading a reader wants first; the card's pill says
 * which. One-to-one is folded shut so the list opens on what changed.
 */
export function routeListHTML(groups: RouteGroup[], selectedKey: string | null): string {
  const by = (statuses: RouteStatus[]) => groups.filter((g) => statuses.includes(g.status));
  const kept = by(['one-to-one']);
  return `
    <div class="place-head">
      <h2>Route changes</h2>
      <div class="muted">${groups.length.toLocaleString()} route groups, ranked by weekday riders</div>
    </div>
    <p class="note">${GROUP_NOTE}${methodLink()}</p>
    ${section('Discontinued', by(['discontinued']), selectedKey)}
    ${section('New', by(['new']), selectedKey)}
    ${section('Split or merged', by(['split', 'merged']), selectedKey)}
    <details class="svc rc-kept">
      <summary>One-to-one (${kept.length}) — one number on each side; how its service changed</summary>
      <div class="rc-list">${kept.map((g) => routeRow(g, g.key === selectedKey)).join('')}</div>
    </details>`;
}

/** One day's row of the card's service table: trips and hours, today → plan, each signed. */
function serviceRow(day: Day, s: RouteGroup['service'][Day]): string {
  return `
    <tr><th>${day}</th>
      <td class="n">${s.cur_trips.toLocaleString()}</td>
      <td class="n">${s.prop_trips.toLocaleString()}</td>
      <td class="n ${trend(s.pct_trips)}">${signedPct(s.pct_trips)}</td>
      <td class="n">${s.cur_hours.toFixed(1)}</td>
      <td class="n">${s.prop_hours.toFixed(1)}</td>
      <td class="n ${trend(s.pct_hours)}">${signedPct(s.pct_hours)}</td></tr>`;
}

/**
 * PRT's own account of the group: the crosswalk rows, verbatim. Labelled as
 * PRT's, because it is the plan describing itself and not a measurement of
 * it -- the service table above it is the measurement.
 */
function prtSection(g: RouteGroup): string {
  if (g.prt.length === 0) {
    return '<p class="muted">PRT’s table has no row for this group.</p>';
  }
  const rows = g.prt.map((r) => {
    const points = r.related_routes
      ? `<div class="muted">PRT points riders to: ${esc(r.related_routes)}</div>` : '';
    const link = r.route_page
      ? `<div><a class="link" href="${esc(r.route_page)}" target="_blank" rel="noopener">PRT’s page for this route ↗</a></div>` : '';
    return `<div class="rc-prt">
      <div><b>${esc(r.current_route || NO_SIDE)}${MAPS_TO}${esc(r.final_route || NO_SIDE)}</b>
        <span class="rc-cat">${esc(r.category)}</span></div>
      ${points}${link}</div>`;
  }).join('');
  return rows;
}

/**
 * The card for one selected group: the mapping, the service on all three
 * days, PRT's own account, and the caveat.
 */
export function routeCardHTML(g: RouteGroupDetail): string {
  const riders = g.status === 'new' ? '' : `
    <p class="rc-riders">${Math.round(g.riders_weekday).toLocaleString()} weekday riders today
      <span class="muted">· WPRDC route ridership, average weekday</span></p>`;
  return `
    <button type="button" class="link rc-back" data-select-route="">← All routes</button>
    <div class="place-head">
      <h2>${esc(mappingLabel(g))}</h2>
      <span class="rc-status ${esc(g.status)}">${esc(STATUS_LABEL[g.status])}</span>
    </div>

    <div class="scope-head">Service, all three days</div>
    <table class="periods rc">
      <thead><tr><th></th>
        <th class="n" colspan="3">trips today → plan</th>
        <th class="n" colspan="3">revenue hours today → plan</th></tr></thead>
      <tbody>${DAYS.map((d) => serviceRow(d, g.service[d])).join('')}</tbody>
    </table>
    ${riders}
    <p class="note">Revenue hours are in-service time only, not a cost figure. Both
      sides are counted from timetables: today’s published feed and the
      proposed feed PRT supplied.</p>

    <div class="scope-head">What PRT says</div>
    <p class="muted rc-prt-lede">PRT’s own account, from its route crosswalk.</p>
    ${prtSection(g)}

    <p class="note">This is a route group, not a corridor. One group’s loss
      can be another group’s gain: Carrick’s 51 reads as −10% weekday
      trips while the new 45 runs much of the same street as a separate group.
      Access is measured in the location, surface and street views, not
      here.${methodLink()}</p>`;
}

// --------------------------------------------------------------------------
// the key
// --------------------------------------------------------------------------

export interface RouteKeyOptions {
  /** Every group, or null before the overview has arrived. */
  groups: RouteGroup[] | null;
  /** The day the drawn patterns are for. */
  day: Day;
  /** Whether the one-to-one grey is on the map. */
  oneToOne: OneToOne;
  /** The selected group, whose two sides have taken over the colours. */
  selected: RouteGroupDetail | null;
}

function swatchRow(color: string, label: string, n?: string): string {
  return `<div class="lg-row lg-static"><i style="background:${color};border-radius:2px"></i>
    <span class="lg-lab">${label}</span>${n === undefined ? '' : `<span class="lg-n">${n}</span>`}</div>`;
}

/**
 * The key, which has to say what the colours mean at every moment -- and the
 * meaning of blue changes on selection (module docstring, third bullet).
 *
 * The head line is the summary sentence for the day, written to stand alone:
 * the phone and embed layouts fold the key down to it.
 */
export function routeKeyHTML({ groups, day, oneToOne, selected }: RouteKeyOptions): string {
  if (selected) {
    return `
      <div class="lg-head"><b>${esc(mappingLabel(selected))}</b>
        <span class="muted">· ${esc(STATUS_LABEL[selected.status])} · ${esc(DAY_WORD[day])}</span></div>
      ${swatchRow(NOW_COLOR, "today's alignment")}
      ${swatchRow(PROP_COLOR, 'proposed alignment')}
      <div class="lg-foot">The rest of the network is dimmed. Click a line to
        select another group, or empty map to clear. Lines are drawing only:
        nothing is measured off their length.</div>`;
  }
  if (!groups) return '<div class="lg-head"><b>Route changes</b></div>';
  const n = statusCounts(groups);
  const reshaped = n.split + n.merged;
  const head = `${groups.length.toLocaleString()} route groups · ${n.discontinued} discontinued`
    + ` · ${n.new} new · ${reshaped} split or merged · ${DAY_WORD[day]}`;
  return `
    <div class="lg-head"><b>${esc(head)}</b></div>
    ${swatchRow(STATUS_COLOR.discontinued, 'discontinued — today’s alignment', String(n.discontinued))}
    ${swatchRow(STATUS_COLOR.new, 'new — proposed alignment', String(n.new))}
    ${swatchRow(RESHAPED_COLOR, 'split or merged — proposed alignment', String(reshaped))}
    ${swatchRow(STATUS_COLOR['one-to-one'], `one-to-one (${oneToOne})`, String(n['one-to-one']))}
    <div class="lg-foot">A route group is PRT’s own mapping of today’s
      numbers onto the plan’s, not a corridor. Patterns are the ones that
      run on ${esc(DAY_WORD[day])}. Click a line to select its group.</div>`;
}

// --------------------------------------------------------------------------
// the hover
// --------------------------------------------------------------------------

/**
 * The hover for one drawn pattern: "51 Carrick · proposed · split".
 *
 * Once a group is selected the network word carries the weight, because it
 * is the thing the two colours on the map are now distinguishing.
 */
export function routeTooltipHTML(props: RouteLineProps, { selected }: { selected: boolean }): string {
  const route = esc(props.name ? `${props.route} ${props.name}` : props.route);
  const side = esc(SIDE_WORD[props.side]);
  const status = esc(STATUS_LABEL[props.status]);
  return selected
    ? `${route} · <b>${side}</b> · ${status}`
    : `<b>${route}</b> · ${side} · ${status}`;
}
