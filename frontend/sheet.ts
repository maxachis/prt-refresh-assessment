/**
 * The answer panel as a bottom sheet, for phones.
 *
 * On a desktop the panel is a column beside the map and the two never compete:
 * both are full height, and reading one costs nothing of the other. On a phone
 * they were sharing one short window — 58% map, 42% panel — and the split made
 * both useless at once. The map was too small to find a neighbourhood in, and
 * of the 354 px the panel had, the masthead took 138 and the measurement line
 * another 38, so a place's answer got under 180 px.
 *
 * A sheet is the way out because it lets one side give way to the other on
 * demand instead of dividing the window permanently. Three stops:
 *
 *   peek  — the measurement line, the place name and the before/after figures,
 *           over a nearly whole map. This is the state for finding somewhere.
 *           The masthead is hidden at this stop rather than the numbers being
 *           pushed off the bottom by it: a reader peeking at an answer needs
 *           the site's title least of anything that could be on that strip.
 *   half  — the answer, with enough map above it to see where the answer is
 *           about. This is where a click lands the reader.
 *   full  — the answer and its detail, with a sliver of map left showing so
 *           the sheet still reads as something covering a map rather than as
 *           a page that has replaced it.
 *
 * The stops are reachable two ways deliberately. Dragging is what a reader who
 * knows sheets will try first; tapping the handle is what everyone else will
 * try, so it climbs a stop at a time and wraps back to the peek rather than
 * stalling at the top with no way down but a gesture.
 *
 * The geometry is kept here as pure functions so it can be tested without a
 * DOM, in the same way the legend's counting and the state line are.
 *
 * One thing this buys beyond the space: on a phone the map is now always the
 * full window, so moving the sheet needs no `map.resize()`. The old collapse
 * changed the map's container size, and a MapLibre canvas that has been
 * resized behind the map's back puts clicks on the wrong coordinates — which
 * on this map means the wrong answer, not merely the wrong pixel.
 */
import { $ } from './utils';

export type Snap = 'peek' | 'half' | 'full';

/** Low to high. Order is load-bearing: the tap cycle and flicks walk it. */
export const SNAPS: Snap[] = ['peek', 'half', 'full'];

/**
 * The peek height, in pixels rather than as a fraction of the window.
 *
 * It is sized to what has to stay legible — the state line, the place name and
 * the before/after headline — and those are a fixed number of pixels tall. As
 * a fraction it would show three lines on a tall phone and one on a short one.
 */
export const PEEK_PX = 192;

/** …except where a fifth of a tall phone is a third of a short one. */
const PEEK_MAX_FRACTION = 0.3;

const HALF_FRACTION = 0.55;

/** Not 1: a sheet that reaches the top edge stops reading as a sheet. */
const FULL_FRACTION = 0.9;

/**
 * Above this, a drag is read as a flick — a statement of direction rather than
 * of where the finger happened to leave the glass. Pixels per millisecond.
 */
const FLICK_PX_PER_MS = 0.6;

/** How much of the window the map will give up to keep a clicked point clear. */
const MAX_PADDING_FRACTION = 0.45;

export function snapHeight(snap: Snap, viewportH: number): number {
  if (snap === 'peek') return Math.min(PEEK_PX, viewportH * PEEK_MAX_FRACTION);
  if (snap === 'half') return viewportH * HALF_FRACTION;
  return viewportH * FULL_FRACTION;
}

/**
 * Where a drag that ended at `height` should settle.
 *
 * `velocity` is signed the way the sheet grows: positive is a flick upward,
 * opening it. A slow release takes the nearest stop; a flick takes the next
 * stop along in the direction it was thrown, so throwing the sheet open from
 * the peek works even though the finger left the glass a long way short of
 * the half stop.
 */
export function nearestSnap(height: number, viewportH: number, velocity = 0): Snap {
  const distances = SNAPS.map((s) => Math.abs(snapHeight(s, viewportH) - height));
  let i = distances.indexOf(Math.min(...distances));
  if (Math.abs(velocity) > FLICK_PX_PER_MS) {
    i = Math.max(0, Math.min(SNAPS.length - 1, i + (velocity > 0 ? 1 : -1)));
  }
  return SNAPS[i];
}

/** The next stop up, wrapping back to the peek from the top. */
export function snapAfterTap(current: Snap): Snap {
  return SNAPS[(SNAPS.indexOf(current) + 1) % SNAPS.length];
}

/**
 * How much bottom padding the map should hold while the sheet is this tall.
 *
 * MapLibre centres and fits inside its padding, so this is what keeps the
 * point a reader just clicked in the strip of map the sheet is not covering.
 * It matches the sheet exactly until the sheet owns most of the window, at
 * which point matching it would drive the point into the last few pixels of
 * visible map — worse than letting the sheet overlap it a little.
 */
export function mapBottomPadding(height: number, viewportH: number): number {
  return Math.min(height, viewportH * MAX_PADDING_FRACTION);
}

/* ------------------------------------------------------------------ */
/* Wiring. Everything above is geometry; everything below touches the DOM. */

/**
 * Whether the phone layout is the one in force.
 *
 * The breakpoint is declared once, in the stylesheet, and read back from here
 * through a custom property. Two copies of a media query — one in CSS, one in
 * a `matchMedia` string — drift the first time either is tuned, and the way
 * they fail is that the sheet's geometry and the sheet's appearance disagree
 * about whether there is a sheet at all.
 */
export function isCompact(): boolean {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--compact').trim() === '1';
}

/** A drag shorter than this in space and time was a tap on the handle. */
const TAP_SLOP_PX = 8;
const TAP_MS = 400;

export interface Sheet {
  /** Move to a stop, unless the reader is already at or above it. */
  atLeast(snap: Snap): void;
  /** Which stop is showing. 'full' on a desktop, where there is no sheet. */
  at(): Snap;
}

export interface SheetHooks {
  /**
   * Where the sheet's top edge now is.
   *
   * Both numbers, because they are not the same thing and two different
   * things need them: the padding is capped so a nearly-full sheet does not
   * drive a clicked point off the top of the map, while anything being kept
   * CLEAR of the sheet -- the key, the tile attribution -- needs the edge
   * itself. Handed as numbers rather than as the map, so this module stays
   * testable and knows nothing about MapLibre.
   */
  onMove(height: number, bottomPadding: number): void;
  /**
   * Called once at startup and thereafter only when the layout actually
   * flips, so that entering the phone layout can be acted on rather than
   * merely being true. A rotation is the case that matters: it arrives as an
   * ordinary resize, and anything sized for a wide window -- the key above
   * all, at 250x314 over a 390 px map -- is still sized for one afterwards.
   */
  onLayoutChange(compact: boolean): void;
}

/** Wire the drag handle, and keep the rest of the app told where it is. */
export function initSheet(hooks: SheetHooks): Sheet {
  const side = $('side');
  const handle = $('sheet-handle');
  let snap: Snap = 'peek';

  // Live drag state. `frame` is the last sample, kept for the release
  // velocity: the whole gesture's average would read a flick that began with
  // a hesitation as a slow drag.
  let dragging = false;
  let startY = 0, startH = 0, startT = 0;
  let frame = { y: 0, t: 0 };

  function viewportH() { return window.innerHeight; }

  function setHeight(px: number) {
    side.style.height = `${px}px`;
    hooks.onMove(px, mapBottomPadding(px, viewportH()));
  }

  function settle(next: Snap) {
    snap = next;
    side.dataset.snap = next;
    setHeight(snapHeight(next, viewportH()));
  }

  handle.addEventListener('pointerdown', (e: PointerEvent) => {
    if (!isCompact()) return;
    dragging = true;
    startY = e.clientY;
    startH = side.getBoundingClientRect().height;
    startT = e.timeStamp;
    frame = { y: e.clientY, t: e.timeStamp };
    side.classList.add('dragging');
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener('pointermove', (e: PointerEvent) => {
    if (!dragging) return;
    // A drag upward is a smaller clientY and a taller sheet, hence the sign.
    const wanted = startH + (startY - e.clientY);
    const lo = snapHeight('peek', viewportH());
    const hi = snapHeight('full', viewportH());
    setHeight(Math.max(lo, Math.min(hi, wanted)));
    frame = { y: e.clientY, t: e.timeStamp };
  });

  function release(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    side.classList.remove('dragging');

    const movedFar = Math.abs(e.clientY - startY) > TAP_SLOP_PX;
    if (!movedFar && e.timeStamp - startT < TAP_MS) {
      settle(snapAfterTap(snap));
      return;
    }
    const dt = e.timeStamp - frame.t;
    const velocity = dt > 0 ? (frame.y - e.clientY) / dt : 0;
    settle(nearestSnap(side.getBoundingClientRect().height, viewportH(), velocity));
  }

  handle.addEventListener('pointerup', release);
  handle.addEventListener('pointercancel', release);

  // The handle is a button, so it answers the keyboard too — the tap cycle is
  // the only way to every stop that does not need a pointer at all.
  handle.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (isCompact()) settle(snapAfterTap(snap));
  });

  /**
   * Leaving the phone layout has to give the inline height back.
   *
   * A sheet height left on the element becomes a fixed-height sidebar when the
   * window widens into the two-column layout, and the panel then scrolls
   * inside a column that has stopped being full height.
   */
  let wasCompact: boolean | null = null;
  function reflow() {
    const compact = isCompact();
    if (compact !== wasCompact) {
      wasCompact = compact;
      hooks.onLayoutChange(compact);
    }
    if (!compact) {
      side.style.height = '';
      side.removeAttribute('data-snap');
      hooks.onMove(0, 0);
      return;
    }
    settle(snap);
  }
  window.addEventListener('resize', reflow);
  reflow();

  return {
    at: () => (isCompact() ? snap : 'full'),
    atLeast(next: Snap) {
      if (!isCompact()) return;
      if (SNAPS.indexOf(next) > SNAPS.indexOf(snap)) settle(next);
    },
  };
}
