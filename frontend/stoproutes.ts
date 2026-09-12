/**
 * The Stop-by-stop view's route layer: every bus route calling at the clicked
 * kerb, drawn end to end along the street it drives, with an arrow flowing in
 * the direction of travel — additive to the kerb figures in the panel beside
 * it rather than a replacement for any of them.
 *
 * ITS CONTROL IS ON THE MAP, not in the panel. It changes what the map
 * draws, which is the line `docs/WEBAPP.md` draws between the two: the
 * toolbar owns anything that paints the ground, the panel holds only the
 * answer. It sat in the kerb block until 2026-09-11 — scoped to the clicked
 * stop, which is true and is not the test — and the panel's own caption and
 * route chips, which say what the lines mean, are what stayed behind.
 *
 * ONE NETWORK AT A TIME, ONE COLOUR PER ROUTE. Every other layer here draws
 * today against the plan, because every other question is that comparison.
 * This one is not: it asks which buses call here, and the answer at a
 * downtown kerb is 36 of them. Drawn both at once and coloured by side, the
 * line had to carry two channels — which network, and which route — and past
 * five or six routes the second one stopped arriving: a reader can tell blue
 * from orange, and cannot tell the eleventh orange from the twelfth. So the
 * side became a switch ("Today" / "Proposed", in the map's own toolbar) and
 * the colour became the route's, spaced in OKLCH by
 * `routecolor.ts` so that "as far apart as possible" means as far apart to
 * the eye. The response carries both networks, so switching costs no fetch.
 *
 * The price is that the two networks can no longer be compared on the map in
 * one glance — the comparison moved to the switch, which is a worse place
 * for it. What it buys is the question the control was built to answer being
 * answerable at all, and the panel's route chips wearing the same colours as
 * the lines, so the list and the map key each other.
 *
 * ONE LINE PER PATTERN, NOT PER ROUTE. A short-turn or a branch is real
 * service a reader asked to see all of, and collapsing a route's patterns
 * into one shape would silently pick one of them to draw — usually the
 * longest — and call it the route.
 *
 * Two caveats travel with every drawing. IT IS DRAWING ONLY: the shapes are
 * lossy by construction, the same as a journey's ride legs, so nothing may
 * be measured off a length or an angle here. And IT IS BUSES ONLY: the T and
 * the inclines are not bus routes and never appear, so a stop the map shows
 * losing its last bus while a train still calls there is not drawn as kept —
 * convention 13's Beechview trap, arrived at from a new direction.
 */
import { esc } from './utils';
import { KerbRoutesResult, KerbRouteFeature, Day, Side } from './types';
import { routeColors } from './routecolor';

export { routeColors } from './routecolor';

/**
 * The three positions of the toolbar's ROUTES control: nothing drawn, or one
 * of the two networks' routes.
 *
 * One value rather than an on/off flag with a side hanging off it, because
 * the lines are one network at a time: "which network" is not a refinement of
 * "on", it is half of what is on the map, and two variables could hold a
 * fourth state (on, but no side) that nothing can draw.
 */
export type StopRoutes = 'off' | Side;

/**
 * Off until asked. The lines are a second reading over the dots, and a map
 * that opened with a downtown kerb's 36 routes on it would answer a question
 * nobody had put yet.
 */
export const DEFAULT_STOP_ROUTES: StopRoutes = 'off';

/**
 * The kerb layer's ids. Its lines layer is exported because a second route
 * layer (`routeview.ts`, a route asked for by name) is inserted just beneath
 * it, so the kerb's own routes always draw over a route the reader searched
 * for.
 */
const SRC = 'stoproutes';
export const STOP_ROUTES_BASE_LAYER = 'stoproutes-lines';
const LAYER_FLOW = 'stoproutes-flow';
const LAYER_ARROWS = 'stoproutes-arrows';

/**
 * One arrow image, not one per side and not one per layer.
 *
 * It is registered as an SDF — MapLibre reads the alpha channel as a signed
 * distance field rather than as a picture — which is what lets `icon-color`
 * paint it per feature. A plain image would have to be baked once per colour,
 * and the colours are decided per kerb.
 */
const ARROW = 'stoproutes-arrow';

/**
 * One width now, the wider of the two the side-coloured version used: the
 * thinner line existed only so the plan's orange could sit legibly on top of
 * today's blue, and with one network on the map at a time there is nothing
 * to sit on top of.
 */
const WIDE = 3.5;

let data: KerbRoutesResult | null = null;

export function stopRoutesData(): KerbRoutesResult | null {
  return data;
}

export function isStopRoutesVisible(): boolean {
  return kerb.isVisible();
}

/**
 * Whether this network put any line on the map for the kerb in hand.
 *
 * A stop the plan adds answers with today's list empty, and a stop the plan
 * retires with the plan's; the control keeps its position at either, so
 * "on" and "drawn" came apart there. The pin key describes what is drawn.
 */
export function sideHasRoutes(r: KerbRoutesResult | null, side: Side): boolean {
  return r !== null && r[side].length > 0;
}

// --------------------------------------------------------------------------
// the map
// --------------------------------------------------------------------------

export interface StopRouteProps {
  side: Side;
  route: string;
  name: string | null;
  pattern_id: number;
  /** The route's own colour, decided over this side's route ids alone. */
  color: string;
}

interface StopRouteFeature {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: StopRouteProps;
}

/**
 * One line per pattern, for one network.
 *
 * The palette is computed over THIS SIDE'S route ids and no others, so a
 * route the plan drops leaves no gap in today's colours and a route it adds
 * does not renumber them. The two sides are therefore not comparable by hue,
 * which is the honest consequence of drawing one at a time; the switch in
 * the panel is what compares them.
 */
export function toGeoJSON(r: KerbRoutesResult, side: Side) {
  const list: KerbRouteFeature[] = side === 'current' ? r.current : r.proposed;
  const colors = routeColors(list.map((f) => f.route));
  const features: StopRouteFeature[] = list.map((f) => ({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: f.points },
    properties: {
      side,
      route: f.route,
      name: f.name,
      pattern_id: f.pattern_id,
      color: colors.get(f.route)!,
    },
  }));
  return { type: 'FeatureCollection' as const, features };
}

/** One width for every line, zoom-scaled the way the side-coloured pair was. */
function lineWidth(wide: number): any {
  return ['interpolate', ['linear'], ['zoom'], 9, wide * 0.6, 14, wide];
}

/**
 * One arrowhead, drawn once into an image the symbol layer repeats along
 * every line — a triangle pointing along the line's own direction, which
 * `icon-rotation-alignment: 'map'` then orients per placement.
 *
 * Drawn WHITE AND SOFT-EDGED because it is registered as an SDF: MapLibre
 * reads the alpha channel as a distance from the shape's edge and recolours
 * it per feature from `icon-color`, so the pixels' own colour is never used
 * and a hard edge leaves the renderer nothing to interpolate across. A few
 * pixels of blur is the cheapest honest distance field for a shape this
 * simple.
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

// --------------------------------------------------------------------------
// one set of route lines, reusable
// --------------------------------------------------------------------------

/** The ids one set of route lines lives under: a source and its three layers. */
export interface RouteLinesIds {
  source: string;
  lines: string;
  flow: string;
  arrows: string;
}

export interface RouteLinesOptions {
  ids: RouteLinesIds;
  /** The solid line's width at zoom 14 and up; the kerb's is `WIDE`. */
  width?: number;
}

/**
 * One set of route lines on the map: a solid line per feature in its own
 * colour, a flowing dash over it, and arrowheads along it.
 *
 * A factory rather than a module, because two things now draw this way —
 * the routes at a clicked kerb, and a route the reader asked for by name
 * (`routeview.ts`) — and they have to be two SOURCES: the kerb's lines are
 * cleared by the next click and the searched route is not, so one source
 * would make each erase the other. The rendering is identical, down to the
 * shared arrow image, so that a line reads the same whichever way it was
 * asked for. Each instance owns its own flow animation; the kerb's stopping
 * must not stop the searched route's.
 */
export interface RouteLines {
  init(map: maplibregl.Map, beforeId?: string): void;
  setVisible(map: maplibregl.Map, on: boolean): void;
  /**
   * Replace the drawn features. Does not touch the flow: the caller knows
   * whether an empty collection is "nothing to draw" (stop the loop) or one
   * side of a kerb the other side of which is about to be switched to.
   */
  setData(map: maplibregl.Map, gj: { type: 'FeatureCollection'; features: unknown[] }): void;
  startFlow(map: maplibregl.Map): void;
  stopFlow(): void;
  isVisible(): boolean;
}

export function createRouteLines({ ids, width = WIDE }: RouteLinesOptions): RouteLines {
  const layers = [ids.lines, ids.flow, ids.arrows];
  let visible = false;
  const flow = createFlow(ids.flow);

  return {
    init(map, beforeId) {
      map.addSource(ids.source, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] } as any,
      });
      map.addLayer({
        id: ids.lines,
        type: 'line',
        source: ids.source,
        layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': lineWidth(width),
          'line-opacity': 0.85,
        },
      }, beforeId);
      // The moving dash rides on its own layer -- line-dasharray cannot be
      // data-driven, the same constraint journey.ts's ride/walk split works
      // around -- thin and light so it reads as motion over the solid line
      // rather than as a second route of its own.
      map.addLayer({
        id: ids.flow,
        type: 'line',
        source: ids.source,
        layout: { visibility: 'none', 'line-cap': 'butt', 'line-join': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-width': 1.4,
          'line-opacity': 0.5,
          'line-dasharray': [0, 3, 4],
        },
      }, beforeId);
      if (!map.hasImage(ARROW)) {
        map.addImage(ARROW, arrowIcon(), { pixelRatio: 2, sdf: true });
      }
      map.addLayer({
        id: ids.arrows,
        type: 'symbol',
        source: ids.source,
        layout: {
          visibility: 'none',
          'symbol-placement': 'line',
          'symbol-spacing': 90,
          'icon-image': ARROW,
          'icon-size': ['interpolate', ['linear'], ['zoom'], 12, 0.55, 16, 0.9],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        // The arrow wears its own route's colour, which is the whole reason
        // the image is an SDF rather than a picture.
        paint: { 'icon-color': ['get', 'color'] },
      }, beforeId);
    },
    setVisible(map, on) {
      visible = on;
      for (const layer of layers) {
        map.setLayoutProperty(layer, 'visibility', on ? 'visible' : 'none');
      }
      if (!on) flow.stop();
    },
    setData(map, gj) {
      (map.getSource(ids.source) as maplibregl.GeoJSONSource).setData(gj as any);
    },
    startFlow: flow.start,
    stopFlow: flow.stop,
    isVisible: () => visible,
  };
}

/** The kerb's own lines, which every export above and below is about. */
const kerb = createRouteLines({
  ids: { source: SRC, lines: STOP_ROUTES_BASE_LAYER, flow: LAYER_FLOW, arrows: LAYER_ARROWS },
});

export function initStopRoutesLayer(map: maplibregl.Map, beforeId?: string) {
  kerb.init(map, beforeId);
}

export function setStopRoutesVisible(map: maplibregl.Map, on: boolean) {
  kerb.setVisible(map, on);
}

/**
 * Put one network's routes on the map.
 *
 * The side is an argument rather than module state because switching it is
 * not a new question: the response already holds both networks, so the
 * switch redraws from what is in hand and never refetches.
 */
export function drawStopRoutes(map: maplibregl.Map, r: KerbRoutesResult | null,
                               side: Side) {
  data = r;
  kerb.setData(map, r ? toGeoJSON(r, side) : { type: 'FeatureCollection', features: [] });
  // No loop may run while nothing is drawn. An empty SIDE of a kerb keeps
  // it running, as before: the other side is one switch away and would
  // otherwise come back still.
  if (!r) kerb.stopFlow();
}

// --------------------------------------------------------------------------
// the request
// --------------------------------------------------------------------------

export interface Point { lat: number; lon: number }

export function stopRoutesUrl(point: Point, day: Day): string {
  return `/api/kerb_routes?lat=${point.lat.toFixed(6)}&lon=${point.lon.toFixed(6)}&day=${day}`;
}

// --------------------------------------------------------------------------
// the words
// --------------------------------------------------------------------------

/**
 * What a line's hover calls each network. Exported for the search box,
 * whose route rows are labelled the same way so that a row and the line it
 * draws cannot call one network two things.
 */
export const SIDE_WORD: Record<Side, string> = { current: 'today', proposed: 'proposed' };

/**
 * The hover for one drawn pattern: which route, which network, which way.
 *
 * It opens with the line's own swatch, because the palette is per kerb and
 * nothing on the map itself is labelled: without it a reader matching a line
 * to a chip is comparing two hues across the width of the screen from
 * memory.
 */
export function routeLineLabel(props: StopRouteProps): string {
  return `<i style="display:inline-block;width:9px;height:9px;border-radius:2px;`
    + `vertical-align:baseline;background:${esc(props.color)}"></i> `
    + `<b>${esc(props.route)}</b>${props.name ? ` — ${esc(props.name)}` : ''}<br>`
    + `<span style="opacity:.75">${SIDE_WORD[props.side]}</span><br>`
    + `<span style="opacity:.6">arrows: direction of travel</span>`;
}

// --------------------------------------------------------------------------
// the flow animation
// --------------------------------------------------------------------------

/** Frames per second the dash advances at -- fast enough to read as motion, slow enough to cost nothing. */
const FLOW_FPS = 20;

/**
 * A precomputed cycle of `line-dasharray` values for the flowing dash.
 *
 * This is MapLibre's own worked "animate a line" technique, generalised to
 * an arbitrary dash and gap: the first half of the cycle shrinks a dash from
 * its full length down to nothing while the trailing gap grows to match, and
 * the second half grows a fresh dash from nothing while that gap shrinks
 * back. Every frame therefore sums to the same `dash + gap` period, which is
 * what keeps the pattern from visibly jumping in length as `startFlow` steps
 * through it, and the sequence is a genuine cycle -- frame 0 recurs exactly
 * every `steps` frames -- so it can be looped forever without recomputing it.
 */
export function dashSequence(dash: number, gap: number, steps: number): number[][] {
  const half = Math.max(1, Math.floor(steps / 2));
  const rest = Math.max(1, steps - half);
  const seq: number[][] = [];
  for (let i = 0; i < half; i++) {
    const t = (i / half) * dash;
    seq.push([t, gap, dash - t]);
  }
  for (let i = 0; i < rest; i++) {
    const t = (i / rest) * dash;
    seq.push([0, t, gap, dash - t]);
  }
  return seq;
}

const FLOW_SEQUENCE = dashSequence(3, 4, 24);

function reducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * One flow animation, driving one dash layer.
 *
 * Per layer rather than module-wide, because two sets of lines can be on
 * the map at once (the kerb's and a searched route's), each with its own
 * dash; one loop stepping one layer would leave the other's dash still.
 * Each loop is one `requestAnimationFrame` chain, paused while the tab is
 * hidden.
 */
function createFlow(layer: string): { start(map: maplibregl.Map): void; stop(): void } {
  let frame: number | null = null;
  let step = 0;
  let last = 0;
  let flowMap: maplibregl.Map | null = null;

  const tick = (now: number) => {
    if (!flowMap) return;
    frame = requestAnimationFrame(tick);
    if (now - last < 1000 / FLOW_FPS) return;
    last = now;
    step = (step + 1) % FLOW_SEQUENCE.length;
    flowMap.setPaintProperty(layer, 'line-dasharray', FLOW_SEQUENCE[step]);
  };

  const onVisibilityChange = () => {
    if (!flowMap) return;
    if (document.hidden) {
      if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
    } else if (frame === null) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };

  return {
    // A no-op under reduced motion -- the arrows still show and say the
    // direction, only the animation is what a reader asked the browser to
    // spare them.
    start(map) {
      if (reducedMotion()) return;
      if (flowMap) return;               // already running
      flowMap = map;
      step = 0;
      last = 0;
      document.addEventListener('visibilitychange', onVisibilityChange);
      frame = requestAnimationFrame(tick);
    },
    // Frees the frame -- no loop may run while nothing is drawn.
    stop() {
      if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
      document.removeEventListener('visibilitychange', onVisibilityChange);
      flowMap = null;
    },
  };
}

/** Start the kerb's dash flowing. */
export function startFlow(map: maplibregl.Map) {
  kerb.startFlow(map);
}

/** Stop the kerb's dash. */
export function stopFlow() {
  kerb.stopFlow();
}
