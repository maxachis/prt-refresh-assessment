/**
 * A colour per route, for the one layer on this map that has to tell routes
 * apart rather than networks apart.
 *
 * Everything else here is drawn in two colours, because every other question
 * is a comparison: today against the plan. The "At this stop" toggle asks a
 * different one — which buses call here — and at a downtown kerb the answer
 * is 36 of them. Two colours cannot carry that, and PRT's own route colours
 * cannot either: the proposed feed's 95 routes come from 7 distinct ones, so
 * a route's published colour does not identify it.
 *
 * SPACED IN OKLCH, NOT HSL, because "as far apart as possible" is a claim
 * about the eye and HSL is not a claim about the eye. Equal steps of HSL hue
 * are wildly unequal to look at: the yellows and greens collapse into each
 * other across a 60° span while the blues stay distinct across 20°, so eight
 * evenly stepped HSL hues read as about five colours. OKLCH is built so that
 * equal steps of hue are equal perceptual steps, and equal lightness is equal
 * apparent lightness — which is the second half of what this needs, since a
 * palette that wandered in lightness would make some routes shout and others
 * disappear against the basemap.
 *
 * CHROMA IS PULLED IN, HUE NEVER IS. sRGB is not a cylinder: at L 0.55 a
 * magenta holds C 0.16 comfortably while a cyan runs out of gamut at about
 * 0.093. Asked for a colour outside the box there are only two ways to
 * answer, and only one of them is safe — clip the channels, and the hue moves
 * (two neighbouring routes converge on the same flat colour); reduce chroma
 * along the hue line, and the colour merely gets less saturated while staying
 * exactly the hue it was assigned. So chroma is the free variable here and
 * hue is not, because hue is the whole thing doing the telling-apart.
 */

/** Equal for every route: a palette that wandered in lightness would rank them. */
export const ROUTE_L = 0.55;

/**
 * The chroma asked for, which most hues get and the cyans do not.
 *
 * Saturated enough to hold its own over a grey basemap without being so
 * loud that thirty-six of them at once become unreadable. See the
 * chroma-is-pulled-in note above for what happens at the hues that cannot
 * take it.
 */
export const ROUTE_C = 0.16;

// OKLab -> LMS' and LMS -> linear sRGB, Björn Ottosson's published matrices.
const LMS = [
  [0.3963377774, 0.2158037573],
  [-0.1055613458, -0.0638541728],
  [-0.0894841775, -1.2914855480],
] as const;
const RGB = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.7076147010],
] as const;

/** A hair of slack, so a colour exactly on the gamut boundary is inside it. */
const GAMUT_EPS = 1e-6;

/** Halvings of the chroma interval — far past eight-bit resolution. */
const GAMUT_STEPS = 32;

function linearRGB(l: number, c: number, h: number): [number, number, number] {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const lms = LMS.map(([p, q]) => (l + p * a + q * b) ** 3);
  return RGB.map((row) => row[0] * lms[0] + row[1] * lms[1] + row[2] * lms[2]) as
    [number, number, number];
}

function inGamut(l: number, c: number, h: number): boolean {
  return linearRGB(l, c, h).every((v) => v >= -GAMUT_EPS && v <= 1 + GAMUT_EPS);
}

/** The most chroma this hue can hold at this lightness, up to what was asked. */
function fittedChroma(l: number, c: number, h: number): number {
  if (inGamut(l, c, h)) return c;
  let lo = 0;
  let hi = c;
  for (let i = 0; i < GAMUT_STEPS; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(l, mid, h)) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** The sRGB transfer function, linear light to the values a screen is sent. */
function encode(v: number): number {
  const c = Math.min(1, Math.max(0, v));
  const s = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, s)) * 255);
}

/**
 * One OKLCH colour as `#rrggbb`, with chroma fitted to sRGB along the hue.
 *
 * Self-contained rather than a dependency: this is two matrix multiplies and
 * a transfer function, the app ships no colour library, and `oklch()` in CSS
 * would not help — MapLibre wants a value it can put in a paint property and
 * a style expression, not a string the browser resolves.
 */
export function oklchToHex(l: number, c: number, h: number): string {
  const [r, g, b] = linearRGB(l, fittedChroma(l, c, h), h);
  return `#${[r, g, b].map((v) => encode(v).toString(16).padStart(2, '0')).join('')}`;
}

// --------------------------------------------------------------------------
// the order the hues are handed out in
// --------------------------------------------------------------------------

const DIGITS = /(\d+)/;

/**
 * Route ids in the order a rider reads them: 8, 16, 61A, 61B, G3, O1.
 *
 * A plain string sort puts 16 before 8 and splits the 61s around the 6s,
 * which would be a cosmetic complaint if the order were only an order — but
 * it is what the hue is assigned from, so it decides which two routes end up
 * adjacent in colour. Digit runs compare as numbers, everything else as
 * text, which also drops the numbered routes above the lettered ones for
 * free: a numbered id's first chunk is the empty string.
 */
export function naturalCompare(a: string, b: string): number {
  const as = a.split(DIGITS);
  const bs = b.split(DIGITS);
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    const x = as[i] ?? '';
    const y = bs[i] ?? '';
    if (x === y) continue;
    // Odd chunks are the digit runs, by how `split` with a capture group
    // interleaves them.
    if (i % 2) return Number(x) - Number(y);
    return x < y ? -1 : 1;
  }
  return 0;
}

/**
 * A colour for each of these routes, hues spread evenly around the circle.
 *
 * Deterministic and order-free: the ids are deduplicated and naturally
 * sorted before any hue is handed out, so the same kerb colours the same way
 * whichever order the feed listed its patterns in, and the panel's chips can
 * be coloured from the same call the map's lines are without the two being
 * wired together.
 *
 * The set matters, though, and that is the one thing a caller has to get
 * right: adding a route shifts every hue. Colour a kerb's routes from that
 * kerb's own route list, never from a longer one that happens to contain it,
 * or the chip and the line stop agreeing.
 */
export function routeColors(routeIds: Iterable<string>): Map<string, string> {
  const ids = [...new Set(routeIds)].sort(naturalCompare);
  return new Map(ids.map((id, i) => [
    id, oklchToHex(ROUTE_L, ROUTE_C, (i * 360) / ids.length),
  ]));
}
