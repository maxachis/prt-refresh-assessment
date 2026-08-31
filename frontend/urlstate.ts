/**
 * The map's state, in its own address bar — so a view can be linked and embedded.
 *
 * Everything this app answers is a question with parameters: which view, which
 * day type, which walk radius, measured to where, asked at what point. Until
 * now those lived only in the DOM, which meant the map could be shown but
 * never sent: a reader who found the one screen that made their neighbourhood's
 * loss legible had no way to hand it to anyone, and an organisation embedding
 * the map got the county-wide default and a note asking readers to click
 * around.
 *
 * Two decisions worth keeping.
 *
 * IT WRITES EVERY CONTROL, INCLUDING THE ONES LEFT AT THEIR DEFAULT. Omitting
 * defaults would make for shorter URLs and would need this module to hold a
 * fourth copy of what the defaults are -- they are already declared in
 * `main.ts`'s initial values and in the `active` class on the toolbar buttons
 * in `index.html`. A copy here would drift, and it would drift silently into
 * links that no longer say what they showed. Writing the state out in full
 * also makes an embed's `src` self-documenting: every knob an embedder can
 * turn is visible in the URL they are copying.
 *
 * A BAD PARAMETER IS IGNORED, NEVER APPLIED. These URLs are meant to be
 * hand-edited by someone building an embed, so a typo is the expected input,
 * not the exceptional one. Anything that fails to parse leaves that control at
 * its default rather than reaching the map as a NaN centre or a control as a
 * value it has no button for.
 */
import { Day, DAYS } from './types';
import { Weight, SurfaceUnit } from './types';
import { Destination } from './oneseat';
import { PlaceFill, DEFAULT_PLACE_FILL } from './places';
import { VIEWS } from './statebar';

/**
 * The query parameters, named once.
 *
 * These are a published interface the moment anyone pastes an iframe into a
 * page: renaming one silently breaks every embed already in the wild, in a way
 * that looks to the embedder like the map ignoring them.
 */
export const PARAM = {
  view: 'view',
  day: 'day',
  radius: 'radius',
  oneSeatDay: 'oneseatday',
  dest: 'dest',
  weight: 'weight',
  surfaceUnit: 'surfaceunit',
  at: 'at',
  camera: 'map',
  place: 'place',
  placeFill: 'placefill',
} as const;

/** How the one-seat day control's two positions are spelled in a URL. */
const ONESEAT_DAY = { any: 'any', selected: 'selected' } as const;

/**
 * The destination picker's third button is a mode, not a place, so it is not
 * a value this can arrive in: a map that loaded already armed would spend the
 * reader's first tap moving the destination instead of answering.
 */
const PIN_MODE = 'pin';

/** ~1 m. Finer would be writing the click's pixel jitter into a shareable link. */
const COORD_DP = 5;

export interface Point { lat: number; lon: number }
export interface Camera extends Point { zoom: number }

export interface UrlState {
  view: string;
  day: Day;
  radius: number;
  /** Whether the one-seat question has been restricted to `day` (convention 13). */
  oneSeatRestricted: boolean;
  /** Whether the change legend is counting locations or boardings. */
  weight: Weight;
  /** Whether the surface key is showing ground or the people on it. */
  surfaceUnit: SurfaceUnit;
  dest: Destination;
  /** Where the reader asked, or null while the panel is still a prompt. */
  at: Point | null;
  /** Where the map is looking, or null until someone has moved it. */
  camera: Camera | null;
  /** The Places view's selected place, by its /api/places key, or null. */
  place: string | null;
  /** Which of the Places choropleth's two readings is on the map. */
  placeFill: PlaceFill;
}

/** Is this page inside someone else's? */
export function isFramed(win: { self: unknown; top: unknown }): boolean {
  try {
    return win.self !== win.top;
  } catch {
    // A cross-origin parent makes `top` unreadable in some browsers. Only a
    // framed page can have a top it cannot see.
    return true;
  }
}

export function toSearch(s: UrlState): string {
  const p = new URLSearchParams();
  p.set(PARAM.view, s.view);
  p.set(PARAM.day, s.day);
  p.set(PARAM.radius, String(s.radius));
  p.set(PARAM.oneSeatDay,
    s.oneSeatRestricted ? ONESEAT_DAY.selected : ONESEAT_DAY.any);
  p.set(PARAM.dest, 'key' in s.dest ? s.dest.key : coords(s.dest));
  // Written only when it is on, unlike the controls above: weighting by
  // ridership is a second reading of the same dots rather than one of the
  // parameters of the question, and a `weight=locations` in every link would
  // put a denominator in the URL of every reader who never chose one.
  if (s.weight === 'riders') p.set(PARAM.weight, s.weight);
  // Same reasoning as `weight` just above: `area` is the default, so writing
  // it into every link would make the switch look like a setting the reader
  // had chosen rather than the map's own starting point.
  if (s.surfaceUnit === 'people') p.set(PARAM.surfaceUnit, s.surfaceUnit);
  // Both of these are absences rather than defaults: no point has been asked
  // about, and the map has not been moved off wherever it opened.
  if (s.at) p.set(PARAM.at, coords(s.at));
  if (s.camera) p.set(PARAM.camera, `${coords(s.camera)},${s.camera.zoom.toFixed(2)}`);
  // Same reasoning as `at`: absence, not a default, so it is written only
  // once a place has actually been selected.
  if (s.place) p.set(PARAM.place, s.place);
  // Same reasoning as `weight` and `surfaceUnit` above: losses is the
  // default reading, so writing it into every link would make the toggle
  // look like a choice the reader had made rather than the map's own start.
  if (s.placeFill !== DEFAULT_PLACE_FILL) p.set(PARAM.placeFill, s.placeFill);
  return `?${p}`;
}

/** Read whichever parameters are present and valid; skip the rest. */
export function parseUrlState(search: string): Partial<UrlState> {
  const p = new URLSearchParams(search);
  const s: Partial<UrlState> = {};

  const view = p.get(PARAM.view);
  if (view && VIEWS.includes(view)) s.view = view;

  const day = p.get(PARAM.day);
  if (day && (DAYS as string[]).includes(day)) s.day = day as Day;

  const radius = Number(p.get(PARAM.radius));
  if (p.has(PARAM.radius) && Number.isFinite(radius) && radius > 0) s.radius = radius;

  if (p.get(PARAM.weight) === 'riders') s.weight = 'riders';
  else if (p.get(PARAM.weight) === 'locations') s.weight = 'locations';

  if (p.get(PARAM.surfaceUnit) === 'people') s.surfaceUnit = 'people';
  else if (p.get(PARAM.surfaceUnit) === 'area') s.surfaceUnit = 'area';

  const oneSeatDay = p.get(PARAM.oneSeatDay);
  if (oneSeatDay === ONESEAT_DAY.selected) s.oneSeatRestricted = true;
  else if (oneSeatDay === ONESEAT_DAY.any) s.oneSeatRestricted = false;

  const dest = p.get(PARAM.dest);
  if (dest && dest !== PIN_MODE) {
    const point = parsePoint(dest);
    if (point) s.dest = point;
    else if (!dest.includes(',')) s.dest = { key: dest };
  }

  const at = parsePoint(p.get(PARAM.at));
  if (at) s.at = at;

  const camera = parseCamera(p.get(PARAM.camera));
  if (camera) s.camera = camera;

  const place = p.get(PARAM.place);
  if (place) s.place = place;

  const placeFill = p.get(PARAM.placeFill);
  if (placeFill === 'lost' || placeFill === 'gained' || placeFill === 'service') {
    s.placeFill = placeFill;
  }

  return s;
}

function coords(p: Point): string {
  return `${p.lat.toFixed(COORD_DP)},${p.lon.toFixed(COORD_DP)}`;
}

function parsePoint(raw: string | null): Point | null {
  const n = numbers(raw, 2);
  return n ? { lat: n[0], lon: n[1] } : null;
}

function parseCamera(raw: string | null): Camera | null {
  const n = numbers(raw, 3);
  return n ? { lat: n[0], lon: n[1], zoom: n[2] } : null;
}

/** Exactly `want` finite numbers from a comma-separated value, or nothing. */
function numbers(raw: string | null, want: number): number[] | null {
  if (!raw) return null;
  const parts = raw.split(',').map(Number);
  if (parts.length !== want || !parts.every(Number.isFinite)) return null;
  return parts;
}
