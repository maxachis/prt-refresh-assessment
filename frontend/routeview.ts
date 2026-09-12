/**
 * A route asked for by name: drawn end to end on the map, with a card in
 * the panel saying what PRT calls it and what it becomes.
 *
 * This is the third thing on the site that is route-shaped, and the
 * comment on `stoproutes.ts` explains why the first two are allowed to be:
 * convention 1 forbids comparing route N to route N, because the plan
 * re-splits corridors and a route can "lose half its trips" while every
 * stop on it keeps them. So this layer draws ONE route on ONE network and
 * says nothing about the other. The card beside it prints PRT's own
 * crosswalk row — PRT's labelling of which route replaces which — as PRT
 * wrote it, and then says in so many words that it is not a comparison and
 * where the comparison is: click a stop on the line.
 *
 * It shares the kerb layer's rendering (`stoproutes.createRouteLines`) on a
 * source of its own, just beneath the kerb's. Two sources because the two
 * have different lives: the kerb's lines belong to a click and the next
 * click clears them; this line was asked for by name and the reader is now
 * clicking ALONG it, so a click must leave it alone. The chip in the key is
 * its only key and the only way to clear it, short of picking another
 * route. Beneath the kerb's so that a stop's own routes, which are the
 * answer, always draw over the route that was only how the reader got
 * there.
 *
 * Two caveats travel with the drawing, the same two as the kerb layer's.
 * It is DRAWING ONLY — the shapes are lossy, nothing may be measured off
 * them. And it is BUSES ONLY — the T and the inclines are not in either
 * feed's bus routes, so a train on the same street is not drawn.
 */
import { esc } from './utils';
import { Day, DAYS, RouteResult, Side } from './types';
import { createRouteLines, StopRouteProps } from './stoproutes';
import { dayPhrase } from './statebar';

/** Which route is drawn: the pair the URL carries as `drawn=<side>:<id>`. */
export interface DrawnRoute {
  side: Side;
  route_id: string;
}

/**
 * The colour when the feed gives none. A magenta, because every other hue
 * on the map already means something -- blue today, orange proposed, green
 * gained, red lost, and the kerb palette's spread of the rest -- and a
 * searched route drawn in one of those would be read as that.
 */
export const ROUTE_HIGHLIGHT = '#c026d3';

/**
 * A little wider than the kerb's lines (3.5): this line is one the reader
 * named, so where the two cross at a stop the named one should be the one
 * still visible beneath.
 */
const WIDTH = 4.5;

const ids = {
  source: 'routeview',
  lines: 'routeview-lines',
  flow: 'routeview-flow',
  arrows: 'routeview-arrows',
};

/** The hover layer, for `main.ts` to put a `routeLineLabel` on. */
export const ROUTE_VIEW_LINES_LAYER = ids.lines;

const lines = createRouteLines({ ids, width: WIDTH });

// --------------------------------------------------------------------------
// the request
// --------------------------------------------------------------------------

export function routeUrl(r: DrawnRoute, day: Day): string {
  const p = new URLSearchParams({ side: r.side, route_id: r.route_id, day });
  return `/api/route?${p}`;
}

// --------------------------------------------------------------------------
// the colour and the shapes
// --------------------------------------------------------------------------

/** The feed's `route_color` is hex without the `#`; CSS and MapLibre want it with. */
export function routeColor(color: string | null): string {
  if (!color) return ROUTE_HIGHLIGHT;
  return color.startsWith('#') ? color : `#${color}`;
}

interface RouteLineFeature {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: StopRouteProps;
}

/**
 * One line per pattern, all in the route's colour, with the properties the
 * kerb layer's hover reads -- so a line drawn from search and one drawn at
 * a kerb answer the pointer the same way.
 */
export function toGeoJSON(r: RouteResult) {
  const color = routeColor(r.color);
  const features: RouteLineFeature[] = r.features.map((f) => ({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: f.points },
    properties: {
      side: r.side,
      route: r.short_name,
      name: r.long_name || null,
      pattern_id: f.pattern_id,
      color,
    },
  }));
  return { type: 'FeatureCollection' as const, features };
}

// --------------------------------------------------------------------------
// the map
// --------------------------------------------------------------------------

export function initRouteLayer(map: maplibregl.Map, beforeId?: string) {
  lines.init(map, beforeId);
}

/**
 * Draw the route, or clear it.
 *
 * A result with no features -- a day the route does not run -- clears the
 * map the same as null does; the chip and the card are what say why.
 */
export function drawRoute(map: maplibregl.Map, r: RouteResult | null) {
  const gj = r ? toGeoJSON(r) : { type: 'FeatureCollection' as const, features: [] };
  lines.setData(map, gj);
  const drawn = gj.features.length > 0;
  lines.setVisible(map, drawn);
  if (drawn) lines.startFlow(map);
  else lines.stopFlow();
}

// --------------------------------------------------------------------------
// the words
// --------------------------------------------------------------------------

/** What the key and the card call each network. */
const NETWORK: Record<Side, string> = { current: 'today', proposed: 'the plan' };

/** The chip's shorter word for the plan, matching the line's own hover. */
const SIDE_SHORT: Record<Side, string> = { current: 'today', proposed: 'proposed' };

const DAY_PLURAL: Record<Day, string> = {
  weekday: 'weekdays', saturday: 'Saturdays', sunday: 'Sundays',
};

function list(words: string[], joiner: 'and' | 'or'): string {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} ${joiner} ${words[words.length - 1]}`;
}

/**
 * "Runs on weekdays and Saturdays; does not run on Sundays." The days it
 * does NOT run are said outright rather than left to be inferred from the
 * ones it does: the reader who switched the toolbar to Sunday and saw the
 * line vanish is the one this sentence is for.
 */
export function daysSentence(days: Day[]): string {
  const on = DAYS.filter((d) => days.includes(d));
  const off = DAYS.filter((d) => !days.includes(d));
  if (on.length === 0) return 'Does not run on any day type in this feed.';
  const runs = `Runs on ${list(on.map((d) => DAY_PLURAL[d]), 'and')}`;
  if (off.length === 0) return `${runs}.`;
  return `${runs}; does not run on ${list(off.map((d) => DAY_PLURAL[d]), 'or')}.`;
}

/** "61C Murray · today · a weekday", for the chip and the state line. */
export function routeLine(r: RouteResult): string {
  const name = [r.short_name, r.long_name].filter(Boolean).join(' ');
  return `${name} · ${SIDE_SHORT[r.side]} · ${dayPhrase(r.day)}`;
}

/**
 * The chip in the key: the drawn line's only key, and the only way to
 * clear it short of picking another route.
 *
 * It wears the line's colour, because unlike the kerb palette this colour
 * is one the reader can match by eye -- there is one line -- and a route
 * with a colour of its own in the feed is drawn in it. On a day the route
 * does not run the chip stays, saying so: a chip that vanished with the
 * line would leave the day switch looking like it had cleared the route.
 */
export function routeKeyHTML(r: RouteResult): string {
  const drawn = r.features.length > 0;
  const note = drawn
    ? `<span class="pk-note">arrows: direction of travel</span>`
    : `<span class="pk-note">does not run on ${esc(dayPhrase(r.day))} — nothing drawn</span>`;
  return `
    <div class="pk-head rk-head">
      <i class="sw-route" style="background:${esc(routeColor(r.color))}"></i>
      <span class="rk-name"><b>${esc(r.short_name)}</b>${r.long_name ? ` ${esc(r.long_name)}` : ''}
        · ${SIDE_SHORT[r.side]} · ${esc(dayPhrase(r.day))}</span>
      <button type="button" class="rk-clear" data-clear-route
              aria-label="Clear the drawn route" title="Clear the drawn route">×</button>
    </div>
    ${note}`;
}

/**
 * PRT's row, as PRT wrote it. The row names both sides; the one printed
 * after the category is the OTHER network's name for the route the reader
 * is looking at, which is the thing the row exists to say.
 */
function crosswalkHTML(r: RouteResult): string {
  const cw = r.crosswalk;
  if (!cw) {
    return `<p>PRT's crosswalk has no row for this route.</p>`;
  }
  const counterpart = r.side === 'current' ? cw.final_route : cw.current_route;
  const related = cw.related_routes ? ` Related: ${esc(cw.related_routes)}` : '';
  const link = cw.route_page
    ? `<p><a class="link" href="${esc(cw.route_page)}" target="_blank" rel="noopener">PRT's page for this route ↗</a></p>`
    : '';
  return `<p>PRT's crosswalk: ${esc(cw.category)} · ${esc(counterpart)}.${related}</p>${link}`;
}

/**
 * The card the panel shows for a route picked by name.
 *
 * Its heading is the route; its body is PRT's crosswalk row and two
 * caveats that are not optional. The first is convention 1 -- this site
 * never measures a route against its successor -- said in the reader's
 * words and pointing at where the measurement is. The second is the
 * drawing's own: shapes, not stops, and buses, not trains.
 */
export function routeCardHTML(r: RouteResult): string {
  const drawn = r.features.length > 0;
  const heading = `Route ${esc(r.short_name)}${r.long_name ? ` · ${esc(r.long_name)}` : ''}`;
  const notDrawn = drawn ? '' : `
      <p class="note">It does not run on ${esc(dayPhrase(r.day))}, so nothing is
        drawn for the day the toolbar is set to; switch the day to see it.</p>`;
  return `
    <div class="route-card">
      <div class="place-head">
        <h2>${heading}</h2>
        <div class="sub">${NETWORK[r.side] === 'today' ? "today's network" : 'the plan'}</div>
      </div>
      <p>${esc(daysSentence(r.days))}</p>${notDrawn}
      <h3 class="scope-head">What PRT says it becomes</h3>
      ${crosswalkHTML(r)}
      <p class="note">This is PRT's own labelling of which route replaces
        which. It is not a comparison — this site never measures a route
        against its successor, because the plan re-splits corridors and a
        route can "lose half its trips" while every stop on it keeps them.
        To see what changes for the riders along this line, click a stop on
        it.</p>
      <p class="note">Drawn from the feed's shapes — for drawing only; buses
        only, so a train on the same street is not shown.</p>
    </div>`;
}
