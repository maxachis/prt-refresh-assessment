/**
 * Colour-vision-deficiency distance, standard library only.
 *
 * contrast.ts asks whether a reader sees a mark at all against the basemap;
 * this asks whether two marks stay distinguishable from EACH OTHER once a
 * dichromat's eye has collapsed one of the three cone responses. That is a
 * different failure from low contrast -- a colour can sit at full contrast
 * against Positron and still be indistinguishable from its opposite-sign
 * neighbour to roughly 1 in 12 men, which is exactly what happened to
 * change.ts's red/green ramp
 * (docs/worklog/the-change-ramp-fails-red-green-colour-blindness.md).
 *
 * `simulate` reproduces what a dichromat's cones actually deliver (Viénot,
 * Brettel & Mollon 1999: sRGB -> linear -> LMS -> project out the missing
 * cone's information -> back to sRGB), and `deltaE`/`worstCaseDistance`
 * measure how far apart two colours still are once that has happened. The
 * matrices below are the published constants for that method, not tuned
 * values -- they are transcribed exactly and are not meant to be re-derived.
 */

export type Deficiency = 'protan' | 'deutan' | 'tritan';

type Vec3 = [number, number, number];
type Mat3 = [Vec3, Vec3, Vec3];

function srgbChannelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function linearChannelToSrgb(c: number): number {
  const clamped = Math.max(0, Math.min(1, c));
  const s = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
  return Math.round(s * 255);
}

function hexToRgb(hex: string): Vec3 {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex([r, g, b]: Vec3): string {
  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function applyMat3(m: Mat3, v: Vec3): Vec3 {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ];
}

/** sRGB (linear) -> LMS cone response. */
const RGB_TO_LMS: Mat3 = [
  [0.31399, 0.63951, 0.04649],
  [0.15537, 0.75789, 0.08670],
  [0.01775, 0.10945, 0.87262],
];

/** LMS -> sRGB (linear), the inverse of the above. */
const LMS_TO_RGB: Mat3 = [
  [5.47221, -4.64196, 0.16963],
  [-1.12524, 2.29317, -0.16789],
  [0.02980, -0.19318, 1.16364],
];

/**
 * Dichromat projections in LMS space: each drops the missing cone's signal
 * by re-deriving it from the two the reader still has, along the confusion
 * line Viénot et al. measured for that deficiency.
 */
const DICHROMAT_PROJECTION: Record<Deficiency, Mat3> = {
  protan: [
    [0, 1.05118294, -0.05116099],
    [0, 1, 0],
    [0, 0, 1],
  ],
  deutan: [
    [1, 0, 0],
    [0.9513092, 0, 0.04866992],
    [0, 0, 1],
  ],
  tritan: [
    [1, 0, 0],
    [0, 1, 0],
    [-0.86744736, 1.86727089, 0],
  ],
};

/** Linear RGB -> CIE XYZ. */
const RGB_TO_XYZ: Mat3 = [
  [0.4124, 0.3576, 0.1805],
  [0.2126, 0.7152, 0.0722],
  [0.0193, 0.1192, 0.9505],
];

/** D65-ish reference white used for the Lab conversion below. */
const WHITE_POINT: Vec3 = [0.95047, 1.0, 1.08883];

function labF(t: number): number {
  const delta = 6 / 29;
  return t > delta ** 3 ? Math.cbrt(t) : t / (3 * delta ** 2) + 4 / 29;
}

/** '#rrggbb' -> CIE Lab, via linear RGB and XYZ. */
function hexToLab(hex: string): Vec3 {
  const [r, g, b] = hexToRgb(hex).map(srgbChannelToLinear) as Vec3;
  const [x, y, z] = applyMat3(RGB_TO_XYZ, [r, g, b]);
  const fx = labF(x / WHITE_POINT[0]);
  const fy = labF(y / WHITE_POINT[1]);
  const fz = labF(z / WHITE_POINT[2]);
  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bLab = 200 * (fy - fz);
  return [L, a, bLab];
}

/**
 * Simulate how `hex` appears to a dichromat with the given deficiency, per
 * Viénot, Brettel & Mollon 1999: project the colour's LMS response onto the
 * plane the missing cone can no longer distinguish along, then convert back.
 */
export function simulate(hex: string, kind: Deficiency): string {
  const linear = hexToRgb(hex).map(srgbChannelToLinear) as Vec3;
  const lms = applyMat3(RGB_TO_LMS, linear);
  const projected = applyMat3(DICHROMAT_PROJECTION[kind], lms);
  const backToLinear = applyMat3(LMS_TO_RGB, projected);
  const srgb = backToLinear.map(linearChannelToSrgb) as Vec3;
  return rgbToHex(srgb);
}

/** CIE76 ΔE -- euclidean distance between two colours in CIE Lab. */
export function deltaE(a: string, b: string): number {
  const [l1, a1, b1] = hexToLab(a);
  const [l2, a2, b2] = hexToLab(b);
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

const ALL_DEFICIENCIES: Deficiency[] = ['protan', 'deutan', 'tritan'];

/**
 * The floor a pair of colours actually offers a reader: the minimum ΔE over
 * normal vision and all three dichromat simulations. A pair can look worlds
 * apart to normal vision and collapse under one deficiency -- that collapse
 * is the number this app cares about, never the average.
 */
export function worstCaseDistance(a: string, b: string): number {
  const distances = [
    deltaE(a, b),
    ...ALL_DEFICIENCIES.map((kind) => deltaE(simulate(a, kind), simulate(b, kind))),
  ];
  return Math.min(...distances);
}
