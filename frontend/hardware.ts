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
 * The same map already drawn, as pictures: Esri's Light Gray Canvas.
 *
 * NOT CARTO'S POSITRON RASTER, which is what the measurement was taken on.
 * CARTO now stamps "API KEY REQUIRED" across every tile served without an
 * account, so it cannot be used here as it stands. Esri's is the nearest
 * keyless light-grey basemap: land samples #efefef against Positron's
 * #fafaf8, near enough that the dot palette reads the same on it.
 *
 * ITS TERMS ARE NOT SETTLED. The tiles serve without a key and the attribution
 * below is a condition of using them; whether this site's use needs an ArcGIS
 * account is a question for Max before anything is deployed.
 */
export const RASTER_TILES = [
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/'
  + 'World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
];

/**
 * The names, which Esri ships as a second transparent layer.
 *
 * Not decoration. The base alone carries almost no place labels at county
 * zooms -- Pittsburgh itself is unnamed on it -- and a reader scanning the
 * whole plan has nothing to orient by. Two image layers is still two draws
 * against the vector style's 55, and it is drawn beneath every mark this site
 * adds, so a label can never sit on top of a dot.
 */
export const RASTER_LABEL_TILES = [
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/'
  + 'World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
];

/**
 * The last zoom level Esri's canvas actually has, and it must be declared.
 *
 * Above 16 the service does not 404 -- it answers with a picture of grey
 * reading "Map data not yet available", which MapLibre has no way to tell from
 * a map. Verified tile by tile over Downtown Pittsburgh on 2026-09-10: real
 * ground through 16, the placeholder from 17 up, and the same image at 18, 19
 * and 20. Declaring it makes MapLibre scale the level-16 tile instead of
 * asking for one that does not exist, so a reader zooming into a corner gets a
 * soft basemap rather than a blank one. The marks stay sharp either way --
 * they are drawn from the data, not from the tiles.
 */
export const RASTER_MAX_ZOOM = 16;

/** A condition of using the tiles, and it rides on the map, not in a doc. */
export const RASTER_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, '
  + '<a href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a> contributors';

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
  if (!drawsInSoftware(m.renderer)) return VECTOR_STYLE_URL;
  const source = (tiles: string[]) => ({
    type: 'raster', tileSize: 256, attribution: RASTER_ATTRIBUTION, tiles,
    maxzoom: RASTER_MAX_ZOOM,
  });
  return {
    version: 8,
    sources: {
      basemap: source(RASTER_TILES),
      'basemap-labels': source(RASTER_LABEL_TILES),
    },
    layers: [
      { id: 'basemap', type: 'raster', source: 'basemap' },
      { id: 'basemap-labels', type: 'raster', source: 'basemap-labels' },
    ],
  };
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
