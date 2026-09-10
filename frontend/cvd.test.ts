import { describe, it, expect } from 'vitest';
import { simulate, deltaE, worstCaseDistance } from './cvd';
import { STYLE } from './change';
import { NOW, PROP_CORE } from './mapview';
import { RAMP, GONE_COLOR, NEW_COLOR, DEAD_BAND_COLOR } from './surface';

// The floor this file exists to enforce: docs/worklog/
// the-change-ramp-fails-red-green-colour-blindness.md found that the dot and
// surface ramps put opposite findings (a loss, a gain) at the same apparent
// colour for a red-green dichromat. These assertions make "the gain half
// stays distinguishable from the loss half under every deficiency" a build
// failure instead of a comment nobody re-checks.

describe('simulate', () => {
  it('leaves a mid grey ~unchanged -- a dichromat still sees grey as grey', () => {
    const grey = '#808080';
    for (const kind of ['protan', 'deutan', 'tritan'] as const) {
      expect(deltaE(grey, simulate(grey, kind))).toBeLessThan(2);
    }
  });
});

describe('deltaE', () => {
  it('is 0 for a colour against itself', () => {
    expect(deltaE('#478a68', '#478a68')).toBeCloseTo(0, 5);
    expect(deltaE('#e8232f', '#e8232f')).toBeCloseTo(0, 5);
  });
});

// Losses stay red; gains moved to violet. These are the two halves of both
// ramps whose direction has to survive colour blindness -- everything else
// (same, gone/new as categorical steps) is covered by the pairs below.
const LOSS_BUCKETS = ['gone', 'halved', 'less'];
const GAIN_BUCKETS = ['more', 'doubled', 'new'];

// The two floors differ, and the gap is deliberate, not an oversight: violet
// moves toward pink under tritanopia, so the red-green fix costs tritanopia
// some of its margin. That trade was accepted in the worklog entry because
// red-green deficiency affects roughly 8% of men against tritanopia's roughly
// 1 in 10,000 -- and 10 still pins the tritan floor above where the *old*
// palette's weakest sign-crossing pair sat (ΔE 7.9 under tritanopia, per the
// worklog's measurements). Do not lower the red-green floor to match; the
// point of the trade is that red-green readers get the large floor and
// tritan readers keep a smaller but still-improved one.
const RED_GREEN_FLOOR = 40;
const TRITAN_FLOOR = 10;

function assertClearsFloors(a: string, b: string, label: string) {
  it(`${label}: normal vision clears ${RED_GREEN_FLOOR}`, () => {
    expect(deltaE(a, b)).toBeGreaterThanOrEqual(RED_GREEN_FLOOR);
  });
  it(`${label}: deuteranopia clears ${RED_GREEN_FLOOR}`, () => {
    expect(deltaE(simulate(a, 'deutan'), simulate(b, 'deutan')))
      .toBeGreaterThanOrEqual(RED_GREEN_FLOOR);
  });
  it(`${label}: protanopia clears ${RED_GREEN_FLOOR}`, () => {
    expect(deltaE(simulate(a, 'protan'), simulate(b, 'protan')))
      .toBeGreaterThanOrEqual(RED_GREEN_FLOOR);
  });
  it(`${label}: tritanopia clears ${TRITAN_FLOOR}`, () => {
    expect(deltaE(simulate(a, 'tritan'), simulate(b, 'tritan')))
      .toBeGreaterThanOrEqual(TRITAN_FLOOR);
  });
}

describe('change.ts STYLE: every loss bucket stays distinct from every gain bucket', () => {
  for (const loss of LOSS_BUCKETS) {
    for (const gain of GAIN_BUCKETS) {
      assertClearsFloors(STYLE[loss].color, STYLE[gain].color, `${loss} vs ${gain}`);
    }
  }
});

describe('surface.ts RAMP: loss anchors stay distinct from gain anchors', () => {
  // RAMP's negative-side anchors are the losses, the positive-side the
  // gains; GONE_COLOR/NEW_COLOR are the categorical steps the ramp does not
  // interpolate through, so they are checked the same way explicitly. The
  // dead-band anchors (±0.138) sit on both sides of zero and share one
  // colour by design -- they carry no direction, so they are excluded here
  // rather than compared against themselves.
  const lossAnchors = [
    ...RAMP.filter(([stop, color]) => stop < 0 && color !== DEAD_BAND_COLOR).map(([, c]) => c),
    GONE_COLOR,
  ];
  const gainAnchors = [
    ...RAMP.filter(([stop, color]) => stop > 0 && color !== DEAD_BAND_COLOR).map(([, c]) => c),
    NEW_COLOR,
  ];

  for (const loss of lossAnchors) {
    for (const gain of gainAnchors) {
      assertClearsFloors(loss, gain, `${loss} vs ${gain}`);
    }
  }
});

describe('worstCaseDistance', () => {
  it('is the minimum over normal vision and all three deficiencies', () => {
    const a = STYLE.gone.color;
    const b = STYLE.doubled.color;
    const all = [
      deltaE(a, b),
      deltaE(simulate(a, 'protan'), simulate(b, 'protan')),
      deltaE(simulate(a, 'deutan'), simulate(b, 'deutan')),
      deltaE(simulate(a, 'tritan'), simulate(b, 'tritan')),
    ];
    expect(worstCaseDistance(a, b)).toBeCloseTo(Math.min(...all), 5);
  });
});

/**
 * The marks around the pin must not read as a bucket.
 *
 * When a reader clicks a location the map paints every stop inside the walk
 * radius, and those marks land ON the coloured dots. Drawn in the app's
 * "today" blue they were a worst-case ΔE 16.4 from the `new` bucket's blue and
 * 11.0 from `doubled` -- so selecting a location sprinkled what looked like
 * new-service dots across the map. Max reported exactly that reading on
 * 2026-09-09, and the mark moved to ink.
 *
 * The floor is lower than the ramp's own: these marks are a different kind of
 * thing from a bucket, they are labelled in their own key block, and they only
 * have to be TELLABLE from the dots underneath rather than orderable against
 * them.
 */
const PIN_MARK_FLOOR = 25;

// Every bucket the key lists. `none` -- no bus either way -- is left out for
// the same reason the legend never lists it: it is not an outcome of the plan,
// it is drawn at 2 px as a bare presence marker, and its near-black is
// unavoidably close to ink without ever being read as a finding.
const KEYED_BUCKETS = Object.keys(STYLE).filter((k) => k !== 'none');

describe('the pin marks stay out of the dot palette', () => {
  // Both marks are read by their FILL, which is what a dot is: ink where a
  // stop stands today, white where only the plan puts one there. The orange
  // is a ring around that fill rather than a disc of its own, because as a
  // disc it was ΔE 16.7 from "halved or worse" -- close enough to say the
  // plan cut service at a corner where it proposes a stop.
  for (const [name, ink] of [['stop today', NOW],
                             ['stop proposed', PROP_CORE]] as const) {
    for (const key of KEYED_BUCKETS) {
      it(`"${name}" is tellable from ${key}`, () => {
        expect(worstCaseDistance(ink, STYLE[key].color))
          .toBeGreaterThanOrEqual(PIN_MARK_FLOOR);
      });
    }
  }
});
