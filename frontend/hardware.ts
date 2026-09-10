/**
 * What the machine can draw, decided once before the map is built.
 *
 * Nothing here is about the plan or the data. It is about the fact that a
 * vector map recomputes every dot's screen position on every frame and then
 * fills the pixels under them, and that some of the machines the site is read
 * on have no graphics chip doing that work.
 *
 * The case that forced it: Max's VM reports every acceleration path off in
 * `chrome://gpu` and serves WebGL through Mesa's CPU rasteriser, which names
 * itself `llvmpipe, or similar`. The map draws, and each frame is computed by
 * the processor. The same is true of any browser falling back to SwiftShader,
 * of a locked-down corporate desktop, and of the cheaper end of the phones a
 * public-comment audience will read this on.
 *
 * The lever that matters there is the number of pixels, not the number of
 * features: a phone at devicePixelRatio 3 asks its renderer for nine times the
 * fragments of the same map at 1. Dropping features instead would be a lie the
 * key could not see -- the legend counts the rows, not what survived a filter.
 */

/**
 * Renderer names that mean "there is no graphics chip in this".
 *
 * Matched as substrings against `WEBGL_debug_renderer_info`'s unmasked
 * renderer, lowercased. The list is short on purpose: a name not on it is
 * assumed to be real hardware, so a new software rasteriser costs a reader
 * some sharpness rather than costing everyone else theirs.
 */
export const SOFTWARE_RENDERERS = [
  'llvmpipe',        // Mesa's CPU rasteriser, the Linux VM case
  'swiftshader',     // Chrome's own fallback
  'softpipe',        // Mesa again, the older one
  'basic render',    // "Microsoft Basic Render Driver"
  'software',        // Firefox and Safari's plainer wording
];

/**
 * The most pixels worth asking any renderer for, per CSS pixel.
 *
 * Above 2 the returns are invisible and the cost is quadratic: a phone at 3
 * fills 2.25x the fragments of the same map at 2, for a difference nobody can
 * see at arm's length. MapLibre otherwise takes the device's own ratio
 * whatever it is.
 */
export const MAX_SCALE = 2;

/** What a software renderer gets: one pixel per CSS pixel, and no more. */
export const SOFTWARE_SCALE = 1;

export interface Machine {
  /** The unmasked WebGL renderer, or null where the browser will not say. */
  renderer: string | null;
  /** `devicePixelRatio`, before any cap. */
  dpr: number;
}

export function drawsInSoftware(renderer: string | null): boolean {
  if (!renderer) return false;
  const name = renderer.toLowerCase();
  return SOFTWARE_RENDERERS.some((s) => name.includes(s));
}

/**
 * The pixel ratio to hand MapLibre.
 *
 * Never above the device's own -- asking for more than the screen has is
 * spending fragments on nothing.
 */
export function canvasScale(m: Machine): number {
  const cap = drawsInSoftware(m.renderer) ? SOFTWARE_SCALE : MAX_SCALE;
  return Math.min(m.dpr || 1, cap);
}

/**
 * How long a label may take to fade in, in milliseconds.
 *
 * A fade is a repaint per frame for its whole duration, which on a CPU
 * renderer is a repaint that costs more than the frame that provoked it. The
 * animation is decoration; the map is legible without it.
 */
export function fadeMs(m: Machine): number {
  return drawsInSoftware(m.renderer) ? 0 : DEFAULT_FADE_MS;
}

/** MapLibre's own default, restated so the choice above is visible. */
export const DEFAULT_FADE_MS = 300;

/**
 * The basemap everyone with a graphics chip gets: OpenFreeMap's Positron.
 *
 * 55 layers -- 26 line, 19 symbol, 9 fill -- re-tessellated and re-filled on
 * every frame, which is what makes it worth swapping below.
 */
export const VECTOR_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

/**
 * The same map already drawn, as pictures: OpenStreetMap's own tiles.
 *
 * THE THIRD SOURCE TRIED, AND THE ONLY ONE WHOSE TERMS ALLOW THIS. CARTO's
 * Positron raster -- what the measurement below was taken on -- stamps
 * "API KEY REQUIRED" across every tile served without an account. Esri's Light
 * Gray Canvas serves keyless and looks the part, but Esri's own summary of the
 * terms conditions every permitted use on having Esri software or an ArcGIS
 * Online subscription ("If you do not have Esri software, you must purchase an
 * ArcGIS Online subscription"), which this site has neither of.
 *
 * The OSM Foundation's tile usage policy permits a public website's basemap
 * outright. What it requires is met here: attribution drawn on the map, no
 * pre-fetching of tiles beyond what a reader is looking at, and no no-cache
 * header. What it costs is the look -- OSM's standard style is a full-colour
 * general-purpose map where Positron is a near-white canvas built to sit under
 * data. See `contrast.ts`: the dot palette is balanced against #f2efe9, which
 * is this style's land fill exactly, but its parks and its coloured roads are
 * ground the palette was never tested on.
 */
export const RASTER_TILES = [
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
];

/**
 * No second layer here: OSM's style carries its own labels.
 *
 * Esri needed one -- its canvas leaves Pittsburgh unnamed at county zooms --
 * and the shape is kept so that a source needing one can have it again.
 */
export const RASTER_LABEL_TILES: string[] = [];

/**
 * The last zoom level the tiles actually have, and it must be declared.
 *
 * OSM's own go to 19. This matters because a tile service under this site's
 * feet may answer past its coverage with a picture rather than a 404: Esri's
 * canvas stops at 16 and returns a grey image reading "Map data not yet
 * available", with a 200, which MapLibre cannot tell from a map and drew.
 * Declaring where the tiles end makes MapLibre scale the last real one, so the
 * ground goes soft rather than blank; the marks stay sharp either way, being
 * drawn from the data and not from the tiles.
 */
export const RASTER_MAX_ZOOM = 19;

/** A condition of using the tiles, and it rides on the map, not in a doc. */
export const RASTER_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Whether a tile source has been settled on. IT HAS NOT, SO NOBODY GETS THE
 * RASTER BASEMAP YET.
 *
 * The measurement says a raster basemap is worth roughly an order of magnitude
 * to a reader with no graphics chip. Three sources were tried and none can be
 * used as it stands:
 *
 *   CARTO's Positron raster -- what the measurement was taken on -- stamps
 *   "API KEY REQUIRED" diagonally across every tile served without an account.
 *
 *   Esri's Light Gray Canvas serves keyless and is the right look, but Esri's
 *   own summary of the terms conditions every permitted use on having Esri
 *   software or a subscription: "If you do not have Esri software, you must
 *   purchase an ArcGIS Online subscription." It also forbids self-hosting its
 *   content, which rules out the obvious workaround.
 *
 *   OpenStreetMap's own tiles are permitted for exactly this -- a public
 *   website's basemap, with attribution and no pre-fetching -- and they are
 *   the fastest of the three here. But they are a full-colour general-purpose
 *   map: coloured motorways under red removal crosses, green parks under a
 *   purple gain palette that `contrast.ts` never tested against them, and a
 *   tile server slow enough that a pan shows gaps.
 *
 * So the switch stays off and every reader keeps the vector style, which is
 * the slower map but the legible one. Flipping this to `true` is all that is
 * needed once a source is chosen; the constants below say which.
 */
export const RASTER_BASEMAP_READY = false;

/**
 * Which basemap to draw, decided by what is drawing it.
 *
 * THE ONE CHANGE THAT MOVES THE FRAME RATE ON A MACHINE WITH NO GPU. A vector
 * style is 55 layers of geometry rebuilt every frame; a raster style is one
 * image drawn to the screen. Measured on this repo's llvmpipe browser, at the
 * same camera and drag, arms alternated: 952/1,500/1,300/441 ms per frame
 * vector against 115/52/109/39 ms raster, with no overlap between them.
 *
 * WHY ONLY SOFTWARE RENDERERS GET IT. Raster tiles are pictures: their labels
 * cannot be restyled, cannot be held out from under this site's own marks, and
 * are soft on a high-resolution screen. A reader with a graphics chip pays
 * nothing for the vector style and should keep the sharper map; a reader whose
 * processor is drawing every fragment is choosing between a soft map and one
 * that does not pan. The two are the same design (both are Positron), so the
 * site does not become two different-looking maps.
 *
 * The raster land fill samples as #fafaf8 against the #f2efe9 `contrast.ts`
 * pins the dot palette to -- lighter ground, so every mark's contrast against
 * it goes slightly up and no floor is at risk.
 */
export function basemapStyle(m: Machine): string | object {
  if (!RASTER_BASEMAP_READY || !drawsInSoftware(m.renderer)) return VECTOR_STYLE_URL;
  return rasterBasemapStyle();
}

/** The raster style itself, kept whole so it can be tested while it is off. */
export function rasterBasemapStyle(): object {
  const source = (tiles: string[]) => ({
    type: 'raster', tileSize: 256, attribution: RASTER_ATTRIBUTION, tiles,
    maxzoom: RASTER_MAX_ZOOM,
  });
  const sources: Record<string, object> = { basemap: source(RASTER_TILES) };
  const layers = [{ id: 'basemap', type: 'raster', source: 'basemap' }];
  if (RASTER_LABEL_TILES.length) {
    sources['basemap-labels'] = source(RASTER_LABEL_TILES);
    layers.push({ id: 'basemap-labels', type: 'raster', source: 'basemap-labels' });
  }
  return { version: 8, sources, layers };
}

/**
 * Ask the browser what is drawing, without touching the map's own context.
 *
 * A throwaway canvas, read once and dropped. Everything here is allowed to
 * fail: a browser that refuses `WEBGL_debug_renderer_info` (Firefox with
 * `privacy.resistFingerprinting`, some Safari builds) reports null, which is
 * read as hardware -- the same benefit of the doubt an unrecognised name gets.
 */
export function readMachine(win: any = window): Machine {
  const dpr = win.devicePixelRatio || 1;
  try {
    const gl = win.document.createElement('canvas').getContext('webgl2')
      ?? win.document.createElement('canvas').getContext('webgl');
    if (!gl) return { renderer: null, dpr };
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info
      ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);
    return { renderer: typeof renderer === 'string' ? renderer : null, dpr };
  } catch {
    return { renderer: null, dpr };
  }
}
